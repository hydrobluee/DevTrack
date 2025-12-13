import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveSession } from "../api/authApi";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const id = params.get("id");
    const origin = window.location.origin;

    if (!token) {
      navigate("/login");
      return;
    }

    // If opened as a popup, send message back to opener
    if (window.opener) {
      window.opener.postMessage({ token, id }, origin);
      window.close();
      return;
    }

    // Otherwise, save session and navigate to profile
    (async () => {
      try {
        // Fetch user data
        const res = await fetch(`${API_BASE}/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        const session = { access_token: token, user: data };
        saveSession(session);
        navigate("/profile");
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Processing login...</p>
    </div>
  );
}
