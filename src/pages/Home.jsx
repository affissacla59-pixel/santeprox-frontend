import { Link } from "react-router-dom";
import "../admin-dashboard.css";

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <span className="home-eyebrow">
          <i className="bi bi-shield-plus"></i> Plateforme de santé communautaire
        </span>
        <h1>SantéProx</h1>
        <p>La santé communautaire, plus proche de vous.</p>
      </section>

      <div className="container">
        <div className="grid-cards">
          <Link to="/pharmacies-de-garde" className="card">
            <div className="card-icon">
              <i className="bi bi-hospital"></i>
            </div>
            <h3>Pharmacies de garde</h3>
            <p>Trouvez la pharmacie de garde la plus proche, en temps réel.</p>
            <span className="card-arrow">
              En savoir plus <i className="bi bi-arrow-right"></i>
            </span>
          </Link>

          <Link to="/recherche-medicament" className="card">
            <div className="card-icon">
              <i className="bi bi-capsule"></i>
            </div>
            <h3>Disponibilité médicament</h3>
            <p>Vérifiez quelle pharmacie a votre médicament en stock.</p>
            <span className="card-arrow">
              En savoir plus <i className="bi bi-arrow-right"></i>
            </span>
          </Link>

          <Link to="/rendez-vous" className="card">
            <div className="card-icon">
              <i className="bi bi-calendar2-check"></i>
            </div>
            <h3>Prendre rendez-vous</h3>
            <p>Réservez une consultation dans un centre de santé partenaire.</p>
            <span className="card-arrow">
              En savoir plus <i className="bi bi-arrow-right"></i>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}