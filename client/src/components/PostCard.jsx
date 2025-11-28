import { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes.includes(user?.id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (error) {
      console.error('Like failed', error);
    }
  };

  const renderMedia = () => {
    if (!post.media) return null;

    switch (post.type) {
      case 'image':
        return (
          <img
            src={post.media.url}
            alt={post.title}
            className="w-full h-auto object-cover max-h-[600px]"
          />
        );
      case 'video':
        return (
          <div className="relative w-full aspect-video bg-black">
            <video
              src={post.media.url}
              poster={post.media.thumbnail}
              controls
              className="w-full h-full"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="w-full p-4 bg-gray-100 dark:bg-gray-900 flex items-center">
            <div
              className="w-12 h-12 bg-primary rounded-full flex items-center justify-center cursor-pointer mr-4"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="text-white" /> : <Play className="text-white" />}
            </div>
            <div className="flex-1">
              <div className="h-1 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/3"></div>
              </div>
            </div>
            {/* Hidden audio element for actual playback */}
            <audio src={post.media.url} />
          </div>
        );
      case 'blog':
        return (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{post.caption}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center">
          <Link to={`/profile/${post.author._id}`}>
            <img
              src={post.author.avatarUrl || '/default-avatar.png'}
              alt={post.author.username}
              className="w-8 h-8 rounded-full mr-3 object-cover"
            />
          </Link>
          <Link to={`/profile/${post.author._id}`} className="font-bold text-sm hover:underline">
            {post.author.username}
          </Link>
          <span className="text-gray-500 text-xs ml-2">
            • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
        <button><MoreVertical className="w-5 h-5" /></button>
      </div>

      {/* Media */}
      <div className="w-full overflow-hidden rounded-sm border border-gray-100 dark:border-gray-900">
        {renderMedia()}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center space-x-4 mb-2">
          <button onClick={handleLike}>
            <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button>
            <MessageCircle className="w-6 h-6" />
          </button>
          <button>
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        <div className="font-bold text-sm mb-1">{likeCount} likes</div>

        <div className="text-sm">
          <Link to={`/profile/${post.author._id}`} className="font-bold mr-2 hover:underline">
            {post.author.username}
          </Link>
          <span className="text-gray-800 dark:text-gray-200">{post.caption}</span>
        </div>

        {post.comments && post.comments.length > 0 && (
          <button className="text-gray-500 text-sm mt-1">
            View all {post.comments.length} comments
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
