import React from 'react';
import { Star } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  isWishlisted: boolean;
  onWishlist: (movie: Movie) => void;
  onWatched?: (movie: Movie) => void;
  variant?: 'home' | 'wishlist';
}

export default function MovieCard({
  movie,
  isWishlisted,
  onWishlist,
  onWatched,
  variant = 'home', // default to 'home' if not specified
}: MovieCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
      {/* Movie Poster Image */}
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-white">{movie.title}</h3>
        </div>

        <div className="flex items-center mt-2">
          <Star className="text-yellow-400" size={16} />
          <span className="text-yellow-400 ml-1">{movie.rating || 'N/A'}</span>
          <span className="text-gray-400 ml-2">({movie.year || 'Unknown'})</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {movie.genre.map((g) => (
            <span
              key={g}
              className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Expandable Plot Section */}
        <details className="mt-2 text-sm text-gray-300">
          <summary className="cursor-pointer text-blue-400">View Plot</summary>
          <p className="mt-1">{movie.plot}</p>
        </details>

        {/* Buttons Section */}
        <div className="mt-4 flex justify-between space-x-2">
          {variant === 'wishlist' ? (
            <button
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-full text-sm w-full"
              onClick={() => onWishlist(movie)}
            >
              Remove from Wishlist
            </button>
          ) : (
            <>
              <button
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-full text-sm w-1/2"
                onClick={() => onWishlist(movie)}
              >
                {isWishlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </button>
              <button
                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-full text-sm w-1/2"
                onClick={() => onWatched?.(movie)}
              >
                Mark as Watched
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
