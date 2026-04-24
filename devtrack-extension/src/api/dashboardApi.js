const API_BASE = "http://localhost:3000"; // Can be updated for production

/**
 * Parse JWT token payload
 */
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

/**
 * Check if JWT token is expired
 */
function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== "number") return true;
  const expiresAtMs = payload.exp * 1000;
  return Date.now() >= expiresAtMs;
}

/**
 * Get stored session from chrome storage (local storage)
 */
export async function getSession() {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage) {
      console.debug("[DashboardAPI] Chrome storage not available");
      resolve(null);
      return;
    }

    chrome.storage.local.get(["devtrackSession"], (data) => {
      try {
        const session = data.devtrackSession;
        console.debug("[DashboardAPI] Retrieved session from storage:", session ? "exists" : "null");
        
        if (!session || !session.access_token) {
          chrome.storage.local.remove(["devtrackSession"]);
          resolve(null);
          return;
        }

        if (isTokenExpired(session.access_token)) {
          console.debug("[DashboardAPI] Session token expired, clearing");
          chrome.storage.local.remove(["devtrackSession"]);
          resolve(null);
          return;
        }

        resolve(session);
      } catch (err) {
        console.error("[DashboardAPI] Error retrieving session:", err);
        chrome.storage.local.remove(["devtrackSession"]);
        resolve(null);
      }
    });
  });
}

/**
 * Save session to chrome storage (local storage)
 */
export async function saveSession(session) {
  return new Promise((resolve) => {
    if (!session || !session.access_token) {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.remove(["devtrackSession"]);
      }
      console.debug("[DashboardAPI] Session cleared");
      resolve();
      return;
    }

    if (typeof chrome === "undefined" || !chrome.storage) {
      resolve();
      return;
    }

    chrome.storage.local.set({ devtrackSession: session }, () => {
      console.debug("[DashboardAPI] Session saved to storage");
      resolve();
    });
  });
}

/**
 * Clear stored session (local storage)
 */
export async function clearSession() {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage) {
      resolve();
      return;
    }

    chrome.storage.local.remove(["devtrackSession"], () => {
      console.debug("[DashboardAPI] Session removed from storage");
      resolve();
    });
  });
}

/**
 * Logout (alias for clearSession)
 */
export const logout = clearSession;

/**
 * Login with email and password
 */
export async function login(email, password) {
  try {
    console.debug("[DashboardAPI] Attempting login for:", email);
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.debug("[DashboardAPI] Login response status:", response.status);
    console.debug("[DashboardAPI] Login response data:", data);

    if (!response.ok) {
      console.error("[DashboardAPI] Login failed:", data?.error || "Unknown error");
      throw new Error(data?.error || "Login failed");
    }

    // Response already contains user data
    if (!data.user || !data.user.id || !data.access_token) {
      console.error("[DashboardAPI] Invalid login response - missing user or token");
      throw new Error("Invalid login response - missing user data or token");
    }

    const session = {
      access_token: data.access_token,
      user: data.user,
    };

    console.debug("[DashboardAPI] Login successful, saving session");
    await saveSession(session);
    return session;
  } catch (error) {
    console.error("[DashboardAPI] Login error:", error.message);
    throw error;
  }
}

/**
 * Fetch dashboard data - total questions and contest info
 */
export async function getDashboardData() {
  try {
    const session = await getSession();
    console.debug("[DashboardAPI] getDashboardData - session exists:", !!session);
    
    if (!session || !session.user || !session.user.id) {
      console.error("[DashboardAPI] User not authenticated - no session or user ID");
      throw new Error("User not authenticated");
    }

    console.debug("[DashboardAPI] Fetching dashboard data for user:", session.user.id);

    const response = await fetch(`${API_BASE}/api/dashboard/${session.user.id}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    console.debug("[DashboardAPI] Dashboard fetch status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[DashboardAPI] Dashboard fetch failed:", response.status, errorData);
      throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
    }

    const data = await response.json();
    console.debug("[DashboardAPI] Dashboard data received:", data);
    return data;
  } catch (error) {
    console.error("[DashboardAPI] Error fetching dashboard data:", error.message);
    throw error;
  }
}

/**
 * Get total questions data
 */
export async function getTotalQuestions() {
  try {
    console.debug("[DashboardAPI] getTotalQuestions called");
    const data = await getDashboardData();
    const questionsData = data?.total_questions?.questionsData || {};
    
    console.debug("[DashboardAPI] Questions data:", questionsData);
    
    // Extract LeetCode difficulty breakdown
    return {
      easy: questionsData.leetcode_easy || 0,
      medium: questionsData.leetcode_medium || 0,
      hard: questionsData.leetcode_hard || 0,
      total: questionsData.leetcode_total || 0,
    };
  } catch (error) {
    console.error("[DashboardAPI] Error fetching total questions:", error.message);
    return {
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0,
    };
  }
}
