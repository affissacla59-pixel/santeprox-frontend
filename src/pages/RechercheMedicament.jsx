import { useState } from "react";
import api from "../api/axios";

export default function RechercheMedicament() {
  const [nom, setNom] = useState("");
  const [ville, setVille] = useState("");
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(false);

  async function rechercher(e) {
    e.preventDefault();
    setLoading(true);
    const res = await api.get("/medicaments/disponibilite", {
      params: { medicament: nom, ville: ville || undefined },
    });
    setResultat(res.data);
    setLoading(false);
  }

  return (
    <div className="container">
      <h2>Disponibilité d'un médicament</h2>
      <form className="filter-bar" onSubmit={rechercher}>
        <input
          placeholder="Nom du médicament (ex: Paracétamol)"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
        <input
          placeholder="Ville (optionnel)"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
        />
        <button type="submit">Rechercher</button>
      </form>

      {loading && <p>Recherche en cours...</p>}

      {resultat && !resultat.pharmacies?.length && (
        <p>Aucune pharmacie ne dispose de ce médicament actuellement.</p>
      )}

      {resultat?.pharmacies?.length > 0 && (
        <>
          <h3>Disponible dans {resultat.pharmacies.length} pharmacie(s) :</h3>
          <ul className="result-list">
            {resultat.pharmacies.map((p) => (
              <li key={p.id} className="result-item">
                <strong>{p.nom}</strong>
                <p>{p.adresse}, {p.commune}, {p.ville}</p>
                {p.telephone && <p>📞 {p.telephone}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}