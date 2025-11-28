import { useState, useEffect } from 'react';
import { Heart, User, MessageCircle } from 'lucide-react';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (error) {
        console.error('Fetch notifications failed', error);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 fill-red-500 text-red-500" />;
      case 'follow': return <User className="w-5 h-5 fill-blue-500 text-blue-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 fill-green-500 text-green-500" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const getMessage = (n) => {
    switch (n.type) {
      case 'like': return 'liked your post.';
      case 'follow': return 'started following you.';
      case 'comment': return 'commented: "Nice!"'; // Simplified
      default: return 'interacted with you.';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      <div className="space-y-4">
        {notifications.map(n => (
          <div key={n._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center">
              <div className="mr-4 relative">
                <img
                  src={n.actorId.avatarUrl || '/default-avatar.png'}
                  alt={n.actorId.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-0.5">
                  {getIcon(n.type)}
                </div>
              </div>
              <div>
                <span className="font-bold mr-1">{n.actorId.username}</span>
                <span className="text-gray-600 dark:text-gray-300">{getMessage(n)}</span>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
            {n.type === 'follow' && (
              <button className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold">
                Follow
              </button>
            )}
            {n.type === 'like' && n.targetId?.media?.thumbnail && (
              <img
                src={n.targetId.media.thumbnail}
                className="w-10 h-10 object-cover rounded"
              />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
