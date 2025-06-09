import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoadingSpinner } from '../../components/common/LoadingSpinner';
import { SuccessNotification } from '../../components/ui/ConfirmationModal';
import axios from 'axios';

interface Event {
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
}

export const DashboardPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [contributorLinks, setContributorLinks] = useState<any>({});
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  // Batch actions state
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [showBatchExtendModal, setShowBatchExtendModal] = useState(false);
  const [showBatchReminderModal, setShowBatchReminderModal] = useState(false);
  const [batchDeadline, setBatchDeadline] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events');
      setEvents(response.data.events);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const closeEvent = async (eventId: string) => {
    try {
      await axios.post(`/api/events/${eventId}/close`);
      await fetchEvents(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to close event');
    }
  };

  const getContributorLinks = async (event: Event) => {
    try {
      const response = await axios.get(`/api/events/${event.id}/contributor-links`);
      setSelectedEvent(event);
      setContributorLinks(response.data.contributorLinks);
      setCopiedStates({}); // Reset copied states when opening modal
      setShowLinksModal(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get contributor links');
    }
  };

  const getParticipantContributorLink = async (event: Event) => {
    try {
      // For participants, we need to find their contributor session
      const response = await axios.get(`/api/contributions/participant-session/${event.id}`);
      if (response.data.contributorToken) {
        const contributorUrl = `${window.location.origin}/contribute/${response.data.contributorToken}`;
        window.open(contributorUrl, '_blank');
      } else {
        setError('Unable to find your participant link for this event');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get your participant link');
    }
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

  // Calculate dashboard statistics
  const createdEvents = events.filter(e => e.userRole === 'organizer');
  const participatingEvents = events.filter(e => e.userRole === 'participant');
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'OPEN' && !isEventExpired(e.deadline)).length;
  const totalContributions = events.reduce((sum, event) => sum + event._count.contributions, 0);
  const completedEvents = events.filter(e => e.status === 'CLOSED' || isEventExpired(e.deadline)).length;

  // Batch actions functions
  const toggleEventSelection = (eventId: string) => {
    setSelectedEventIds(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const selectAllOwnedEvents = () => {
    const ownedOpenEventIds = events
      .filter(e => e.userRole === 'organizer' && e.status === 'OPEN' && !isEventExpired(e.deadline))
      .map(e => e.id);
    setSelectedEventIds(ownedOpenEventIds);
  };

  const clearSelection = () => {
    setSelectedEventIds([]);
  };

  const handleBatchExtendDeadline = async () => {
    if (!batchDeadline || selectedEventIds.length === 0) return;

    try {
      setBatchLoading(true);
      const response = await axios.post('/api/events/batch/extend-deadline', {
        eventIds: selectedEventIds,
        newDeadline: new Date(batchDeadline).toISOString()
      });

      // Refresh events list
      await fetchEvents();
      
      // Clear selection and close modal
      setSelectedEventIds([]);
      setShowBatchExtendModal(false);
      setBatchDeadline('');
      
      // Show beautiful success notification
      setSuccessMessage(`Successfully extended deadlines for ${selectedEventIds.length} event${selectedEventIds.length !== 1 ? 's' : ''}!`);
      setShowSuccessNotification(true);
      setError(''); // Clear any previous errors
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to extend deadlines');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchSendReminders = async () => {
    if (selectedEventIds.length === 0) return;

    try {
      setBatchLoading(true);
      const response = await axios.post('/api/events/batch/send-reminders', {
        eventIds: selectedEventIds,
        reminderMessage: reminderMessage.trim() || undefined
      });

      // Clear selection and close modal
      setSelectedEventIds([]);
      setShowBatchReminderModal(false);
      setReminderMessage('');
      
      // Show beautiful success notification
      setSuccessMessage(`Reminder emails sent for ${selectedEventIds.length} event${selectedEventIds.length !== 1 ? 's' : ''}!`);
      setShowSuccessNotification(true);
      setError(''); // Clear any previous errors
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reminders');
    } finally {
      setBatchLoading(false);
    }
  };

  const getTomorrowMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  if (loading) {
    return <PageLoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-cream to-neutral-ivory p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back, {user?.name || 'Organizer'}!
          </h1>
          <p className="text-text-secondary">
            Manage your keepsake events and see how your community is contributing.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface-paper rounded-xl p-6 border border-surface-border shadow-soft">
            <div className="text-2xl font-bold text-primary-600 mb-1">{events.filter(e => e.userRole === 'organizer').length}</div>
            <div className="text-text-secondary text-sm font-medium">Created Events</div>
          </div>
          <div className="bg-surface-paper rounded-xl p-6 border border-surface-border shadow-soft">
            <div className="text-2xl font-bold text-purple-600 mb-1">{events.filter(e => e.userRole === 'participant').length}</div>
            <div className="text-text-secondary text-sm font-medium">Participating In</div>
          </div>
          <div className="bg-surface-paper rounded-xl p-6 border border-surface-border shadow-soft">
            <div className="text-2xl font-bold text-accent-sage mb-1">{activeEvents}</div>
            <div className="text-text-secondary text-sm font-medium">Active Events</div>
          </div>
          <div className="bg-surface-paper rounded-xl p-6 border border-surface-border shadow-soft">
            <div className="text-2xl font-bold text-accent-gold mb-1">{totalContributions}</div>
            <div className="text-text-secondary text-sm font-medium">Total Contributions</div>
          </div>
        </div>

        {/* Events Header with Batch Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Your Events</h2>
              <p className="text-sm text-text-secondary mt-1">
                Events you've created and Circle Notes you're participating in
              </p>
            </div>
            <Link
              to="/create-event"
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-warm font-medium"
            >
              + Create New Event
            </Link>
          </div>

          {/* Batch Actions Bar */}
          {events.filter(e => e.userRole === 'organizer' && e.status === 'OPEN' && !isEventExpired(e.deadline)).length > 0 && (
            <div className="bg-surface-paper rounded-lg p-4 border border-surface-border shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAllOwnedEvents}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-text-tertiary">|</span>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-text-secondary hover:text-text-primary font-medium"
                    >
                      Clear
                    </button>
                  </div>
                  {selectedEventIds.length > 0 && (
                    <span className="text-sm text-text-secondary">
                      {selectedEventIds.length} event{selectedEventIds.length !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>

                {/* Batch Action Buttons */}
                {selectedEventIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBatchExtendModal(true)}
                      className="px-3 py-2 bg-accent-sage text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Extend Deadline
                    </button>
                    <button
                      onClick={() => setShowBatchReminderModal(true)}
                      className="px-3 py-2 bg-accent-terracotta text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Reminders
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-surface-paper rounded-xl p-12 text-center border border-surface-border shadow-soft">
            <div className="w-16 h-16 bg-neutral-warm rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No events yet</h3>
            <p className="text-text-secondary mb-6">
              Create your first keepsake event to start collecting heartfelt contributions.
            </p>
            <Link
              to="/create-event"
              className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors shadow-warm font-medium inline-block"
            >
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const expired = isEventExpired(event.deadline);
              const eventTypeColor = getEventTypeColor(event.eventType);
              
              return (
                <div key={event.id} className="bg-surface-paper rounded-xl p-6 border border-surface-border shadow-soft">
                  <div className="flex items-start justify-between">
                    {/* Checkbox for owned open events */}
                    {event.userRole === 'organizer' && event.status === 'OPEN' && !expired && (
                      <div className="flex items-start mr-4 mt-1">
                        <input
                          type="checkbox"
                          checked={selectedEventIds.includes(event.id)}
                          onChange={() => toggleEventSelection(event.id)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-text-primary">{event.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full bg-${eventTypeColor} bg-opacity-20 text-${eventTypeColor} font-medium`}>
                          {getEventTypeLabel(event.eventType)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          event.userRole === 'organizer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {event.userRole === 'organizer' ? 'Organizer' : 'Participant'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          event.status === 'OPEN' && !expired
                            ? 'bg-accent-sage bg-opacity-20 text-accent-sage'
                            : 'bg-neutral-warm text-text-tertiary'
                        }`}>
                          {event.status === 'OPEN' && !expired ? 'Active' : expired ? 'Expired' : 'Closed'}
                        </span>
                      </div>
                      
                      {event.description && (
                        <p className="text-text-secondary text-sm mb-3 line-clamp-2">{event.description}</p>
                      )}
                      
                      {event.userRole === 'participant' && event.organizer && (
                        <p className="text-text-secondary text-sm mb-3">
                          <span className="font-medium">Organized by:</span> {event.organizer.name}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-text-secondary">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Deadline: {formatDate(event.deadline)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-2-4h4m-4 0h-4m4 0V8a2 2 0 00-2-2h-4a2 2 0 00-2 2v4" />
                          </svg>
                          <span>{event._count.contributions} contributions</span>
                        </div>
                        {event.eventType === 'INDIVIDUAL_TRIBUTE' && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>For: {event.recipients[0]?.name}</span>
                          </div>
                        )}
                        {event.eventType === 'CIRCLE_NOTES' && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{event.recipients.length} participants</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {event.userRole === 'organizer' ? (
                        <>
                          <button
                            onClick={() => getContributorLinks(event)}
                            className="px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            Get Links
                          </button>
                          
                          {event.status === 'OPEN' && !expired && (
                            <button
                              onClick={() => closeEvent(event.id)}
                              className="px-3 py-2 text-accent-terracotta hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                            >
                              Close Event
                            </button>
                          )}
                          
                          <Link
                            to={`/event/${event.id}`}
                            className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </>
                      ) : (
                        <>
                          {event.status === 'OPEN' && !expired && (
                            <button
                              onClick={() => getParticipantContributorLink(event)}
                              className="px-3 py-2 bg-accent-sage text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                              Write Notes
                            </button>
                          )}
                          
                          <span className="px-3 py-2 text-text-tertiary text-sm">
                            {event.status === 'OPEN' && !expired 
                              ? 'Participating in this event'
                              : 'Event completed'
                            }
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contributor Links Modal */}
        {showLinksModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-paper rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-surface-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-primary">
                    Contributor Links - {selectedEvent.title}
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
                {selectedEvent.eventType === 'INDIVIDUAL_TRIBUTE' ? (
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

        {/* Batch Extend Deadline Modal */}
        {showBatchExtendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-paper rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-surface-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-primary">
                    Extend Deadline
                  </h3>
                  <button
                    onClick={() => setShowBatchExtendModal(false)}
                    className="text-text-tertiary hover:text-text-secondary"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-text-secondary text-sm">
                  Extend deadline for {selectedEventIds.length} selected event{selectedEventIds.length !== 1 ? 's' : ''}:
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    New Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={batchDeadline}
                    onChange={(e) => setBatchDeadline(e.target.value)}
                    min={getTomorrowMinDate()}
                    className="w-full px-3 py-2 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowBatchExtendModal(false)}
                    className="flex-1 px-4 py-2 border border-neutral-warm text-text-secondary hover:bg-neutral-warm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBatchExtendDeadline}
                    disabled={!batchDeadline || batchLoading}
                    className="flex-1 px-4 py-2 bg-accent-sage text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {batchLoading ? 'Extending...' : 'Extend Deadline'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batch Send Reminders Modal */}
        {showBatchReminderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-paper rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-surface-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-text-primary">
                    Send Reminder Emails
                  </h3>
                  <button
                    onClick={() => setShowBatchReminderModal(false)}
                    className="text-text-tertiary hover:text-text-secondary"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-text-secondary text-sm">
                  Send reminder emails for {selectedEventIds.length} selected event{selectedEventIds.length !== 1 ? 's' : ''}. 
                  This will notify participants about approaching deadlines.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    placeholder="Add a personal note to the reminder (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary resize-none"
                  />
                </div>

                <div className="bg-neutral-ivory p-3 rounded-lg">
                  <p className="text-xs text-text-secondary">
                    <strong>Note:</strong> Reminders will only be sent for Circle Notes events where participants have registered accounts. 
                    Individual Tribute events require manual outreach.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowBatchReminderModal(false)}
                    className="flex-1 px-4 py-2 border border-neutral-warm text-text-secondary hover:bg-neutral-warm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBatchSendReminders}
                    disabled={batchLoading}
                    className="flex-1 px-4 py-2 bg-accent-terracotta text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {batchLoading ? 'Sending...' : 'Send Reminders'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Notification */}
        <SuccessNotification
          message={successMessage}
          isVisible={showSuccessNotification}
          onClose={() => setShowSuccessNotification(false)}
          position="top"
        />
      </div>
    </div>
  );
}; 