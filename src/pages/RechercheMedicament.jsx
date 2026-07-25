import { useState } from "react";
import api from "../api/axios";
import "../admin-dashboard.css";

export default function RechercheMedicament() {
  const [nom, setNom] = useState("");
  const [ville, setVille] = useState("");
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aRecherche, setARecherche] = useState(false);

  async function rechercher(e) {
    e.preventDefault();
    setLoading(true);
    setARecherche(true);
    const res = await api.get("/medicaments/disponibilite", {
      params: { medicament: nom, ville: ville || undefined },
    });
    setResultat(res.data);
    setLoading(false);
  }

  function reinitialiser() {
    setNom("");
    setVille("");
    setResultat(null);
    setARecherche(false);
  }

  return (
    <div className="rmed-page">
      <div className="rmed-header">
        <div className="rmed-header-icon">
          <i className="bi bi-capsule"></i>
        </div>
        <div>
          <h1>Disponibilité d'un médicament</h1>
          <p>Trouvez rapidement une pharmacie qui a votre médicament en stock.</p>
        </div>
      </div>

      <form className="rmed-search" onSubmit={rechercher}>
        <div className="rmed-search-input">
          <i className="bi bi-capsule"></i>
          <input
            type="text"
            placeholder="Nom du médicament (ex : Paracétamol)"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
        </div>

        <div className="rmed-search-input rmed-search-input-city">
          <i className="bi bi-geo-alt"></i>
          <input
            type="text"
            placeholder="Ville (optionnel)"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
          />
        </div>

        <button type="submit" className="rmed-btn-primary" disabled={loading}>
          <i className="bi bi-search"></i>
          <span>Rechercher</span>
        </button>

        {aRecherche && (
          <button type="button" className="rmed-btn-ghost" onClick={reinitialiser}>
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </form>

      {loading && (
        <div className="rmed-state">
          <i className="bi bi-arrow-repeat rmed-spin"></i>
          <p>Recherche en cours...</p>
        </div>
      )}

      {!loading && resultat && (
        <>
          {resultat.medicament && (
            <div className="rmed-drug-summary">
              <div className="rmed-drug-icon">
                <i className="bi bi-capsule-pill"></i>
              </div>
              <div>
                <h3>{resultat.medicament.nom}</h3>
                <div className="rmed-drug-tags">
                  {resultat.medicament.dosage && (
                    <span className="rmed-tag"><i className="bi bi-droplet-half"></i> {resultat.medicament.dosage}</span>
                  )}
                  {resultat.medicament.forme && (
                    <span className="rmed-tag"><i className="bi bi-tag"></i> {resultat.medicament.forme}</span>
                  )}
                  {resultat.medicament.categorie && (
                    <span className="rmed-tag"><i className="bi bi-bookmark"></i> {resultat.medicament.categorie}</span>
                  )}
                  {resultat.medicament.necessite_ordonnance ? (
                    <span className="rmed-tag rmed-tag-warning"><i className="bi bi-file-earmark-medical"></i> Ordonnance requise</span>
                  ) : (
                    <span className="rmed-tag rmed-tag-success"><i className="bi bi-check-circle"></i> Sans ordonnance</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {!resultat.pharmacies?.length && (
            <div className="rmed-state">
              <i className="bi bi-emoji-frown"></i>
              <p>Aucune pharmacie ne dispose de ce médicament actuellement.</p>
            </div>
          )}

          {resultat.pharmacies?.length > 0 && (
            <>
              <div className="rmed-summary">
                <i className="bi bi-info-circle"></i>
                <span>
                  Disponible dans {resultat.pharmacies.length} pharmacie{resultat.pharmacies.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="rmed-grid">
                {resultat.pharmacies.map((p) => {
                  const telUrl = "tel:" + p.telephone;
                  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + p.latitude + "," + p.longitude;

                  return (
                    <article key={p.id} className="rmed-card">
                      <div className="rmed-card-top">
                        <div className="rmed-card-icon">
                          <i className="bi bi-shop"></i>
                        </div>
                        <span className="rmed-status">
                          <i className="bi bi-check-circle-fill"></i>
                          Disponible
                        </span>
                      </div>

                      <h3 className="rmed-card-name">{p.nom}</h3>

                      <div className="rmed-card-info">
                        <i className="bi bi-geo-alt-fill"></i>
                        <span>{p.adresse}, {p.commune}, {p.ville}</span>
                      </div>

                      {p.telephone && (
                        <div className="rmed-card-info">
                          <i className="bi bi-telephone-fill"></i>
                          <a href={telUrl}>{p.telephone}</a>
                        </div>
                      )}

                      <div className="rmed-card-footer">
                        {p.telephone && (
                          <a href={telUrl} className="rmed-btn-primary rmed-btn-full">
                            <i className="bi bi-telephone"></i>
                            <span>Appeler</span>
                          </a>
                        )}
                        {p.latitude && p.longitude && (
                          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="rmed-btn-ghost rmed-btn-full">
                            <i className="bi bi-map"></i>
                            <span>Itinéraire</span>
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {!loading && !resultat && (
        <div className="rmed-state rmed-state-initial">
          <i className="bi bi-search-heart"></i>
          <p>Entrez le nom d'un médicament pour vérifier sa disponibilité en pharmacie.</p>
        </div>
      )}
    </div>
  );
}