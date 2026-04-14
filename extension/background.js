/**
 * Background Service Worker for DevTrack Extension
 * Handles communication between content scripts and popup
 */

// Store the latest submission data
let latestSubmission = null;

// Load from persistent storage when service worker starts
chrome.storage.local.get(['devtrackLatestSubmission'], (result) => {
  if (result && result.devtrackLatestSubmission) {
    latestSubmission = result.devtrackLatestSubmission;
    console.log('📦 Restored latest submission from storage:', latestSubmission);
    updateBadge(latestSubmission);
  } else {
    console.log('📦 No stored submission on startup');
  }
});

/**
 * Listen for messages from content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request.action, request.data || '');
  console.log('📨 Sender info:', sender.tab ? `Tab ${sender.tab.id}: ${sender.tab.title}` : 'Extension context');

  if (request.action === 'leetcode_submission') {
    // Store the submission data
    latestSubmission = {
      ...request.data,
      tabId: sender.tab.id,
      tabTitle: sender.tab.title
    };

    console.log('✅ LeetCode submission stored:', latestSubmission);
    updateBadge(latestSubmission);

    // Persist so service worker reload does not lose data
    chrome.storage.local.set({ devtrackLatestSubmission: latestSubmission }, () => {
      if (chrome.runtime.lastError) {
        console.error('❌ Failed to persist latest submission:', chrome.runtime.lastError);
      } else {
        console.log('💾 Latest submission persisted to storage');
      }
    });

    // Notify all listeners (popup, etc.) about the new submission
    try {
      chrome.runtime.sendMessage(
        {
          action: 'submission_received',
          data: latestSubmission
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.debug('📌 Popup not open (expected):', chrome.runtime.lastError.message);
          } else {
            console.log('✅ Popup notified about submission');
          }
        }
      );
    } catch (error) {
      console.error('❌ Error notifying popup:', error);
    }

    sendResponse({ success: true, message: 'Submission recorded' });
  }

  if (request.action === 'get_latest_submission') {
    if (!latestSubmission) {
      console.log('📦 No runtime submission; loading from storage');
      chrome.storage.local.get(['devtrackLatestSubmission'], (result) => {
        latestSubmission = result?.devtrackLatestSubmission || null;
        console.log('📦 Loaded from storage:', latestSubmission);
        sendResponse({ submission: latestSubmission });
      });
      return true;
    }

    console.log('📨 Returning latest submission:', 'exists');
    sendResponse({ submission: latestSubmission });
  }

  if (request.action === 'clear_submission') {
    console.log('🗑️ Clearing latest submission');
    latestSubmission = null;
    updateBadge(null);

    chrome.storage.local.remove(['devtrackLatestSubmission'], () => {
      if (chrome.runtime.lastError) {
        console.error('❌ Failed to remove persisted submission:', chrome.runtime.lastError);
      } else {
        console.log('🗑️ Persisted submission cleared');
      }
    });

    sendResponse({ success: true });
  }

  return true; // Keep the channel open for asynchronous response
});

/**
 * Handle badge updates
 */
function updateBadge(submission) {
  if (submission) {
    chrome.action.setBadgeText({ text: '●' });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    console.log('🟢 Badge updated (green dot)');
  } else {
    chrome.action.setBadgeText({ text: '' });
    console.log('⚪ Badge cleared');
  }
}

/*
 * Listen to active tab changes
 * Keep the latest LeetCode submission available until explicitly cleared.
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (!tab.url.includes('leetcode.com')) {
      console.log('📌 Tab changed away from LeetCode, keeping submission for popup retrieval');
    }
  });
});

console.log('✅ DevTrack background service worker initialized');
