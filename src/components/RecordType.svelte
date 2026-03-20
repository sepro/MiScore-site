<script>
    import Modal from './Modal.svelte';
    import SortableTable from './SortableTable.svelte';
    import RecordValueCell from './RecordValueCell.svelte';
    import RecordDateCell from './RecordDateCell.svelte';
    import RecordDetailsCell from './RecordDetailsCell.svelte';
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

    // Prepare data for SortableTable
    $: tableData = recordType.records.map((record, index) => ({
      ...record,
      _index: index,
      _records: recordType.records,
      _type: recordType.type,
      _gameData: gameData
    }));

    const componentToColumnConfig = (component) => {
      const key = component === "completed_at_difficulty" ? "difficulty" :
                  component === "high_score" || component === "low_score" ? "score" : "time";
      const label = component === "completed_at_difficulty" ? "Difficulty" :
                    component === "high_score" || component === "low_score" ? "Score" : "Time";
      const dataType = component === "completed_at_difficulty" ? "difficulty" :
                       component === "high_score" || component === "low_score" ? "score" : "time";
      return { key, label, dataType, component: RecordValueCell, componentProps: { componentType: component } };
    };

    // Configure columns based on record type
    $: columns = [
      // Value columns - one per component for "complex" type, or single column for simple types
      ...(recordType.type === "complex"
        ? (recordType.components || []).map(componentToColumnConfig)
        : recordType.type !== "completed" ? [{
            key: recordType.type === "completed_at_difficulty" ? "difficulty" :
                 recordType.type === "high_score" || recordType.type === "low_score" ? "score" : "time",
            label: recordTypeToValue(recordType.type),
            component: RecordValueCell,
            dataType: recordType.type === "completed_at_difficulty" ? "difficulty" :
                       recordType.type === "high_score" || recordType.type === "low_score" ? "score" :
                       recordType.type === "fastest_time" || recordType.type === "longest_time" ? "time" : "string"
          }] : []),
      // Date column
      {
        key: "date",
        label: "Date", 
        component: RecordDateCell,
        dataType: "date"
      },
      // Details column (non-sortable)
      {
        key: "details",
        label: "Details",
        component: RecordDetailsCell,
        sortable: false,
        componentProps: {
          showScreenshotModal,
          toggleDescription,
          expandedDescriptions
        }
      }
    ];
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
    <SortableTable 
      data={tableData}
      {columns}
      {gameData}
      initialSortColumn="date"
      initialSortDirection="desc"
      tableClass="records-table"
      expandableRows={true}
      expandedRows={expandedDescriptions}
      getRowId={(row) => row._index}
    >
      <div slot="expanded-content" let:row class="description-content">
        {row.description}
      </div>
    </SortableTable>
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

    /* Description content (shown in expanded rows) */
    .description-content {
      color: var(--text-secondary);
      font-style: italic;
      line-height: 1.5;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .record-count {
        position: static;
        align-self: flex-start;
        margin-top: var(--spacing-sm);
      }
    }

    @media (max-width: 480px) {
      .record-header {
        text-align: center;
      }

      .record-count {
        align-self: center;
      }

      :global(.expanded-content .description-content) {
        font-size: 0.875rem;
      }
    }
  </style>