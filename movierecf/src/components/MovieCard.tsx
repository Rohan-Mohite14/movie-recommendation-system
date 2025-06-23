import React from 'react';
import { Star, BookmarkPlus, BookmarkCheck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  isWishlisted: boolean;
  onWishlist: (movie: Movie) => void;
  onLike?: (movie: Movie) => void;
  onDislike?: (movie: Movie) => void;
}

export default function MovieCard({ movie, isWishlisted, onWishlist, onLike, onDislike }: MovieCardProps) {
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
          <button
              onClick={() => onWishlist(movie)}
              className="text-blue-400 hover:text-blue-300"
          >
            {isWishlisted ? <BookmarkCheck size={20}/> : <BookmarkPlus size={20}/>}
          </button>
        </div>

        <div className="flex items-center mt-2">
          <Star className="text-yellow-400" size={16}/>
          <span className="text-yellow-400 ml-1">{movie.rating || 'N/A'}</span>
          <span className="text-gray-400 ml-2">({movie.year || 'Unknown'})</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {movie.genre.map((g) => (
              <span key={g} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
        {g}
      </span>
          ))}
        </div>

        {/* Expandable Plot Section */}
        <details className="mt-2 text-sm text-gray-300">
          <summary className="cursor-pointer text-blue-400">View Plot</summary>
          <p className="mt-1">{movie.plot}</p>
        </details>

        {/* Watchlist/Watched Buttons */}
        <div className="mt-4 flex justify-between space-x-2">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-full text-sm w-1/2">
            Add to Watchlist
          </button>
          <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-full text-sm w-1/2">
            Mark as Watched
          </button>
        </div>

        <div className="mt-4 flex justify-center space-x-4">
          <button onClick={() => onLike?.(movie)}
                  className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-green-400">
            <ThumbsUp size={20}/>
          </button>
          <button onClick={() => onDislike?.(movie)}
                  className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-red-400">
            <ThumbsDown size={20}/>
          </button>
        </div>
      </div>

    </div>
  );
}