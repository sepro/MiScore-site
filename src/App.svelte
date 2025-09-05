<script>
  import {Router, Route, Link} from 'svelte-routing';
  import GameDetails from './routes/GameDetails.svelte';
  import Home from './routes/Home.svelte'

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
    <nav class="navbar">
      <div class="nav-container">
        <Link to="{$basePath || '/'}" class="nav-brand">
          <span class="brand-text">MiScore</span>
          <span class="brand-subtitle">Gaming Records</span>
        </Link>
        <div class="nav-links">
          <Link to="{$basePath || '/'}" class="nav-link">
            <span>🏠</span>
            Home
          </Link>
        </div>
      </div>
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
      <Route path="/game/:slug" let:params>
        <GameDetails slug={params.slug} />
      </Route>
    {/if}
  </main>
</Router>