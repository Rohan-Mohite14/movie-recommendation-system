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
  const [userId, setUserId] = useState<string | null>(null);


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

  const handleAuth = async (user: { id: string }) => {
  setIsAuthenticated(true);
  setShowWelcome(false);
  setHasSeenWelcome(false);
  setUserId(user.id);

  try {
    const response = await fetch(`http://127.0.0.1:5000/api/watchlist/${user.id}`);
    const data = await response.json();
    if (response.ok) {
      // Map server movie objects to your frontend Movie type
      const formattedMovies: Movie[] = data.map((m: any) => ({
        id: m.movieId, // backend returns movieId
        title: m.title,
        genre: m.genres, // assuming it's an array of genre strings
        plot: '', // placeholder if not returned by backend
        poster: '', // placeholder
        rating: 0,    // placeholder
        year: ''      // placeholder
      }));
      setWishlist(formattedMovies);
    } else {
      console.error("Failed to fetch watchlist:", data.error);
    }
  } catch (err) {
    console.error("Error fetching watchlist:", err);
  }
};



  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const handleWishlist = async (movie: Movie) => {
  if (!userId) {
    console.error("User ID not available.");
    return;
  }

  const isInWishlist = wishlist.some((m) => m.id === movie.id);

  // Optimistically update the UI
  setWishlist((prev) =>
    isInWishlist ? prev.filter((m) => m.id !== movie.id) : [...prev, movie]
  );

  const url = 'http://127.0.0.1:5000/api/watchlist';
  const payload = JSON.stringify({
    user_id: userId,
    movie_id: movie.id
  });

  try {
    const response = await fetch(url, {
      method: isInWishlist ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload
    });

    const result = await response.json();
    if (!response.ok) {
      console.error(`Failed to ${isInWishlist ? 'remove from' : 'add to'} watchlist:`, result.error);
    } else {
      console.log(`Watchlist ${isInWishlist ? 'removal' : 'update'} success:`, result.message);
    }
  } catch (error) {
    console.error("API error:", error);
  }
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
          <Watched watched={watchedMovies} onWishlist={handleWishlist} />
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