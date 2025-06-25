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
    // Fetch Watchlist
    const watchlistRes = await fetch(`http://127.0.0.1:5000/api/watchlist/${user.id}`);
    const watchlistData = await watchlistRes.json();
    if (watchlistRes.ok) {
      const formattedWatchlist: Movie[] = watchlistData.map((m: any) => ({
        id: m.movieId,
        title: m.title,
        genre: m.genres,
        plot: '',
        poster: '',
        rating: 0,
        year: ''
      }));
      setWishlist(formattedWatchlist);
    }

    // 🔥 Fetch Watched List
    const watchedRes = await fetch(`http://127.0.0.1:5000/api/watched/get/${user.id}`);
    const watchedData = await watchedRes.json();
    if (watchedRes.ok) {
      const formattedWatched: Movie[] = watchedData.map((m: any) => ({
        id: m.movieId,
        title: m.title,
        genre: m.genres || [],
        plot: [''],
        poster: '',
        rating: 0,
        year: 2024
      }));
      setWatchedMovies(formattedWatched);
    }

  } catch (err) {
    console.error("Error fetching user data:", err);
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



  const handleWatched = async (movie: Movie, rating: number) => {
  if (!userId) {
    console.error("User ID not available.");
    return;
  }

  const sessionId = `${userId}_sess_${Date.now()}`;

  if (rating === 0) {
    // Remove from watched
    try {
      const response = await fetch('http://127.0.0.1:5000/remove_from_watched', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          movie_id: movie.id,
          session_id: sessionId
        })
      });

      const result = await response.json();
      if (response.ok) {
        console.log("❌ Removed from watched:", result.message);
        setWatchedMovies((prev) => prev.filter((m) => m.id !== movie.id));
      } else {
        console.error("Failed to remove from watched:", result.message);
      }
    } catch (error) {
      console.error("API error on watched removal:", error);
    }
    return;
  }

  // Add to watched
  const payload = {
    user_id: userId,
    movie_id: movie.id,
    rating: rating,
    session_id: sessionId
  };

  try {
    const response = await fetch('http://127.0.0.1:5000/api/watched/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok) {
      console.log("✅ Marked as watched:", result.message);
      setWatchedMovies((prev) =>
        prev.some((m) => m.id === movie.id) ? prev : [...prev, movie]
      );
    } else {
      console.error("Failed to mark as watched:", result.error);
    }
  } catch (error) {
    console.error("API error:", error);
  }
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
            watched={watchedMovies} // ✅ Pass this
            wishlist={wishlist} 
            onWishlist={handleWishlist}
            onWatched={handleWatched} 
            showWelcome={!hasSeenWelcome} 
            onWelcomeSeen={() => setHasSeenWelcome(true)} 
          />
        )}
      </div>
    </div>
  );
}

export default App;