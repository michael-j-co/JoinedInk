import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <motion.nav 
      className={`flex items-center space-x-2 text-sm ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <motion.svg
              className="w-4 h-4 text-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
          )}
          
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {item.path && !item.isActive ? (
              <Link
                to={item.path}
                className="text-text-secondary hover:text-primary-600 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`${item.isActive ? 'text-primary-600 font-semibold' : 'text-text-primary'}`}>
                {item.label}
              </span>
            )}
          </motion.div>
        </React.Fragment>
      ))}
    </motion.nav>
  );
};

// Hook for automatic breadcrumb generation
export const useBreadcrumbs = () => {
  const location = useLocation();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/dashboard' }
    ];

    pathnames.forEach((pathname, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      let label = pathname.charAt(0).toUpperCase() + pathname.slice(1).replace(/-/g, ' ');
      
      // Custom labels for specific routes
      switch (pathname) {
        case 'create-event':
          label = 'Create Event';
          break;
        case 'contribute':
          label = 'Write Contribution';
          break;
        case 'event':
          label = 'Event Details';
          break;
        default:
          break;
      }

      breadcrumbs.push({
        label,
        path: index === pathnames.length - 1 ? undefined : path,
        isActive: index === pathnames.length - 1
      });
    });

    return breadcrumbs;
  };

  return generateBreadcrumbs();
}; 