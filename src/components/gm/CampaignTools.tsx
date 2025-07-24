import React, { useState, useEffect } from 'react';
import { databaseService } from '../../services/database';
import './CampaignTools.css';

interface Character {
  id: string;
  name: string;
  level: number;
  pathbuilderData?: any;
  assignedWealth?: number; // GP value assigned to this character
  actualWealth?: number;   // Tracked actual wealth
}

interface Encounter {
  id: string;
  date: Date;
  level: number;
  difficulty: 'trivial' | 'low' | 'moderate' | 'severe' | 'extreme';
  description: string;
  loot: LootItem[];
  totalValue: number;
}

interface LootItem {
  name: string;
  type: string;
  value: string;
  rarity: string;
  gpValue?: number;
}

interface Campaign {
  id: string;
  name: string;
  level: number;
  playerCount: number;
  characters: Character[];
  encounters: Encounter[];
  totalLootValue: number;
  createdDate: Date;
  lastModified: Date;
}

// Table 10-9: Party Treasure by Level data
const partyTreasureByLevel = {
  1: { totalValue: 175, currency: 40, currencyPerPC: 10 },
  2: { totalValue: 300, currency: 70, currencyPerPC: 18 },
  3: { totalValue: 500, currency: 120, currencyPerPC: 30 },
  4: { totalValue: 850, currency: 200, currencyPerPC: 50 },
  5: { totalValue: 1350, currency: 320, currencyPerPC: 80 },
  6: { totalValue: 2000, currency: 500, currencyPerPC: 125 },
  7: { totalValue: 2900, currency: 720, currencyPerPC: 180 },
  8: { totalValue: 4000, currency: 1000, currencyPerPC: 250 },
  9: { totalValue: 5700, currency: 1400, currencyPerPC: 350 },
  10: { totalValue: 8000, currency: 2000, currencyPerPC: 500 },
  11: { totalValue: 11500, currency: 2800, currencyPerPC: 700 },
  12: { totalValue: 16500, currency: 4000, currencyPerPC: 1000 },
  13: { totalValue: 25000, currency: 6000, currencyPerPC: 1500 },
  14: { totalValue: 36500, currency: 9000, currencyPerPC: 2250 },
  15: { totalValue: 54500, currency: 13000, currencyPerPC: 3250 },
  16: { totalValue: 82500, currency: 20000, currencyPerPC: 5000 },
  17: { totalValue: 128000, currency: 30000, currencyPerPC: 7500 },
  18: { totalValue: 208000, currency: 48000, currencyPerPC: 12000 },
  19: { totalValue: 355000, currency: 80000, currencyPerPC: 20000 },
  20: { totalValue: 490000, currency: 140000, currencyPerPC: 35000 }
};

// Table 10-10: Character Wealth by Level data
const characterWealthByLevel = {
  1: { currency: 15, lumpSum: 15, permanentItems: [] },
  2: { currency: 20, lumpSum: 30, permanentItems: [{ level: 1, count: 1 }] },
  3: { currency: 25, lumpSum: 75, permanentItems: [{ level: 2, count: 1 }, { level: 1, count: 2 }] },
  4: { currency: 30, lumpSum: 140, permanentItems: [{ level: 3, count: 1 }, { level: 2, count: 2 }, { level: 1, count: 1 }] },
  5: { currency: 50, lumpSum: 270, permanentItems: [{ level: 4, count: 1 }, { level: 3, count: 2 }, { level: 2, count: 1 }, { level: 1, count: 2 }] },
  6: { currency: 80, lumpSum: 450, permanentItems: [{ level: 5, count: 1 }, { level: 4, count: 2 }, { level: 3, count: 1 }, { level: 2, count: 2 }] },
  7: { currency: 125, lumpSum: 720, permanentItems: [{ level: 6, count: 1 }, { level: 5, count: 2 }, { level: 4, count: 1 }, { level: 3, count: 2 }] },
  8: { currency: 180, lumpSum: 1100, permanentItems: [{ level: 7, count: 1 }, { level: 6, count: 2 }, { level: 5, count: 1 }, { level: 4, count: 2 }] },
  9: { currency: 250, lumpSum: 1600, permanentItems: [{ level: 8, count: 1 }, { level: 7, count: 2 }, { level: 6, count: 1 }, { level: 5, count: 2 }] },
  10: { currency: 350, lumpSum: 2300, permanentItems: [{ level: 9, count: 1 }, { level: 8, count: 2 }, { level: 7, count: 1 }, { level: 6, count: 2 }] },
  11: { currency: 500, lumpSum: 3200, permanentItems: [{ level: 10, count: 1 }, { level: 9, count: 2 }, { level: 8, count: 1 }, { level: 7, count: 2 }] },
  12: { currency: 700, lumpSum: 4500, permanentItems: [{ level: 11, count: 1 }, { level: 10, count: 2 }, { level: 9, count: 1 }, { level: 8, count: 2 }] },
  13: { currency: 1000, lumpSum: 6400, permanentItems: [{ level: 12, count: 1 }, { level: 11, count: 2 }, { level: 10, count: 1 }, { level: 9, count: 2 }] },
  14: { currency: 1500, lumpSum: 9300, permanentItems: [{ level: 13, count: 1 }, { level: 12, count: 2 }, { level: 11, count: 1 }, { level: 10, count: 2 }] },
  15: { currency: 2250, lumpSum: 13500, permanentItems: [{ level: 14, count: 1 }, { level: 13, count: 2 }, { level: 12, count: 1 }, { level: 11, count: 2 }] },
  16: { currency: 3250, lumpSum: 20000, permanentItems: [{ level: 15, count: 1 }, { level: 14, count: 2 }, { level: 13, count: 1 }, { level: 12, count: 2 }] },
  17: { currency: 5000, lumpSum: 30000, permanentItems: [{ level: 16, count: 1 }, { level: 15, count: 2 }, { level: 14, count: 1 }, { level: 13, count: 2 }] },
  18: { currency: 7500, lumpSum: 45000, permanentItems: [{ level: 17, count: 1 }, { level: 16, count: 2 }, { level: 15, count: 1 }, { level: 14, count: 2 }] },
  19: { currency: 12000, lumpSum: 69000, permanentItems: [{ level: 18, count: 1 }, { level: 17, count: 2 }, { level: 16, count: 1 }, { level: 15, count: 2 }] },
  20: { currency: 20000, lumpSum: 112000, permanentItems: [{ level: 19, count: 1 }, { level: 18, count: 2 }, { level: 17, count: 1 }, { level: 16, count: 2 }] }
};

export const CampaignTools: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignLevel, setNewCampaignLevel] = useState(1);
  const [newCampaignPlayers, setNewCampaignPlayers] = useState(4);
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
  const [packageLevel, setPackageLevel] = useState(1);
  const [generatedPackage, setGeneratedPackage] = useState<{
    permanentItems: any[];
    consumables: any[];
    currency: number;
    totalValue: number;
  } | null>(null);

  // Load campaigns from localStorage on mount
  useEffect(() => {
    const savedCampaigns = localStorage.getItem('pf2e-campaigns');
    if (savedCampaigns) {
      const parsed = JSON.parse(savedCampaigns);
      const campaigns = parsed.map((c: any) => ({
        ...c,
        createdDate: new Date(c.createdDate),
        lastModified: new Date(c.lastModified),
        encounters: c.encounters.map((e: any) => ({
          ...e,
          date: new Date(e.date)
        }))
      }));
      setCampaigns(campaigns);
      if (campaigns.length > 0) {
        setActiveCampaign(campaigns[0]);
      }
    }
  }, []);

  // Save campaigns to localStorage whenever campaigns change
  useEffect(() => {
    if (campaigns.length > 0) {
      localStorage.setItem('pf2e-campaigns', JSON.stringify(campaigns));
    }
  }, [campaigns]);

  const createCampaign = () => {
    if (!newCampaignName.trim()) return;

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaignName.trim(),
      level: newCampaignLevel,
      playerCount: newCampaignPlayers,
      characters: [],
      encounters: [],
      totalLootValue: 0,
      createdDate: new Date(),
      lastModified: new Date()
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    setActiveCampaign(newCampaign);
    setIsCreatingCampaign(false);
    setNewCampaignName('');
    setNewCampaignLevel(1);
    setNewCampaignPlayers(4);
  };

  // const deleteCampaign = (campaignId: string) => {
  //   setCampaigns(prev => prev.filter(c => c.id !== campaignId));
  //   if (activeCampaign?.id === campaignId) {
  //     const remaining = campaigns.filter(c => c.id !== campaignId);
  //     setActiveCampaign(remaining.length > 0 ? remaining[0] : null);
  //   }
  // };

  const importCharacter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeCampaign) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const pathbuilderData = JSON.parse(e.target?.result as string);
        const character: Character = {
          id: Date.now().toString(),
          name: pathbuilderData.name || 'Unnamed Character',
          level: pathbuilderData.level || 1,
          pathbuilderData
        };

        setCampaigns(prev => prev.map(c => 
          c.id === activeCampaign.id 
            ? { 
                ...c, 
                characters: [...c.characters, character],
                lastModified: new Date()
              }
            : c
        ));

        setActiveCampaign(prev => prev ? {
          ...prev,
          characters: [...prev.characters, character]
        } : null);
      } catch (error) {
        alert('Failed to parse Pathbuilder JSON file');
      }
    };
    reader.readAsText(file);
  };

  const getExpectedWealth = () => {
    if (!activeCampaign) return { total: 0, currency: 0 };
    
    const baseData = partyTreasureByLevel[activeCampaign.level as keyof typeof partyTreasureByLevel];
    if (!baseData) return { total: 0, currency: 0 };

    const extraPlayers = Math.max(0, activeCampaign.playerCount - 4);
    const adjustedCurrency = baseData.currency + (extraPlayers * baseData.currencyPerPC);
    
    return {
      total: baseData.totalValue,
      currency: adjustedCurrency
    };
  };

  const getWealthStatus = () => {
    if (!activeCampaign) return 'normal';
    
    const expected = getExpectedWealth();
    const actual = activeCampaign.totalLootValue;
    const ratio = actual / expected.total;
    
    if (ratio < 0.75) return 'low';
    if (ratio > 1.25) return 'high';
    return 'normal';
  };

  const getCharacterExpectedWealth = (character: Character) => {
    const wealthData = characterWealthByLevel[character.level as keyof typeof characterWealthByLevel];
    return wealthData || { currency: 0, lumpSum: 0 };
  };

  const getCharacterWealthStatus = (character: Character) => {
    const expected = getCharacterExpectedWealth(character);
    const actual = character.assignedWealth || 0;
    const ratio = actual / expected.lumpSum;
    
    if (ratio < 0.75) return 'low';
    if (ratio > 1.25) return 'high';
    return 'normal';
  };

  const updateCharacterWealth = (characterId: string, wealth: number) => {
    if (!activeCampaign) return;

    setCampaigns(prev => prev.map(c => 
      c.id === activeCampaign.id 
        ? { 
            ...c, 
            characters: c.characters.map(ch => 
              ch.id === characterId 
                ? { ...ch, assignedWealth: wealth }
                : ch
            ),
            lastModified: new Date()
          }
        : c
    ));

    setActiveCampaign(prev => prev ? {
      ...prev,
      characters: prev.characters.map(ch => 
        ch.id === characterId 
          ? { ...ch, assignedWealth: wealth }
          : ch
      )
    } : null);
  };

  const distributeWealthEvenly = () => {
    if (!activeCampaign || activeCampaign.characters.length === 0) return;

    const wealthPerCharacter = Math.floor(activeCampaign.totalLootValue / activeCampaign.characters.length);
    
    setCampaigns(prev => prev.map(c => 
      c.id === activeCampaign.id 
        ? { 
            ...c, 
            characters: c.characters.map(ch => ({ 
              ...ch, 
              assignedWealth: wealthPerCharacter 
            })),
            lastModified: new Date()
          }
        : c
    ));

    setActiveCampaign(prev => prev ? {
      ...prev,
      characters: prev.characters.map(ch => ({ 
        ...ch, 
        assignedWealth: wealthPerCharacter 
      }))
    } : null);
  };

  const resetCharacterWealth = () => {
    if (!activeCampaign) return;

    setCampaigns(prev => prev.map(c => 
      c.id === activeCampaign.id 
        ? { 
            ...c, 
            characters: c.characters.map(ch => ({ 
              ...ch, 
              assignedWealth: 0 
            })),
            lastModified: new Date()
          }
        : c
    ));

    setActiveCampaign(prev => prev ? {
      ...prev,
      characters: prev.characters.map(ch => ({ 
        ...ch, 
        assignedWealth: 0 
      }))
    } : null);
  };

  const generateCharacterPackage = async () => {
    const wealthData = characterWealthByLevel[packageLevel as keyof typeof characterWealthByLevel];
    if (!wealthData) return;

    try {
      const permanentItems = [];
      const consumables = [];

      // Generate permanent items
      for (const itemGroup of wealthData.permanentItems) {
        for (let i = 0; i < itemGroup.count; i++) {
          try {
            // Get equipment items at the specified level
            const items = await databaseService.getEquipment(50, { 
              type: ['equipment', 'weapon', 'armor'],
              level: [itemGroup.level] 
            });
            
            if (items.length > 0) {
              const randomItem = items[Math.floor(Math.random() * items.length)];
              permanentItems.push({
                ...randomItem,
                itemLevel: itemGroup.level,
                category: 'permanent'
              });
            }
          } catch (error) {
            console.warn(`Failed to get items for level ${itemGroup.level}:`, error);
            // Add a placeholder item if database query fails
            permanentItems.push({
              name: `Level ${itemGroup.level} Item (placeholder)`,
              type: 'Equipment',
              description_fr: 'Item could not be generated from database',
              itemLevel: itemGroup.level,
              category: 'permanent'
            });
          }
        }
      }

      // Generate consumables (same levels as permanent items but from consumables)
      for (const itemGroup of wealthData.permanentItems) {
        for (let i = 0; i < itemGroup.count; i++) {
          try {
            const items = await databaseService.getEquipment(50, { 
              type: ['consumable'],
              level: [itemGroup.level] 
            });
            
            if (items.length > 0) {
              const randomItem = items[Math.floor(Math.random() * items.length)];
              consumables.push({
                ...randomItem,
                itemLevel: itemGroup.level,
                category: 'consumable'
              });
            }
          } catch (error) {
            console.warn(`Failed to get consumables for level ${itemGroup.level}:`, error);
            // Add a placeholder consumable if database query fails
            consumables.push({
              name: `Level ${itemGroup.level} Consumable (placeholder)`,
              type: 'Consumable',
              description_fr: 'Consumable could not be generated from database',
              itemLevel: itemGroup.level,
              category: 'consumable'
            });
          }
        }
      }

      setGeneratedPackage({
        permanentItems,
        consumables,
        currency: wealthData.currency,
        totalValue: wealthData.lumpSum
      });

    } catch (error) {
      console.error('Failed to generate character package:', error);
      alert('Failed to generate character package. Please try again.');
    }
  };

  if (!activeCampaign && campaigns.length === 0) {
    return (
      <div className="campaign-tools">
        <div className="campaign-header">
          <h3>Campaign Management</h3>
          <p>Create and manage your Pathfinder 2e campaigns with encounter and loot tracking</p>
        </div>

        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h4>No Campaigns Yet</h4>
          <p>Create your first campaign to start tracking encounters, loot, and party wealth</p>
          <button 
            className="create-campaign-btn"
            onClick={() => setIsCreatingCampaign(true)}
          >
            Create New Campaign
          </button>
        </div>

        {isCreatingCampaign && (
          <div className="modal-overlay">
            <div className="campaign-modal">
              <h4>Create New Campaign</h4>
              <div className="form-group">
                <label>Campaign Name</label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="Enter campaign name"
                />
              </div>
              <div className="form-group">
                <label>Starting Level</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newCampaignLevel}
                  onChange={(e) => setNewCampaignLevel(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="form-group">
                <label>Number of Players</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={newCampaignPlayers}
                  onChange={(e) => setNewCampaignPlayers(parseInt(e.target.value) || 4)}
                />
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setIsCreatingCampaign(false)}
                >
                  Cancel
                </button>
                <button 
                  className="create-btn"
                  onClick={createCampaign}
                  disabled={!newCampaignName.trim()}
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const expectedWealth = getExpectedWealth();
  const wealthStatus = getWealthStatus();

  return (
    <div className="campaign-tools">
      <div className="campaign-header">
        <div className="header-left">
          <h3>Campaign Management</h3>
          <div className="campaign-selector">
            <select 
              value={activeCampaign?.id || ''}
              onChange={(e) => {
                const campaign = campaigns.find(c => c.id === e.target.value);
                setActiveCampaign(campaign || null);
              }}
            >
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name} (Level {campaign.level})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="package-loot-btn"
            onClick={() => setIsGeneratingPackage(true)}
          >
            Package Loot for New Character
          </button>
          <button 
            className="create-campaign-btn"
            onClick={() => setIsCreatingCampaign(true)}
          >
            New Campaign
          </button>
        </div>
      </div>

      {activeCampaign && (
        <>
          <div className="campaign-overview">
            <div className="overview-card">
              <h4>Campaign Info</h4>
              <div className="campaign-stats">
                <div className="stat">
                  <span className="stat-label">Name:</span>
                  <span className="stat-value">{activeCampaign.name}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Level:</span>
                  <span className="stat-value">{activeCampaign.level}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Players:</span>
                  <span className="stat-value">{activeCampaign.playerCount}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Characters:</span>
                  <span className="stat-value">{activeCampaign.characters.length}</span>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <h4>Wealth Tracking</h4>
              <div className="wealth-stats">
                <div className="wealth-comparison">
                  <div className="wealth-item">
                    <span className="wealth-label">Expected (Table 10-9):</span>
                    <span className="wealth-value">{expectedWealth.total.toLocaleString()} GP</span>
                  </div>
                  <div className="wealth-item">
                    <span className="wealth-label">Actual Loot:</span>
                    <span className="wealth-value">{activeCampaign.totalLootValue.toLocaleString()} GP</span>
                  </div>
                  <div className={`wealth-status ${wealthStatus}`}>
                    {wealthStatus === 'low' && '⚠️ Below Expected'}
                    {wealthStatus === 'normal' && '✅ On Track'}
                    {wealthStatus === 'high' && '⬆️ Above Expected'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="campaign-sections">
            <div className="section characters-section">
              <div className="section-header">
                <h4>Characters ({activeCampaign.characters.length})</h4>
                <div className="section-actions">
                  <button 
                    className="wealth-action-btn distribute-btn"
                    onClick={distributeWealthEvenly}
                    disabled={activeCampaign.characters.length === 0 || activeCampaign.totalLootValue === 0}
                    title="Distribute total loot evenly among characters"
                  >
                    Distribute Evenly
                  </button>
                  <button 
                    className="wealth-action-btn reset-btn"
                    onClick={resetCharacterWealth}
                    disabled={activeCampaign.characters.length === 0}
                    title="Reset all character wealth to 0"
                  >
                    Reset Wealth
                  </button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importCharacter}
                    style={{ display: 'none' }}
                    id="character-import"
                  />
                  <label htmlFor="character-import" className="import-btn">
                    Import Pathbuilder JSON
                  </label>
                </div>
              </div>
              
              <div className="characters-list">
                {activeCampaign.characters.length === 0 ? (
                  <div className="empty-list">
                    <p>No characters imported yet</p>
                    <p className="empty-hint">Import Pathbuilder JSON files to track character data</p>
                  </div>
                ) : (
                  activeCampaign.characters.map(character => {
                    const expectedWealth = getCharacterExpectedWealth(character);
                    const wealthStatus = getCharacterWealthStatus(character);
                    const assignedWealth = character.assignedWealth || 0;
                    
                    return (
                      <div key={character.id} className="character-item">
                        <div className="character-main">
                          <div className="character-info">
                            <span className="character-name">{character.name}</span>
                            <span className="character-level">Level {character.level}</span>
                          </div>
                          
                          <div className="character-wealth">
                            <div className="wealth-input-group">
                              <label>Assigned Wealth:</label>
                              <input
                                type="number"
                                min="0"
                                value={assignedWealth}
                                onChange={(e) => updateCharacterWealth(character.id, parseInt(e.target.value) || 0)}
                                className="wealth-input"
                              />
                              <span className="wealth-unit">GP</span>
                            </div>
                            
                            <div className="wealth-comparison">
                              <div className="expected-wealth">
                                <span className="wealth-label">Expected (Table 10-10):</span>
                                <span className="wealth-value">{expectedWealth.lumpSum.toLocaleString()} GP</span>
                              </div>
                              <div className={`character-wealth-status ${wealthStatus}`}>
                                {wealthStatus === 'low' && '⚠️ Below'}
                                {wealthStatus === 'normal' && '✅ On Track'}
                                {wealthStatus === 'high' && '⬆️ Above'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="character-actions">
                          <button 
                            className="delete-character"
                            onClick={() => {
                              setCampaigns(prev => prev.map(c => 
                                c.id === activeCampaign.id 
                                  ? { 
                                      ...c, 
                                      characters: c.characters.filter(ch => ch.id !== character.id),
                                      lastModified: new Date()
                                    }
                                  : c
                              ));
                              setActiveCampaign(prev => prev ? {
                                ...prev,
                                characters: prev.characters.filter(ch => ch.id !== character.id)
                              } : null);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <h4>Encounters ({activeCampaign.encounters.length})</h4>
              </div>
              
              <div className="encounters-list">
                {activeCampaign.encounters.length === 0 ? (
                  <div className="empty-list">
                    <p>No encounters tracked yet</p>
                    <p className="empty-hint">Encounters will appear here when generated from the Loot Generator</p>
                  </div>
                ) : (
                  activeCampaign.encounters.map(encounter => (
                    <div key={encounter.id} className="encounter-item">
                      <div className="encounter-header">
                        <span className="encounter-date">{encounter.date.toLocaleDateString()}</span>
                        <span className="encounter-difficulty">{encounter.difficulty}</span>
                        <span className="encounter-value">{encounter.totalValue} GP</span>
                      </div>
                      <div className="encounter-description">{encounter.description}</div>
                      <div className="encounter-loot">
                        {encounter.loot.map((item, idx) => (
                          <span key={idx} className="loot-tag">{item.name}</span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {isCreatingCampaign && (
        <div className="modal-overlay">
          <div className="campaign-modal">
            <h4>Create New Campaign</h4>
            <div className="form-group">
              <label>Campaign Name</label>
              <input
                type="text"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                placeholder="Enter campaign name"
              />
            </div>
            <div className="form-group">
              <label>Starting Level</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newCampaignLevel}
                onChange={(e) => setNewCampaignLevel(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="form-group">
              <label>Number of Players</label>
              <input
                type="number"
                min="1"
                max="8"
                value={newCampaignPlayers}
                onChange={(e) => setNewCampaignPlayers(parseInt(e.target.value) || 4)}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setIsCreatingCampaign(false)}
              >
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={createCampaign}
                disabled={!newCampaignName.trim()}
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {isGeneratingPackage && (
        <div className="modal-overlay">
          <div className="package-modal">
            <h4>Package Loot for New Character</h4>
            <p>Generate complete starting wealth package based on Table 10-10</p>
            
            <div className="form-group">
              <label>Character Level</label>
              <select
                value={packageLevel}
                onChange={(e) => setPackageLevel(parseInt(e.target.value))}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>

            {!generatedPackage ? (
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setIsGeneratingPackage(false)}
                >
                  Cancel
                </button>
                <button 
                  className="generate-btn"
                  onClick={generateCharacterPackage}
                >
                  Generate Package
                </button>
              </div>
            ) : (
              <div className="package-results">
                <div className="package-summary">
                  <h5>Level {packageLevel} Character Package</h5>
                  <div className="summary-stats">
                    <span className="stat">
                      <strong>Total Value:</strong> {generatedPackage.totalValue.toLocaleString()} GP
                    </span>
                    <span className="stat">
                      <strong>Currency:</strong> {generatedPackage.currency.toLocaleString()} GP
                    </span>
                    <span className="stat">
                      <strong>Permanent Items:</strong> {generatedPackage.permanentItems.length}
                    </span>
                    <span className="stat">
                      <strong>Consumables:</strong> {generatedPackage.consumables.length}
                    </span>
                  </div>
                </div>

                <div className="package-sections">
                  <div className="package-section">
                    <h6>Permanent Items</h6>
                    <div className="items-list">
                      {generatedPackage.permanentItems.map((item, index) => (
                        <div key={index} className="package-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-level">Level {item.itemLevel}</span>
                          <span className="item-type">{item.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="package-section">
                    <h6>Consumables</h6>
                    <div className="items-list">
                      {generatedPackage.consumables.map((item, index) => (
                        <div key={index} className="package-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-level">Level {item.itemLevel}</span>
                          <span className="item-type">{item.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="package-section">
                    <h6>Currency</h6>
                    <div className="currency-display">
                      <span className="currency-amount">{generatedPackage.currency.toLocaleString()} Gold Pieces</span>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    className="regenerate-btn"
                    onClick={generateCharacterPackage}
                  >
                    Regenerate
                  </button>
                  <button 
                    className="close-btn"
                    onClick={() => {
                      setIsGeneratingPackage(false);
                      setGeneratedPackage(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};