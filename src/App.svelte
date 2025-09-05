<script>
  import {Router, Route, Link} from 'svelte-routing';
  import GameDetails from './routes/GameDetails.svelte';
  import Home from './routes/Home.svelte'

  import { onMount } from 'svelte';
  import { gameRecords, isLoading, basePath } from './stores.js'

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
        
        $gameRecords = data.games;
        console.log('App.svelte: gameRecords store updated');
        
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
  <nav>
    <Link to="/">Home</Link>
  </nav>
  <div>
    {#if $isLoading}
      <p>Loading...</p>
    {:else}
      <Route path="/" component={Home} />
      <Route path="/game/:id" let:params>
        <GameDetails id={params.id} />
      </Route>
    {/if}
  </div>
</Router>

<style>
  nav {
    background-color: #333; /* Dark background for the navbar */
    padding: 1rem;
    text-align: center;
  }

  nav :global(a) { /* Styles for Link components, which render as <a> tags */
    color: white; /* Light text color for contrast */
    margin: 0 1rem; /* Space out links */
    text-decoration: none; /* No underlines on links */
    font-size: 1.2rem; /* Slightly larger text */
    transition: color 0.3s; /* Smooth transition for hover effect */
  }

  nav :global(a):hover {
    color: #ddd; /* Lighter color on hover for feedback */
  }
</style>
