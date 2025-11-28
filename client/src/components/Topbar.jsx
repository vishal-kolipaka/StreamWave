import { useState } from 'react';
import { Menu, Home, Search, Compass, MessageCircle, Plus } from 'lucide-react';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import CreateModal from './CreateModal';

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-color)] bg-[var(--surface-color)]/95 backdrop-blur px-4 md:px-6 h-16 flex items-center justify-between" style={{ backdropFilter: 'blur(12px)' }}>
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-bold text-2xl shrink-0">
            SW
          </div>
          <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap">
            Stream Wave
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Menu Button - Keeping for sidebar access */}
          <button
            onClick={onMenuClick}
            className="md:hidden rounded-full border border-[var(--border-color)] p-2 text-[var(--text-primary)]"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold shadow border border-transparent bg-black text-white hover:bg-black/85 dark:bg-gradient-to-r dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 dark:text-white dark:border-white/20 dark:hover:bg-white/15 transition-all"
            >
              + Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="md:hidden p-2 rounded-full bg-black text-white dark:bg-white dark:text-black"
            >
              <Plus className="w-5 h-5" />
            </button>

            <Link
              to="/notifications"
              className="topbar-icon"
              aria-label="Notifications"
            >
              <FaBell className="w-5 h-5" />
            </Link>

            <Link
              to="/profile"
              className="topbar-profile"
              aria-label="Profile"
            >
              <img
                src={user?.avatarUrl || '/default-avatar.png'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </Link>
          </div>
        </div>
      </header>
      {isCreateOpen && <CreateModal onClose={() => setIsCreateOpen(false)} />}
    </>
  );
};

export default Topbar;
