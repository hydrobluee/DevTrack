# Quick Start Guide - LeetCode Solution Automation

## What Was Built

A complete workflow that automatically captures LeetCode submissions and displays solutions in your DevTrack extension.

## How It Works (In 30 Seconds)

1. You visit a LeetCode problem
2. Submit your solution
3. Extension detects the click and captures problem info
4. Extension displays the problem's solution details in its popup

## Quick Setup

### Step 1: Reload Extension
1. Go to `chrome://extensions/`
2. Find "DevTrack Companion"
3. Click the reload icon (↻)

### Step 2: Configure Backend
1. Click the DevTrack icon in your Chrome toolbar
2. Enter:
   - **Backend URL:** `http://localhost:3000` (or your backend server)
   - **JWT Token:** Your authentication token
3. Click "Save"

### Step 3: Test It
1. Go to [LeetCode](https://leetcode.com)
2. Pick any problem
3. Click "Submit" button
4. Look at your extension popup - it should show the solution!

## Files Changed/Created

### Extension Files (New)
- ✅ `extension/content.js` - Detects LeetCode submission button
- ✅ `extension/background.js` - Handles message passing
- ✅ `extension/LEETCODE_SOLUTION_WORKFLOW.md` - Full documentation

### Extension Files (Updated)
- ✅ `extension/manifest.json` - Added permissions & content scripts
- ✅ `extension/popup.js` - Added solution display logic
- ✅ `extension/popup.html` - Added solution UI section
- ✅ `extension/style.css` - Added solution styling

### Backend Files (Updated)
- ✅ `backend/controllers/leetcodeController.js` - Added `getProblemSolution()` method
- ✅ `backend/services/leetcodeService.js` - Added `getProblemDetails()` method
- ✅ `backend/routes/leetcodeRoutes.js` - Added `/solution/:slug` route

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    LEETCODE.COM                             │
│  (User submits solution)                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────┐
│ CONTENT.JS (Runs on LeetCode)    │
│ • Detects submit button click    │
│ • Extracts problem info          │
│ • Sends to background.js         │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│ BACKGROUND.JS (Service Worker)   │
│ • Receives submission message    │
│ • Stores latest submission       │
│ • Updates extension badge        │
├──────────────┬───────────────────┤
│              │                   │
└──────────────┼──────────────────────────────────────────────┘
               │
   ┌───────────┴──────────────┐
   ↓                          ↓
┌──────────────────────────────────────┐
│ POPUP.JS (Extension Popup)           │
│ • Detects submission notification   │
│ • Calls backend API                 │
│ • Displays solution to user         │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│ BACKEND API                          │
│ GET /api/leetcode/solution/:slug     │
├──────────────────────────────────────┤
│ • Fetches problem details            │
│ • Gets statistics                    │
│ • Returns solution data              │
└────────────────────────────────────┘
```

## Key Features

✨ **Automatic Detection** - No manual action needed, just submit!
🎯 **Problem Capture** - Gets title, difficulty, ID instantly
📊 **Statistics** - Shows acceptance rate, likes, dislikes
🔐 **Secure** - Uses JWT tokens, only works on leetcode.com
⚡ **Fast** - Real-time updates, no page refresh needed
🎨 **Beautiful UI** - Integrated solution display in popup

## Workflow Steps

### On Submission
1. User clicks "Submit" on LeetCode
2. `content.js` detects the click
3. Problem info is extracted from the page
4. Message sent to `background.js`

### On Extension Open
1. Popup opens and checks `background.js` for latest submission
2. If exists, calls backend API with problem slug
3. Backend queries LeetCode GraphQL for problem details
4. Solution data returned and rendered in popup

### Display
- Problem title and difficulty badge
- Acceptance statistics
- Problem category
- Solution explanation
- Code snippet preview
- Link to full solution

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Solution not showing | Check backend URL and JWT token in settings |
| Submit button not detected | Reload extension (chrome://extensions) |
| Backend error | Ensure backend is running on configured port |
| No problem info captured | Open DevTools (F12) and check console for errors |

## Next Steps

After testing:
1. Verify backend API is working: `GET http://localhost:3000/api/leetcode/solution/two-sum`
2. Test with multiple problems to ensure reliability
3. Check Chrome DevTools console for any errors
4. Refer to full documentation in `extension/LEETCODE_SOLUTION_WORKFLOW.md`

## Need Help?

- Check `extension/LEETCODE_SOLUTION_WORKFLOW.md` for detailed documentation
- Review console errors (F12 → Console)
- Ensure backend is running and reachable
- Verify JWT token is valid

---

**Setup Time:** ~2 minutes
**First Test:** Immediate after configuration
