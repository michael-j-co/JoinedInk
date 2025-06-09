import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'heart' | 'book' | 'sparkles' | 'ink' | 'pulse';
  message?: string;
  theme?: 'light' | 'dark' | 'cream';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const messageSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

const themeColors = {
  light: {
    primary: 'text-primary-500',
    secondary: 'text-accent-rose',
    tertiary: 'text-accent-sage',
    text: 'text-text-secondary',
    bg: 'bg-white/90'
  },
  dark: {
    primary: 'text-white',
    secondary: 'text-rose-300',
    tertiary: 'text-green-300',
    text: 'text-gray-300',
    bg: 'bg-gray-900/90'
  },
  cream: {
    primary: 'text-primary-600',
    secondary: 'text-accent-rose',
    tertiary: 'text-accent-sage',
    text: 'text-text-primary',
    bg: 'bg-neutral-cream/95'
  }
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'heart',
  message,
  theme = 'cream',
  className = ''
}) => {
  const colors = themeColors[theme];
  const iconSize = sizeClasses[size];
  const messageSize = messageSizes[size];

  const renderSpinner = () => {
    switch (variant) {
      case 'heart':
        return (
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`${iconSize} ${colors.secondary}`}
            >
              <HeartIcon className="w-full h-full" />
            </motion.div>
            <motion.div
              animate={{
                scale: [1.2, 1.4, 1.2],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
              className={`absolute inset-0 ${iconSize} ${colors.primary}`}
            >
              <HeartIcon className="w-full h-full" />
            </motion.div>
          </div>
        );

      case 'book':
        return (
          <motion.div
            animate={{
              rotateY: [0, 180, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`${iconSize} ${colors.primary}`}
          >
            <BookOpenIcon className="w-full h-full" />
          </motion.div>
        );

      case 'sparkles':
        return (
          <div className="relative">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  rotate: [0, 360],
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
                className={`${iconSize} ${index % 2 === 0 ? colors.secondary : colors.tertiary}`}
                style={{
                  position: index === 0 ? 'relative' : 'absolute',
                  top: index === 0 ? 0 : '50%',
                  left: index === 0 ? 0 : '50%',
                  transform: index === 0 ? 'none' : 'translate(-50%, -50%)'
                }}
              >
                <SparklesIcon className="w-full h-full" />
              </motion.div>
            ))}
          </div>
        );

      case 'ink':
        return (
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className={`${iconSize} border-4 border-transparent rounded-full`}
              style={{
                borderTopColor: 'currentColor',
                borderRightColor: 'currentColor'
              }}
            >
              <div className={`w-full h-full ${colors.primary}`} />
            </motion.div>
            <motion.div
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute inset-2 ${colors.secondary} rounded-full`}
            />
          </div>
        );

      case 'pulse':
        return (
          <div className="relative">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [0.8, 1.5, 0.8],
                  opacity: [0.7, 0, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: index * 0.4
                }}
                className={`absolute inset-0 ${iconSize} ${colors.primary} rounded-full border-2 border-current`}
              />
            ))}
            <div className={`relative z-10 ${iconSize} ${colors.secondary} rounded-full border-2 border-current`} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderSpinner()}
      
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`${messageSize} ${colors.text} text-center font-medium`}
        >
          {message}
        </motion.p>
      )}
      
      {/* Ambient dots animation */}
      <motion.div
        className="flex space-x-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              y: [-2, 2, -2],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.2
            }}
            className={`w-1.5 h-1.5 ${colors.tertiary} rounded-full`}
          />
        ))}
      </motion.div>
    </div>
  );
};

// Pre-configured loading states for common use cases
export const PageLoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-neutral-cream to-neutral-ivory flex items-center justify-center">
    <div className="bg-surface-paper rounded-2xl shadow-soft-lg p-8 border border-surface-border">
      <LoadingSpinner
        size="lg"
        variant="heart"
        message={message}
        theme="cream"
      />
    </div>
  </div>
);

export const ContentLoadingSpinner: React.FC<{ message?: string; className?: string }> = ({ 
  message = "Loading content...", 
  className = "" 
}) => (
  <div className={`flex items-center justify-center py-8 ${className}`}>
    <LoadingSpinner
      size="md"
      variant="book"
      message={message}
      theme="cream"
    />
  </div>
);

export const ButtonLoadingSpinner: React.FC<{ variant?: 'heart' | 'ink' }> = ({ variant = 'ink' }) => (
  <LoadingSpinner
    size="sm"
    variant={variant}
    theme="light"
    className="text-white"
  />
);

export const OverlayLoadingSpinner: React.FC<{ message?: string }> = ({ message = "Processing..." }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full border border-gray-100">
      <LoadingSpinner
        size="lg"
        variant="sparkles"
        message={message}
        theme="light"
      />
    </div>
  </div>
); 