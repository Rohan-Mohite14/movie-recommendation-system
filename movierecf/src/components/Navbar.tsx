import React from 'react';
import { Home, Search, BookmarkCheck, UserCircle, Film, PlayCircle } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  onSearchToggle: () => void;
  currentPage: string;
  onLogoClick: () => void;
}

export default function Navbar({ onNavigate, onSearchToggle, currentPage, onLogoClick }: NavbarProps) {
  // Navigation items configuration
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'wishlist', icon: BookmarkCheck, label: 'Watchlist' },
    { id: 'watched', icon: PlayCircle, label: 'Watched' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-b from-gray-900 to-gray-900/90 text-white shadow-lg z-50">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Logo and main navigation */}
          <div className="flex items-center">
            {/* Logo and brand name */}
            <button
              onClick={onLogoClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity mr-8"
            >
              <Film className="text-blue-400" size={24} />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                MovieMate
              </h1>
            </button>

            {/* Main navigation items */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => item.id === 'search' ? onSearchToggle() : onNavigate(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                      currentPage === item.id 
                        ? 'bg-gray-800 text-white font-medium' 
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right section: Profile button */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('profile')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                currentPage === 'profile'
                  ? 'bg-gray-800 text-white font-medium'
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <UserCircle size={18} />
              <span className="text-sm font-medium">Profile</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800">
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}