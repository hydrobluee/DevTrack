import React, { useEffect, useState } from "react";
import {
  chromeStorageLocalGet,
  chromeStorageLocalSet,
  isChromeExtension,
  openExtensionPage,
} from "../lib/chrome";
import { login, logout } from "../api/dashboardApi";

const DEVTRACK_SESSION_KEY = "devtrackSession";

function getStatusClasses(state) {
  switch (state) {
    case "success":
    case "connected":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "error":
      return "border-rose-500/30 bg-rose-500/10 text-rose-100";
    default:
      return "border-slate-800 bg-slate-950/60 text-slate-300";
  }
}

export default function Settings() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const { body } = document;
    const prev = {
      margin: body.style.margin,
      background: body.style.background,
      fontFamily: body.style.fontFamily,
      width: body.style.width,
      minHeight: body.style.minHeight,
    };

    body.style.margin = "0";
    body.style.width = "380px";
    body.style.minHeight = "500px";
    body.style.background =
      "radial-gradient(circle at top, #10231c 0%, #07110d 35%, #020617 100%)";
    body.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';

    return () => {
      Object.assign(body.style, prev);
    };
  }, []);

  useEffect(() => {
    async function loadSession() {
      try {
        setIsLoading(true);
        const data = await chromeStorageLocalGet({
          [DEVTRACK_SESSION_KEY]: null,
        });
        const storedSession = data[DEVTRACK_SESSION_KEY];
        console.debug("[Settings] Loaded session:", storedSession ? "exists" : "null");
        setSession(storedSession);
      } catch (err) {
        console.error("[Settings] Error loading session:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();

    // Listen for storage changes
    if (isChromeExtension && typeof chrome !== "undefined" && chrome.storage?.onChanged) {
      const handleStorageChange = (changes, areaName) => {
        if (areaName !== "local") return;
        if (changes[DEVTRACK_SESSION_KEY]) {
          const newSession = changes[DEVTRACK_SESSION_KEY].newValue;
          console.debug("[Settings] Storage changed:", newSession ? "session updated" : "session cleared");
          setSession(newSession || null);
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setNotice(null);
    setIsLoggingIn(true);

    try {
      console.debug("[Settings] Attempting login with email:", form.email);
      const result = await login(form.email, form.password);
      console.debug("[Settings] Login successful");
      
      // Store session in chrome storage
      await chromeStorageLocalSet({
        [DEVTRACK_SESSION_KEY]: result,
      });

      setSession(result);
      setForm({ email: "", password: "" });
      setNotice({
        type: "success",
        text: `Welcome ${result.user?.name || result.user?.email}! Your dashboard data will now sync.`,
      });
    } catch (error) {
      console.error("[Settings] Login error:", error.message);
      setNotice({
        type: "error",
        text: error.message || "Login failed",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.debug("[Settings] Logging out");
      await chromeStorageLocalSet({
        [DEVTRACK_SESSION_KEY]: null,
      });
      setSession(null);
      setNotice({
        type: "success",
        text: "Logged out successfully",
      });
    } catch (error) {
      console.error("[Settings] Logout error:", error);
      setNotice({
        type: "error",
        text: "Logout failed",
      });
    }
  };

  return (
    <div className="min-h-full w-full bg-[radial-gradient(circle_at_top,#10231c_0%,#07110d_35%,#020617_100%)] text-slate-100">
      <div className="mx-auto flex min-h-full w-[380px] flex-col gap-4 px-5 py-5">
        <a
          href={openExtensionPage("getting_started.html")}
          className="inline-flex w-fit items-center gap-2 text-sm text-emerald-300/90 no-underline transition hover:text-emerald-200"
        >
          ← Back
        </a>

        <section className="rounded-[28px] border border-emerald-500/20 bg-slate-950/75 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/70">
                DevTrack Account
              </p>
              <h1 className="mt-2 text-[24px] font-semibold text-white">
                Dashboard Connection
              </h1>
            </div>
            <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-200">
              Settings
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-300/85">
            Connect your DevTrack account to sync your coding progress and display your question statistics in the extension.
          </p>

          {notice && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${getStatusClasses(
                notice.type,
              )}`}
            >
              {notice.text}
            </div>
          )}

          {isLoading ? (
            <div className="mt-5 flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : session && session.user ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                    {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-100">
                      {session.user.name || session.user.email}
                    </p>
                    <p className="text-xs text-emerald-200/70">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-emerald-200/60 mb-4">
                  ✓ Connected and syncing data
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/30"
                >
                  Disconnect Account
                </button>
              </div>
            </div>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={handleLogin}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  disabled={isLoggingIn}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  disabled={isLoggingIn}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                />
              </label>

              <button
                type="submit"
                disabled={isLoggingIn || !form.email || !form.password}
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              >
                {isLoggingIn ? "Logging in..." : "Login to DevTrack"}
              </button>
            </form>
          )}

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-sm leading-6 text-slate-300">
            <p>
              Don't have an account? Create one on the{" "}
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-300 no-underline transition hover:text-emerald-200"
              >
                DevTrack website
              </a>
              .
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Your credentials are stored securely in Chrome storage and used only to sync your dashboard data.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
