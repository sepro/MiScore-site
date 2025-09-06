import { writable, derived } from 'svelte/store';

console.log('stores.js: Initializing stores');

export const gameRecords = writable([]);
export const isLoading = writable(true);
export const basePath = writable(import.meta.env?.BASE_URL || "");
// Search query with localStorage persistence
function createPersistedSearchQuery() {
  const { subscribe, set, update } = writable('');
  
  return {
    subscribe,
    set: (value) => {
      if (typeof window !== 'undefined') {
        if (value && value.trim()) {
          localStorage.setItem('miscore_search_query', value);
        } else {
          localStorage.removeItem('miscore_search_query');
        }
      }
      set(value);
    },
    update,
    restore: () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('miscore_search_query');
        if (stored) {
          set(stored);
          return stored;
        }
      }
      return '';
    },
    clear: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('miscore_search_query');
      }
      set('');
    }
  };
}

export const searchQuery = createPersistedSearchQuery();

// Function to create URL-friendly slugs from game names
export function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Remove duplicate hyphens
    .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
}

// Search functionality
function matchesSearchQuery(text, query) {
  if (!query || !text) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}

function getSearchScore(game, query) {
  if (!query) return 0;
  
  const gameName = game.name || '';
  const gameDescription = game.description || '';
  
  let maxScore = 0;
  
  // Check game name matches
  if (gameName.toLowerCase() === query.toLowerCase()) maxScore = Math.max(maxScore, 100); // Exact match
  else if (gameName.toLowerCase().startsWith(query.toLowerCase())) maxScore = Math.max(maxScore, 90); // Starts with
  else if (matchesSearchQuery(gameName, query)) maxScore = Math.max(maxScore, 80); // Contains in name
  
  // Check record type matches
  if (game.record_types) {
    for (const recordType of game.record_types) {
      const typeName = recordType.name || '';
      const typeDescription = recordType.description || '';
      
      if (typeName.toLowerCase() === query.toLowerCase()) maxScore = Math.max(maxScore, 70);
      else if (typeName.toLowerCase().startsWith(query.toLowerCase())) maxScore = Math.max(maxScore, 60);
      else if (matchesSearchQuery(typeName, query)) maxScore = Math.max(maxScore, 50);
      else if (matchesSearchQuery(typeDescription, query)) maxScore = Math.max(maxScore, 40);
    }
  }
  
  // Check game description
  if (matchesSearchQuery(gameDescription, query)) maxScore = Math.max(maxScore, 30);
  
  return maxScore;
}

export const filteredRecords = derived(
  [gameRecords, searchQuery],
  ([games, query]) => {
    if (!query.trim()) {
      return games.map((game) => ({
        name: game.name,
        slug: game.slug,
        recordCount: game.record_types?.reduce((sum, type) => sum + (type.records?.length || 0), 0) || 0
      })).sort((a, b) => {
        const nameA = a.name.replace(/^The /i, '');
        const nameB = b.name.replace(/^The /i, '');
        return nameA.localeCompare(nameB);
      });
    }

    const matchedGames = games
      .map(game => ({
        ...game,
        searchScore: getSearchScore(game, query)
      }))
      .filter(game => game.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore)
      .map((game) => ({
        name: game.name,
        slug: game.slug,
        recordCount: game.record_types?.reduce((sum, type) => sum + (type.records?.length || 0), 0) || 0,
        searchScore: game.searchScore
      }));

    return matchedGames;
  }
);

// Get search suggestions
export const searchSuggestions = derived(
  [gameRecords, searchQuery],
  ([games, query]) => {
    if (!query.trim() || query.length < 2) return { games: [], recordTypes: [] };

    const suggestions = { games: [], recordTypes: [] };
    const recordTypeSet = new Set();

    games.forEach(game => {
      const score = getSearchScore(game, query);
      if (score > 0) {
        suggestions.games.push({
          name: game.name,
          slug: game.slug,
          score
        });
      }

      // Collect unique record types that match
      if (game.record_types) {
        game.record_types.forEach(recordType => {
          const typeName = recordType.name || '';
          const typeDescription = recordType.description || '';
          
          if (matchesSearchQuery(typeName, query) || matchesSearchQuery(typeDescription, query)) {
            recordTypeSet.add(typeName);
          }
        });
      }
    });

    suggestions.games = suggestions.games
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    suggestions.recordTypes = Array.from(recordTypeSet).slice(0, 3);

    return suggestions;
  }
);

// Recent records derived store - flattens and sorts all records by date
export const recentRecords = derived(
  gameRecords,
  (games) => {
    if (!games || !Array.isArray(games)) return [];
    
    const allRecords = [];
    
    games.forEach(game => {
      if (game.record_types && Array.isArray(game.record_types)) {
        game.record_types.forEach(recordType => {
          if (recordType.records && Array.isArray(recordType.records)) {
            recordType.records.forEach(record => {
              if (record.date) {
                allRecords.push({
                  ...record,
                  gameName: game.name,
                  gameSlug: game.slug,
                  recordTypeName: recordType.name,
                  recordTypeDescription: recordType.description,
                  recordTypeType: recordType.type
                });
              }
            });
          }
        });
      }
    });
    
    // Sort by date (newest first) and take top 10
    return allRecords
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }
);

console.log('stores.js: Stores initialized - gameRecords, isLoading, basePath, searchQuery, filteredRecords, searchSuggestions, and recentRecords');