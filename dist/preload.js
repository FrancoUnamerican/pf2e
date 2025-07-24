const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getMonsters: (limit) => ipcRenderer.invoke('db:getMonsters', limit),
  searchSpells: (query) => ipcRenderer.invoke('db:searchSpells', query),
  getSpells: (limit, filters) => ipcRenderer.invoke('db:getSpells', limit, filters),
  getFeats: (limit, filters) => ipcRenderer.invoke('db:getFeats', limit, filters),
  getActions: (limit) => ipcRenderer.invoke('db:getActions', limit),
  getEquipment: (limit, filters) => ipcRenderer.invoke('db:getEquipment', limit, filters),
  getHazards: (limit, filters) => ipcRenderer.invoke('db:getHazards', limit, filters),
  searchAll: (query, tables) => ipcRenderer.invoke('db:searchAll', query, tables),
  getItemById: (id, table) => ipcRenderer.invoke('db:getItemById', id, table),
  processGameText: (text, language) => ipcRenderer.invoke('processGameText', text, language)
});