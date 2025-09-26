import api from "./axiosInstance";

export async function login(email, password) {
  const res = await api.post('/auth/login', { gmail: email, password });

  return {
    token: res.data.token,
    refresh_token: res.data.refresh_token,
    role: res.data.role,
    email,
  };
}

export async function getProfile() {
  const res = await api.get('/auth/profile');
  return res.data;
}