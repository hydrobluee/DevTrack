(function () {
  if (window.__devtrackLeetCodeBridgeInstalled) {
    return;
  }

  window.__devtrackLeetCodeBridgeInstalled = true;

  const ACCEPTED_EVENT = "devtrack:leetcode-accepted";
  const pendingSubmissions = new Map();
  const emittedSubmissionIds = new Set();

  patchFetch();
  patchXmlHttpRequest();

  function patchFetch() {
    const originalFetch = window.fetch;

    window.fetch = async function patchedFetch(input, init) {
      const url = getRequestUrl(input);
      const bodyPromise = readRequestBody(input, init);
      const response = await originalFetch.apply(this, arguments);

      handleNetworkEvent(url, await bodyPromise, () => response.clone().json()).catch(
        () => {},
      );

      return response;
    };
  }

  function patchXmlHttpRequest() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function patchedOpen(method, url) {
      this.__devtrackRequestUrl = String(url || "");
      return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function patchedSend(body) {
      const requestUrl = this.__devtrackRequestUrl;

      this.addEventListener(
        "load",
        () => {
          handleNetworkEvent(requestUrl, body, () =>
            Promise.resolve().then(() => JSON.parse(this.responseText)),
          ).catch(() => {});
        },
        { once: true },
      );

      return originalSend.apply(this, arguments);
    };
  }

  async function handleNetworkEvent(rawUrl, requestBody, getResponseJson) {
    const url = toAbsoluteUrl(rawUrl);

    if (!url) {
      return;
    }

    const submitMatch = url.pathname.match(/\/problems\/([^/]+)\/submit\/?$/);

    if (submitMatch) {
      const requestData = await parseBodyToObject(requestBody);
      const responseData = await getSafeResponseJson(getResponseJson);
      const submissionId = String(
        responseData?.submission_id || responseData?.submissionId || "",
      ).trim();

      if (!submissionId) {
        return;
      }

      pendingSubmissions.set(submissionId, {
        submissionId,
        slug: sanitizeSlug(submitMatch[1]),
        code: String(
          requestData?.typed_code ||
            requestData?.code ||
            requestData?.typedCode ||
            "",
        ),
        language: String(
          requestData?.lang || requestData?.language || requestData?.lang_slug || "txt",
        ).toLowerCase(),
      });

      trimMap(pendingSubmissions, 50);
      return;
    }

    const checkMatch = url.pathname.match(/\/submissions\/detail\/([^/]+)\/check\/?$/);

    if (!checkMatch) {
      return;
    }

    const responseData = await getSafeResponseJson(getResponseJson);

    if (!isAcceptedSubmission(responseData)) {
      return;
    }

    const submissionId = String(checkMatch[1]);

    if (emittedSubmissionIds.has(submissionId)) {
      return;
    }

    emittedSubmissionIds.add(submissionId);
    trimSet(emittedSubmissionIds, 50);

    const pending = pendingSubmissions.get(submissionId) || {};

    window.dispatchEvent(
      new CustomEvent(ACCEPTED_EVENT, {
        detail: {
          submissionId,
          slug: pending.slug || getSlugFromLocation(),
          language: pending.language || "txt",
          code: pending.code || "",
          accepted: true,
          statusMessage: responseData?.status_msg || "Accepted",
        },
      }),
    );
  }

  function isAcceptedSubmission(responseData) {
    const statusCode = Number(responseData?.status_code);
    const statusMessage = String(responseData?.status_msg || "").toLowerCase();

    return statusCode === 10 || statusMessage === "accepted";
  }

  function getSlugFromLocation() {
    const match = window.location.pathname.match(/\/problems\/([^/]+)/);
    return sanitizeSlug(match?.[1] || "");
  }

  async function getSafeResponseJson(getResponseJson) {
    try {
      return await getResponseJson();
    } catch (error) {
      return null;
    }
  }

  function getRequestUrl(input) {
    if (typeof input === "string") {
      return input;
    }

    if (input instanceof URL) {
      return input.toString();
    }

    if (typeof Request !== "undefined" && input instanceof Request) {
      return input.url;
    }

    return "";
  }

  function toAbsoluteUrl(value) {
    if (!value) return null;

    try {
      return new URL(value, window.location.origin);
    } catch (error) {
      return null;
    }
  }

  async function readRequestBody(input, init) {
    if (init && "body" in init) {
      return init.body;
    }

    if (typeof Request !== "undefined" && input instanceof Request) {
      try {
        return await input.clone().text();
      } catch (error) {
        return "";
      }
    }

    return "";
  }

  async function parseBodyToObject(body) {
    if (!body) {
      return {};
    }

    if (typeof body === "string") {
      return parseTextBody(body);
    }

    if (body instanceof FormData) {
      return Object.fromEntries(body.entries());
    }

    if (body instanceof URLSearchParams) {
      return Object.fromEntries(body.entries());
    }

    if (body instanceof Blob) {
      return parseTextBody(await body.text());
    }

    if (typeof body === "object") {
      return body;
    }

    return {};
  }

  function parseTextBody(text) {
    const trimmed = String(text || "").trim();

    if (!trimmed) {
      return {};
    }

    try {
      return JSON.parse(trimmed);
    } catch (error) {
      try {
        return Object.fromEntries(new URLSearchParams(trimmed).entries());
      } catch (nestedError) {
        return {};
      }
    }
  }

  function sanitizeSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "");
  }

  function trimMap(map, maxSize) {
    while (map.size > maxSize) {
      const oldestKey = map.keys().next().value;
      map.delete(oldestKey);
    }
  }

  function trimSet(set, maxSize) {
    while (set.size > maxSize) {
      const oldestValue = set.values().next().value;
      set.delete(oldestValue);
    }
  }
})();
