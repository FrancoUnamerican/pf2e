import React from 'react';
import type { Character } from '../../types';
import { InteractiveTooltip } from '../common/InteractiveTooltip';
import './CharacterSheet.css';

interface CharacterSheetProps {
  character: Character;
  onReset: () => void;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ character, onReset }) => {
  return (
    <div className="character-sheet">
      <div className="character-header">
        <h2 className="character-name">{character.name}</h2>
        <button className="reset-button" onClick={onReset}>
          Upload Different Character
        </button>
      </div>

      <div className="character-summary">
        <div className="summary-item">
          <label>Level</label>
          <span>{character.system.details.level.value}</span>
        </div>
        <div className="summary-item">
          <label>Ancestry</label>
          <span>{character.system.details.ancestry.name}</span>
        </div>
        <div className="summary-item">
          <label>Heritage</label>
          <span>{character.system.details.heritage.name}</span>
        </div>
        <div className="summary-item">
          <label>Class</label>
          <span>{character.system.details.class.name}</span>
        </div>
        <div className="summary-item">
          <label>Background</label>
          <span>{character.system.details.background.name}</span>
        </div>
        <div className="summary-item">
          <label>HP</label>
          <span>{character.system.attributes.hp.value}/{character.system.attributes.hp.max}</span>
        </div>
        <div className="summary-item">
          <label>AC</label>
          <span>{character.system.attributes.ac.value}</span>
        </div>
      </div>

      <div className="character-sections">
        {character.actions.length > 0 && (
          <div className="character-section">
            <h3>Actions</h3>
            <div className="items-grid">
              {character.actions.map((action) => (
                <InteractiveTooltip
                  key={action._id}
                  item={action}
                  trigger="click"
                >
                  <div className="character-item action-item">
                    <span className="item-name">{action.name}</span>
                  </div>
                </InteractiveTooltip>
              ))}
            </div>
          </div>
        )}

        {character.feats.length > 0 && (
          <div className="character-section">
            <h3>Feats</h3>
            <div className="items-grid">
              {character.feats.map((feat) => (
                <InteractiveTooltip
                  key={feat._id}
                  item={feat}
                  trigger="click"
                >
                  <div className="character-item feat-item">
                    <span className="item-name">{feat.name}</span>
                  </div>
                </InteractiveTooltip>
              ))}
            </div>
          </div>
        )}

        {character.spells.length > 0 && (
          <div className="character-section">
            <h3>Spells</h3>
            <div className="items-grid">
              {character.spells.map((spell) => (
                <InteractiveTooltip
                  key={spell._id}
                  item={spell}
                  trigger="click"
                >
                  <div className="character-item spell-item">
                    <span className="item-name">{spell.name}</span>
                  </div>
                </InteractiveTooltip>
              ))}
            </div>
          </div>
        )}

        {character.equipment.length > 0 && (
          <div className="character-section">
            <h3>Equipment</h3>
            <div className="items-grid">
              {character.equipment.map((item) => (
                <InteractiveTooltip
                  key={item._id}
                  item={item}
                  trigger="click"
                >
                  <div className="character-item equipment-item">
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