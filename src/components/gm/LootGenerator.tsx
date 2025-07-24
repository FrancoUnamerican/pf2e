import React, { useState, useEffect } from 'react';
import { databaseService } from '../../services/database';
import './LootGenerator.css';

interface DatabaseItem {
  _id: string;
  name: string;
  system: any;
  type: string;
}

interface LootItem {
  _id: string;
  name: string;
  type: string;
  value: string;
  rarity: string;
  level?: number;
  price?: number;
  category?: string;
}

export const LootGenerator: React.FC = () => {
  const [partyLevel, setPartyLevel] = useState(1);
  const [encounterDifficulty, setEncounterDifficulty] = useState<'trivial' | 'low' | 'moderate' | 'severe' | 'extreme'>('moderate');
  const [creatureType, setCreatureType] = useState('humanoid');
  const [generatedLoot, setGeneratedLoot] = useState<LootItem[]>([]);
  const [treasureInfo, setTreasureInfo] = useState<{base: number, final: number} | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Cache for database items to avoid repeated queries
  const [itemCache, setItemCache] = useState<{
    equipment: DatabaseItem[];
    consumables: DatabaseItem[];
    weapons: DatabaseItem[];
    armor: DatabaseItem[];
    treasure: DatabaseItem[];
  } | null>(null);

  // Table 5-3: Treasure by Encounter (in gold pieces)
  const treasureByEncounter = {
    1: { low: 13, moderate: 18, severe: 26, extreme: 35 },
    2: { low: 23, moderate: 30, severe: 45, extreme: 60 },
    3: { low: 38, moderate: 50, severe: 75, extreme: 100 },
    4: { low: 65, moderate: 85, severe: 130, extreme: 170 },
    5: { low: 100, moderate: 135, severe: 200, extreme: 270 },
    6: { low: 150, moderate: 200, severe: 300, extreme: 400 },
    7: { low: 220, moderate: 290, severe: 440, extreme: 580 },
    8: { low: 300, moderate: 400, severe: 600, extreme: 800 },
    9: { low: 430, moderate: 570, severe: 860, extreme: 1140 },
    10: { low: 600, moderate: 800, severe: 1200, extreme: 1600 },
    11: { low: 865, moderate: 1150, severe: 1725, extreme: 2300 },
    12: { low: 1250, moderate: 1650, severe: 2475, extreme: 3300 },
    13: { low: 1875, moderate: 2500, severe: 3750, extreme: 5000 },
    14: { low: 2750, moderate: 3650, severe: 5500, extreme: 7300 },
    15: { low: 4100, moderate: 5450, severe: 8200, extreme: 10900 },
    16: { low: 6200, moderate: 8250, severe: 12400, extreme: 16500 },
    17: { low: 9600, moderate: 12800, severe: 19200, extreme: 25600 },
    18: { low: 15600, moderate: 20800, severe: 31200, extreme: 41600 },
    19: { low: 26600, moderate: 35500, severe: 53250, extreme: 71000 },
    20: { low: 36800, moderate: 49000, severe: 73500, extreme: 98000 }
  };

  // Load database items on component mount
  useEffect(() => {
    loadDatabaseItems();
  }, []);

  const loadDatabaseItems = async () => {
    try {
      const [equipment, consumables, weapons, armor, treasure] = await Promise.all([
        databaseService.getEquipment(500),
        databaseService.searchAll('', ['consumable']),
        databaseService.searchAll('', ['weapon']),
        databaseService.searchAll('', ['armor']),
        databaseService.searchAll('', ['treasure'])
      ]);

      setItemCache({
        equipment: equipment as DatabaseItem[],
        consumables: consumables as DatabaseItem[],
        weapons: weapons as DatabaseItem[],
        armor: armor as DatabaseItem[],
        treasure: treasure as DatabaseItem[]
      });
    } catch (error) {
      console.error('Failed to load database items:', error);
    }
  };

  // Enhanced creature type loot preferences
  const creatureTypeLootPreferences = {
    humanoid: {
      weapons: 0.3,
      armor: 0.2,
      equipment: 0.2,
      consumables: 0.2,
      treasure: 0.1,
      preferredCategories: ['weapon', 'armor', 'potion', 'scroll']
    },
    beast: {
      weapons: 0.1,
      armor: 0.05,
      equipment: 0.15,
      consumables: 0.25,
      treasure: 0.45,
      preferredCategories: ['other', 'material', 'talisman']
    },
    undead: {
      weapons: 0.15,
      armor: 0.1,
      equipment: 0.25,
      consumables: 0.15,
      treasure: 0.35,
      preferredCategories: ['cursed', 'necromancy', 'poison']
    },
    fiend: {
      weapons: 0.25,
      armor: 0.15,
      equipment: 0.3,
      consumables: 0.1,
      treasure: 0.2,
      preferredCategories: ['evocation', 'enchantment', 'weapon']
    },
    celestial: {
      weapons: 0.2,
      armor: 0.15,
      equipment: 0.3,
      consumables: 0.2,
      treasure: 0.15,
      preferredCategories: ['divine', 'healing', 'elixir']
    }
  };

  const generateLoot = async () => {
    if (!itemCache) {
      console.error('Item cache not loaded yet');
      return;
    }
    
    setLoading(true);
    const loot: LootItem[] = [];
    
    try {
      // Get base treasure value from Table 5-3
      const level = Math.max(1, Math.min(20, partyLevel));
      const treasureData = treasureByEncounter[level as keyof typeof treasureByEncounter];
      
      if (!treasureData) return;
      
      // Get base value for the encounter difficulty
      let baseTreasureValue = 0;
      if (encounterDifficulty === 'trivial') {
        baseTreasureValue = Math.floor(treasureData.low * 0.5);
      } else if (encounterDifficulty === 'low') {
        baseTreasureValue = treasureData.low;
      } else if (encounterDifficulty === 'moderate') {
        baseTreasureValue = treasureData.moderate;
      } else if (encounterDifficulty === 'severe') {
        baseTreasureValue = treasureData.severe;
      } else if (encounterDifficulty === 'extreme') {
        baseTreasureValue = treasureData.extreme;
      }
      
      // Add some randomness (±15% for more realistic distribution)
      const finalTreasureValue = Math.floor(baseTreasureValue * (0.85 + Math.random() * 0.3));
      
      // Store treasure info for display
      setTreasureInfo({ base: baseTreasureValue, final: finalTreasureValue });
      
      // Generate currency (40-60% of total treasure value)
      const currencyValue = Math.floor(finalTreasureValue * (0.4 + Math.random() * 0.2));
      const currencies = generateCurrencyMix(currencyValue);
      loot.push(...currencies);
      
      // Generate items based on creature type and remaining treasure value
      const remainingValue = finalTreasureValue - currencyValue;
      const items = await generateItems(remainingValue);
      loot.push(...items);
      
      setGeneratedLoot(loot);
    } catch (error) {
      console.error('Failed to generate loot:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCurrencyMix = (totalGold: number) => {
    let remainingValue = totalGold;
    const currencies: LootItem[] = [];
    
    // Platinum (10 gp each) - for high value encounters
    if (remainingValue >= 50) {
      const pp = Math.floor(remainingValue * (0.05 + Math.random() * 0.15) / 10);
      if (pp > 0) {
        currencies.push({ 
          _id: 'currency-pp',
          name: `${pp} Platinum Pieces`, 
          type: 'Currency', 
          value: `${pp * 10} GP`, 
          rarity: 'common',
          price: pp * 10
        });
        remainingValue -= pp * 10;
      }
    }
    
    // Gold pieces - main currency
    const gp = Math.floor(remainingValue * (0.5 + Math.random() * 0.3));
    if (gp > 0) {
      currencies.push({ 
        _id: 'currency-gp',
        name: `${gp} Gold Pieces`, 
        type: 'Currency', 
        value: `${gp} GP`, 
        rarity: 'common',
        price: gp
      });
      remainingValue -= gp;
    }
    
    // Silver pieces (0.1 gp each)
    const silverValue = remainingValue * 0.7;
    const sp = Math.floor(silverValue * 10);
    if (sp > 0) {
      currencies.push({ 
        _id: 'currency-sp',
        name: `${sp} Silver Pieces`, 
        type: 'Currency', 
        value: `${Math.floor(sp / 10)} GP`, 
        rarity: 'common',
        price: sp / 10
      });
      remainingValue -= silverValue;
    }
    
    // Copper pieces (0.01 gp each) - for remaining small amounts
    const cp = Math.floor(remainingValue * 100);
    if (cp > 0) {
      currencies.push({ 
        _id: 'currency-cp',
        name: `${cp} Copper Pieces`, 
        type: 'Currency', 
        value: `${Math.floor(cp / 100)} GP`, 
        rarity: 'common',
        price: cp / 100
      });
    }
    
    return currencies;
  };

  const generateItems = async (budgetValue: number): Promise<LootItem[]> => {
    if (!itemCache) return [];
    
    const items: LootItem[] = [];
    const preferences = creatureTypeLootPreferences[creatureType as keyof typeof creatureTypeLootPreferences] || creatureTypeLootPreferences.humanoid;
    
    // Determine number of items based on encounter difficulty
    const numItems = encounterDifficulty === 'trivial' ? 1 : 
                    encounterDifficulty === 'low' ? 2 :
                    encounterDifficulty === 'moderate' ? 3 :
                    encounterDifficulty === 'severe' ? 4 : 5;
    
    let remainingBudget = budgetValue;
    
    for (let i = 0; i < numItems && remainingBudget > 0; i++) {
      // Choose item type based on creature preferences
      const itemType = chooseItemType(preferences);
      const itemPool = getItemPool(itemType);
      
      if (itemPool.length === 0) continue;
      
      // Filter items by level and budget
      const levelRange = getItemLevelRange();
      const appropriateItems = itemPool.filter(item => {
        const itemLevel = item.system?.level?.value || 0;
        const itemPrice = getItemPrice(item);
        
        return itemLevel >= levelRange.min && 
               itemLevel <= levelRange.max && 
               itemPrice <= remainingBudget;
      });
      
      if (appropriateItems.length === 0) continue;
      
      // Choose item with rarity weighting
      const selectedItem = chooseItemByRarity(appropriateItems);
      const lootItem = convertToLootItem(selectedItem);
      
      items.push(lootItem);
      remainingBudget -= lootItem.price || 0;
    }
    
    return items;
  };

  const chooseItemType = (preferences: any): string => {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [type, weight] of Object.entries(preferences)) {
      if (type === 'preferredCategories') continue;
      cumulative += weight as number;
      if (rand <= cumulative) {
        return type;
      }
    }
    
    return 'equipment'; // fallback
  };

  const getItemPool = (itemType: string): DatabaseItem[] => {
    if (!itemCache) return [];
    
    switch (itemType) {
      case 'weapons': return itemCache.weapons;
      case 'armor': return itemCache.armor;
      case 'consumables': return itemCache.consumables;
      case 'treasure': return itemCache.treasure;
      case 'equipment':
      default: return itemCache.equipment;
    }
  };

  const getItemLevelRange = () => {
    const baseLevel = partyLevel;
    return {
      min: Math.max(0, baseLevel - 2),
      max: Math.min(20, baseLevel + 1)
    };
  };

  const getItemPrice = (item: DatabaseItem): number => {
    const price = item.system?.price?.value;
    if (!price) return 0;
    
    // Convert price object to gold pieces
    if (typeof price === 'object') {
      const gp = price.gp || 0;
      const sp = (price.sp || 0) / 10;
      const cp = (price.cp || 0) / 100;
      return gp + sp + cp;
    }
    
    return 0;
  };

  const chooseItemByRarity = (items: DatabaseItem[]): DatabaseItem => {
    // Weight by rarity: common 60%, uncommon 30%, rare 8%, unique 2%
    const rarityWeights = {
      common: 0.6,
      uncommon: 0.3,
      rare: 0.08,
      unique: 0.02
    };
    
    // Group items by rarity
    const itemsByRarity = {
      common: items.filter(item => (item.system?.traits?.rarity || 'common') === 'common'),
      uncommon: items.filter(item => item.system?.traits?.rarity === 'uncommon'),
      rare: items.filter(item => item.system?.traits?.rarity === 'rare'),
      unique: items.filter(item => item.system?.traits?.rarity === 'unique')
    };
    
    // Choose rarity based on weights
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      cumulative += weight;
      const rarityItems = itemsByRarity[rarity as keyof typeof itemsByRarity];
      
      if (rand <= cumulative && rarityItems.length > 0) {
        return rarityItems[Math.floor(Math.random() * rarityItems.length)];
      }
    }
    
    // Fallback to any available item
    return items[Math.floor(Math.random() * items.length)];
  };

  const convertToLootItem = (item: DatabaseItem): LootItem => {
    const price = getItemPrice(item);
    const level = item.system?.level?.value || 0;
    const rarity = item.system?.traits?.rarity || 'common';
    const itemType = item.type || 'Item';
    const category = item.system?.category || itemType;
    
    return {
      _id: item._id,
      name: item.name,
      type: itemType.charAt(0).toUpperCase() + itemType.slice(1),
      value: price > 0 ? `${price} GP` : `Level ${level}`,
      rarity: rarity,
      level: level,
      price: price,
      category: category
    };
  };

  const clearLoot = () => {
    setGeneratedLoot([]);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'uncommon': return '#f59e0b';
      case 'rare': return '#3b82f6';
      case 'legendary': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="loot-generator">
      <div className="generator-header">
        <h3>Loot Generator</h3>
        <p>Generate appropriate loot based on encounter parameters</p>
      </div>

      <div className="loot-settings">
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
          <label>Encounter Difficulty</label>
          <select value={encounterDifficulty} onChange={(e) => setEncounterDifficulty(e.target.value as any)}>
            <option value="trivial">Trivial</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
            <option value="extreme">Extreme</option>
          </select>
        </div>

        <div className="setting-group">
          <label>Creature Type</label>
          <select value={creatureType} onChange={(e) => setCreatureType(e.target.value)}>
            <option value="humanoid">Humanoid (weapons, armor, equipment)</option>
            <option value="beast">Beast (hides, claws, natural materials)</option>
            <option value="undead">Undead (cursed items, bones, necromantic)</option>
            <option value="fiend">Fiend (infernal items, weapons, magic)</option>
            <option value="celestial">Celestial (blessed items, divine magic)</option>
          </select>
        </div>

        <div className="loot-actions">
          <button 
            className="generate-btn" 
            onClick={generateLoot}
            disabled={loading || !itemCache}
          >
            {loading ? 'Generating...' : 'Generate Loot'}
          </button>
          <button className="clear-btn" onClick={clearLoot}>
            Clear
          </button>
        </div>
        
        {!itemCache && (
          <div className="loading-info">
            <p>Loading item database...</p>
          </div>
        )}
      </div>

      {generatedLoot.length > 0 && (
        <div className="loot-result">
          <div className="loot-header">
            <h4>Generated Loot</h4>
            {treasureInfo && (
              <div className="treasure-info">
                <span className="treasure-base">Base: {treasureInfo.base} GP</span>
                <span className="treasure-final">Final: {treasureInfo.final} GP</span>
              </div>
            )}
          </div>
          <div className="loot-items">
            {generatedLoot.map((item, index) => (
              <div key={index} className="loot-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-type">{item.type}</span>
                  {item.category && item.category !== item.type && (
                    <span className="item-category">({item.category})</span>
                  )}
                </div>
                <div className="item-meta">
                  {item.level !== undefined && item.level > 0 && (
                    <span className="item-level">Level {item.level}</span>
                  )}
                  <span className="item-value">{item.value}</span>
                  <span 
                    className="item-rarity"
                    style={{ color: getRarityColor(item.rarity) }}
                  >
                    {item.rarity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};