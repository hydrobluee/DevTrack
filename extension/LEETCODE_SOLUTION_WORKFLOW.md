# DevTrack Extension - LeetCode Solution Workflow

## Overview

This document explains the automated workflow that captures LeetCode submissions and displays solutions directly in the DevTrack extension popup.

## Workflow Architecture

```
LeetCode.com (User clicks Submit)
    ↓
content.js (Detects submit button click)
    ↓
Captures problem information (slug, title, difficulty)
    ↓
Sends message → background.js
    ↓
background.js (Stores latest submission & notifies popup)
    ↓
popup.js (Receives notification)
    ↓
Fetches solution from Backend API
    ↓
Backend: /api/leetcode/solution/:slug
    ↓
Returns problem details & statistics
    ↓
Solution displays in popup UI

```

## Components

### 1. **content.js** - LeetCode Page Injector
- **Location:** `extension/content.js`
- **Purpose:** Runs on LeetCode.com pages to detect submit button clicks
- **Key Functions:**
  - `extractProblemInfo()` - Extracts problem title, slug, difficulty from the page
  - `detectSubmitButton()` - Finds and attaches click listeners to all submit buttons
  - `setupMutationObserver()` - Watches for dynamic DOM changes and reattaches listeners
  - Sends `leetcode_submission` messages to background script

### 2. **background.js** - Service Worker
- **Location:** `extension/background.js`
- **Purpose:** Acts as a message hub between content scripts and popup
- **Key Features:**
  - Receives `leetcode_submission` messages from content.js
  - Stores latest submission data
  - Updates extension badge when submission occurs
  - Notifies popup when it opens

### 3. **popup.js** - Extension UI Logic
- **Location:** `extension/popup.js`
- **Purpose:** Manages the popup interface and solution display
- **Key Functions:**
  - `checkForRecentSubmission()` - Queries background for latest submission on popup open
  - `fetchAndDisplaySolution()` - Makes API call to backend to get solution details
  - `renderSolution()` - Formats and displays solution in the UI
  - Listens for real-time submission notifications

### 4. **Backend API Endpoint**
- **Route:** `GET /api/leetcode/solution/:slug`
- **Location:** `backend/routes/leetcodeRoutes.js`
- **Controller:** `backend/controllers/leetcodeController.js`
- **Method:** `getProblemSolution()`
- **Response Format:**
```javascript
{
  success: true,
  problem: {
    id: "1",
    title: "Two Sum",
    titleSlug: "two-sum",
    difficulty: "Easy",
    likes: 1234,
    dislikes: 56,
    categoryTitle: "Array"
  },
  stats: {
    accepted: "98765",
    submissions: "654321",
    acceptanceRate: "15.1%"
  },
  solutions: {
    explanation: "Problem description...",
    topSolutions: []
  }
}
```

## Data Flow

### Step 1: Submission Detection
```
User is on problem page: https://leetcode.com/problems/two-sum/
User clicks "Submit" button
content.js:
  - Detects click event
  - Extracts problem info from DOM/URL
  - Sends message to background.js
```

### Step 2: Message Passing
```
background.js:
  - Receives "leetcode_submission" message
  - Stores submission data in variable
  - Updates extension badge (green dot indicator)
  - Notifies popup (if open)
```

### Step 3: Solution Fetching
```
popup.js:
  - Receives notification or checks on open
  - Calls fetchAndDisplaySolution(problemSlug)
  - Makes API request to backend with JWT token
  - Backend queries LeetCode GraphQL API for problem details
```

### Step 4: Display
```
popup.js:
  - Receives solution data
  - Renders problem info, difficulty, statistics
  - Shows snippet of explanation
  - Displays list of similar solutions
```

## Setup Instructions

### Prerequisites
1. **Backend Running:** Ensure backend server is running on configured URL (default: `http://localhost:3000`)
2. **JWT Token:** User must provide valid JWT token in extension settings
3. **User ID:** Optional, but required for dashboard stats

### Extension Configuration

1. **Install Extension:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/` folder

2. **Configure in Popup:**
   - Open extension popup
   - Enter Backend URL (e.g., `http://localhost:3000`)
   - Enter NASA JWT Token (click in LeetCode input field to get)
   - Click "Save"

### Usage

1. **Navigate to LeetCode:** Go to any LeetCode problem page
2. **Solve Problem:** Write and test your solution
3. **Click Submit:** When you click the "Submit" button:
   - Extension detects the submission
   - Green dot appears on extension icon
4. **Open Extension:** Click the extension icon
   - Solution details automatically load
   - View problem stats and difficulty
   - See acceptance rate and submission count

## File Structure

```
extension/
├── manifest.json              # Extension configuration with permissions
├── content.js                 # LeetCode page content script (NEW)
├── background.js              # Background service worker (NEW)
├── popup.html                 # Main popup UI (UPDATED)
├── popup.js                   # Popup logic (UPDATED)
├── style.css                  # Styles (UPDATED)
└── LEETCODE_SOLUTION_WORKFLOW.md (NEW)
```

## Backend Changes

### New Files/Methods
- `controllers/leetcodeController.js` - Added `getProblemSolution()` method
- `services/leetcodeService.js` - Added `getProblemDetails()` method
- `routes/leetcodeRoutes.js` - Added `/solution/:slug` route

### Permissions Added to Manifest
```json
"permissions": ["storage", "tabs", "scripting"],
"host_permissions": [
  "https://leetcode.com/*",
  ...
],
"content_scripts": [{
  "matches": ["https://leetcode.com/*"],
  "js": ["content.js"],
  "run_at": "document_end"
}]
```

## Security Considerations

1. **Token Storage:** JWT tokens are stored in Chrome's secure sync storage
2. **Content Script:** Only runs on leetcode.com domain
3. **CORS:** Backend handles CORS for extension requests
4. **Message Validation:** Only processes messages from trusted origins

## Troubleshooting

### Solution not loading?
1. Check Backend URL is correct
2. Verify JWT token is valid
3. Check browser console for errors (F12 → Console)
4. Ensure backend is running and `/api/leetcode/solution/:slug` endpoint exists

### Submit button not detected?
1. Check LeetCode page is fully loaded
2. Open DevTools console and check for errors in content.js
3. Verify `content.js` is running (check for "DevTrack LeetCode integration initialized" message)

### Extension not showing?
1. Verify extension is loaded in `chrome://extensions/`
2. Check manifest.json permissions are correct
3. Try reloading extension (click reload icon)

## Future Enhancements

- [ ] Store submission history in local database
- [ ] Show accepted/rejected status
- [ ] Link to official solutions
- [ ] Cache solutions for offline access
- [ ] Show similar problems
- [ ] Suggest solution approaches
- [ ] Integration with code snippets

## Testing Checklist

- [ ] Submit button click triggers content script
- [ ] Problem information is accurately extracted
- [ ] Message reaches background script
- [ ] Popup receives notification
- [ ] Solution API endpoint returns correct data
- [ ] Solution renders properly in UI
- [ ] Badge updates on submission
- [ ] Solution section can be closed
- [ ] Works with multiple submissions
- [ ] Handles errors gracefully
