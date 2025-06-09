import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  color: string;
  disabled?: boolean;
}

interface QuickActionsSidebarProps {
  isVisible: boolean;
  onToggle: () => void;
  actions: QuickAction[];
}

export const QuickActionsSidebar: React.FC<QuickActionsSidebarProps> = ({
  isVisible,
  onToggle,
  actions
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={onToggle}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 bg-primary-500 text-white p-3 rounded-full shadow-warm hover:bg-primary-600 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          x: isVisible ? -280 : 0,
          rotate: isVisible ? 180 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-30 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed right-0 top-0 h-full w-80 bg-surface-paper border-l border-surface-border shadow-2xl z-40 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-primary">Quick Actions</h3>
                <motion.button
                  onClick={onToggle}
                  className="text-text-tertiary hover:text-text-secondary p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Actions List */}
              <div className="space-y-3">
                {actions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onHoverStart={() => setHoveredAction(action.id)}
                    onHoverEnd={() => setHoveredAction(null)}
                  >
                    {action.href ? (
                      <Link
                        to={action.href}
                        className={`block p-4 rounded-lg border border-surface-border transition-all duration-200 ${
                          action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:border-primary-200'
                        }`}
                        onClick={action.disabled ? (e) => e.preventDefault() : undefined}
                      >
                        <ActionContent action={action} isHovered={hoveredAction === action.id} />
                      </Link>
                    ) : (
                      <button
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={`w-full text-left p-4 rounded-lg border border-surface-border transition-all duration-200 ${
                          action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:border-primary-200'
                        }`}
                      >
                        <ActionContent action={action} isHovered={hoveredAction === action.id} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-surface-border">
                <p className="text-xs text-text-tertiary text-center">
                  Need help? Check our{' '}
                  <Link to="/help" className="text-primary-600 hover:text-primary-700">
                    documentation
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ActionContent: React.FC<{ action: QuickAction; isHovered: boolean }> = ({ action, isHovered }) => (
  <div className="flex items-start gap-3">
    <motion.div
      className={`p-2 rounded-lg ${action.color} flex-shrink-0`}
      animate={{ 
        scale: isHovered ? 1.1 : 1,
        rotate: isHovered ? 5 : 0
      }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {action.icon}
    </motion.div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-text-primary mb-1">{action.label}</h4>
      <p className="text-xs text-text-secondary leading-relaxed">{action.description}</p>
    </div>
    <motion.svg
      className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      animate={{ x: isHovered ? 3 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </motion.svg>
  </div>
);

// Default quick actions
export const getDefaultQuickActions = (
  onSendReminders?: () => void,
  onViewAnalytics?: () => void
): QuickAction[] => [
  {
    id: 'create-event',
    label: 'Create New Event',
    description: 'Start a new Individual Tribute or Circle Notes',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    href: '/create-event',
    color: 'bg-primary-500'
  },
  {
    id: 'send-reminders',
    label: 'Send Reminders',
    description: 'Notify contributors about pending deadlines',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    onClick: onSendReminders,
    color: 'bg-accent-terracotta'
  },
  {
    id: 'view-templates',
    label: 'Browse Templates',
    description: 'Explore event templates and inspiration',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    href: '/templates',
    color: 'bg-accent-sage'
  },
  {
    id: 'analytics',
    label: 'View Analytics',
    description: 'See engagement stats and insights',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    onClick: onViewAnalytics,
    color: 'bg-accent-gold'
  },
  {
    id: 'help',
    label: 'Help & Support',
    description: 'Get help and contact support',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    href: '/help',
    color: 'bg-neutral-500'
  }
]; 