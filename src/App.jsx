import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import PharmaciesGarde from "./pages/PharmaciesGarde";
import RechercheMedicament from "./pages/RechercheMedicament";
import PriseRendezVous from "./pages/PriseRendezVous";
import MesRendezVous from "./pages/MesRendezVous";
import EspacePro from "./pages/EspacePro";
import DashboardAdmin from "./pages/DashboardAdmin";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pharmacies-de-garde" element={<PharmaciesGarde />} />
          <Route path="/recherche-medicament" element={<RechercheMedicament />} />
          <Route path="/rendez-vous" element={<PriseRendezVous />} />
          <Route path="/mes-rendez-vous" element={<MesRendezVous />} />
          <Route path="/espace-pro" element={<EspacePro />} />
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}