import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-paper border-t border-surface-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <HeartIcon className="h-8 w-8 text-accent-rose" />
              <span className="text-primary-500 font-bold text-xl font-script">JoinedInk</span>
            </div>
            <p className="text-text-secondary mb-4 max-w-md">
              Create & cherish collaborative digital keepsakes. Transform heartfelt messages, 
              photos, and memories into beautiful, personalized digital books.
            </p>
            <p className="text-sm text-text-muted">
              Made with <span className="text-accent-rose">♥</span> for meaningful connections
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-text-tertiary hover:text-primary-600 transition-colors duration-200">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-text-tertiary hover:text-primary-600 transition-colors duration-200">
                  Get Started
                </Link>
              </li>
              <li>
                <a href="#features" className="text-text-tertiary hover:text-primary-600 transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="#examples" className="text-text-tertiary hover:text-primary-600 transition-colors duration-200">
                  Examples
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#help" className="text-text-tertiary hover:text-primary-600 transition-colors duration-200">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#contact" className="text-text-tertiary hover:text-primary-600 transition-colors duration-200">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-text-tertiary hover:text-primary-600 transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-text-tertiary hover:text-primary-600 transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-text-muted text-sm">
              © {new Date().getFullYear()} JoinedInk. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-text-muted hover:text-primary-600 transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-text-muted hover:text-primary-600 transition-colors duration-200">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-text-muted hover:text-primary-600 transition-colors duration-200">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0a10 10 0 100 20 10 10 0 000-20zM7.5 9a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zM10 4.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm4.5-1.5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}; 