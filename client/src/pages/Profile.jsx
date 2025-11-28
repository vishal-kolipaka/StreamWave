import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Grid, Bookmark, Heart, Clock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Wait for auth to finish loading before deciding what to fetch
        if (authLoading) return;

        setLoading(true);
        setError(null);

        let profileData;
        let profileId;

        if (id) {
          // Fetching another user's profile by ID
          // Try /api/user/:id first, fallback to /api/users/:id
          try {
            const res = await api.get(`/user/${id}`);
            profileData = res.data;
          } catch (err) {
            console.log('Failed to fetch /user/:id, trying /users/:id');
            const res = await api.get(`/users/${id}`);
            profileData = res.data;
          }
          profileId = profileData._id;
        } else {
          // Fetching current user's own profile
          if (!currentUser) {
            setLoading(false);
            return;
          }
          // API Route: GET /api/me (or /api/auth/me)
          // Try /me first, fallback to /auth/me
          try {
            const res = await api.get('/me');
            profileData = res.data.user || res.data;
          } catch (err) {
            console.log('Failed to fetch /me, trying /auth/me');
            const res = await api.get('/auth/me');
            profileData = res.data.user || res.data;
          }
          profileId = profileData._id;
        }

        setProfile(profileData);

        // Fix isFollowing logic
        if (currentUser && profileData.followers) {
          setIsFollowing(profileData.followers.some(f => f._id === currentUser._id || f === currentUser._id));
        } else {
          setIsFollowing(false);
        }

        // Fetch user's posts
        // API Route: GET /api/posts/user/:id
        // Fetch user's posts
        // Try /api/posts/user/:id, fallback to /api/posts/feed filtering
        // Only fetch posts if we successfully got a profileId
        if (profileId) {
          try {
            const postsRes = await api.get(`/posts/user/${profileId}`);
            setPosts(postsRes.data.posts);
          } catch (postsError) {
            console.error('Failed to fetch posts from /posts/user/:id, falling back to feed filter', postsError);
            try {
              const feedRes = await api.get('/posts/feed?limit=100');
              const allPosts = feedRes.data.posts || [];
              setPosts(allPosts.filter(p => (p.author._id === profileId || p.author === profileId)));
            } catch (feedError) {
              console.error('Failed to fetch feed fallback', feedError);
              setPosts([]);
            }
          }
        } else {
          console.error('No profileId found, skipping post fetch');
        }

        setLoading(false);
      } catch (error) {
        console.error('Fetch profile failed', error);
        setError(error.response?.data?.message || 'Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser, authLoading]);

  const handleFollow = async () => {
    if (!currentUser) return; // Prevent crash if not logged in

    try {
      const profileId = profile?._id;
      if (!profileId) return;

      const res = await api.post(`/users/${profileId}/follow`);
      setIsFollowing(res.data.isFollowing);

      // Update follower count locally
      setProfile(prev => {
        if (!prev) return prev;

        const isNowFollowing = res.data.isFollowing;
        let newFollowers = prev.followers || [];

        if (isNowFollowing) {
          // Add current user to followers
          newFollowers = [...newFollowers, currentUser];
        } else {
          // Remove current user from followers
          newFollowers = newFollowers.filter(f => {
            const fId = f._id || f;
            const currentId = currentUser._id || currentUser;
            return fId !== currentId;
          });
        }

        return {
          ...prev,
          followers: newFollowers
        };
      });
    } catch (error) {
      console.error('Follow failed', error);
    }
  };

  if (authLoading) return <div className="text-center py-12">Loading...</div>;
  if (loading) return <div className="text-center py-12">Loading profile...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!profile) return <div className="text-center py-12">Profile not found</div>;

  const isOwnProfile = currentUser?._id === profile._id;

  const tabs = [
    { id: 'posts', icon: Grid, label: 'Posts' },
    { id: 'saved', icon: Bookmark, label: 'Saved' },
    { id: 'liked', icon: Heart, label: 'Liked' },
    { id: 'watch-later', icon: Clock, label: 'Watch Later' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8 p-4">
        <img
          src={profile.avatarUrl || '/default-avatar.png'}
          alt={profile.username}
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mb-4 md:mb-0 border-4 border-gray-100 dark:border-gray-800"
        />

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center mb-4">
            <h1 className="text-2xl font-light mr-4 mb-2 md:mb-0">{profile.username}</h1>
            {isOwnProfile ? (
              <div className="flex space-x-2">
                <button className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold text-sm">Edit Profile</button>
                <button className="p-1.5"><Settings className="w-6 h-6" /></button>
              </div>
            ) : currentUser ? (
              <button
                onClick={handleFollow}
                className={`px-6 py-1.5 rounded-lg font-bold text-sm ${isFollowing
                  ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white'
                  : 'bg-blue-500 text-white'
                  }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            ) : (
              <button
                disabled
                className="px-6 py-1.5 rounded-lg font-bold text-sm bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              >
                Follow
              </button>
            )}
          </div>

          <div className="flex justify-center md:justify-start space-x-8 mb-4">
            <div className="text-center md:text-left">
              <span className="font-bold block md:inline mr-1">{posts.length}</span> posts
            </div>
            <div className="text-center md:text-left">
              <span className="font-bold block md:inline mr-1">{profile.followers?.length || 0}</span> followers
            </div>
            <div className="text-center md:text-left">
              <span className="font-bold block md:inline mr-1">{profile.following?.length || 0}</span> following
            </div>
          </div>

          <div className="text-sm">
            <div className="font-bold">{profile.username}</div>
            <p className="whitespace-pre-wrap">{profile.bio || 'No bio yet.'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-200 dark:border-gray-800 mb-4">
        <div className="flex justify-center space-x-12">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 text-xs font-bold uppercase tracking-widest border-t-2 transition-colors ${activeTab === tab.id
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-gray-400'
                }`}
            >
              <tab.icon className="w-3 h-3 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No posts yet
          </div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="aspect-square bg-gray-100 dark:bg-gray-800 relative group cursor-pointer overflow-hidden">
              {post.media?.url ? (
                post.type === 'video' ? (
                  <video src={post.media.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={post.media.url} alt={post.title} className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Media
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-4 text-white font-bold">
                  <div className="flex items-center"><Heart className="w-5 h-5 mr-1 fill-white" /> {post.likes?.length || 0}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
