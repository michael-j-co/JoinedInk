import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, DrawingData } from '../../types';

interface DraggableMediaProps {
  item: MediaItem | DrawingData;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLElement | null>;
  isPreviewMode?: boolean;
}

export const DraggableMedia: React.FC<DraggableMediaProps> = ({
  item,
  onPositionChange,
  containerRef,
  isPreviewMode = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(item.position || { x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);

  // Update position when item.position changes
  useEffect(() => {
    if (item.position) {
      setPosition(item.position);
    }
  }, [item.position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!itemRef.current || !containerRef.current) return;

    const itemRect = itemRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - itemRect.left,
      y: e.clientY - itemRect.top
    });

    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!itemRef.current || !containerRef.current) return;

    const touch = e.touches[0];
    const itemRect = itemRef.current.getBoundingClientRect();

    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - itemRect.left,
      y: touch.clientY - itemRect.top
    });

    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const itemWidth = itemRef.current?.offsetWidth || 0;
    const itemHeight = itemRef.current?.offsetHeight || 0;

    let newX = e.clientX - containerRect.left - dragOffset.x;
    let newY = e.clientY - containerRect.top - dragOffset.y;

    // Add padding to keep items within a reasonable content area
    const padding = 10;
    newX = Math.max(padding, Math.min(newX, containerRect.width - itemWidth - padding));
    newY = Math.max(padding, Math.min(newY, containerRect.height - itemHeight - padding));

    setPosition({ x: newX, y: newY });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    const itemWidth = itemRef.current?.offsetWidth || 0;
    const itemHeight = itemRef.current?.offsetHeight || 0;

    let newX = touch.clientX - containerRect.left - dragOffset.x;
    let newY = touch.clientY - containerRect.top - dragOffset.y;

    // Add padding to keep items within a reasonable content area
    const padding = 10;
    newX = Math.max(padding, Math.min(newX, containerRect.width - itemWidth - padding));
    newY = Math.max(padding, Math.min(newY, containerRect.height - itemHeight - padding));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(item.id, position);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(item.id, position);
    }
  };

  // Add global mouse and touch event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset, position]);

  const isDrawing = 'dataUrl' in item;
  const imageUrl = isDrawing ? item.dataUrl : item.url;
  const altText = isDrawing ? 'Drawing' : (item as MediaItem).alt || 'Media';

  return (
    <div
      ref={itemRef}
      className={`absolute select-none ${
        isDragging ? 'z-50 opacity-75' : 'z-10'
      } ${
        isPreviewMode ? '' : 'hover:ring-2 hover:ring-rose-300 hover:ring-opacity-50'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: item.position?.zIndex || 1
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className={`rounded-lg transition-shadow ${
        isDragging ? 'shadow-lg ring-2 ring-rose-300' : 'shadow-sm'
      }`}>
        <img
          src={imageUrl}
          alt={altText}
          className={`rounded-lg ${
            !isDrawing && (item as MediaItem).type === 'sticker'
              ? 'max-h-16 w-auto'
              : 'max-h-32'
          }`}
          draggable={false}
        />
      </div>
      
      {/* Drag handle indicator */}
      {!isPreviewMode && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-grab" />
      )}
    </div>
  );
}; 