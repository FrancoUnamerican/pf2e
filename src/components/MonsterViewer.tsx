import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HoverOverlay } from './HoverOverlay';
import { databaseService } from '../services/database';

interface Monster {
  _id: string;
  name: string;
  system: any;
  publicnotes_fr?: string;
}

export const MonsterViewer: React.FC = () => {
  const { language } = useLanguage();
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMonsters = async () => {
      try {
        await databaseService.initialize();
        const data = await databaseService.getMonsters(20);
        setMonsters(data);
      } catch (err) {
        setError('Failed to load monsters');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMonsters();
  }, []);

  const getDescription = (monster: Monster): string => {
    if (language === 'fr' && monster.publicnotes_fr) {
      return monster.publicnotes_fr;
    }
    return monster.system?.details?.publicNotes || 'No description available';
  };

  if (loading) return <div>Loading monsters...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="monster-viewer">
      <h2>Monsters</h2>
      <div className="monster-list">
        {monsters.map(monster => (
          <div key={monster._id} className="monster-card">
            <h3>{monster.name}</h3>
            <HoverOverlay 
              englishText={monster.system?.details?.publicNotes || 'No description available'}
              frenchText={monster.publicnotes_fr}
              className="description"
            >
              <p className="description">{getDescription(monster)}</p>
            </HoverOverlay>
            <div className="monster-stats">
              Level: {monster.system?.details?.level?.value || 'Unknown'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};