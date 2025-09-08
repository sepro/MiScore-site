<script>
    import '../global.css';
    import { gameRecords, basePath, filteredRecords, searchQuery } from '../stores.js'
    import SearchInput from '../components/SearchInput.svelte';
    import SortableTable from '../components/SortableTable.svelte';
    import GameNameCell from '../components/GameNameCell.svelte';
    import { onMount, onDestroy } from 'svelte';

    let unsubscribe;
    
    // Restore search state when component mounts (works for both back button and direct navigation)
    onMount(() => {
      searchQuery.restore();
    });
    
    function getSearchResultText(count, query) {
      if (!query.trim()) return '';
      if (count === 0) return 'No games found';
      if (count === 1) return '1 game found - Press Enter to navigate';
      return `${count} games found`;
    }
    
    // Table configuration
    const columns = [
      {
        key: 'name',
        label: 'Game',
        component: GameNameCell,
        sortValue: (row) => row.name.replace(/^The /i, '').toLowerCase()
      },
      {
        key: 'recordCount',
        label: 'Record Count'
      }
    ];
    
    onDestroy(() => {
      if (unsubscribe) unsubscribe();
    });
</script>

<main>
    <h1>Game Records Overview</h1>
    
    <SearchInput />
    
    {#if $searchQuery.trim()}
      <div class="search-results-info">
        {getSearchResultText($filteredRecords.length, $searchQuery)}
      </div>
    {/if}
    
    {#if $filteredRecords.length > 0}
      <SortableTable 
        data={$filteredRecords} 
        {columns}
        initialSortColumn="name"
        initialSortDirection="asc"
        tableClass="games-overview-table"
      />
    {:else if $filteredRecords.length === 0 && $searchQuery.trim()}
      <div class="no-results">
        <p>No games match your search for "{$searchQuery}"</p>
        <p class="no-results-hint">Try searching for game names or record types like "Any%", "100%", etc.</p>
      </div>
    {/if}
  </main>

<style>
  .search-results-info {
    text-align: center;
    margin-bottom: var(--spacing-md);
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
  
  .no-results {
    text-align: center;
    margin: var(--spacing-xl) 0;
    padding: var(--spacing-xl);
    background: var(--surface);
    border-radius: var(--radius-lg);
    border: 2px dashed var(--border);
  }
  
  .no-results p {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-secondary);
  }
  
  .no-results-hint {
    font-size: 0.875rem;
    color: var(--text-muted);
  }
</style>