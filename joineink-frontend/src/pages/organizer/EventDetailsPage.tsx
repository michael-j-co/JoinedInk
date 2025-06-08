import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Contribution {
  id: string;
  content: string;
  contributorName: string;
  fontFamily: string;
  backgroundColor: string;
  signature: any;
  images: string[];
  stickers: string[];
  drawings: any;
  media: any;
  formatting: any;
  createdAt: string;
}

interface ContributionsByRecipient {
  recipient: {
    id: string;
    name: string;
    email: string;
  };
  contributions: Contribution[];
}

interface EventDetails {
  id: string;
  title: string;
  description?: string;
  eventType: 'INDIVIDUAL_TRIBUTE' | 'CIRCLE_NOTES';
  status: 'OPEN' | 'CLOSED';
  deadline: string;
  createdAt: string;
  userRole: 'organizer' | 'participant';
  organizer?: {
    name: string;
    email: string;
  };
  recipients: {
    id: string;
    name: string;
    email: string;
    _count: {
      contributions: number;
    };
  }[];
  _count: {
    contributions: number;
  };
  participantInfo?: {
    contributorToken: string;
    completedRecipients: string[];
  };
}

export const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [contributorLinks, setContributorLinks] = useState<any>({});
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  
  // New state for contributions and modals
  const [contributions, setContributions] = useState<ContributionsByRecipient[]>([]);
  const [showContributionsModal, setShowContributionsModal] = useState(false);
  const [contributionsLoading, setContributionsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSendKeepsakeConfirm, setShowSendKeepsakeConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/events/${eventId}`);
      setEvent(response.data.event);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Event not found or you do not have access to this event.');
      } else {
        setError(err.response?.data?.error || 'Failed to load event details');
      }
    } finally {
      setLoading(false);
    }
  };



  const getContributorLinks = async () => {
    if (!event || event.userRole !== 'organizer') return;
    
    try {
      const response = await axios.get(`/api/events/${eventId}/contributor-links`);
      setContributorLinks(response.data.contributorLinks);
      setCopiedStates({}); // Reset copied states
      setShowLinksModal(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get contributor links');
    }
  };

  const openContributorPage = () => {
    if (!event?.participantInfo?.contributorToken) return;
    
    const contributorUrl = `${window.location.origin}/contribute/${event.participantInfo.contributorToken}`;
    window.open(contributorUrl, '_blank');
  };

  const copyToClipboard = (text: string, buttonId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [buttonId]: true }));
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [buttonId]: false }));
    }, 2000);
  };

  // New functions for contribution management
  const fetchContributions = async () => {
    if (!event || event.userRole !== 'organizer') return;
    
    try {
      setContributionsLoading(true);
      const response = await axios.get(`/api/events/${eventId}/contributions`);
      setContributions(response.data.contributionsByRecipient);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load contributions');
    } finally {
      setContributionsLoading(false);
    }
  };

  const viewContributions = async () => {
    await fetchContributions();
    setShowContributionsModal(true);
  };

  const deleteEvent = async () => {
    if (!event || event.userRole !== 'organizer') return;
    
    try {
      setActionLoading(true);
      await axios.delete(`/api/events/${eventId}`);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete event');
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const sendKeepsakeBooks = async () => {
    if (!event || event.userRole !== 'organizer') return;
    
    try {
      setActionLoading(true);
      const response = await axios.post(`/api/events/${eventId}/send-keepsake-books`);
      
      // Show success message and refresh event data
      await fetchEventDetails();
      
      const { emailsSent, totalRecipients, errors, eventClosed } = response.data;
      
      if (errors && errors.length > 0) {
        alert(`⚠️ Partial Success:\n✅ ${emailsSent} emails sent successfully\n❌ ${errors.length} emails failed\n\nEvent remains OPEN so you can retry sending. Check your email configuration and try again.`);
      } else if (eventClosed) {
        alert(`🎉 Event ended successfully!\n\nKeepsake book emails have been sent to all ${emailsSent} recipients. The event is now closed and recipients will receive beautiful personalized emails with links to view their compiled keepsake books.`);
      } else {
        alert(`📧 Emails sent successfully!\n\n${emailsSent} keepsake book emails were sent. Event remains open.`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send keepsake books');
    } finally {
      setActionLoading(false);
      setShowSendKeepsakeConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeLabel = (eventType: string) => {
    return eventType === 'INDIVIDUAL_TRIBUTE' ? 'Individual Tribute' : 'Circle Notes';
  };

  const getEventTypeColor = (eventType: string) => {
    return eventType === 'INDIVIDUAL_TRIBUTE' ? 'accent-sage' : 'accent-rose';
  };

  const isEventExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  // Sanitize background color to prevent CSS injection
  const sanitizeBackgroundColor = (backgroundColor: string | undefined) => {
    // Whitelist of allowed background colors
    const allowedColors = [
      'transparent',
      'clean',
      '#ffffff',
      '#f8f9fa',
      '#f1f3f4',
      '#e3f2fd',
      '#f3e5f5',
      '#e8f5e8',
      '#fff3e0',
      '#fce4ec',
      '#e0f2f1',
      '#e1f5fe',
      '#f9fbe7',
      '#fff8e1',
      '#fefefe',
      'white',
      'ivory',
      'beige',
      'lavender',
      'lightblue',
      'lightgreen',
      'lightyellow',
      'lightpink',
      'lightgray'
    ];

    if (!backgroundColor) {
      return 'transparent';
    }

    // Convert to lowercase for comparison
    const normalizedColor = backgroundColor.toLowerCase().trim();
    
    // Check if it's in our whitelist
    if (allowedColors.includes(normalizedColor)) {
      return normalizedColor === 'clean' ? 'transparent' : normalizedColor;
    }

    // Default to transparent if not in whitelist
    return 'transparent';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-cream to-neutral-ivory p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-warm rounded w-48 mb-6"></div>
            <div className="bg-surface-paper rounded-xl p-8 mb-6">
              <div className="h-6 bg-neutral-warm rounded w-64 mb-4"></div>
              <div className="h-4 bg-neutral-warm rounded w-48 mb-2"></div>
              <div className="h-4 bg-neutral-warm rounded w-32"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface-paper rounded-xl p-6 h-40"></div>
              <div className="bg-surface-paper rounded-xl p-6 h-40"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-cream to-neutral-ivory p-6 flex items-center justify-center">
        <div className="bg-surface-paper rounded-xl shadow-soft p-8 border border-surface-border max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-4">Unable to Load Event</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const expired = isEventExpired(event.deadline);
  const eventTypeColor = getEventTypeColor(event.eventType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-cream to-neutral-ivory p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-text-secondary mb-4">
            <Link to="/dashboard" className="hover:text-text-primary">Dashboard</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-text-primary">Event Details</span>
          </nav>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">{event.title}</h1>
              <div className="flex items-center gap-3">
                <span className={`text-sm px-3 py-1 rounded-full bg-${eventTypeColor} bg-opacity-20 text-${eventTypeColor} font-medium`}>
                  {getEventTypeLabel(event.eventType)}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  event.userRole === 'organizer'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {event.userRole === 'organizer' ? 'Organizer' : 'Participant'}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  event.status === 'OPEN' && !expired
                    ? 'bg-accent-sage bg-opacity-20 text-accent-sage'
                    : 'bg-neutral-warm text-text-tertiary'
                }`}>
                  {event.status === 'OPEN' && !expired ? 'Active' : expired ? 'Expired' : 'Closed'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {event.userRole === 'organizer' ? (
                <>
                  <button
                    onClick={getContributorLinks}
                    className="px-4 py-2 text-primary-600 hover:bg-primary-50 border border-primary-600 rounded-lg transition-colors font-medium"
                  >
                    Get Links
                  </button>
                  
                  {event.eventType === 'CIRCLE_NOTES' && event._count.contributions > 0 && (
                    <button
                      onClick={viewContributions}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      View Notes
                    </button>
                  )}
                  
                  {event.status === 'OPEN' && !expired && event._count.contributions > 0 && (
                    <button
                      onClick={() => setShowSendKeepsakeConfirm(true)}
                      className="px-4 py-2 bg-accent-sage text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      Send Keepsake Books
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-600 rounded-lg transition-colors font-medium"
                  >
                    Delete Event
                  </button>
                </>
              ) : (
                <>
                  {event.status === 'OPEN' && !expired && event.participantInfo && (
                    <button
                      onClick={openContributorPage}
                      className="px-4 py-2 bg-accent-sage text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      Write Notes
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Event Information */}
        <div className="bg-surface-paper rounded-xl p-6 border border-surface-border shadow-soft mb-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">Event Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {event.description && (
                <div>
                  <span className="font-medium text-text-secondary">Description:</span>
                  <p className="text-text-primary mt-1">{event.description}</p>
                </div>
              )}
              
              <div>
                <span className="font-medium text-text-secondary">Deadline:</span>
                <p className="text-text-primary mt-1">{formatDate(event.deadline)}</p>
              </div>
              
              <div>
                <span className="font-medium text-text-secondary">Created:</span>
                <p className="text-text-primary mt-1">{formatDate(event.createdAt)}</p>
              </div>
              
              {event.userRole === 'participant' && event.organizer && (
                <div>
                  <span className="font-medium text-text-secondary">Organized by:</span>
                  <p className="text-text-primary mt-1">{event.organizer.name}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="font-medium text-text-secondary">Total Contributions:</span>
                <p className="text-2xl font-bold text-primary-600 mt-1">{event._count.contributions}</p>
              </div>
              
              {event.eventType === 'INDIVIDUAL_TRIBUTE' && event.recipients[0] && (
                <div>
                  <span className="font-medium text-text-secondary">Recipient:</span>
                  <p className="text-text-primary mt-1">{event.recipients[0].name}</p>
                  <p className="text-text-secondary text-sm">{event.recipients[0].email}</p>
                </div>
              )}
              
              {event.eventType === 'CIRCLE_NOTES' && (
                <div>
                  <span className="font-medium text-text-secondary">Participants:</span>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{event.recipients.length}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipients/Participants List */}
        <div className="bg-surface-paper rounded-xl p-6 border border-surface-border shadow-soft">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            {event.eventType === 'INDIVIDUAL_TRIBUTE' ? 'Recipient' : 'Participants'}
          </h2>
          
          <div className="space-y-3">
            {event.recipients.map((recipient) => {
              const isCompleted = event.participantInfo?.completedRecipients.includes(recipient.id);
              
              return (
                <div key={recipient.id} className="flex items-center justify-between p-4 bg-neutral-ivory rounded-lg">
                  <div>
                    <h3 className="font-medium text-text-primary">{recipient.name}</h3>
                    <p className="text-text-secondary text-sm">{recipient.email}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-text-primary">
                        {recipient._count.contributions} contribution{recipient._count.contributions !== 1 ? 's' : ''}
                      </p>
                      {event.userRole === 'participant' && event.eventType === 'CIRCLE_NOTES' && (
                        <p className="text-xs text-text-secondary">
                          {isCompleted ? '✓ Completed' : 'Not started'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contributor Links Modal */}
        {showLinksModal && event.userRole === 'organizer' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-paper rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-surface-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-primary">
                    Contributor Links - {event.title}
                  </h3>
                  <button
                    onClick={() => setShowLinksModal(false)}
                    className="text-text-tertiary hover:text-text-secondary"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {event.eventType === 'INDIVIDUAL_TRIBUTE' ? (
                  <div className="bg-neutral-ivory p-4 rounded-lg">
                    <h4 className="font-medium text-text-primary mb-2">Contributor Link</h4>
                    <p className="text-sm text-text-secondary mb-3">
                      Share this link with contributors:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={contributorLinks.contributorUrl || 'Loading...'}
                        readOnly
                        className="flex-1 px-3 py-2 bg-surface-paper border border-neutral-warm rounded text-sm text-text-primary"
                      />
                      <button
                        onClick={() => copyToClipboard(contributorLinks.contributorUrl, 'contributorUrl')}
                        className="px-4 py-2 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
                      >
                        {copiedStates.contributorUrl ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-neutral-ivory p-4 rounded-lg">
                      <h4 className="font-medium text-text-primary mb-2">Your Contribution Link</h4>
                      <p className="text-sm text-text-secondary mb-3">
                        Click this link to write notes to other participants:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={contributorLinks.creatorContributorUrl || 'Loading...'}
                          readOnly
                          className="flex-1 px-3 py-2 bg-surface-paper border border-neutral-warm rounded text-sm text-text-primary"
                        />
                        <button
                          onClick={() => copyToClipboard(contributorLinks.creatorContributorUrl, 'creatorContributorUrl')}
                          className="px-4 py-2 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
                        >
                          {copiedStates.creatorContributorUrl ? 'Copied!' : 'Copy'}
                        </button>
                        <a
                          href={contributorLinks.creatorContributorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-accent-sage text-white rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          Open
                        </a>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-ivory p-4 rounded-lg">
                      <h4 className="font-medium text-text-primary mb-2">Circle Notes Join Link</h4>
                      <p className="text-sm text-text-secondary mb-3">
                        Share this link with your group:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={contributorLinks.joinLink || 'Loading...'}
                          readOnly
                          className="flex-1 px-3 py-2 bg-surface-paper border border-neutral-warm rounded text-sm text-text-primary"
                        />
                        <button
                          onClick={() => copyToClipboard(contributorLinks.joinLink, 'joinLink')}
                          className="px-4 py-2 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
                        >
                          {copiedStates.joinLink ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contributions Modal */}
        {showContributionsModal && event.userRole === 'organizer' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-paper rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-surface-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-primary">
                    All Contributions - {event.title}
                  </h3>
                  <button
                    onClick={() => setShowContributionsModal(false)}
                    className="text-text-tertiary hover:text-text-secondary"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {contributionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="text-text-secondary mt-2">Loading contributions...</p>
                  </div>
                ) : contributions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-text-secondary">No contributions found.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {contributions.map((recipientData) => (
                      <div key={recipientData.recipient.id} className="border border-surface-border rounded-lg p-6">
                        <h4 className="text-lg font-bold text-text-primary mb-4">
                          Notes for {recipientData.recipient.name}
                        </h4>
                        
                        {recipientData.contributions.length === 0 ? (
                          <p className="text-text-secondary italic">No contributions yet</p>
                        ) : (
                          <div className="space-y-4">
                            {recipientData.contributions.map((contribution, index) => (
                              <div key={contribution.id} className="bg-neutral-ivory rounded-lg p-4 border-l-4 border-primary-500">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <p className="font-medium text-text-primary">
                                      From: {contribution.contributorName}
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                      {new Date(contribution.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                                    Note #{index + 1}
                                  </span>
                                </div>
                                
                                <div className="prose prose-sm max-w-none">
                                  <div 
                                    className="whitespace-pre-wrap text-text-primary"
                                    style={{ 
                                      fontFamily: contribution.fontFamily || 'Arial',
                                      backgroundColor: sanitizeBackgroundColor(contribution.backgroundColor)
                                    }}
                                  >
                                    {contribution.content}
                                  </div>
                                  
                                  {contribution.images && contribution.images.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-sm font-medium text-text-secondary mb-2">Images:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {contribution.images.map((image, imgIndex) => (
                                          <img 
                                            key={imgIndex}
                                            src={image} 
                                            alt={`Contribution image ${imgIndex + 1}`}
                                            className="w-20 h-20 object-cover rounded border"
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {contribution.signature && (
                                    <div className="mt-3">
                                      <p className="text-sm font-medium text-text-secondary mb-1">Signature:</p>
                                      <div className="text-lg" style={{ fontFamily: 'cursive' }}>
                                        {typeof contribution.signature === 'string' ? contribution.signature : 'Digital Signature'}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-paper rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-text-primary mb-4">Delete Event</h3>
              <p className="text-text-secondary mb-6">
                Are you sure you want to delete this event? This action cannot be undone and will remove all contributions.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-text-secondary border border-neutral-warm rounded-lg hover:bg-neutral-ivory transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={deleteEvent}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Keepsake Books Confirmation Modal */}
        {showSendKeepsakeConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-paper rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-text-primary mb-4">Send Keepsake Books</h3>
              <p className="text-text-secondary mb-6">
                This will send keepsake book emails to all participants. If all emails are sent successfully, the event will be closed automatically. If any emails fail, the event remains open for retry.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSendKeepsakeConfirm(false)}
                  className="flex-1 px-4 py-2 text-text-secondary border border-neutral-warm rounded-lg hover:bg-neutral-ivory transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={sendKeepsakeBooks}
                  className="flex-1 px-4 py-2 bg-accent-sage text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Sending...' : 'Send Keepsake Books'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 