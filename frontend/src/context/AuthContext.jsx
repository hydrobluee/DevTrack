import { createContext, useContext, useState, useEffect } from "react";
import {
  signup as apiSignup,
  login as apiLogin,
  saveSession,
  getSession,
  clearSession,
} from "../api/authApi";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(getSession());
  const [loading, setLoading] = useState(true);

  const signUpNewUser = async (email, password, name) => {
    const response = await apiSignup(email, password, name);
    if (response?.error) {
      console.log("Error signing up:", response.error);
      return { error: response.error };
    }
    if (response?.access_token) {
      saveSession(response);
      setSession(response);
    }
    return response;
  };

  useEffect(() => {
    // Get initial session
    setLoading(true);
    const s = getSession();
    setSession(s);
    setLoading(false);
    return () => {};
  }, []);

  const signInUser = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res?.access_token) {
      saveSession(res);
      setSession(res);
      return { data: res, error: null };
    }
    return { data: null, error: res?.error || "Login failed" };
  };

  // signInWithGoogle implemented below

  const signOut = async () => {
    clearSession();
    setSession(null);
  };

  const resetPassword = async (email) => {
    return { error: "Reset password is not implemented." };
  };

  const signInWithGoogle = async () => {
    const popup = window.open(
      `${API_BASE}/api/auth/google`,
      "GoogleSignIn",
      "width=500,height=700"
    );

    return new Promise((resolve) => {
      const handleMessage = async (e) => {
        if (e.origin !== window.location.origin) return;
        const { token, id } = e.data || {};
        if (!token) {
          window.removeEventListener("message", handleMessage);
          resolve({ data: null, error: "No token" });
          return;
        }
        try {
          // fetch user
          const res = await fetch(`${API_BASE}/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = await res.json();
          const session = { access_token: token, user: userData };
          saveSession(session);
          setSession(session);
          window.removeEventListener("message", handleMessage);
          resolve({ data: session, error: null });
        } catch (err) {
          window.removeEventListener("message", handleMessage);
          resolve({ data: null, error: err });
        }
      };

      window.addEventListener("message", handleMessage);
    });
  };
  const updatePassword = async (newPassword) => {
    // You can implement this using an endpoint requiring a valid JWT
    return { error: "Update password is not implemented." };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        signUpNewUser,
        signInUser,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
