<script>
  import '../global.css';
  import { Link } from 'svelte-routing';
  import { recentRecords, basePath } from '../stores.js';
  import Modal from '../components/Modal.svelte';

  let showModal = false;
  let modalImageSrc = '';

  function openModal(imageSrc) {
    modalImageSrc = imageSrc;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    modalImageSrc = '';
  }

  function correctScreenshotPath(path) {
    if (!path) return path;
    const fullPath = path.startsWith('/records/data/') ? path : `/records/data/${path}`;
    return `${$basePath}${fullPath}`;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  function formatRecordValue(record) {
    if (record.time) return record.time;
    if (record.score) return record.score;
    if (record.difficulty) return record.difficulty;
    return 'Completed';
  }

  function getRecordTypeIcon(recordType) {
    if (recordType === 'fastest_time') return '⏱️';
    if (recordType === 'high_score') return '🏆';
    if (recordType === 'low_score') return '📈';
    if (recordType === 'completed_at_difficulty') return '✅';
    return '🎮';
  }
</script>

<main>
  <div class="breadcrumb">
    <Link to="{$basePath}/" class="back-link">
      <span>←</span> Back to Games
    </Link>
  </div>

  <div class="page-header">
    <h1>Recent Records</h1>
    <p class="page-subtitle">The 10 most recently achieved records</p>
  </div>

  {#if $recentRecords.length === 0}
    <div class="empty-state">
      <p>No recent records found.</p>
      <Link to="{$basePath}/" class="back-home-link">Browse Games</Link>
    </div>
  {:else}
    <div class="records-grid">
      {#each $recentRecords as record, index}
        <div class="record-card">
          <div class="record-header">
            <div class="record-rank">#{index + 1}</div>
            <div class="record-date">{formatDate(record.date)}</div>
          </div>
          
          <div class="record-content">
            <div class="record-main">
              <div class="game-info">
                <h3 class="game-name">
                  <Link to="{$basePath}/game/{record.gameSlug}" class="game-link">
                    {record.gameName}
                  </Link>
                </h3>
                <div class="record-type">
                  <span class="record-icon">{getRecordTypeIcon(record.recordTypeType)}</span>
                  {record.recordTypeName}
                </div>
              </div>
              
              <div class="record-value">
                <span class="value">{formatRecordValue(record)}</span>
              </div>
            </div>
            
            {#if record.description}
              <div class="record-description">
                <p>{record.description}</p>
              </div>
            {/if}
            
            {#if record.screenshot}
              <div class="screenshot-section">
                <button 
                  class="screenshot-btn"
                  on:click={() => openModal(correctScreenshotPath(record.screenshot))}
                  type="button"
                >
                  <span>📷</span>
                  View Screenshot
                </button>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <Modal 
    isVisible={showModal} 
    imgSrc={modalImageSrc} 
    onClose={closeModal} 
  />
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

  /* Page Header */
  .page-header {
    text-align: center;
    margin-bottom: var(--spacing-2xl);
  }

  .page-subtitle {
    color: var(--text-secondary);
    font-size: 1.125rem;
    margin-top: var(--spacing-sm);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    margin: var(--spacing-2xl) 0;
    padding: var(--spacing-2xl);
    background: var(--surface);
    border-radius: var(--radius-lg);
    border: 2px dashed var(--border);
  }

  .empty-state p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-lg);
    font-size: 1.125rem;
  }

  :global(.back-home-link) {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    text-decoration: none;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: all 0.2s ease;
  }

  :global(.back-home-link:hover) {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-glow);
    text-decoration: none;
  }

  /* Records Grid */
  .records-grid {
    display: grid;
    gap: var(--spacing-lg);
    grid-template-columns: 1fr;
  }

  .record-card {
    background: var(--surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .record-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
  }

  .record-rank {
    font-weight: 800;
    font-size: 1.125rem;
  }

  .record-date {
    font-size: 0.875rem;
    opacity: 0.9;
  }

  .record-content {
    padding: var(--spacing-lg);
  }

  .record-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .game-info {
    flex: 1;
  }

  .game-name {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 1.25rem;
  }

  :global(.game-link) {
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  :global(.game-link:hover) {
    color: var(--primary-color);
    text-decoration: underline;
  }

  .record-type {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .record-icon {
    font-size: 1rem;
  }

  .record-value {
    text-align: right;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--success-color), #059669);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .record-description {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--surface-light);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--primary-color);
  }

  .record-description p {
    margin: 0;
    color: var(--text-secondary);
    font-style: italic;
  }

  .screenshot-section {
    display: flex;
    justify-content: center;
  }

  .screenshot-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    background: var(--surface-light);
    color: var(--text-primary);
    border: 1px solid var(--border);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .screenshot-btn:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }

  .screenshot-btn span {
    font-size: 1rem;
  }

  /* Responsive Design */
  @media (min-width: 768px) {
    .records-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .record-main {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .record-value {
      text-align: left;
    }

    .value {
      font-size: 1.25rem;
    }

    .record-header {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .record-content {
      padding: var(--spacing-md);
    }
  }
</style>