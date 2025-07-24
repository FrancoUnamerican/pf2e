const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

let mainWindow;
let db;
let uuidRedirects = {};

// Load UUID redirects
function loadUuidRedirects() {
  try {
    const redirectsPath = path.join(__dirname, '../uuid-redirects.json');
    if (fs.existsSync(redirectsPath)) {
      const data = fs.readFileSync(redirectsPath, 'utf8');
      uuidRedirects = JSON.parse(data);
      console.log('UUID redirects loaded:', Object.keys(uuidRedirects).length, 'entries');
    } else {
      console.warn('UUID redirects file not found at:', redirectsPath);
    }
  } catch (error) {
    console.error('Failed to load UUID redirects:', error);
  }
}

// Process text with @Check and @Damage tags, removing UUID redirects
function processGameText(text, language = 'en') {
  if (!text) return text;
  
  // Remove all @UUID references - replace with simple condition names
  text = text.replace(/@UUID\[([^\]]+)\]/g, (match, content) => {
    // Extract the item name from the UUID path
    const parts = content.split('.');
    const itemName = parts[parts.length - 1] || content;
    
    // Convert common condition/item names to readable text
    const conditionNames = {
      'Hidden': language === 'fr' ? 'Caché' : 'Hidden',
      'Observed': language === 'fr' ? 'Observé' : 'Observed', 
      'Concealed': language === 'fr' ? 'Masqué' : 'Concealed',
      'Prone': language === 'fr' ? 'À terre' : 'Prone',
      'Frightened': language === 'fr' ? 'Effrayé' : 'Frightened',
      'Stunned': language === 'fr' ? 'Étourdi' : 'Stunned',
      'Unconscious': language === 'fr' ? 'Inconscient' : 'Unconscious',
      'Dying': language === 'fr' ? 'Mourant' : 'Dying',
      'Dead': language === 'fr' ? 'Mort' : 'Dead',
      'Wounded': language === 'fr' ? 'Blessé' : 'Wounded'
    };
    
    return conditionNames[itemName] || itemName;
  });
  
  // Handle @Check tags
  text = text.replace(/@Check\[([^\]]+)\]/g, (match, content) => {
    const parts = content.split('|');
    if (parts.length >= 2) {
      const dcPart = parts[1];
      
      // Extract DC value
      const dcMatch = dcPart.match(/dc:(\d+)/);
      const dc = dcMatch ? dcMatch[1] : '15';
      
      // Return formatted check with language-appropriate label
      const checkLabel = language === 'fr' ? `Jet DD ${dc}` : `DC ${dc} Check`;
      return `<strong>${checkLabel}</strong>`;
    }
    return match;
  });
  
  // Handle @Damage tags
  text = text.replace(/@Damage\[([^\]]+)\]/g, (match, content) => {
    const parts = content.split('|');
    if (parts.length >= 1) {
      const damagePart = parts[0];
      const options = parts[1] || '';
      
      // Extract damage formula and type
      const damageMatch = damagePart.match(/^([^[]+)\[([^\]]+)\]$/);
      if (damageMatch) {
        const formula = damageMatch[1];
        const damageType = damageMatch[2];
        
        // Return formatted damage with language-appropriate label
        const damageLabel = language === 'fr' ? 'dégâts' : 'damage';
        return `<strong>${formula} ${damageType} ${damageLabel}</strong>`;
      }
    }
    return match;
  });
  
  // Handle [[/act action]] tags (remove roll formatting)
  text = text.replace(/\[\[\/act ([^\]]+)\]\]\s*\{([^}]+)\}/g, (match, action, skill) => {
    return `<strong>${skill}</strong>`;
  });
  
  // Fix French translation issues
  if (language === 'fr') {
    text = text.replace(/\bcanard\b/gi, 'se baisser');
    text = text.replace(/\bl'orthographe\b/gi, 'le sort');
    text = text.replace(/\bchèque\b/gi, 'check');
  }
  
  return text;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    try {
      let dbPath;
      
      if (app.isPackaged) {
        // Production: database in resources
        dbPath = path.join(process.resourcesPath, 'pf2e_clean_data.sqlite');
      } else {
        // Development: database in public folder
        console.log('__dirname:', __dirname);
        console.log('process.cwd():', process.cwd());
        
        dbPath = path.join(__dirname, 'pf2e_clean_data.sqlite');
        console.log('Trying primary path:', dbPath);
        
        // Fallback: try relative to current working directory
        if (!require('fs').existsSync(dbPath)) {
          dbPath = path.join(process.cwd(), 'public', 'pf2e_clean_data.sqlite');
          console.log('Trying fallback path:', dbPath);
        }
        
        // Final fallback: try moving up one directory from frontend
        if (!require('fs').existsSync(dbPath)) {
          dbPath = path.join(path.dirname(process.cwd()), 'pf2e-claude-project', 'frontend', 'public', 'pf2e_clean_data.sqlite');
          console.log('Trying final fallback path:', dbPath);
        }
      }
      
      console.log('Loading database from:', dbPath);
      console.log('Database exists:', require('fs').existsSync(dbPath));
      
      if (!require('fs').existsSync(dbPath)) {
        console.error(`Database file not found at: ${dbPath}`);
        console.error('Available files in directory:', require('fs').readdirSync(path.dirname(dbPath)));
        db = null;
        reject(new Error('Database file not found'));
        return;
      }
      
      db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          console.error('Failed to load database:', err);
          db = null;
          reject(err);
          return;
        }
        
        console.log('Database loaded successfully from:', dbPath);
        
        // Test the database
        db.get("SELECT COUNT(*) as count FROM spell", (err, result) => {
          if (err) {
            console.error('Database test failed:', err);
            reject(err);
            return;
          }
          console.log('Database test - spell count:', result.count);
          resolve();
        });
      });
      
    } catch (error) {
      console.error('Failed to initialize database:', error);
      console.error('Stack:', error.stack);
      db = null;
      reject(error);
    }
  });
}

app.whenReady().then(async () => {
  try {
    await initDatabase();
    loadUuidRedirects();
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        }
      });
    }
    app.quit();
  }
});

// IPC handlers for database queries
ipcMain.handle('db:getMonsters', (event, limit = 50, filters = {}) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('Database not initialized for getMonsters');
      reject(new Error('Database not initialized'));
      return;
    }
    
    let query = `
      SELECT _id, name, system, publicnotes_fr, description_fr
      FROM npc 
      WHERE 1=1
    `;
    const params = [];
    
    // Add source filtering
    if (filters.source && filters.source !== 'all') {
      const sourceConditions = getSourceConditions(filters.source);
      if (sourceConditions.length > 0) {
        query += ` AND (${sourceConditions.map(() => 'json_extract(system, "$.details.publication.title") LIKE ?').join(' OR ')})`;
        params.push(...sourceConditions);
      }
    }
    
    // Add level filtering
    if (filters.level && filters.level.length > 0) {
      query += ` AND (${filters.level.map(() => 'json_extract(system, "$.details.level.value") = ?').join(' OR ')})`;
      filters.level.forEach(level => {
        params.push(level);
      });
    }
    
    query += ' ORDER BY name LIMIT ?';
    params.push(limit);
    
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const results = rows.map(row => ({
        ...row,
        system: JSON.parse(row.system)
      }));
      resolve(results);
    });
  });
});

function getSourceConditions(sourceFilter) {
  switch (sourceFilter) {
    case 'monster-core':
      return ['%Monster Core%'];
    case 'core':
      return ['%Bestiary%', '%Player Core%', '%Monster Core%', '%NPC Core%', '%Gamemastery Guide%'];
    case 'pathfinder-society':
      return ['%Pathfinder Society%'];
    case 'lost-omens':
      return ['%Lost Omens%'];
    case 'adventure-path':
      return ['%Pathfinder #%'];
    case 'adventures':
      return ['%Pathfinder Adventure:%'];
    case 'bounties-quests':
      return ['%Bounty%', '%Quest%'];
    default:
      return [];
  }
}

ipcMain.handle('db:searchSpells', (event, query) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const sql = `
      SELECT _id, name, system, description, description_fr 
      FROM spell 
      WHERE name LIKE ?
      ORDER BY name 
      LIMIT 20
    `;
    
    db.all(sql, [`%${query}%`], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const results = rows.map(row => ({
        ...row,
        system: JSON.parse(row.system)
      }));
      resolve(results);
    });
  });
});

ipcMain.handle('db:getSpells', (event, limit = 50, filters = {}) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    let query = `
      SELECT _id, name, system, description_fr 
      FROM spell 
      WHERE 1=1
    `;
    const params = [];

    if (filters.traditions && filters.traditions.length > 0) {
      query += ` AND (${filters.traditions.map(() => 'system LIKE ?').join(' OR ')})`;
      filters.traditions.forEach(tradition => {
        params.push(`%"traditions":{"value":[%"${tradition}"%`);
      });
    }
    
    // Filter by spell level
    if (filters.level && filters.level.length > 0) {
      query += ` AND (${filters.level.map(() => 'system LIKE ?').join(' OR ')})`;
      filters.level.forEach(level => {
        params.push(`%"level":{"value":${level}%`);
      });
    }
    
    // Filter by school
    if (filters.school && filters.school.length > 0) {
      query += ` AND (${filters.school.map(() => 'system LIKE ?').join(' OR ')})`;
      filters.school.forEach(school => {
        params.push(`%"school":{"value":"${school}"%`);
      });
    }
    
    // Filter by traits
    if (filters.traits && filters.traits.length > 0) {
      query += ` AND (${filters.traits.map(() => 'system LIKE ?').join(' OR ')})`;
      filters.traits.forEach(trait => {
        params.push(`%"traits":{"value":[%"${trait}"%`);
      });
    }

    query += ' ORDER BY name LIMIT ?';
    params.push(limit);
    
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const results = rows.map(row => ({
        ...row,
        system: JSON.parse(row.system)
      }));
      resolve(results);
    });
  });
});

ipcMain.handle('db:getFeats', (event, limit = 50, filters = {}) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    let query = `
      SELECT _id, name, system, description, description_fr 
      FROM feat 
      WHERE 1=1
    `;
    const params = [];

    if (filters.level && filters.level.length > 0) {
      query += ` AND (${filters.level.map(() => 'system LIKE ?').join(' OR ')})`;
      filters.level.forEach(level => {
        params.push(`%"level":{"value":${level}%`);
      });
    }

    query += ' ORDER BY name LIMIT ?';
    params.push(limit);
    
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const results = rows.map(row => ({
        ...row,
        system: JSON.parse(row.system)
      }));
      resolve(results);
    });
  });
});

ipcMain.handle('db:getActions', (event, limit = 50) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const query = `
      SELECT _id, name, system, description, description_fr 
      FROM action 
      WHERE 1=1
      ORDER BY name 
      LIMIT ?
    `;
    
    db.all(query, [limit], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const results = rows.map(row => ({
        ...row,
        system: JSON.parse(row.system)
      }));
      resolve(results);
    });
  });
});

ipcMain.handle('db:getEquipment', (event, limit = 50, filters = {}) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const tables = filters.type || ['equipment', 'weapon', 'armor', 'consumable'];
    const results = [];
    let completedTables = 0;

    if (tables.length === 0) {
      resolve([]);
      return;
    }

    tables.forEach(table => {
      const query = `
        SELECT _id, name, system, description_fr, '${table}' as table_type
        FROM ${table} 
        WHERE 1=1
        ORDER BY name 
        LIMIT ?
      `;
      
      db.all(query, [Math.floor(limit / tables.length)], (err, rows) => {
        if (err) {
          console.warn(`Table ${table} not found or error:`, err.message);
        } else {
          const tableResults = rows.map(row => ({
            ...row,
            system: JSON.parse(row.system)
          }));
          results.push(...tableResults);
        }
        
        completedTables++;
        if (completedTables === tables.length) {
          const sortedResults = results.sort((a, b) => a.name.localeCompare(b.name)).slice(0, limit);
          resolve(sortedResults);
        }
      });
    });
  });
});

ipcMain.handle('db:searchAll', (event, query, tables = ['spell', 'feat', 'action', 'hazard', 'equipment', 'weapon', 'armor', 'consumable', 'npc']) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const results = [];
    let completedTables = 0;
    
    if (tables.length === 0) {
      resolve([]);
      return;
    }
    
    tables.forEach(table => {
      let sql, params;
      
      if (query === '*') {
        // Return all items when query is '*' (for filter-only searches)
        sql = `
          SELECT _id, name, system, description_fr, '${table}' as table_type
          FROM ${table} 
          ORDER BY name 
          LIMIT 50
        `;
        params = [];
      } else {
        // Normal search
        sql = `
          SELECT _id, name, system, description_fr, '${table}' as table_type
          FROM ${table} 
          WHERE (name LIKE ? OR description_fr LIKE ?)
          ORDER BY name 
          LIMIT 10
        `;
        const searchTerm = `%${query}%`;
        params = [searchTerm, searchTerm];
      }
      
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.warn(`Search in table ${table} failed:`, err.message);
        } else {
          const tableResults = rows.map(row => ({
            ...row,
            system: JSON.parse(row.system)
          }));
          results.push(...tableResults);
        }
        
        completedTables++;
        if (completedTables === tables.length) {
          const sortedResults = results.sort((a, b) => a.name.localeCompare(b.name));
          resolve(sortedResults);
        }
      });
    });
  });
});

// Handle hazard queries
ipcMain.handle('db:getHazards', (event, limit = 50, filters = {}) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    let query = `
      SELECT _id, name, system, description_fr, 'hazard' as table_type
      FROM hazard 
      WHERE 1=1
    `;
    const params = [];

    // Filter by level
    if (filters.level && filters.level.length > 0) {
      query += ` AND (${filters.level.map(() => 'system LIKE ?').join(' OR ')})`;
      filters.level.forEach(level => {
        params.push(`%"level":{"value":${level}%`);
      });
    }
    
    // Filter by traits
    if (filters.traits && filters.traits.length > 0) {
      query += ` AND (${filters.traits.map(() => 'system LIKE ?').join(' OR ')})`;
      filters.traits.forEach(trait => {
        params.push(`%"traits":{"value":[%"${trait}"%`);
      });
    }
    
    // Filter by complexity (simple vs complex)
    if (filters.complexity !== undefined) {
      query += ` AND system LIKE ?`;
      params.push(`%"isComplex":${filters.complexity}%`);
    }

    query += ' ORDER BY name LIMIT ?';
    params.push(limit);
    
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const results = rows.map(row => ({
        ...row,
        system: JSON.parse(row.system)
      }));
      resolve(results);
    });
  });
});

ipcMain.handle('db:getItemById', (event, id, table) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    const query = `
      SELECT _id, name, system, description_fr, publicnotes_fr 
      FROM ${table} 
      WHERE _id = ?
    `;
    
    db.get(query, [id], (err, result) => {
      if (err) {
        console.error(`Failed to get item ${id} from ${table}:`, err);
        resolve(null);
        return;
      }
      
      if (result) {
        resolve({
          ...result,
          system: JSON.parse(result.system)
        });
      } else {
        resolve(null);
      }
    });
  });
});

// IPC handler for processing game text with UUID redirection
ipcMain.handle('processGameText', (event, text, language = 'en') => {
  return processGameText(text, language);
});