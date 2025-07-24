// Language utility functions for bilingual PF2e Assistant
import type { Language } from '../types';

// UI text translations
export const translations = {
  // Player Page
  playerTools: { en: 'Player Tools', fr: 'Outils Joueur' },
  characterReference: { en: 'Character Reference', fr: 'Référence Personnage' },
  rulesCompendium: { en: 'Rules Compendium', fr: 'Compendium des Règles' },
  spellsAndItems: { en: 'Spells & Items', fr: 'Sorts et Objets' },
  
  // Character Sheet
  characterDetails: { en: 'Character Details', fr: 'Détails du Personnage' },
  level: { en: 'Level', fr: 'Niveau' },
  ancestry: { en: 'Ancestry', fr: 'Ascendance' },
  heritage: { en: 'Heritage', fr: 'Héritage' },
  class: { en: 'Class', fr: 'Classe' },
  background: { en: 'Background', fr: 'Historique' },
  alignment: { en: 'Alignment', fr: 'Alignement' },
  age: { en: 'Age', fr: 'Âge' },
  size: { en: 'Size', fr: 'Taille' },
  deity: { en: 'Deity', fr: 'Divinité' },
  languages: { en: 'Languages', fr: 'Langues' },
  
  // Abilities
  abilities: { en: 'Abilities', fr: 'Caractéristiques' },
  strength: { en: 'STR', fr: 'FOR' },
  dexterity: { en: 'DEX', fr: 'DEX' },
  constitution: { en: 'CON', fr: 'CON' },
  intelligence: { en: 'INT', fr: 'INT' },
  wisdom: { en: 'WIS', fr: 'SAG' },
  charisma: { en: 'CHA', fr: 'CHA' },
  
  // Combat Stats
  combatStats: { en: 'Combat Statistics', fr: 'Statistiques de Combat' },
  defense: { en: 'Defense', fr: 'Défense' },
  armorClass: { en: 'AC', fr: 'CA' },
  hitPoints: { en: 'Hit Points', fr: 'Points de Vie' },
  speed: { en: 'Speed', fr: 'Vitesse' },
  feet: { en: 'feet', fr: 'pieds' },
  
  // Saves
  savingThrows: { en: 'Saving Throws', fr: 'Jets de Sauvegarde' },
  fortitude: { en: 'Fortitude', fr: 'Vigueur' },
  reflex: { en: 'Reflex', fr: 'Réflexes' },
  will: { en: 'Will', fr: 'Volonté' },
  perception: { en: 'Perception', fr: 'Perception' },
  
  // Skills
  primarySkills: { en: 'Primary Skills', fr: 'Compétences Principales' },
  nature: { en: 'Nature', fr: 'Nature' },
  survival: { en: 'Survival', fr: 'Survie' },
  
  // Items
  feats: { en: 'Feats', fr: 'Dons' },
  weapons: { en: 'Weapons', fr: 'Armes' },
  
  // Spell/Magic
  focusSpells: { en: 'Focus Spells', fr: 'Sorts de Focalisation' },
  tradition: { en: 'Tradition', fr: 'Tradition' },
  ability: { en: 'Ability', fr: 'Caractéristique' },
  
  // Combat
  attack: { en: 'Attack', fr: 'Attaque' },
  damage: { en: 'Damage', fr: 'Dégâts' },
  worn: { en: 'Worn', fr: 'Porté' },
  invested: { en: 'Invested', fr: 'Investi' },
  
  // Animals/Pets
  animalCompanions: { en: 'Animal Companions', fr: 'Compagnons Animaux' },
  type: { en: 'Type', fr: 'Type' },
  mature: { en: 'Mature', fr: 'Mature' },
  yes: { en: 'Yes', fr: 'Oui' },
  no: { en: 'No', fr: 'Non' },
  specializations: { en: 'Specializations', fr: 'Spécialisations' },
  
  // Money
  wealth: { en: 'Wealth', fr: 'Richesse' },
  
  // UI Controls
  summaryView: { en: 'Summary View', fr: 'Vue Résumé' },
  rawJson: { en: 'Raw JSON', fr: 'JSON Brut' },
  uploadNewCharacter: { en: 'Upload New Character', fr: 'Télécharger Nouveau Personnage' },
  close: { en: 'Close', fr: 'Fermer' },
  
  // Search/Rules
  searchRulesCompendium: { en: 'Rules Compendium', fr: 'Compendium des Règles' },
  searchDescription: { en: 'Search through feats, actions, rules, and hazards (Spells & Items have dedicated tabs)', fr: 'Recherchez parmi les dons, actions, règles et dangers (Sorts et Objets ont des onglets dédiés)' },
  searchPlaceholder: { en: 'Search for rules, feats, actions, hazards...', fr: 'Rechercher des règles, dons, actions, dangers...' },
  filterByCategory: { en: 'Filter by category:', fr: 'Filtrer par catégorie:' },
  clearAll: { en: 'Clear all', fr: 'Effacer tout' },
  
  // Categories
  actions: { en: 'Actions', fr: 'Actions' },
  rules: { en: 'Rules', fr: 'Règles' },
  hazards: { en: 'Hazards', fr: 'Dangers' },
  
  // Search Results
  readyToSearch: { en: 'Ready to search', fr: 'Prêt à rechercher' },
  searchPrompt: { en: 'Enter at least 2 characters to search through the Pathfinder 2e rules compendium', fr: 'Entrez au moins 2 caractères pour rechercher dans le compendium Pathfinder 2e' },
  basicActions: { en: 'Basic Actions', fr: 'Actions de Base' },
  basicActionsDesc: { en: 'Common actions used in combat and exploration', fr: 'Actions communes utilisées en combat et exploration' },
  noResults: { en: 'No results found', fr: 'Aucun résultat trouvé' },
  noResultsDesc: { en: 'Try different search terms or adjust your filters', fr: 'Essayez des termes de recherche différents ou ajustez vos filtres' },
  results: { en: 'results', fr: 'résultats' },
  result: { en: 'result', fr: 'résultat' },
  found: { en: 'found', fr: 'trouvé' },
  foundPlural: { en: 'found', fr: 'trouvés' },
  
  // Spells & Equipment
  spells: { en: 'Spells', fr: 'Sorts' },
  equipment: { en: 'Equipment', fr: 'Équipement' },
  spellsTab: { en: 'Spells', fr: 'Sorts' },
  equipmentTab: { en: 'Equipment', fr: 'Équipement' },
  traditions: { en: 'Traditions', fr: 'Traditions' },
  spellLevels: { en: 'Spell Levels', fr: 'Niveaux de Sorts' },
  equipmentTypes: { en: 'Equipment Types', fr: 'Types d\'Équipement' },
  clear: { en: 'Clear', fr: 'Effacer' },
  clearAllFilters: { en: 'Clear All Filters', fr: 'Effacer Tous les Filtres' },
  loading: { en: 'Loading', fr: 'Chargement' },
  filtered: { en: 'filtered', fr: 'filtré(s)' },
  noItemsFound: { en: 'No items found', fr: 'Aucun élément trouvé' },
  adjustFilters: { en: 'Try adjusting your filters or check back later', fr: 'Essayez d\'ajuster vos filtres ou revenez plus tard' },
  cantrip: { en: 'Cantrip', fr: 'Tour de Magie' },
  generalEquipment: { en: 'General Equipment', fr: 'Équipement Général' },
  weapon: { en: 'Weapon', fr: 'Arme' },
  armor: { en: 'Armor', fr: 'Armure' },
  consumable: { en: 'Consumable', fr: 'Consommable' },
  
  // Magic Traditions
  arcane: { en: 'Arcane', fr: 'Profane' },
  divine: { en: 'Divine', fr: 'Divine' },
  occult: { en: 'Occult', fr: 'Occulte' },
  primal: { en: 'Primal', fr: 'Primordiale' },

  // Common
  unknown: { en: 'unknown', fr: 'inconnu' },
  noDescription: { en: 'No description available', fr: 'Aucune description disponible' },
  basicAction: { en: 'Basic Action', fr: 'Action de Base' }
};

// Get translated text
export function t(key: keyof typeof translations, language: Language): string {
  return translations[key]?.[language] || translations[key]?.en || key;
}

// Content extraction utilities
export interface ContentData {
  description?: string;
  publicNotes?: string;
}

// Extract content based on language preference with fallback
export function extractContent(record: any, language: Language): ContentData {
  if (!record) return {};
  
  let description = '';
  let publicNotes = '';
  
  if (language === 'fr') {
    // Try French first - handle both available French columns
    description = record.description_fr || '';
    publicNotes = record.publicnotes_fr || '';
    
    // Special case: For NPCs/monsters, publicnotes_fr often contains the main content
    if (!description && publicNotes) {
      description = publicNotes;
    }
    
    // Fallback to English if French not available
    if (!description && !publicNotes) {
      const system = typeof record.system === 'string' ? JSON.parse(record.system) : record.system;
      if (system) {
        description = system.description?.value || '';
        publicNotes = system.details?.publicNotes || '';
        
        // Use description as primary content if no publicNotes
        if (!description && publicNotes) {
          description = publicNotes;
        }
      }
    }
  } else {
    // English mode - extract from system JSON
    const system = typeof record.system === 'string' ? JSON.parse(record.system) : record.system;
    if (system) {
      description = system.description?.value || '';
      publicNotes = system.details?.publicNotes || '';
      
      // Use description as primary content if no publicNotes
      if (!description && publicNotes) {
        description = publicNotes;
      }
    }
  }
  
  return { description, publicNotes };
}

// Process monster abilities/actions based on language
export function extractMonsterAbilities(record: any, language: Language): any[] {
  if (!record || !record.items) return [];
  
  const items = typeof record.items === 'string' ? JSON.parse(record.items) : record.items;
  if (!Array.isArray(items)) return [];
  
  return items.map(item => {
    const content = extractContent(item, language);
    return {
      ...item,
      description: content.description,
      publicNotes: content.publicNotes
    };
  });
}

// Helper for level display
export function formatLevel(level: number | null, language: Language): string {
  if (level === null || level === undefined) return '';
  return language === 'fr' ? `Niveau ${level}` : `Level ${level}`;
}

// Helper for results count
export function formatResultsCount(count: number, language: Language): string {
  if (count === 0) return '';
  
  const resultWord = count === 1 ? t('result', language) : t('results', language);
  const foundWord = count === 1 ? t('found', language) : t('foundPlural', language);
  
  return `${count} ${resultWord} ${foundWord}`;
}