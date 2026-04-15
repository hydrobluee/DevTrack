const STORAGE_KEYS = {
  githubConfig: "devtrackGithubConfig",
  githubSyncStatus: "devtrackGithubSyncStatus",
};

const GITHUB_API_BASE = "https://api.github.com";
const syncedSubmissionKeys = new Set();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message?.type) {
    return false;
  }

  if (message.type === "devtrack.github.connect") {
    handleGithubConnect(message.payload)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error.message || "GitHub setup failed.",
        });
      });

    return true;
  }

  if (message.type === "devtrack.github.disconnect") {
    handleGithubDisconnect()
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error.message || "GitHub disconnect failed.",
        });
      });

    return true;
  }

  if (message.type === "devtrack.leetcode.sync") {
    handleLeetCodeSync(message.payload)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error.message || "LeetCode sync failed.",
        });
      });

    return true;
  }

  return false;
});

async function handleGithubConnect(payload = {}) {
  const stored = await storageLocalGet({
    [STORAGE_KEYS.githubConfig]: null,
  });

  const previousConfig = stored[STORAGE_KEYS.githubConfig];
  const token = String(payload.token || previousConfig?.token || "").trim();
  const repoUrl = String(payload.repoUrl || previousConfig?.repoUrl || "").trim();

  if (!token) {
    throw new Error("Add a GitHub personal access token to continue.");
  }

  const parsedRepo = parseGitHubRepo(repoUrl);

  if (!parsedRepo) {
    throw new Error(
      "Use a valid GitHub repository link like https://github.com/owner/repo.",
    );
  }

  const repoData = await githubRequest(
    `/repos/${parsedRepo.owner}/${parsedRepo.repo}`,
    token,
  );

  const branch = String(
    payload.branch || previousConfig?.branch || repoData.default_branch || "",
  ).trim();

  if (!branch) {
    throw new Error("A repository branch could not be determined.");
  }

  await githubRequest(
    `/repos/${parsedRepo.owner}/${parsedRepo.repo}/branches/${encodeURIComponent(
      branch,
    )}`,
    token,
  );

  const now = new Date().toISOString();
  const config = {
    token,
    hasToken: true,
    repoOwner: parsedRepo.owner,
    repoName: parsedRepo.repo,
    repoFullName: `${parsedRepo.owner}/${parsedRepo.repo}`,
    repoUrl: `https://github.com/${parsedRepo.owner}/${parsedRepo.repo}`,
    branch,
    connectedAt: previousConfig?.connectedAt || now,
    updatedAt: now,
  };

  const status = {
    state: "connected",
    message: `Connected to ${config.repoFullName} on ${branch}.`,
    updatedAt: now,
    repoFullName: config.repoFullName,
  };

  await storageLocalSet({
    [STORAGE_KEYS.githubConfig]: config,
    [STORAGE_KEYS.githubSyncStatus]: status,
  });

  return {
    ok: true,
    message: `Connected to ${config.repoFullName}.`,
    config: sanitizeGithubConfig(config),
    status,
  };
}

async function handleGithubDisconnect() {
  const now = new Date().toISOString();
  const status = {
    state: "idle",
    message: "GitHub connection removed.",
    updatedAt: now,
  };

  await storageLocalRemove([STORAGE_KEYS.githubConfig]);
  await storageLocalSet({
    [STORAGE_KEYS.githubSyncStatus]: status,
  });

  return {
    ok: true,
    status,
  };
}

async function handleLeetCodeSync(payload = {}) {
  const stored = await storageLocalGet({
    [STORAGE_KEYS.githubConfig]: null,
  });

  const config = stored[STORAGE_KEYS.githubConfig];

  if (!config?.token || !config?.repoOwner || !config?.repoName) {
    const status = {
      state: "error",
      message: "Connect GitHub in DevTrack before syncing LeetCode submissions.",
      updatedAt: new Date().toISOString(),
    };

    await storageLocalSet({
      [STORAGE_KEYS.githubSyncStatus]: status,
    });

    return {
      ok: false,
      needsSetup: true,
      error: "Connect GitHub in the extension before syncing solutions.",
    };
  }

  const normalized = normalizeSubmissionPayload(payload);

  if (!normalized.slug) {
    throw new Error("The LeetCode problem slug could not be detected.");
  }

  if (!normalized.code) {
    throw new Error("No solution code was captured from the LeetCode submission.");
  }

  const syncKey =
    normalized.submissionId || `${normalized.slug}:${normalized.language}`;

  if (syncedSubmissionKeys.has(syncKey)) {
    return {
      ok: true,
      skipped: true,
      message: "This accepted submission was already synced.",
    };
  }

  const filePath = buildSolutionPath(normalized.slug, normalized.language);
  const existingFile = await getExistingFile(
    config.repoOwner,
    config.repoName,
    filePath,
    config.branch,
    config.token,
  );

  const commitMessage = `${
    existingFile ? "Update" : "Add"
  } LeetCode solution: ${normalized.slug}`;

  const result = await githubRequest(
    `/repos/${config.repoOwner}/${config.repoName}/contents/${encodeGitHubPath(
      filePath,
    )}`,
    config.token,
    {
      method: "PUT",
      body: JSON.stringify({
        message: commitMessage,
        content: encodeBase64(normalized.code),
        branch: config.branch,
        sha: existingFile?.sha,
      }),
    },
  );

  syncedSubmissionKeys.add(syncKey);
  trimSyncedSubmissionKeys();

  const status = {
    state: "success",
    message: `Synced ${normalized.slug} to ${config.repoFullName}.`,
    updatedAt: new Date().toISOString(),
    repoFullName: config.repoFullName,
    filePath,
    commitUrl: result?.commit?.html_url || null,
    problemSlug: normalized.slug,
  };

  await storageLocalSet({
    [STORAGE_KEYS.githubSyncStatus]: status,
  });

  return {
    ok: true,
    status,
    filePath,
    commitUrl: status.commitUrl,
  };
}

async function getExistingFile(owner, repo, path, branch, token) {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeGitHubPath(
      path,
    )}?ref=${encodeURIComponent(branch)}`,
    {
      headers: buildGitHubHeaders(token),
    },
  );

  if (response.status === 404) {
    return null;
  }

  const data = await readGitHubResponse(response);

  if (!response.ok) {
    throw new Error(getGitHubErrorMessage(data, response.status));
  }

  return data;
}

async function githubRequest(path, token, init = {}) {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...init,
    headers: {
      ...buildGitHubHeaders(token),
      ...(init.headers || {}),
    },
  });

  const data = await readGitHubResponse(response);

  if (!response.ok) {
    throw new Error(getGitHubErrorMessage(data, response.status));
  }

  return data;
}

function buildGitHubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function readGitHubResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getGitHubErrorMessage(data, status) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (status === 401 || status === 403) {
    return "GitHub rejected the token. Check that it has repository access.";
  }

  if (status === 404) {
    return "The repository or branch could not be found with this token.";
  }

  return "GitHub returned an unexpected response.";
}

function parseGitHubRepo(input) {
  const trimmed = String(input || "").trim().replace(/\.git$/, "");

  if (!trimmed) return null;

  const directMatch = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);

  if (directMatch) {
    return {
      owner: directMatch[1],
      repo: directMatch[2],
    };
  }

  const sshMatch = trimmed.match(/^git@github\.com:([\w.-]+)\/([\w.-]+)$/);

  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2],
    };
  }

  try {
    const url = new URL(trimmed);

    if (url.hostname !== "github.com") {
      return null;
    }

    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/, ""),
    };
  } catch (error) {
    return null;
  }
}

function sanitizeGithubConfig(config) {
  if (!config) return null;

  return {
    hasToken: Boolean(config.token),
    repoOwner: config.repoOwner,
    repoName: config.repoName,
    repoFullName: config.repoFullName,
    repoUrl: config.repoUrl,
    branch: config.branch,
    connectedAt: config.connectedAt,
    updatedAt: config.updatedAt,
  };
}

function normalizeSubmissionPayload(payload) {
  const rawLanguage = String(payload.language || payload.lang || "txt").trim();

  return {
    submissionId: payload.submissionId ? String(payload.submissionId) : "",
    slug: sanitizeSlug(payload.slug || payload.problemSlug || ""),
    language: rawLanguage.toLowerCase(),
    code: String(payload.code || payload.typedCode || "")
      .replace(/\r\n/g, "\n")
      .trimEnd(),
  };
}

function sanitizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function buildSolutionPath(slug, language) {
  const extension = getLanguageExtension(language);
  return `leetcode/${slug}/solution.${extension}`;
}

function getLanguageExtension(language) {
  const extensions = {
    c: "c",
    cpp: "cpp",
    csharp: "cs",
    dart: "dart",
    elixir: "ex",
    erlang: "erl",
    golang: "go",
    java: "java",
    javascript: "js",
    kotlin: "kt",
    mysql: "sql",
    mssql: "sql",
    oraclesql: "sql",
    pandas: "py",
    php: "php",
    postgresql: "sql",
    python: "py",
    python3: "py",
    racket: "rkt",
    ruby: "rb",
    rust: "rs",
    scala: "scala",
    swift: "swift",
    typescript: "ts",
  };

  return extensions[language] || "txt";
}

function encodeGitHubPath(path) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function trimSyncedSubmissionKeys() {
  if (syncedSubmissionKeys.size <= 200) {
    return;
  }

  const keys = Array.from(syncedSubmissionKeys);
  const keysToRemove = keys.slice(0, keys.length - 200);

  for (const key of keysToRemove) {
    syncedSubmissionKeys.delete(key);
  }
}

function storageLocalGet(defaults) {
  return new Promise((resolve) => {
    chrome.storage.local.get(defaults, (data) => resolve(data));
  });
}

function storageLocalSet(values) {
  return new Promise((resolve) => {
    chrome.storage.local.set(values, () => resolve());
  });
}

function storageLocalRemove(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, () => resolve());
  });
}
