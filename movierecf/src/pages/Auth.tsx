import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  onAuth: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

export default function Auth({ onAuth }: AuthProps) {
  // Get initial auth mode from localStorage
  const [isLogin, setIsLogin] = useState(() => {
    const authMode = localStorage.getItem('authMode');
    localStorage.removeItem('authMode'); // Clear it after reading
    return authMode !== 'signup';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.(com|net|org)$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{9,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: ValidationErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address (gmail, yahoo, outlook, or hotmail)';
    }

    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 9 characters with one number and special character';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (rememberMe) {
      // In a real app, you'd use a secure storage method
      localStorage.setItem('rememberedEmail', email);
    }

    setErrors({});
    onAuth();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-gray-400">
            {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Full Name"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="tel"
                  required
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Phone Number"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 bg-gray-700 border ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                placeholder="Email Address"
              />
            </div>
            {errors.email && (
              <div className="flex items-center space-x-1 text-red-400 text-sm">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-2 bg-gray-700 border ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center space-x-1 text-red-400 text-sm">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>
          {isLogin && (
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center space-x-2 text-gray-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-600 bg-gray-700 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Forgot password?
              </a>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:text-blue-300"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}