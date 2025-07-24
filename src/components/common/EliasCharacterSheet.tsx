import React from 'react';
import type { Character, PF2eItem } from '../../types';
import { InteractiveTooltip } from './InteractiveTooltip';
import './EliasCharacterSheet.css';

interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

interface CharacterData {
  name: string;
  ancestry: string;
  background: string;
  class: string;
  level: number;
  speed: string;
  size: string;
  languages: string[];
  abilityScores: AbilityScores;
  ac: number;
  saves: {
    fortitude: number;
    reflex: number;
    will: number;
  };
  perception: number;
  classDC: number;
  skills: Array<{
    name: string;
    proficiency: string;
  }>;
  hp?: { value: number; max: number };
  actions?: PF2eItem[];
  feats?: PF2eItem[];
  spells?: PF2eItem[];
  equipment?: PF2eItem[];
}

interface EliasCharacterSheetProps {
  character?: CharacterData | Character;
  onReset?: () => void;
}

const defaultCharacter: CharacterData = {
  name: "Elias",
  ancestry: "Goblin (Unbreakable)",
  background: "Scout",
  class: "Druid",
  level: 7,
  speed: "25 ft",
  size: "Small",
  languages: ["Common", "Goblin"],
  abilityScores: {
    str: 16,
    dex: 14,
    con: 14,
    int: 12,
    wis: 18,
    cha: 12
  },
  ac: 23,
  saves: {
    fortitude: 11,
    reflex: 11,
    will: 11
  },
  perception: 11,
  classDC: 11,
  skills: [
    { name: "Acrobatics", proficiency: "Trained" },
    { name: "Arcana", proficiency: "Trained" },
    { name: "Athletics", proficiency: "Trained" },
    { name: "Crafting", proficiency: "Trained" },
    { name: "Nature", proficiency: "Expert" },
    { name: "Survival", proficiency: "Master" },
    { name: "Thievery", proficiency: "Trained" }
  ]
};

const EliasCharacterSheet: React.FC<EliasCharacterSheetProps> = ({ 
  character = defaultCharacter,
  onReset 
}) => {
  // Convert Character type to CharacterData format
  const normalizedCharacter: CharacterData = 'system' in character ? {
    name: character.name,
    ancestry: character.system.details.ancestry.name,
    background: character.system.details.background.name,
    class: character.system.details.class.name,
    level: character.system.details.level.value,
    speed: "25 ft", // Default, could be extracted from system data
    size: "Medium", // Default, could be extracted from system data
    languages: ["Common"], // Default, could be extracted from system data
    abilityScores: {
      str: 16, dex: 14, con: 14, int: 12, wis: 18, cha: 12 // Defaults
    },
    ac: character.system.attributes.ac.value,
    saves: { fortitude: 11, reflex: 11, will: 11 }, // Defaults
    perception: 11, // Default
    classDC: 11, // Default
    skills: [
      { name: "Acrobatics", proficiency: "Trained" }
    ], // Default
    hp: character.system.attributes.hp,
    actions: character.actions,
    feats: character.feats,
    spells: character.spells,
    equipment: character.equipment
  } : character as CharacterData;

  return (
    <div className="sheet-container">
      <div className="sheet">
        {onReset && (
          <div className="character-header">
            <button className="reset-button" onClick={onReset}>
              Upload Different Character
            </button>
          </div>
        )}
        <h1>{normalizedCharacter.name}</h1>
        
        <div className="flex">
          <div className="column box">
            <div className="label">Ancestry</div>
            {normalizedCharacter.ancestry}
          </div>
          <div className="column box">
            <div className="label">Background</div>
            {normalizedCharacter.background}
          </div>
          <div className="column box">
            <div className="label">Class</div>
            {normalizedCharacter.class} (Level {normalizedCharacter.level})
          </div>
        </div>

        <div className="flex">
          <div className="column box">
            <div className="label">Speed</div>
            {normalizedCharacter.speed}
          </div>
          <div className="column box">
            <div className="label">Size</div>
            {normalizedCharacter.size}
          </div>
          {normalizedCharacter.hp && (
            <div className="column box">
              <div className="label">HP</div>
              {normalizedCharacter.hp.value}/{normalizedCharacter.hp.max}
            </div>
          )}
        </div>

        <div className="section">
          <div className="box">
            <div className="label">Languages</div>
            {normalizedCharacter.languages.join(", ")}
          </div>
        </div>

        <div className="section">
          <h2>Ability Scores</h2>
          <div className="stat-block">
            <div className="stat">
              <div className="label">STR</div>
              {normalizedCharacter.abilityScores.str}
            </div>
            <div className="stat">
              <div className="label">DEX</div>
              {normalizedCharacter.abilityScores.dex}
            </div>
            <div className="stat">
              <div className="label">CON</div>
              {normalizedCharacter.abilityScores.con}
            </div>
            <div className="stat">
              <div className="label">INT</div>
              {normalizedCharacter.abilityScores.int}
            </div>
            <div className="stat">
              <div className="label">WIS</div>
              {normalizedCharacter.abilityScores.wis}
            </div>
            <div className="stat">
              <div className="label">CHA</div>
              {normalizedCharacter.abilityScores.cha}
            </div>
          </div>
        </div>

        <div className="section">
          <h2>Defenses & Stats</h2>
          <div className="flex">
            <div className="column box">
              <div className="label">AC</div> 
              {normalizedCharacter.ac}
            </div>
            <div className="column box">
              <div className="label">Saves</div>
              Fortitude +{normalizedCharacter.saves.fortitude} | Reflex +{normalizedCharacter.saves.reflex} | Will +{normalizedCharacter.saves.will}
            </div>
            <div className="column box">
              <div className="label">Perception</div> 
              +{normalizedCharacter.perception} (Expert)
            </div>
            <div className="column box">
              <div className="label">Class DC</div> 
              +{normalizedCharacter.classDC} (Expert)
            </div>
          </div>
        </div>

        <div className="section">
          <h2>Skills</h2>
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Proficiency</th>
              </tr>
            </thead>
            <tbody>
              {normalizedCharacter.skills.map((skill, index) => (
                <tr key={index}>
                  <td>{skill.name}</td>
                  <td>{skill.proficiency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic content sections */}
        {normalizedCharacter.actions && normalizedCharacter.actions.length > 0 && (
          <div className="section">
            <h2>Actions</h2>
            <div className="items-grid">
              {normalizedCharacter.actions.map((action) => (
                <InteractiveTooltip
                  key={action._id}
                  item={action}
                  trigger="click"
                >
                  <div className="character-item action-item box">
                    <span className="item-name">{action.name}</span>
                  </div>
                </InteractiveTooltip>
              ))}
            </div>
          </div>
        )}

        {normalizedCharacter.feats && normalizedCharacter.feats.length > 0 && (
          <div className="section">
            <h2>Feats</h2>
            <div className="items-grid">
              {normalizedCharacter.feats.map((feat) => (
                <InteractiveTooltip
                  key={feat._id}
                  item={feat}
                  trigger="click"
                >
                  <div className="character-item feat-item box">
                    <span className="item-name">{feat.name}</span>
                  </div>
                </InteractiveTooltip>
              ))}
            </div>
          </div>
        )}

        {normalizedCharacter.spells && (
          normalizedCharacter.spells.length > 0 ? (
          <div className="section">
            <h2>Spells ({normalizedCharacter.spells.length})</h2>
            <div className="spells-container">
              {(() => {
                // Group spells by level
                const spellsByLevel = normalizedCharacter.spells.reduce((acc, spell) => {
                  const level = spell.system?.level?.value || 0;
                  if (!acc[level]) acc[level] = [];
                  acc[level].push(spell);
                  return acc;
                }, {} as Record<number, typeof normalizedCharacter.spells>);

                const sortedLevels = Object.keys(spellsByLevel).map(Number).sort((a, b) => a - b);

                return sortedLevels.map(level => (
                  <div key={level} className="spell-level-group">
                    <h3 className="spell-level-header">
                      {level === 0 ? 'Cantrips' : `Level ${level} Spells`}
                    </h3>
                    <div className="items-grid">
                      {spellsByLevel[level].map((spell) => (
                        <InteractiveTooltip
                          key={spell._id}
                          item={spell}
                          trigger="click"
                        >
                          <div className="character-item spell-item box">
                            <span className="item-name">{spell.name}</span>
                            {level > 0 && (
                              <span className="spell-level-badge">Level {level}</span>
                            )}
                          </div>
                        </InteractiveTooltip>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          ) : (
            <div className="section">
              <h2>Spells</h2>
              <div className="empty-spells-message">
                <p>No spells detected in character data.</p>
                <p className="debug-hint">If this character should have spells, check the console for debug information about the uploaded data structure.</p>
              </div>
            </div>
          )
        )}

        {normalizedCharacter.equipment && normalizedCharacter.equipment.length > 0 && (
          <div className="section">
            <h2>Equipment</h2>
            <div className="items-grid">
              {normalizedCharacter.equipment.map((item) => (
                <InteractiveTooltip
                  key={item._id}
                  item={item}
                  trigger="click"
                >
                  <div className="character-item equipment-item box">
                    <span className="item-name">{item.name}</span>
                  </div>
                </InteractiveTooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EliasCharacterSheet;