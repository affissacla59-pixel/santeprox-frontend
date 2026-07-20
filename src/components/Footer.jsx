export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <h4>SantéProx</h4>
          <p>La santé communautaire, plus proche de vous.</p>
        </div>

        <div className="footer-col">
          <h4>Liens rapides</h4>
          <ul>
            <li><a href="/pharmacies-de-garde">Pharmacies de garde</a></li>
            <li><a href="/recherche-medicament">Recherche médicament</a></li>
            <li><a href="/rendez-vous">Prendre rendez-vous</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Compte</h4>
          <ul>
            <li><a href="/connexion">Connexion</a></li>
            <li><a href="/inscription">Inscription</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p>📧 contact@santeprox.bj</p>
          <p>📞 +229 21 00 00 00</p>
          <p>📍 Cotonou, Bénin</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SantéProx — Tous droits réservés.</p>
      </div>
    </footer>
  );
}
