<script>
  export let row;
  export let componentType = null; // For "complex" record types, overrides row._type per column

  $: effectiveType = componentType || row._type;

  // Import the isBestRecord function logic
  function isBestRecord(record, index, records, type, gameData) {
    if (type === "completed_at_difficulty") {
      // For difficulty-based records, find the record with the hardest difficulty
      if (!gameData?.difficulties) return index === 0; // fallback to first if no difficulties array
      
      let bestDifficultyIndex = -1;
      let bestRecordIndex = -1;
      
      records.forEach((r, i) => {
        const difficultyIndex = gameData.difficulties.indexOf(r.difficulty);
        if (difficultyIndex > bestDifficultyIndex) {
          bestDifficultyIndex = difficultyIndex;
          bestRecordIndex = i;
        }
      });
      
      return index === bestRecordIndex;
    }
    
    if (type === "fastest_time") {
      // For fastest time, find the record with the smallest time
      if (records.length <= 1) return true;
      
      let bestTime = null;
      let bestRecordIndex = -1;
      
      records.forEach((r, i) => {
        if (r.time) {
          // Convert time string (HH:MM:SS or MM:SS) to seconds for comparison
          const timeParts = r.time.split(':').map(Number);
          let timeInSeconds;
          if (timeParts.length === 3) {
            // HH:MM:SS format
            timeInSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
          } else if (timeParts.length === 2) {
            // MM:SS format
            timeInSeconds = timeParts[0] * 60 + timeParts[1];
          } else {
            return; // Invalid time format
          }
          
          if (bestTime === null || timeInSeconds < bestTime) {
            bestTime = timeInSeconds;
            bestRecordIndex = i;
          }
        }
      });
      
      return index === bestRecordIndex;
    }
    
    if (type === "longest_time") {
      // For longest time, find the record with the largest time
      if (records.length <= 1) return true;
      
      let bestTime = -1;
      let bestRecordIndex = -1;
      
      records.forEach((r, i) => {
        if (r.time) {
          // Convert time string (HH:MM:SS or MM:SS) to seconds for comparison
          const timeParts = r.time.split(':').map(Number);
          let timeInSeconds;
          if (timeParts.length === 3) {
            // HH:MM:SS format
            timeInSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
          } else if (timeParts.length === 2) {
            // MM:SS format
            timeInSeconds = timeParts[0] * 60 + timeParts[1];
          } else {
            return; // Invalid time format
          }
          
          if (timeInSeconds > bestTime) {
            bestTime = timeInSeconds;
            bestRecordIndex = i;
          }
        }
      });
      
      return index === bestRecordIndex;
    }
    
    if (type === "high_score") {
      // For high score, find the record with the highest score
      if (records.length <= 1) return true;
      
      let bestScore = -1;
      let bestRecordIndex = -1;
      
      records.forEach((r, i) => {
        if (r.score) {
          const score = parseInt(r.score, 10);
          if (!isNaN(score) && score > bestScore) {
            bestScore = score;
            bestRecordIndex = i;
          }
        }
      });
      
      return index === bestRecordIndex;
    }
    
    if (type === "low_score") {
      // For low score, find the record with the lowest score
      if (records.length <= 1) return true;
      
      let bestScore = Infinity;
      let bestRecordIndex = -1;
      
      records.forEach((r, i) => {
        if (r.score) {
          const score = parseInt(r.score, 10);
          if (!isNaN(score) && score < bestScore) {
            bestScore = score;
            bestRecordIndex = i;
          }
        }
      });
      
      return index === bestRecordIndex;
    }
    
    // For any other types or fallback, don't show the badge
    return false;
  }
</script>

<div class="value-cell">
  <span class="record-value">
    {#if effectiveType === 'completed_at_difficulty'}
      {row.difficulty || '-'}
    {:else if effectiveType === 'high_score' || effectiveType === 'low_score'}
      {row.score ?? '-'}
    {:else if effectiveType === 'fastest_time' || effectiveType === 'longest_time'}
      {row.time || '-'}
    {:else}
      {row.difficulty || row.score || row.time || '-'}
    {/if}
  </span>
  {#if isBestRecord(row, row._index, row._records, effectiveType, row._gameData)}
    <span class="best-badge">BEST</span>
  {/if}
</div>

<style>
  .value-cell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mo);
  }

  .record-value {
    color: var(--cyan);
    font-size: 14px;
  }

  .best-badge {
    background: rgba(153, 102, 255, 0.13);
    border: 1px solid var(--purple);
    color: var(--purple);
    font-family: var(--font-px);
    font-size: 7px;
    padding: 3px 6px;
    border-radius: 1px;
    letter-spacing: 1px;
    text-shadow: 0 0 6px var(--purple);
    box-shadow: 0 0 5px rgba(153, 102, 255, 0.18);
    white-space: nowrap;
  }
</style>