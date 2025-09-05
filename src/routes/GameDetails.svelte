<script>
    import '../global.css';
    import { Link } from 'svelte-routing';
    import { gameRecords, basePath } from '../stores.js';
    import RecordType from '../components/RecordType.svelte';
  
    export let id;
    let gameData = {};

    $: gameData = $gameRecords[id];
  
    const correctScreenshotPath = (path) => {
        if (!path) return path;
        const fullPath = path.startsWith('/records/data/') ? path : `/records/data/${path}`;
        return `${$basePath}${fullPath}`;
    };

    // Calculate total records
    $: totalRecords = gameData?.record_types?.reduce((sum, type) => sum + type.records.length, 0) || 0;
  </script>
  
  <main>
    <div class="breadcrumb">
      <Link to="{$basePath}/" class="back-link">
        <span>←</span> Back to Games
      </Link>
    </div>
    
    <div class="game-header">
      <h1>{gameData?.name || 'Loading...'}</h1>
      {#if totalRecords > 0}
        <div class="game-stats">
          <div class="stat-card">
            <span class="stat-number">{totalRecords}</span>
            <span class="stat-label">Total {totalRecords === 1 ? 'Record' : 'Records'}</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{gameData.record_types?.length || 0}</span>
            <span class="stat-label">{(gameData.record_types?.length || 0) === 1 ? 'Record Type' : 'Record Types'}</span>
          </div>
        </div>
      {/if}
    </div>

    {#if gameData?.record_types}
      <div class="records-container">
        {#each gameData.record_types as recordType}
          <div class="record-section">
            <RecordType {recordType} {correctScreenshotPath} gameData={gameData} />
          </div>
        {/each}
      </div>
    {:else}
      <div class="loading">
        <p>Loading game data...</p>
      </div>
    {/if}
  </main>

  <style>
    /* Breadcrumb Navigation */
    .breadcrumb {
      margin-bottom: var(--spacing-lg);
    }

    :global(.back-link) {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
      background: var(--surface);
      border: 1px solid var(--border);
    }

    :global(.back-link:hover) {
      color: var(--primary-color);
      background: rgba(99, 102, 241, 0.05);
      text-decoration: none;
      transform: translateX(-2px);
    }

    :global(.back-link span) {
      font-size: 1.2rem;
      font-weight: 600;
    }

    /* Game Header */
    .game-header {
      margin-bottom: var(--spacing-2xl);
      text-align: center;
    }

    .game-stats {
      display: flex;
      justify-content: center;
      gap: var(--spacing-xl);
      margin-top: var(--spacing-lg);
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-lg) var(--spacing-xl);
      background: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      margin-top: var(--spacing-sm);
    }

    /* Records Container */
    .records-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2xl);
    }

    .record-section {
      background: var(--surface);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
      transition: transform 0.2s ease;
    }

    .record-section:hover {
      transform: translateY(-2px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .game-stats {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .stat-card {
        padding: var(--spacing-md) var(--spacing-lg);
      }

      .stat-number {
        font-size: 1.5rem;
      }

      .record-section {
        padding: var(--spacing-lg);
      }
    }

    @media (max-width: 480px) {
      :global(.back-link) {
        padding: var(--spacing-sm);
        font-size: 0.875rem;
      }

      .game-stats {
        flex-direction: row;
        gap: var(--spacing-sm);
      }

      .stat-card {
        padding: var(--spacing-sm) var(--spacing-md);
        flex: 1;
      }

      .stat-number {
        font-size: 1.25rem;
      }

      .stat-label {
        font-size: 0.75rem;
      }
    }
  </style>
  