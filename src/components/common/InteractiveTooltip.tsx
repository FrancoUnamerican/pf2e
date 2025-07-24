import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { databaseService } from '../../services/database';
import type { PF2eItem } from '../../types';
import './InteractiveTooltip.css';

interface InteractiveTooltipProps {
  item: PF2eItem;
  children: React.ReactNode;
  trigger?: 'hover' | 'click';
  delay?: number;
}

export const InteractiveTooltip: React.FC<InteractiveTooltipProps> = ({
  item,
  children,
  trigger = 'hover',
  delay = 300
}) => {
  const { language } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isPinned, setIsPinned] = useState(false);
  const [fullItem, setFullItem] = useState<PF2eItem | null>(null);
  const [loading, setLoading] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const loadFullItemData = async () => {
    if (fullItem || loading) return;
    
    setLoading(true);
    try {
      // Try to get full item data from database
      const itemData = await databaseService.getItemById(item._id, getTableFromType(item.type || ''));
      setFullItem(itemData || item);
    } catch (error) {
      console.warn('Could not load full item data:', error);
      setFullItem(item);
    } finally {
      setLoading(false);
    }
  };

  const getTableFromType = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'spell': 'spell',
      'feat': 'feat',
      'action': 'action',
      'equipment': 'equipment',
      'weapon': 'weapon',
      'armor': 'armor',
      'consumable': 'consumable',
      'npc': 'npc'
    };
    return typeMap[type] || 'spell';
  };

  const updatePosition = () => {
    if (!elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const tooltipWidth = 400; // Estimated width
    const tooltipHeight = 300; // Estimated height
    const padding = 10;
    
    let x = rect.right + padding;
    let y = rect.top;
    
    // Comprehensive viewport boundary checking
    
    // Check right edge collision
    if (x + tooltipWidth > window.innerWidth) {
      // Try positioning to the left
      x = rect.left - tooltipWidth - padding;
      
      // If still off-screen to the left, center within available space
      if (x < 0) {
        x = Math.max(padding, Math.min(
          rect.left - tooltipWidth/2, 
          window.innerWidth - tooltipWidth - padding
        ));
        
        // Last resort: position at screen edge
        if (x < padding) {
          x = padding;
        }
      }
    }
    
    // Check bottom edge collision
    if (y + tooltipHeight > window.innerHeight) {
      // Try positioning above the element
      y = rect.top - tooltipHeight - padding;
      
      // If still off-screen at the top, position within viewport
      if (y < 0) {
        y = Math.max(padding, Math.min(
          rect.bottom + padding,
          window.innerHeight - tooltipHeight - padding
        ));
      }
    }
    
    // Final boundary enforcement
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipWidth - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipHeight - padding));
    
    setTooltipPosition({ x, y });
  };

  const handleShow = () => {
    if (trigger === 'hover') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      updatePosition();
      timeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
        loadFullItemData();
      }, delay);
    } else {
      updatePosition();
      setShowTooltip(true);
      loadFullItemData();
    }
  };

  const handleHide = () => {
    if (trigger === 'hover' && !isPinned) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowTooltip(false);
    }
  };

  const handlePin = () => {
    setIsPinned(!isPinned);
  };

  const handleClose = () => {
    setShowTooltip(false);
    setIsPinned(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (trigger === 'click' && !isPinned && 
        elementRef.current && !elementRef.current.contains(event.target as Node)) {
      setShowTooltip(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (showTooltip) {
        updatePosition();
      }
    };

    if (showTooltip && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [showTooltip, trigger]);

  const getDescription = (item: PF2eItem): string => {
    const english = item.system?.description?.value || item.system?.details?.publicNotes || 'No description available';
    const french = item.description_fr || item.publicnotes_fr;
    
    // Use language preference to determine which description to return
    return language === 'fr' && french ? french : english;
  };

  const cleanHtmlContent = (html: string): string => {
    // Remove HTML tags and clean up content for cleaner display
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const shouldShowTooltip = showTooltip;
  const displayItem = fullItem || item;
  const description = getDescription(displayItem);

  return (
    <div
      ref={elementRef}
      className="interactive-tooltip-container"
      onMouseEnter={trigger === 'hover' ? handleShow : undefined}
      onMouseLeave={trigger === 'hover' ? handleHide : undefined}
      onClick={trigger === 'click' ? handleShow : undefined}
    >
      {children}
      
      {shouldShowTooltip && (
        <div
          className={`interactive-tooltip single-mode ${isPinned ? 'pinned' : ''}`}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={trigger === 'hover' ? handleHide : undefined}
        >
          <div className="tooltip-header">
            <h3 className="tooltip-title">{displayItem.name}</h3>
            <div className="tooltip-controls">
              {trigger === 'click' && (
                <button
                  className={`pin-button ${isPinned ? 'pinned' : ''}`}
                  onClick={handlePin}
                  title={isPinned ? 'Unpin tooltip' : 'Pin tooltip'}
                >
                  📌
                </button>
              )}
              <button className="close-button" onClick={handleClose} title="Close tooltip">
                ✕
              </button>
            </div>
          </div>
          
          <div className="tooltip-content">
            {loading ? (
              <div className="loading">Loading full details...</div>
            ) : (
              <>
                <div className="single-description">
                  {cleanHtmlContent(description)}
                </div>
                
                {/* Show basic item info only */}
                <div className="item-meta">
                  {displayItem.system?.level?.value && (
                    <span className="meta-item">Level {displayItem.system.level.value}</span>
                  )}
                  {displayItem.system?.traits?.value && displayItem.system.traits.value.length > 0 && (
                    <span className="meta-item">
                      {displayItem.system.traits.value.slice(0, 3).join(', ')}
                      {displayItem.system.traits.value.length > 3 && ` +${displayItem.system.traits.value.length - 3} more`}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="tooltip-language-badge">
            {language === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </div>
        </div>
      )}
    </div>
  );
};