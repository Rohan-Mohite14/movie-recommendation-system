import React from 'react';
import { Mail, Phone, Users, LogOut, Trash2 } from 'lucide-react';
import { User } from '../types';

export default function Profile() {
  const user: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 890',
    connections: 42,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80'
  };

  const handleSignOut = () => {
    localStorage.removeItem('rememberedEmail');
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      handleSignOut();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="flex flex-col items-center">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-32 h-32 rounded-full object-cover"
          />
          <h2 className="mt-4 text-2xl font-bold text-white">{user.name}</h2>
          
          <div className="mt-6 w-full space-y-4">
            <div className="flex items-center text-gray-300">
              <Mail className="w-5 h-5 mr-3" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Phone className="w-5 h-5 mr-3" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Users className="w-5 h-5 mr-3" />
              <span>{user.connections} Connections</span>
            </div>
          </div>

          <div className="mt-8 w-full border-t border-gray-700 pt-8">
            <div className="space-y-4">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
              
              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={20} />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}