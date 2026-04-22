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
  let isFocused = false;

  onMount(() => {
    const restored = searchQuery.restore();
    if (restored) {
      inputValue = restored;
      hasUserInteracted = false;
    }
  });

  function updateSearch(value) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery.set(value);
    }, 300);
  }

  function handleInput(event) {
    hasUserInteracted = true;
    inputValue = event.target.value;
  }

  $: {
    updateSearch(inputValue);
    if (inputValue.length >= 2 && hasUserInteracted) {
      showSuggestions = true;
      selectedSuggestionIndex = -1;
    } else {
      showSuggestions = false;
    }
  }

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
      const game = $searchSuggestions.games[index];
      inputValue = game.name;
      searchQuery.set(game.name);
      navigate(`${$basePath}/game/${game.slug}`);
    } else {
      const recordType = $searchSuggestions.recordTypes[index - gameCount];
      inputValue = recordType;
      searchQuery.set(recordType);
    }

    showSuggestions = false;
    selectedSuggestionIndex = -1;
    searchInputElement?.blur();
  }

  function handleEnterNavigation() {
    if (!inputValue.trim()) return;

    showSuggestions = false;
    selectedSuggestionIndex = -1;
    searchInputElement?.blur();

    if ($filteredRecords.length === 1) {
      const singleResult = $filteredRecords[0];
      navigate(`${$basePath}/game/${singleResult.slug}`);
    }
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
        isFocused = true;
        hasUserInteracted = true;
        if (inputValue.length >= 2) {
          showSuggestions = true;
        }
      }}
      on:blur={() => { isFocused = false; }}
      type="text"
      {placeholder}
      class="search-input {showSuggestions && inputValue.length >= 2 ? 'open' : ''}"
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
        <span class="search-icon" aria-hidden="true">⌕</span>
      {/if}
    </div>
  </div>

  {#if showSuggestions && (inputValue.length >= 2)}
    <div class="suggestions-dropdown {isFocused ? 'focused' : ''}">
      {#if $searchSuggestions.games.length > 0}
        <div class="suggestion-category">
          <div class="category-header">GAMES ({$searchSuggestions.games.length})</div>
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
          <div class="category-header">CATEGORIES ({$searchSuggestions.recordTypes.length})</div>
          {#each $searchSuggestions.recordTypes as recordType, index}
            <button
              class="suggestion-item record-suggestion {selectedSuggestionIndex === ($searchSuggestions.games.length + index) ? 'selected' : ''}"
              on:click={() => selectSuggestion($searchSuggestions.games.length + index)}
            >
              <span class="suggestion-text">
                <HighlightText text={recordType} searchQuery={inputValue} highlightClass="suggestion-highlight" />
              </span>
              <span class="suggestion-meta">RECORD TYPE</span>
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
    max-width: 420px;
    margin: 0 auto 36px auto;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border-hi);
    color: var(--text);
    font-family: var(--font-mo);
    font-size: 14px;
    padding: 11px 44px 11px 16px;
    outline: none;
    border-radius: 2px;
    transition: border-color 0.2s, box-shadow 0.2s;
    letter-spacing: 0.5px;
  }

  .search-input::placeholder {
    color: var(--muted);
  }

  .search-input:focus {
    border-color: var(--neon);
    box-shadow: 0 0 0 1px var(--neon), 0 0 14px rgba(0, 255, 136, 0.18);
  }

  .search-input.open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .search-icons {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
  }

  .search-icon {
    color: var(--neon);
    font-size: 18px;
    pointer-events: none;
    text-shadow: 0 0 6px rgba(0, 255, 136, 0.6);
  }

  .clear-button {
    background: none;
    border: none;
    color: var(--muted);
    font-size: 1.4rem;
    cursor: pointer;
    padding: 0;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    transition: color 0.15s, text-shadow 0.15s;
  }

  .clear-button:hover {
    color: var(--neon);
    text-shadow: 0 0 6px var(--neon);
  }

  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--surface);
    border: 1px solid var(--border-hi);
    border-top: none;
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.1);
    z-index: 1000;
    max-height: 320px;
    overflow-y: auto;
  }

  .suggestions-dropdown.focused {
    border-color: var(--neon);
    box-shadow: 0 0 0 1px var(--neon), 0 0 18px rgba(0, 255, 136, 0.22);
  }

  .suggestion-category {
    padding: 0;
  }

  .suggestion-category:not(:last-child) {
    border-bottom: 1px solid var(--border);
  }

  .category-header {
    padding: 8px 16px;
    font-family: var(--font-px);
    font-size: 7px;
    letter-spacing: 2px;
    color: var(--neon);
    background: rgba(0, 255, 136, 0.06);
  }

  .suggestion-item {
    width: 100%;
    padding: 10px 16px;
    border: none;
    background: none;
    color: var(--text);
    font-family: var(--font-mo);
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
  }

  .suggestion-item:hover,
  .suggestion-item.selected {
    background: rgba(0, 255, 136, 0.05);
    color: var(--cyan);
  }

  .suggestion-text { font-weight: 400; }

  .suggestion-meta {
    font-size: 8px;
    font-family: var(--font-px);
    letter-spacing: 2px;
    color: var(--muted);
  }

  .no-suggestions {
    padding: 14px;
    text-align: center;
    color: var(--muted);
    font-style: italic;
  }

  :global(.suggestion-highlight) {
    background: rgba(0, 255, 136, 0.2);
    color: var(--neon);
    padding: 0.05rem 0.2rem;
    border-radius: 1px;
    font-weight: 600;
  }

  @media (max-width: 480px) {
    .search-container {
      max-width: none;
    }
    .search-input {
      font-size: 13px;
      padding: 10px 40px 10px 12px;
    }
  }
</style>
