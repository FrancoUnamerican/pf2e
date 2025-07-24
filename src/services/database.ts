import type { Spell, Monster, Feat, Action, Equipment, PF2eItem } from '../types';

// Declare global electronAPI
declare global {
  interface Window {
    electronAPI?: {
      getMonsters: (limit?: number, filters?: MonsterFilters) => Promise<any[]>;
      searchSpells: (query: string) => Promise<any[]>;
      getSpells: (limit?: number, filters?: SpellFilters) => Promise<any[]>;
      getFeats: (limit?: number, filters?: FeatFilters) => Promise<any[]>;
      getActions: (limit?: number) => Promise<any[]>;
      getEquipment: (limit?: number, filters?: EquipmentFilters) => Promise<any[]>;
      searchAll: (query: string, tables?: string[]) => Promise<any[]>;
      getItemById: (id: string, table: string) => Promise<any>;
      processGameText: (text: string, language?: string) => Promise<string>;
    };
  }
}

export interface SpellFilters {
  traditions?: string[];
  level?: number[];
  school?: string[];
  traits?: string[];
}

export interface FeatFilters {
  level?: number[];
  traits?: string[];
  type?: string[];
}

export interface EquipmentFilters {
  type?: string[];
  level?: number[];
  traits?: string[];
  rarity?: string[];
}

export interface MonsterFilters {
  source?: string;
  level?: number[];
  traits?: string[];
  rarity?: string[];
}

class DatabaseService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log('Database service initialized');
    this.initialized = true;
  }

  private async executeQuery<T = any>(method: string, ...args: any[]): Promise<T> {
    await this.initialize();
    
    if (window.electronAPI && (window.electronAPI as any)[method]) {
      return (window.electronAPI as any)[method](...args);
    } else {
      throw new Error(`Database method ${method} not available in web mode. Use Electron app.`);
    }
  }

  // Monster queries
  async getMonsters(limit = 50, filters?: MonsterFilters): Promise<Monster[]> {
    return this.executeQuery('getMonsters', limit, filters);
  }

  // Spell queries
  async searchSpells(query: string): Promise<Spell[]> {
    return this.executeQuery('searchSpells', query);
  }

  async getSpells(limit = 50, filters?: SpellFilters): Promise<Spell[]> {
    return this.executeQuery('getSpells', limit, filters);
  }

  // Feat queries
  async getFeats(limit = 50, filters?: FeatFilters): Promise<Feat[]> {
    return this.executeQuery('getFeats', limit, filters);
  }

  // Action queries
  async getActions(limit = 50): Promise<Action[]> {
    return this.executeQuery('getActions', limit);
  }

  // Equipment queries
  async getEquipment(limit = 50, filters?: EquipmentFilters): Promise<Equipment[]> {
    return this.executeQuery('getEquipment', limit, filters);
  }

  // General search across all tables
  async searchAll(query: string, tables?: string[]): Promise<PF2eItem[]> {
    return this.executeQuery('searchAll', query, tables);
  }

  // Get specific item by ID
  async getItemById(id: string, table: string): Promise<PF2eItem | null> {
    return this.executeQuery('getItemById', id, table);
  }

  // Process game text with UUID redirection
  async processGameText(text: string, language = 'en'): Promise<string> {
    return this.executeQuery('processGameText', text, language);
  }

  // Distance conversion helper
  convertDistance(feet: number): string {
    const meters = Math.round(feet * 0.3048 * 100) / 100;
    return `${meters} mètres (${feet} feet)`;
  }
}

export const databaseService = new DatabaseService();

// Re-export types from types module for convenience
export type { Spell, Equipment, PF2eItem } from '../types';