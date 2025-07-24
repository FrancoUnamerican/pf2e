import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../types';
import './LanguageToggle.css';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="language-controls">
      <div className="display-mode-selector">
        <button 
          className={`mode-button ${language === 'en' ? 'active' : ''}`}
          onClick={() => handleLanguageChange('en')}
          title="English"
        >
          EN
        </button>
        <button 
          className={`mode-button ${language === 'fr' ? 'active' : ''}`}
          onClick={() => handleLanguageChange('fr')}
          title="Français"
        >
          FR
        </button>
      </div>
    </div>
  );
};