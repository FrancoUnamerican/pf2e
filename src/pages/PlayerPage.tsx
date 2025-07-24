import React, { useState } from 'react';
import { CharacterReference } from '../components/player/CharacterReference';
import { RulesCompendium } from '../components/player/RulesCompendium';
import { SpellItemFiltering } from '../components/player/SpellItemFiltering';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/language';
import './PlayerPage.css';

export const PlayerPage: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'character' | 'rules' | 'spells'>('character');

  return (
    <div className="player-page">
      <div className="page-header">
        <h2>{t('playerTools', language)}</h2>
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'character' ? 'active' : ''}`}
            onClick={() => setActiveTab('character')}
          >
            {t('characterReference', language)}
          </button>
          <button 
            className={`tab-button ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            {t('rulesCompendium', language)}
          </button>
          <button 
            className={`tab-button ${activeTab === 'spells' ? 'active' : ''}`}
            onClick={() => setActiveTab('spells')}
          >
            {t('spellsAndItems', language)}
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'character' && <CharacterReference />}
        {activeTab === 'rules' && <RulesCompendium />}
        {activeTab === 'spells' && <SpellItemFiltering />}
      </div>
    </div>
  );
};