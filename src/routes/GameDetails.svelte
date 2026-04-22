<script>
    import '../global.css';
    import { Link } from 'svelte-routing';
    import { gameRecords, basePath, isLoading } from '../stores.js';
    import RecordType from '../components/RecordType.svelte';
    import { onMount } from 'svelte';

    export let slug;

    $: gameData = $gameRecords && Array.isArray($gameRecords) ? $gameRecords.find(game => game.slug === slug) : null;
    $: isDataLoaded = $gameRecords && Array.isArray($gameRecords) && $gameRecords.length > 0;
    $: isValidGame = isDataLoaded && gameData;

    const correctScreenshotPath = (path) => {
        if (!path) return path;
        const fullPath = path.startsWith('/records/data/') ? path : `/records/data/${path}`;
        return `${$basePath}${fullPath}`;
    };

    $: totalRecords = gameData?.record_types?.reduce((sum, type) => sum + (type.records?.length || 0), 0) || 0;
    $: recordTypeCount = gameData?.record_types?.length || 0;

    // Hash game name into a hue 0..359 (matches prototype's gameHue)
    function gameHue(name) {
      if (!name) return 140;
      let h = 0;
      for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xfffff;
      return h % 360;
    }
    $: hue = gameHue(gameData?.name);

    // Animated counter
    function counterTween(node, { target, duration = 900 }) {
      const t0 = performance.now();
      let raf;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        const e = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(e * target).toString();
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return {
        destroy() { if (raf) cancelAnimationFrame(raf); }
      };
    }
  </script>

  <main>
    <div class="breadcrumb">
      <Link to="{$basePath}/" class="back-btn">
        ← BACK TO GAMES
      </Link>
    </div>

    {#if $isLoading || !isDataLoaded}
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Loading game data...</p>
      </div>
    {:else if !isValidGame}
      <div class="error-page">
        <h1>GAME NOT FOUND</h1>
        <p>The game "<strong>{slug}</strong>" could not be found.</p>
        <div class="error-actions">
          <Link to="{$basePath}/" class="error-link">
            BROWSE ALL GAMES
          </Link>
        </div>
      </div>
    {:else}
      <div class="hero">
        <div
          class="hero-inner"
          style="background: linear-gradient(135deg, #060610 0%, hsl({hue}, 65%, 8%) 55%, hsl({hue}, 75%, 13%) 100%);"
        >
          <div class="hero-grid"></div>
          <div
            class="hero-glow"
            style="background: radial-gradient(ellipse at 18% 80%, hsl({hue}, 80%, 28%) 0%, transparent 55%);"
          ></div>

          <svg class="hero-corner tl" width="26" height="26" viewBox="0 0 26 26">
            <path d="M1 14 L1 1 L14 1" fill="none" stroke="hsl({hue},80%,62%)" stroke-width="1.5"/>
          </svg>
          <svg class="hero-corner tr" width="26" height="26" viewBox="0 0 26 26">
            <path d="M25 14 L25 1 L12 1" fill="none" stroke="hsl({hue},80%,62%)" stroke-width="1.5"/>
          </svg>
          <svg class="hero-corner bl" width="26" height="26" viewBox="0 0 26 26">
            <path d="M1 12 L1 25 L14 25" fill="none" stroke="hsl({hue},80%,62%)" stroke-width="1.5"/>
          </svg>
          <svg class="hero-corner br" width="26" height="26" viewBox="0 0 26 26">
            <path d="M25 12 L25 25 L12 25" fill="none" stroke="hsl({hue},80%,62%)" stroke-width="1.5"/>
          </svg>

          <h1 class="hero-title">{gameData.name}</h1>
          <div
            class="hero-rule"
            style="background: linear-gradient(90deg, hsl({hue},80%,60%) 0%, rgba(255,255,255,0.08) 100%);"
          ></div>
        </div>
      </div>

      {#if totalRecords > 0}
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-num" use:counterTween={{ target: totalRecords }}>0</span>
            <span class="stat-lbl">{totalRecords === 1 ? 'TOTAL RECORD' : 'TOTAL RECORDS'}</span>
          </div>
          <div class="stat-card">
            <span class="stat-num" use:counterTween={{ target: recordTypeCount }}>0</span>
            <span class="stat-lbl">{recordTypeCount === 1 ? 'RECORD TYPE' : 'RECORD TYPES'}</span>
          </div>
        </div>
      {/if}

      <div class="records-container">
        {#each gameData.record_types as recordType}
          <div class="record-section">
            <RecordType {recordType} {correctScreenshotPath} gameData={gameData} />
          </div>
        {/each}
      </div>
    {/if}
  </main>

  <style>
    .breadcrumb {
      margin-bottom: 28px;
    }

    :global(.back-btn) {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--surface);
      border: 1px solid var(--border-hi);
      color: var(--muted);
      font-family: var(--font-mo);
      font-size: 12px;
      padding: 8px 16px;
      border-radius: 2px;
      letter-spacing: 1px;
      transition: all 0.15s;
      text-decoration: none;
    }
    :global(.back-btn:hover) {
      border-color: var(--neon);
      color: var(--neon);
      text-decoration: none;
      text-shadow: 0 0 6px rgba(0, 255, 136, 0.5);
    }

    /* Hero */
    .hero {
      border: 1px solid var(--border-hi);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 28px;
      position: relative;
    }
    .hero-inner {
      padding: 44px 36px 36px;
      min-height: 190px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      position: relative;
    }
    .hero-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
      background-size: 32px 32px;
      pointer-events: none;
    }
    .hero-glow {
      position: absolute;
      inset: 0;
      opacity: 0.35;
      z-index: 0;
      pointer-events: none;
    }
    .hero-corner {
      position: absolute;
      opacity: 0.45;
    }
    .hero-corner.tl { top: 14px; left: 14px; }
    .hero-corner.tr { top: 14px; right: 14px; }
    .hero-corner.bl { bottom: 14px; left: 14px; }
    .hero-corner.br { bottom: 14px; right: 14px; }

    .hero-title {
      font-family: var(--font-px);
      font-size: 20px;
      color: #fff;
      letter-spacing: 2px;
      text-shadow: 0 0 24px rgba(255, 255, 255, 0.45);
      position: relative;
      z-index: 1;
      line-height: 1.7;
      margin: 0;
      text-align: left;
    }
    .hero-rule {
      height: 2px;
      margin-top: 14px;
      position: relative;
      z-index: 1;
      border-radius: 1px;
    }

    /* Stat cards */
    .stats-row {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border-hi);
      border-radius: 2px;
      padding: 22px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
      overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--neon);
      box-shadow: 0 0 10px var(--neon);
    }
    .stat-num {
      font-family: var(--font-px);
      font-size: 30px;
      color: var(--neon);
      text-shadow: 0 0 14px var(--neon);
      line-height: 1;
    }
    .stat-lbl {
      font-family: var(--font-mo);
      font-size: 10px;
      color: var(--muted);
      letter-spacing: 3px;
    }

    /* Error */
    .error-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 50vh;
      text-align: center;
      gap: var(--spacing-lg);
    }
    .error-page h1 {
      color: var(--danger);
      text-shadow: 0 0 12px rgba(255, 68, 102, 0.4);
    }
    .error-page p {
      font-size: 14px;
      color: var(--muted);
      max-width: 500px;
      line-height: 1.6;
    }
    :global(.error-link) {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--surface);
      border: 1px solid var(--neon);
      color: var(--neon);
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 2px;
      font-family: var(--font-mo);
      font-size: 12px;
      letter-spacing: 1.5px;
      transition: all 0.15s;
    }
    :global(.error-link:hover) {
      background: rgba(0, 255, 136, 0.1);
      box-shadow: 0 0 16px rgba(0, 255, 136, 0.3);
      text-decoration: none;
    }

    /* Records container */
    .records-container {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .record-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 2px;
      overflow: hidden;
    }

    @media (max-width: 600px) {
      .hero-inner { padding: 36px 20px 24px; }
      .hero-title { font-size: 15px; line-height: 1.6; }
      .stats-row { gap: 10px; }
      .stat-num { font-size: 22px; }
      .stat-lbl { font-size: 9px; letter-spacing: 2px; }
    }
  </style>
