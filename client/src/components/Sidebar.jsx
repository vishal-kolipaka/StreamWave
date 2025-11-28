import { Home, Search, Compass, MessageCircle, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ onSearchClick, isSearchActive }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const primaryItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', action: onSearchClick },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
  ];

  return (
    <div
      className="hidden md:flex flex-col w-64 fixed left-0 top-16 bottom-0 border-r border-[var(--border-color)] px-6 py-8 z-40 overflow-y-auto"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <div className="mb-10">
        <div className="text-[1.85rem] font-bold tracking-wide text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text">
          💎 Wave Deck
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {primaryItems.map((item, index) => {
          const Icon = item.icon;
          const active = item.path ? isActive(item.path) : isSearchActive;
          const content = (
            <>
              <Icon className="w-5 h-5" />
              <span className="sidebar-text">{item.label}</span>
            </>
          );

          if (item.path) {
            return (
              <Link
                key={index}
                to={item.path}
                className={`sidebar-link ${active ? 'active' : ''}`}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={item.action}
              className={`sidebar-link text-left ${active ? 'active' : ''}`}
            >
              {content}
            </button>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-[var(--border-color)]">
        <Link
          to="/settings"
          className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}
        >
          <Settings className="w-5 h-5" />
          <span className="sidebar-text">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
