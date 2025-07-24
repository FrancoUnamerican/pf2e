import React, { useState } from 'react';
import { MonsterManagement } from '../components/gm/MonsterManagement';
import { EncounterBuilder } from '../components/gm/EncounterBuilder';
import { LootGenerator } from '../components/gm/LootGenerator';
import { CampaignTools } from '../components/gm/CampaignTools';
import './GMPage.css';

export const GMPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monsters' | 'encounters' | 'loot' | 'campaign'>('monsters');

  return (
    <div className="gm-page">
      <div className="page-header">
        <h2>Game Master Tools</h2>
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'monsters' ? 'active' : ''}`}
            onClick={() => setActiveTab('monsters')}
          >
            Monsters
          </button>
          <button 
            className={`tab-button ${activeTab === 'encounters' ? 'active' : ''}`}
            onClick={() => setActiveTab('encounters')}
          >
            Encounters
          </button>
          <button 
            className={`tab-button ${activeTab === 'loot' ? 'active' : ''}`}
            onClick={() => setActiveTab('loot')}
          >
            Loot
          </button>
          <button 
            className={`tab-button ${activeTab === 'campaign' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaign')}
          >
            Campaign Management
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'monsters' && <MonsterManagement />}
        {activeTab === 'encounters' && <EncounterBuilder />}
        {activeTab === 'loot' && <LootGenerator />}
        {activeTab === 'campaign' && <CampaignTools />}
      </div>
    </div>
  );
};