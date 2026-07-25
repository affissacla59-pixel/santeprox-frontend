import { useEffect, useState } from "react";
import api from "../api/axios";
import "../admin-dashboard.css";

export default function PharmaciesGarde() {
  const [pharmacies, setPharmacies] = useState([]);
  const [ville, setVille] = useState("");
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState(false);

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

  function handleSubmit(e) {
    e.preventDefault();
    setRecherche(!!ville);
    charger(ville);
  }

  function reinitialiser() {
    setVille("");
    setRecherche(false);
    charger("");
  }

  return (
    <div className="garde-page">
      <div className="garde-header">
        <div className="garde-header-icon">
          <i className="bi bi-shop"></i>
        </div>
        <div>
          <h1>Pharmacies de garde</h1>
          <p>Trouvez une pharmacie ouverte près de chez vous, à toute heure.</p>
        </div>
      </div>

      <form className="garde-search" onSubmit={handleSubmit}>
        <div className="garde-search-input">
          <i className="bi bi-geo-alt"></i>
          <input
            type="text"
            placeholder="Filtrer par ville (ex : Cotonou)"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
          />
        </div>
        <button type="submit" className="garde-btn-primary">
          <i className="bi bi-search"></i>
          <span>Rechercher</span>
        </button>
        {recherche && (
          <button type="button" className="garde-btn-ghost" onClick={reinitialiser}>
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </form>

      <div className="garde-summary">
        {!loading && (
          <>
            <i className="bi bi-info-circle"></i>
            <span>
              {pharmacies.length} pharmacie{pharmacies.length > 1 ? "s" : ""} de garde
              {recherche ? ` à ${ville}` : " actuellement"}
            </span>
          </>
        )}
      </div>

      {loading && (
        <div className="garde-state">
          <i className="bi bi-arrow-repeat garde-spin"></i>
          <p>Chargement des pharmacies...</p>
        </div>
      )}

      {!loading && pharmacies.length === 0 && (
        <div className="garde-state">
          <i className="bi bi-emoji-frown"></i>
          <p>Aucune pharmacie de garde trouvée pour le moment.</p>
          {recherche && (
            <button className="garde-btn-ghost" onClick={reinitialiser}>
              <i className="bi bi-arrow-counterclockwise"></i>
              <span>Voir toutes les pharmacies</span>
            </button>
          )}
        </div>
      )}

      {!loading && pharmacies.length > 0 && (
        <div className="garde-grid">
          {pharmacies.map((p) => {
            const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + p.latitude + "," + p.longitude;
            const telUrl = "tel:" + p.telephone;

            return (
              <article key={p.id} className="garde-card">
                <div className="garde-card-top">
                  <div className="garde-card-icon">
                    <i className="bi bi-shop"></i>
                  </div>
                  <span className="garde-status">
                    <i className="bi bi-record-circle-fill"></i>
                    De garde
                  </span>
                </div>

                <h3 className="garde-card-name">{p.nom}</h3>

                <div className="garde-card-info">
                  <i className="bi bi-geo-alt-fill"></i>
                  <span>{p.adresse}, {p.commune}, {p.ville}</span>
                </div>

                {p.telephone && (
                  <div className="garde-card-info">
                    <i className="bi bi-telephone-fill"></i>
                    <a href={telUrl}>{p.telephone}</a>
                  </div>
                )}

                {(p.garde_debut || p.garde_fin) && (
                  <div className="garde-card-info garde-card-hours">
                    <i className="bi bi-clock-history"></i>
                    <span>
                      {p.garde_debut && new Date(p.garde_debut).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {p.garde_fin && " → " + new Date(p.garde_fin).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}

                <div className="garde-card-footer">
                  {p.telephone && (
                    <a href={telUrl} className="garde-btn-primary garde-btn-full">
                      <i className="bi bi-telephone"></i>
                      <span>Appeler</span>
                    </a>
                  )}
                  {p.latitude && p.longitude && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="garde-btn-ghost garde-btn-full">
                      <i className="bi bi-map"></i>
                      <span>Itinéraire</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}