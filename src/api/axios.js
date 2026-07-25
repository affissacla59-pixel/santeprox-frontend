import axios from "axios";

const api = axios.create({
  // 💡 Passage sur le port 8085 pour contourner les conflits de serveurs locaux sous Windows
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("santeprox_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (erreur) => {
    return Promise.reject(erreur);
  }
);

export default api;