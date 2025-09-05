<script>
  import {Router, Route, Link} from 'svelte-routing';
  import GameDetails from './routes/GameDetails.svelte';
  import Home from './routes/Home.svelte'

  import { onMount } from 'svelte';
  import { gameRecords, isLoading, basePath, createSlug } from './stores.js'

  onMount(async () => {
      console.log('App.svelte: onMount started');
      console.log('App.svelte: basePath:', $basePath);
      
      // Handle hash-based redirects from 404.html
      if (window.location.hash && window.location.hash.startsWith('#/')) {
        const hashPath = window.location.hash.slice(1);
        console.log('App.svelte: Detected hash redirect, navigating to:', hashPath);
        // Remove hash and use regular routing
        window.history.replaceState(null, '', `${$basePath}${hashPath}`);
      }
      
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

<Router basepath={$basePath}>
  <header>
    <nav class="navbar">
      <div class="nav-container">
        <Link to="/" class="nav-brand">
          <span class="brand-text">MiScore</span>
          <span class="brand-subtitle">Gaming Records</span>
        </Link>
        <div class="nav-links">
          <Link to="/" class="nav-link">
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

<style>
  /* Header and Navigation */
  header {
    background: linear-gradient(135deg, var(--surface), var(--surface-light));
    border-bottom: 2px solid var(--primary-color);
    box-shadow: var(--shadow-lg);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .navbar {
    padding: var(--spacing-md) 0;
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  :global(.nav-brand) {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: var(--text-primary);
    transition: all 0.2s ease;
  }

  :global(.nav-brand:hover) {
    color: var(--primary-color);
    text-decoration: none;
    transform: translateY(-1px);
  }

  .brand-text {
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }

  .brand-subtitle {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: var(--spacing-xs);
  }

  .nav-links {
    display: flex;
    gap: var(--spacing-lg);
  }

  :global(.nav-link) {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
    font-size: 0.95rem;
  }

  :global(.nav-link:hover) {
    color: var(--primary-color);
    background: rgba(99, 102, 241, 0.1);
    text-decoration: none;
    transform: translateY(-1px);
  }

  :global(.nav-link span) {
    font-size: 1.1rem;
  }

  /* App Main Content */
  .app-main {
    min-height: calc(100vh - 80px);
  }

  /* Enhanced Loading State */
  .loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    gap: var(--spacing-lg);
  }

  .loading p {
    font-size: 1.25rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--surface-light);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive Navigation */
  @media (max-width: 768px) {
    .nav-container {
      padding: 0 var(--spacing-sm);
    }

    .brand-text {
      font-size: 1.5rem;
    }

    .nav-links {
      gap: var(--spacing-md);
    }

    :global(.nav-link) {
      padding: var(--spacing-sm);
      font-size: 0.875rem;
    }

    :global(.nav-link span) {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .nav-container {
      flex-direction: column;
      gap: var(--spacing-md);
      text-align: center;
    }

    .nav-links {
      justify-content: center;
    }

    :global(.nav-link span) {
      display: inline;
    }
  }
</style>
