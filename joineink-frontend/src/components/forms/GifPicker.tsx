import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { GiphyGif } from '../../types';
import { ContentLoadingSpinner } from '../common/LoadingSpinner';

interface GifPickerProps {
  onSelect: (gif: any) => void;
  onClose: () => void;
}

// Initialize Giphy API with API key from environment variables
const GIPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY;

if (!GIPHY_API_KEY) {
  console.warn('REACT_APP_GIPHY_API_KEY not found in environment variables. Please create .env file with your API key.');
  if (process.env.NODE_ENV !== 'production') {
    console.log('Current environment variables:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
  }
}

// Temporary fallback while setting up environment variables
const gf = new GiphyFetch(GIPHY_API_KEY || 'JS3p0tCqIKKtM8QmZ8HBa2gBszG1mAiS');

export const GifPicker: React.FC<GifPickerProps> = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load trending GIFs on component mount
  useEffect(() => {
    loadTrendingGifs();
  }, []);

  // Debounced search when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchGifs(searchTerm);
      } else {
        loadTrendingGifs();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadTrendingGifs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try Giphy SDK first
      try {
        const { data } = await gf.trending({ limit: 20 });
        setGifs(data);
        return;
      } catch (sdkError) {
        console.warn('Giphy SDK failed, trying direct API call:', sdkError);
        
        // Fallback to direct API call with proper URL encoding
        const apiKey = GIPHY_API_KEY || 'JS3p0tCqIKKtM8QmZ8HBa2gBszG1mAiS';
        const response = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${encodeURIComponent(apiKey)}&limit=20&rating=g`);
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          } else if (response.status === 403) {
            throw new Error('API key is invalid or expired.');
          } else {
            throw new Error(`API error: ${response.status}`);
          }
        }
        
        const result = await response.json();
        setGifs(result.data || []);
        return;
      }
    } catch (err: any) {
      console.error('Error loading trending GIFs:', err);
      
      // Set specific error message
      if (err.message.includes('Rate limit')) {
        setError('Rate limit exceeded. Please try again later.');
      } else if (err.message.includes('API key')) {
        setError('API key issue. Please check your configuration.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Failed to load trending GIFs. Using demo content instead.');
      }
      
      // Fallback to demo GIFs
      const fallbackGifs = [
        {
          id: 'fallback1',
          title: 'Happy',
          images: {
            fixed_height: {
              url: 'https://media.giphy.com/media/3oz8xLd9DJq2l2VFtu/giphy.gif',
              width: '320',
              height: '180'
            }
          }
        },
        {
          id: 'fallback2',
          title: 'Celebration',
          images: {
            fixed_height: {
              url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
              width: '320',
              height: '180'
            }
          }
        },
        {
          id: 'fallback3',
          title: 'Excited',
          images: {
            fixed_height: {
              url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
              width: '320',
              height: '180'
            }
          }
        },
        {
          id: 'fallback4',
          title: 'Dancing',
          images: {
            fixed_height: {
              url: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
              width: '320',
              height: '180'
            }
          }
        }
      ];
      setGifs(fallbackGifs);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      loadTrendingGifs();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Try Giphy SDK first
      try {
        const { data } = await gf.search(query, { limit: 20 });
        setGifs(data);
        return;
      } catch (sdkError) {
        console.warn('Giphy SDK search failed, trying direct API call:', sdkError);
        
        // Fallback to direct API call with proper URL encoding (as per Giphy docs)
        const apiKey = GIPHY_API_KEY || 'JS3p0tCqIKKtM8QmZ8HBa2gBszG1mAiS';
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(apiKey)}&q=${encodedQuery}&limit=20&rating=g`);
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          } else if (response.status === 403) {
            throw new Error('API key is invalid or expired.');
          } else {
            throw new Error(`API error: ${response.status}`);
          }
        }
        
        const result = await response.json();
        setGifs(result.data || []);
        return;
      }
    } catch (err: any) {
      console.error('Error searching GIFs:', err);
      
      // Set specific error message
      if (err.message.includes('Rate limit')) {
        setError('Rate limit exceeded. Please try again later.');
      } else if (err.message.includes('API key')) {
        setError('API key issue. Please check your configuration.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Failed to search GIFs. Showing demo results instead.');
      }
      
      // Fallback to demo search results based on query
      const demoSearchResults = [
        {
          id: `search-${query}-1`,
          title: `${query} demo result`,
          images: {
            fixed_height: {
              url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
              width: '320',
              height: '180'
            }
          }
        }
      ];
      setGifs(demoSearchResults);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchGifs(searchTerm);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add a GIF</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for GIFs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </form>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-96">
          {loading && (
            <ContentLoadingSpinner message="Loading GIFs..." />
          )}

          {error && gifs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-sm text-gray-500 mb-4">
                Please check your internet connection or try again later.
              </p>
              <button
                onClick={() => searchTerm ? searchGifs(searchTerm) : loadTrendingGifs()}
                className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {error && gifs.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ {error} Showing demo content instead.
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                  {searchTerm ? `Search results for "${searchTerm}"` : 'Trending GIFs'}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {gifs.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => onSelect(gif)}
                    className="relative group rounded-lg overflow-hidden hover:ring-2 hover:ring-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <img
                      src={gif.images.fixed_height.url}
                      alt={gif.title}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity"></div>
                  </button>
                ))}
              </div>

              {gifs.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No GIFs found for your search' : 'No trending GIFs available'}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Powered by GIPHY
          </p>
        </div>
      </div>
    </div>
  );
}; 