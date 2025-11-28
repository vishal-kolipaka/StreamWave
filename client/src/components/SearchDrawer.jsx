import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Search as SearchIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const RECENT_STORAGE_KEY = 'stream-wave-recent-searches';

const SearchDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      if (stored) {
        setRecent(JSON.parse(stored));
      }
    } else {
      setQuery('');
      setResults([]);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/search', {
        params: { q: trimmed }
      });
      setResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
      setError('Unable to search right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClearInput = () => {
    setQuery('');
    setResults([]);
    setError('');
  };

  const persistRecent = (user) => {
    setRecent(prev => {
      const next = [user, ...prev.filter(r => r._id !== user._id)].slice(0, 6);
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleSelectUser = (user) => {
    persistRecent(user);
    navigate(`/chat/${user._id}`);
  };

  const handleClearRecent = () => {
    setRecent([]);
    localStorage.removeItem(RECENT_STORAGE_KEY);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[95] w-full max-w-2xl mx-4">
        <div
          className="relative bg-white/90 dark:bg-gray-950/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/60 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Search</h2>
              <div className="flex items-center bg-white dark:bg-black/40 rounded-full border border-gray-200 dark:border-gray-800 pl-5 pr-2 py-2 shadow-inner">
                <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search users"
                  className="flex-1 bg-transparent focus:outline-none text-base"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClearInput}
                    className="text-gray-400 hover:text-gray-600 px-2 text-lg"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!query.trim() || loading}
                  className="ml-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 font-semibold disabled:opacity-40"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Recent Searches</h3>
                {recent.length > 0 && (
                  <button onClick={handleClearRecent} className="text-sm text-blue-500 font-semibold">
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                {recent.length === 0 && (
                  <p className="text-gray-500 text-sm">Search for users to see them here.</p>
                )}
                {recent.map(user => (
                  <button
                    key={`recent-${user._id}`}
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                  >
                    <img
                      src={user.avatarUrl || '/default-avatar.png'}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user.bio || 'No bio yet'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3">Results</h3>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {!results.length && !loading && (
                  <p className="text-gray-500 text-sm">Type a username and press enter or search.</p>
                )}
                {results.map(user => (
                  <button
                    key={user._id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center gap-4 rounded-2xl px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                  >
                    <img
                      src={user.avatarUrl || '/default-avatar.png'}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-800"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-base">{user.username}</p>
                      <p className="text-sm text-gray-500 truncate">{user.bio || 'No bio yet'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SearchDrawer;
