import { useEffect, useState } from "react";
import api from "../api/axios";

const STATUT_LABEL = {
  en_attente: "⏳ En attente",
  confirme: "✅ Confirmé",
  annule: "❌ Annulé",
  termine: "🏁 Terminé",
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

  if (chargement) return <div className="container"><p>Chargement...</p></div>;

  if (!pharmacie && !centreSante) {
    return (
      <div className="container">
        <h2>Espace pro</h2>
        <p>Vous n'avez pas encore de pharmacie enregistrée. Créez-en une ci-dessous :</p>
        <CreerPharmacie onCree={chargerProfil} />
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Espace pro</h2>
      {pharmacie && <DashboardPharmacie pharmacie={pharmacie} setPharmacie={setPharmacie} />}
      {centreSante && <DashboardCentreSante centreSante={centreSante} />}
    </div>
  );
}

// -------------------- Formulaire de création de pharmacie --------------------
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
    <section className="pro-section">
      <h3>Créer ma pharmacie</h3>
      <form className="form-vertical" onSubmit={creer}>
        <label>Nom de la pharmacie<input value={form.nom} onChange={set("nom")} required /></label>
        <label>Adresse<input value={form.adresse} onChange={set("adresse")} required /></label>
        <label>Ville<input value={form.ville} onChange={set("ville")} required /></label>
        <label>Commune<input value={form.commune} onChange={set("commune")} required /></label>
        <label>Téléphone<input value={form.telephone} onChange={set("telephone")} /></label>
        <button type="submit">Créer ma pharmacie</button>
      </form>
      {erreur && <p className="message-error">{erreur}</p>}
    </section>
  );
}

// -------------------- Dashboard Pharmacie --------------------
function DashboardPharmacie({ pharmacie, setPharmacie }) {
  const [medicaments, setMedicaments] = useState([]);
  const [stock, setStock] = useState([]);
  const [medicamentId, setMedicamentId] = useState("");
  const [quantite, setQuantite] = useState(0);
  const [prix, setPrix] = useState("");
  const [message, setMessage] = useState(null);

  function chargerStock() {
    api.get(`/pharmacies/${pharmacie.id}`).then((res) => setStock(res.data.medicaments ?? []));
  }

  useEffect(() => {
    api.get("/medicaments").then((res) => setMedicaments(res.data.data ?? res.data));
    chargerStock();
  }, []);

  async function toggleGarde() {
    const res = await api.patch(`/pharmacies/${pharmacie.id}/garde`, {
      de_garde: !pharmacie.de_garde,
      garde_debut: new Date().toISOString(),
    });
    setPharmacie(res.data);
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
  }

  return (
    <>
      <section className="pro-section">
        <h3>🏥 {pharmacie.nom}</h3>
        <p>Statut actuel : {pharmacie.de_garde ? "🟢 De garde" : "⚪ Non de garde"}</p>
        <button onClick={toggleGarde}>
          {pharmacie.de_garde ? "Désactiver la garde" : "Activer la garde"}
        </button>
      </section>

      <section className="pro-section">
        <h3>Ajouter / mettre à jour un stock</h3>
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
          <button type="submit">Mettre à jour</button>
        </form>
        {message && <p className="message-success">{message.text}</p>}
      </section>

      <section className="pro-section">
        <h3>Stock actuel</h3>
        {stock.length === 0 && <p>Aucun médicament enregistré pour le moment.</p>}
        <ul className="result-list">
          {stock.map((m) => (
            <li key={m.id} className="result-item">
              <strong>{m.nom}</strong> ({m.dosage})
              <p>Quantité : {m.pivot.quantite} {m.pivot.disponible ? "✅ Disponible" : "❌ Rupture"}</p>
              {m.pivot.prix && <p>Prix : {m.pivot.prix} FCFA</p>}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

// -------------------- Dashboard Centre de santé --------------------
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
    <section className="pro-section">
      <h3>🩺 {centreSante.nom} — Rendez-vous reçus</h3>
      {rdvs.length === 0 && <p>Aucun rendez-vous reçu pour le moment.</p>}
      <ul className="result-list">
        {rdvs.map((r) => (
          <li key={r.id} className="result-item">
            <strong>{r.user?.nom} {r.user?.prenom}</strong>
            <p>{r.date_rdv?.substring(0, 10)} à {r.heure_rdv}</p>
            {r.motif && <p>Motif : {r.motif}</p>}
            <p>{STATUT_LABEL[r.statut]}</p>
            {r.statut === "en_attente" && (
              <div className="role-actions">
                <button onClick={() => changerStatut(r.id, "confirme")}>Confirmer</button>
                <button onClick={() => changerStatut(r.id, "annule")}>Refuser</button>
              </div>
            )}
            {r.statut === "confirme" && (
              <button onClick={() => changerStatut(r.id, "termine")}>Marquer comme terminé</button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}