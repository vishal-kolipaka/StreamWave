import { useState, useEffect } from 'react';
import api from '../api/axios';
import PostCard from './PostCard';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get(`/posts/feed?page=${page}`);
        if (page === 1) {
          setPosts(res.data.posts);
        } else {
          setPosts(prev => [...prev, ...res.data.posts]);
        }
        setHasMore(res.data.posts.length > 0);
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  if (loading && page === 1) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="w-full">
      {posts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}

      {hasMore && (
        <div className="flex justify-center p-4">
          <button
            onClick={() => setPage(p => p + 1)}
            className="text-blue-500 font-bold text-sm"
          >
            Load More
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center text-gray-500 p-4">
          You've reached the end!
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center text-gray-500 p-8">
          No posts yet. Follow some users to see their posts!
        </div>
      )}
    </div>
  );
};

export default Feed;
