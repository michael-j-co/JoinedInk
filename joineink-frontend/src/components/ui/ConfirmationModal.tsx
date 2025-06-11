import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  CheckCircleIcon, 
  SparklesIcon,
  BookOpenIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'message-submitted' | 'message-updated' | 'all-messages-updated' | 'event-created' | 'circle-complete' | 'keepsake-sent' | 'custom';
  title?: string;
  message?: string;
  recipientName?: string;
  eventTitle?: string;
  nextAction?: {
    text: string;
    onClick: () => void;
  };
  autoClose?: boolean;
  autoCloseDelay?: number;
  theme?: 'heart' | 'celebration' | 'sparkles' | 'book' | 'success';
}

const themeConfig = {
  heart: {
    icon: HeartIcon,
    primary: 'from-rose-400 to-pink-500',
    secondary: 'bg-rose-50',
    accent: 'text-rose-600',
    border: 'border-rose-200'
  },
  celebration: {
    icon: StarIcon,
    primary: 'from-yellow-400 to-orange-500', 
    secondary: 'bg-yellow-50',
    accent: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  sparkles: {
    icon: SparklesIcon,
    primary: 'from-purple-400 to-indigo-500',
    secondary: 'bg-purple-50', 
    accent: 'text-purple-600',
    border: 'border-purple-200'
  },
  book: {
    icon: BookOpenIcon,
    primary: 'from-emerald-400 to-green-500',
    secondary: 'bg-emerald-50',
    accent: 'text-emerald-600', 
    border: 'border-emerald-200'
  },
  success: {
    icon: CheckCircleIcon,
    primary: 'from-green-400 to-emerald-500',
    secondary: 'bg-green-50',
    accent: 'text-green-600',
    border: 'border-green-200'
  }
};

const getConfirmationContent = (type: string, recipientName?: string, eventTitle?: string) => {
  switch (type) {
    case 'message-submitted':
      return {
        title: '✨ Message Sent!',
        message: recipientName 
          ? `Your heartfelt message for ${recipientName} has been added to their keepsake book. They'll treasure this memory forever.`
          : 'Your heartfelt message has been submitted successfully. It will be treasured forever.',
        theme: 'heart' as const,
        emoji: '💝'
      };
    
    case 'message-updated': 
      return {
        title: '📝 Message Updated!',
        message: recipientName
          ? `Your message for ${recipientName} has been updated beautifully. Every word will be cherished.`
          : 'Your message has been updated successfully. Every word will be cherished.',
        theme: 'success' as const,
        emoji: '✨'
      };
      
    case 'all-messages-updated':
      return {
        title: '🎊 All Messages Updated!',
        message: 'You\'ve finished updating all your messages! Your heartfelt words have been saved and will create beautiful memories.',
        theme: 'celebration' as const,
        emoji: '🌟'
      };
      
    case 'event-created':
      return {
        title: '🎉 Event Created!',
        message: eventTitle
          ? `"${eventTitle}" is ready to collect beautiful memories. Share the magic with your contributors!`
          : 'Your keepsake event is ready to collect beautiful memories!',
        theme: 'celebration' as const,
        emoji: '🎊'
      };
      
    case 'circle-complete':
      return {
        title: '🌟 Circle Complete!',
        message: 'You\'ve shared love with everyone in the circle! All your heartfelt messages have been sent and will create lasting memories.',
        theme: 'sparkles' as const,
        emoji: '🫶'
      };
      
    case 'keepsake-sent':
      return {
        title: '📖 Keepsakes Delivered!',
        message: 'Beautiful keepsake books have been sent to all recipients. They\'ll receive personalized emails with links to their treasured memories.',
        theme: 'book' as const,
        emoji: '💌'
      };
      
    default:
      return {
        title: '✓ Success!',
        message: 'Your action completed successfully.',
        theme: 'success' as const,
        emoji: '✅'
      };
  }
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  recipientName,
  eventTitle,
  nextAction,
  autoClose = true,
  autoCloseDelay = 4000,
  theme
}) => {
  const defaultContent = getConfirmationContent(type, recipientName, eventTitle);
  const finalTheme = theme || defaultContent.theme;
  const config = themeConfig[finalTheme];
  const IconComponent = config.icon;

  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            {/* Header with gradient background */}
            <div className={`bg-gradient-to-r ${config.primary} p-6 text-center relative`}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
              >
                <IconComponent className="w-8 h-8 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white mb-2"
              >
                {title || defaultContent.title}
              </motion.div>
              
              {/* Enhanced floating particles animation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-white rounded-full"
                    style={{
                      width: Math.random() * 4 + 2 + 'px',
                      height: Math.random() * 4 + 2 + 'px',
                      left: `${10 + i * 7}%`,
                      top: `${30 + (i % 2) * 40}%`
                    }}
                    animate={{
                      y: [-15, 15, -15],
                      x: [0, (Math.random() - 0.5) * 20, 0],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [0.6, 1.4, 0.6],
                      rotate: [0, 360, 720]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">
                  {defaultContent.emoji}
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {message || defaultContent.message}
                </p>
                
                {nextAction && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextAction.onClick}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        nextAction.onClick();
                      }
                    }}
                    type="button"
                    tabIndex={0}
                    role="button"
                    aria-label={nextAction.text}
                    className={`bg-gradient-to-r ${config.primary} text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    {nextAction.text}
                  </motion.button>
                )}
                
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={onClose}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onClose();
                    }
                  }}
                  type="button"
                  tabIndex={0}
                  role="button"
                  aria-label={nextAction ? 'Close modal' : 'Continue'}
                  className={`text-gray-500 hover:text-gray-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 ${nextAction ? 'block' : ''}`}
                >
                  {nextAction ? 'Close' : 'Continue'}
                </motion.button>
              </motion.div>
              
              {/* Progress bar for auto-close */}
              {autoClose && (
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${config.primary}`}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Success notification component for inline use
export const SuccessNotification: React.FC<{
  message: string;
  isVisible: boolean;
  onClose: () => void;
  position?: 'top' | 'bottom';
}> = ({ message, isVisible, onClose, position = 'top' }) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -50 : 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === 'top' ? -50 : 50, scale: 0.95 }}
          className={`fixed ${position === 'top' ? 'top-4' : 'bottom-4'} left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4`}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-green-200 overflow-hidden">
            <div className="flex items-center p-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-800 font-medium flex-1">{message}</p>
              <button
                onClick={onClose}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClose();
                  }
                }}
                type="button"
                tabIndex={0}
                role="button"
                aria-label="Close notification"
                className="text-gray-400 hover:text-gray-600 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <motion.div
              className="h-1 bg-green-500"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 