<script>
  export let data = [];
  export let columns = [];
  export let initialSortColumn = '';
  export let initialSortDirection = 'asc';
  export let tableClass = '';
  export let gameData = null;
  export let expandableRows = false;
  export let expandedRows = new Set();
  export let getRowId = (row, index) => index;
  export let onSort = null;

  let sortColumn = initialSortColumn || (columns.length > 0 ? columns[0].key : '');
  let sortDirection = initialSortDirection;

  function handleSort(column) {
    const columnConfig = columns.find(col => col.key === column);
    if (columnConfig?.sortable === false) return;

    if (onSort) {
      onSort(column);
    } else {
      if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }
    }
  }

  function parseTime(timeString) {
    if (!timeString) return 0;
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
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

  let initialized = false;
  $: if (onSort) {
    sortColumn = initialSortColumn || (columns.length > 0 ? columns[0].key : '');
    sortDirection = initialSortDirection;
  } else if (!initialized && initialSortColumn) {
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
    if (sortColumn !== column) return '↑';
    return sortDirection === 'asc' ? '↓' : '↑';
  };
</script>

<div class="tbl-wrap">
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
</div>

<style>
  .tbl-wrap {
    border: 1px solid var(--border-hi);
    border-radius: 2px;
    overflow: hidden;
    background: var(--surface);
  }

  .sortable-table {
    width: 100%;
    border-collapse: collapse;
    margin: 0;
    font-family: var(--font-mo);
  }

  thead tr {
    background: linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 212, 255, 0.06) 100%);
    border-bottom: 1px solid var(--border-hi);
  }

  .sortable-header {
    cursor: pointer;
    user-select: none;
    font-family: var(--font-px);
    font-size: 8px;
    color: var(--neon);
    letter-spacing: 2px;
    padding: 13px 20px;
    text-align: left;
    transition: background-color 0.15s;
  }
  .sortable-header.non-sortable { cursor: default; }
  .sortable-header:hover:not(.non-sortable) { background: rgba(0, 255, 136, 0.07); }
  .sortable-header.active { color: var(--neon); }

  .header-content {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .sort-icon {
    font-size: 0.9em;
    min-width: 10px;
    text-align: center;
    transition: opacity 0.2s;
    opacity: 0.55;
  }
  .sort-icon.invisible { opacity: 0; }
  .sort-icon.visible { opacity: 0.55; }
  .sortable-header.active .sort-icon.visible { opacity: 1; }

  tbody tr {
    border-bottom: 1px solid rgba(0, 255, 136, 0.055);
    transition: background 0.14s;
    position: relative;
  }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: rgba(0, 255, 136, 0.04); }

  tbody td {
    padding: 13px 20px;
    font-size: 14px;
    color: var(--text);
    vertical-align: middle;
  }

  /* Expanded row */
  .expanded-row {
    background: rgba(0, 255, 136, 0.025);
  }
  .expanded-content {
    padding: 12px 20px;
    border-top: 1px dashed var(--border-hi);
    color: var(--muted);
    font-style: italic;
    line-height: 1.6;
  }

  @media (max-width: 600px) {
    .sortable-header { padding: 10px 12px; font-size: 7px; }
    tbody td { padding: 11px 12px; font-size: 13px; }
  }
</style>
