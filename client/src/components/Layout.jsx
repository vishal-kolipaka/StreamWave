import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SuggestedList from './SuggestedList';
import SearchDrawer from './SearchDrawer';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [lastNonSearchPath, setLastNonSearchPath] = useState('/home');
  const isSearchOpen = location.pathname === '/search';
  const isHomeRoute = location.pathname === '/home';
  const isMessagesRoute = location.pathname.startsWith('/messages');
  const isExploreRoute = location.pathname.startsWith('/explore');

  useEffect(() => {
    if (!isSearchOpen) {
      setLastNonSearchPath(location.pathname);
    }
  }, [isSearchOpen, location.pathname]);

  const handleSearchOpen = () => {
    if (!isSearchOpen) {
      navigate('/search');
    }
  };

  const handleSearchClose = () => {
    navigate(lastNonSearchPath || '/home');
  };

  // Get content classes based on route
  const getContentClasses = () => {
    if (isMessagesRoute) {
      return 'w-full h-[calc(100vh-64px)]';
    }
    return 'w-full';
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)] transition-colors">
      <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />

      <Sidebar
        onSearchClick={handleSearchOpen}
        isSearchActive={isSearchOpen}
      />

      <main
        className={`
          pt-16 
          md:ml-64 
          ${isHomeRoute ? 'xl:mr-80' : ''} 
          min-h-screen
          transition-all duration-300
        `}
      >
        <div className={getContentClasses()}>
          <Outlet />
        </div>
      </main>

      {/* Right sidebar - only for home */}
      {isHomeRoute && (
        <aside className="hidden xl:block fixed right-0 top-16 bottom-0 w-80 border-l border-[var(--border-color)] overflow-y-auto bg-[var(--surface-color)] z-40">
          <div className="h-full">
            <SuggestedList />
          </div>
        </aside>
      )}

      <SearchDrawer isOpen={isSearchOpen} onClose={handleSearchClose} />
    </div>
  );
};

export default Layout;
