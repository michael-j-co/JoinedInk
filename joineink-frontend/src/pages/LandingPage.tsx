import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const floatAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-neutral-cream">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-neutral-cream via-surface-paper to-neutral-ivory overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6"
              variants={fadeInUp}
            >
              Create & Cherish 
              <motion.span 
                className="text-primary-500 font-script block mt-2"
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
                Collaborative Digital Keepsakes
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Transform heartfelt messages, photos, and memories into beautiful, personalized digital books. 
              Whether it's a graduation tribute or a group appreciation exchange, JoinedInk helps you create 
              lasting memories together.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeInUp}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-full sm:w-auto"
              >
                <Link to="/register" className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center shadow-warm hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto">
                  Start Creating
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-full sm:w-auto"
              >
                <a href="#how-it-works" className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-medium py-4 px-8 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 block text-center w-full sm:w-auto">
                  How It Works
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-20 left-10 opacity-20"
          animate={floatAnimation}
        >
          <HeartIcon className="h-16 w-16 text-accent-rose" />
        </motion.div>
        <motion.div 
          className="absolute bottom-20 right-10 opacity-20"
          animate={pulseAnimation}
        >
          <SparklesIcon className="h-20 w-20 text-accent-sage" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Two Beautiful Ways to Connect
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Choose the perfect format for your special occasion
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-12 mb-20"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Individual Tribute */}
            <motion.div 
              className="bg-surface-card p-8 text-center rounded-2xl shadow-soft border border-surface-border"
              variants={fadeInLeft}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                transition: { duration: 0.3 }
              }}
            >
              <motion.div 
                className="bg-accent-sage bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <UserGroupIcon className="h-8 w-8 text-accent-sage" />
              </motion.div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">Individual Tribute</h3>
              <p className="text-text-secondary mb-6">
                Many contributors write heartfelt messages for one special recipient. Perfect for 
                graduations, farewells, birthdays, or appreciation events.
              </p>
              <motion.ul 
                className="text-left space-y-2 text-text-secondary"
                variants={staggerContainer}
              >
                <motion.li className="flex items-center" variants={fadeInUp}>
                  <CheckIcon className="h-5 w-5 text-accent-sage mr-2" />
                  Multiple contributors, one recipient
                </motion.li>
                <motion.li className="flex items-center" variants={fadeInUp}>
                  <CheckIcon className="h-5 w-5 text-accent-sage mr-2" />
                  Anonymous or named contributions
                </motion.li>
                <motion.li className="flex items-center" variants={fadeInUp}>
                  <CheckIcon className="h-5 w-5 text-accent-sage mr-2" />
                  Beautiful compiled keepsake book
                </motion.li>
              </motion.ul>
            </motion.div>

            {/* Circle Notes */}
            <motion.div 
              className="bg-surface-card p-8 text-center rounded-2xl shadow-soft border border-surface-border"
              variants={fadeInRight}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                transition: { duration: 0.3 }
              }}
            >
              <motion.div 
                className="bg-accent-rose bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <HeartIcon className="h-8 w-8 text-accent-rose" />
              </motion.div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">Circle Notes</h3>
              <p className="text-text-secondary mb-6">
                Everyone in a group writes notes to everyone else. Each person receives their own 
                personalized keepsake book filled with messages from the entire group.
              </p>
              <motion.ul 
                className="text-left space-y-2 text-text-secondary"
                variants={staggerContainer}
              >
                <motion.li className="flex items-center" variants={fadeInUp}>
                  <CheckIcon className="h-5 w-5 text-accent-rose mr-2" />
                  Everyone writes for everyone
                </motion.li>
                <motion.li className="flex items-center" variants={fadeInUp}>
                  <CheckIcon className="h-5 w-5 text-accent-rose mr-2" />
                  Individual books for each person
                </motion.li>
                <motion.li className="flex items-center" variants={fadeInUp}>
                  <CheckIcon className="h-5 w-5 text-accent-rose mr-2" />
                  Perfect for team exchanges
                </motion.li>
              </motion.ul>
            </motion.div>
          </motion.div>

          {/* Creative Tools */}
          <motion.div 
            className="text-center mb-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              Express Yourself with Creative Tools
            </h3>
            <p className="text-text-secondary mb-8">
              Add personality and warmth to every message
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div 
              className="text-center"
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <DocumentTextIcon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              </motion.div>
              <h4 className="font-semibold text-text-primary mb-2">Rich Text</h4>
              <p className="text-sm text-text-tertiary">Custom fonts and formatting</p>
            </motion.div>
            <motion.div 
              className="text-center"
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                whileHover={{ rotate: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <PhotoIcon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              </motion.div>
              <h4 className="font-semibold text-text-primary mb-2">Photos</h4>
              <p className="text-sm text-text-tertiary">Upload meaningful images</p>
            </motion.div>
            <motion.div 
              className="text-center"
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <PaintBrushIcon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              </motion.div>
              <h4 className="font-semibold text-text-primary mb-2">Drawings</h4>
              <p className="text-sm text-text-tertiary">Hand-drawn doodles and art</p>
            </motion.div>
            <motion.div 
              className="text-center"
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                whileHover={{ rotate: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <GifIcon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              </motion.div>
              <h4 className="font-semibold text-text-primary mb-2">Digital Signature</h4>
              <p className="text-sm text-text-tertiary">Personal touch with signatures</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-neutral-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              How It Works
            </h2>
            <p className="text-xl text-text-secondary">
              Creating meaningful keepsakes is simple and intuitive
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div 
              className="text-center"
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div 
                className="bg-primary-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 font-bold text-lg shadow-warm"
                whileHover={{ 
                  scale: 1.1, 
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)" 
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                1
              </motion.div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Create Event</h3>
              <p className="text-text-secondary">
                Set up your event, add recipients, and choose between Individual Tribute or Circle Notes format.
              </p>
            </motion.div>
            <motion.div 
              className="text-center"
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div 
                className="bg-primary-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 font-bold text-lg shadow-warm"
                whileHover={{ 
                  scale: 1.1, 
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)" 
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                2
              </motion.div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Share Links</h3>
              <p className="text-text-secondary">
                Share unique contributor links with friends, family, or team members. No accounts required for contributors.
              </p>
            </motion.div>
            <motion.div 
              className="text-center"
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div 
                className="bg-primary-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 font-bold text-lg shadow-warm"
                whileHover={{ 
                  scale: 1.1, 
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)" 
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                3
              </motion.div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Deliver Magic</h3>
              <p className="text-text-secondary">
                We compile everything into beautiful digital keepsake books and deliver them to recipients via email.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-primary-500 to-primary-700 text-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-6"
            variants={fadeInUp}
          >
            Ready to Create Something Beautiful?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90"
            variants={fadeInUp}
          >
            Start your first keepsake event today and bring people together through meaningful memories.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link to="/register" className="bg-white text-primary-600 hover:bg-neutral-ivory font-medium py-3 px-8 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5">
                Get Started Free
              </Link>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5">
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}; 