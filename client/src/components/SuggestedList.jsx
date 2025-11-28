import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SuggestedList = () => {
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // In a real app, this would fetch from an endpoint like /users/suggested
    const fetchSuggestions = async () => {
      try {
        const response = await api.get('/users/search?q=a'); // Simple hack to get some users
        // Ensure we map the data correctly if backend returns different structure
        const usersData = response.data.map(user => ({
          ...user,
          username: user.username || user.name || user.displayName || user._id || 'User'
        }));
        setUsers(usersData.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch suggestions', error);
      }
    };

    fetchSuggestions();
  }, []);

  const handleFollow = async (userId) => {
    if (!currentUser) {
      console.log('Must be logged in to follow');
      return;
    }

    try {
      const res = await api.post(`/users/${userId}/follow`);

      // Update the user's follow status in the list
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId
            ? { ...user, isFollowing: res.data.isFollowing }
            : user
        )
      );
    } catch (error) {
      console.error('Follow failed:', error);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gray-500 font-bold text-sm">Suggested for you</h2>
        <button className="text-xs font-bold text-black dark:text-white">See All</button>
      </div>

      <div className="space-y-3">
        {users.map(user => (
          <div key={user._id} className="flex items-center justify-between">
            <Link to={`/profile/${user._id}`} className="flex items-center">
              <img
                src={user.avatarUrl || '/default-avatar.png'}
                alt={user.username}
                className="w-8 h-8 rounded-full mr-3 object-cover"
              />
              <div>
                <div className="font-bold text-sm hover:underline">{user.username}</div>
                <div className="text-xs text-gray-500">Suggested for you</div>
              </div>
            </Link>
            <button
              onClick={() => handleFollow(user._id)}
              className="text-xs font-bold text-blue-500 hover:text-blue-700"
            >
              {user.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs text-gray-400">
        © 2024 STREAM WAVE FROM DEEPMIND
      </div>
    </div>
  );
};

export default SuggestedList;
