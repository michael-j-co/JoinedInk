import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterOptions {
  search: string;
  status: 'all' | 'active' | 'expired' | 'closed';
  role: 'all' | 'organizer' | 'participant';
  eventType: 'all' | 'INDIVIDUAL_TRIBUTE' | 'CIRCLE_NOTES';
  sortBy: 'deadline' | 'created' | 'contributions';
  sortOrder: 'asc' | 'desc';
}

interface SearchAndFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  resultCount?: number;
  className?: string;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  filters,
  onFiltersChange,
  resultCount,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const hasActiveFilters = () => {
    return filters.status !== 'all' || 
           filters.role !== 'all' || 
           filters.eventType !== 'all' ||
           filters.search.length > 0;
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      role: 'all',
      eventType: 'all',
      sortBy: 'deadline',
      sortOrder: 'asc'
    });
    setIsExpanded(false);
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <motion.div 
      className={`bg-surface-paper rounded-lg border border-surface-border shadow-soft ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <motion.div
              className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                searchFocused ? 'text-primary-600' : 'text-text-tertiary'
              }`}
              animate={{ scale: searchFocused ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 bg-surface-paper text-text-primary"
            />
            {filters.search && (
              <motion.button
                onClick={() => updateFilter('search', '')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text-secondary"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </div>

          {/* Filter Toggle */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
              hasActiveFilters() 
                ? 'border-primary-300 bg-primary-50 text-primary-700' 
                : 'border-neutral-warm bg-surface-paper text-text-secondary hover:bg-neutral-warm'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters() && (
              <motion.span
                className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                {[filters.status, filters.role, filters.eventType].filter(f => f !== 'all').length + (filters.search ? 1 : 0)}
              </motion.span>
            )}
            <motion.svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.button>
        </div>

        {/* Results Count */}
        {resultCount !== undefined && (
          <motion.div
            className="text-sm text-text-secondary mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {resultCount} {resultCount === 1 ? 'event' : 'events'} found
            {hasActiveFilters() && (
              <motion.button
                onClick={clearAllFilters}
                className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear all filters
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Expanded Filters */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="border-t border-surface-border pt-4 mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 bg-surface-paper text-text-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Your Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => updateFilter('role', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 bg-surface-paper text-text-primary"
                  >
                    <option value="all">All Roles</option>
                    <option value="organizer">Organizer</option>
                    <option value="participant">Participant</option>
                  </select>
                </div>

                {/* Event Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Event Type</label>
                  <select
                    value={filters.eventType}
                    onChange={(e) => updateFilter('eventType', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 bg-surface-paper text-text-primary"
                  >
                    <option value="all">All Types</option>
                    <option value="INDIVIDUAL_TRIBUTE">Individual Tribute</option>
                    <option value="CIRCLE_NOTES">Circle Notes</option>
                  </select>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mt-4 pt-4 border-t border-surface-border">
                <label className="block text-sm font-medium text-text-secondary mb-2">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="px-3 py-2 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 bg-surface-paper text-text-primary"
                  >
                    <option value="deadline">Deadline</option>
                    <option value="created">Date Created</option>
                    <option value="contributions">Contributions</option>
                  </select>
                  <motion.button
                    onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-neutral-warm rounded-lg hover:bg-neutral-warm transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filters.sortOrder === 'asc' ? "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" : "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"} />
                    </svg>
                    <span className="text-sm">{filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Helper function to filter events
export const filterEvents = <T extends any>(events: T[], filters: FilterOptions, getters: {
  getStatus: (event: T) => string;
  getRole: (event: T) => string;
  getEventType: (event: T) => string;
  getTitle: (event: T) => string;
  getDescription?: (event: T) => string;
  getDeadline: (event: T) => string;
  getCreatedAt: (event: T) => string;
  getContributions: (event: T) => number;
}) => {
  let filtered = [...events];

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(event => {
      const title = getters.getTitle(event).toLowerCase();
      const description = getters.getDescription?.(event)?.toLowerCase() || '';
      return title.includes(searchTerm) || description.includes(searchTerm);
    });
  }

  // Status filter
  if (filters.status !== 'all') {
    filtered = filtered.filter(event => getters.getStatus(event) === filters.status);
  }

  // Role filter
  if (filters.role !== 'all') {
    filtered = filtered.filter(event => getters.getRole(event) === filters.role);
  }

  // Event type filter
  if (filters.eventType !== 'all') {
    filtered = filtered.filter(event => getters.getEventType(event) === filters.eventType);
  }

  // Sort
  filtered.sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (filters.sortBy) {
      case 'deadline':
        aValue = new Date(getters.getDeadline(a));
        bValue = new Date(getters.getDeadline(b));
        break;
      case 'created':
        aValue = new Date(getters.getCreatedAt(a));
        bValue = new Date(getters.getCreatedAt(b));
        break;
      case 'contributions':
        aValue = getters.getContributions(a);
        bValue = getters.getContributions(b);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return filtered;
}; 