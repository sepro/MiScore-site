<script>
  export let text = '';
  export let searchQuery = '';
  export let highlightClass = 'highlight';

  function highlightMatches(text, query) {
    if (!text || !query || !query.trim()) {
      return [{ text, highlighted: false }];
    }

    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => ({
      text: part,
      highlighted: regex.test(part) && part.toLowerCase() === query.toLowerCase()
    }));
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  $: highlightedParts = highlightMatches(text, searchQuery);
</script>

{#each highlightedParts as part}
  {#if part.highlighted}
    <span class={highlightClass}>{part.text}</span>
  {:else}
    {part.text}
  {/if}
{/each}

<style>
  :global(.highlight) {
    background: linear-gradient(135deg, var(--warning-color), #fbbf24);
    color: var(--background);
    padding: 0.125rem 0.25rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
  }
</style>