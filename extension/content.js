/**
 * Content Script for LeetCode Integration
 * Detects submit button clicks and captures problem information
 */

let currentProblemInfo = null;

/**
 * Extract problem information from the page
 */
function extractProblemInfo() {
  try {
    // Get the problem slug from the URL
    const urlMatch = window.location.pathname.match(/\/problems\/([a-z0-9-]+)/);
    if (!urlMatch) {
      console.log('❌ No problem slug found in URL:', window.location.pathname);
      return null;
    }

    const slug = urlMatch[1];
    console.log('✅ Extracted problem slug:', slug);

    // Try to get problem title from the page title or DOM
    let title = document.title.split('|')[0].trim();
    if (!title || title.includes('LeetCode')) {
      const titleElement = document.querySelector('[class*="Title"]');
      if (titleElement) {
        title = titleElement.textContent.trim();
      }
    }

    console.log('✅ Extracted problem title:', title);

    // Get problem difficulty
    let difficulty = 'Unknown';
    const difficultyElement = document.querySelector('[class*="difficulty"]');
    if (difficultyElement) {
      difficulty = difficultyElement.textContent.trim();
    }

    // Get problem number/ID from page if available
    let problemId = null;
    const idMatch = title.match(/^(\d+)\./);
    if (idMatch) {
      problemId = idMatch[1];
    }

    const problemInfo = {
      slug,
      title,
      difficulty,
      problemId,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Full problem info extracted:', problemInfo);
    return problemInfo;
  } catch (error) {
    console.error('❌ Error extracting problem info:', error);
    return null;
  }
}

/**
 * Detect and handle submit button clicks
 */
function detectSubmitButton() {
  // Find all candidate click targets for LeetCode submit action
  const candidates = document.querySelectorAll('button, [role="button"], a[role="button"]');
  console.log('🔍 Found', candidates.length, 'candidate elements for submit detection');

  function isSubmitTarget(element) {
    if (!element || !element.textContent) return false;
    const text = element.textContent.trim().toLowerCase();

    const isSubmit = (
      text === 'submit' ||
      text.includes('submit') ||
      element.dataset.testid === 'submit-code-btn' ||
      element.dataset.testid === 'submit-btn' ||
      element.dataset.testid === 'run-code-btn'
    );

    if (isSubmit) {
      console.log('✅ Found submit target:', element.textContent.trim(), element.dataset.testid || 'no-testid');
    }

    return isSubmit;
  }

  function attachListener(target) {
    if (!target || target.dataset.devtrackListener) return;
    target.dataset.devtrackListener = 'true';
    console.log('🎯 Attached listener to:', target.textContent.trim());

    target.addEventListener('click', () => {
      console.log('🖱️ Submit button clicked!');
      const problemInfo = extractProblemInfo();
      if (!problemInfo) {
        console.error('❌ No problem info extracted');
        return;
      }

      currentProblemInfo = problemInfo;

      chrome.runtime.sendMessage(
        {
          action: 'leetcode_submission',
          data: problemInfo
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('❌ Message send error:', chrome.runtime.lastError);
          } else {
            console.log('✅ Problem info sent to background:', problemInfo);
          }
        }
      );
    });
  }

  candidates.forEach((el) => {
    if (isSubmitTarget(el)) {
      attachListener(el);
    }
  });

  // Also add a capture-phase global listener to catch non-button clicks (e.g. divs with role="button")
  if (!document.body.dataset.devtrackCaptureAttached) {
    document.body.dataset.devtrackCaptureAttached = 'true';
    console.log('🎣 Attached global capture listener');

    document.body.addEventListener('click', (event) => {
      let target = event.target;

      while (target && target !== document.body) {
        if (isSubmitTarget(target)) {
          console.log('🎣 Global capture caught submit click!');
          const problemInfo = extractProblemInfo();
          if (!problemInfo) return;

          currentProblemInfo = problemInfo;

          chrome.runtime.sendMessage(
            {
              action: 'leetcode_submission',
              data: problemInfo
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error('❌ Global capture message send error:', chrome.runtime.lastError);
              } else {
                console.log('✅ Problem info sent from global capture:', problemInfo);
              }
            }
          );
          return;
        }

        target = target.parentElement;
      }
    }, true);
  }
}

/**
 * Monitor for dynamic content changes and reattach listeners
 */
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    let hasNewButtons = false;

    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const buttons = node.querySelectorAll?.('button, a[role="button"]');
            if (buttons?.length) {
              hasNewButtons = true;
            }
          }
        });
      }
    });

    if (hasNewButtons) {
      detectSubmitButton();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
  });
}

/**
 * Initialize the content script
 */
function initialize() {
  console.log('DevTrack LeetCode integration initializing...');

  try {
    // Initial detection
    detectSubmitButton();
    console.log('✅ Initial submit button detection completed');
  } catch (error) {
    console.error('❌ Error in initial detection:', error);
  }

  try {
    // Setup mutation observer for dynamic content
    setupMutationObserver();
    console.log('✅ Mutation observer setup completed');
  } catch (error) {
    console.error('❌ Error setting up mutation observer:', error);
  }

  // Re-detect every 2 seconds as a fallback
  setInterval(() => {
    try {
      detectSubmitButton();
    } catch (error) {
      console.error('❌ Error in periodic detection:', error);
    }
  }, 2000);

  console.log('✅ DevTrack LeetCode integration fully initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
  console.log('📌 Waiting for DOMContentLoaded...');
} else {
  initialize();
  console.log('📌 DOM already loaded, initializing...');
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'get_current_problem') {
      sendResponse({ problem: currentProblemInfo });
    }
  } catch (error) {
    console.error('❌ Error in message listener:', error);
    sendResponse({ error: error.message });
  }
});
