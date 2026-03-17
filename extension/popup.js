const DEFAULT_BACKEND = "http://localhost:3000";
const DEFAULT_FRONTEND = "http://localhost:5173";

const STORAGE_KEYS = {
  backend: "devtrackBackendUrl",
  userId: "devtrackUserId",
  token: "devtrackAuthToken",
};

const elements = {
  backendUrl: document.getElementById("backendUrl"),
  userId: document.getElementById("userId"),
  authToken: document.getElementById("authToken"),
  saveUrl: document.getElementById("saveUrl"),
  refresh: document.getElementById("refresh"),
  status: document.getElementById("status"),
  stats: document.getElementById("stats"),
  contestList: document.getElementById("contestList"),
  openDashboard: document.getElementById("openDashboard"),
};

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function formatDate(timestamp) {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return "-";
  }
}

function formatDuration(duration) {
  if (!duration) return "-";
  return duration;
}

function normalizeUrl(url) {
  return url ? url.trim().replace(/\/$/, "") : "";
}

async function getStoredSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        [STORAGE_KEYS.backend]: DEFAULT_BACKEND,
        [STORAGE_KEYS.userId]: "",
        [STORAGE_KEYS.token]: "",
      },
      (data) => {
        resolve({
          backend: data[STORAGE_KEYS.backend],
          userId: data[STORAGE_KEYS.userId],
          token: data[STORAGE_KEYS.token],
        });
      }
    );
  });
}

async function setStoredSettings({ backend, userId, token }) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(
      {
        [STORAGE_KEYS.backend]: backend,
        [STORAGE_KEYS.userId]: userId,
        [STORAGE_KEYS.token]: token,
      },
      () => resolve()
    );
  });
}

function renderStats(stats) {
  elements.stats.innerHTML = "";
  if (!stats) return;

  const { total_questions, contest_ranking_info } = stats;

  const addStat = (label, value) => {
    const row = document.createElement("div");
    row.className = "stat-row";
    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    const valueEl = document.createElement("strong");
    valueEl.textContent = value ?? "—";
    row.appendChild(labelEl);
    row.appendChild(valueEl);
    elements.stats.appendChild(row);
  };

  if (total_questions && typeof total_questions === "object") {
    addStat("🧠 Total questions", "(per platform below)");
    Object.entries(total_questions.questionsData || {}).forEach(([key, value]) => {
      addStat(`  • ${key.replace(/_/g, " ")}`, value);
    });
  }

  if (contest_ranking_info && typeof contest_ranking_info === "object") {
    addStat("🏆 Contest ratings", "(per platform below)");
    Object.entries(contest_ranking_info.rankingData || {}).forEach(([key, value]) => {
      addStat(`  • ${key.replace(/_/g, " ")}`, value);
    });
  }
}

async function fetchDashboard() {
  const backendUrl = normalizeUrl(elements.backendUrl.value) || DEFAULT_BACKEND;
  const userId = elements.userId.value.trim();
  const token = elements.authToken.value.trim();

  if (!userId || !token) {
    setStatus("Enter User ID + token to load dashboard stats.", true);
    elements.stats.innerHTML = "";
    return;
  }

  const endpoint = `${backendUrl}/api/dashboard/${userId}`;
  setStatus("Loading dashboard stats...");

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || json?.message || "Unauthorized");
    }

    renderStats(json);
    setStatus("Dashboard stats loaded.");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Unable to load dashboard.", true);
    elements.stats.innerHTML = "";
  }
}

async function fetchContests() {
  const backendUrl = normalizeUrl(elements.backendUrl.value) || DEFAULT_BACKEND;
  const endpoint = `${backendUrl}/api/contests/upcoming`;

  elements.contestList.innerHTML = "";

  try {
    const response = await fetch(endpoint, { method: "GET" });
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json?.error || json?.message || "Unexpected response");
    }

    if (!json.contests || json.contests.length === 0) {
      return;
    }

    json.contests.slice(0, 15).forEach((contest) => {
      const li = document.createElement("li");
      li.className = "contest-item";

      const title = document.createElement("strong");
      title.textContent = `${contest.platform} · ${contest.name}`;
      li.appendChild(title);

      const meta = document.createElement("div");
      meta.className = "contest-meta";

      const start = document.createElement("span");
      start.textContent = `Starts: ${formatDate(contest.startTime)}`;
      meta.appendChild(start);

      const duration = document.createElement("span");
      duration.textContent = `Duration: ${formatDuration(contest.duration)}`;
      meta.appendChild(duration);

      if (contest.url) {
        const link = document.createElement("a");
        link.href = contest.url;
        link.textContent = "Open";
        link.target = "_blank";
        link.rel = "noopener";
        meta.appendChild(link);
      }

      li.appendChild(meta);
      elements.contestList.appendChild(li);
    });
  } catch (error) {
    console.error(error);
  }
}

async function refreshAll() {
  await fetchDashboard();
  await fetchContests();
}

async function init() {
  const stored = await getStoredSettings();
  elements.backendUrl.value = stored.backend || DEFAULT_BACKEND;
  elements.userId.value = stored.userId || "";
  elements.authToken.value = stored.token || "";

  elements.saveUrl.addEventListener("click", async () => {
    const backend = normalizeUrl(elements.backendUrl.value) || DEFAULT_BACKEND;
    const userId = elements.userId.value.trim();
    const token = elements.authToken.value.trim();
    await setStoredSettings({ backend, userId, token });
    setStatus("Settings saved.");
  });

  elements.refresh.addEventListener("click", refreshAll);

  elements.openDashboard.addEventListener("click", () => {
    chrome.tabs.create({ url: DEFAULT_FRONTEND });
  });

  await refreshAll();
}

init().catch((err) => console.error(err));
