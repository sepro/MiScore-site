<script>
  import {Router, Route, Link} from 'svelte-routing';
  import GameDetails from './routes/GameDetails.svelte';
  import Home from './routes/Home.svelte';
  import RecentRecords from './routes/RecentRecords.svelte';

  import { onMount } from 'svelte';
  import { gameRecords, isLoading, basePath, createSlug } from './stores.js'

  onMount(async () => {
      console.log('App.svelte: onMount started');
      console.log('App.svelte: basePath:', $basePath);


      const url = `${$basePath}/records/data/records.json`;
      console.log('App.svelte: attempting to fetch from:', url);

      try {
        const response = await fetch(url);
        console.log('App.svelte: fetch response status:', response.status);
        console.log('App.svelte: fetch response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('App.svelte: parsed JSON data:', data);
        console.log('App.svelte: games array length:', data.games?.length || 'undefined');

        // Add slugs to game data
        const gamesWithSlugs = data.games.map((game, index) => ({
          ...game,
          slug: createSlug(game.name),
          originalIndex: index // Keep for backward compatibility if needed
        }));

        $gameRecords = gamesWithSlugs;
        console.log('App.svelte: gameRecords store updated with slugs');

        isLoading.set(false);
        console.log('App.svelte: loading state set to false');
      } catch (error) {
        console.error('App.svelte: Error loading records:', error);
        isLoading.set(false);
        console.log('App.svelte: loading state set to false due to error');
      }
    });
</script>

<Router hash={true} basepath={$basePath || undefined}>
  <header>
    <nav class="nav">
      <Link to="{$basePath || '/'}" class="nav-logo">
        <span class="nav-logo-main">MiScore</span>
        <span class="nav-logo-sub">GAMING RECORDS</span>
      </Link>
      <Link to="{$basePath}/recent" class="nav-btn">
        <span class="nav-pulse"></span>
        RECENT RECORDS
      </Link>
    </nav>
  </header>

  <main class="app-main">
    {#if $isLoading}
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Loading gaming records...</p>
      </div>
    {:else}
      <Route path="/" component={Home} />
      <Route path="/recent" component={RecentRecords} />
      <Route path="/game/:slug" let:params>
        <GameDetails slug={params.slug} />
      </Route>
    {/if}
  </main>
</Router>

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 200;
    background: rgba(6, 6, 14, 0.96);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }

  .nav {
    height: 56px;
    padding: 0 40px;
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--neon) 20%,
      var(--cyan) 50%,
      var(--neon) 80%,
      transparent 100%
    );
    opacity: 0;
    animation: nav-scan 5s linear infinite;
    pointer-events: none;
  }
  @keyframes nav-scan {
    0%   { opacity: 0; background-position: -100% 0; }
    10%  { opacity: 0.5; }
    90%  { opacity: 0.5; }
    100% { opacity: 0; background-position: 200% 0; }
  }

  :global(.nav-logo) {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-decoration: none;
  }
  :global(.nav-logo:hover) {
    text-decoration: none;
  }
  .nav-logo-main {
    font-family: var(--font-px);
    font-size: 13px;
    color: var(--neon);
    text-shadow: 0 0 8px var(--neon), 0 0 22px rgba(0, 255, 136, 0.35);
    letter-spacing: 1px;
  }
  .nav-logo-sub {
    font-family: var(--font-mo);
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 4px;
  }

  :global(.nav-btn) {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mo);
    font-size: 12px;
    letter-spacing: 1.5px;
    color: var(--muted);
    cursor: pointer;
    background: none;
    border: 1px solid transparent;
    padding: 6px 14px;
    border-radius: 2px;
    transition: all 0.18s;
    text-decoration: none;
  }
  :global(.nav-btn:hover),
  :global(.nav-btn.active) {
    color: var(--cyan);
    border-color: rgba(0, 212, 255, 0.3);
    text-shadow: 0 0 8px var(--cyan);
    text-decoration: none;
  }

  .nav-pulse {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--cyan);
    box-shadow: 0 0 6px var(--cyan);
    animation: pdot 2.2s ease infinite;
  }
  @keyframes pdot {
    0%, 100% { box-shadow: 0 0 4px var(--cyan); }
    50%      { box-shadow: 0 0 10px var(--cyan), 0 0 20px var(--cyan); }
  }

  .app-main {
    position: relative;
    z-index: 2;
    min-height: calc(100vh - 56px);
  }

  @media (max-width: 600px) {
    .nav { padding: 0 20px; }
    .nav-logo-sub { letter-spacing: 2px; }
    :global(.nav-btn) { font-size: 10px; padding: 6px 10px; letter-spacing: 1px; }
  }
</style>
