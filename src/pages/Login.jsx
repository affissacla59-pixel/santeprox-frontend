import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setErreur("Email ou mot de passe incorrect.");
    }
  }

  return (
    <div className="container container-narrow">
      <h2>Connexion</h2>
      <form className="form-vertical" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Mot de passe
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit">Se connecter</button>
      </form>
      {erreur && <p className="message-error">{erreur}</p>}
      <p>Pas encore de compte ? <Link to="/inscription">Inscrivez-vous</Link></p>
    </div>
  );
}