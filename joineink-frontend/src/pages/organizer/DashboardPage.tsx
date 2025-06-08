import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: 'INDIVIDUAL_TRIBUTE' | 'CIRCLE_NOTES';
  status: 'OPEN' | 'CLOSED';
  deadline: string;
  createdAt: string;
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
      setShowLinksModal(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get contributor links');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'OPEN' && !isEventExpired(e.deadline)).length;
  const totalContributions = events.reduce((sum, event) => sum + event._count.contributions, 0);
  const completedEvents = events.filter(e => e.status === 'CLOSED' || isEventExpired(e.deadline)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-cream to-neutral-ivory p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-warm rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-surface-paper p-6 rounded-xl h-24"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface-paper p-6 rounded-xl h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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
            <div className="text-2xl font-bold text-primary-600 mb-1">{totalEvents}</div>
            <div className="text-text-secondary text-sm font-medium">Total Events</div>
          </div>
          <div className="bg-surface-paper rounded-xl p-6 border border-surface-border shadow-soft">
            <div className="text-2xl font-bold text-accent-sage mb-1">{activeEvents}</div>
            <div className="text-text-secondary text-sm font-medium">Active Events</div>
          </div>
          <div className="bg-surface-paper rounded-xl p-6 border border-surface-border shadow-soft">
            <div className="text-2xl font-bold text-accent-gold mb-1">{totalContributions}</div>
            <div className="text-text-secondary text-sm font-medium">Total Contributions</div>
          </div>
          <div className="bg-surface-paper rounded-xl p-6 border border-surface-border shadow-soft">
            <div className="text-2xl font-bold text-accent-rose mb-1">{completedEvents}</div>
            <div className="text-text-secondary text-sm font-medium">Completed Events</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">Your Events</h2>
            <Link
              to="/create-event"
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-warm font-medium"
            >
              + Create New Event
            </Link>
          </div>
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
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-text-primary">{event.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full bg-${eventTypeColor} bg-opacity-20 text-${eventTypeColor} font-medium`}>
                          {getEventTypeLabel(event.eventType)}
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
                        onClick={() => copyToClipboard(contributorLinks.contributorUrl)}
                        className="px-4 py-2 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
                      >
                        Copy
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
                          onClick={() => copyToClipboard(contributorLinks.creatorContributorUrl)}
                          className="px-4 py-2 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
                        >
                          Copy
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
                          onClick={() => copyToClipboard(contributorLinks.joinLink)}
                          className="px-4 py-2 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
                        >
                          Copy
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