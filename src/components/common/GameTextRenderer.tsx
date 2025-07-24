import React, { useEffect, useState } from 'react';
import { databaseService } from '../../services/database';
import { useLanguage } from '../../context/LanguageContext';
import './GameTextRenderer.css';

interface GameTextRendererProps {
  text: string;
  className?: string;
}

export const GameTextRenderer: React.FC<GameTextRendererProps> = ({ 
  text, 
  className = '' 
}) => {
  const { language } = useLanguage();
  const [processedText, setProcessedText] = useState<string>(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const processText = async () => {
      if (!text || text === processedText) return;
      
      setIsLoading(true);
      try {
        const result = await databaseService.processGameText(text, language);
        setProcessedText(result);
      } catch (error) {
        console.error('Failed to process game text:', error);
        setProcessedText(text); // Fallback to original text
      } finally {
        setIsLoading(false);
      }
    };

    processText();
  }, [text, language]);

  if (isLoading) {
    return <div className={`game-text-loading ${className}`}>Processing...</div>;
  }

  return (
    <div 
      className={`game-text ${className}`}
      dangerouslySetInnerHTML={{ __html: processedText }}
    />
  );
};

export default GameTextRenderer;