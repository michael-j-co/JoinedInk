import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    name: string;
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
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  

  
  // Store drafts for each recipient
  const [recipientDrafts, setRecipientDrafts] = useState<Record<string, NoteContent>>({});
  
  // Track which recipients have submitted messages (but are still editable)
  const [submittedRecipients, setSubmittedRecipients] = useState<Set<string>>(new Set());
  
  // For Circle Notes - global contributor name settings
  const [globalContributorName, setGlobalContributorName] = useState<string>('');
  const [useGlobalSettings, setUseGlobalSettings] = useState(true);
  const [showNameSettings, setShowNameSettings] = useState(false);
  
  // Animation states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  
  // Ref to store the latest content from NoteEditor
  const latestContentRef = useRef<NoteContent | null>(null);

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
      
      // Set default contributor name from user account if available
      if (response.data.currentUser?.name) {
        setGlobalContributorName(response.data.currentUser.name);
      }
      
      // Initialize submitted recipients from the completed list
      if (response.data.completedRecipients?.length > 0) {
        setSubmittedRecipients(new Set(response.data.completedRecipients));
      }
      
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
    // Save current content as draft for previous recipient (use latest from ref)
    if (selectedRecipient) {
      const contentToSave = latestContentRef.current || currentContent;
      if (contentToSave) {
      setRecipientDrafts(prev => ({
        ...prev,
          [selectedRecipient.id]: contentToSave
      }));
      }
    }

    // Switch to new recipient
    setSelectedRecipient(recipient);
    
    // Load draft for new recipient or start fresh with default contributor name
    const existingDraft = recipientDrafts[recipient.id];
    const newContent = existingDraft || {
      recipientName: recipient.name,
      contributorName: useGlobalSettings ? globalContributorName : '',
      text: '',
      formatting: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        bold: false,
        italic: false
      },
      media: [],
      drawings: [],
      backgroundColor: 'clean',
      theme: 'clean',
      wordCount: 0,
      characterCount: 0
    };
    
    // Update both state and ref
    setCurrentContent(newContent);
    latestContentRef.current = newContent;
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

  // Custom save function for Ctrl+Enter that always goes to next recipient in order
  const handleSaveWithCustomNavigation = async (content: NoteContent) => {
    if (!selectedRecipient || !sessionInfo || !token) return;
    
    // Validate content before submitting
    if (!content.text?.trim() && (!content.media || content.media.length === 0) && 
        (!content.drawings || content.drawings.length === 0) && !content.signature) {
      alert('Please add some content to your message before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('contributorToken', token);
      formData.append('recipientId', selectedRecipient.id);
      formData.append('content', content.text || '');
      formData.append('contributorName', content.contributorName || '');
      formData.append('fontFamily', content.formatting?.fontFamily || '');
      formData.append('backgroundColor', content.backgroundColor || '');
      
      // Handle signature
      if (content.signature?.data) {
        formData.append('signature', JSON.stringify(content.signature));
      }
      
      // Handle drawings
      if (content.drawings && content.drawings.length > 0) {
        formData.append('drawings', JSON.stringify(content.drawings));
      }
      
      // Handle media items (images, GIFs, stickers)
      if (content.media && content.media.length > 0) {
        const mediaData = content.media.map(item => ({
          id: item.id,
          type: item.type,
          url: item.url,
          alt: item.alt,
          width: item.width,
          height: item.height,
          position: item.position
        }));
        formData.append('media', JSON.stringify(mediaData));
      }
      
      // Handle uploaded image files (if any are local blobs)
      if (content.media) {
        let imageIndex = 0;
        for (const mediaItem of content.media) {
          if (mediaItem.type === 'image' && mediaItem.url.startsWith('blob:')) {
            try {
              const response = await fetch(mediaItem.url);
              const blob = await response.blob();
              formData.append(`images`, blob, `image-${mediaItem.id}.png`);
              imageIndex++;
            } catch (error) {
              console.warn('Failed to process image blob:', error);
            }
          }
        }
      }
      
      // Add additional formatting data
      formData.append('formatting', JSON.stringify({
        fontFamily: content.formatting?.fontFamily,
        fontSize: content.formatting?.fontSize,
        bold: content.formatting?.bold,
        italic: content.formatting?.italic
      }));
      
      // Submit the message
      await axios.post('/api/contributions/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Mark this recipient as submitted but keep the draft for editing
      setSubmittedRecipients(prev => new Set(Array.from(prev).concat(selectedRecipient.id)));
      
      // Keep the content in drafts for future editing
      setRecipientDrafts(prev => ({
        ...prev,
        [selectedRecipient.id]: content
      }));
      
      // Update session info to reflect the completion (only if not already completed)
      if (sessionInfo && !sessionInfo.completedRecipients.includes(selectedRecipient.id)) {
        setSessionInfo(prev => prev ? {
          ...prev,
          completedRecipients: [...prev.completedRecipients, selectedRecipient.id]
        } : null);
      }
      
      // Custom navigation: Always go to next recipient in order (Ctrl+Enter behavior)
      if (sessionInfo.event.eventType === 'CIRCLE_NOTES') {
        const currentIndex = sessionInfo.recipients.findIndex(r => r.id === selectedRecipient.id);
        const nextIndex = (currentIndex + 1) % sessionInfo.recipients.length; // Wrap around to first if at end
        const nextRecipient = sessionInfo.recipients[nextIndex];
        
        // Navigate to next recipient immediately
        handleRecipientChange(nextRecipient);
      }
      
    } catch (error: any) {
      console.error('Error saving contribution:', error);
      
      // Provide specific error messages based on the error type
      let errorMessage = 'There was an error submitting your message. Please try again.';
      
      if (error.response?.status === 400 && error.response.data?.error?.includes('already submitted')) {
        errorMessage = 'You have already submitted a message for this person.';
      } else if (error.response?.status === 410) {
        errorMessage = error.response.data?.error || 'This event has expired or been closed.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Your message is too large. Please reduce the number or size of images and try again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (content: NoteContent) => {
    if (!selectedRecipient || !sessionInfo || !token) return;
    
    // Validate content before submitting
    if (!content.text?.trim() && (!content.media || content.media.length === 0) && 
        (!content.drawings || content.drawings.length === 0) && !content.signature) {
      alert('Please add some content to your message before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('contributorToken', token);
      formData.append('recipientId', selectedRecipient.id);
      formData.append('content', content.text || '');
      formData.append('contributorName', content.contributorName || '');
      formData.append('fontFamily', content.formatting?.fontFamily || '');
      formData.append('backgroundColor', content.backgroundColor || '');
      
      // Handle signature
      if (content.signature?.data) {
        formData.append('signature', JSON.stringify(content.signature));
      }
      
      // Handle drawings
      if (content.drawings && content.drawings.length > 0) {
        formData.append('drawings', JSON.stringify(content.drawings));
      }
      
      // Handle media items (images, GIFs, stickers)
      if (content.media && content.media.length > 0) {
        // Convert media items to a format suitable for backend
        const mediaData = content.media.map(item => ({
          id: item.id,
          type: item.type,
          url: item.url,
          alt: item.alt,
          width: item.width,
          height: item.height,
          position: item.position
        }));
        formData.append('media', JSON.stringify(mediaData));
      }
      
      // Handle uploaded image files (if any are local blobs)
      if (content.media) {
        let imageIndex = 0;
        for (const mediaItem of content.media) {
          if (mediaItem.type === 'image' && mediaItem.url.startsWith('blob:')) {
            try {
              const response = await fetch(mediaItem.url);
              const blob = await response.blob();
              formData.append(`images`, blob, `image-${mediaItem.id}.png`);
              imageIndex++;
            } catch (error) {
              console.warn('Failed to process image blob:', error);
            }
          }
        }
      }
      
      // Add additional formatting data
      formData.append('formatting', JSON.stringify({
        fontFamily: content.formatting?.fontFamily,
        fontSize: content.formatting?.fontSize,
        bold: content.formatting?.bold,
        italic: content.formatting?.italic
      }));
      
      // Check if this is an update (re-submission) or new submission
      const isUpdate = submittedRecipients.has(selectedRecipient.id);
      
      if (isUpdate) {
        // For updates, we could use a different endpoint or the same one
        // The backend should handle existing contributions
      await axios.post('/api/contributions/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      } else {
        await axios.post('/api/contributions/submit', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      // Mark this recipient as submitted but keep the draft for editing
      setSubmittedRecipients(prev => new Set(Array.from(prev).concat(selectedRecipient.id)));
      
      // Keep the content in drafts for future editing
      if (currentContent) {
        setRecipientDrafts(prev => ({
          ...prev,
          [selectedRecipient.id]: currentContent
        }));
      }
      
      // Update session info to reflect the completion (only if not already completed)
      if (sessionInfo && !sessionInfo.completedRecipients.includes(selectedRecipient.id)) {
        setSessionInfo(prev => prev ? {
          ...prev,
          completedRecipients: [...prev.completedRecipients, selectedRecipient.id]
        } : null);
      }
      
      // Show success message
      const message = isUpdate 
        ? `Your message for ${selectedRecipient.name} has been updated successfully!`
        : `Your message for ${selectedRecipient.name} has been submitted successfully!`;
      setSuccessMessage(message);
      setShowSuccess(true);
      
      // Auto-hide success message after 4 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
      
      // Auto-navigate to next recipient with smooth animations
      if (sessionInfo.event.eventType === 'CIRCLE_NOTES') {
        // Find the next recipient that hasn't been submitted to yet
        const currentIndex = sessionInfo.recipients.findIndex(r => r.id === selectedRecipient.id);
        const nextUnsubmittedRecipient = sessionInfo.recipients
          .slice(currentIndex + 1) // Start from the next recipient
          .find(recipient => !submittedRecipients.has(recipient.id));
        
        if (nextUnsubmittedRecipient) {
          // Navigate to next unsubmitted recipient with animation
          setTimeout(() => {
            setIsTransitioning(true);
            setTimeout(() => {
              handleRecipientChange(nextUnsubmittedRecipient);
              setIsTransitioning(false);
            }, 300); // Fade out duration
          }, 1500); // Give time for success message to be seen
        } else {
          // Check if there are any unsubmitted recipients from the beginning
          const anyUnsubmittedRecipient = sessionInfo.recipients
            .find(recipient => !submittedRecipients.has(recipient.id));
          
          if (anyUnsubmittedRecipient) {
            // Navigate to first unsubmitted recipient with animation
            setTimeout(() => {
              setIsTransitioning(true);
              setTimeout(() => {
                handleRecipientChange(anyUnsubmittedRecipient);
                setIsTransitioning(false);
              }, 300);
            }, 1500);
          } else {
            // All recipients have messages, show completion animation then go back to selector
            setTimeout(() => {
              setShowCompletionAnimation(true);
              setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
        setSelectedRecipient(null);
                  setCurrentContent(null);
                  setIsTransitioning(false);
                  setShowCompletionAnimation(false);
                }, 300);
              }, 1500); // Show completion animation for 1.5s
            }, 1000);
          }
        }
      } else {
        // For Individual Tribute, just stay on the current message
        // Could potentially show a completion message here
      }
      
    } catch (error: any) {
      console.error('Error saving contribution:', error);
      
      // Provide specific error messages based on the error type
      let errorMessage = 'There was an error submitting your message. Please try again.';
      
      if (error.response?.status === 400 && error.response.data?.error?.includes('already submitted')) {
        errorMessage = 'You have already submitted a message for this person.';
      } else if (error.response?.status === 410) {
        errorMessage = error.response.data?.error || 'This event has expired or been closed.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Your message is too large. Please reduce the number or size of images and try again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = (content: NoteContent) => {
    setCurrentContent(content);
    setShowPreview(true);
  };

  const handleContentChange = (content: NoteContent) => {
    // Store the latest content in ref for immediate access
    latestContentRef.current = content;
    setCurrentContent(content);
    
    // Auto-save draft for current recipient
    if (selectedRecipient) {
      setRecipientDrafts(prev => ({
        ...prev,
        [selectedRecipient.id]: content
      }));
    }
  };

  const handleGlobalNameChange = (newName: string) => {
    setGlobalContributorName(newName);
    
    // If using global settings, update all drafts and current content
    if (useGlobalSettings) {
      if (currentContent) {
        const updatedContent = { ...currentContent, contributorName: newName };
        setCurrentContent(updatedContent);
        
        // Update current recipient's draft
        if (selectedRecipient) {
          setRecipientDrafts(prev => ({
            ...prev,
            [selectedRecipient.id]: updatedContent
          }));
        }
      }
      
      // Update all other drafts
      setRecipientDrafts(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(recipientId => {
          updated[recipientId] = { ...updated[recipientId], contributorName: newName };
        });
        return updated;
      });
    }
  };

  const handleGlobalSettingsToggle = (enabled: boolean) => {
    setUseGlobalSettings(enabled);
    
    if (enabled && globalContributorName) {
      // Apply global name to current content and all drafts
      handleGlobalNameChange(globalContributorName);
    }
  };

  // Navigation helpers for quick previous/next functionality
  const getCurrentRecipientIndex = useCallback(() => {
    if (!selectedRecipient || !sessionInfo) return -1;
    return sessionInfo.recipients.findIndex(r => r.id === selectedRecipient.id);
  }, [selectedRecipient, sessionInfo]);

  const navigateToPrevious = useCallback(() => {
    if (!sessionInfo || !selectedRecipient) return;
    
    // Force save the latest content from ref (most up-to-date)
    const contentToSave = latestContentRef.current || currentContent;
    if (contentToSave && selectedRecipient) {
      setRecipientDrafts(prev => ({
        ...prev,
        [selectedRecipient.id]: contentToSave
      }));
    }
    
    const currentIndex = getCurrentRecipientIndex();
    if (currentIndex > 0) {
      const previousRecipient = sessionInfo.recipients[currentIndex - 1];
      handleRecipientChange(previousRecipient);
    }
  }, [sessionInfo, selectedRecipient, currentContent, getCurrentRecipientIndex, handleRecipientChange, setRecipientDrafts]);

  const navigateToNext = useCallback(() => {
    if (!sessionInfo || !selectedRecipient) return;
    
    // Force save the latest content from ref (most up-to-date)
    const contentToSave = latestContentRef.current || currentContent;
    if (contentToSave && selectedRecipient) {
      setRecipientDrafts(prev => ({
        ...prev,
        [selectedRecipient.id]: contentToSave
      }));
    }
    
    const currentIndex = getCurrentRecipientIndex();
    if (currentIndex < sessionInfo.recipients.length - 1) {
      const nextRecipient = sessionInfo.recipients[currentIndex + 1];
      handleRecipientChange(nextRecipient);
    }
  }, [sessionInfo, selectedRecipient, currentContent, getCurrentRecipientIndex, handleRecipientChange, setRecipientDrafts]);

  const canNavigatePrevious = useCallback(() => {
    const currentIndex = getCurrentRecipientIndex();
    return currentIndex > 0;
  }, [getCurrentRecipientIndex]);

  const canNavigateNext = useCallback(() => {
    const currentIndex = getCurrentRecipientIndex();
    return sessionInfo ? currentIndex < sessionInfo.recipients.length - 1 : false;
  }, [getCurrentRecipientIndex, sessionInfo]);

  // Add keyboard shortcuts for navigation and submission
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when on the editor page (selectedRecipient exists)
      if (!selectedRecipient) return;

      // Ctrl/Cmd + Enter = Submit/Update and move to next
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        // Get the latest content and submit
        const contentToSubmit = latestContentRef.current || currentContent;
        if (contentToSubmit) {
          // Submit the message but handle navigation ourselves
          handleSaveWithCustomNavigation(contentToSubmit);
        }
        return;
      }

      // Only handle navigation shortcuts when NOT typing in an input/textarea/contenteditable
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          (event.target as HTMLElement)?.contentEditable === 'true') {
        return;
      }

      // Ctrl/Cmd + Left Arrow = Previous
      if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowLeft') {
        event.preventDefault();
        if (canNavigatePrevious()) {
          // Small delay to ensure any pending content changes are captured
          setTimeout(() => {
            navigateToPrevious();
          }, 100);
        }
      }
      
      // Ctrl/Cmd + Right Arrow = Next
      if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowRight') {
        event.preventDefault();
        if (canNavigateNext()) {
          // Small delay to ensure any pending content changes are captured
          setTimeout(() => {
            navigateToNext();
          }, 100);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedRecipient, currentContent, canNavigatePrevious, canNavigateNext, navigateToPrevious, navigateToNext, handleSaveWithCustomNavigation]);

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
                        fontFamily: currentContent.formatting?.fontFamily,
                      }}
                      className="text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={createSafeHtml(currentContent.text)}
                    />
                  </div>
                )}

                {/* Media content */}
                {currentContent.media && currentContent.media.length > 0 && (
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
                {currentContent.drawings && currentContent.drawings.length > 0 && (
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
                            fontFamily: currentContent.signature?.font || 'Dancing Script, cursive',
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
        <div className={`max-w-4xl mx-auto p-6 transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
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

            {/* Name Settings for Circle Notes */}
            <div className="p-6 bg-rose-50 border-b border-rose-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Name Settings</h3>
                  <p className="text-sm text-gray-600">
                    Set how you want to be identified in your messages to the circle
                  </p>
                </div>
                <button
                  onClick={() => setShowNameSettings(!showNameSettings)}
                  className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                >
                  {showNameSettings ? 'Hide' : 'Show'} Settings
                </button>
              </div>

              {showNameSettings && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={globalContributorName}
                      onChange={(e) => handleGlobalNameChange(e.target.value)}
                      placeholder="Enter your name or nickname"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="useGlobalSettings"
                      checked={useGlobalSettings}
                      onChange={(e) => handleGlobalSettingsToggle(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                    />
                    <div>
                      <label htmlFor="useGlobalSettings" className="text-sm font-medium text-gray-700">
                        Use this name for all messages
                      </label>
                      <p className="text-xs text-gray-500">
                        When enabled, this name will be used for all your messages. 
                        When disabled, you can customize your name for each person.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recipient Selection */}
            <div className="p-6">
              {/* Check if all recipients have been messaged */}
              {sessionInfo.recipients.every(recipient => submittedRecipients.has(recipient.id)) ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">All Messages Sent! 🎉</h2>
                  <p className="text-gray-600 mb-6">
                    You've written messages to everyone in the circle. You can still edit any of your messages by clicking on a participant below.
                  </p>
                </div>
              ) : (
              <h2 className="text-xl font-bold text-gray-900 mb-4">Circle Participants</h2>
              )}
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessionInfo.recipients.map((recipient) => {
                  const hasDraft = recipientDrafts[recipient.id];
                  const isSubmitted = submittedRecipients.has(recipient.id);
                  
                  return (
                    <button
                      key={recipient.id}
                      onClick={() => handleRecipientChange(recipient)}
                      className="p-4 rounded-lg border-2 transition-all text-left border-gray-200 hover:border-rose-300 hover:bg-rose-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{recipient.name}</h3>
                        <div className="flex gap-2">
                          {hasDraft && !isSubmitted && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              Draft
                            </span>
                          )}
                          {isSubmitted && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              ✓ Sent
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{recipient.email}</p>
                      <div className="mt-3 text-sm">
                        {isSubmitted ? (
                          <span className="text-green-600">Edit message →</span>
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

  // Prepare initial content - always use currentContent which is properly managed per recipient
  const getInitialContent = () => {
    // Always return currentContent which is properly set for each recipient
    // Don't fall back to defaults here as that would override recipient-specific content
    return currentContent || {
      recipientName: selectedRecipient?.name || 'Unknown',
      contributorName: sessionInfo?.currentUser?.name || '',
      text: '',
      formatting: {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        bold: false,
        italic: false
      },
      media: [],
      drawings: [],
      backgroundColor: 'clean',
      theme: 'clean',
      wordCount: 0,
      characterCount: 0
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">


            {/* Simplified Navigation Bar for Circle Notes */}
      {sessionInfo.event.eventType === 'CIRCLE_NOTES' && selectedRecipient && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left side - Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedRecipient(null)}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All Participants
                </button>
              </div>

                            {/* Center - Current participant and navigation */}
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200 w-80">
                <button
                  onClick={navigateToPrevious}
                  disabled={!canNavigatePrevious()}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:text-gray-800 transition-all flex-shrink-0"
                  title="Previous participant (Ctrl/Cmd + ←)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="text-center flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{selectedRecipient.name}</div>
                  <div className="text-xs text-gray-500">
                    {getCurrentRecipientIndex() + 1} of {sessionInfo.recipients.length}
                  </div>
                </div>
                
                <button
                  onClick={navigateToNext}
                  disabled={!canNavigateNext()}
                  className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:text-gray-800 transition-all flex-shrink-0"
                  title="Next participant (Ctrl/Cmd + →)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Right side - Settings and progress */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600 hidden sm:block">
                  {sessionInfo.completedRecipients.length} of {sessionInfo.recipients.length} completed
                </div>
                <div className="text-xs text-gray-500 hidden lg:block">
                  <div>Ctrl/Cmd + Enter: Submit & Next</div>
                  <div>Ctrl/Cmd + ← →: Navigate</div>
                </div>
                <button
                  onClick={() => setShowNameSettings(!showNameSettings)}
                  className="flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">Name Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      

      {/* Completion Animation Overlay */}
      {showCompletionAnimation && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-40">
          <div className="text-center max-w-md mx-auto p-8 animate-pulse">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-transform duration-1000 hover:scale-110">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 transform transition-all duration-700 ease-out">
              All Messages Complete! 🎉
            </h2>
            <p className="text-lg text-gray-600 transform transition-all duration-700 ease-out delay-200">
              You've sent heartfelt messages to everyone in the circle.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-30">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading next message...</p>
          </div>
        </div>
      )}

      {/* Name Settings Panel - Now as a separate floating card when needed */}
      {sessionInfo.event.eventType === 'CIRCLE_NOTES' && showNameSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Name Settings</h3>
                <button
                  onClick={() => setShowNameSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Set how you want to be identified in your messages to the circle
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={globalContributorName}
                    onChange={(e) => handleGlobalNameChange(e.target.value)}
                    placeholder="Enter your name or nickname"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="useGlobalSettingsModal"
                    checked={useGlobalSettings}
                    onChange={(e) => handleGlobalSettingsToggle(e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                  />
                  <div>
                    <label htmlFor="useGlobalSettingsModal" className="text-sm font-medium text-gray-700">
                      Use this name for all messages
                    </label>
                    <p className="text-xs text-gray-500">
                      When enabled, this name will be used for all your messages. 
                      When disabled, you can customize your name for each person.
                    </p>
              </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNameSettings(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}>
      <NoteEditor
          key={selectedRecipient?.id || 'no-recipient'} // Force re-render when recipient changes
        recipientName={selectedRecipient?.name || 'Unknown'}
        eventTitle={sessionInfo.event.title}
          initialContent={getInitialContent()}
        onSave={handleSave}
        onPreview={handlePreview}
        onContentChange={handleContentChange}
        isSubmitting={isSubmitting}
          isUpdate={selectedRecipient ? submittedRecipients.has(selectedRecipient.id) : false}
      />
      </div>
    </div>
  );
}; 