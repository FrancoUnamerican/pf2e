import React, { useState, useEffect } from 'react';
import { databaseService } from '../../services/database';
import { InteractiveTooltip } from '../common/InteractiveTooltip';
import type { Monster } from '../../types';
import './MonsterManagement.css';

export const MonsterManagement: React.FC = () => {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonsters, setSelectedMonsters] = useState<Monster[]>([]);
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('list');
  const [sourceFilter, setSourceFilter] = useState<string>('monster-core');
  const [levelFilter, setLevelFilter] = useState<number[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);

  useEffect(() => {
    loadMonsters();
  }, [sourceFilter, levelFilter]);

  const loadMonsters = async () => {
    try {
      const monsterData = await databaseService.getMonsters(1000, { 
        source: sourceFilter,
        level: levelFilter.length > 0 ? levelFilter : undefined
      });
      setMonsters(monsterData);
      
      // Auto-select first monster for statblock display
      if (monsterData.length > 0 && !selectedMonster) {
        setSelectedMonster(monsterData[0]);
      }
    } catch (error) {
      console.error('Failed to load monsters:', error);
    } finally {
      setLoading(false);
    }
  };

  const sourceOptions = [
    { value: 'monster-core', label: 'Monster Core' },
    { value: 'all', label: 'All Sources' },
    { value: 'core', label: 'Core Books' },
    { value: 'pathfinder-society', label: 'Pathfinder Society' },
    { value: 'lost-omens', label: 'Lost Omens' },
    { value: 'adventure-path', label: 'Adventure Paths' },
    { value: 'adventures', label: 'Adventures' },
    { value: 'bounties-quests', label: 'Bounties & Quests' }
  ];

  const levelOptions = Array.from({ length: 25 }, (_, i) => i - 1); // -1 to 23

  const handleLevelToggle = (level: number) => {
    setLevelFilter(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const clearLevelFilter = () => {
    setLevelFilter([]);
  };

  const addToEncounter = (monster: Monster) => {
    setSelectedMonsters(prev => {
      const exists = prev.find(m => m._id === monster._id);
      if (exists) {
        return prev;
      }
      return [...prev, monster];
    });
  };

  const selectMonsterForStatblock = (monster: Monster) => {
    setSelectedMonster(monster);
  };

  const removeFromEncounter = (monsterId: string) => {
    setSelectedMonsters(prev => prev.filter(m => m._id !== monsterId));
  };

  const clearEncounter = () => {
    setSelectedMonsters([]);
  };

  const getMonsterLevel = (monster: Monster): number => {
    return monster.system?.details?.level?.value || 0;
  };

  const getMonsterSize = (monster: Monster): string => {
    return monster.system?.traits?.size?.value || 'Medium';
  };

  const formatSize = (size: string): string => {
    return size.charAt(0).toUpperCase() + size.slice(1);
  };

  const formatAbilityMod = (mod: number): string => {
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const getResistances = (monster: Monster): string[] => {
    return monster.system?.attributes?.resistances?.map((r: any) => 
      r.value ? `${r.type} ${r.value}` : r.type
    ) || [];
  };

  const getImmunities = (monster: Monster): string[] => {
    return monster.system?.attributes?.immunities?.map((i: any) => i.type) || [];
  };

  const getWeaknesses = (monster: Monster): string[] => {
    return monster.system?.attributes?.weaknesses?.map((w: any) => 
      w.value ? `${w.type} ${w.value}` : w.type
    ) || [];
  };

  const getSenses = (monster: Monster): string => {
    const senses = monster.system?.perception?.senses || [];
    return senses.map((sense: any) => sense.type).join(', ') || 'normal vision';
  };

  const getLanguages = (monster: Monster): string => {
    const languages = monster.system?.details?.languages?.value || [];
    return languages.length > 0 ? languages.join(', ') : 'none';
  };

  const getSpeed = (monster: Monster): string => {
    const baseSpeed = monster.system?.attributes?.speed?.value || 0;
    const otherSpeeds = monster.system?.attributes?.speed?.otherSpeeds || [];
    
    let speedText = `${baseSpeed} feet`;
    if (otherSpeeds.length > 0) {
      const speedTypes = otherSpeeds.map((speed: any) => `${speed.type} ${speed.value} feet`);
      speedText += `, ${speedTypes.join(', ')}`;
    }
    
    return speedText;
  };

  if (loading) {
    return (
      <div className="monster-management">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading monsters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monster-management">
      <div className="monster-list-panel">
        <div className="management-header">
          <div className="header-section">
            <h3>Monster Management</h3>
            <p>Browse and manage monsters for your encounters</p>
          </div>
          
          <div className="view-controls">
            <div className="source-filter">
              <label htmlFor="source-select">Source:</label>
              <select
                id="source-select"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="source-select"
              >
                {sourceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="level-filter">
              <div className="level-filter-header">
                <label>Levels:</label>
                {levelFilter.length > 0 && (
                  <button className="clear-level-filter" onClick={clearLevelFilter}>
                    Clear ({levelFilter.length})
                  </button>
                )}
              </div>
              <div className="level-options">
                {levelOptions.map(level => (
                  <button
                    key={level}
                    className={`level-option ${levelFilter.includes(level) ? 'active' : ''}`}
                    onClick={() => handleLevelToggle(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="view-toggle">
              <button
                className={`view-button ${viewMode === 'gallery' ? 'active' : ''}`}
                onClick={() => setViewMode('gallery')}
                title="Gallery view"
              >
                🔳
              </button>
              <button
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                📋
              </button>
            </div>
          </div>
        </div>

      {selectedMonsters.length > 0 && (
        <div className="encounter-builder">
          <div className="encounter-header">
            <h4>Current Encounter ({selectedMonsters.length} monsters)</h4>
            <button className="clear-encounter" onClick={clearEncounter}>
              Clear All
            </button>
          </div>
          <div className="selected-monsters">
            {selectedMonsters.map((monster, index) => (
              <div key={`selected-${monster._id}-${index}`} className="selected-monster">
                <span className="monster-name">{monster.name}</span>
                <span className="monster-level">Level {getMonsterLevel(monster)}</span>
                <button
                  className="remove-monster"
                  onClick={() => removeFromEncounter(monster._id)}
                  title="Remove from encounter"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="monsters-section">
        <div className="section-header">
          <h4>{monsters.length} Monsters Available</h4>
        </div>

        <div className={`monsters-container ${viewMode}`}>
          {monsters.map((monster, index) => (
            <InteractiveTooltip
              key={`${monster._id}-${index}`}
              item={monster}
              trigger="hover"
            >
              <div 
                className={`monster-item ${viewMode} ${selectedMonster?._id === monster._id ? 'selected' : ''}`}
                onClick={() => selectMonsterForStatblock(monster)}
              >
                <div className="monster-content">
                  <div className="monster-header">
                    <h5 className="monster-name">{monster.name}</h5>
                    <div className="monster-stats">
                      <span className="monster-level">Level {getMonsterLevel(monster)}</span>
                      <span className="monster-size">{formatSize(getMonsterSize(monster))}</span>
                    </div>
                  </div>
                  
                  {monster.system?.traits?.value && (
                    <div className="monster-traits">
                      {monster.system.traits.value.slice(0, 3).map(trait => (
                        <span key={trait} className="trait-badge">{trait}</span>
                      ))}
                      {monster.system.traits.value.length > 3 && (
                        <span className="trait-badge more">+{monster.system.traits.value.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="monster-actions">
                    <button
                      className="add-to-encounter"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToEncounter(monster);
                      }}
                      disabled={selectedMonsters.some(m => m._id === monster._id)}
                    >
                      {selectedMonsters.some(m => m._id === monster._id) ? 'Added' : 'Add to Encounter'}
                    </button>
                  </div>
                </div>
              </div>
            </InteractiveTooltip>
          ))}
        </div>
      </div>
      </div>
      
      <div className="monster-statblock-panel">
        {selectedMonster ? (
          <>
            <h3 className="statblock-title">{selectedMonster.name}</h3>
            <div className="statblock-creature-type">
              Level {getMonsterLevel(selectedMonster)} {formatSize(getMonsterSize(selectedMonster))}
            </div>
            
            {selectedMonster.system?.traits?.value && (
              <div className="statblock-level-traits">
                <span className="level-badge">Level {getMonsterLevel(selectedMonster)}</span>
                {selectedMonster.system.traits.value.slice(0, 6).map((trait: string) => (
                  <span key={trait} className="trait-badge-statblock">{trait}</span>
                ))}
                {selectedMonster.system.traits.value.length > 6 && (
                  <span className="trait-badge-statblock">+{selectedMonster.system.traits.value.length - 6} more</span>
                )}
              </div>
            )}

              <div className="statblock-section perception-languages">
                <div className="perception-line">
                  <strong>Perception</strong> {formatAbilityMod(selectedMonster.system?.perception?.mod || 0)}
                  {getSenses(selectedMonster) !== 'normal vision' && (
                    <span>; {getSenses(selectedMonster)}</span>
                  )}
                </div>
                <div className="languages-line">
                  <strong>Languages</strong> {getLanguages(selectedMonster)}
                </div>
              </div>

              <div className="statblock-section skills">
                <strong>Skills</strong>
                {selectedMonster.system?.skills ? (
                  <div className="skills-list">
                    {Object.entries(selectedMonster.system.skills).map(([skill, data]: [string, any]) => (
                      <span key={skill} className="skill-item">
                        {skill.charAt(0).toUpperCase() + skill.slice(1)} {formatAbilityMod(data.base || 0)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span> None notable</span>
                )}
              </div>

              <div className="statblock-section abilities">
                <strong>Ability Scores</strong>
                <div className="abilities-grid">
                  {selectedMonster.system?.abilities && Object.entries(selectedMonster.system.abilities).map(([ability, data]: [string, any]) => (
                    <div key={ability} className="ability-score">
                      <strong>{ability.toUpperCase()}</strong> {formatAbilityMod(data.mod || 0)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="statblock-section defenses">
                <div className="ac-hp">
                  <div className="defense-stat">
                    <strong>AC</strong> {selectedMonster.system?.attributes?.ac?.value || 10}
                  </div>
                  <div className="defense-stat">
                    <strong>HP</strong> {selectedMonster.system?.attributes?.hp?.max || 1}
                    {selectedMonster.system?.attributes?.hp?.details && (
                      <span> ({selectedMonster.system.attributes.hp.details})</span>
                    )}
                  </div>
                </div>
                
                <div className="saves-line">
                  <strong>Saves</strong>
                  <span> Fort {formatAbilityMod(selectedMonster.system?.saves?.fortitude?.value || 0)}</span>
                  <span>, Ref {formatAbilityMod(selectedMonster.system?.saves?.reflex?.value || 0)}</span>
                  <span>, Will {formatAbilityMod(selectedMonster.system?.saves?.will?.value || 0)}</span>
                </div>

                {getImmunities(selectedMonster).length > 0 && (
                  <div className="immunities-line">
                    <strong>Immunities</strong> {getImmunities(selectedMonster).join(', ')}
                  </div>
                )}

                {getResistances(selectedMonster).length > 0 && (
                  <div className="resistances-line">
                    <strong>Resistances</strong> {getResistances(selectedMonster).join(', ')}
                  </div>
                )}

                {getWeaknesses(selectedMonster).length > 0 && (
                  <div className="weaknesses-line">
                    <strong>Weaknesses</strong> {getWeaknesses(selectedMonster).join(', ')}
                  </div>
                )}
              </div>

              <div className="statblock-section speed">
                <div className="speed-line">
                  <strong>Speed</strong> {getSpeed(selectedMonster)}
                </div>
              </div>

              {selectedMonster.system?.details?.publicNotes && (
                <div className="statblock-section notes">
                  <strong>Notes</strong>
                  <div className="notes-content">
                    {selectedMonster.system.details.publicNotes}
                  </div>
                </div>
              )}
          </>
        ) : (
          <div className="statblock-empty">
            Select a monster to view its complete statblock
          </div>
        )}
      </div>
    </div>
  );
};
