<script>
  export let data = [];
  export let columns = [];
  export let initialSortColumn = '';
  export let initialSortDirection = 'asc';
  export let tableClass = '';
  export let gameData = null; // For difficulty sorting
  export let expandableRows = false; // Support for expandable rows
  export let expandedRows = new Set(); // Which rows are expanded
  export let getRowId = (row, index) => index; // Function to get unique row ID
  export let onSort = null; // Callback for external sort handling
  
  let sortColumn = initialSortColumn || (columns.length > 0 ? columns[0].key : '');
  let sortDirection = initialSortDirection;
  
  function handleSort(column) {
    const columnConfig = columns.find(col => col.key === column);
    if (columnConfig?.sortable === false) return; // Don't sort non-sortable columns
    
    if (onSort) {
      // External sort handling
      onSort(column);
    } else {
      // Internal sort handling
      if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }
    }
  }

  // Helper functions for parsing different data types
  function parseTime(timeString) {
    if (!timeString) return 0;
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    }
    return 0;
  }

  function parseDate(dateString) {
    if (!dateString) return new Date(0);
    return new Date(dateString);
  }

  function parseDifficulty(difficulty) {
    if (!gameData?.difficulties || !difficulty) return -1;
    return gameData.difficulties.indexOf(difficulty);
  }
  
  // Initialize sort state from props only once
  let initialized = false;
  $: if (!initialized && initialSortColumn) {
    sortColumn = initialSortColumn;
    sortDirection = initialSortDirection;
    initialized = true;
  }

  $: sortedData = onSort ? data : data.slice().sort((a, b) => {
    const columnConfig = columns.find(col => col.key === sortColumn);
    let aVal, bVal;
    
    if (columnConfig?.sortValue) {
      aVal = columnConfig.sortValue(a);
      bVal = columnConfig.sortValue(b);
    } else {
      aVal = a[sortColumn];
      bVal = b[sortColumn];
    }
    
    let result;
    
    // Handle special data types
    if (columnConfig?.dataType === 'time') {
      result = parseTime(aVal) - parseTime(bVal);
    } else if (columnConfig?.dataType === 'date') {
      result = parseDate(aVal).getTime() - parseDate(bVal).getTime();
    } else if (columnConfig?.dataType === 'difficulty') {
      result = parseDifficulty(aVal) - parseDifficulty(bVal);
    } else if (columnConfig?.dataType === 'score' || typeof aVal === 'number') {
      const numA = parseInt(aVal, 10) || 0;
      const numB = parseInt(bVal, 10) || 0;
      result = numA - numB;
    } else if (typeof aVal === 'string') {
      result = aVal.localeCompare(bVal);
    } else {
      result = aVal - bVal;
    }
    
    return sortDirection === 'desc' ? -result : result;
  });
  
  $: getSortIcon = (column) => {
    if (sortColumn !== column) return '↑'; // Same icon but will be invisible
    return sortDirection === 'asc' ? '↓' : '↑';
  };
</script>

<table class="sortable-table {tableClass}">
  <thead>
    <tr>
      {#each columns as column}
        <th 
          class="sortable-header {sortColumn === column.key ? 'active' : ''} {column.sortable === false ? 'non-sortable' : ''}"
          on:click={() => handleSort(column.key)}
        >
          <span class="header-content">
            {column.label}
            {#if column.sortable !== false}
              <span class="sort-icon {sortColumn === column.key ? 'visible' : 'invisible'}">{getSortIcon(column.key)}</span>
            {/if}
          </span>
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each sortedData as row, index}
      <tr>
        {#each columns as column}
          <td data-label={column.label}>
            {#if column.component}
              <svelte:component this={column.component} {row} {column} {...(column.componentProps || {})} />
            {:else if column.render}
              {@html column.render(row)}
            {:else}
              {row[column.key]}
            {/if}
          </td>
        {/each}
      </tr>
      {#if expandableRows && expandedRows.has(getRowId(row, index))}
        <tr class="expanded-row">
          <td colspan={columns.length} class="expanded-content">
            <slot name="expanded-content" {row} {index} />
          </td>
        </tr>
      {/if}
    {/each}
  </tbody>
</table>

<style>
  .sortable-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
  }
  
  .sortable-header {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
    padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
  }

  .sortable-header.non-sortable {
    cursor: default;
  }
  
  .sortable-header:hover:not(.non-sortable) {
    background-color: var(--surface-hover, rgba(0, 0, 0, 0.05));
  }
  
  .sortable-header.active {
    background-color: var(--surface-active, rgba(0, 0, 0, 0.1));
  }
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xs, 4px);
  }
  
  .sort-icon {
    font-size: 0.8em;
    min-width: 12px;
    text-align: center;
    transition: opacity 0.2s ease;
    flex-shrink: 0;
  }
  
  .sort-icon.invisible {
    opacity: 0;
  }
  
  .sort-icon.visible {
    opacity: 0.6;
  }
  
  .sortable-header.active .sort-icon.visible {
    opacity: 1;
  }
  
  /* Ensure table cells have consistent padding */
  .sortable-table td {
    padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
  }

  /* Expanded row styling */
  .expanded-row {
    background: rgba(99, 102, 241, 0.03);
    border-top: none;
  }

  .expanded-content {
    padding: var(--spacing-md, 12px) var(--spacing-lg, 16px);
    border-top: 1px solid rgba(99, 102, 241, 0.1);
  }
</style>