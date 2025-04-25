import React, { useState } from 'react';
import { Mail, Lock, User, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

interface AuthProps {
  onAuth: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
}

export default function Auth({ onAuth }: AuthProps) {
  const [isLogin, setIsLogin] = useState(() => {
    const authMode = localStorage.getItem('authMode');
    localStorage.removeItem('authMode');
    return authMode !== 'signup';
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  // const validateEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail)\.(com|net|org)$/.test(email);
  // const validatePassword = (password: string) => /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{9,}$/.test(password);
  // const validatePhone = (phone: string) => /^\d{10,15}$/.test(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: ValidationErrors = {};

    // if (!validateEmail(email)) newErrors.email = 'Invalid email format.';
    // if (!validatePassword(password)) newErrors.password = 'Password must be at least 9 chars with one number and special character.';
    // if (!isLogin && !name.trim()) newErrors.name = 'Full name is required.';
    // if (!isLogin && !validatePhone(phone)) newErrors.phone = 'Phone must be 10 to 15 digits.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const payload = isLogin
        ? { email, password }
        : { name, email, phone, password };

      const response = await axios.post(`http://127.0.0.1:5000${endpoint}`, payload);

      setMessage(response.data.message);
      setErrors({});
      onAuth(); // or redirect / store token
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'An error occurred.');
    }
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Full Name"
                />
              </div>
              {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Phone Number"
                />
              </div>
              {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
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
                } rounded-lg text-white`}
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
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-2 bg-gray-700 border ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white`}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
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
                  className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700"
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
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        {message && (
          <p className="text-center text-sm text-yellow-400 mt-4">{message}</p>
        )}
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
