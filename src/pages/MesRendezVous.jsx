import { useEffect, useState } from "react";
import api from "../api/axios";

const STATUT_LABEL = {
  en_attente: "⏳ En attente",
  confirme: "✅ Confirmé",
  annule: "❌ Annulé",
  termine: "🏁 Terminé",
};

export default function MesRendezVous() {
  const [rdvs, setRdvs] = useState([]);

  function charger() {
    api.get("/rendez-vous").then((res) => setRdvs(res.data.value ?? res.data));
  }

  useEffect(() => {
    charger();
  }, []);

  async function annuler(id) {
    await api.patch(`/rendez-vous/${id}/annuler`);
    charger();
  }

  return (
    <div className="container">
      <h2>Mes rendez-vous</h2>
      {rdvs.length === 0 && <p>Vous n'avez aucun rendez-vous pour le moment.</p>}
      <ul className="result-list">
        {rdvs.map((r) => (
          <li key={r.id} className="result-item">
            <strong>{r.centre_sante?.nom}</strong>
            <p>{r.date_rdv?.substring(0, 10)} à {r.heure_rdv}</p>
            {r.medecin && <p>Avec {r.medecin.nom}</p>}
            <p>{STATUT_LABEL[r.statut]}</p>
            {r.statut === "en_attente" && (
              <button onClick={() => annuler(r.id)}>Annuler</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}