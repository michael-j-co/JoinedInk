import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { StickerCategory } from '../../types';

interface StickerPickerProps {
  onSelect: (sticker: any) => void;
  onClose: () => void;
}

// Demo sticker data - In production, this would come from a backend API or CDN
const STICKER_CATEGORIES: StickerCategory[] = [
  {
    id: 'hearts',
    name: 'Hearts & Love',
    stickers: [
      {
        id: 'heart1',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDU2TDI3LjIgNTAuNEMxMC44IDM1LjIgMCAyNSAwIDE2QzAgNy4yIDcuMiAwIDE2IDBDMjEuNiAwIDI2LjggMi44IDMyIDcuMkMzNy4yIDIuOCA0Mi40IDAgNDggMEM1Ni44IDAgNjQgNy4yIDY0IDE2QzY0IDI1IDUzLjIgMzUuMiAzNi44IDUwLjRMMzIgNTZaIiBmaWxsPSIjRkY2B0I5Ii8+Cjwvc3ZnPgo=',
        alt: 'Pink Heart',
        keywords: ['love', 'heart', 'pink', 'romance']
      },
      {
        id: 'heart2',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDU2TDI3LjIgNTAuNEMxMC44IDM1LjIgMCAyNSAwIDE2QzAgNy4yIDcuMiAwIDE2IDBDMjEuNiAwIDI2LjggMi44IDMyIDcuMkMzNy4yIDIuOCA0Mi40IDAgNDggMEM1Ni44IDAgNjQgNy4yIDY0IDE2QzY0IDI1IDUzLjIgMzUuMiAzNi44IDUwLjRMMzIgNTZaIiBmaWxsPSIjRkY0ODQ0Ii8+Cjwvc3ZnPgo=',
        alt: 'Red Heart',
        keywords: ['love', 'heart', 'red', 'romance']
      }
    ]
  },
  {
    id: 'celebration',
    name: 'Celebration',
    stickers: [
      {
        id: 'star1',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhMMzYuNCAyMC40TDQ4IDI0TDM2LjQgMjcuNkwzMiA0MEwyNy42IDI3LjZMMTYgMjRMMjcuNiAyMC40TDMyIDhaIiBmaWxsPSIjRkZEQjAwIi8+Cjwvc3ZnPgo=',
        alt: 'Gold Star',
        keywords: ['star', 'celebration', 'achievement', 'gold']
      },
      {
        id: 'party1',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDEyTDI4IDI0TDQwIDI4TDI4IDMyTDI0IDQ0TDIwIDMyTDggMjhMMjAgMjRMMjQgMTJaIiBmaWxsPSIjRkY2QjlEIi8+CjxwYXRoIGQ9Ik00OCA4TDUwIDEyTDU0IDE0TDUwIDE2TDQ4IDIwTDQ2IDE2TDQyIDE0TDQ2IDEyTDQ4IDhaIiBmaWxsPSIjRkZEQjAwIi8+CjxwYXRoIGQ9Ik00OCA0OEw1MCA1Mkw1NCA1NEw1MCA1Nkw0OCA2MEw0NiA1Nkw0MiA1NEw0NiA1Mkw0OCA0OFoiIGZpbGw9IiNGRkRCMDAiLz4KPC9zdmc+Cg==',
        alt: 'Party Sparkles',
        keywords: ['party', 'sparkles', 'celebration', 'fun']
      }
    ]
  },
  {
    id: 'nature',
    name: 'Nature',
    stickers: [
      {
        id: 'flower1',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iOCIgZmlsbD0iI0ZGNjlCNCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjMyIiByPSI4IiBmaWxsPSIjRkY2OUI0Ii8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iNDAiIHI9IjgiIGZpbGw9IiNGRjY5QjQiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIzMiIgcj0iOCIgZmlsbD0iI0ZGNjlCNCIvPgo8Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSI2IiBmaWxsPSIjRkZEQjAwIi8+Cjwvc3ZnPgo=',
        alt: 'Pink Flower',
        keywords: ['flower', 'nature', 'pink', 'bloom']
      },
      {
        id: 'leaf1',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQwIDhDNDggMTIgNTIgMjAgNTIgMzJDNTIgNDQgNDggNTIgNDAgNTZDMzIgNTJDMjQgNDggMTYgNDAINCMzMkMxNiAyNCAyNCA2IDMyIDhDMzYgOCAzOCA4IDQwIDhaIiBmaWxsPSIjMTBCOTgxIi8+CjxwYXRoIGQ9Ik0yNCAzMkMzMiAzMiA0MCAzMiA0OCAzMiIgc3Ryb2tlPSIjMDU5NjY5IiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==',
        alt: 'Green Leaf',
        keywords: ['leaf', 'nature', 'green', 'plant']
      }
    ]
  },
  {
    id: 'emojis',
    name: 'Emotions',
    stickers: [
      {
        id: 'smile1',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiNGRkRCMDAiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iNCIgZmlsbD0iIzM3NDE1MSIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjI0IiByPSI0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yMCA0MEMyNCA0NCAyOCA0NiAzMiA0NkMzNiA0NiA0MCA0NCA0NCA0MCIgc3Ryb2tlPSIjMzc0MTUxIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K',
        alt: 'Happy Face',
        keywords: ['happy', 'smile', 'emotion', 'joy']
      },
      {
        id: 'wink1',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiNGRkRCMDAiLz4KPHBhdGggZD0iTTIwIDI0TDI4IDI0IiBzdHJva2U9IiMzNzQxNTEiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMjQiIHI9IjQiIGZpbGw9IiMzNzQxNTEiLz4KPHBhdGggZD0iTTIwIDQwQzI0IDQ0IDI4IDQ2IDMyIDQ2QzM2IDQ2IDQwIDQ0IDQ0IDQwIiBzdHJva2U9IiMzNzQxNTEiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=',
        alt: 'Winking Face',
        keywords: ['wink', 'playful', 'emotion', 'fun']
      }
    ]
  }
];

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(STICKER_CATEGORIES[0].id);

  const currentCategory = STICKER_CATEGORIES.find(cat => cat.id === selectedCategory) || STICKER_CATEGORIES[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add a Sticker</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-4" aria-label="Sticker Categories">
            {STICKER_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`${
                  selectedCategory === category.id
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Sticker Grid */}
        <div className="p-4 overflow-y-auto max-h-80">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {currentCategory.stickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => onSelect(sticker)}
                className="relative group p-3 rounded-lg hover:bg-gray-50 hover:ring-2 hover:ring-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              >
                <img
                  src={sticker.url}
                  alt={sticker.alt}
                  className="w-12 h-12 mx-auto"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-opacity"></div>
              </button>
            ))}
          </div>

          {currentCategory.stickers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No stickers in this category yet
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Click on any sticker to add it to your message
          </p>
        </div>
      </div>
    </div>
  );
}; 