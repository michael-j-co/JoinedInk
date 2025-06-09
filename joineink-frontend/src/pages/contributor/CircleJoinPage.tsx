import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLoadingSpinner } from '../../components/common/LoadingSpinner';
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
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  
  // Form states
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
    if (!email.trim() || !password.trim() || !joinInfo) return;
    
    // For registration, name is required
    if (activeTab === 'register' && !name.trim()) return;

    try {
      setJoining(true);
      setError('');
      
      // For sign-in, we'll use a placeholder name that gets updated from the backend
      const submitName = activeTab === 'signin' ? 'Existing User' : name.trim();
      
      const response = await axios.post(`/api/events/${joinInfo.event.id}/join-circle`, {
        name: submitName,
        email: email.trim(),
        password: password.trim(),
        joinToken: token
      });

      // Redirect to the contributor page with their new session token
      navigate(`/contribute/${response.data.contributorToken}`);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to join the circle. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.includes('account with this email already exists')) {
        if (activeTab === 'register') {
          setError('An account with this email already exists. Please use the "Sign In" tab instead.');
        } else {
          setError(errorMessage);
        }
      } else if (errorMessage.includes('Invalid credentials') || errorMessage.includes('correct password')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(errorMessage);
      }
      
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

  const handleTabSwitch = (tab: 'signin' | 'register') => {
    setActiveTab(tab);
    setError('');
    // Clear form when switching tabs
    if (tab === 'signin') {
      setName('');
    }
  };

  if (loading) {
    return <PageLoadingSpinner message="Loading circle session..." />;
  }

  if (error && !joinInfo) {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 915.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{joinInfo.recipients.length} people already joined</span>
              </div>
            </div>
          </div>

          {/* How Circle Notes Works */}
          <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h3 className="font-semibold text-text-primary mb-2">How Circle Notes Works:</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Sign in or create an account to join this circle</li>
              <li>• Write heartfelt messages for everyone else in the group</li>
              <li>• Each person receives their own personalized keepsake book</li>
              <li>• You can include photos, drawings, and creative decorations</li>
              <li>• After the deadline, everyone gets their compiled book via email</li>
            </ul>
          </div>

          {/* Sign In / Register Tabs */}
          <div className="mb-6">
            <div className="flex bg-neutral-ivory rounded-lg p-1">
              <button
                onClick={() => handleTabSwitch('signin')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'signin'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleTabSwitch('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'register'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Join Form */}
          <form onSubmit={handleJoin} className="space-y-4">
            {/* Name field - only for registration */}
            {activeTab === 'register' && (
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
            )}

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
              {activeTab === 'register' && (
                <p className="text-xs text-text-muted mt-1">
                  We'll use this to send you your personalized keepsake book
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {activeTab === 'signin' ? 'Password' : 'Create Password'} *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={activeTab === 'signin' ? 'Enter your password' : 'Create a secure password'}
                required
                minLength={activeTab === 'register' ? 6 : 1}
                className="w-full px-4 py-3 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary"
              />
              {activeTab === 'register' && (
                <p className="text-xs text-text-muted mt-1">
                  You'll need this to contribute to other events in the future
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={joining || !email.trim() || !password.trim() || (activeTab === 'register' && !name.trim())}
              className="w-full bg-gradient-to-r from-accent-rose to-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-accent-rose hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-warm"
            >
              {joining 
                ? (activeTab === 'signin' ? 'Signing In...' : 'Creating Account & Joining...') 
                : (activeTab === 'signin' ? 'Sign In & Join Circle' : 'Create Account & Join Circle')
              }
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-text-muted">
              By joining, you agree to {activeTab === 'register' ? 'create an account and ' : ''}write meaningful messages for all other participants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
