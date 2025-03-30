import React, { useState, useEffect } from 'react';
import { Film, Play, Star, Clapperboard, Tv, Award, ArrowRight, Heart, Popcorn, Sparkles, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

interface WelcomeProps {
  onGetStarted: () => void;
}

function Welcome({ onGetStarted }: WelcomeProps) {
  const [showContent, setShowContent] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [activeGenre, setActiveGenre] = useState(0);

  const genres = [
    { name: "Action", count: "2,500+" },
    { name: "Drama", count: "3,000+" },
    { name: "Comedy", count: "2,000+" },
    { name: "Sci-Fi", count: "1,500+" }
  ];

  const features = [
    {
      icon: Film,
      title: "Endless Entertainment",
      description: "Access to 10,000+ movies across all genres"
    },
    {
      icon: Star,
      title: "Smart Recommendations",
      description: "AI-powered suggestions based on your taste"
    },
    {
      icon: Tv,
      title: "Exclusive Content",
      description: "Early access to premieres and special features"
    },
    {
      icon: Award,
      title: "Curated Collections",
      description: "Hand-picked selections by film experts"
    }
  ];

  const stats = [
    { icon: Film, value: "10K+", label: "Movies" },
    { icon: Heart, value: "50K+", label: "Happy Users" },
    { icon: Star, value: "4.9", label: "User Rating" },
    { icon: Popcorn, value: "24/7", label: "Entertainment" }
  ];

  useEffect(() => {
    setShowContent(true);
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      setIsInView(scrollPosition > viewportHeight * 0.2);
    };

    window.addEventListener('scroll', handleScroll);
    const genreInterval = setInterval(() => {
      setActiveGenre((prev) => (prev + 1) % genres.length);
    }, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(genreInterval);
    };
  }, []);

  const handleAuthClick = (isSignUp: boolean) => {
    localStorage.setItem('authMode', isSignUp ? 'signup' : 'login');
    onGetStarted();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Film className="text-blue-400" size={24} />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                MovieMate
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleAuthClick(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => handleAuthClick(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute transition-all duration-1000"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: showContent ? 0.1 : 0,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            <Clapperboard size={24} className="text-white" />
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-12">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center mb-6">
              <div className={`transform transition-all duration-1000 hover:scale-110 ${
                showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              }`}>
                <Play size={48} className="text-blue-400" />
              </div>
            </div>
            <div className="relative">
              <Sparkles className="absolute -top-8 -left-4 text-yellow-400 animate-pulse" size={24} />
              <h1 className={`text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-400 to-white bg-clip-text text-transparent transform transition-all duration-1000 hover:scale-105 ${
                showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                Your Movie Journey Starts Here
              </h1>
              <Sparkles className="absolute -bottom-4 -right-4 text-yellow-400 animate-pulse" size={24} />
            </div>
            <p className={`text-xl text-gray-300 mb-8 max-w-2xl mx-auto transform transition-all duration-1000 delay-300 hover:text-white ${
              showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              Join millions of movie lovers and discover your next cinematic obsession. 
              Personalized recommendations, exclusive content, and a community that shares your passion.
            </p>
          </div>

          {/* Genre Showcase */}
          <div className="mb-16">
            <div className="flex justify-center space-x-8">
              {genres.map((genre, index) => (
                <div
                  key={index}
                  className={`transform transition-all duration-500 ${
                    activeGenre === index 
                      ? 'scale-110 text-blue-400' 
                      : 'scale-100 text-gray-400'
                  }`}
                >
                  <p className="text-lg font-semibold">{genre.name}</p>
                  <p className="text-sm">{genre.count} Movies</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`group bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 transform transition-all duration-500 hover:scale-105 hover:bg-gray-800/70 ${
                    isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="mb-4 text-blue-400 transform transition-all duration-300 group-hover:scale-110 group-hover:text-blue-300">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center transform transition-all duration-500 hover:scale-105"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Icon className="mx-auto mb-2 text-blue-400" size={32} />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className={`text-center transform transition-all duration-1000 delay-700 ${
            showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-full overflow-hidden transition-all duration-300 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <span className="relative z-10 flex items-center">
                Start Your Journey
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
            <p className="mt-4 text-gray-400">
              Join for free • Cancel anytime • No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Background with Parallax Effect */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 transform transition-transform duration-1000"
          style={{
            transform: `translateY(${isInView ? '-5%' : '0'})`,
            filter: 'blur(3px)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-gray-900/70"></div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 backdrop-blur-lg border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-400">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Facebook size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Twitter size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Instagram size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Mail size={24} />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2024 MovieMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Welcome;