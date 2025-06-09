import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/outline';

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface ProgressIndicatorProps {
  steps: ProgressStep[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'minimal' | 'detailed';
  showLabels?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  orientation = 'horizontal',
  variant = 'default',
  showLabels = true,
  className = ''
}) => {
  const isVertical = orientation === 'vertical';
  
  if (isVertical) {
    return (
      <div className={`progress-indicator ${className}`}>
        <div className="flex flex-col space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-row items-start w-full">
              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: step.isCurrent ? 1.1 : 1, 
                    opacity: 1 
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20,
                    duration: 0.5 
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
                    step.isCompleted 
                      ? 'bg-gradient-to-r from-accent-sage to-green-500 text-white shadow-lg'
                      : step.isCurrent
                      ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg'
                      : 'bg-neutral-warm text-text-tertiary border-2 border-neutral-stone'
                  }`}
                >
                  {step.isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: 0.2,
                        type: "spring", 
                        stiffness: 400, 
                        damping: 15 
                      }}
                    >
                      <CheckIcon className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm font-semibold"
                    >
                      {index + 1}
                    </motion.span>
                  )}
                  
                  {/* Current step pulse animation */}
                  {step.isCurrent && (
                    <motion.div
                      animate={{ 
                        scale: [1, 1.4, 1],
                        opacity: [0.3, 0.1, 0.3] 
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                      className="absolute inset-0 rounded-full bg-primary-400"
                    />
                  )}
                </motion.div>
                
                {/* Connection Line for Vertical */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ 
                      delay: 0.5 + index * 0.1,
                      duration: 0.8,
                      ease: "easeInOut"
                    }}
                    className="w-0.5 h-8 mt-2 relative"
                  >
                    <div className={`absolute inset-0 ${
                      steps[index + 1].isCompleted || (step.isCompleted && steps[index + 1].isCurrent)
                        ? 'bg-gradient-to-r from-accent-sage to-green-500'
                        : step.isCompleted
                        ? 'bg-gradient-to-r from-primary-400 to-primary-600'
                        : 'bg-neutral-stone'
                    } rounded-full`} />
                    
                    {/* Animated progress fill */}
                    {step.isCompleted && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ 
                          delay: 0.6 + index * 0.1,
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                        className={`absolute inset-0 bg-gradient-to-r from-accent-sage to-green-500 rounded-full`}
                      />
                    )}
                  </motion.div>
                )}
              </div>
              
              {/* Step Labels for Vertical */}
              {showLabels && (
                <div className="ml-4 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`font-medium text-sm ${
                      step.isCompleted || step.isCurrent 
                        ? 'text-text-primary' 
                        : 'text-text-tertiary'
                    }`}
                  >
                    {step.label}
                  </motion.div>
                  {variant === 'detailed' && step.description && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xs text-text-secondary mt-1"
                    >
                      {step.description}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal Layout
  return (
    <div className={`progress-indicator ${className}`}>
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Container */}
            <div className="flex flex-col items-center">
              {/* Step Circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: step.isCurrent ? 1.1 : 1, 
                  opacity: 1 
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  duration: 0.5 
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
                  step.isCompleted 
                    ? 'bg-gradient-to-r from-accent-sage to-green-500 text-white shadow-lg'
                    : step.isCurrent
                    ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg'
                    : 'bg-neutral-warm text-text-tertiary border-2 border-neutral-stone'
                }`}
              >
                {step.isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      delay: 0.2,
                      type: "spring", 
                      stiffness: 400, 
                      damping: 15 
                    }}
                  >
                    <CheckIcon className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm font-semibold"
                  >
                    {index + 1}
                  </motion.span>
                )}
                
                {/* Current step pulse animation */}
                {step.isCurrent && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 0.1, 0.3] 
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="absolute inset-0 rounded-full bg-primary-400"
                  />
                )}
              </motion.div>
              
              {/* Step Labels */}
              {showLabels && (
                <div className="mt-3 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`font-medium text-sm whitespace-nowrap ${
                      step.isCompleted || step.isCurrent 
                        ? 'text-text-primary' 
                        : 'text-text-tertiary'
                    }`}
                  >
                    {step.label}
                  </motion.div>
                  {variant === 'detailed' && step.description && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xs text-text-secondary mt-1 whitespace-nowrap"
                    >
                      {step.description}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
            
            {/* Connection Line */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ 
                  delay: 0.5 + index * 0.1,
                  duration: 0.8,
                  ease: "easeInOut"
                }}
                className="h-0.5 flex-1 mx-4 relative"
              >
                <div className={`absolute inset-0 ${
                  steps[index + 1].isCompleted || (step.isCompleted && steps[index + 1].isCurrent)
                    ? 'bg-gradient-to-r from-accent-sage to-green-500'
                    : step.isCompleted
                    ? 'bg-gradient-to-r from-primary-400 to-primary-600'
                    : 'bg-neutral-stone'
                } rounded-full`} />
                
                {/* Animated progress fill */}
                {step.isCompleted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ 
                      delay: 0.6 + index * 0.1,
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                    className={`absolute inset-0 bg-gradient-to-r from-accent-sage to-green-500 rounded-full`}
                  />
                )}
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Contribution Creation Progress Component
export const ContributionProgressIndicator: React.FC<{
  currentStep: 'writing' | 'adding-media' | 'preview' | 'submitting' | 'complete';
  recipientName?: string;
  className?: string;
}> = ({ currentStep, recipientName, className = '' }) => {
  const steps: ProgressStep[] = [
    {
      id: 'writing',
      label: 'Writing',
      description: 'Craft your message',
      isCompleted: ['adding-media', 'preview', 'submitting', 'complete'].includes(currentStep),
      isCurrent: currentStep === 'writing'
    },
    {
      id: 'adding-media',
      label: 'Enhance',
      description: 'Add photos & drawings',
      isCompleted: ['preview', 'submitting', 'complete'].includes(currentStep),
      isCurrent: currentStep === 'adding-media'
    },
    {
      id: 'preview',
      label: 'Preview',
      description: 'Review your creation',
      isCompleted: ['submitting', 'complete'].includes(currentStep),
      isCurrent: currentStep === 'preview'
    },
    {
      id: 'submitting',
      label: 'Sending',
      description: 'Adding to keepsake',
      isCompleted: currentStep === 'complete',
      isCurrent: currentStep === 'submitting'
    }
  ];

  return (
    <motion.div 
      className={`bg-surface-paper rounded-xl p-4 border border-surface-border shadow-soft ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <motion.h4 
          className="text-sm font-medium text-text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {recipientName ? `Writing for ${recipientName}` : 'Creating Your Message'}
        </motion.h4>
        <motion.p 
          className="text-xs text-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {currentStep === 'complete' 
            ? 'Message sent successfully!' 
            : 'Follow the steps to create a beautiful contribution'
          }
        </motion.p>
      </div>
      <ProgressIndicator 
        steps={steps} 
        variant="detailed"
        orientation="horizontal"
        className="px-2"
      />
    </motion.div>
  );
}; 