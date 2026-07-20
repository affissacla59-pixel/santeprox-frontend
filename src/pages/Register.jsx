import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "", email: "", telephone: "", password: "", password_confirmation: "", role: "client",
  });
  const [erreur, setErreur] = useState(null);

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  const [succes, setSucces] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const user = await register(form);
      if (user.role === "pro") {
        setSucces("Compte créé ! Un administrateur doit valider votre compte professionnel avant que vous puissiez gérer une pharmacie ou un centre de santé. Vérifiez aussi votre email.");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErreur(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(" ") : (err.response?.data?.message || "Erreur lors de l'inscription."));
    }
  }

  return (
    <div className="container container-narrow">
      <h2>Créer un compte</h2>
      <form className="form-vertical" onSubmit={handleSubmit}>
        <label>Nom<input value={form.nom} onChange={set("nom")} required /></label>
        <label>Email<input type="email" value={form.email} onChange={set("email")} required /></label>
        <label>Téléphone<input value={form.telephone} onChange={set("telephone")} /></label>
        <label>Mot de passe<input type="password" value={form.password} onChange={set("password")} required /></label>
        <label>Confirmer le mot de passe<input type="password" value={form.password_confirmation} onChange={set("password_confirmation")} required /></label>
        <label>
          Type de compte
          <select value={form.role} onChange={set("role")}>
            <option value="client">Client (patient)</option>
            <option value="pro">Professionnel (pharmacie / centre de santé)</option>
          </select>
        </label>
        <button type="submit">S'inscrire</button>
      </form>
      {succes && <p className="message-success">{succes}</p>}
      {erreur && <p className="message-error">{erreur}</p>}
    </div>
  );
}