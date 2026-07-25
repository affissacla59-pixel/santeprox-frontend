import { useEffect, useState } from "react";
import api from "../api/axios";
import "../admin-dashboard.css";

const STATUT_CONFIG = {
  en_attente: { label: "En attente", badge: "badge-warning", icon: "bi-hourglass-split" },
  confirme: { label: "Confirmé", badge: "badge-success", icon: "bi-check-circle" },
  annule: { label: "Annulé", badge: "badge-danger", icon: "bi-x-circle" },
  termine: { label: "Terminé", badge: "badge-neutral", icon: "bi-flag" },
};

export default function EspacePro() {
  const [pharmacie, setPharmacie] = useState(null);
  const [centreSante, setCentreSante] = useState(null);
  const [chargement, setChargement] = useState(true);

  function chargerProfil() {
    api.get("/auth/me").then((res) => {
      setPharmacie(res.data.pharmacie);
      setCentreSante(res.data.centre_sante);
      setChargement(false);
    });
  }

  useEffect(() => {
    chargerProfil();
  }, []);

  if (chargement) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <i className="bi bi-arrow-repeat spin"></i>
          <p>Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-title">
          <i className="bi bi-briefcase-fill"></i>
          <div>
            <h2>Espace pro</h2>
            <p>Gérez votre activité sur SantéProx</p>
          </div>
        </div>
      </div>

      {!pharmacie && !centreSante && (
        <>
          <div className="admin-empty pro-empty-state">
            <i className="bi bi-shop"></i>
            <h3>Aucune pharmacie enregistrée</h3>
            <p>Créez votre fiche pharmacie pour gérer votre stock et votre statut de garde.</p>
          </div>
          <CreerPharmacie onCree={chargerProfil} />
        </>
      )}

      {pharmacie && <DashboardPharmacie pharmacie={pharmacie} setPharmacie={setPharmacie} />}
      {centreSante && <DashboardCentreSante centreSante={centreSante} />}
    </div>
  );
}

// ==================== Création de pharmacie ====================
function CreerPharmacie({ onCree }) {
  const [form, setForm] = useState({ nom: "", adresse: "", ville: "", commune: "", telephone: "" });
  const [erreur, setErreur] = useState(null);

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function creer(e) {
    e.preventDefault();
    setErreur(null);
    try {
      await api.post("/pharmacies", form);
      onCree();
    } catch (err) {
      setErreur(
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(" ") : "Erreur lors de la création.")
      );
    }
  }

  return (
    <div className="admin-card">
      <h3 className="admin-card-title"><i className="bi bi-plus-circle"></i> Créer ma pharmacie</h3>
      <form className="form-vertical" onSubmit={creer}>
        <label>Nom de la pharmacie<input value={form.nom} onChange={set("nom")} required /></label>
        <label>Adresse<input value={form.adresse} onChange={set("adresse")} required /></label>
        <label>Ville<input value={form.ville} onChange={set("ville")} required /></label>
        <label>Commune<input value={form.commune} onChange={set("commune")} required /></label>
        <label>Téléphone<input value={form.telephone} onChange={set("telephone")} /></label>
        <button type="submit" className="btn-pro btn-pro-primary">
          <i className="bi bi-check2-circle"></i> Créer ma pharmacie
        </button>
      </form>
      {erreur && (
        <p className="message-error"><i className="bi bi-exclamation-triangle"></i> {erreur}</p>
      )}
    </div>
  );
}

// ==================== Dashboard Pharmacie ====================
function DashboardPharmacie({ pharmacie, setPharmacie }) {
  const [medicaments, setMedicaments] = useState([]);
  const [stock, setStock] = useState([]);
  const [medicamentId, setMedicamentId] = useState("");
  const [quantite, setQuantite] = useState(0);
  const [prix, setPrix] = useState("");
  const [message, setMessage] = useState(null);
  const [gardeEnCours, setGardeEnCours] = useState(false);
  const [erreurGarde, setErreurGarde] = useState(null);

  function chargerStock() {
    api.get(`/pharmacies/${pharmacie.id}`).then((res) => setStock(res.data.medicaments ?? []));
  }

  useEffect(() => {
    api.get("/medicaments").then((res) => setMedicaments(res.data.data ?? res.data));
    chargerStock();
  }, []);

  async function toggleGarde() {
    setErreurGarde(null);
    setGardeEnCours(true);
    try {
      const res = await api.patch(`/pharmacies/${pharmacie.id}/garde`, {
        de_garde: !pharmacie.de_garde,
      });
      setPharmacie(res.data);
    } catch (err) {
      setErreurGarde(
        err.response?.data?.message ||
        (err.response?.status === 403
          ? "Votre compte pro n'est pas encore validé, ou vous n'êtes pas propriétaire de cette pharmacie."
          : err.response?.status === 401
          ? "Session expirée, merci de vous reconnecter."
          : "Impossible de modifier le statut de garde pour le moment.")
      );
    } finally {
      setGardeEnCours(false);
    }
  }

  async function majStock(e) {
    e.preventDefault();
    await api.post(`/pharmacies/${pharmacie.id}/stock`, {
      medicament_id: medicamentId,
      quantite: Number(quantite),
      prix: prix ? Number(prix) : null,
    });
    setMessage({ type: "success", text: "Stock mis à jour avec succès." });
    setMedicamentId("");
    setQuantite(0);
    setPrix("");
    chargerStock();
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <>
      <div className="admin-card pro-pharmacy-card">
        <div className="pro-pharmacy-info">
          <div className="pro-pharmacy-icon"><i className="bi bi-shop"></i></div>
          <div>
            <h3>{pharmacie.nom}</h3>
            <span className={`badge ${pharmacie.de_garde ? "badge-success" : "badge-neutral"}`}>
              <i className={`bi ${pharmacie.de_garde ? "bi-record-circle-fill" : "bi-record-circle"}`}></i>
              {pharmacie.de_garde ? "De garde" : "Non de garde"}
            </span>
          </div>
        </div>
        <button className="btn-pro btn-pro-primary" onClick={toggleGarde} disabled={gardeEnCours}>
          <i className={`bi ${gardeEnCours ? "bi-arrow-repeat spin" : pharmacie.de_garde ? "bi-toggle-on" : "bi-toggle-off"}`}></i>
          {gardeEnCours ? "Mise à jour..." : pharmacie.de_garde ? "Désactiver la garde" : "Activer la garde"}
        </button>
      </div>
      {erreurGarde && (
        <p className="message-error"><i className="bi bi-exclamation-triangle"></i> {erreurGarde}</p>
      )}

      <div className="admin-card">
        <h3 className="admin-card-title"><i className="bi bi-box-seam"></i> Ajouter / mettre à jour un stock</h3>
        <form className="form-vertical" onSubmit={majStock}>
          <label>
            Médicament
            <select value={medicamentId} onChange={(e) => setMedicamentId(e.target.value)} required>
              <option value="">-- Choisir --</option>
              {medicaments.map((m) => (
                <option key={m.id} value={m.id}>{m.nom} ({m.dosage})</option>
              ))}
            </select>
          </label>
          <label>
            Quantité en stock
            <input type="number" min="0" value={quantite} onChange={(e) => setQuantite(e.target.value)} required />
          </label>
          <label>
            Prix (optionnel)
            <input type="number" min="0" value={prix} onChange={(e) => setPrix(e.target.value)} />
          </label>
          <button type="submit" className="btn-pro btn-pro-primary">
            <i className="bi bi-arrow-repeat"></i> Mettre à jour
          </button>
        </form>
        {message && (
          <p className="message-success"><i className="bi bi-check-circle"></i> {message.text}</p>
        )}
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title"><i className="bi bi-capsule"></i> Stock actuel</h3>
        {stock.length === 0 ? (
          <div className="admin-empty">
            <i className="bi bi-inbox"></i>
            <p>Aucun médicament enregistré pour le moment.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Médicament</th>
                  <th>Dosage</th>
                  <th>Quantité</th>
                  <th>Statut</th>
                  <th>Prix</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.nom}</strong></td>
                    <td>{m.dosage}</td>
                    <td>{m.pivot.quantite}</td>
                    <td>
                      <span className={`badge ${m.pivot.disponible ? "badge-success" : "badge-danger"}`}>
                        <i className={`bi ${m.pivot.disponible ? "bi-check-circle" : "bi-x-circle"}`}></i>
                        {m.pivot.disponible ? "Disponible" : "Rupture"}
                      </span>
                    </td>
                    <td>{m.pivot.prix ? `${m.pivot.prix} FCFA` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ==================== Dashboard Centre de santé ====================
function DashboardCentreSante({ centreSante }) {
  const [rdvs, setRdvs] = useState([]);

  function chargerRdv() {
    api.get("/rendez-vous").then((res) => setRdvs(res.data));
  }

  useEffect(() => {
    chargerRdv();
  }, []);

  async function changerStatut(id, statut) {
    await api.patch(`/rendez-vous/${id}/statut`, { statut });
    chargerRdv();
  }

  return (
    <div className="admin-card">
      <h3 className="admin-card-title"><i className="bi bi-heart-pulse"></i> {centreSante.nom} — Rendez-vous reçus</h3>
      {rdvs.length === 0 ? (
        <div className="admin-empty">
          <i className="bi bi-calendar-x"></i>
          <p>Aucun rendez-vous reçu pour le moment.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date / Heure</th>
                <th>Motif</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rdvs.map((r) => {
                const s = STATUT_CONFIG[r.statut];
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="admin-user-cell">
                        <i className="bi bi-person-circle"></i>
                        <span>{r.user?.nom} {r.user?.prenom}</span>
                      </div>
                    </td>
                    <td>{r.date_rdv?.substring(0, 10)} à {r.heure_rdv}</td>
                    <td>{r.motif || "—"}</td>
                    <td>
                      <span className={`badge ${s.badge}`}>
                        <i className={`bi ${s.icon}`}></i> {s.label}
                      </span>
                    </td>
                    <td className="text-right">
                      {r.statut === "en_attente" && (
                        <div className="admin-actions-row">
                          <button className="btn-pro btn-pro-success" onClick={() => changerStatut(r.id, "confirme")}>
                            <i className="bi bi-check-lg"></i> Confirmer
                          </button>
                          <button className="btn-pro btn-pro-danger" onClick={() => changerStatut(r.id, "annule")}>
                            <i className="bi bi-x-lg"></i> Refuser
                          </button>
                        </div>
                      )}
                      {r.statut === "confirme" && (
                        <button className="btn-pro btn-pro-ghost" onClick={() => changerStatut(r.id, "termine")}>
                          <i className="bi bi-flag"></i> Marquer comme terminé
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
