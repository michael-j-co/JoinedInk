import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { BackgroundTheme } from '../../types';

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
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose a Background Theme</h3>
        <p className="text-sm text-gray-600 mb-6">
          Select a background theme that reflects the mood of your message
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`relative group p-4 rounded-lg border-2 transition-all ${
                selectedTheme === theme.id
                  ? 'border-rose-500 ring-2 ring-rose-200'
                  : 'border-gray-200 hover:border-gray-300'
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

              {/* Selected indicator */}
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1">
                  <CheckIcon className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Theme Options */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-3">Preview Your Choice</h4>
        <div className="p-4 rounded-lg border border-gray-200">
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
            <h5 className="font-medium text-gray-900 mb-2">Sample Message</h5>
            <p className="text-gray-700 text-sm leading-relaxed">
              This is how your message will look with the selected background theme. 
              The theme creates a gentle, sentimental atmosphere while keeping your text readable.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-300">
              <p className="text-sm text-gray-600 italic">- Your Name</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 