import axios from "axios";

const API = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
=======
  baseURL: "https://golf-charity-club.onrender.com/api",
>>>>>>> 6c6eec7df25b98aa959ea35d14b9d19141f76f51
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
