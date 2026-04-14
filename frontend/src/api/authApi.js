const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function parseJwt(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    return JSON.parse(decodeURIComponent(
      atob(parts[1])
        .split("")
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    ));
  } catch (err) {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== "number") return true;
  const expiresAtMs = payload.exp * 1000;
  return Date.now() >= expiresAtMs;
}

export async function signup(email, password, name) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  return res.json();
}

export async function login(email, password) {
  const payload = {
    email: typeof email === "string" ? email.trim().toLowerCase() : "",
    password: typeof password === "string" ? password.trim() : "",
  };
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
    const session = JSON.parse(s);
    if (!session || !session.access_token) {
      clearSession();
      return null;
    }

    if (isTokenExpired(session.access_token)) {
      clearSession();
      return null;
    }

    return session;
  } catch (err) {
    clearSession();
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("session");
}
