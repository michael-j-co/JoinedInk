import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon,
  HeartIcon,
  UserCircleIcon,
  PlusIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-surface-paper shadow-soft border-b border-surface-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-primary-500 font-bold text-xl font-script"
            onClick={closeMenu}
          >
            <HeartIcon className="h-8 w-8 text-accent-rose" />
            <span>JoinedInk</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-text-secondary hover:text-primary-600 transition-colors duration-200"
                >
                  <ViewColumnsIcon className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/create-event"
                  className="flex items-center space-x-1 text-text-secondary hover:text-primary-600 transition-colors duration-200"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Create Event</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="text-sm">{user.name || user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="border border-primary-300 text-primary-600 hover:bg-primary-50 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-text-secondary hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-text-secondary hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-surface-border py-4">
            <div className="flex flex-col space-y-4">
              {user ? (
                <>
                  <div className="px-4 py-2 border-b border-surface-border">
                    <div className="flex items-center space-x-2 text-text-secondary">
                      <UserCircleIcon className="h-6 w-6" />
                      <span className="text-sm font-medium">{user.name || user.email}</span>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 text-text-secondary hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors duration-200"
                    onClick={closeMenu}
                  >
                    <ViewColumnsIcon className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/create-event"
                    className="flex items-center space-x-2 px-4 py-2 text-text-secondary hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors duration-200"
                    onClick={closeMenu}
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Create Event</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left px-4 py-2 text-text-secondary hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-text-secondary hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors duration-200"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="mx-4 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                    onClick={closeMenu}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}; 