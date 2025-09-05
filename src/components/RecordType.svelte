<script>
    import Modal from './Modal.svelte';
    export let recordType;
    export let correctScreenshotPath;
    export let gameData;
  
    let showModal = false; // State to control the visibility of the modal
    let modalImageSrc = ''; // State to hold the current image src for the modal
    let expandedDescriptions = new Set(); // Track which record descriptions are expanded

    const recordTypeMap = {
      "completed_at_difficulty": "Difficulty",
      "high_score": "Score",
      "low_score": "Score",
      "fastest_time": "Time",
      "longest_time": "Time"
    };
  
    const recordTypeToValue = (type) => recordTypeMap[type] || "";

    const showScreenshotModal = (screenshotPath) => {
        modalImageSrc = correctScreenshotPath(screenshotPath);
        showModal = true;
    };

    function closeModal() {
      showModal = false;
    }

    function toggleDescription(index) {
      if (expandedDescriptions.has(index)) {
        expandedDescriptions.delete(index);
      } else {
        expandedDescriptions.add(index);
      }
      expandedDescriptions = expandedDescriptions; // Trigger reactivity
    }

    // Function to determine if a record is the "best" one
    function isBestRecord(record, index, records, type) {
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
  
  <div class="record-header">
    <h2>{recordType.name}</h2>
    {#if recordType.description}
      <p class="description">{recordType.description}</p>
    {/if}
    <div class="record-count">
      <span class="count-number">{recordType.records.length}</span>
      <span class="count-label">{recordType.records.length === 1 ? 'record' : 'records'}</span>
    </div>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          {#if recordType.type !== "completed"}
            <th>{recordTypeToValue(recordType.type)}</th>
          {/if}
          <th>Date</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {#each recordType.records as record, index}
        <tr class="record-row" class:has-screenshot={record.screenshot}>
          {#if recordType.type !== "completed"}
            <td class="value-cell" data-label="{recordTypeToValue(recordType.type)}">
              <span class="record-value">{record.difficulty || record.score || record.time || '-'}</span>
              {#if isBestRecord(record, index, recordType.records, recordType.type)}
                <span class="best-badge">BEST</span>
              {/if}
            </td>
          {/if}
          <td class="date-cell" data-label="Date">
            <span class="date-value">{record.date}</span>
          </td>
          <td class="screenshot-cell" data-label="Details">
            <div class="details-container">
              {#if record.screenshot}
                <button class="screenshot-btn" on:click={() => showScreenshotModal(record.screenshot)}>
                  <span>📷</span>
                  View Screenshot
                </button>
              {/if}
              {#if record.description}
                <button class="description-toggle" on:click={() => toggleDescription(index)}>
                  {expandedDescriptions.has(index) ? '▼' : '▶'} Description
                </button>
              {/if}
              {#if !record.screenshot && !record.description}
                <span class="no-details">No details</span>
              {/if}
            </div>
          </td>
        </tr>
        {#if record.description && expandedDescriptions.has(index)}
        <tr class="description-row">
          <td colspan={recordType.type !== "completed" ? "3" : "2"} class="description-content">
            {record.description}
          </td>
        </tr>
        {/if}
        {/each}
      </tbody>
    </table>
  </div>
  
  <Modal isVisible={showModal} imgSrc={modalImageSrc} onClose={closeModal}/>

  <style>
    /* Record Header */
    .record-header {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      position: relative;
    }

    .record-header h2 {
      margin: 0;
      color: var(--text-primary);
      border: none;
      padding: 0;
    }

    .description {
      color: var(--text-secondary);
      font-style: italic;
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .record-count {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--primary-color);
      color: white;
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-lg);
      font-size: 0.875rem;
      font-weight: 600;
      box-shadow: var(--shadow-md);
    }

    .count-number {
      font-size: 1.25rem;
      font-weight: 800;
      line-height: 1;
    }

    .count-label {
      font-size: 0.75rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Table Container */
    .table-container {
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border);
    }

    .table-container table {
      margin: 0;
      box-shadow: none;
      border-radius: 0;
    }

    /* Enhanced Table Rows */
    .record-row.has-screenshot {
      background: rgba(99, 102, 241, 0.02);
    }

    .record-row:hover.has-screenshot {
      background: rgba(99, 102, 241, 0.05);
    }

    /* Value Cell Enhancements */
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

    /* Date Cell */
    .date-value {
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* Details Container */
    .details-container {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      align-items: center;
      justify-content: flex-end;
    }

    /* Screenshot Button */
    .screenshot-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      background: var(--success-color);
      font-size: 0.75rem;
      font-weight: 600;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
      height: 28px;
    }

    .screenshot-btn:hover {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
    }

    .screenshot-btn span {
      font-size: 1rem;
    }

    .no-details {
      color: var(--text-muted);
      font-size: 0.85rem;
      font-style: italic;
    }

    /* Description Toggle */
    .description-toggle {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      height: 28px;
      display: flex;
      align-items: center;
    }

    .description-toggle:hover {
      background: #4338ca;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    }

    /* Description Row */
    .description-row {
      background: rgba(99, 102, 241, 0.03);
      border-top: none;
    }

    .description-content {
      padding: var(--spacing-md) var(--spacing-lg);
      color: var(--text-secondary);
      font-style: italic;
      line-height: 1.5;
      border-top: 1px solid rgba(99, 102, 241, 0.1);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .record-count {
        position: static;
        align-self: flex-start;
        margin-top: var(--spacing-sm);
      }

      .best-badge {
        position: static;
        transform: none;
        margin-left: var(--spacing-sm);
        display: inline-block;
      }
    }

    /* Mobile table stacking is handled by global.css */
    @media (max-width: 480px) {
      .record-header {
        text-align: center;
      }

      .record-count {
        align-self: center;
      }
      
      .details-container {
        flex-direction: column;
        align-items: center;
      }

      .screenshot-btn {
        justify-content: center;
        width: 100%;
      }

      .description-toggle {
        width: 100%;
        text-align: center;
      }

      .description-content {
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: 0.875rem;
      }
    }
  </style>