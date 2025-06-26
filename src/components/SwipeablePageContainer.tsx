
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SwipeablePageContainerProps {
  children: React.ReactNode;
  routes: string[];
  currentIndex: number;
}

const SwipeablePageContainer: React.FC<SwipeablePageContainerProps> = ({ 
  children, 
  routes, 
  currentIndex 
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number | null>(null);
  const threshold = 100; // minimum distance to trigger page change
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX !== null) {
      setCurrentX(e.touches[0].clientX);
    }
  };
  
  const handleTouchEnd = () => {
    if (startX !== null && currentX !== null) {
      const diff = currentX - startX;
      
      // Determine if the swipe is significant enough to change pages
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentIndex > 0) {
          // Swiped right, go to previous page
          navigate(routes[currentIndex - 1]);
        } else if (diff < 0 && currentIndex < routes.length - 1) {
          // Swiped left, go to next page
          navigate(routes[currentIndex + 1]);
        }
      }
    }
    
    // Reset values
    setStartX(null);
    setCurrentX(null);
  };
  
  // Calculate transform based on swipe position
  const getTransform = () => {
    if (startX === null || currentX === null) return 'translateX(0)';
    
    const diff = currentX - startX;
    // Limit the drag to prevent swiping too far
    const maxSwipe = 100;
    const constrainedDiff = Math.max(Math.min(diff, maxSwipe), -maxSwipe);
    
    return `translateX(${constrainedDiff}px)`;
  };
  
  // Add pointer events for desktop support
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
      setStartX(e.clientX);
      setCurrentX(e.clientX);
    }
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (startX !== null && (e.pointerType === 'mouse' || e.pointerType === 'touch')) {
      setCurrentX(e.clientX);
    }
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
      handleTouchEnd();
    }
  };
  
  // Clean up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handlePointerLeave = () => {
      setStartX(null);
      setCurrentX(null);
    };
    
    container.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      container.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);
  
  return (
    <div
      ref={containerRef}
      className="swipeable-container min-h-[calc(100vh-128px)] overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: getTransform(),
        transition: startX === null ? 'transform 0.3s ease' : 'none'
      }}
    >
      {children}
    </div>
  );
};

export default SwipeablePageContainer;
