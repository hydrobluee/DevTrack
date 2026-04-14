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
  solutionSection: document.getElementById("solutionSection"),
  solutionContent: document.getElementById("solutionContent"),
  closeSolution: document.getElementById("closeSolution"),
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
    chrome.storage.local.get(
      {
        [STORAGE_KEYS.backend]: DEFAULT_BACKEND,
        [STORAGE_KEYS.userId]: "",
        [STORAGE_KEYS.token]: "",
      },
      (data) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Storage read error:", chrome.runtime.lastError);
          resolve({
            backend: DEFAULT_BACKEND,
            userId: "",
            token: "",
          });
          return;
        }
        
        console.log("✅ Settings retrieved:", {
          backend: data[STORAGE_KEYS.backend] || DEFAULT_BACKEND,
          userId: data[STORAGE_KEYS.userId] || "",
          token: data[STORAGE_KEYS.token] ? "***" : "(empty)"
        });
        
        resolve({
          backend: data[STORAGE_KEYS.backend] || DEFAULT_BACKEND,
          userId: data[STORAGE_KEYS.userId] || "",
          token: data[STORAGE_KEYS.token] || "",
        });
      }
    );
  });
}

async function setStoredSettings({ backend, userId, token }) {
  return new Promise((resolve, reject) => {
    const settingsToSave = {
      [STORAGE_KEYS.backend]: backend || DEFAULT_BACKEND,
      [STORAGE_KEYS.userId]: userId || "",
      [STORAGE_KEYS.token]: token || "",
    };
    
    console.log("💾 Saving to storage:", {
      backend: settingsToSave[STORAGE_KEYS.backend],
      userId: settingsToSave[STORAGE_KEYS.userId],
      token: settingsToSave[STORAGE_KEYS.token] ? "***" : "(empty)"
    });
    
    chrome.storage.local.set(settingsToSave, () => {
      if (chrome.runtime.lastError) {
        console.error("❌ Storage write error:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      console.log("✅ Settings saved to storage");
      resolve();
    });
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

/**
 * Fetch and display LeetCode solution
 */
async function fetchAndDisplaySolution(problemSlug) {
  const backendUrl = normalizeUrl(elements.backendUrl.value) || DEFAULT_BACKEND;
  const token = elements.authToken.value.trim();

  console.log("🔍 Fetching solution for:", problemSlug);
  console.log("🌐 Backend URL:", backendUrl);
  console.log("🔑 Has token:", !!token);

  if (!elements.solutionContent) {
    console.warn("⚠️ Solution section not available in popup");
    return;
  }

  if (!token) {
    console.info("ℹ️ No JWT token provided; fetching solution from public LeetCode endpoint.");
    setStatus("Fetching solution without JWT token (dashboard features still require auth).");
  }

  try {
    elements.solutionContent.innerHTML = '<div class="loading">Fetching solution...</div>';
    console.log("⏳ Set loading state");

    const endpoint = `${backendUrl}/api/leetcode/solution/${encodeURIComponent(problemSlug)}`;
    console.log("🌐 Calling API:", endpoint);

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Added authorization header");
    }

    console.log("📡 Making fetch request...");
    const response = await fetch(endpoint, {
      method: "GET",
      headers,
    });

    console.log("📊 Response status:", response.status);
    console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log("📦 Response data received");

    if (!response.ok) {
      console.error("❌ API returned error:", data);
      throw new Error(data?.error || data?.message || "Failed to fetch solution");
    }

    console.log("✅ Solution data received, rendering...");
    renderSolution(data);

    if (elements.solutionSection) {
      elements.solutionSection.style.display = "block";
      console.log("✅ Solution section displayed");
    }
  } catch (error) {
    console.error("❌ Solution fetch error:", error);
    elements.solutionContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    if (elements.solutionSection) {
      elements.solutionSection.style.display = "block";
    }
  }
}

/**
 * Render solution data in UI
 */
function renderSolution(data) {
  if (!elements.solutionContent) return;

  const { problem, solutions, stats, codeSnippets } = data;

  let html = '<div class="solution-container">';

  // Problem info
  if (problem) {
    html += `
      <div class="solution-header">
        <h3>${problem.title || "Solution"}</h3>
        <p class="problem-difficulty ${problem.difficulty?.toLowerCase() || ''}">${problem.difficulty || "Unknown"}</p>
      </div>
    `;
  }

  // Statistics
  if (stats) {
    html += `
      <div class="solution-stats">
        <div class="stat-item">
          <span>Accepted</span>
          <strong>${stats.accepted?.toLocaleString?.() || stats.accepted || 0}</strong>
        </div>
        <div class="stat-item">
          <span>Submissions</span>
          <strong>${stats.submissions?.toLocaleString?.() || stats.submissions || 0}</strong>
        </div>
        <div class="stat-item">
          <span>Acceptance Rate</span>
          <strong>${typeof stats.acceptanceRate === 'number' ? stats.acceptanceRate.toFixed(2) + '%' : stats.acceptanceRate || "—"}</strong>
        </div>
      </div>
    `;
  }

  // Problem statement
  if (problem && problem.description) {
    html += `
      <div class="problem-statement">
        <h4>📝 Problem Statement</h4>
        <div class="problem-content">${problem.description}</div>
      </div>
    `;
  }

  // Code snippets for popular languages
  if (codeSnippets && Object.keys(codeSnippets).length > 0) {
    html += '<div class="code-snippets">';
    html += '<h4>💻 Starter Code</h4>';
    Object.entries(codeSnippets).forEach(([key, snippet]) => {
      html += `
        <div class="code-snippet-item">
          <strong>${snippet.language}</strong>
          <pre><code>${escapeHtml(snippet.code)}</code></pre>
        </div>
      `;
    });
    html += '</div>';
  }

  // Solutions list
  if (solutions && solutions.length > 0) {
    html += '<div class="solutions-list">';
    html += '<h4>💡 Solution Approaches</h4>';
    solutions.forEach((solution, index) => {
      html += `
        <div class="solution-item">
          <div class="solution-title">Approach ${index + 1}: ${solution.approach || "Solution"}</div>
          <div class="solution-complexity">
            <span class="complexity"> ⏱️ Time: <strong>${solution.timeComplexity || '—'}</strong></span>
            <span class="complexity">💾 Space: <strong>${solution.spaceComplexity || '—'}</strong></span>
          </div>
          <p class="solution-explanation">${solution.explanation || "No explanation available"}</p>
        </div>
      `;
    });
    html += '</div>';
  } else {
    html += '<p class="no-solution">No solutions available for this problem yet.</p>';
  }

  html += '</div>';
  elements.solutionContent.innerHTML = html;
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Handle LeetCode submission message
 */
function handleLeetCodeSubmission(submission) {
  console.log('📨 Received LeetCode submission:', submission);

  // Update status
  if (submission && submission.title) {
    setStatus(`🎯 Problem submitted: ${submission.title}`);
    console.log('✅ Status updated with problem title');

    // Fetch solution for this problem
    if (submission.slug) {
      console.log('🚀 Starting solution fetch for slug:', submission.slug);
      fetchAndDisplaySolution(submission.slug);
    } else {
      console.error('❌ No slug in submission data');
    }
  } else {
    console.error('❌ Invalid submission data received');
  }
}

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Popup received message:", request.action);
  console.log("📨 Message data:", request.data || 'no data');

  if (request.action === 'submission_received') {
    console.log("✅ Submission notification received");
    handleLeetCodeSubmission(request.data);
  }

  sendResponse({ received: true });
});

/**
 * Check if there's a recent submission when popup opens
 */
async function checkForRecentSubmission() {
  console.log("📡 Checking for recent LeetCode submission...");

  try {
    chrome.runtime.sendMessage(
      { action: 'get_latest_submission' },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Error getting submission:", chrome.runtime.lastError);
          return;
        }

        console.log("📦 Background response:", response);

        if (response?.submission) {
          console.log("✅ Found recent submission:", response.submission.title);
          handleLeetCodeSubmission(response.submission);
        } else {
          console.log("📌 No recent submission found");
        }
      }
    );
  } catch (error) {
    console.error("❌ Error in checkForRecentSubmission:", error);
  }
}

async function init() {
  try {
    console.log("🚀 Popup initialization starting...");
    
    // Load stored settings
    const stored = await getStoredSettings();
    console.log("📋 Settings loaded from storage");
    
    // Populate input fields with stored values
    if (elements.backendUrl) {
      elements.backendUrl.value = stored.backend || DEFAULT_BACKEND;
      console.log("✅ Backend URL field populated");
    }
    if (elements.userId) {
      elements.userId.value = stored.userId || "";
      console.log("✅ User ID field populated");
    }
    if (elements.authToken) {
      elements.authToken.value = stored.token || "";
      console.log("✅ Auth token field populated");
    }
    
  } catch (error) {
    console.error("❌ Error loading settings:", error);
    setStatus("Error loading settings", true);
  }

  // Save button handler
  if (elements.saveUrl) {
    elements.saveUrl.addEventListener("click", async () => {
      try {
        console.log("💾 Save button clicked");
        
        const backend = normalizeUrl(elements.backendUrl.value) || DEFAULT_BACKEND;
        const userId = elements.userId.value.trim();
        const token = elements.authToken.value.trim();
        
        console.log("📝 Saving settings:", { backend, userId, hasTx: !!token });
        await setStoredSettings({ backend, userId, token });
        
        // Show success message
        setStatus("✅ Settings saved successfully!");
        console.log("✅ Settings saved and UI updated");
        
        // Reload dashboard data with new settings
        setTimeout(() => {
          console.log("🔄 Refreshing dashboard data...");
          refreshAll();
        }, 500);
      } catch (error) {
        console.error("❌ Error saving settings:", error);
        setStatus("❌ Error saving settings. Try again.", true);
      }
    });
  }

  if (elements.refresh) {
    elements.refresh.addEventListener("click", () => {
      console.log("🔄 Manual refresh clicked");
      refreshAll();
    });
  }

  if (elements.openDashboard) {
    elements.openDashboard.addEventListener("click", () => {
      console.log("🌐 Opening dashboard");
      chrome.tabs.create({ url: DEFAULT_FRONTEND });
    });
  }

  // Close solution details
  if (elements.closeSolution) {
    elements.closeSolution.addEventListener("click", () => {
      console.log("✕ Closing solution panel");
      if (elements.solutionSection) {
        elements.solutionSection.style.display = "none";
      }
    });
  }

  // Check for recent submission
  console.log("📡 Checking for recent submission...");
  checkForRecentSubmission();

  // Load initial data
  console.log("📊 Loading dashboard data...");
  await refreshAll();
  
  console.log("✅ Popup initialization complete");
}

init().catch((err) => console.error("❌ Initialization error:", err));
