import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface HoverOverlayProps {
  englishText: string;
  frenchText?: string;
  children: React.ReactNode;
  className?: string;
}

export const HoverOverlay: React.FC<HoverOverlayProps> = ({
  englishText,
  frenchText,
  children,
  className = ''
}) => {
  const { language } = useLanguage();
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const calculateOptimalPosition = (rect: DOMRect) => {
    const padding = 10;
    const overlayWidth = 300; // Approximate overlay width
    const overlayHeight = 150; // Approximate overlay height
    
    let x = rect.right + padding;
    let y = rect.top;
    
    // Check if overlay would go off the right edge
    if (x + overlayWidth > window.innerWidth) {
      // Try positioning to the left
      x = rect.left - overlayWidth - padding;
      
      // If still off-screen to the left, position within viewport
      if (x < 0) {
        x = Math.min(rect.right + padding, window.innerWidth - overlayWidth - padding);
        if (x < padding) x = padding;
      }
    }
    
    // Check if overlay would go off the bottom edge
    if (y + overlayHeight > window.innerHeight) {
      // Position above the element
      y = rect.top - overlayHeight - padding;
      
      // If still off-screen at the top, position within viewport
      if (y < 0) {
        y = Math.max(rect.bottom + padding, padding);
        if (y + overlayHeight > window.innerHeight) {
          y = window.innerHeight - overlayHeight - padding;
        }
      }
    }
    
    // Ensure minimum distance from viewport edges
    x = Math.max(padding, Math.min(x, window.innerWidth - overlayWidth - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - overlayHeight - padding));
    
    return { x, y };
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      const position = calculateOptimalPosition(rect);
      setOverlayPosition(position);
    }

    timeoutRef.current = setTimeout(() => {
      setShowOverlay(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowOverlay(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (showOverlay && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const position = calculateOptimalPosition(rect);
        setOverlayPosition(position);
      }
    };

    if (showOverlay) {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [showOverlay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const overlayText = language === 'en' ? frenchText : englishText;
  const shouldShowOverlay = overlayText && overlayText !== (language === 'en' ? englishText : frenchText);

  if (!shouldShowOverlay) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      ref={elementRef}
      className={`hover-overlay-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showOverlay && (
        <div 
          className="hover-overlay"
          style={{
            left: overlayPosition.x,
            top: overlayPosition.y
          }}
          onMouseEnter={() => setShowOverlay(true)}
          onMouseLeave={handleMouseLeave}
        >
          {overlayText}
        </div>
      )}
    </div>
  );
};