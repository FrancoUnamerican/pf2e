import React, { useState } from 'react';
import { CharacterUpload } from './CharacterUpload';
import { InteractiveTooltip } from '../common/InteractiveTooltip';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/language';
import './CharacterReference.css';

interface CharacterReferenceProps {}

interface ActionCounterProps {
  actions?: number;
  reaction?: boolean;
  free?: boolean;
}

const ActionCounter: React.FC<ActionCounterProps> = ({ actions, reaction, free }) => {
  if (free) return <span className="action-counter free">Free</span>;
  if (reaction) return <span className="action-counter reaction">⤾</span>;
  if (actions) {
    return (
      <span className="action-counter actions">
        {Array.from({ length: actions }, () => '●').join('')}
      </span>
    );
  }
  return null;
};

const LinkableItem: React.FC<{ 
  item: any; 
  type: 'spell' | 'feat' | 'action' | 'equipment';
  onItemClick: (item: any, type: string) => void;
}> = ({ item, type, onItemClick }) => {
  const [databaseItem, setDatabaseItem] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const searchForItem = async () => {
      if (loading || databaseItem) return;
      
      setLoading(true);
      try {
        // Search for the item in the database by name
        const searchTables = type === 'spell' ? ['spell'] : 
                           type === 'feat' ? ['feat'] : 
                           type === 'action' ? ['action'] :
                           ['equipment', 'weapon', 'armor', 'consumable'];
        
        const results = await databaseService.searchAll(item.name, searchTables);
        const exactMatch = results.find(result => 
          result.name.toLowerCase() === item.name.toLowerCase()
        );
        
        if (exactMatch) {
          setDatabaseItem(exactMatch);
        }
      } catch (error) {
        console.warn(`Could not find database item for: ${item.name}`, error);
      } finally {
        setLoading(false);
      }
    };

    searchForItem();
  }, [item.name, type, loading, databaseItem]);

  const getLevel = () => {
    if (type === 'spell') return item.level || item.system?.level?.value;
    if (type === 'feat') return item.level || item.system?.level?.value;
    return null;
  };

  const getActions = () => {
    if (item.actions) return item.actions;
    if (item.system?.actions?.value) return item.system.actions.value;
    if (item.time) {
      if (item.time.includes('Free')) return { free: true };
      if (item.time.includes('Reaction')) return { reaction: true };
      const actionMatch = item.time.match(/(\d+) action/);
      if (actionMatch) return { actions: parseInt(actionMatch[1]) };
    }
    return null;
  };

  const level = getLevel();
  const actionData = getActions();

  // Use database item if found, otherwise create mock item
  const tooltipItem = databaseItem || {
    _id: `mock-${type}-${item.name}`,
    name: item.name || 'Unknown Item',
    type: type,
    system: {
      description: { value: item.description || 'No description available' },
      level: level ? { value: level } : undefined
    }
  };

  return (
    <InteractiveTooltip item={tooltipItem} trigger="hover">
      <div 
        className={`linkable-item ${type}`}
        onClick={() => onItemClick(item, type)}
      >
        <span className="item-name">{item.name || 'Unknown Item'}</span>
        {level && <span className="item-level">Lvl {level}</span>}
        {actionData && <ActionCounter {...actionData} />}
        {loading && <span className="loading-indicator">🔍</span>}
      </div>
    </InteractiveTooltip>
  );
};

export const CharacterReference: React.FC<CharacterReferenceProps> = () => {
  const { language } = useLanguage();
  const [rawCharacterData, setRawCharacterData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'raw'>('summary');

  // Load Elias character on component mount
  React.useEffect(() => {
    const loadEliasCharacter = async () => {
      try {
        const response = await fetch('/elias.json');
        if (response.ok) {
          const eliasData = await response.json();
          setRawCharacterData(eliasData);
        }
      } catch (error) {
        console.log('Elias character file not found, will wait for user upload');
      }
    };
    
    loadEliasCharacter();
  }, []);

  const handleCharacterUpload = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const characterData = JSON.parse(text);
      setRawCharacterData(characterData);
    } catch (error) {
      console.error('Failed to parse character file:', error);
      alert('Failed to parse character file. Please ensure it\'s a valid Pathbuilder export.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRawCharacterData(null);
    setSelectedItem(null);
  };

  const handleItemClick = (item: any, type: string) => {
    setSelectedItem({ item, type });
  };

  const extractSpells = (data: any) => {
    const spells: any[] = [];
    
    // Handle Pathbuilder format - spellCasters array
    if (data.build?.spellCasters) {
      data.build.spellCasters.forEach((caster: any) => {
        if (caster.spells) {
          caster.spells.forEach((spellLevel: any) => {
            if (spellLevel.list) {
              spellLevel.list.forEach((spellName: string) => {
                spells.push({
                  name: spellName,
                  level: spellLevel.spellLevel,
                  tradition: caster.magicTradition,
                  type: caster.spellcastingType,
                  ability: caster.ability
                });
              });
            }
          });
        }
      });
    }

    // Handle focus spells
    if (data.build?.focus) {
      Object.entries(data.build.focus).forEach(([tradition, abilityData]: [string, any]) => {
        Object.entries(abilityData).forEach(([ability, spellData]: [string, any]) => {
          if (spellData.focusSpells) {
            spellData.focusSpells.forEach((spellName: string) => {
              spells.push({
                name: spellName,
                level: 'Focus',
                tradition: tradition,
                type: 'focus',
                ability: ability
              });
            });
          }
        });
      });
    }

    return spells;
  };

  const extractFeats = (data: any) => {
    const feats: any[] = [];
    
    // Handle Pathbuilder format - feats array
    if (data.build?.feats) {
      data.build.feats.forEach((feat: any) => {
        if (Array.isArray(feat) && feat[0]) {
          feats.push({
            name: feat[0],
            level: feat[3] || 1,
            type: feat[2] || 'General',
            source: feat[4] || '',
            specialization: feat[1] || null
          });
        }
      });
    }
    
    return feats;
  };

  const extractEquipment = (data: any) => {
    const equipment: any[] = [];
    
    // Handle Pathbuilder format - equipment array
    if (data.build?.equipment) {
      data.build.equipment.forEach((item: any) => {
        if (Array.isArray(item) && item[0]) {
          equipment.push({
            name: item[0],
            quantity: item[1] || 1,
            container: item[2] || null,
            invested: item[3] === 'Invested'
          });
        }
      });
    }
    
    // Handle weapons
    if (data.build?.weapons) {
      data.build.weapons.forEach((weapon: any) => {
        equipment.push({
          name: weapon.display || weapon.name,
          type: 'Weapon',
          proficiency: weapon.prof,
          damage: `${weapon.die} ${weapon.damageType}`,
          attack: weapon.attack,
          damageBonus: weapon.damageBonus,
          material: weapon.mat || 'Standard'
        });
      });
    }
    
    // Handle armor
    if (data.build?.armor) {
      data.build.armor.forEach((armor: any) => {
        equipment.push({
          name: armor.display || armor.name,
          type: 'Armor',
          proficiency: armor.prof,
          worn: armor.worn,
          quantity: armor.qty || 1
        });
      });
    }
    
    return equipment;
  };

  if (!rawCharacterData) {
    return (
      <div className="character-reference">
        <CharacterUpload onUpload={handleCharacterUpload} loading={loading} />
      </div>
    );
  }

  const spells = extractSpells(rawCharacterData);
  const feats = extractFeats(rawCharacterData);
  const equipment = extractEquipment(rawCharacterData);
  
  // Extract character build data
  const build = rawCharacterData.build || {};
  const abilities = build.abilities || {};
  const proficiencies = build.proficiencies || {};
  const attributes = build.attributes || {};

  return (
    <div className="character-reference">
      <div className="character-header">
        <h2>{build.name || 'Unnamed Character'}</h2>
        <div className="character-title">
          <span className="level">{t('level', language)} {build.level || 1}</span>
          <span className="ancestry">{build.ancestry || t('unknown', language)}</span>
          <span className="class">{build.class || t('unknown', language)}</span>
        </div>
        <div className="header-controls">
          <div className="view-mode-toggle">
            <button 
              className={viewMode === 'summary' ? 'active' : ''}
              onClick={() => setViewMode('summary')}
            >
              {t('summaryView', language)}
            </button>
            <button 
              className={viewMode === 'raw' ? 'active' : ''}
              onClick={() => setViewMode('raw')}
            >
              {t('rawJson', language)}
            </button>
          </div>
          <button className="reset-button" onClick={handleReset}>
            {t('uploadNewCharacter', language)}
          </button>
        </div>
      </div>

      {viewMode === 'raw' ? (
        <div className="raw-json-view">
          <pre>{JSON.stringify(rawCharacterData, null, 2)}</pre>
        </div>
      ) : (
        <div className="character-summary">
          <div className="character-main">
            {/* Character Basics */}
            <div className="character-section">
              <h3>{t('characterDetails', language)}</h3>
              <div className="character-grid">
                <div className="character-basics">
                  <div className="basic-info">
                    <p><strong>{t('ancestry', language)}:</strong> {build.ancestry}</p>
                    <p><strong>{t('heritage', language)}:</strong> {build.heritage}</p>
                    <p><strong>{t('class', language)}:</strong> {build.class}</p>
                    <p><strong>{t('background', language)}:</strong> {build.background}</p>
                    <p><strong>{t('alignment', language)}:</strong> {build.alignment}</p>
                    <p><strong>{t('age', language)}:</strong> {build.age}</p>
                    <p><strong>{t('size', language)}:</strong> {build.sizeName} ({build.size})</p>
                    <p><strong>{t('deity', language)}:</strong> {build.deity}</p>
                    <p><strong>{t('languages', language)}:</strong> {build.languages?.join(', ')}</p>
                  </div>
                </div>
                
                {/* Ability Scores */}
                <div className="ability-scores">
                  <h4>{t('abilities', language)}</h4>
                  <div className="abilities-grid">
                    <div className="ability"><strong>{t('strength', language)}:</strong> {abilities.str}</div>
                    <div className="ability"><strong>{t('dexterity', language)}:</strong> {abilities.dex}</div>
                    <div className="ability"><strong>{t('constitution', language)}:</strong> {abilities.con}</div>
                    <div className="ability"><strong>{t('intelligence', language)}:</strong> {abilities.int}</div>
                    <div className="ability"><strong>{t('wisdom', language)}:</strong> {abilities.wis}</div>
                    <div className="ability"><strong>{t('charisma', language)}:</strong> {abilities.cha}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Combat Stats */}
            <div className="character-section">
              <h3>{t('combatStats', language)}</h3>
              <div className="combat-stats">
                <div className="defense-stats">
                  <h4>{t('defense', language)}</h4>
                  <p><strong>{t('armorClass', language)}:</strong> {build.acTotal?.acTotal || 'N/A'}</p>
                  <p><strong>{t('hitPoints', language)}:</strong> {(attributes.ancestryhp || 0) + (attributes.classhp || 0) + (attributes.bonushp || 0) + ((attributes.bonushpPerLevel || 0) * (build.level - 1))}</p>
                  <p><strong>{t('speed', language)}:</strong> {attributes.speed + (attributes.speedBonus || 0)} {t('feet', language)}</p>
                </div>
                
                <div className="save-stats">
                  <h4>{t('savingThrows', language)}</h4>
                  <p><strong>{t('fortitude', language)}:</strong> +{proficiencies.fortitude + Math.floor((abilities.con - 10) / 2)}</p>
                  <p><strong>{t('reflex', language)}:</strong> +{proficiencies.reflex + Math.floor((abilities.dex - 10) / 2)}</p>
                  <p><strong>{t('will', language)}:</strong> +{proficiencies.will + Math.floor((abilities.wis - 10) / 2)}</p>
                </div>
                
                <div className="skill-stats">
                  <h4>{t('primarySkills', language)}</h4>
                  <p><strong>{t('perception', language)}:</strong> +{proficiencies.perception + Math.floor((abilities.wis - 10) / 2)}</p>
                  <p><strong>{t('nature', language)}:</strong> +{proficiencies.nature + Math.floor((abilities.wis - 10) / 2)}</p>
                  <p><strong>{t('survival', language)}:</strong> +{proficiencies.survival + Math.floor((abilities.wis - 10) / 2)}</p>
                </div>
              </div>
            </div>

            {/* Weapons - Moved higher for better visibility */}
            {equipment.filter(e => e.type === 'Weapon').length > 0 && (
              <div className="character-section">
                <h3>{t('weapons', language)}</h3>
                <div className="weapons-list">
                  {equipment.filter(e => e.type === 'Weapon').map((weapon: any, index: number) => (
                    <div key={index} className="weapon-item">
                      <LinkableItem 
                        item={weapon}
                        type="equipment"
                        onItemClick={handleItemClick}
                      />
                      <div className="weapon-stats">
                        <span><strong>{t('attack', language)}:</strong> +{weapon.attack}</span>
                        <span><strong>{t('damage', language)}:</strong> {weapon.damage} +{weapon.damageBonus}</span>
                        {weapon.material !== 'Standard' && (
                          <span className="weapon-material">({weapon.material})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Abilities & Class Features */}
            {build.specials && build.specials.length > 0 && (
              <div className="character-section">
                <h3>{language === 'fr' ? 'Capacités Spéciales' : 'Special Abilities'}</h3>
                <div className="specials-grid">
                  {build.specials.map((special: string, index: number) => (
                    <LinkableItem 
                      key={index}
                      item={{ name: special }}
                      type="feat"
                      onItemClick={handleItemClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Lore Skills */}
            {build.lores && build.lores.length > 0 && (
              <div className="character-section">
                <h3>{language === 'fr' ? 'Compétences de Connaissance' : 'Lore Skills'}</h3>
                <div className="lores-list">
                  {build.lores.map((lore: any[], index: number) => (
                    <div key={index} className="lore-item">
                      <span className="lore-name">{lore[0]}</span>
                      <span className="lore-bonus">+{lore[1] + Math.floor((abilities.int - 10) / 2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Animal Companion & Pets */}
            {build.pets && build.pets.length > 0 && (
              <div className="character-section">
                <h3>{t('animalCompanions', language)}</h3>
                <div className="pets-list">
                  {build.pets.map((pet: any, index: number) => (
                    <div key={index} className="pet-item">
                      <h4>{pet.name} ({pet.animal})</h4>
                      <p><strong>{t('type', language)}:</strong> {pet.type}</p>
                      <p><strong>{t('mature', language)}:</strong> {pet.mature ? t('yes', language) : t('no', language)}</p>
                      {pet.specializations && pet.specializations.length > 0 && (
                        <p><strong>{t('specializations', language)}:</strong> {pet.specializations.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Focus Points & Focus Spells */}
            {(rawCharacterData.focusPoints > 0 || spells.some(s => s.level === 'Focus')) && (
              <div className="character-section">
                <h3>{t('focusSpells', language)}</h3>
                <div className="focus-info">
                  <p><strong>{language === 'fr' ? 'Points de Focalisation' : 'Focus Points'}:</strong> {rawCharacterData.focusPoints || 0}</p>
                  {spells.filter(s => s.level === 'Focus').length > 0 && (
                    <div className="focus-spells-list">
                      {spells.filter(s => s.level === 'Focus').map((spell, index) => (
                        <LinkableItem 
                          key={index}
                          item={spell}
                          type="spell"
                          onItemClick={handleItemClick}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Money */}
            {build.money && (
              <div className="character-section">
                <h3>{t('wealth', language)}</h3>
                <div className="money-display">
                  {build.money.pp > 0 && <span>{build.money.pp} pp</span>}
                  {build.money.gp > 0 && <span>{build.money.gp} {language === 'fr' ? 'po' : 'gp'}</span>}
                  {build.money.sp > 0 && <span>{build.money.sp} {language === 'fr' ? 'pa' : 'sp'}</span>}
                  {build.money.cp > 0 && <span>{build.money.cp} {language === 'fr' ? 'pc' : 'cp'}</span>}
                </div>
              </div>
            )}

            {/* Spells */}
            {spells.filter(s => s.level !== 'Focus').length > 0 && (
              <div className="character-section">
                <h3>{t('spells', language)} ({spells.filter(s => s.level !== 'Focus').length})</h3>
                <div className="spells-by-tradition">
                  {/* Show spells organized by tradition */}
                  {Array.from(new Set(spells.filter(s => s.level !== 'Focus').map(s => s.tradition))).map(tradition => (
                    <div key={tradition} className="tradition-group">
                      <h4>{tradition} {t('tradition', language)}</h4>
                      <div className="spells-by-level">
                        {Array.from(new Set(spells.filter(s => s.tradition === tradition && s.level !== 'Focus').map(s => s.level))).sort((a, b) => Number(a) - Number(b)).map(level => (
                          <div key={level} className="spell-level-group">
                            <h5>{language === 'fr' ? `Niveau ${level}` : `Level ${level}`}</h5>
                            <div className="items-grid">
                              {spells.filter(s => s.tradition === tradition && s.level === level).map((spell, index) => (
                                <LinkableItem 
                                  key={index}
                                  item={spell}
                                  type="spell"
                                  onItemClick={handleItemClick}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feats */}
            {feats.length > 0 && (
              <div className="character-section">
                <h3>{t('feats', language)} ({feats.length})</h3>
                <div className="feats-by-level">
                  {Array.from(new Set(feats.map(f => f.level))).sort((a, b) => Number(a) - Number(b)).map(level => (
                    <div key={level} className="feat-level-group">
                      <h4>{t('level', language)} {level}</h4>
                      <div className="feats-by-type">
                        {Array.from(new Set(feats.filter(f => f.level === level).map(f => f.type))).sort().map(type => (
                          <div key={type} className="feat-type-subgroup">
                            <h5>{type}</h5>
                            <div className="items-grid">
                              {feats.filter(f => f.level === level && f.type === type).map((feat: any, index: number) => (
                                <div key={index} className="feat-item">
                                  <LinkableItem 
                                    item={feat}
                                    type="feat"
                                    onItemClick={handleItemClick}
                                  />
                                  {feat.specialization && (
                                    <span className="feat-specialization">({feat.specialization})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment */}
            {equipment.length > 0 && (
              <div className="character-section">
                <h3>{t('equipment', language)} ({equipment.length})</h3>
                <div className="equipment-categories">
                  {/* Armor */}
                  {equipment.filter(e => e.type === 'Armor').length > 0 && (
                    <div className="equipment-category">
                      <h4>{t('armor', language)}</h4>
                      <div className="armor-list">
                        {equipment.filter(e => e.type === 'Armor').map((armor: any, index: number) => (
                          <div key={index} className="armor-item">
                            <LinkableItem 
                              item={armor}
                              type="equipment"
                              onItemClick={handleItemClick}
                            />
                            {armor.worn && <span className="worn-indicator">({t('worn', language)})</span>}
                          </div>
                        ))}
                      </div> 
                    </div>
                  )}
                  
                  {/* General Equipment */}
                  {equipment.filter(e => !e.type || (e.type !== 'Weapon' && e.type !== 'Armor')).length > 0 && (
                    <div className="equipment-category">
                      <h4>{t('generalEquipment', language)}</h4>
                      <div className="items-grid">
                        {equipment.filter(e => !e.type || (e.type !== 'Weapon' && e.type !== 'Armor')).map((item: any, index: number) => (
                          <div key={index} className="equipment-item">
                            <LinkableItem 
                              item={item}
                              type="equipment"
                              onItemClick={handleItemClick}
                            />
                            {item.quantity > 1 && <span className="item-quantity">x{item.quantity}</span>}
                            {item.invested && <span className="invested-indicator">({t('invested', language)})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedItem && (
            <div className="item-detail-panel">
              <h3>{selectedItem.item.name}</h3>
              <p><strong>Type:</strong> {selectedItem.type}</p>
              {selectedItem.item.level && (
                <p><strong>Niveau:</strong> {selectedItem.item.level}</p>
              )}
              {selectedItem.item.tradition && (
                <p><strong>Tradition:</strong> {selectedItem.item.tradition}</p>
              )}
              {selectedItem.item.ability && (
                <p><strong>Caractéristique:</strong> {selectedItem.item.ability}</p>
              )}
              <div className="item-description">
                {selectedItem.item.description || selectedItem.item.system?.description?.value || 'Aucune description disponible'}
              </div>
              <button onClick={() => setSelectedItem(null)}>Fermer</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};