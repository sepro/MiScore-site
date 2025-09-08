<script>
  import { Link } from 'svelte-routing';
  import { basePath, searchQuery } from '../stores.js';
  import HighlightText from './HighlightText.svelte';
  
  export let row;
</script>

<Link to="{$basePath}/game/{row.slug}">
  <HighlightText text={row.name} searchQuery={$searchQuery} />
</Link>