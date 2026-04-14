export const isChromeExtension = typeof chrome !== 'undefined' && !!chrome?.storage?.sync;

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

export function getAssetUrl(path) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  if (typeof chrome !== 'undefined' && chrome?.runtime?.getURL) {
    return chrome.runtime.getURL(normalizedPath);
  }

  return `/${normalizedPath}`;
}
