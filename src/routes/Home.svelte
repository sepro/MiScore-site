<script>
    import '../global.css';
    import { gameRecords, basePath, filteredRecords, searchQuery, paginatedRecords, pagination, sortState, paginationTotals } from '../stores.js'
    import SearchInput from '../components/SearchInput.svelte';
    import SortableTable from '../components/SortableTable.svelte';
    import GameNameCell from '../components/GameNameCell.svelte';
    import PaginationControls from '../components/PaginationControls.svelte';
    import NeonFlicker from '../components/NeonFlicker.svelte';
    import { onMount, onDestroy } from 'svelte';

    let unsubscribe;

    onMount(() => {
      searchQuery.restore();
    });

    $: if ($searchQuery !== undefined) {
      pagination.update(p => ({ ...p, currentPage: 1 }));
    }

    $: if ($paginationTotals) {
      pagination.update(p => ({
        ...p,
        totalItems: $paginationTotals.totalItems,
        totalPages: $paginationTotals.totalPages,
        currentPage: Math.min(p.currentPage, Math.max(1, $paginationTotals.totalPages))
      }));
    }

    function getSearchResultText(count, query) {
      if (!query.trim()) return '';
      if (count === 0) return 'No games found';
      if (count === 1) return '1 game found - Press Enter to navigate';
      return `${count} games found`;
    }

    const columns = [
      {
        key: 'name',
        label: 'GAME',
        component: GameNameCell,
        sortValue: (row) => row.name.replace(/^The /i, '').toLowerCase()
      },
      {
        key: 'recordCount',
        label: 'RECORD COUNT'
      }
    ];

    onDestroy(() => {
      if (unsubscribe) unsubscribe();
    });
</script>

<main>
    <NeonFlicker tag="h1" text="◆ GAME RECORDS OVERVIEW" />

    <SearchInput />

    {#if $searchQuery.trim()}
      <div class="search-results-info">
        {getSearchResultText($filteredRecords.length, $searchQuery)}
      </div>
    {/if}

    {#if $filteredRecords.length > 0}
      <SortableTable
        data={$paginatedRecords}
        {columns}
        initialSortColumn={$sortState.column}
        initialSortDirection={$sortState.direction}
        tableClass="games-overview-table"
        onSort={(column) => {
          sortState.update(current => {
            if (current.column === column) {
              return { ...current, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            } else {
              return { column, direction: 'asc' };
            }
          });
          pagination.update(p => ({ ...p, currentPage: 1 }));
        }}
      />

      <PaginationControls />
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
    color: var(--muted);
    font-size: 12px;
    letter-spacing: 1px;
  }

  .no-results {
    text-align: center;
    margin: var(--spacing-xl) 0;
    padding: var(--spacing-xl);
    background: var(--surface);
    border: 1px dashed var(--border-hi);
    border-radius: 2px;
  }

  .no-results p {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text);
    font-family: var(--font-mo);
  }

  .no-results-hint {
    font-size: 12px;
    color: var(--muted);
  }

  /* Record count cell — right-aligned, neon, pixel font */
  :global(.games-overview-table tbody td:last-child) {
    text-align: right;
    font-family: var(--font-px);
    font-size: 11px;
    color: var(--neon);
  }
  :global(.games-overview-table thead th:last-child) {
    text-align: right;
  }
  :global(.games-overview-table thead th:last-child .header-content) {
    justify-content: flex-end;
    width: 100%;
  }

  /* Row left-border neon accent on hover */
  :global(.games-overview-table tbody tr) {
    cursor: pointer;
    transition: box-shadow 0.14s, background 0.14s;
  }
  :global(.games-overview-table tbody tr:hover) {
    box-shadow: inset 3px 0 0 var(--neon), inset 3px 0 12px rgba(0, 255, 136, 0.4);
  }

  /* Make the entire row clickable by stretching the game-name link to cover it */
  :global(.games-overview-table tbody tr) {
    position: relative;
  }
  :global(.games-overview-table tbody tr .game-name-link::after) {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
  }
</style>
