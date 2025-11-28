# User Discovery Flow - How It Works

## The Complete Flow

### 1. **User Signup** ✅
When a user signs up:
- User data is saved to MongoDB
- User gets a JWT token
- User is automatically logged in

**Backend**: `POST /api/auth/signup`
- Creates user in database
- Returns token + user data

### 2. **Suggested Accounts** ✅
The suggested accounts feature:
- Fetches users from `/api/users/search?q=a`
- Shows up to 5 random users
- Displays: username, avatar, bio

**How it works**:
- Searches for users whose username contains "a"
- This is a simple hack to get some users
- In production, this would be a proper recommendation algorithm

### 3. **View Profile** ✅
When clicking on a suggested user:
- Navigates to `/profile/:userId`
- Fetches user data from `/api/users/:id`
- Displays: avatar, bio, posts, follower count

### 4. **Follow User** ✅
When clicking "Follow":
- Sends `POST /api/users/:id/follow`
- Updates follower/following arrays
- Updates UI optimistically

## Current Database State

The database currently has **2 test users**:
1. **alice** (password: password123)
2. **bob** (password: password123)

## How to Test the Full Flow

### Step 1: Sign Up New Users
1. Go to `/signup`
2. Create accounts:
   - Username: `charlie`, Password: `password123`
   - Username: `diana`, Password: `password123`
   - Username: `evan`, Password: `password123`

### Step 2: Verify Suggested Accounts
1. Log in as any user
2. Check the "Suggested for you" section
3. You should see other users (alice, bob, charlie, diana, evan)

### Step 3: View Other Profiles
1. Click on a suggested user
2. Their profile should load with:
   - Avatar
   - Bio
   - Posts (if any)
   - Follower/Following counts

### Step 4: Follow Users
1. Click "Follow" button
2. Button should change to "Following"
3. Follower count should increase

## Why Profiles Might Not Be Found

### Possible Reasons:
1. **User doesn't exist** - The user ID is from an old database state
2. **Database was cleared** - Previous users were deleted
3. **Server not restarted** - Old code is still running
4. **Wrong user ID** - Clicking on an invalid link

### Solutions:
1. **Check database** - Run `node check_users.js` to see all users
2. **Restart server** - Apply the latest fixes
3. **Sign up fresh users** - Create new accounts to test with
4. **Clear browser cache** - Remove stale data

## API Endpoints Reference

### Auth
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/me` - Get current user data

### Users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/search?q=query` - Search users
- `POST /api/users/:id/follow` - Follow/unfollow user

### Posts
- `GET /api/posts/feed` - Get all posts
- `GET /api/posts/user/:id` - Get posts by user
- `POST /api/posts` - Create new post
