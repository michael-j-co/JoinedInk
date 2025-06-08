import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NoteEditor } from '../../components/forms/NoteEditor';
import { NoteContent, BackgroundTheme } from '../../types';
import { createSafeHtml } from '../../utils/sanitizeHtml';
import axios from 'axios';

interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: 'INDIVIDUAL_TRIBUTE' | 'CIRCLE_NOTES';
  deadline: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
}

interface SessionInfo {
  event: Event;
  recipients: Recipient[];
  completedRecipients: string[];
  currentUser?: {
    id: string;
    email: string;
  };
}

export const ContributorPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentContent, setCurrentContent] = useState<NoteContent | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Store drafts for each recipient
  const [recipientDrafts, setRecipientDrafts] = useState<Record<string, NoteContent>>({});

  useEffect(() => {
    if (token) {
      fetchSessionInfo();
    }
  }, [token]);

  const fetchSessionInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/contributions/session/${token}`);
      setSessionInfo(response.data);
      
      // For Individual Tribute, select the first (and only) recipient
      // For Circle Notes, let user choose
      if (response.data.recipients.length > 0) {
        if (response.data.event.eventType === 'INDIVIDUAL_TRIBUTE') {
          setSelectedRecipient(response.data.recipients[0]);
        }
        // For Circle Notes, we'll let them choose from the recipient selector
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Invalid contribution link. Please check the URL and try again.');
      } else if (err.response?.status === 410) {
        setError(err.response.data.error || 'This contribution link has expired.');
      } else {
        setError('Failed to load event information. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientChange = (recipient: Recipient) => {
    // Save current content as draft for previous recipient
    if (selectedRecipient && currentContent) {
      setRecipientDrafts(prev => ({
        ...prev,
        [selectedRecipient.id]: currentContent
      }));
    }

    // Switch to new recipient
    setSelectedRecipient(recipient);
    
    // Load draft for new recipient or start fresh
    const existingDraft = recipientDrafts[recipient.id];
    setCurrentContent(existingDraft || null);
    setShowPreview(false);
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
    if (!selectedRecipient || !sessionInfo || !token) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('contributorToken', token);
      formData.append('recipientId', selectedRecipient.id);
      formData.append('content', content.text || '');
      formData.append('contributorName', content.contributorName || '');
      formData.append('fontFamily', content.formatting.fontFamily || '');
      formData.append('backgroundColor', content.backgroundColor || '');
      
      if (content.signature) {
        formData.append('signature', content.signature.data);
      }
      
      if (content.drawings && content.drawings.length > 0) {
        formData.append('drawings', JSON.stringify(content.drawings));
      }
      
      // TODO: Handle images and stickers uploads
      
      await axios.post('/api/contributions/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Mark this recipient as completed
      setRecipientDrafts(prev => {
        const newDrafts = { ...prev };
        delete newDrafts[selectedRecipient.id];
        return newDrafts;
      });
      
      alert(`Your message for ${selectedRecipient.name} has been submitted successfully!`);
      
      // For Circle Notes, allow them to continue with other recipients
      if (sessionInfo.event.eventType === 'CIRCLE_NOTES') {
        setCurrentContent(null);
        // Don't auto-select next recipient, let them choose
        setSelectedRecipient(null);
      }
      
    } catch (error: any) {
      console.error('Error saving contribution:', error);
      alert(error.response?.data?.error || 'There was an error submitting your message. Please try again.');
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
    
    // Auto-save draft for current recipient
    if (selectedRecipient) {
      setRecipientDrafts(prev => ({
        ...prev,
        [selectedRecipient.id]: content
      }));
    }
  };

  const formatDeadline = (deadline: string) => {
    return new Date(deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Unable to Load Event</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (!sessionInfo) {
    return null;
  }

  if (showPreview && currentContent) {
    // Cache the theme lookup to avoid multiple find calls
    const selectedTheme = BACKGROUND_THEMES.find(t => t.id === currentContent.backgroundColor) || BACKGROUND_THEMES[0];
    
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
                className={`p-8 ${selectedTheme.gradient || selectedTheme.cssClass || 'bg-white'}`}
                style={{
                  background: selectedTheme.gradient ? undefined : selectedTheme.preview
                }}
              >
                {/* Header */}
                <div className="text-center mb-8 pb-4 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    For {selectedRecipient?.name || 'Unknown'}
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
                      dangerouslySetInnerHTML={createSafeHtml(currentContent.text)}
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

  // For Circle Notes, show recipient selector if no recipient is selected
  if (sessionInfo.event.eventType === 'CIRCLE_NOTES' && !selectedRecipient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-6">
              <h1 className="text-3xl font-bold mb-2">{sessionInfo.event.title}</h1>
              <p className="text-rose-100">Choose who you'd like to write a message for</p>
              <div className="mt-4 text-sm text-rose-100">
                <span>Deadline: {formatDeadline(sessionInfo.event.deadline)}</span>
              </div>
            </div>

            {/* Event Description */}
            {sessionInfo.event.description && (
              <div className="p-6 bg-rose-50 border-b border-rose-200">
                <p className="text-gray-700">{sessionInfo.event.description}</p>
              </div>
            )}

            {/* Recipient Selection */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Circle Participants</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessionInfo.recipients.map((recipient) => {
                  const hasDraft = recipientDrafts[recipient.id];
                  const isCompleted = sessionInfo.completedRecipients.includes(recipient.id);
                  
                  return (
                    <button
                      key={recipient.id}
                      onClick={() => handleRecipientChange(recipient)}
                      disabled={isCompleted}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isCompleted
                          ? 'border-green-200 bg-green-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{recipient.name}</h3>
                        <div className="flex gap-2">
                          {hasDraft && !isCompleted && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              Draft
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              ✓ Sent
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{recipient.email}</p>
                      <div className="mt-3 text-sm">
                        {isCompleted ? (
                          <span className="text-green-600">Message submitted</span>
                        ) : hasDraft ? (
                          <span className="text-yellow-600">Continue writing →</span>
                        ) : (
                          <span className="text-rose-600">Write message →</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Recipient Selector Bar for Circle Notes */}
      {sessionInfo.event.eventType === 'CIRCLE_NOTES' && selectedRecipient && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedRecipient(null)}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  ← Back to participants
                </button>
                <div className="h-4 w-px bg-gray-300"></div>
                <div>
                  <span className="text-sm text-gray-600">Writing for:</span>
                  <span className="ml-2 font-semibold text-gray-900">{selectedRecipient.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{sessionInfo.completedRecipients.length} of {sessionInfo.recipients.length} completed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <NoteEditor
        recipientName={selectedRecipient?.name || 'Unknown'}
        eventTitle={sessionInfo.event.title}
        initialContent={currentContent ? currentContent : undefined}
        onSave={handleSave}
        onPreview={handlePreview}
        onContentChange={handleContentChange}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}; 