const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export async function signup(email, password, name) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export function saveSession(session) {
  if (session && session.access_token) {
    localStorage.setItem("session", JSON.stringify(session));
  } else {
    localStorage.removeItem("session");
  }
}

export function getSession() {
  try {
    const s = localStorage.getItem("session");
    if (!s) return null;
    return JSON.parse(s);
  } catch (err) {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("session");
}
