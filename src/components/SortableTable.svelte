<script>
  export let data = [];
  export let columns = [];
  export let initialSortColumn = '';
  export let initialSortDirection = 'asc';
  export let tableClass = '';
  
  let sortColumn = initialSortColumn || (columns.length > 0 ? columns[0].key : '');
  let sortDirection = initialSortDirection;
  
  function handleSort(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
  }
  
  $: sortedData = data.slice().sort((a, b) => {
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
    if (typeof aVal === 'string') {
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
          class="sortable-header {sortColumn === column.key ? 'active' : ''}"
          on:click={() => handleSort(column.key)}
        >
          <span class="header-content">
            {column.label}
            <span class="sort-icon {sortColumn === column.key ? 'visible' : 'invisible'}">{getSortIcon(column.key)}</span>
          </span>
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each sortedData as row}
      <tr>
        {#each columns as column}
          <td>
            {#if column.component}
              <svelte:component this={column.component} {row} {column} />
            {:else if column.render}
              {@html column.render(row)}
            {:else}
              {row[column.key]}
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sortable-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .sortable-header {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
    padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
  }
  
  .sortable-header:hover {
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
</style>