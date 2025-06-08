import React, { useState } from 'react';
import { NoteEditor } from '../../components/forms/NoteEditor';
import { NoteContent, BackgroundTheme } from '../../types';

export const ContributorPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentContent, setCurrentContent] = useState<NoteContent | null>(null);

  // Mock data - in production, this would come from URL params or API
  const mockEvent = {
    recipientName: "Sarah Johnson",
    eventTitle: "Sarah's Retirement Celebration",
    deadline: "2024-02-15"
  };

  // Background themes (same as in NoteEditor)
  const BACKGROUND_THEMES: BackgroundTheme[] = [
    { id: 'clean', name: 'Clean White', preview: '#ffffff', cssClass: 'bg-white', gradient: '' },
    { id: 'warm', name: 'Warm Cream', preview: '#fef7ed', cssClass: 'bg-orange-50', gradient: '' },
    { id: 'soft', name: 'Soft Rose', preview: '#fdf2f8', cssClass: 'bg-pink-50', gradient: '' },
    { id: 'gentle', name: 'Gentle Blue', preview: '#eff6ff', cssClass: 'bg-blue-50', gradient: '' },
    { id: 'nature', name: 'Nature Green', preview: '#f0fdf4', cssClass: 'bg-green-50', gradient: '' },
    { id: 'sunset', name: 'Sunset Gradient', preview: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', cssClass: '', gradient: 'bg-gradient-to-br from-orange-100 to-orange-200' },
  ];

  const handleSave = async (content: NoteContent) => {
    setIsSubmitting(true);
    try {
      // In production, this would be an API call to save the contribution
      console.log('Saving contribution:', content);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message or redirect
      alert('Your message has been submitted successfully!');
      
    } catch (error) {
      console.error('Error saving contribution:', error);
      alert('There was an error submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = (content: NoteContent) => {
    setCurrentContent(content);
    setShowPreview(true);
  };

  const handleContentChange = (content: NoteContent) => {
    setCurrentContent(content);
  };

  if (showPreview && currentContent) {
  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Preview Your Message</h1>
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Editor
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="max-w-2xl mx-auto">
              {/* Full preview with background theme */}
              <div
                className={`p-8 ${
                  BACKGROUND_THEMES.find(t => t.id === currentContent.backgroundColor)?.gradient ||
                  BACKGROUND_THEMES.find(t => t.id === currentContent.backgroundColor)?.cssClass ||
                  'bg-white'
                }`}
                style={{
                  background: BACKGROUND_THEMES.find(t => t.id === currentContent.backgroundColor)?.gradient
                    ? undefined
                    : BACKGROUND_THEMES.find(t => t.id === currentContent.backgroundColor)?.preview
                }}
              >
                {/* Header */}
                <div className="text-center mb-8 pb-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    For {currentContent.recipientName}
                  </h2>
                  {currentContent.contributorName && (
                    <p className="text-gray-600">From {currentContent.contributorName}</p>
                  )}
                </div>
                
                {/* Text content */}
                {currentContent.text && (
                  <div className="prose prose-lg max-w-none mb-6">
                    <div 
                      style={{
                        fontFamily: currentContent.formatting.fontFamily,
                      }}
                      className="text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: currentContent.text }}
                    />
                  </div>
                )}

                {/* Media content */}
                {currentContent.media.length > 0 && (
                  <div className="relative min-h-[200px] mb-6">
                    {currentContent.media.map((item) => (
                      item.position ? (
                        // Positioned media
                        <div
                          key={item.id}
                          className="absolute"
                          style={{
                            left: `${item.position.x}px`,
                            top: `${item.position.y}px`,
                            zIndex: item.position.zIndex || 1
                          }}
                        >
                          <img
                            src={item.url}
                            alt={item.alt}
                            className={`rounded-lg shadow-sm ${
                              item.type === 'sticker' ? 'max-h-16 w-auto' : 'max-h-32'
                            }`}
                          />
                        </div>
                      ) : (
                        // Fallback to centered layout for items without position
                        <div key={item.id} className="flex justify-center mb-4">
                          <img
                            src={item.url}
                            alt={item.alt}
                            className={`max-w-full h-auto rounded-lg shadow-sm ${
                              item.type === 'sticker' ? 'max-h-16 w-auto' : 'max-h-48'
                            }`}
                          />
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Drawings */}
                {currentContent.drawings.length > 0 && (
                  <div className="relative min-h-[200px] mb-6">
                    {currentContent.drawings.map((drawing) => (
                      drawing.position ? (
                        // Positioned drawings
                        <div
                          key={drawing.id}
                          className="absolute"
                          style={{
                            left: `${drawing.position.x}px`,
                            top: `${drawing.position.y}px`,
                            zIndex: drawing.position.zIndex || 1
                          }}
                        >
                          <img
                            src={drawing.dataUrl}
                            alt="Drawing"
                            className="rounded-lg shadow-sm max-h-32"
                          />
                        </div>
                      ) : (
                        // Fallback to centered layout for drawings without position
                        <div key={drawing.id} className="flex justify-center mb-4">
                          <img
                            src={drawing.dataUrl}
                            alt="Drawing"
                            className="max-w-full h-auto rounded-lg shadow-sm max-h-48"
                          />
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Signature */}
                {currentContent.signature && (
                  <div className="mt-8 pt-4 border-t border-gray-300">
                    <div className="flex justify-end">
                      {currentContent.signature.type === 'drawn' ? (
                        <img
                          src={currentContent.signature.data}
                          alt="Signature"
                          className="max-h-16 w-auto"
                        />
                      ) : (
                        <div
                          style={{
                            fontFamily: currentContent.signature.font || 'Dancing Script, cursive',
                            fontSize: '24px'
                          }}
                          className="text-gray-700"
                        >
                          {currentContent.signature.data}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action buttons outside the themed area */}
              <div className="p-6 bg-white border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Edit Message
                </button>
                <button
                  onClick={() => handleSave(currentContent)}
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NoteEditor
        recipientName={mockEvent.recipientName}
        eventTitle={mockEvent.eventTitle}
        initialContent={currentContent ? currentContent : undefined}
        onSave={handleSave}
        onPreview={handlePreview}
        onContentChange={handleContentChange}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}; 