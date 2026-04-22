<script>
  import { pagination } from '../stores.js';

  function goToPage(pageNum) {
    if (pageNum >= 1 && pageNum <= $pagination.totalPages) {
      pagination.update(p => ({ ...p, currentPage: pageNum }));
    }
  }

  function previousPage() {
    if ($pagination.currentPage > 1) goToPage($pagination.currentPage - 1);
  }

  function nextPage() {
    if ($pagination.currentPage < $pagination.totalPages) goToPage($pagination.currentPage + 1);
  }

  $: pageNumbers = (() => {
    const current = $pagination.currentPage;
    const total = $pagination.totalPages;
    const pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        if (total > 6) pages.push('...', total);
      } else if (current >= total - 3) {
        pages.push(1, '...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }
    return pages;
  })();
</script>

{#if $pagination.totalPages > 1}
  <div class="pagination">
    <button
      class="pg-btn"
      disabled={$pagination.currentPage === 1}
      on:click={previousPage}
      aria-label="Previous page"
    >◀ PREV</button>

    {#each pageNumbers as pageNum}
      {#if pageNum === '...'}
        <span class="ellipsis">…</span>
      {:else}
        <button
          class="pg-btn"
          class:active={pageNum === $pagination.currentPage}
          on:click={() => goToPage(pageNum)}
          aria-label="Go to page {pageNum}"
        >{pageNum}</button>
      {/if}
    {/each}

    <button
      class="pg-btn"
      disabled={$pagination.currentPage === $pagination.totalPages}
      on:click={nextPage}
      aria-label="Next page"
    >NEXT ▶</button>
  </div>

  <p class="pg-info">
    Showing {Math.min(($pagination.currentPage - 1) * $pagination.itemsPerPage + 1, $pagination.totalItems)}–{Math.min($pagination.currentPage * $pagination.itemsPerPage, $pagination.totalItems)}
    of {$pagination.totalItems} games
  </p>
{/if}

<style>
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 26px;
    flex-wrap: wrap;
  }

  .pg-btn {
    background: var(--surface);
    border: 1px solid var(--border-hi);
    color: var(--muted);
    font-family: var(--font-mo);
    font-size: 12px;
    padding: 7px 14px;
    cursor: pointer;
    border-radius: 2px;
    letter-spacing: 1px;
    transition: all 0.15s;
    min-height: 32px;
  }

  .pg-btn:hover:not(:disabled) {
    border-color: var(--neon);
    color: var(--neon);
    box-shadow: 0 0 8px rgba(0, 255, 136, 0.2);
  }

  .pg-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .pg-btn.active {
    background: rgba(0, 255, 136, 0.1);
    border-color: var(--neon);
    color: var(--neon);
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.22);
  }

  .ellipsis {
    color: var(--muted);
    padding: 0 6px;
    font-family: var(--font-mo);
  }

  .pg-info {
    text-align: center;
    font-size: 12px;
    color: var(--muted);
    margin-top: 14px;
    letter-spacing: 1px;
  }

  @media (max-width: 480px) {
    .pg-btn { font-size: 11px; padding: 6px 10px; letter-spacing: 0.5px; }
  }
</style>
