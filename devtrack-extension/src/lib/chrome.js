export const isChromeExtension =
  typeof chrome !== "undefined" && !!chrome?.storage;

export async function chromeStorageGet(defaults) {
  if (!isChromeExtension) return defaults;
  return new Promise((resolve) => {
    chrome.storage.sync.get(defaults, (data) => resolve(data));
  });
}

export async function chromeStorageSet(values) {
  if (!isChromeExtension) return;
  return new Promise((resolve) => {
    chrome.storage.sync.set(values, () => resolve());
  });
}

export async function chromeStorageLocalGet(defaults) {
  if (!isChromeExtension) return defaults;
  return new Promise((resolve) => {
    chrome.storage.local.get(defaults, (data) => resolve(data));
  });
}

export async function chromeStorageLocalSet(values) {
  if (!isChromeExtension) return;
  return new Promise((resolve) => {
    chrome.storage.local.set(values, () => resolve());
  });
}

export async function chromeStorageLocalRemove(keys) {
  if (!isChromeExtension) return;
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, () => resolve());
  });
}

export function openExtensionPage(path) {
  // Absolute web URLs should open as-is instead of being treated as packaged assets.
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  if (typeof chrome !== 'undefined' && chrome?.runtime?.getURL) {
    return chrome.runtime.getURL(normalizedPath);
  }

  return `/${normalizedPath}`;
}

export function openBrowserTab(url) {
  if (typeof chrome !== "undefined" && chrome?.tabs?.create) {
    chrome.tabs.create({ url });
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

export async function sendRuntimeMessage(message) {
  if (typeof chrome === "undefined" || !chrome?.runtime?.sendMessage) {
    throw new Error("Runtime messaging is only available inside the extension.");
  }

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

export function getAssetUrl(path) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  if (typeof chrome !== 'undefined' && chrome?.runtime?.getURL) {
    return chrome.runtime.getURL(normalizedPath);
  }

  return `/${normalizedPath}`;
}
