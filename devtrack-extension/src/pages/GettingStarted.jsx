import React, { useEffect, useState } from "react";
import {
  chromeStorageLocalGet,
  isChromeExtension,
  openExtensionPage,
  sendRuntimeMessage,
} from "../lib/chrome";

const GITHUB_CONFIG_KEY = "devtrackGithubConfig";
const GITHUB_SYNC_STATUS_KEY = "devtrackGithubSyncStatus";

const initialForm = {
  token: "",
  repoUrl: "",
  branch: "",
};

function sanitizeConfigForView(config) {
  if (!config) return null;

  return {
    hasToken: Boolean(config.token || config.hasToken),
    repoOwner: config.repoOwner,
    repoName: config.repoName,
    repoFullName: config.repoFullName,
    repoUrl: config.repoUrl,
    branch: config.branch,
    connectedAt: config.connectedAt,
    updatedAt: config.updatedAt,
  };
}

function formatDate(value) {
  if (!value) return "Not available yet";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available yet";
  }

  return date.toLocaleString();
}

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

export default function GettingStarted() {
  const [form, setForm] = useState(initialForm);
  const [savedConfig, setSavedConfig] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

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
    body.style.minHeight = "620px";
    body.style.background =
      "radial-gradient(circle at top, #10231c 0%, #07110d 35%, #020617 100%)";
    body.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';

    return () => {
      Object.assign(body.style, prev);
    };
  }, []);

  useEffect(() => {
    let disposed = false;

    async function loadState() {
      const data = await chromeStorageLocalGet({
        [GITHUB_CONFIG_KEY]: null,
        [GITHUB_SYNC_STATUS_KEY]: null,
      });

      if (disposed) return;

      const nextConfig = data[GITHUB_CONFIG_KEY];
      const nextStatus = data[GITHUB_SYNC_STATUS_KEY];

      setSavedConfig(sanitizeConfigForView(nextConfig));
      setSyncStatus(nextStatus);
      setForm((current) => ({
        ...current,
        repoUrl: nextConfig?.repoUrl ?? "",
        branch: nextConfig?.branch ?? "",
        token: "",
      }));
      setIsLoading(false);
    }

    loadState();

    if (
      !isChromeExtension ||
      typeof chrome === "undefined" ||
      !chrome.storage?.onChanged
    ) {
      return () => {
        disposed = true;
      };
    }

    const handleStorageChange = (changes, areaName) => {
      if (areaName !== "local") return;

      if (changes[GITHUB_CONFIG_KEY]) {
        const nextConfig = changes[GITHUB_CONFIG_KEY].newValue ?? null;
        setSavedConfig(sanitizeConfigForView(nextConfig));
        setForm((current) => ({
          ...current,
          repoUrl: nextConfig?.repoUrl ?? "",
          branch: nextConfig?.branch ?? "",
          token: "",
        }));
      }

      if (changes[GITHUB_SYNC_STATUS_KEY]) {
        setSyncStatus(changes[GITHUB_SYNC_STATUS_KEY].newValue ?? null);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      disposed = true;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setNotice(null);
    setIsSaving(true);

    try {
      const response = await sendRuntimeMessage({
        type: "devtrack.github.connect",
        payload: {
          token: form.token,
          repoUrl: form.repoUrl,
          branch: form.branch,
        },
      });

      if (!response?.ok) {
        throw new Error(response?.error || "GitHub setup could not be saved.");
      }

      setSavedConfig(sanitizeConfigForView(response.config ?? null));
      setSyncStatus(response.status ?? null);
      setForm({
        token: "",
        repoUrl: response.config?.repoUrl ?? form.repoUrl,
        branch: response.config?.branch ?? form.branch,
      });
      setNotice({
        type: "success",
        text:
          response?.message ||
          `Connected to ${response?.config?.repoFullName || "your repository"}.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "GitHub setup failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setNotice(null);
    setIsDisconnecting(true);

    try {
      const response = await sendRuntimeMessage({
        type: "devtrack.github.disconnect",
      });

      if (!response?.ok) {
        throw new Error(response?.error || "GitHub could not be disconnected.");
      }

      setSavedConfig(null);
      setForm(initialForm);
      setNotice({
        type: "success",
        text: "Stored GitHub credentials were removed from this extension.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "GitHub could not be disconnected.",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="min-h-full w-full bg-[radial-gradient(circle_at_top,#10231c_0%,#07110d_35%,#020617_100%)] text-slate-100">
      <div className="mx-auto flex min-h-full w-[380px] flex-col gap-4 px-5 py-5">
        <a
          href={openExtensionPage("popup.html")}
          className="inline-flex w-fit items-center gap-2 text-sm text-emerald-300/90 no-underline transition hover:text-emerald-200"
        >
          ← Back
        </a>

        <section className="rounded-[28px] border border-emerald-500/20 bg-slate-950/75 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300/70">
                Step 1
              </p>
              <h1 className="mt-2 text-[24px] font-semibold text-white">
                Connect GitHub
              </h1>
            </div>
            <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-200">
              Extension
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-300/85">
            DevTrack uses a GitHub personal access token, your repository link,
            and an optional branch. Once saved, accepted LeetCode submissions
            get committed automatically from the extension.
          </p>

          {!isChromeExtension ? (
            <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-100">
              Open this page from the loaded Chrome extension to finish GitHub
              setup. The sync pipeline only runs inside the extension runtime.
            </div>
          ) : null}

          {notice ? (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${getStatusClasses(
                notice.type,
              )}`}
            >
              {notice.text}
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                GitHub personal access token
              </span>
              <input
                type="password"
                name="token"
                value={form.token}
                onChange={handleFieldChange}
                placeholder={
                  savedConfig?.hasToken
                    ? "Stored locally. Enter a new token only to replace it."
                    : "ghp_..."
                }
                autoComplete="off"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Repository link
              </span>
              <input
                type="text"
                name="repoUrl"
                value={form.repoUrl}
                onChange={handleFieldChange}
                placeholder="https://github.com/your-name/leetcode-sync"
                autoComplete="off"
                required
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Branch
              </span>
              <input
                type="text"
                name="branch"
                value={form.branch}
                onChange={handleFieldChange}
                placeholder="Leave blank to use the repo default branch"
                autoComplete="off"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!isChromeExtension || isSaving}
                className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              >
                {isSaving ? "Saving..." : savedConfig ? "Update GitHub" : "Save GitHub"}
              </button>

              <button
                type="button"
                onClick={handleDisconnect}
                disabled={!savedConfig || isDisconnecting}
                className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900/80 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
              >
                {isDisconnecting ? "Removing..." : "Disconnect"}
              </button>
            </div>
          </form>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-sm leading-6 text-slate-300">
            Required token scope: repository contents read/write access. DevTrack
            stores it locally in the extension and uses it only for repository
            validation plus pushing accepted LeetCode solutions.
            <a
              href="https://github.com/settings/personal-access-tokens/new"
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-emerald-300 no-underline transition hover:text-emerald-200"
            >
              Create a GitHub token →
            </a>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-800 bg-slate-950/70 p-5 shadow-[0_16px_60px_rgba(2,6,23,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Step 2
          </p>
          <h2 className="mt-2 text-[22px] font-semibold text-white">
            Auto-sync behavior
          </h2>

          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <p>
              When you submit an accepted solution on LeetCode, DevTrack will
              commit the code to:
            </p>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 font-mono text-[12px] text-emerald-100">
              leetcode/&lt;problem-slug&gt;/solution.&lt;language-extension&gt;
            </div>
            <p>
              The same file gets updated if you resubmit the same problem in the
              same language.
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-800 bg-slate-950/70 p-5 shadow-[0_16px_60px_rgba(2,6,23,0.35)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Status
              </p>
              <h2 className="mt-2 text-[22px] font-semibold text-white">
                Current setup
              </h2>
            </div>
            {isLoading ? (
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Loading
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Repository
              </p>
              <p className="mt-2 text-sm text-white">
                {savedConfig?.repoFullName || "Not connected yet"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Branch: {savedConfig?.branch || "Not set"}
              </p>
            </div>

            <div
              className={`rounded-2xl border px-4 py-4 ${getStatusClasses(
                syncStatus?.state,
              )}`}
            >
              <p className="text-xs uppercase tracking-[0.18em]">
                Last sync
              </p>
              <p className="mt-2 text-sm">
                {syncStatus?.message ||
                  "No LeetCode submission has been synced yet."}
              </p>
              <p className="mt-1 text-xs opacity-80">
                Updated: {formatDate(syncStatus?.updatedAt)}
              </p>
              {syncStatus?.filePath ? (
                <p className="mt-2 font-mono text-[12px] opacity-90">
                  {syncStatus.filePath}
                </p>
              ) : null}
              {syncStatus?.commitUrl ? (
                <a
                  href={syncStatus.commitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm text-emerald-200 no-underline transition hover:text-emerald-100"
                >
                  Open commit →
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
