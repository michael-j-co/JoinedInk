import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface EventFormData {
  eventType: 'INDIVIDUAL_TRIBUTE' | 'CIRCLE_NOTES' | '';
  title: string;
  description: string;
  deadline: string;
  // For Individual Tribute
  recipientName: string;
  recipientEmail: string;
  // Circle Notes doesn't need pre-defined members anymore
}

export const CreateEventPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdEvent, setCreatedEvent] = useState<any>(null);
  const [formData, setFormData] = useState<EventFormData>({
    eventType: '',
    title: '',
    description: '',
    deadline: '',
    recipientName: '',
    recipientEmail: ''
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEventTypeSelect = (type: 'INDIVIDUAL_TRIBUTE' | 'CIRCLE_NOTES') => {
    setFormData(prev => ({ ...prev, eventType: type }));
    setCurrentStep(2);
    setError('');
  };

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep2 = () => {
    if (!formData.title.trim()) {
      setError('Event title is required');
      return false;
    }
    if (!formData.deadline) {
      setError('Deadline is required');
      return false;
    }
    
    if (formData.eventType === 'INDIVIDUAL_TRIBUTE') {
      if (!formData.recipientName.trim()) {
        setError('Recipient name is required');
        return false;
      }
      if (!formData.recipientEmail.trim()) {
        setError('Recipient email is required');
        return false;
      }
    }
    // Circle Notes doesn't need pre-validation since people join via link
    return true;
  };

  const handleNext = () => {
    if (currentStep === 2 && !validateStep2()) {
      return;
    }
    setCurrentStep(prev => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        deadline: new Date(formData.deadline).toISOString(),
        ...(formData.eventType === 'INDIVIDUAL_TRIBUTE' 
          ? {
              recipientName: formData.recipientName,
              recipientEmail: formData.recipientEmail
            }
          : {}
        )
      };

      const response = await axios.post('/api/events', eventData);
      setCreatedEvent(response.data);
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getTomorrowMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-cream to-neutral-ivory p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-neutral-warm text-text-tertiary'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 ${
                    currentStep > step ? 'bg-primary-500' : 'bg-neutral-warm'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <div className="text-sm text-text-secondary">
              {currentStep === 1 && "Step 1: Event Type Selection"}
              {currentStep === 2 && "Step 2: Event Details"}
              {currentStep === 3 && "Step 3: Preview & Confirm"}
              {currentStep === 4 && "Step 4: Event Created Successfully"}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-surface-paper rounded-2xl shadow-soft-lg p-8 border border-surface-border">
          {/* Step 1: Event Type Selection */}
          {currentStep === 1 && (
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2 text-center">Create New Event</h1>
              <p className="text-text-secondary text-center mb-8">Choose the type of keepsake event you want to create</p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Individual Tribute */}
                <button
                  onClick={() => handleEventTypeSelect('INDIVIDUAL_TRIBUTE')}
                  className="group p-6 border-2 border-surface-border rounded-xl hover:border-accent-sage hover:shadow-warm transition-all duration-200 text-left"
                >
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-accent-sage bg-opacity-20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-opacity-30 transition-colors">
                      <svg className="w-6 h-6 text-accent-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Individual Tribute</h3>
                    <p className="text-text-secondary text-sm">Many contributors write heartfelt messages for one special recipient. Perfect for graduations, farewells, birthdays, or appreciation events.</p>
                  </div>
                  <div className="text-accent-sage text-sm font-medium group-hover:text-primary-600">
                    Choose this option →
                  </div>
                </button>

                {/* Circle Notes */}
                <button
                  onClick={() => handleEventTypeSelect('CIRCLE_NOTES')}
                  className="group p-6 border-2 border-surface-border rounded-xl hover:border-accent-rose hover:shadow-warm transition-all duration-200 text-left"
                >
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-accent-rose bg-opacity-20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-opacity-30 transition-colors">
                      <svg className="w-6 h-6 text-accent-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">Circle Notes</h3>
                    <p className="text-text-secondary text-sm">Share a join link with your group. Anyone can join and write notes to everyone else. Each person receives their own keepsake book with messages from all participants.</p>
                  </div>
                  <div className="text-accent-rose text-sm font-medium group-hover:text-primary-600">
                    Choose this option →
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Event Details */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Event Details - {formData.eventType === 'INDIVIDUAL_TRIBUTE' ? 'Individual Tribute' : 'Circle Notes'}
              </h2>
              
              <div className="space-y-6">
                {/* Basic Event Info */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={formData.eventType === 'INDIVIDUAL_TRIBUTE' 
                      ? "e.g., Sarah's Graduation Tribute" 
                      : "e.g., Senior Send-Off 2025"
                    }
                    className="w-full px-4 py-3 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Event Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Add a message to guide contributors..."
                    rows={3}
                    className="w-full px-4 py-3 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Contribution Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    min={getTomorrowMinDate()}
                    className="w-full px-4 py-3 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary"
                  />
                </div>

                {/* Individual Tribute Fields */}
                {formData.eventType === 'INDIVIDUAL_TRIBUTE' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Recipient's Name *
                      </label>
                      <input
                        type="text"
                        value={formData.recipientName}
                        onChange={(e) => handleInputChange('recipientName', e.target.value)}
                        placeholder="e.g., Sarah Chen"
                        className="w-full px-4 py-3 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Recipient's Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.recipientEmail}
                        onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                        placeholder="recipient@email.com"
                        className="w-full px-4 py-3 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-neutral-warm text-text-secondary rounded-lg hover:bg-neutral-ivory transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-warm"
                >
                  Next: Preview
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Confirm */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6">Preview & Confirm</h2>
              
              <div className="bg-neutral-ivory p-6 rounded-lg space-y-4">
                <div>
                  <span className="font-medium text-text-secondary">Event Type:</span>
                  <span className="ml-2 text-text-primary">
                    {formData.eventType === 'INDIVIDUAL_TRIBUTE' ? 'Individual Tribute' : 'Circle Notes'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Title:</span>
                  <span className="ml-2 text-text-primary">{formData.title}</span>
                </div>
                {formData.description && (
                  <div>
                    <span className="font-medium text-text-secondary">Description:</span>
                    <span className="ml-2 text-text-primary">{formData.description}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-text-secondary">Deadline:</span>
                  <span className="ml-2 text-text-primary">
                    {new Date(formData.deadline).toLocaleString()}
                  </span>
                </div>
                
                {formData.eventType === 'INDIVIDUAL_TRIBUTE' ? (
                  <>
                    <div>
                      <span className="font-medium text-text-secondary">Recipient:</span>
                      <span className="ml-2 text-text-primary">{formData.recipientName} ({formData.recipientEmail})</span>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="font-medium text-text-secondary">Circle Notes:</span>
                    <div className="mt-2">
                      <div className="ml-2 text-text-primary">
                        People will join using a shared link and can write notes to each other
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-neutral-warm text-text-secondary rounded-lg hover:bg-neutral-ivory transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-warm"
                >
                  {loading ? 'Creating Event...' : 'Create Event'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Event Created Successfully */}
          {currentStep === 4 && createdEvent && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent-sage bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Event Created Successfully!</h2>
                <p className="text-text-secondary">Your keepsake event is ready. Share the contributor link(s) below.</p>
              </div>

              <div className="space-y-6">
                {formData.eventType === 'INDIVIDUAL_TRIBUTE' ? (
                  <div className="bg-neutral-ivory p-6 rounded-lg">
                    <h3 className="font-medium text-text-primary mb-3">Contributor Link</h3>
                    <p className="text-sm text-text-secondary mb-3">
                      Share this link with contributors so they can write messages for {formData.recipientName}:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={createdEvent.contributorLink}
                        readOnly
                        className="flex-1 px-3 py-2 bg-surface-paper border border-neutral-warm rounded text-sm text-text-primary"
                      />
                      <button
                        onClick={() => copyToClipboard(createdEvent.contributorLink)}
                        className="px-4 py-2 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-ivory p-6 rounded-lg">
                    <h3 className="font-medium text-text-primary mb-3">Circle Notes Join Link</h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Share this link with your group. Anyone who clicks it can join the Circle Notes event and write messages to everyone else:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={createdEvent.joinLink}
                        readOnly
                        className="flex-1 px-3 py-2 bg-surface-paper border border-neutral-warm rounded text-sm text-text-primary"
                      />
                      <button
                        onClick={() => copyToClipboard(createdEvent.joinLink)}
                        className="px-4 py-2 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="mt-4 text-xs text-text-muted">
                      <p>People can join anytime before the deadline. Each person will be able to write notes to all other participants.</p>
                    </div>
                  </div>
                )}

                <div className="text-center space-y-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-warm"
                  >
                    Go to Dashboard
                  </button>
                  <div>
                    <button
                      onClick={() => {
                        setCurrentStep(1);
                        setFormData({
                          eventType: '',
                          title: '',
                          description: '',
                          deadline: '',
                          recipientName: '',
                          recipientEmail: ''
                        });
                        setCreatedEvent(null);
                        setError('');
                      }}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Create Another Event
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 