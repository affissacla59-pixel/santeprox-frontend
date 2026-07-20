import { useEffect, useState } from "react";
import api from "../api/axios";

export default function DashboardAdmin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [prosEnAttente, setProsEnAttente] = useState([]);
  const [erreur, setErreur] = useState(null);

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
        <h2>Dashboard Admin</h2>
        <p className="message-error">{erreur}</p>
      </div>
    );
  }

  if (!stats) return <div className="container"><p>Chargement...</p></div>;

  return (
    <div className="container">
      <h2>Dashboard Admin</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Utilisateurs</h4>
          <p className="stat-number">{stats.utilisateurs.total}</p>
          <p>{stats.utilisateurs.clients} clients · {stats.utilisateurs.pros} pros · {stats.utilisateurs.admins} admins</p>
        </div>
        <div className="stat-card">
          <h4>Pros en attente</h4>
          <p className="stat-number">{stats.utilisateurs.pros_en_attente}</p>
        </div>
        <div className="stat-card">
          <h4>Pharmacies</h4>
          <p className="stat-number">{stats.pharmacies.total}</p>
          <p>{stats.pharmacies.de_garde} de garde actuellement</p>
        </div>
        <div className="stat-card">
          <h4>Centres de santé</h4>
          <p className="stat-number">{stats.centres_sante.total}</p>
        </div>
        <div className="stat-card">
          <h4>Rendez-vous</h4>
          <p className="stat-number">{stats.rendez_vous.total}</p>
          <p>⏳ {stats.rendez_vous.en_attente} · ✅ {stats.rendez_vous.confirme} · ❌ {stats.rendez_vous.annule}</p>
        </div>
      </div>

      {prosEnAttente.length > 0 && (
        <>
          <h3>⏳ Comptes pro en attente de validation</h3>
          <ul className="result-list">
            {prosEnAttente.map((u) => (
              <li key={u.id} className="result-item">
                <strong>{u.nom} {u.prenom}</strong> — {u.email}
                <p>Téléphone : {u.telephone || "non renseigné"}</p>
                <button onClick={() => validerPro(u.id)}>✅ Valider ce compte pro</button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3>Gestion des utilisateurs</h3>
      <ul className="result-list">
        {users.map((u) => (
          <li key={u.id} className="result-item">
            <strong>{u.nom} {u.prenom}</strong> — {u.email}
            <p>
              Rôle actuel : <strong>{u.role}</strong>
              {u.role === "pro" && (u.valide ? " ✅ validé" : " ⏳ non validé")}
            </p>
            <div className="role-actions">
              {u.role !== "client" && <button onClick={() => changerRole(u.id, "client")}>Passer en client</button>}
              {u.role !== "pro" && <button onClick={() => changerRole(u.id, "pro")}>Passer en pro</button>}
              {u.role !== "admin" && <button onClick={() => changerRole(u.id, "admin")}>Passer en admin</button>}
            </div>
          </li>
        ))}
      </ul>
      <GestionMedicaments />
      
    </div>
    
  );
}
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
  }

  return (
    <section className="pro-section">
      <h3>Catalogue des médicaments</h3>
      <form className="form-vertical" onSubmit={ajouter}>
        <label>Nom<input value={form.nom} onChange={set("nom")} required /></label>
        <label>DCI (optionnel)<input value={form.dci} onChange={set("dci")} /></label>
        <label>Forme (ex: Comprimé)<input value={form.forme} onChange={set("forme")} /></label>
        <label>Dosage (ex: 500mg)<input value={form.dosage} onChange={set("dosage")} /></label>
        <label>Catégorie (ex: Antalgique)<input value={form.categorie} onChange={set("categorie")} /></label>
        <button type="submit">Ajouter au catalogue</button>
      </form>
      {message && <p className="message-success">{message}</p>}

      <ul className="result-list">
        {medicaments.map((m) => (
          <li key={m.id} className="result-item">
            <strong>{m.nom}</strong> — {m.dosage} ({m.categorie})
          </li>
        ))}
      </ul>
    </section>
  );
}