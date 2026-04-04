import axios from "axios";

const apiPython = axios.create({
  baseURL: import.meta.env.VITE_ML_API_URL ||  "http://localhost:8000",
});

apiPython.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default apiPython;
