(function () {
  if (window.__devtrackLeetCodeContentInstalled) {
    return;
  }

  window.__devtrackLeetCodeContentInstalled = true;

  const ACCEPTED_EVENT = "devtrack:leetcode-accepted";
  const seenSubmissionIds = new Set();

  injectBridgeScript();

  window.addEventListener(ACCEPTED_EVENT, handleAcceptedSubmission);

  function injectBridgeScript() {
    if (document.querySelector('script[data-devtrack-bridge="leetcode"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("page-bridge.js");
    script.dataset.devtrackBridge = "leetcode";
    script.async = false;

    (document.head || document.documentElement).appendChild(script);
    script.addEventListener("load", () => script.remove(), { once: true });
    script.addEventListener("error", () => script.remove(), { once: true });
  }

  async function handleAcceptedSubmission(event) {
    const detail = event.detail || {};
    const submissionId = String(detail.submissionId || "").trim();

    if (!submissionId || seenSubmissionIds.has(submissionId)) {
      return;
    }

    seenSubmissionIds.add(submissionId);
    trimSet(seenSubmissionIds, 50);

    try {
      const response = await sendRuntimeMessage({
        type: "devtrack.leetcode.sync",
        payload: detail,
      });

      if (response?.ok && !response?.skipped) {
        showToast(`Synced ${detail.slug || "solution"} to GitHub.`, "success");
        return;
      }

      if (response?.skipped) {
        return;
      }

      showToast(
        response?.error || "DevTrack could not sync this submission.",
        "error",
      );
    } catch (error) {
      showToast(
        error.message || "DevTrack could not sync this submission.",
        "error",
      );
    }
  }

  function showToast(message, tone) {
    let toast = document.getElementById("devtrack-sync-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "devtrack-sync-toast";
      toast.style.position = "fixed";
      toast.style.top = "24px";
      toast.style.right = "24px";
      toast.style.zIndex = "2147483647";
      toast.style.maxWidth = "320px";
      toast.style.padding = "12px 14px";
      toast.style.borderRadius = "16px";
      toast.style.border = "1px solid rgba(148, 163, 184, 0.18)";
      toast.style.background = "rgba(2, 6, 23, 0.94)";
      toast.style.backdropFilter = "blur(10px)";
      toast.style.boxShadow = "0 20px 45px rgba(2, 6, 23, 0.35)";
      toast.style.color = "#e2e8f0";
      toast.style.fontFamily =
        '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
      toast.style.fontSize = "13px";
      toast.style.lineHeight = "1.5";
      document.documentElement.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.borderColor =
      tone === "success" ? "rgba(16, 185, 129, 0.35)" : "rgba(244, 63, 94, 0.35)";
    toast.style.color = tone === "success" ? "#d1fae5" : "#ffe4e6";

    clearTimeout(toast.__devtrackTimer);
    toast.__devtrackTimer = window.setTimeout(() => {
      toast.remove();
    }, 4200);
  }

  function trimSet(set, maxSize) {
    while (set.size > maxSize) {
      const oldestValue = set.values().next().value;
      set.delete(oldestValue);
    }
  }

  function sendRuntimeMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        const runtimeError = chrome.runtime.lastError;

        if (runtimeError) {
          reject(new Error(runtimeError.message));
          return;
        }

        resolve(response);
      });
    });
  }
})();
