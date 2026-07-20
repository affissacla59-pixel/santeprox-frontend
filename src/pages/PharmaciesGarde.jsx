import { useEffect, useState } from "react";
import api from "../api/axios";

export default function PharmaciesGarde() {
  const [pharmacies, setPharmacies] = useState([]);
  const [ville, setVille] = useState("");
  const [loading, setLoading] = useState(true);

  async function charger(villeFiltre = "") {
    setLoading(true);
    const res = await api.get("/pharmacies/de-garde", {
      params: villeFiltre ? { ville: villeFiltre } : {},
    });
    setPharmacies(res.data);
    setLoading(false);
  }

  useEffect(() => {
    charger();
  }, []);

  return (
    <div className="container">
      <h2>Pharmacies de garde</h2>
      <form
        className="filter-bar"
        onSubmit={(e) => {
          e.preventDefault();
          charger(ville);
        }}
      >
        <input
          placeholder="Filtrer par ville (ex: Cotonou)"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
        />
        <button type="submit">Rechercher</button>
      </form>

      {loading && <p>Chargement...</p>}
      {!loading && pharmacies.length === 0 && (
        <p>Aucune pharmacie de garde trouvée pour le moment.</p>
      )}

      <ul className="result-list">
        {pharmacies.map((p) => (
          <li key={p.id} className="result-item">
            <strong>{p.nom}</strong>
            <p>{p.adresse}, {p.commune}, {p.ville}</p>
            {p.telephone && <p>📞 {p.telephone}</p>}
            <p className="garde-badge">🟢 De garde</p>
          </li>
        ))}
      </ul>
    </div>
  );
}