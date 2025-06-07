import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  PhotoIcon,
  PaintBrushIcon,
  GifIcon,
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-neutral-cream">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neutral-cream via-surface-paper to-neutral-ivory overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              Create & Cherish 
              <span className="text-primary-500 font-script block mt-2">
                Collaborative Digital Keepsakes
              </span>
            </h1>
            <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform heartfelt messages, photos, and memories into beautiful, personalized digital books. 
              Whether it's a graduation tribute or a group appreciation exchange, JoinedInk helps you create 
              lasting memories together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-warm">
                Start Creating
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <a href="#how-it-works" className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-medium py-4 px-8 rounded-lg transition-colors duration-200">
                How It Works
              </a>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <HeartIcon className="h-16 w-16 text-accent-rose" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <SparklesIcon className="h-20 w-20 text-accent-sage" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Two Beautiful Ways to Connect
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Choose the perfect format for your special occasion
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {/* Individual Tribute */}
            <div className="bg-surface-card p-8 text-center rounded-2xl shadow-soft border border-surface-border">
              <div className="bg-accent-sage bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="h-8 w-8 text-accent-sage" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">Individual Tribute</h3>
              <p className="text-text-secondary mb-6">
                Many contributors write heartfelt messages for one special recipient. Perfect for 
                graduations, farewells, birthdays, or appreciation events.
              </p>
              <ul className="text-left space-y-2 text-text-secondary">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-accent-sage mr-2" />
                  Multiple contributors, one recipient
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-accent-sage mr-2" />
                  Anonymous or named contributions
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-accent-sage mr-2" />
                  Beautiful compiled keepsake book
                </li>
              </ul>
            </div>

            {/* Circle Notes */}
            <div className="bg-surface-card p-8 text-center rounded-2xl shadow-soft border border-surface-border">
              <div className="bg-accent-rose bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="h-8 w-8 text-accent-rose" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">Circle Notes</h3>
              <p className="text-text-secondary mb-6">
                Everyone in a group writes notes to everyone else. Each person receives their own 
                personalized keepsake book filled with messages from the entire group.
              </p>
              <ul className="text-left space-y-2 text-text-secondary">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-accent-rose mr-2" />
                  Everyone writes for everyone
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-accent-rose mr-2" />
                  Individual books for each person
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-accent-rose mr-2" />
                  Perfect for team exchanges
                </li>
              </ul>
            </div>
          </div>

          {/* Creative Tools */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              Express Yourself with Creative Tools
            </h3>
            <p className="text-text-secondary mb-8">
              Add personality and warmth to every message
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <DocumentTextIcon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h4 className="font-semibold text-text-primary mb-2">Rich Text</h4>
              <p className="text-sm text-text-tertiary">Custom fonts and formatting</p>
            </div>
            <div className="text-center">
              <PhotoIcon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h4 className="font-semibold text-text-primary mb-2">Photos</h4>
              <p className="text-sm text-text-tertiary">Upload meaningful images</p>
            </div>
            <div className="text-center">
              <PaintBrushIcon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h4 className="font-semibold text-text-primary mb-2">Drawings</h4>
              <p className="text-sm text-text-tertiary">Hand-drawn doodles and art</p>
            </div>
            <div className="text-center">
              <GifIcon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h4 className="font-semibold text-text-primary mb-2">Digital Signature</h4>
              <p className="text-sm text-text-tertiary">Personal touch with signatures</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-neutral-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              How It Works
            </h2>
            <p className="text-xl text-text-secondary">
              Creating meaningful keepsakes is simple and intuitive
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 font-bold text-lg shadow-warm">
                1
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Create Event</h3>
              <p className="text-text-secondary">
                Set up your event, add recipients, and choose between Individual Tribute or Circle Notes format.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 font-bold text-lg shadow-warm">
                2
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Share Links</h3>
              <p className="text-text-secondary">
                Share unique contributor links with friends, family, or team members. No accounts required for contributors.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 font-bold text-lg shadow-warm">
                3
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Deliver Magic</h3>
              <p className="text-text-secondary">
                We compile everything into beautiful digital keepsake books and deliver them to recipients via email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Create Something Beautiful?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your first keepsake event today and bring people together through meaningful memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 hover:bg-neutral-ivory font-medium py-3 px-8 rounded-lg transition-colors duration-200">
              Get Started Free
            </Link>
            <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}; 