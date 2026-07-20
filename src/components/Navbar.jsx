import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">SantéProx</Link>
      <div className="nav-links">
        <Link to="/pharmacies-de-garde">Pharmacies de garde</Link>
        <Link to="/recherche-medicament">Recherche médicament</Link>
        <Link to="/rendez-vous">Prendre RDV</Link>
        {user?.role === "pro" && <Link to="/espace-pro">Espace pro</Link>}
        {user?.role === "admin" && <Link to="/admin">Dashboard Admin</Link>}
        {user && <Link to="/mes-rendez-vous">Mes RDV</Link>}
        {!user && <Link to="/connexion">Connexion</Link>}
        {!user && <Link to="/inscription">Inscription</Link>}
        {user && (
          <button className="link-button" onClick={handleLogout}>
            Déconnexion ({user.nom})
          </button>
        )}
      </div>
    </nav>
  );
}