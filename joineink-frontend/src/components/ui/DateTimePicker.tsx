import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  className?: string;
  disabled?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date and time",
  minDate,
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState({
    hours: selectedDate ? (selectedDate.getHours() === 0 ? 12 : selectedDate.getHours() > 12 ? selectedDate.getHours() - 12 : selectedDate.getHours()) : 11,
    minutes: selectedDate ? selectedDate.getMinutes() : 59,
    period: selectedDate ? (selectedDate.getHours() >= 12 ? 'PM' : 'AM') : 'PM'
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayValue = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month's days to fill the grid
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    const newDate = new Date(date);
    const hours24 = selectedTime.period === 'PM' && selectedTime.hours !== 12 
      ? selectedTime.hours + 12 
      : selectedTime.period === 'AM' && selectedTime.hours === 12 
        ? 0 
        : selectedTime.hours;
    
    newDate.setHours(hours24, selectedTime.minutes, 0, 0);
    setSelectedDate(newDate);
    
    const isoString = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
    onChange(isoString);
  };

  const handleTimeChange = (field: 'hours' | 'minutes' | 'period', value: number | string) => {
    const newTime = { ...selectedTime, [field]: value };
    setSelectedTime(newTime);
    
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      const hours24 = newTime.period === 'PM' && newTime.hours !== 12 
        ? newTime.hours + 12 
        : newTime.period === 'AM' && newTime.hours === 12 
          ? 0 
          : newTime.hours;
      
      newDate.setHours(hours24, newTime.minutes, 0, 0);
      setSelectedDate(newDate);
      
      const isoString = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000))
        .toISOString()
        .slice(0, 16);
      onChange(isoString);
    }
  };

  const isDateDisabled = (date: Date) => {
    if (!minDate) return false;
    const minDateTime = new Date(minDate);
    return date < minDateTime;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-neutral-warm rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-surface-paper text-text-primary text-left flex items-center justify-between transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400'
        }`}
      >
        <span className={selectedDate ? 'text-text-primary' : 'text-text-muted'}>
          {selectedDate ? formatDisplayValue(selectedDate) : placeholder}
        </span>
        <CalendarIcon className="h-5 w-5 text-text-secondary" />
      </button>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-surface-paper border border-surface-border rounded-xl shadow-soft-lg z-50 p-4 min-w-[320px]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-neutral-ivory rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4 text-text-secondary" />
            </button>
            
            <h3 className="text-lg font-semibold text-text-primary">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-neutral-ivory rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-4 w-4 text-text-secondary" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-text-tertiary py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {days.map(({ date, isCurrentMonth }, index) => {
              const disabled = isDateDisabled(date);
              const today = isToday(date);
              const selected = isSelected(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !disabled && isCurrentMonth && handleDateSelect(date)}
                  disabled={disabled || !isCurrentMonth}
                  className={`
                    h-8 w-8 text-sm rounded-lg transition-all
                    ${!isCurrentMonth ? 'text-text-muted opacity-30' : ''}
                    ${today && !selected ? 'bg-accent-sage bg-opacity-20 text-accent-sage font-semibold' : ''}
                    ${selected ? 'bg-primary-500 text-white font-semibold' : ''}
                    ${!selected && !today && isCurrentMonth ? 'hover:bg-neutral-ivory text-text-primary' : ''}
                    ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Time Picker */}
          <div className="border-t border-surface-border pt-4">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="h-4 w-4 text-text-secondary" />
              <span className="text-sm font-medium text-text-secondary">Time</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Hours */}
              <select
                value={selectedTime.hours}
                onChange={(e) => handleTimeChange('hours', parseInt(e.target.value))}
                className="px-3 py-2 border border-neutral-warm rounded-lg bg-surface-paper text-text-primary focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                  <option key={hour} value={hour}>{hour.toString().padStart(2, '0')}</option>
                ))}
              </select>

              <span className="text-text-secondary">:</span>

              {/* Minutes */}
              <select
                value={selectedTime.minutes}
                onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value))}
                className="px-3 py-2 border border-neutral-warm rounded-lg bg-surface-paper text-text-primary focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                  <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}</option>
                ))}
              </select>

              {/* AM/PM */}
              <select
                value={selectedTime.period}
                onChange={(e) => handleTimeChange('period', e.target.value)}
                className="px-3 py-2 border border-neutral-warm rounded-lg bg-surface-paper text-text-primary focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-neutral-warm text-text-secondary rounded-lg hover:bg-neutral-ivory transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 