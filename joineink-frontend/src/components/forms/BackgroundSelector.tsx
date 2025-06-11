import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { BackgroundTheme } from '../../types';
import { getCurrentSeason, getSeasonalInfo, getSeasonalRecommendation } from '../../utils/seasonalThemes';

interface BackgroundSelectorProps {
  themes: BackgroundTheme[];
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  themes,
  selectedTheme,
  onThemeChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Organize themes by category
  const themeCategories = {
    core: themes.filter(t => ['clean', 'warm', 'soft', 'gentle', 'nature', 'sunset'].includes(t.id)),
    spring: themes.filter(t => t.id.includes('spring') || t.id.includes('cherry-blossom')),
    summer: themes.filter(t => t.id.includes('summer') || t.id.includes('golden-hour') || t.id.includes('ocean')),
    autumn: themes.filter(t => t.id.includes('autumn') || t.id.includes('harvest') || t.id.includes('cozy')),
    winter: themes.filter(t => t.id.includes('winter') || t.id.includes('snowy') || t.id.includes('candlelight')),
    holiday: themes.filter(t => t.id.includes('festive') || t.id.includes('valentine') || t.id.includes('thanksgiving'))
  };

  const categories = [
    { id: 'all', name: 'All Themes', icon: '🎨' },
    { id: 'core', name: 'Essential', icon: '✨' },
    { id: 'spring', name: 'Spring', icon: '🌸' },
    { id: 'summer', name: 'Summer', icon: '☀️' },
    { id: 'autumn', name: 'Autumn', icon: '🍂' },
    { id: 'winter', name: 'Winter', icon: '❄️' },
    { id: 'holiday', name: 'Holiday', icon: '🎉' }
  ];

  const getThemesToShow = () => {
    if (selectedCategory === 'all') return themes;
    return themeCategories[selectedCategory as keyof typeof themeCategories] || [];
  };

  const currentSeason = getCurrentSeason();
  const seasonalInfo = getSeasonalInfo(currentSeason);
  const recommendedTheme = getSeasonalRecommendation(currentSeason);

  const handleSeasonalSuggestion = () => {
    setSelectedCategory(currentSeason);
    if (recommendedTheme && themes.find(t => t.id === recommendedTheme)) {
      onThemeChange(recommendedTheme);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose a Background Theme</h3>
        <p className="text-sm text-gray-600 mb-6">
          Select a background theme that reflects the mood of your message. Seasonal themes can add a special touch for the time of year.
        </p>

        {/* Category Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${
                  category.id === currentSeason ? 'ring-2 ring-rose-300 ring-opacity-50' : ''
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
                {category.id === currentSeason && (
                  <span className="text-xs opacity-75">(Current)</span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {getThemesToShow().map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`relative group p-4 rounded-lg border-2 transition-all ${
                selectedTheme === theme.id
                  ? 'border-rose-500 ring-2 ring-rose-200'
                  : 'border-gray-200 hover:border-gray-300'
              } ${
                theme.id === recommendedTheme ? 'border-blue-300 bg-blue-50' : ''
              }`}
            >
              {/* Preview */}
              <div
                className={`w-full h-20 rounded-md mb-3 border border-gray-200 ${
                  theme.gradient || theme.cssClass
                }`}
                style={{
                  background: theme.gradient ? undefined : theme.preview
                }}
              >
                {/* Sample content preview */}
                <div className="p-2 h-full flex flex-col justify-between text-xs">
                  <div className="w-3/4 h-1 bg-gray-400 rounded opacity-50"></div>
                  <div className="space-y-1">
                    <div className="w-full h-1 bg-gray-400 rounded opacity-30"></div>
                    <div className="w-5/6 h-1 bg-gray-400 rounded opacity-30"></div>
                    <div className="w-2/3 h-1 bg-gray-400 rounded opacity-30"></div>
                  </div>
                </div>
              </div>

              {/* Theme name */}
              <div className="text-sm font-medium text-gray-900">{theme.name}</div>
              
              {/* Recommended badge */}
              {theme.id === recommendedTheme && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Recommended
                </div>
              )}

              {/* Selected indicator */}
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1">
                  <CheckIcon className="h-3 w-3" />
                </div>
              )}

              {/* Seasonal indicator */}
              {theme.id.includes('spring') && (
                <div className="absolute top-2 left-2 text-lg opacity-70">🌸</div>
              )}
              {theme.id.includes('summer') && (
                <div className="absolute top-2 left-2 text-lg opacity-70">☀️</div>
              )}
              {theme.id.includes('autumn') && (
                <div className="absolute top-2 left-2 text-lg opacity-70">🍂</div>
              )}
              {theme.id.includes('winter') && (
                <div className="absolute top-2 left-2 text-lg opacity-70">❄️</div>
              )}
              {theme.id.includes('holiday') && (
                <div className="absolute top-2 left-2 text-lg opacity-70">🎉</div>
              )}
            </button>
          ))}
        </div>

        {/* Enhanced Seasonal Suggestion */}
        {selectedCategory === 'all' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{seasonalInfo.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-blue-900">
                    {seasonalInfo.name} Season Themes
                  </h4>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                    Current Season
                  </span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  {seasonalInfo.description}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategory(currentSeason)}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View {seasonalInfo.name} Themes
                  </button>
                  <button
                    onClick={handleSeasonalSuggestion}
                    className="text-sm bg-white text-blue-600 border border-blue-300 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Try Recommended: {themes.find(t => t.id === recommendedTheme)?.name}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Preview */}
      <div className="pt-6 border-t border-gray-200">
        <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div
            className={`p-6 rounded-lg ${
              themes.find(t => t.id === selectedTheme)?.gradient ||
              themes.find(t => t.id === selectedTheme)?.cssClass ||
              'bg-white'
            }`}
            style={{
              background: themes.find(t => t.id === selectedTheme)?.gradient
                ? undefined
                : themes.find(t => t.id === selectedTheme)?.preview
            }}
          >

          </div>
        </div>
      </div>
    </div>
  );
}; 