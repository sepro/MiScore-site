<script>
  import '../global.css';
  import { Link } from 'svelte-routing';
  import { recentRecords, basePath } from '../stores.js';
  import Modal from '../components/Modal.svelte';
  import NeonFlicker from '../components/NeonFlicker.svelte';

  let showModal = false;
  let modalImageSrc = '';
  let modalMeta = [];

  function openModal(record) {
    modalImageSrc = correctScreenshotPath(record.screenshot);
    const type = record.recordTypeType;
    const valueLabel =
      type === 'completed_at_difficulty' ? 'DIFFICULTY' :
      (type === 'high_score' || type === 'low_score') ? 'SCORE' :
      (type === 'fastest_time' || type === 'longest_time') ? 'TIME' :
      'VALUE';
    modalMeta = [
      { label: 'GAME', value: record.gameName },
      { label: valueLabel, value: formatRecordValue(record) },
      { label: 'DATE', value: formatDate(record.date) },
      { label: 'TYPE', value: record.recordTypeName },
    ];
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    modalImageSrc = '';
    modalMeta = [];
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
</script>

<main>
  <div class="breadcrumb">
    <Link to="{$basePath}/" class="back-btn">
      ← BACK TO GAMES
    </Link>
  </div>

  <NeonFlicker tag="h1" text="◆ RECENT RECORDS" />
  <p class="page-sub">THE 10 MOST RECENTLY ACHIEVED RECORDS</p>

  {#if $recentRecords.length === 0}
    <div class="empty-state">
      <p>No recent records found.</p>
      <Link to="{$basePath}/" class="back-home-link">BROWSE GAMES</Link>
    </div>
  {:else}
    <div class="recent-grid">
      {#each $recentRecords as record, index}
        <div class="rc">
          <div class="rc-head">
            <span class="rc-rank">#{String(index + 1).padStart(2, '0')}</span>
            <span class="rc-date">{formatDate(record.date)}</span>
          </div>
          <div class="rc-body">
            <div class="rc-top">
              <Link to="{$basePath}/game/{record.gameSlug}" class="rc-game">
                {record.gameName}
              </Link>
              <span class="rc-val">{formatRecordValue(record)}</span>
            </div>
            <div class="rc-type">
              <span class="rc-type-icon">▸</span>
              <span>{record.recordTypeName}</span>
            </div>
            {#if record.description}
              <div class="rc-note">{record.description}</div>
            {/if}
            {#if record.screenshot}
              <div class="rc-foot">
                <button
                  class="ss-btn"
                  on:click={() => openModal(record)}
                  type="button"
                >
                  ◈ VIEW SCREENSHOT
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
    meta={modalMeta}
    onClose={closeModal}
  />
</main>

<style>
  .breadcrumb { margin-bottom: 28px; }

  .page-sub {
    text-align: center;
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 2px;
    margin-bottom: 32px;
    margin-top: -16px;
  }

  .empty-state {
    text-align: center;
    margin: var(--spacing-2xl) 0;
    padding: var(--spacing-2xl);
    background: var(--surface);
    border: 1px dashed var(--border-hi);
    border-radius: 2px;
  }
  .empty-state p {
    color: var(--muted);
    margin-bottom: var(--spacing-lg);
    font-size: 13px;
  }

  :global(.back-home-link) {
    display: inline-block;
    background: var(--surface);
    color: var(--neon);
    border: 1px solid var(--neon);
    padding: 10px 20px;
    font-family: var(--font-mo);
    font-size: 12px;
    letter-spacing: 1.5px;
    text-decoration: none;
    transition: all 0.15s;
  }
  :global(.back-home-link:hover) {
    background: rgba(0, 255, 136, 0.1);
    box-shadow: 0 0 16px rgba(0, 255, 136, 0.3);
    text-decoration: none;
  }

  .recent-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .rc {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    overflow: hidden;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .rc:hover {
    border-color: var(--border-hi);
    box-shadow: 0 0 18px rgba(0, 255, 136, 0.07);
  }

  .rc-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 9px 16px;
    border-bottom: 1px solid var(--border);
    background: rgba(0, 255, 136, 0.045);
  }
  .rc-rank {
    font-family: var(--font-px);
    font-size: 10px;
    color: var(--neon);
    letter-spacing: 1px;
  }
  .rc-date {
    font-family: var(--font-mo);
    font-size: 11px;
    color: var(--muted);
  }

  .rc-body { padding: 14px 16px; }

  .rc-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 5px;
    gap: 10px;
  }

  :global(.rc-game) {
    font-family: var(--font-mo);
    font-size: 15px;
    color: var(--cyan);
    text-decoration: none;
    transition: text-shadow 0.15s;
    flex: 1;
    min-width: 0;
  }
  :global(.rc-game:hover) {
    text-shadow: 0 0 8px var(--cyan);
    text-decoration: none;
  }

  .rc-val {
    font-family: var(--font-px);
    font-size: 12px;
    color: var(--neon);
    text-shadow: 0 0 8px var(--neon);
    white-space: nowrap;
    margin-left: 10px;
    flex-shrink: 0;
  }

  .rc-type {
    font-family: var(--font-mo);
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
    line-height: 1.4;
    display: flex;
    gap: 6px;
  }
  .rc-type-icon {
    color: var(--purple);
    flex-shrink: 0;
  }

  .rc-note {
    font-family: var(--font-mo);
    font-size: 12px;
    color: var(--muted);
    font-style: italic;
    line-height: 1.55;
    background: var(--surface2);
    border-left: 2px solid var(--border-hi);
    padding: 8px 10px;
    margin-bottom: 10px;
    border-radius: 0 2px 2px 0;
  }

  .rc-foot {
    display: flex;
    justify-content: flex-end;
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
    transition: all 0.15s;
  }
  .ss-btn:hover {
    background: rgba(153, 102, 255, 0.22);
    box-shadow: 0 0 8px rgba(153, 102, 255, 0.3);
  }

  @media (max-width: 720px) {
    .recent-grid { grid-template-columns: 1fr; }
  }
</style>
