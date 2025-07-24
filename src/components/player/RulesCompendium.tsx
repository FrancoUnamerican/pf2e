import React, { useState, useEffect } from 'react';
import { databaseService } from '../../services/database';
import { InteractiveTooltip } from '../common/InteractiveTooltip';
import { useLanguage } from '../../context/LanguageContext';
import { t, extractContent } from '../../utils/language';
import type { PF2eItem } from '../../types';
import './RulesCompendium.css';

interface ProcessedPF2eItem extends PF2eItem {
  processedDescription?: string;
}

export const RulesCompendium: React.FC = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ProcessedPF2eItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [basicActions, setBasicActions] = useState<ProcessedPF2eItem[]>([]);

  // Load basic actions on component mount
  useEffect(() => {
    const loadBasicActions = async () => {
      try {
        const basicActionNames = ['Stride', 'Strike', 'Cast a Spell', 'Sustain a Spell', 'Raise a Shield', 'Take Cover', 'Aid', 'Delay', 'Ready', 'Seek'];
        const actionResults: ProcessedPF2eItem[] = [];
        
        for (const actionName of basicActionNames) {
          const searchResults = await databaseService.searchAll(actionName, ['action']);
          const exactMatch = searchResults.find(item => 
            item.name.toLowerCase() === actionName.toLowerCase()
          );
          
          if (exactMatch) {
            const processedDescription = await getDescription(exactMatch);
            actionResults.push({ ...exactMatch, processedDescription });
          }
        }
        
        setBasicActions(actionResults);
      } catch (error) {
        console.error('Failed to load basic actions:', error);
      }
    };
    
    loadBasicActions();
  }, []);

  const getDescription = async (item: PF2eItem): Promise<string> => {
    const content = extractContent(item, language);
    let rawText = content.description || content.publicNotes || '';
    
    if (!rawText) {
      rawText = t('noDescription', language);
    }
    
    // Process game text to handle special formatting and codes
    try {
      const processedText = await databaseService.processGameText(rawText, language);
      return processedText;
    } catch (error) {
      console.warn('Failed to process game text:', error);
      return rawText;
    }
  };

  const getItemLevel = (item: PF2eItem): number | null => {
    if (item.system?.level?.value !== undefined) return item.system.level.value;
    if (item.system?.level !== undefined) return item.system.level;
    return null;
  };

  const filterCategories = [
    { id: 'feat', label: t('feats', language), count: 0 },
    { id: 'action', label: t('actions', language), count: 0 },
    { id: 'rule', label: t('rules', language), count: 0 },
    { id: 'hazard', label: t('hazards', language), count: 0 },
  ];

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      performSearch();
    } else if (selectedFilters.length > 0) {
      // Load all data for selected filters when no search query
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery, selectedFilters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Rules Compendium should exclude spells and equipment (they have dedicated tabs)
      const rulesOnlyTables = ['feat', 'action', 'hazard'];
      const searchTables = selectedFilters.length > 0 ? 
        selectedFilters.filter(table => rulesOnlyTables.includes(table)) : 
        rulesOnlyTables;
      
      // Use '*' as search query when no query but filters are selected
      const queryToUse = searchQuery.trim().length >= 2 ? searchQuery : '*';
      const searchResults = await databaseService.searchAll(queryToUse, searchTables);
      
      // Process descriptions for each result
      const processedResults = await Promise.all(
        searchResults.map(async (item) => {
          const processedDescription = await getDescription(item);
          return { ...item, processedDescription } as ProcessedPF2eItem;
        })
      );
      
      setResults(processedResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const getItemTypeIcon = (tableType: string) => {
    const icons: { [key: string]: string } = {
      'feat': '⭐',
      'action': '⚡',
      'rule': '📜',
      'hazard': '⚠️',
      'npc': '👹'
    };
    return icons[tableType] || '📄';
  };

  const highlightSearchTerm = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className="rules-compendium">
      <div className="search-section">
        <div className="search-header">
          <h3>{t('searchRulesCompendium', language)}</h3>
          <p>{t('searchDescription', language)}</p>
        </div>
        
        <div className="search-controls">
          <div className="search-input-container">
            <input
              type="text"
              placeholder={t('searchPlaceholder', language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {loading && <div className="search-loading">🔍</div>}
          </div>
          
          <div className="filter-section">
            <div className="filter-header">
              <span>{t('filterByCategory', language)}</span>
              {selectedFilters.length > 0 && (
                <button className="clear-filters" onClick={clearFilters}>
                  {t('clearAll', language)}
                </button>
              )}
            </div>
            <div className="filter-chips">
              {filterCategories.map(category => (
                <button
                  key={category.id}
                  className={`filter-chip ${selectedFilters.includes(category.id) ? 'active' : ''}`}
                  onClick={() => toggleFilter(category.id)}
                >
                  {getItemTypeIcon(category.id)} {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="results-section">
        {searchQuery.trim().length < 2 ? (
          <div className="basic-actions-section">
            <div className="search-prompt">
              <div className="search-prompt-icon">🔍</div>
              <h4>{t('readyToSearch', language)}</h4>
              <p>{t('searchPrompt', language)}</p>
            </div>
            
            {basicActions.length > 0 && (
              <div className="basic-actions">
                <div className="results-header">
                  <h4>{t('basicActions', language)} ({basicActions.length})</h4>
                  <p>{t('basicActionsDesc', language)}</p>
                </div>
                <div className="results-list">
                  {basicActions.map((action, index) => (
                    <InteractiveTooltip
                      key={`${action._id}-${index}`}
                      item={action}
                      trigger="click"
                    >
                      <div className="result-item">
                        <div className="result-header">
                          <span className="result-icon">⚡</span>
                          <h5 className="result-title">{action.name}</h5>
                          <div className="result-meta">
                            <span className="result-type">{t('basicAction', language)}</span>
                          </div>
                        </div>
                        <p 
                          className="result-description"
                          dangerouslySetInnerHTML={{ 
                            __html: action.processedDescription || t('noDescription', language)
                          }}
                        />
                      </div>
                    </InteractiveTooltip>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : results.length === 0 && !loading ? (
          <div className="no-results">
            <div className="no-results-icon">📭</div>
            <h4>{t('noResults', language)}</h4>
            <p>{t('noResultsDesc', language)}</p>
          </div>
        ) : (
          <>
            <div className="results-header">
              <h4>{results.length} {results.length === 1 ? t('result', language) : t('results', language)} {results.length === 1 ? t('found', language) : t('foundPlural', language)}</h4>
            </div>
            <div className="results-list">
              {results.map((item, index) => (
                <InteractiveTooltip
                  key={`${item._id}-${index}`}
                  item={item}
                  trigger="click"
                >
                  <div className="result-item">
                    <div className="result-header">
                      <span className="result-icon">
                        {getItemTypeIcon((item as any).table_type || 'unknown')}
                      </span>
                      <h5 
                        className="result-title"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightSearchTerm(item.name, searchQuery) 
                        }}
                      />
                      <div className="result-meta">
                        {getItemLevel(item) !== null && (
                          <span className="result-level">{t('level', language)} {getItemLevel(item)}</span>
                        )}
                        <span className="result-type">
                          {(item as any).table_type || t('unknown', language)}
                        </span>
                      </div>
                    </div>
                    <p 
                      className="result-description"
                      dangerouslySetInnerHTML={{ 
                        __html: item.processedDescription || t('noDescription', language)
                      }}
                    />
                  </div>
                </InteractiveTooltip>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};