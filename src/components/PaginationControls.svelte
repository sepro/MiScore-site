<script>
  import { pagination } from '../stores.js';

  function goToPage(pageNum) {
    if (pageNum >= 1 && pageNum <= $pagination.totalPages) {
      pagination.update(p => ({ ...p, currentPage: pageNum }));
    }
  }

  function previousPage() {
    if ($pagination.currentPage > 1) {
      goToPage($pagination.currentPage - 1);
    }
  }

  function nextPage() {
    if ($pagination.currentPage < $pagination.totalPages) {
      goToPage($pagination.currentPage + 1);
    }
  }

  // Generate page numbers to display
  $: pageNumbers = (() => {
    const current = $pagination.currentPage;
    const total = $pagination.totalPages;
    const pages = [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Smart truncation for more pages
      if (current <= 4) {
        // Near beginning: 1 2 3 4 5 ... 10
        for (let i = 1; i <= 5; i++) pages.push(i);
        if (total > 6) pages.push('...', total);
      } else if (current >= total - 3) {
        // Near end: 1 ... 6 7 8 9 10
        pages.push(1, '...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        // Middle: 1 ... 4 5 6 ... 10
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }

    return pages;
  })();
</script>

{#if $pagination.totalPages > 1}
  <div class="pagination">
    <button 
      class="pagination-btn prev-btn"
      disabled={$pagination.currentPage === 1}
      on:click={previousPage}
      aria-label="Previous page"
    >
      <span class="btn-icon">‹</span>
      <span class="btn-text">Previous</span>
    </button>

    <div class="page-numbers">
      {#each pageNumbers as pageNum}
        {#if pageNum === '...'}
          <span class="ellipsis">…</span>
        {:else}
          <button 
            class="page-btn"
            class:active={pageNum === $pagination.currentPage}
            on:click={() => goToPage(pageNum)}
            aria-label="Go to page {pageNum}"
          >
            {pageNum}
          </button>
        {/if}
      {/each}
    </div>

    <button 
      class="pagination-btn next-btn"
      disabled={$pagination.currentPage === $pagination.totalPages}
      on:click={nextPage}
      aria-label="Next page"
    >
      <span class="btn-text">Next</span>
      <span class="btn-icon">›</span>
    </button>
  </div>

  <div class="pagination-info">
    Showing {Math.min(($pagination.currentPage - 1) * $pagination.itemsPerPage + 1, $pagination.totalItems)}-{Math.min($pagination.currentPage * $pagination.itemsPerPage, $pagination.totalItems)} 
    of {$pagination.totalItems} games
  </div>
{/if}

<style>
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-sm);
    margin: var(--spacing-xl) 0 var(--spacing-md) 0;
    flex-wrap: wrap;
  }

  .pagination-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 40px;
  }

  .pagination-btn:not(:disabled):hover {
    background: var(--surface-hover, rgba(0, 0, 0, 0.05));
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }

  .pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  .pagination-btn:disabled:hover {
    background: var(--surface);
    border-color: var(--border);
    transform: none;
  }

  .btn-icon {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .page-numbers {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .page-btn {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .page-btn:hover {
    background: var(--surface-hover, rgba(0, 0, 0, 0.05));
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }

  .page-btn.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    font-weight: 600;
    box-shadow: var(--shadow-sm);
  }

  .page-btn.active:hover {
    background: var(--primary-dark, #4338ca);
    transform: translateY(-1px);
  }

  .ellipsis {
    color: var(--text-muted);
    font-weight: 600;
    padding: var(--spacing-sm);
    font-size: 1.25rem;
  }

  .pagination-info {
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-bottom: var(--spacing-lg);
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .pagination {
      gap: var(--spacing-xs);
      margin: var(--spacing-lg) 0 var(--spacing-sm) 0;
    }

    .btn-text {
      display: none;
    }

    .pagination-btn {
      padding: var(--spacing-sm);
      min-width: 40px;
    }

    .page-btn {
      min-width: 36px;
      min-height: 36px;
      font-size: 0.8rem;
    }

    .pagination-info {
      font-size: 0.8rem;
      padding: 0 var(--spacing-sm);
    }
  }
</style>