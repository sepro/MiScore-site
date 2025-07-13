<script>
  import {Router, Route, Link} from 'svelte-routing';
  import GameDetails from './routes/GameDetails.svelte';
  import Home from './routes/Home.svelte'

  import { onMount } from 'svelte';
  import { gameRecords, isLoading } from './stores.js'

  onMount(async () => {
      const response = await fetch('./records/data/records.json');
      const data = await response.json();
      $gameRecords = data.games;
      isLoading.set(false);
    });
</script>

<Router>
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
