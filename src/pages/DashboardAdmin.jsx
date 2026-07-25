import { useEffect, useState } from "react";
import api from "../api/axios";
import "../admin-dashboard.css";

const STATUT_CONFIG = {
  en_attente: { label: "En attente", badge: "badge-warning", icon: "bi-hourglass-split" },
  confirme: { label: "Confirmé", badge: "badge-success", icon: "bi-check-circle" },
  annule: { label: "Annulé", badge: "badge-danger", icon: "bi-x-circle" },
  termine: { label: "Terminé", badge: "badge-neutral", icon: "bi-flag" },
};

export default function DashboardAdmin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [prosEnAttente, setProsEnAttente] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [ongletActif, setOngletActif] = useState("apercu");

  function charger() {
    api.get("/admin/stats").then((res) => setStats(res.data)).catch(() => setErreur("Accès refusé."));
    api.get("/admin/users").then((res) => setUsers(res.data.data ?? res.data));
    api.get("/admin/pros-en-attente").then((res) => setProsEnAttente(res.data));
  }

  useEffect(() => {
    charger();
  }, []);

  async function changerRole(userId, nouveauRole) {
    await api.patch(`/admin/users/${userId}/role`, { role: nouveauRole });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: nouveauRole } : u)));
  }

  async function validerPro(userId) {
    await api.patch(`/admin/pros/${userId}/valider`);
    charger();
  }

  if (erreur) {
    return (
      <div className="container">
        <div className="admin-error">
          <i className="bi bi-shield-exclamation"></i>
          <p>{erreur}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container admin-loading">
        <i className="bi bi-arrow-repeat spin"></i>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  const onglets = [
    { id: "apercu", label: "Aperçu", icon: "bi-speedometer2" },
    { id: "pros", label: "Comptes pro", icon: "bi-person-badge", badge: stats.utilisateurs.pros_en_attente },
    { id: "utilisateurs", label: "Utilisateurs", icon: "bi-people" },
    { id: "medicaments", label: "Médicaments", icon: "bi-capsule" },
    { id: "rendezvous", label: "Rendez-vous", icon: "bi-calendar-check" },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-title">
          <i className="bi bi-grid-1x2-fill"></i>
          <div>
            <h2>Tableau de bord</h2>
            <p>Vue d'ensemble de la plateforme SantéProx</p>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        {onglets.map((o) => (
          <button
            key={o.id}
            className={`admin-tab ${ongletActif === o.id ? "active" : ""}`}
            onClick={() => setOngletActif(o.id)}
          >
            <i className={`bi ${o.icon}`}></i>
            <span>{o.label}</span>
            {o.badge > 0 && <span className="admin-tab-badge">{o.badge}</span>}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {ongletActif === "apercu" && <Apercu stats={stats} />}
        {ongletActif === "pros" && (
          <ComptesProEnAttente prosEnAttente={prosEnAttente} onValider={validerPro} />
        )}
        {ongletActif === "utilisateurs" && (
          <GestionUtilisateurs users={users} onChangerRole={changerRole} />
        )}
        {ongletActif === "medicaments" && <GestionMedicaments />}
        {ongletActif === "rendezvous" && <TousLesRendezVous />}
      </div>
    </div>
  );
}

// ==================== Aperçu / Statistiques ====================
function Apercu({ stats }) {
  const cards = [
    {
      icon: "bi-people-fill", label: "Utilisateurs", value: stats.utilisateurs.total,
      detail: `${stats.utilisateurs.clients} clients · ${stats.utilisateurs.pros} pros · ${stats.utilisateurs.admins} admins`,
      color: "card-blue",
    },
    {
      icon: "bi-hourglass-split", label: "Pros en attente", value: stats.utilisateurs.pros_en_attente,
      detail: "Comptes à valider", color: "card-amber",
    },
    {
      icon: "bi-shop", label: "Pharmacies", value: stats.pharmacies.total,
      detail: `${stats.pharmacies.de_garde} de garde actuellement`, color: "card-green",
    },
    {
      icon: "bi-hospital", label: "Centres de santé", value: stats.centres_sante.total,
      detail: "Hôpitaux, cliniques, cabinets", color: "card-purple",
    },
    {
      icon: "bi-capsule", label: "Médicaments", value: stats.medicaments.total,
      detail: "Référencés au catalogue", color: "card-teal",
    },
    {
      icon: "bi-calendar-check", label: "Rendez-vous", value: stats.rendez_vous.total,
      detail: `${stats.rendez_vous.en_attente} en attente · ${stats.rendez_vous.confirme} confirmés`,
      color: "card-rose",
    },
  ];

  return (
    <div className="stats-grid-pro">
      {cards.map((c) => (
        <div key={c.label} className={`stat-card-pro ${c.color}`}>
          <div className="stat-card-pro-icon"><i className={`bi ${c.icon}`}></i></div>
          <div className="stat-card-pro-body">
            <p className="stat-card-pro-label">{c.label}</p>
            <p className="stat-card-pro-value">{c.value}</p>
            <p className="stat-card-pro-detail">{c.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== Comptes pro en attente ====================
function ComptesProEnAttente({ prosEnAttente, onValider }) {
  if (prosEnAttente.length === 0) {
    return (
      <div className="admin-empty">
        <i className="bi bi-check2-all"></i>
        <p>Aucun compte professionnel en attente de validation.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {prosEnAttente.map((u) => (
            <tr key={u.id}>
              <td>
                <div className="admin-user-cell">
                  <i className="bi bi-person-badge"></i>
                  <span>{u.nom} {u.prenom}</span>
                </div>
              </td>
              <td>{u.email}</td>
              <td>{u.telephone || "—"}</td>
              <td className="text-right">
                <button className="btn-pro btn-pro-success" onClick={() => onValider(u.id)}>
                  <i className="bi bi-check-lg"></i> Valider
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== Gestion des utilisateurs ====================
function GestionUtilisateurs({ users, onChangerRole }) {
  const ROLE_CONFIG = {
    client: { label: "Client", icon: "bi-person", badge: "badge-neutral" },
    pro: { label: "Pro", icon: "bi-person-badge", badge: "badge-blue" },
    admin: { label: "Admin", icon: "bi-shield-lock", badge: "badge-purple" },
  };

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Email</th>
            <th>Rôle</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const r = ROLE_CONFIG[u.role];
            return (
              <tr key={u.id}>
                <td>
                  <div className="admin-user-cell">
                    <i className="bi bi-person-circle"></i>
                    <span>{u.nom} {u.prenom}</span>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${r.badge}`}>
                    <i className={`bi ${r.icon}`}></i> {r.label}
                    {u.role === "pro" && (
                      <i className={`bi ${u.valide ? "bi-patch-check-fill" : "bi-clock-history"} ms-1`} title={u.valide ? "Validé" : "Non validé"}></i>
                    )}
                  </span>
                </td>
                <td className="text-right">
                  <div className="admin-actions-row">
                    {u.role !== "client" && (
                      <button className="btn-pro btn-pro-ghost" onClick={() => onChangerRole(u.id, "client")}>
                        <i className="bi bi-person"></i> Client
                      </button>
                    )}
                    {u.role !== "pro" && (
                      <button className="btn-pro btn-pro-ghost" onClick={() => onChangerRole(u.id, "pro")}>
                        <i className="bi bi-person-badge"></i> Pro
                      </button>
                    )}
                    {u.role !== "admin" && (
                      <button className="btn-pro btn-pro-ghost" onClick={() => onChangerRole(u.id, "admin")}>
                        <i className="bi bi-shield-lock"></i> Admin
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ==================== Catalogue des médicaments ====================
function GestionMedicaments() {
  const [medicaments, setMedicaments] = useState([]);
  const [form, setForm] = useState({ nom: "", dci: "", forme: "", dosage: "", categorie: "" });
  const [message, setMessage] = useState(null);

  function charger() {
    api.get("/medicaments").then((res) => setMedicaments(res.data.data ?? res.data));
  }

  useEffect(() => {
    charger();
  }, []);

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function ajouter(e) {
    e.preventDefault();
    await api.post("/admin/medicaments", form);
    setMessage("Médicament ajouté au catalogue.");
    setForm({ nom: "", dci: "", forme: "", dosage: "", categorie: "" });
    charger();
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="admin-grid-split">
      <div className="admin-card">
        <h3 className="admin-card-title"><i className="bi bi-plus-circle"></i> Ajouter un médicament</h3>
        <form className="form-vertical" onSubmit={ajouter}>
          <label>Nom<input value={form.nom} onChange={set("nom")} required /></label>
          <label>DCI (optionnel)<input value={form.dci} onChange={set("dci")} /></label>
          <label>Forme (ex: Comprimé)<input value={form.forme} onChange={set("forme")} /></label>
          <label>Dosage (ex: 500mg)<input value={form.dosage} onChange={set("dosage")} /></label>
          <label>Catégorie (ex: Antalgique)<input value={form.categorie} onChange={set("categorie")} /></label>
          <button type="submit" className="btn-pro btn-pro-primary">
            <i className="bi bi-plus-lg"></i> Ajouter au catalogue
          </button>
        </form>
        {message && (
          <p className="admin-success-msg"><i className="bi bi-check-circle"></i> {message}</p>
        )}
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title"><i className="bi bi-capsule"></i> Catalogue ({medicaments.length})</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Dosage</th>
                <th>Catégorie</th>
              </tr>
            </thead>
            <tbody>
              {medicaments.map((m) => (
                <tr key={m.id}>
                  <td>{m.nom}</td>
                  <td>{m.dosage}</td>
                  <td><span className="badge badge-neutral">{m.categorie}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== Tous les rendez-vous ====================
function TousLesRendezVous() {
  const [rdvs, setRdvs] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState("");

  function charger(statut = "") {
    api.get("/admin/rendez-vous", { params: statut ? { statut } : {} })
      .then((res) => setRdvs(res.data.data ?? res.data));
  }

  useEffect(() => {
    charger();
  }, []);

  function appliquerFiltre(e) {
    const val = e.target.value;
    setFiltreStatut(val);
    charger(val);
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title"><i className="bi bi-calendar-check"></i> Tous les rendez-vous</h3>
        <select className="admin-select" value={filtreStatut} onChange={appliquerFiltre}>
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="confirme">Confirmé</option>
          <option value="annule">Annulé</option>
          <option value="termine">Terminé</option>
        </select>
      </div>

      {rdvs.length === 0 ? (
        <div className="admin-empty">
          <i className="bi bi-calendar-x"></i>
          <p>Aucun rendez-vous trouvé.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Centre</th>
                <th>Médecin</th>
                <th>Date / Heure</th>
                <th>Motif</th>
                <th>Statut</th>
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
                    <td>{r.centre_sante?.nom}</td>
                    <td>{r.medecin ? r.medecin.nom : "—"}</td>
                    <td>{r.date_rdv?.substring(0, 10)} à {r.heure_rdv}</td>
                    <td>{r.motif || "—"}</td>
                    <td>
                      <span className={`badge ${s.badge}`}>
                        <i className={`bi ${s.icon}`}></i> {s.label}
                      </span>
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