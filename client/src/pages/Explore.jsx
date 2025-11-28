import { useState, useEffect } from 'react';
import { Play, Music, FileText, Grid } from 'lucide-react';
import api from '../api/axios';
import PostCard from '../components/PostCard';

const Explore = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        let endpoint = '/posts/feed'; // Default for 'posts'
        if (activeTab === 'videos') endpoint = '/explore/videos';
        if (activeTab === 'music') endpoint = '/explore/music';
        if (activeTab === 'blog') endpoint = '/explore/blogs';

        const res = await api.get(endpoint);
        setContent(res.data.posts || res.data); // Handle different response structures
      } catch (error) {
        console.error('Fetch explore content failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [activeTab]);

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid },
    { id: 'videos', label: 'Videos', icon: Play },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'blog', label: 'Blog', icon: FileText },
  ];

  return (
    <div className="w-full h-full">
      <div className="sticky top-16 z-10 bg-[var(--app-bg)] border-b border-[var(--border-color)]">
        <div className="flex w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-4 font-bold transition-all border-b-2 ${activeTab === tab.id
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              <span className="text-lg">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-0">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className={activeTab === 'posts' ? 'w-full' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4'}>
            {content.map(item =>
              activeTab === 'posts' ? (
                <PostCard key={item._id} post={item} />
              ) : (
                <div key={item._id} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative group">
                    {item.media?.thumbnail ? (
                      <img src={item.media.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {activeTab === 'music' ? <Music className="w-12 h-12" /> : <Play className="w-12 h-12" />}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <Play className="text-white opacity-0 group-hover:opacity-100 w-12 h-12 drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.title || 'Untitled'}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <img src={item.author.avatarUrl || '/default-avatar.png'} className="w-5 h-5 rounded-full mr-2" />
                      <span>{item.author.username}</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
