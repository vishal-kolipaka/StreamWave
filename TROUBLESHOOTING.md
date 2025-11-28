# Troubleshooting: Nothing Loads

## Quick Checklist

### 1. Is the Server Running?
```bash
# In server terminal, you should see:
Server running on port 5000
Connected to MongoDB
```

**If NOT running:**
```bash
cd server
npm start
```

### 2. Check Browser Console (F12)
Look for errors like:
- `Failed to fetch`
- `Network Error`
- `401 Unauthorized`
- `500 Internal Server Error`

### 3. Common Causes & Fixes

#### Server Not Running
**Symptom**: All API calls fail with "Network Error"
**Fix**: Start the server with `npm start`

#### Not Logged In
**Symptom**: 401 errors, redirects to login
**Fix**: Log in again or sign up

#### Database Not Connected
**Symptom**: Server starts but crashes on API calls
**Fix**: Ensure MongoDB is running

#### CORS Issues
**Symptom**: CORS policy errors in console
**Fix**: Server should allow `http://localhost:5173`

#### Port Conflicts
**Symptom**: Server won't start, "Port already in use"
**Fix**: Kill the process or use different port

### 4. Test Server Manually

Open browser and visit:
- `http://localhost:5000/api/posts/feed` - Should return JSON
- If you see JSON data, server is working!

### 5. Clear Everything and Restart

```bash
# 1. Stop server (Ctrl+C)
# 2. Clear browser cache (F12 → Application → Clear site data)
# 3. Restart server
cd server
npm start

# 4. Refresh browser (Ctrl+Shift+R)
```

### 6. Check Network Tab

F12 → Network tab → Refresh page
- Look for failed requests (red)
- Click on them to see error details
- Check status codes (404, 500, etc.)
