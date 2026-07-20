import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PriseRendezVous() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [centres, setCentres] = useState([]);
  const [centreId, setCentreId] = useState("");
  const [centreDetail, setCentreDetail] = useState(null);
  const [medecinId, setMedecinId] = useState("");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [motif, setMotif] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get("/centres-sante").then((res) => setCentres(res.data.data ?? res.data));
  }, []);

  useEffect(() => {
    if (!centreId) return setCentreDetail(null);
    api.get(`/centres-sante/${centreId}`).then((res) => setCentreDetail(res.data));
  }, [centreId]);

  async function reserver(e) {
    e.preventDefault();
    if (!user) {
      navigate("/connexion");
      return;
    }
    try {
      const res = await api.post("/rendez-vous", {
        centre_sante_id: centreId,
        medecin_id: medecinId || null,
        date_rdv: date,
        heure_rdv: heure,
        motif,
      });
      setMessage({ type: "success", text: res.data.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Erreur lors de la prise de rendez-vous.",
      });
    }
  }

  return (
    <div className="container">
      <h2>Prendre rendez-vous</h2>
      <form className="form-vertical" onSubmit={reserver}>
        <label>
          Centre de santé
          <select value={centreId} onChange={(e) => setCentreId(e.target.value)} required>
            <option value="">-- Choisir un centre --</option>
            {centres.map((c) => (
              <option key={c.id} value={c.id}>{c.nom} ({c.ville})</option>
            ))}
          </select>
        </label>

        {centreDetail?.medecins?.length > 0 && (
          <label>
            Médecin (optionnel)
            <select value={medecinId} onChange={(e) => setMedecinId(e.target.value)}>
              <option value="">-- Peu importe --</option>
              {centreDetail.medecins.map((m) => (
                <option key={m.id} value={m.id}>{m.nom} — {m.specialite}</option>
              ))}
            </select>
          </label>
        )}

        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label>
          Heure
          <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} required />
        </label>

        <label>
          Motif (optionnel)
          <textarea value={motif} onChange={(e) => setMotif(e.target.value)} rows={3} />
        </label>

        <button type="submit">Confirmer la demande de RDV</button>
      </form>

      {message && (
        <p className={message.type === "success" ? "message-success" : "message-error"}>
          {message.text}
        </p>
      )}
    </div>
  );
}