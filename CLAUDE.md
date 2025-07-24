# PF2e Assistant Frontend

## Project Overview
A React + TypeScript + Electron application for Pathfinder 2e with bilingual (English/French) support. Features a medieval parchment theme with golden borders and Garamond fonts throughout the entire application.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Desktop**: Electron 37
- **Database**: SQLite (sqlite3) - *migrated from better-sqlite3 for Windows compatibility*
- **Styling**: CSS modules with global parchment theme, responsive design system
- **Build**: Vite + Electron Builder

## Development Commands
```bash
# Install dependencies
npm install

# Start development server (React only)
npm run dev

# Start Electron in development mode
npm run electron-dev

# Build for production
npm run build

# Build and package Electron app
npm run build-electron

# Lint code
npm run lint
```

## Project Structure
- `src/components/` - React components
  - `common/` - Shared components (InteractiveTooltip, EliasCharacterSheet)
  - `gm/` - GM-specific tools
  - `player/` - Player-specific tools
- `src/pages/` - Main page components
- `src/services/` - Data services (database access)
- `src/types/` - TypeScript definitions
- `public/` - Static assets and Electron main process files

## UI Theme
### Parchment Design System
- **Global Background**: `#fefbf3` (warm parchment tone)
- **Font Family**: Garamond, Times New Roman, serif
- **Primary Colors**: Golden borders (`#c4a25a`), dark brown text (`#2a1c0f`)
- **Applied globally** to all components: headers, navigation, forms, inputs, and content areas

## Components
### EliasCharacterSheet (Universal Character Sheet)
- **Location**: `src/components/common/EliasCharacterSheet.tsx`
- **Purpose**: Primary character sheet component with parchment styling for both static and dynamic character data
- **Features**: 
  - Parchment-styled design with golden borders and vintage aesthetic
  - Accepts both static CharacterData and dynamic Character types
  - Auto-normalizes Character type to display format
  - Interactive tooltips for actions, feats, spells, and equipment
  - **Enhanced Spell Display**: Organized by spell levels with proper grouping and badges
  - Optional reset button for character uploads
  - Responsive grid layout for character items
  - **Advanced Pathbuilder Support**: Handles multiple spell data formats and structures
- **Usage**: 
  - Static Elias display: Player Page → "Elias Character Sheet" tab
  - Dynamic character uploads: Player Page → "Character Reference" tab
  - Replaces the old CharacterSheet component completely

### Monster Management with Persistent Statblock Display
- **Location**: `src/components/gm/MonsterManagement.tsx`
- **Purpose**: Browse monsters with comprehensive statblock viewing in persistent right panel
- **Features**:
  - **Persistent Statblock Panel**: Always-visible right panel (1/3 width) showing selected monster
  - **Two-Panel Layout**: Monster list (2/3 width) + statblock panel (1/3 width)
  - **Complete Monster Statistics**: Ability scores, AC, HP, saves, and defenses  
  - **Comprehensive Display**: Skills, senses, languages, movement speeds, immunities, resistances, weaknesses
  - **Parchment Theme Integration**: Consistent styling with golden borders and vintage aesthetic
  - **Source Filtering**: Core, Pathfinder Society, Lost Omens, Adventure Paths, etc.
  - **View Modes**: Gallery and list view for monster browsing
  - **Encounter Building**: Add monsters to current encounter with tracking
  - **Responsive Design**: Collapses to single column on mobile/tablet

### Interactive Tooltips & Overlays
- **Location**: `src/components/common/InteractiveTooltip.tsx`, `src/components/HoverOverlay.tsx`
- **Purpose**: Context-sensitive information display with smart positioning
- **Features**:
  - **Viewport-Aware Positioning**: Never appears outside screen boundaries
  - **Multi-Position Fallback**: Right → Left → Optimal viewport fit
  - **Responsive Design**: Mobile-optimized sizing and touch-friendly
  - **Dynamic Repositioning**: Adjusts on window resize
  - **Z-Index Management**: Proper layering hierarchy
  - **Performance Optimized**: Efficient event handling with cleanup

### Campaign Management System
- **Location**: `src/components/gm/CampaignTools.tsx`
- **Purpose**: Comprehensive campaign and wealth tracking with official Pathfinder tables
- **Features**:
  - **Campaign Creation & Management**: Local storage persistence
  - **Pathbuilder JSON Import**: Character data integration
  - **Table 10-9 Wealth Tracking**: Party-level wealth monitoring
  - **Table 10-10 Individual Wealth**: Character-specific wealth assessment
  - **Character Replacement Packages**: Complete wealth generation for new characters
  - **Loot Distribution Tools**: Even distribution and manual assignment

### Responsive Design System
- **CSS Custom Properties**: Consistent spacing and sizing variables
- **Clamp-Based Scaling**: Fluid typography and spacing using `clamp()`
- **Comprehensive Breakpoints**: 
  - Desktop: 1200px+
  - Tablet Landscape: 1024px
  - Tablet Portrait: 768px
  - Mobile Landscape: 640px
  - Mobile Portrait: 480px
  - Small Mobile: 360px
- **Utility Classes**: `.responsive-grid`, `.responsive-flex`, `.responsive-padding`

## Database
- `public/pf2e_clean_data.sqlite` - Main Pathfinder 2e data with French translations
- Contains spells, feats, equipment, monsters, etc.
- **Language-Neutral Queries**: Fixed to show all content regardless of translation availability
- **Async Database Layer**: Complete migration from synchronous to asynchronous operations
- Used via Electron IPC for database queries

## Development Workflow
### Automated Daily Setup
- **IMPORTANT**: This project uses **automated daily folder management**
- Each day's work is stored in a new folder named with format: `MM-DD-YYYY` (e.g., `07-23-2025`)
- **Only the last 3 dated folders are kept** automatically
- **Start of session**: Run `../daily-setup.sh` from project root to create today's folder and copy files
- **End of session**: Run `./end-session.sh` from current day's folder to sync to Windows

### Session Scripts
1. **daily-setup.sh** (in project root):
   - Creates today's folder automatically
   - Copies all essential files from previous day
   - Cleans up old folders (keeps 3 most recent)
   - Sets up proper permissions

2. **end-session.sh** (in current day's folder):
   - Syncs current work to Windows
   - Provides session summary
   - Shows file changes and status

### Current Active Folder
- **Today's folder**: `07-23-2025/`
- **Working directory**: Always `cd` into the current day's folder before running npm commands
- **Database location**: `public/pf2e_clean_data.sqlite` (within current day's folder)

### Cross-Platform Testing
- **WSL Development**: Primary development in WSL environment
- **Windows Sync**: Automatic sync to `C:\Users\pierr\Desktop\LPT-DSKT-SHARE\MM-DD-YYYY\`
- **File Management**: Automated cleanup maintains only the 3 most recent folders

## Known Issues
### Current Issues (Pending)
- **Character Sheet Data**: Missing data information in character sheets
- **EliasCharacterSheet**: Useless component that should be removed
- **Spell Display**: Spells showing code instead of readable text
- **Monster Actions**: Missing actions/special actions in monster statblock
- **Character Actions**: Missing actions in character sheet
- **Encounter Bug**: Encounter always shows only 1 monster
- **Loot System**: Loot doesn't follow encounter properly

### Resolved Issues
- ~~`better-sqlite3` native module compilation issues~~ → **Fixed**: Migrated to `sqlite3`
- ~~Python/node-gyp dependency conflicts~~ → **Fixed**: Using sqlite3 with better Windows compatibility
- ~~App starting in French~~ → **Fixed**: Database queries now language-neutral with English default
- ~~Overlays appearing outside viewport~~ → **Fixed**: Smart positioning with boundary detection
- ~~Monster Management database errors~~ → **Fixed**: Corrected SQL queries to match actual database schema
- ~~MonsterManagement JSX syntax errors~~ → **Fixed**: Resolved component structure and closing tag issues
- Permission issues with node_modules binaries in WSL environment (ongoing)

## Recent Updates

### Major Feature Enhancements (July 23, 2025)
- ✅ **Persistent Monster Statblock Panel**: Two-panel layout with always-visible statblock display (`src/components/gm/MonsterManagement.tsx:254-372`)
- ✅ **Database Schema Fix**: Corrected SQL queries to match actual database columns (`public/main.js:212,465,503`)
- ✅ **Language Fix**: App now properly starts in English, database queries language-neutral (`public/main.js:140,200,230,269,308,348`)
- ✅ **Responsive Design System**: Comprehensive auto-padding and mobile optimization (`src/components/Layout.css`, `src/App.css`)
- ✅ **Enhanced Spell Support**: Advanced Pathbuilder import with spell level organization (`src/components/player/CharacterReference.tsx:7-73`)
- ✅ **Smart Overlay Positioning**: Viewport-aware tooltips and overlays with boundary detection (`src/components/common/InteractiveTooltip.tsx:68-119`)

### Database Migration (July 23, 2025)
- ✅ **SQLite Package Migration**: Changed from `better-sqlite3` to `sqlite3` for Windows compatibility
- ✅ **Async Database Layer**: Complete rewrite from synchronous to asynchronous operations (`public/main.js`)
- ✅ **Language-Neutral Queries**: Removed French-only filters, show all content regardless of translation
- ✅ **Database Schema Alignment**: Fixed SQL queries to match actual database columns (removed non-existent `publicnotes`, `description`)
- ✅ **Database Initialization**: Fixed "Database not initialized" error in RulesCompendium search
- ✅ **Path Resolution**: Improved database path detection with proper error handling

### UI/UX Improvements (July 2025)
- ✅ **Global Parchment Theme**: Applied Elias character sheet styling throughout entire application
- ✅ **Enhanced Search Fields**: Fixed visibility issues with dark-on-dark text
- ✅ **Consistent Input Styling**: All form inputs now use parchment theme with proper contrast
- ✅ **Z-Index Hierarchy**: Proper layering system with CSS custom properties
- ✅ **Mobile Optimization**: Progressive scaling and touch-friendly interfaces
- ✅ **Performance Optimization**: Efficient event handling with proper cleanup

● Update Todos
  ⎿  ☒ Check charactersheet html.txt for reference
     ☒ Fix spell overlay: French text and missing information display
     ☒ Add links/data to Special Abilities (e.g., Storm Order)
     ☒ Fix feat overlay: missing information display
     ☒ Add equipment overlay with item data, move attacks higher in sheet
     ☒ Fix Rules Compendium overlay size for full text readability
     ☒ Auto-load data when filters selected in Rules Compendium
     ☐ Fix Spells tab: tradition filter not loading spells
     ☐ Remove remaining @UUID displays in overlays, link to correct data
     ☐ Fix Spells tab: level filter not loading spells
     ☐ Fix Spells tab: combined tradition+level filters not working
     ☐ Fix Equipment quick view: remove HTML tags and italics
     ☐ Fix Equipment overlay: remove @UUID references
     ☐ Add Rules mechanics to rules filter display
     ☐ Add focus spells section to Spells tab

## Archive
Non-essential files moved to `../archive/`:
- Build outputs (`dist/`, `electron-dist/`)
- Sample data files
- Compressed backups