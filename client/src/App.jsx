import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Chat from './pages/Chat';

export const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => { },
  toggleTheme: () => { }
});

// Protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) return null; // Don't redirect while checking
  if (!token) return <Navigate to="/login" replace />;

  return children;
};

// Public routes – redirect authenticated users to home
const PublicRoute = ({ children }) => {
  const { loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) return null; // Don't redirect while checking
  if (token) return <Navigate to="/home" replace />;

  return children;
};

const resolveInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = localStorage.getItem('streamwave-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

function App() {
  const [theme, setTheme] = useState(resolveInitialTheme);

  useEffect(() => {
    localStorage.setItem('streamwave-theme', theme);
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme');
  }, [theme]);

  const themeValue = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }), [theme]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Auth /></PublicRoute>} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/home" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/search" element={<Home />} />
              <Route path="/chat/:userId" element={<Chat />} />
            </Route>

            {/* Catch‑all route */}
            <Route path="*" element={<PublicRoute><Landing /></PublicRoute>} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
