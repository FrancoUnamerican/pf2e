export interface PF2eItem {
  _id: string;
  name: string;
  type?: string;
  system: any;
  description_fr?: string;
  publicnotes_fr?: string;
}

export interface Spell extends PF2eItem {
  type: 'spell';
  system: {
    description: { value: string };
    traits: { traditions: string[] };
    level: { value: number };
  };
}

export interface Monster extends PF2eItem {
  type: 'npc';
  system: {
    details: { 
      publicNotes?: string;
      level?: { value: number };
      languages?: { value: string[] };
    };
    traits: { 
      value: string[];
      size: { value: string };
    };
    attributes?: {
      ac?: { value: number };
      hp?: { max: number; details?: string };
      speed?: { value: number; otherSpeeds?: Array<{ type: string; value: number }> };
      immunities?: Array<{ type: string }>;
      resistances?: Array<{ type: string; value?: number }>;
      weaknesses?: Array<{ type: string; value?: number }>;
    };
    abilities?: {
      [key: string]: { mod: number; value: number };
    };
    saves?: {
      fortitude?: { value: number };
      reflex?: { value: number };
      will?: { value: number };
    };
    skills?: {
      [skill: string]: { base: number };
    };
    perception?: {
      mod: number;
      senses?: Array<{ type: string }>;
    };
  };
}

export type Language = 'en' | 'fr';

export interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
}

export interface Character {
  _id: string;
  name: string;
  system: {
    details: {
      level: { value: number };
      heritage: { name: string };
      ancestry: { name: string };
      class: { name: string };
      background: { name: string };
    };
    attributes: {
      hp: { value: number; max: number };
      ac: { value: number };
    };
  };
  actions: PF2eItem[];
  feats: PF2eItem[];
  spells: PF2eItem[];
  equipment: PF2eItem[];
}

export interface Feat extends PF2eItem {
  type: 'feat';
  system: {
    description: { value: string };
    level: { value: number };
    traits: { value: string[] };
  };
}

export interface Action extends PF2eItem {
  type: 'action';
  system: {
    description: { value: string };
    actionType: { value: string };
    actions: { value: number | string };
    traits: { value: string[] };
  };
}

export interface Equipment extends PF2eItem {
  type: 'equipment' | 'weapon' | 'armor' | 'consumable';
  system: {
    description: { value: string };
    level: { value: number };
    price: { value: { gp?: number; sp?: number; cp?: number } };
    traits: { value: string[] };
  };
}