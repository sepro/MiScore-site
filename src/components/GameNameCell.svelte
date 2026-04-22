<script>
  import { Link } from 'svelte-routing';
  import { basePath, searchQuery } from '../stores.js';
  import HighlightText from './HighlightText.svelte';

  export let row;
</script>

<Link to="{$basePath}/game/{row.slug}" class="game-name-link">
  <HighlightText text={row.name} searchQuery={$searchQuery} />
</Link>

<style>
  :global(.game-name-link) {
    color: rgba(0, 212, 255, 0.85);
    text-decoration: none;
    transition: color 0.14s, text-shadow 0.14s;
    font-family: var(--font-mo);
  }
  :global(tbody tr:hover .game-name-link),
  :global(.game-name-link:hover) {
    color: var(--cyan);
    text-shadow: 0 0 6px var(--cyan);
    text-decoration: none;
  }
</style>
