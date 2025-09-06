<script>
  import { searchQuery, searchSuggestions, basePath, filteredRecords } from '../stores.js';
  import { navigate } from 'svelte-routing';
  import { onMount, onDestroy } from 'svelte';
  import HighlightText from './HighlightText.svelte';
  
  export let placeholder = "Search games and records...";
  
  let inputValue = '';
  let showSuggestions = false;
  let selectedSuggestionIndex = -1;
  let searchInputElement;
  let debounceTimer;
  
  let hasUserInteracted = false;
  
  // Restore search input value when component mounts (works for both back button and direct navigation)
  onMount(() => {
    const restored = searchQuery.restore();
    if (restored) {
      inputValue = restored;
      // Don't show suggestions until user interacts
      hasUserInteracted = false;
    }
  });
  
  // Debounced search update
  function updateSearch(value) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery.set(value);
    }, 300);
  }
  
  // Handle input changes from user typing
  function handleInput(event) {
    hasUserInteracted = true;
    inputValue = event.target.value;
  }
  
  $: {
    updateSearch(inputValue);
    // Only show suggestions if user has interacted and input is long enough
    if (inputValue.length >= 2 && hasUserInteracted) {
      showSuggestions = true;
      selectedSuggestionIndex = -1;
    } else {
      showSuggestions = false;
    }
  }
  
  // Calculate total suggestions for keyboard navigation
  $: totalSuggestions = $searchSuggestions.games.length + $searchSuggestions.recordTypes.length;
  
  function handleKeydown(event) {
    if (!showSuggestions || totalSuggestions === 0) {
      if (event.key === 'Escape') {
        clearSearch();
      }
      return;
    }
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, totalSuggestions - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(selectedSuggestionIndex);
        } else {
          handleEnterNavigation();
        }
        break;
      case 'Escape':
        event.preventDefault();
        showSuggestions = false;
        selectedSuggestionIndex = -1;
        clearSearch();
        break;
    }
  }
  
  function selectSuggestion(index) {
    const gameCount = $searchSuggestions.games.length;
    
    if (index < gameCount) {
      // Game suggestion selected - navigate directly to game
      const game = $searchSuggestions.games[index];
      inputValue = game.name;
      searchQuery.set(game.name);
      navigate(`${$basePath}/game/${game.slug}`);
    } else {
      // Record type suggestion selected - show filtered overview
      const recordType = $searchSuggestions.recordTypes[index - gameCount];
      inputValue = recordType;
      searchQuery.set(recordType);
      // Don't navigate, just show filtered results in table
    }
    
    showSuggestions = false;
    selectedSuggestionIndex = -1;
    searchInputElement?.blur();
  }
  
  function handleEnterNavigation() {
    if (!inputValue.trim()) return;
    
    // Hide suggestions dropdown regardless of result count
    showSuggestions = false;
    selectedSuggestionIndex = -1;
    searchInputElement?.blur();
    
    // Auto-navigate only when user presses Enter and there's exactly one result
    if ($filteredRecords.length === 1) {
      const singleResult = $filteredRecords[0];
      navigate(`${$basePath}/game/${singleResult.slug}`);
    }
    // For multiple results, just hide dropdown and show filtered table
  }
  
  function clearSearch() {
    inputValue = '';
    searchQuery.set('');
    showSuggestions = false;
    selectedSuggestionIndex = -1;
  }
  
  function handleClickOutside(event) {
    if (!event.target.closest('.search-container')) {
      showSuggestions = false;
      selectedSuggestionIndex = -1;
    }
  }
  
  onDestroy(() => {
    clearTimeout(debounceTimer);
  });
</script>

<svelte:document on:click={handleClickOutside} />

<div class="search-container">
  <div class="search-input-wrapper">
    <input
      bind:this={searchInputElement}
      bind:value={inputValue}
      on:keydown={handleKeydown}
      on:input={handleInput}
      on:focus={() => {
        hasUserInteracted = true;
        if (inputValue.length >= 2) {
          showSuggestions = true;
        }
      }}
      type="text"
      {placeholder}
      class="search-input"
      autocomplete="off"
    />
    
    <div class="search-icons">
      {#if inputValue}
        <button 
          class="clear-button" 
          on:click={clearSearch}
          aria-label="Clear search"
        >
          ×
        </button>
      {:else}
        <div class="search-icon">🔍</div>
      {/if}
    </div>
  </div>
  
  {#if showSuggestions && (inputValue.length >= 2)}
    <div class="suggestions-dropdown">
      {#if $searchSuggestions.games.length > 0}
        <div class="suggestion-category">
          <div class="category-header">Games ({$searchSuggestions.games.length})</div>
          {#each $searchSuggestions.games as game, index}
            <button
              class="suggestion-item game-suggestion {selectedSuggestionIndex === index ? 'selected' : ''}"
              on:click={() => selectSuggestion(index)}
            >
              <span class="suggestion-text">
                <HighlightText text={game.name} searchQuery={inputValue} highlightClass="suggestion-highlight" />
              </span>
            </button>
          {/each}
        </div>
      {/if}
      
      {#if $searchSuggestions.recordTypes.length > 0}
        <div class="suggestion-category">
          <div class="category-header">Categories ({$searchSuggestions.recordTypes.length})</div>
          {#each $searchSuggestions.recordTypes as recordType, index}
            <button
              class="suggestion-item record-suggestion {selectedSuggestionIndex === ($searchSuggestions.games.length + index) ? 'selected' : ''}"
              on:click={() => selectSuggestion($searchSuggestions.games.length + index)}
            >
              <span class="suggestion-text">
                <HighlightText text={recordType} searchQuery={inputValue} highlightClass="suggestion-highlight" />
              </span>
              <span class="suggestion-meta">Record type</span>
            </button>
          {/each}
        </div>
      {/if}
      
      {#if $searchSuggestions.games.length === 0 && $searchSuggestions.recordTypes.length === 0}
        <div class="no-suggestions">No matches found</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 0 auto var(--spacing-xl) auto;
  }
  
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .search-input {
    width: 100%;
    padding: var(--spacing-md);
    padding-right: 3rem;
    border: 2px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface);
    color: var(--text-primary);
    font-size: 1rem;
    transition: all 0.2s ease;
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  .search-input::placeholder {
    color: var(--text-muted);
  }
  
  .search-icons {
    position: absolute;
    right: var(--spacing-md);
    display: flex;
    align-items: center;
  }
  
  .search-icon {
    color: var(--text-muted);
    font-size: 1.125rem;
  }
  
  .clear-button {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
  
  .clear-button:hover {
    background: var(--surface-light);
    color: var(--text-primary);
  }
  
  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--surface);
    border: 2px solid var(--border);
    border-top: none;
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .suggestion-category {
    padding: var(--spacing-sm) 0;
  }
  
  .suggestion-category:not(:last-child) {
    border-bottom: 1px solid var(--border);
  }
  
  .category-header {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    background: var(--surface-light);
  }
  
  .suggestion-item {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: none;
    background: none;
    color: var(--text-primary);
    text-align: left;
    cursor: pointer;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .suggestion-item:hover,
  .suggestion-item.selected {
    background: var(--surface-light);
  }
  
  .suggestion-item.selected {
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary-color);
  }
  
  .suggestion-text {
    font-weight: 500;
  }
  
  .suggestion-meta {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-style: italic;
  }
  
  .no-suggestions {
    padding: var(--spacing-md);
    text-align: center;
    color: var(--text-muted);
    font-style: italic;
  }

  :global(.suggestion-highlight) {
    background: rgba(99, 102, 241, 0.2);
    color: var(--primary-color);
    padding: 0.125rem 0.25rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
  }
  
  @media (max-width: 480px) {
    .search-container {
      max-width: none;
      margin-bottom: var(--spacing-md);
    }
    
    .search-input {
      font-size: 0.875rem;
      padding: var(--spacing-sm);
      padding-right: 2.5rem;
    }
    
    .search-icons {
      right: var(--spacing-sm);
    }
    
    .suggestions-dropdown {
      max-height: 250px;
    }
  }
</style>