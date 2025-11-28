import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900 opacity-50 z-0"></div>

      <div className="z-10 text-center px-4">
        <div className="mb-8 animate-bounce">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center text-4xl font-bold shadow-lg shadow-purple-500/50">
            SW
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Stream Wave
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Connect, Share, and Stream. The next generation social platform for creators and communities.
        </p>

        <Link
          to="/signup"
          className="inline-block bg-white text-black font-bold py-4 px-12 rounded-full text-xl hover:bg-gray-200 transition-transform transform hover:scale-105 shadow-xl"
        >
          Get Started
        </Link>
      </div>

      <footer className="absolute bottom-8 text-gray-500 text-sm">
        <p>© 2024 Stream Wave. Built with ❤️ for the future.</p>
      </footer>
    </div>
  );
};

export default Landing;
