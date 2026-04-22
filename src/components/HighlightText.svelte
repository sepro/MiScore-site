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
    background: rgba(255, 170, 0, 0.18);
    color: var(--amber);
    padding: 0.05rem 0.2rem;
    border-radius: 1px;
    font-weight: 600;
    text-shadow: 0 0 6px rgba(255, 170, 0, 0.4);
  }
</style>