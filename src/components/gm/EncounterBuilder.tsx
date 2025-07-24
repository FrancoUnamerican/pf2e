import React, { useState } from 'react';
import './EncounterBuilder.css';

interface EncounterMonster {
  _id: string;
  name: string;
  level: number;
  count: number;
}

export const EncounterBuilder: React.FC = () => {
  const [partyLevel, setPartyLevel] = useState(1);
  const [partySize, setPartySize] = useState(4);
  const [encounterBudget, setEncounterBudget] = useState(0);
  const [encounterMonsters, setEncounterMonsters] = useState<EncounterMonster[]>([]);
  const [difficulty, setDifficulty] = useState<'trivial' | 'low' | 'moderate' | 'severe' | 'extreme'>('moderate');

  const difficultyBudgets = {
    trivial: 10,
    low: 15,
    moderate: 20,
    severe: 30,
    extreme: 40
  };

  const calculateEncounterBudget = () => {
    const baseBudget = difficultyBudgets[difficulty];
    const adjustedBudget = baseBudget + (partySize - 4) * 2;
    setEncounterBudget(adjustedBudget);
  };

  const generateRandomEncounter = () => {
    // Simple encounter generation logic
    calculateEncounterBudget();
    
    const sampleMonsters = [
      { name: 'Goblin Warrior', level: 1 },
      { name: 'Orc Brute', level: 3 },
      { name: 'Troll', level: 5 },
      { name: 'Dragon', level: 10 }
    ];

    const appropriateMonsters = sampleMonsters.filter(m => 
      m.level >= partyLevel - 2 && m.level <= partyLevel + 2
    );

    if (appropriateMonsters.length > 0) {
      const randomMonster = appropriateMonsters[Math.floor(Math.random() * appropriateMonsters.length)];
      const newEncounter: EncounterMonster = {
        _id: `random-${Date.now()}`,
        name: randomMonster.name,
        level: randomMonster.level,
        count: Math.max(1, Math.floor(encounterBudget / 10))
      };
      
      setEncounterMonsters([newEncounter]);
    }
  };

  const clearEncounter = () => {
    setEncounterMonsters([]);
    setEncounterBudget(0);
  };

  return (
    <div className="encounter-builder">
      <div className="builder-header">
        <h3>Encounter Builder</h3>
        <p>Build balanced encounters for your party</p>
      </div>

      <div className="encounter-settings">
        <div className="setting-group">
          <label>Party Level</label>
          <input 
            type="number" 
            min="1" 
            max="20" 
            value={partyLevel}
            onChange={(e) => setPartyLevel(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="setting-group">
          <label>Party Size</label>
          <input 
            type="number" 
            min="1" 
            max="8" 
            value={partySize}
            onChange={(e) => setPartySize(parseInt(e.target.value) || 4)}
          />
        </div>

        <div className="setting-group">
          <label>Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
            <option value="trivial">Trivial</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
            <option value="extreme">Extreme</option>
          </select>
        </div>

        <div className="encounter-actions">
          <button className="generate-btn" onClick={generateRandomEncounter}>
            Generate Random Encounter
          </button>
          <button className="clear-btn" onClick={clearEncounter}>
            Clear
          </button>
        </div>
      </div>

      {encounterBudget > 0 && (
        <div className="encounter-info">
          <h4>Encounter Budget: {encounterBudget} XP</h4>
          <p>Difficulty: <strong>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</strong></p>
        </div>
      )}

      {encounterMonsters.length > 0 && (
        <div className="encounter-result">
          <h4>Generated Encounter</h4>
          <div className="encounter-monsters">
            {encounterMonsters.map((monster, index) => (
              <div key={index} className="encounter-monster">
                <span className="monster-count">{monster.count}x</span>
                <span className="monster-name">{monster.name}</span>
                <span className="monster-level">Level {monster.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};