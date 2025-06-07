import React from 'react';
import { NoteContent, BackgroundTheme } from '../../types';

interface NotePreviewProps {
  content: NoteContent;
  theme: BackgroundTheme;
}

export const NotePreview: React.FC<NotePreviewProps> = ({ content, theme }) => {
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full h-full p-4">
      <div
        className={`w-full min-h-full p-6 rounded-lg shadow-sm ${
          theme.gradient || theme.cssClass || 'bg-white'
        }`}
        style={{
          background: theme.gradient ? undefined : theme.preview,
          fontFamily: content.formatting.fontFamily
        }}
      >
        {/* Header with recipient name */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            For {content.recipientName}
          </h3>
          {content.contributorName && (
            <p className="text-sm text-gray-600 mt-1">
              From {content.contributorName}
            </p>
          )}
        </div>

        {/* Main message content */}
        <div className="space-y-6">
          {/* Text content */}
          {content.text && (
            <div
              className="prose prose-sm max-w-none"
              style={{
                fontFamily: content.formatting.fontFamily,
                fontSize: content.formatting.fontSize
              }}
            >
              <div 
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content.text }}
              />
            </div>
          )}

          {/* Media content */}
          {content.media.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {content.media.map((item) => (
                  <div key={item.id} className="flex justify-center">
                    <img
                      src={item.url}
                      alt={item.alt}
                      className={`max-w-full h-auto rounded-lg shadow-sm ${
                        item.type === 'sticker' ? 'max-h-16 w-auto' : 'max-h-48'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drawings */}
          {content.drawings.length > 0 && (
            <div className="space-y-4">
              {content.drawings.map((drawing) => (
                <div key={drawing.id} className="flex justify-center">
                  <img
                    src={drawing.dataUrl}
                    alt="Drawing"
                    className="max-w-full h-auto rounded-lg shadow-sm max-h-48"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Signature */}
          {content.signature && (
            <div className="mt-8 pt-4 border-t border-gray-300">
              <div className="flex justify-end">
                {content.signature.type === 'drawn' ? (
                  <img
                    src={content.signature.data}
                    alt="Signature"
                    className="max-h-16 w-auto"
                  />
                ) : (
                  <div
                    style={{
                      fontFamily: content.signature.font || 'Dancing Script, cursive',
                      fontSize: '24px'
                    }}
                    className="text-gray-700"
                  >
                    {content.signature.data}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {!content.text && content.media.length === 0 && content.drawings.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Your message preview will appear here</p>
            <p className="text-sm mt-2">Start writing to see how it will look</p>
          </div>
        )}


      </div>
    </div>
  );
}; 