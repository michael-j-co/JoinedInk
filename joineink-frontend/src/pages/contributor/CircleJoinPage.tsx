import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: 'CIRCLE_NOTES';
  deadline: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
}

interface JoinInfo {
  event: Event;
  recipients: Recipient[];
  completedRecipients: string[];
}

export const CircleJoinPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinInfo, setJoinInfo] = useState<JoinInfo | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Create AbortController to handle request cancellation
    const abortController = new AbortController();

    const fetchJoinInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/contributions/session/${token}`, {
          signal: abortController.signal
        });
        setJoinInfo(response.data);
      } catch (err: any) {
        // Don't update state if the request was cancelled due to component unmount
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return;
        }
        
        if (err.response?.status === 404) {
          setError('Invalid join link. Please check the URL and try again.');
        } else if (err.response?.status === 410) {
          setError(err.response.data.error || 'This join link has expired.');
        } else {
          setError('Failed to load event information. Please try again.');
        }
      } finally {
        // Only update loading state if request wasn't cancelled
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchJoinInfo();

    // Cleanup function to cancel the request if component unmounts
    return () => {
      abortController.abort();
    };
  }, [token]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !joinInfo) return;

    try {
      setJoining(true);
      
      // Create a recipient and account for this person in the circle notes event
      const response = await axios.post(`/api/events/${joinInfo.event.id}/join-circle`, {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        joinToken: token
      });

      // Redirect to the contributor page with their new session token
      navigate(`/contribute/${response.data.contributorToken}`);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join the circle. Please try again.');
      setJoining(false);
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-cream to-neutral-ivory p-6 flex items-center justify-center">
        <div className="bg-surface-paper rounded-2xl shadow-soft-lg p-8 border border-surface-border max-w-lg w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-warm rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-neutral-warm rounded w-full mb-2"></div>
            <div className="h-4 bg-neutral-warm rounded w-2/3 mb-6"></div>
            <div className="h-10 bg-neutral-warm rounded w-full mb-4"></div>
            <div className="h-10 bg-neutral-warm rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-cream to-neutral-ivory p-6 flex items-center justify-center">
        <div className="bg-surface-paper rounded-2xl shadow-soft-lg p-8 border border-surface-border max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-4">Unable to Load Event</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (!joinInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-cream to-neutral-ivory p-6 flex items-center justify-center">
      <div className="bg-surface-paper rounded-2xl shadow-soft-lg border border-surface-border max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-rose to-primary-500 text-white p-6 rounded-t-2xl">
          <div className="text-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Join Circle Notes</h1>
            <p className="text-white text-opacity-90 text-sm">You've been invited to participate!</p>
          </div>
        </div>

        <div className="p-6">
          {/* Event Information */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-text-primary mb-2">{joinInfo.event.title}</h2>
            {joinInfo.event.description && (
              <p className="text-text-secondary mb-3">{joinInfo.event.description}</p>
            )}
            <div className="bg-neutral-ivory p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Deadline: {formatDeadline(joinInfo.event.deadline)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{joinInfo.recipients.length} people already joined</span>
              </div>
            </div>
          </div>

          {/* How Circle Notes Works */}
          <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h3 className="font-semibold text-text-primary mb-2">How Circle Notes Works:</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Create an account to join this circle</li>
              <li>• Write heartfelt messages for everyone else in the group</li>
              <li>• Each person receives their own personalized keepsake book</li>
              <li>• You can include photos, drawings, and creative decorations</li>
              <li>• After the deadline, everyone gets their compiled book via email</li>
            </ul>
          </div>

          {/* Join Form */}
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Your Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Your Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-3 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary"
              />
              <p className="text-xs text-text-muted mt-1">
                We'll use this to send you your personalized keepsake book
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Create Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary"
              />
              <p className="text-xs text-text-muted mt-1">
                You'll need this to contribute to other events in the future
              </p>
            </div>

            <button
              type="submit"
              disabled={joining || !name.trim() || !email.trim() || !password.trim()}
              className="w-full bg-gradient-to-r from-accent-rose to-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-accent-rose hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-warm"
            >
              {joining ? 'Creating Account & Joining...' : 'Create Account & Join Circle'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-text-muted">
              By joining, you agree to create an account and write meaningful messages for all other participants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
