import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { GiphyGif } from '../../types';

interface GifPickerProps {
  onSelect: (gif: any) => void;
  onClose: () => void;
}

// Initialize Giphy API - In production, this should come from environment variables
const gf = new GiphyFetch('your-giphy-api-key');

export const GifPicker: React.FC<GifPickerProps> = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load trending GIFs on component mount
  useEffect(() => {
    loadTrendingGifs();
  }, []);

  const loadTrendingGifs = async () => {
    try {
      setLoading(true);
      setError(null);
      // For demo purposes, we'll use placeholder GIFs
      // In production, you would uncomment the Giphy API call below
      // const { data } = await gf.trending({ limit: 20 });
      // setGifs(data);
      
      // Demo GIFs for development
      const demoGifs = [
        {
          id: 'demo1',
          title: 'Happy',
          images: {
            fixed_height: {
              url: 'https://media.giphy.com/media/3oz8xLd9DJq2l2VFtu/giphy.gif',
              width: '320',
              height: '180'
            },
            fixed_width: {
              url: 'https://media.giphy.com/media/3oz8xLd9DJq2l2VFtu/giphy.gif',
              width: '320',
              height: '180'
            }
          }
        },
        {
          id: 'demo2',
          title: 'Celebration',
          images: {
            fixed_height: {
              url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
              width: '320',
              height: '180'
            },
            fixed_width: {
              url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
              width: '320',
              height: '180'
            }
          }
        }
      ];
      setGifs(demoGifs);
    } catch (err) {
      setError('Failed to load trending GIFs');
      console.error('Error loading trending GIFs:', err);
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
      // For demo purposes, we'll filter demo GIFs
      // In production, you would uncomment the Giphy API call below
      // const { data } = await gf.search(query, { limit: 20 });
      // setGifs(data);
      
      // Demo search results
      const demoResults = [
        {
          id: 'search1',
          title: `${query} result 1`,
          images: {
            fixed_height: {
              url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
              width: '320',
              height: '180'
            },
            fixed_width: {
              url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
              width: '320',
              height: '180'
            }
          }
        }
      ];
      setGifs(demoResults);
    } catch (err) {
      setError('Failed to search GIFs');
      console.error('Error searching GIFs:', err);
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
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadTrendingGifs}
                className="mt-2 text-rose-600 hover:text-rose-800"
              >
                Try again
              </button>
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