<script>
  export let row;
  
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
  <span class="record-value">{row.difficulty || row.score || row.time || '-'}</span>
  {#if isBestRecord(row, row._index, row._records, row._type, row._gameData)}
    <span class="best-badge">BEST</span>
  {/if}
</div>

<style>
  .value-cell {
    position: relative;
    font-weight: 600;
    font-size: 1.05rem;
  }

  .record-value {
    color: var(--primary-color);
    font-weight: 700;
  }

  .best-badge {
    position: absolute;
    right: var(--spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    background: var(--success-color);
    color: white;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: var(--shadow-sm);
    height: 28px;
    display: flex;
    align-items: center;
  }

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .best-badge {
      position: static;
      transform: none;
      margin-left: var(--spacing-sm);
      display: inline-block;
    }
  }
</style>