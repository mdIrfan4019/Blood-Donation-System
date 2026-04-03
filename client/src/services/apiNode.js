import axios from "axios";

const apiNode = axios.create({
  // Use Vercel specific environment variable or fallback safely to local backend!
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

apiNode.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default apiNode;
