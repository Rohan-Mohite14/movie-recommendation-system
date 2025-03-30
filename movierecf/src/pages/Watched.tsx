import React from 'react';
import MovieCard from '../components/MovieCard';
import { Movie } from '../types';
import { PlayCircle } from 'lucide-react';

interface WatchedProps {
  watched: Movie[];
  onWishlist: (movie: Movie) => void;
}

interface MoviesByCategory {
  [key: string]: Movie[];
}

export default function Watched({ watched, onWishlist }: WatchedProps) {
  // Group movies by category
  const moviesByCategory = watched.reduce((acc: MoviesByCategory, movie) => {
    movie.genre.forEach(genre => {
      if (!acc[genre]) {
        acc[genre] = [];
      }
      if (!acc[genre].some(m => m.id === movie.id)) {
        acc[genre].push(movie);
      }
    });
    return acc;
  }, {});

  if (watched.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8 text-center">
        <PlayCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Watched Movies Yet</h2>
        <p className="text-gray-400">Start watching movies to build your collection!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
      <h2 className="text-2xl font-bold text-white mb-8">My Watched Movies</h2>
      
      {Object.entries(moviesByCategory).map(([category, movies]) => (
        <div key={category} className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm mr-3">
              {category}
            </span>
            <span className="text-gray-400 text-sm">({movies.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isWishlisted={false}
                onWishlist={onWishlist}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}