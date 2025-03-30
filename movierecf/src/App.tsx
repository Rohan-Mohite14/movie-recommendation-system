import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Watched from './pages/Watched';
import Welcome from './pages/Welcome';
import { Movie } from './types';
import { Search } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<Movie[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle navigation to home and scroll to top
  const handleHomeNavigation = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuth = () => {
    setIsAuthenticated(true);
    setShowWelcome(false);
    setHasSeenWelcome(false);
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const handleWishlist = (movie: Movie) => {
    setWishlist((prev) =>
      prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie]
    );
  };

  const handleWatched = (movie: Movie) => {
    setWatchedMovies((prev) =>
      prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie]
    );
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  if (showWelcome) {
    return <Welcome onGetStarted={handleGetStarted} />;
  }

  if (!isAuthenticated) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar
        onNavigate={setCurrentPage}
        onSearchToggle={handleSearchToggle}
        currentPage={showSearch ? 'search' : currentPage}
        onLogoClick={handleHomeNavigation}
      />
      
      {showSearch && (
        <div 
          ref={searchRef} 
          className="fixed top-16 w-full bg-gray-800 p-4 shadow-lg z-40 transform transition-all duration-300 ease-in-out"
        >
          <div className="max-w-3xl mx-auto relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>
      )}
      
      <div className="pt-16">
        {currentPage === 'profile' && <Profile />}
        {currentPage === 'wishlist' && (
          <Wishlist wishlist={wishlist} onWishlist={handleWishlist} />
        )}
        {currentPage === 'watched' && (
          <Watched watched={watchedMovies} onWishlist={handleWishlist} onWatched={handleWatched} />
        )}
        {currentPage === 'home' && (
          <Home 
            wishlist={wishlist} 
            onWishlist={handleWishlist} 
            showWelcome={!hasSeenWelcome} 
            onWelcomeSeen={() => setHasSeenWelcome(true)} 
          />
        )}
      </div>
    </div>
  );
}

export default App;