import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

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

  const closeEvent = async () => {
    if (!event || event.userRole !== 'organizer') return;
    
    try {
      await axios.post(`/api/events/${eventId}/close`);
      await fetchEventDetails(); // Refresh event data
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to close event');
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
                  
                  {event.status === 'OPEN' && !expired && (
                    <button
                      onClick={closeEvent}
                      className="px-4 py-2 text-accent-terracotta hover:bg-red-50 border border-accent-terracotta rounded-lg transition-colors font-medium"
                    >
                      Close Event
                    </button>
                  )}
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
      </div>
    </div>
  );
}; 