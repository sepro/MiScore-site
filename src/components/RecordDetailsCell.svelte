<script>
  export let row;
  
  // Get functions from parent context
  export let showScreenshotModal;
  export let toggleDescription;
  export let expandedDescriptions;
</script>

<div class="details-container">
  {#if row.screenshot}
    <button class="screenshot-btn" on:click={() => showScreenshotModal(row.screenshot)}>
      <span>📷</span>
      Screenshot
    </button>
  {/if}
  {#if row.description}
    <button class="description-toggle" on:click={() => toggleDescription(row._index)}>
      {expandedDescriptions.has(row._index) ? '▼' : '▶'} Description
    </button>
  {/if}
  {#if !row.screenshot && !row.description}
    <span class="no-details">No details</span>
  {/if}
</div>

<style>
  .details-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    align-items: center;
    justify-content: flex-end;
  }

  .screenshot-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    background: var(--success-color);
    color: white;
    border: none;
    font-size: 0.75rem;
    font-weight: 600;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    height: 28px;
  }

  .screenshot-btn:hover {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
  }

  .screenshot-btn span {
    font-size: 1rem;
  }

  .description-toggle {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    height: 28px;
    display: flex;
    align-items: center;
  }

  .description-toggle:hover {
    background: #4338ca;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  }

  .no-details {
    color: var(--text-muted);
    font-size: 0.85rem;
    font-style: italic;
  }

  /* Mobile responsive adjustments */
  @media (max-width: 480px) {
    .details-container {
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
    }

    .screenshot-btn {
      justify-content: center;
      width: 100%;
    }

    .description-toggle {
      width: 100%;
      text-align: center;
    }
  }
</style>