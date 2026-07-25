export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <h4>
            <i className="bi bi-heart-pulse"></i> SantéProx
          </h4>
          <p>La santé communautaire, plus proche de vous.</p>
        </div>

        <div className="footer-col">
          <h4>Liens rapides</h4>
          <ul>
            <li>
              <a href="/pharmacies-de-garde">
                <i className="bi bi-shop"></i> Pharmacies de garde
              </a>
            </li>
            <li>
              <a href="/recherche-medicament">
                <i className="bi bi-capsule"></i> Recherche médicament
              </a>
            </li>
            <li>
              <a href="/rendez-vous">
                <i className="bi bi-calendar-check"></i> Prendre rendez-vous
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Compte</h4>
          <ul>
            <li>
              <a href="/connexion">
                <i className="bi bi-box-arrow-in-right"></i> Connexion
              </a>
            </li>
            <li>
              <a href="/inscription">
                <i className="bi bi-person-plus"></i> Inscription
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p><i className="bi bi-envelope"></i> contact@santeprox.bj</p>
          <p><i className="bi bi-telephone"></i> +229 21 00 00 00</p>
          <p><i className="bi bi-geo-alt"></i> Cotonou, Bénin</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SantéProx — Tous droits réservés.</p>
      </div>
    </footer>
  );
}