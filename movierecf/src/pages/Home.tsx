import React, { useState, useEffect, useMemo } from 'react';
import MovieCard from '../components/MovieCard';
import { Movie } from '../types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TrendingUp, Sparkles, Star, Film, Clock } from 'lucide-react';

interface HomeProps {
  wishlist: Movie[];
  watched: Movie[]; // ✅ ADD THIS
  onWishlist: (movie: Movie) => void;
  onWatched?: (movie: Movie, rating: number) => void;
  showWelcome: boolean;
  onWelcomeSeen: () => void;
  userId: string | null;  // 

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
  watched: Movie[]; // ✅ ADD THIS LINE
  onWishlist: (movie: Movie) => void;
  onWatched?: (movie: Movie, rating: number) => void;
  userId: string | null;  // 
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

const MovieSection = ({
  title,
  subtitle,
  movies,
  icon,
  wishlist,
  watched, // ✅ ADD THIS
  onWishlist,
  onWatched,
   userId,
}: MovieSectionProps) => (

  <section className="mb-12">
    <SectionHeader icon={icon} title={title} subtitle={subtitle} />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {movies.map((movie:Movie) => (
        <MovieCard
        key={movie.id}
        movie={movie}
        isWishlisted={wishlist.some((m) => m.id === movie.id)}
        isWatched={watched.some((m) => m.id === movie.id)} // ✅
        userId={userId} 
        onWishlist={onWishlist}
        onWatched={onWatched}
        variant="home"
      />

      ))}
    </div>
  </section>
);


export default function Home({ wishlist,watched, onWishlist, showWelcome, onWelcomeSeen,onWatched,userId }: HomeProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [visibleMovies, setVisibleMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
  if (!userId) {
    console.warn('No userId, skipping recommend fetch');
    return;
  }
  console.log("the length is ",recommendedMovies.length);

  const fetchMoviesAndRecommendations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/movies');
      const data = await response.json();
      const formatted = data.map((movie: any) => ({
        ...movie,
        id: String(movie.id),
        poster: 'https://via.placeholder.com/300x400?text=Movie+Poster',
        year: 2024,
        rating: movie.rating || 0,
        genre: movie.genre || [],
      }));

      setAllMovies(formatted);
      setVisibleMovies(formatted.slice(0, ITEMS_PER_PAGE));
      console.log('Fetched all movies');

      const res = await fetch(`http://127.0.0.1:5000/recommend?user_id=${userId}`);
      const ids = await res.json();
      console.log('Recommended IDs:', ids);

      const idList = ids.map((m: any) => String(m.id)); // extract ids
      const matched = formatted.filter((movie: any) =>
        idList.includes(String(movie.id))
      );

      console.log('Matched recommended:', matched);

      setRecommendedMovies(matched);
    } catch (error) {
      console.error('Error in fetchMoviesAndRecommendations:', error);
    }
  };

  fetchMoviesAndRecommendations();
}, [userId]);



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

  const newReleases = useMemo(() => filteredMovies.filter((movie) => movie.year >= 2023), [filteredMovies]);

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

        {recommendedMovies.length > 0 && (
          <MovieSection
            title="Recommended for You"
            subtitle="Movies we think you'll love"
            movies={recommendedMovies}
            icon={Sparkles}
            wishlist={wishlist}
            watched={watched}
            onWishlist={onWishlist}
            onWatched={onWatched}
            userId={userId}
          />
        )}

        {/* Movie Sections */}
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
              watched={watched} // ✅ ADD THIS
              onWishlist={onWishlist}
              onWatched={onWatched}
              userId={userId}
            />

          )}

          {newReleases.length > 0 && (
            <MovieSection
            title="New Releases"
            subtitle="Fresh from the cinema"
            movies={newReleases}
            icon={Sparkles}
            wishlist={wishlist}
            watched={watched} // ✅ ADD THIS
            onWishlist={onWishlist}
            onWatched={onWatched}
            userId={userId}
          />

          )}

          

        </InfiniteScroll>
      </div>
    </div>
  );
}
