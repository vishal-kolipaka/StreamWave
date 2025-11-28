# How to Clear Stale User Data

## The Problem

You're seeing old usernames (vishal, swaran, qwert123) because they're cached in your browser's localStorage from previous sessions. These users don't exist in the current database.

## Where the Cache Is

The app stores data in localStorage:
1. **Recent Searches** - `stream-wave-recent-searches` (in SearchDrawer)
2. **Auth Token** - `token`
3. **Theme** - `streamwave-theme`

## How to Clear the Cache

### Option 1: Clear via Browser DevTools (Recommended)
1. Open your browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** in the left sidebar
4. Click on `http://localhost:5173`
5. Delete these keys:
   - `stream-wave-recent-searches`
   - `token` (this will log you out)
6. Refresh the page

### Option 2: Clear All Site Data
1. Open DevTools (F12)
2. Go to **Application** → **Storage**
3. Click **Clear site data**
4. Refresh the page

### Option 3: Hard Refresh
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

## After Clearing

1. **Restart your backend server** to apply all fixes
2. **Sign up fresh users** or log in with test accounts
3. **Suggested accounts will show only current database users**
4. **Follow button will now work**

## Test Users Available

If you ran the seed script, these users exist:
- Username: `alice`, Password: `password123`
- Username: `bob`, Password: `password123`

## Verify Database

To see what users actually exist in your database:
```bash
cd server
node check_users.js
```

This will show all users currently in MongoDB.
