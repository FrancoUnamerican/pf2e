export const mockMonsters = [
  {
    _id: "monster1",
    name: "Goblin Warrior",
    system: {
      details: {
        level: { value: 1 },
        publicNotes: "A fierce warrior from the goblin tribes, known for their agility and cunning in battle."
      }
    },
    publicnotes_fr: "Un guerrier féroce des tribus gobelines, connu pour son agilité et sa ruse au combat."
  },
  {
    _id: "monster2", 
    name: "Ancient Red Dragon",
    system: {
      details: {
        level: { value: 19 },
        publicNotes: "This massive dragon's scales gleam like molten metal, and its eyes burn with ancient malice."
      }
    },
    publicnotes_fr: "Les écailles de ce dragon massif brillent comme du métal en fusion, et ses yeux brûlent d'une malice ancienne."
  },
  {
    _id: "monster3",
    name: "Orc Brute", 
    system: {
      details: {
        level: { value: 3 },
        publicNotes: "A brutish orc warrior wielding a massive club, lacking finesse but making up for it with raw strength."
      }
    },
    publicnotes_fr: "Un guerrier orque brutal maniant une massue énorme, manquant de finesse mais compensant par sa force brute."
  }
];

export const mockSpells = [
  {
    _id: "spell1",
    name: "Magic Missile",
    system: {
      description: { value: "You send a dart of force that unerringly strikes your target." },
      level: { value: 1 },
      traits: { traditions: ["arcane", "occult"] }
    },
    description_fr: "Vous envoyez un projectile de force qui frappe infailliblement votre cible."
  }
];