import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container">
      <h1>SantéProx</h1>
      <p>La santé communautaire, plus proche de vous.</p>
      <div className="grid-cards">
        <Link to="/pharmacies-de-garde" className="card">
          <h3>🏥 Pharmacies de garde</h3>
          <p>Trouvez la pharmacie de garde la plus proche, en temps réel.</p>
        </Link>
        <Link to="/recherche-medicament" className="card">
          <h3>💊 Disponibilité médicament</h3>
          <p>Vérifiez quelle pharmacie a votre médicament en stock.</p>
        </Link>
        <Link to="/rendez-vous" className="card">
          <h3>📅 Prendre rendez-vous</h3>
          <p>Réservez une consultation dans un centre de santé partenaire.</p>
        </Link>
      </div>
    </div>
  );
}