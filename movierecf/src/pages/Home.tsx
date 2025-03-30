import React, { useState, useEffect, useMemo } from 'react';
import MovieCard from '../components/MovieCard';
import { Movie } from '../types';
import { TrendingUp, ThumbsUp, Sparkles, Star, Film, Clock, UserCheck } from 'lucide-react';

// Component props interface
interface HomeProps {
  wishlist: Movie[];
  onWishlist: (movie: Movie) => void;
  showWelcome: boolean;
  onWelcomeSeen: () => void;
}

// Section header props interface
interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}

// Movie section props interface
interface MovieSectionProps {
  title: string;
  subtitle: string;
  movies: Movie[];
  icon: React.ElementType;
  wishlist: Movie[];
  onWishlist: (movie: Movie) => void;
  onLike?: (movie: Movie) => void;
  onDislike?: (movie: Movie) => void;
}

// Section header component for consistent styling
const SectionHeader = ({ icon: Icon, title, subtitle }: SectionHeaderProps) => (
  <div className="mb-8">
    <div className="flex items-center space-x-2 mb-2">
      <Icon className="text-blue-400" size={24} />
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
    {subtitle && <p className="text-gray-400 ml-9">{subtitle}</p>}
  </div>
);

// Movie section component
const MovieSection = ({ title, subtitle, movies, icon, wishlist, onWishlist, onLike, onDislike }: MovieSectionProps) => (
  <section className="mb-12">
    <SectionHeader icon={icon} title={title} subtitle={subtitle} />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isWishlisted={wishlist.some((m) => m.id === movie.id)}
          onWishlist={onWishlist}
          onLike={onLike}
          onDislike={onDislike}
        />
      ))}
    </div>
  </section>
);

export default function Home({ wishlist, onWishlist, showWelcome, onWelcomeSeen }: HomeProps) {
  // State management
  const [activeCategory, setActiveCategory] = useState('all');
  const [likedMovies, setLikedMovies] = useState<Set<string>>(new Set());
  const [dislikedMovies, setDislikedMovies] = useState<Set<string>>(new Set());

  // All movies data
  const allMovies: Movie[] = [
    // Action Movies
    {
      id: '1',
      title: 'Inception',
      poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80',
      year: 2010,
      rating: 8.8,
      genre: ['Action', 'Sci-Fi']
    },
    {
      id: '2',
      title: 'The Matrix',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80',
      year: 1999,
      rating: 8.7,
      genre: ['Action', 'Sci-Fi']
    },
    {
      id: '3',
      title: 'Mad Max: Fury Road',
      poster: 'https://images.unsplash.com/photo-1492466245235-0d5b4c2c66d1?auto=format&fit=crop&q=80',
      year: 2015,
      rating: 8.1,
      genre: ['Action', 'Adventure']
    },
    // Drama Movies
    {
      id: '4',
      title: 'The Shawshank Redemption',
      poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&q=80',
      year: 1994,
      rating: 9.3,
      genre: ['Drama']
    },
    {
      id: '5',
      title: 'The Godfather',
      poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80',
      year: 1972,
      rating: 9.2,
      genre: ['Crime', 'Drama']
    },
    {
      id: '6',
      title: 'Oppenheimer',
      poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80',
      year: 2023,
      rating: 8.9,
      genre: ['Biography', 'Drama', 'History']
    },
    // Sci-Fi Movies
    {
      id: '7',
      title: 'Blade Runner 2049',
      poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80',
      year: 2017,
      rating: 8.0,
      genre: ['Sci-Fi', 'Drama']
    },
    {
      id: '8',
      title: 'Interstellar',
      poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80',
      year: 2014,
      rating: 8.6,
      genre: ['Adventure', 'Drama', 'Sci-Fi']
    },
    {
      id: '9',
      title: 'Dune',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80',
      year: 2024,
      rating: 8.5,
      genre: ['Action', 'Adventure', 'Sci-Fi']
    },
    // Adventure Movies
    {
      id: '10',
      title: 'The Lord of the Rings',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80',
      year: 2001,
      rating: 8.8,
      genre: ['Adventure', 'Fantasy']
    },
    {
      id: '11',
      title: 'Avatar: The Way of Water',
      poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80',
      year: 2023,
      rating: 8.0,
      genre: ['Action', 'Adventure', 'Sci-Fi']
    },
    {
      id: '12',
      title: 'Indiana Jones',
      poster: 'https://images.unsplash.com/photo-1492466245235-0d5b4c2c66d1?auto=format&fit=crop&q=80',
      year: 1981,
      rating: 8.4,
      genre: ['Action', 'Adventure']
    }
  ];

  // Filter movies based on active category
  const filteredMovies = useMemo(() => {
    if (activeCategory === 'all') {
      return allMovies;
    }
    return allMovies.filter(movie => 
      movie.genre.map(g => g.toLowerCase()).includes(activeCategory.toLowerCase())
    );
  }, [activeCategory]);

  // Organize movies into sections
  const trendingMovies = useMemo(() => 
    filteredMovies.filter(movie => movie.rating >= 8.5), [filteredMovies]
  );

  const recommendedMovies = useMemo(() => 
    filteredMovies.filter(movie => 
      likedMovies.has(movie.id) || 
      movie.genre.some(g => 
        filteredMovies
          .filter(m => likedMovies.has(m.id))
          .some(m => m.genre.includes(g))
      )
    ), [filteredMovies, likedMovies]
  );

  const personalizedMovies = useMemo(() => 
    filteredMovies.filter(movie => 
      // Movies from genres you've watched most
      movie.genre.some(g => 
        filteredMovies
          .filter(m => likedMovies.has(m.id))
          .flatMap(m => m.genre)
          .filter(genre => genre === g).length >= 2
      ) ||
      // Movies with similar ratings to ones you've liked
      movie.rating >= 8.0 && !likedMovies.has(movie.id)
    ), [filteredMovies, likedMovies]
  );

  const newReleases = useMemo(() => 
    filteredMovies.filter(movie => movie.year >= 2023), [filteredMovies]
  );

  // Welcome message effect
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        onWelcomeSeen();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showWelcome, onWelcomeSeen]);

  // Movie interaction handlers
  const handleLike = (movie: Movie) => {
    setLikedMovies(prev => {
      const newSet = new Set(prev);
      newSet.add(movie.id);
      return newSet;
    });
    setDislikedMovies(prev => {
      const newSet = new Set(prev);
      newSet.delete(movie.id);
      return newSet;
    });
  };

  const handleDislike = (movie: Movie) => {
    setDislikedMovies(prev => {
      const newSet = new Set(prev);
      newSet.add(movie.id);
      return newSet;
    });
    setLikedMovies(prev => {
      const newSet = new Set(prev);
      newSet.delete(movie.id);
      return newSet;
    });
  };

  // Category filters
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'action', name: 'Action' },
    { id: 'drama', name: 'Drama' },
    { id: 'sci-fi', name: 'Sci-Fi' },
    { id: 'adventure', name: 'Adventure' }
  ];

  // Quick stats data
  const quickStats = [
    { icon: Clock, label: 'Watch Time', value: '26 hrs' },
    { icon: Film, label: 'Movies Watched', value: '12' },
    { icon: Star, label: 'Avg Rating', value: '4.8' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90 backdrop-blur-sm">
          <div className="text-center transform animate-fadeIn">
            <h2 className="text-3xl font-bold text-white mb-4">Welcome Back! 👋</h2>
            <p className="text-gray-300">Get ready for your daily dose of entertainment</p>
          </div>
        </div>
      )}

      <div className="max-w-[1800px] mx-auto px-4 pb-8">
        {/* Quick Stats - Moved even closer to navbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="text-blue-400" size={24} />
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Movie Sections */}
        <div className="space-y-12">
          {/* Trending Section */}
          {trendingMovies.length > 0 && (
            <MovieSection
              title="Trending Now"
              subtitle="Most watched movies this week"
              movies={trendingMovies}
              icon={TrendingUp}
              wishlist={wishlist}
              onWishlist={onWishlist}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          )}

          {/* Personalized Recommendations Section */}
          {personalizedMovies.length > 0 && (
            <MovieSection
              title="Personalized For You"
              subtitle="Curated based on your taste and preferences"
              movies={personalizedMovies}
              icon={UserCheck}
              wishlist={wishlist}
              onWishlist={onWishlist}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          )}

          {/* Recommended Section */}
          {recommendedMovies.length > 0 && (
            <MovieSection
              title="Recommended for You"
              subtitle="Based on your watching history"
              movies={recommendedMovies}
              icon={ThumbsUp}
              wishlist={wishlist}
              onWishlist={onWishlist}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          )}

          {/* New Releases Section */}
          {newReleases.length > 0 && (
            <MovieSection
              title="New Releases"
              subtitle="Fresh from the cinema"
              movies={newReleases}
              icon={Sparkles}
              wishlist={wishlist}
              onWishlist={onWishlist}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          )}
        </div>
      </div>
    </div>
  );
}