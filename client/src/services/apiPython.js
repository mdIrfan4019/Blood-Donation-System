import axios from "axios";

const apiPython = axios.create({
  baseURL: "http://localhost:8000",
});

apiPython.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default apiPython;
