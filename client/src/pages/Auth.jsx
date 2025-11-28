import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
        // Use replace:true to prevent back button from returning to login
        navigate('/home', { replace: true });
      } else {
        await signup(formData.username, formData.email, formData.password);
        // After signup, switch to login view and show success message
        setSuccessMessage('Account created successfully! Please log in.');
        setIsLogin(true);
        setFormData({ username: formData.username, email: '', password: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Stream Wave
          </h1>
          <p className="text-gray-500">
            {isLogin ? 'Welcome back!' : 'Join the community'}
          </p>
        </div>

        <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 rounded-md font-bold transition-all ${isLogin ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'
              }`}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-md font-bold transition-all ${!isLogin ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'
              }`}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              name="username"
              required
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">Email (Optional)</label>
              <input
                type="email"
                name="email"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
