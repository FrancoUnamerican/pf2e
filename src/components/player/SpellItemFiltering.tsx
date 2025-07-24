import React, { useState, useEffect } from 'react';
import { databaseService } from '../../services/database';
import { InteractiveTooltip } from '../common/InteractiveTooltip';
import { useLanguage } from '../../context/LanguageContext';
import { t, extractContent } from '../../utils/language';
import type { Spell, Equipment, SpellFilters, EquipmentFilters } from '../../services/database';
import './SpellItemFiltering.css';

type ViewMode = 'spells' | 'equipment';

export const SpellItemFiltering: React.FC = () => {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('spells');
  const [spells, setSpells] = useState<Spell[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [spellFilters, setSpellFilters] = useState<SpellFilters>({});
  const [equipmentFilters, setEquipmentFilters] = useState<EquipmentFilters>({});

  const getDescription = (item: Spell | Equipment): string => {
    const content = extractContent(item, language);
    return content.description || t('noDescription', language);
  };

  const spellTraditions = [
    { key: 'arcane', value: 'Arcane' },
    { key: 'divine', value: 'Divine' },
    { key: 'occult', value: 'Occult' },
    { key: 'primal', value: 'Primal' }
  ];
  const spellLevels = Array.from({ length: 11 }, (_, i) => i); // 0-10
  const equipmentTypes = ['equipment', 'weapon', 'armor', 'consumable'];

  useEffect(() => {
    loadData();
  }, [viewMode, spellFilters, equipmentFilters]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (viewMode === 'spells') {
        const spellData = await databaseService.getSpells(50, spellFilters);
        setSpells(spellData);
      } else {
        const equipmentData = await databaseService.getEquipment(50, equipmentFilters);
        setEquipment(equipmentData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpellTraditionToggle = (tradition: string) => {
    setSpellFilters(prev => ({
      ...prev,
      traditions: prev.traditions?.includes(tradition)
        ? prev.traditions.filter(t => t !== tradition)
        : [...(prev.traditions || []), tradition]
    }));
  };

  const handleSpellLevelToggle = (level: number) => {
    setSpellFilters(prev => ({
      ...prev,
      level: prev.level?.includes(level)
        ? prev.level.filter(l => l !== level)
        : [...(prev.level || []), level]
    }));
  };

  const handleEquipmentTypeToggle = (type: string) => {
    setEquipmentFilters(prev => ({
      ...prev,
      type: prev.type?.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...(prev.type || []), type]
    }));
  };

  const clearSpellFilters = () => {
    setSpellFilters({});
  };

  const clearEquipmentFilters = () => {
    setEquipmentFilters({});
  };

  const getSpellLevelLabel = (level: number) => {
    return level === 0 ? t('cantrip', language) : `${t('level', language)} ${level}`;
  };

  const formatEquipmentType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'equipment': t('generalEquipment', language),
      'weapon': t('weapon', language),
      'armor': t('armor', language),
      'consumable': t('consumable', language)
    };
    return typeMap[type] || type;
  };

  const currentData = viewMode === 'spells' ? spells : equipment;
  const hasActiveFilters = viewMode === 'spells' 
    ? Object.values(spellFilters).some(filter => filter && filter.length > 0)
    : Object.values(equipmentFilters).some(filter => filter && filter.length > 0);

  return (
    <div className="spell-item-filtering">
      <div className="view-selector">
        <button
          className={`view-button ${viewMode === 'spells' ? 'active' : ''}`}
          onClick={() => setViewMode('spells')}
        >
          🔮 {t('spellsTab', language)}
        </button>
        <button
          className={`view-button ${viewMode === 'equipment' ? 'active' : ''}`}
          onClick={() => setViewMode('equipment')}
        >
          ⚔️ {t('equipmentTab', language)}
        </button>
      </div>

      <div className="filters-section">
        {viewMode === 'spells' ? (
          <div className="spell-filters">
            <div className="filter-group">
              <div className="filter-header">
                <h4>{t('traditions', language)}</h4>
                {spellFilters.traditions && spellFilters.traditions.length > 0 && (
                  <button className="clear-group" onClick={() => setSpellFilters(prev => ({ ...prev, traditions: [] }))}>
                    {t('clear', language)}
                  </button>
                )}
              </div>
              <div className="filter-options">
                {spellTraditions.map(tradition => (
                  <button
                    key={tradition.value}
                    className={`filter-option ${spellFilters.traditions?.includes(tradition.value) ? 'active' : ''}`}
                    onClick={() => handleSpellTraditionToggle(tradition.value)}
                  >
                    {t(tradition.key as any, language)}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-header">
                <h4>{t('spellLevels', language)}</h4>
                {spellFilters.level && spellFilters.level.length > 0 && (
                  <button className="clear-group" onClick={() => setSpellFilters(prev => ({ ...prev, level: [] }))}>
                    {t('clear', language)}
                  </button>
                )}
              </div>
              <div className="filter-options level-options">
                {spellLevels.map(level => (
                  <button
                    key={level}
                    className={`filter-option level-option ${spellFilters.level?.includes(level) ? 'active' : ''}`}
                    onClick={() => handleSpellLevelToggle(level)}
                  >
                    {getSpellLevelLabel(level)}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button className="clear-all-filters" onClick={clearSpellFilters}>
                {t('clearAllFilters', language)}
              </button>
            )}
          </div>
        ) : (
          <div className="equipment-filters">
            <div className="filter-group">
              <div className="filter-header">
                <h4>{t('equipmentTypes', language)}</h4>
                {equipmentFilters.type && equipmentFilters.type.length > 0 && (
                  <button className="clear-group" onClick={() => setEquipmentFilters(prev => ({ ...prev, type: [] }))}>
                    {t('clear', language)}
                  </button>
                )}
              </div>
              <div className="filter-options">
                {equipmentTypes.map(type => (
                  <button
                    key={type}
                    className={`filter-option ${equipmentFilters.type?.includes(type) ? 'active' : ''}`}
                    onClick={() => handleEquipmentTypeToggle(type)}
                  >
                    {formatEquipmentType(type)}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button className="clear-all-filters" onClick={clearEquipmentFilters}>
                {t('clearAllFilters', language)}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="results-section">
        <div className="results-header">
          <h3>
            {loading ? `${t('loading', language)}...` : `${currentData.length} ${viewMode === 'spells' ? t('spellsTab', language).toLowerCase() : t('equipmentTab', language).toLowerCase()} ${t('found', language)}`}
            {hasActiveFilters && ` (${t('filtered', language)})`}
          </h3>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>{t('loading', language)} {viewMode === 'spells' ? t('spellsTab', language).toLowerCase() : t('equipmentTab', language).toLowerCase()}...</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {viewMode === 'spells' ? '🔮' : '⚔️'}
            </div>
            <h4>{t('noItemsFound', language)}</h4>
            <p>{t('adjustFilters', language)}</p>
          </div>
        ) : (
          <div className="items-grid">
            {currentData.map((item) => (
              <InteractiveTooltip
                key={item._id}
                item={item}
                trigger="click"
              >
                <div className={`item-card ${viewMode === 'spells' ? 'spell-card' : 'equipment-card'}`}>
                  <div className="item-card-header">
                    <h4 className="item-name">{item.name}</h4>
                    {viewMode === 'spells' && item.system?.level && (
                      <span className="spell-level">
                        {getSpellLevelLabel(item.system.level.value)}
                      </span>
                    )}
                  </div>
                  
                  {item.system?.traits && 'value' in item.system.traits && item.system.traits.value && (
                    <div className="item-traits">
                      {item.system.traits.value.slice(0, 3).map((trait: string) => (
                        <span key={trait} className="trait-badge">{trait}</span>
                      ))}
                      {item.system.traits.value.length > 3 && (
                        <span className="trait-badge more">+{item.system.traits.value.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <p className="item-description">
                    {getDescription(item)}
                  </p>
                </div>
              </InteractiveTooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};