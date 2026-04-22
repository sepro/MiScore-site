<script>
  export let row;
  
  // Get functions from parent context
  export let showScreenshotModal;
  export let toggleDescription;
  export let expandedDescriptions;
</script>

<div class="details-container">
  {#if row.screenshot}
    <button class="ss-btn" on:click={() => showScreenshotModal(row)}>
      ◈ SCREENSHOT
    </button>
  {/if}
  {#if row.description}
    <button class="desc-btn" on:click={() => toggleDescription(row._index)}>
      {expandedDescriptions.has(row._index) ? '▼' : '▶'} DESCRIPTION
    </button>
  {/if}
  {#if !row.screenshot && !row.description}
    <span class="no-details">—</span>
  {/if}
</div>

<style>
  .details-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .ss-btn {
    background: rgba(153, 102, 255, 0.1);
    border: 1px solid rgba(153, 102, 255, 0.5);
    color: var(--purple);
    font-family: var(--font-mo);
    font-size: 11px;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 2px;
    letter-spacing: 1px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.15s;
  }

  .ss-btn:hover {
    background: rgba(153, 102, 255, 0.22);
    box-shadow: 0 0 8px rgba(153, 102, 255, 0.3);
  }

  .desc-btn {
    background: var(--surface2);
    border: 1px solid var(--border-hi);
    color: var(--muted);
    font-family: var(--font-mo);
    font-size: 11px;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 2px;
    letter-spacing: 1px;
    transition: all 0.15s;
  }

  .desc-btn:hover {
    border-color: var(--neon);
    color: var(--neon);
    text-shadow: 0 0 6px rgba(0, 255, 136, 0.4);
  }

  .no-details {
    color: var(--muted);
    font-family: var(--font-mo);
    font-size: 13px;
  }

  @media (max-width: 480px) {
    .details-container {
      flex-direction: column;
      align-items: flex-start;
    }
    .ss-btn, .desc-btn { width: 100%; justify-content: center; }
  }
</style>