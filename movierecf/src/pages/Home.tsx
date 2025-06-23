import React, { useState, useEffect, useMemo } from 'react';
import MovieCard from '../components/MovieCard';
import { Movie } from '../types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TrendingUp, ThumbsUp, Sparkles, Star, Film, Clock, UserCheck } from 'lucide-react';

interface HomeProps {
  wishlist: Movie[];
  onWishlist: (movie: Movie) => void;
  showWelcome: boolean;
  onWelcomeSeen: () => void;
}

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}

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

const SectionHeader = ({ icon: Icon, title, subtitle }: SectionHeaderProps) => (
  <div className="mb-8">
    <div className="flex items-center space-x-2 mb-2">
      <Icon className="text-blue-400" size={24} />
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
    {subtitle && <p className="text-gray-400 ml-9">{subtitle}</p>}
  </div>
);

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
  const [activeCategory, setActiveCategory] = useState('all');
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [visibleMovies, setVisibleMovies] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [likedMovies, setLikedMovies] = useState<Set<string>>(new Set());
  const [dislikedMovies, setDislikedMovies] = useState<Set<string>>(new Set());
  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/movies'); // Replace with your deployed URL if needed
        const data = await response.json();

        const formatted = data.map((movie: any) => ({
          ...movie,
          id: movie.id,
          poster: 'https://via.placeholder.com/300x400?text=Movie+Poster',
          year: 2024,
          rating: movie.rating || 0,
          genre: movie.genre || [],
        }));

        setAllMovies(formatted);
        setVisibleMovies(formatted.slice(0, ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, []);

  const fetchMoreMovies = () => {
    const next = visibleMovies.length + ITEMS_PER_PAGE;
    const more = allMovies.slice(visibleMovies.length, next);

    if (more.length === 0) {
      setHasMore(false);
      return;
    }

    setVisibleMovies((prev) => [...prev, ...more]);
  };

  const filteredMovies = useMemo(() => {
    if (activeCategory === 'all') {
      return visibleMovies;
    }
    return visibleMovies.filter((movie) =>
      movie.genre.map((g) => g.toLowerCase()).includes(activeCategory.toLowerCase())
    );
  }, [visibleMovies, activeCategory]);

  const trendingMovies = useMemo(() => filteredMovies.filter((movie) => movie.rating >= 8.5), [filteredMovies]);

  const recommendedMovies = useMemo(() =>
    filteredMovies.filter((movie) =>
      likedMovies.has(movie.id) ||
      movie.genre.some((g) =>
        filteredMovies
          .filter((m) => likedMovies.has(m.id))
          .some((m) => m.genre.includes(g))
      )
    ), [filteredMovies, likedMovies]
  );

  const personalizedMovies = useMemo(() =>
    filteredMovies.filter((movie) =>
      movie.genre.some((g) =>
        filteredMovies
          .filter((m) => likedMovies.has(m.id))
          .flatMap((m) => m.genre)
          .filter((genre) => genre === g).length >= 2
      ) ||
      (movie.rating >= 8.0 && !likedMovies.has(movie.id))
    ), [filteredMovies, likedMovies]
  );

  const newReleases = useMemo(() => filteredMovies.filter((movie) => movie.year >= 2023), [filteredMovies]);

  const handleLike = (movie: Movie) => {
    setLikedMovies((prev) => {
      const newSet = new Set(prev);
      newSet.add(movie.id);
      return newSet;
    });
    setDislikedMovies((prev) => {
      const newSet = new Set(prev);
      newSet.delete(movie.id);
      return newSet;
    });
  };

  const handleDislike = (movie: Movie) => {
    setDislikedMovies((prev) => {
      const newSet = new Set(prev);
      newSet.add(movie.id);
      return newSet;
    });
    setLikedMovies((prev) => {
      const newSet = new Set(prev);
      newSet.delete(movie.id);
      return newSet;
    });
  };

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'action', name: 'Action' },
    { id: 'drama', name: 'Drama' },
    { id: 'sci-fi', name: 'Sci-Fi' },
    { id: 'adventure', name: 'Adventure' },
  ];

  const quickStats = [
    { icon: Clock, label: 'Watch Time', value: '26 hrs' },
    { icon: Film, label: 'Movies Watched', value: '12' },
    { icon: Star, label: 'Avg Rating', value: '4.8' },
  ];

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        onWelcomeSeen();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, onWelcomeSeen]);

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
        {/* Quick Stats */}
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

        {/* Movie Sections (Infinite Scroll Wrap) */}
        <InfiniteScroll
          dataLength={visibleMovies.length}
          next={fetchMoreMovies}
          hasMore={hasMore}
          loader={<p className="text-white text-center">Loading more movies...</p>}
          endMessage={<p className="text-white text-center">You’ve reached the end!</p>}
        >
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
        </InfiniteScroll>
      </div>
    </div>
  );
}
