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
    let modalMeta = [];
    let expandedDescriptions = new Set(); // Track which record descriptions are expanded

    const recordTypeMap = {
      "completed_at_difficulty": "Difficulty",
      "high_score": "Score",
      "low_score": "Score",
      "fastest_time": "Time",
      "longest_time": "Time"
    };

    const recordTypeToValue = (type) => recordTypeMap[type] || "";

    function recordValue(record, type) {
      if (type === 'completed_at_difficulty') return record.difficulty;
      if (type === 'high_score' || type === 'low_score') return record.score;
      if (type === 'fastest_time' || type === 'longest_time') return record.time;
      return record.difficulty || record.score || record.time;
    }

    const showScreenshotModal = (record) => {
        modalImageSrc = correctScreenshotPath(record.screenshot);
        const valueLabel = (recordTypeToValue(recordType.type) || 'VALUE').toUpperCase();
        modalMeta = [
          { label: 'GAME', value: gameData?.name },
          { label: valueLabel, value: recordValue(record, recordType.type) },
          { label: 'DATE', value: record.date },
          { label: 'TYPE', value: recordType.name },
        ];
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
  
  <div class="rec-group-head">
    <div class="rec-group-text">
      <h2 class="rec-group-title">{recordType.name}</h2>
      {#if recordType.description}
        <p class="rec-group-desc">{recordType.description}</p>
      {/if}
    </div>
    <div class="rec-badge">
      {recordType.records.length}
      <span>{recordType.records.length === 1 ? 'RECORD' : 'RECORDS'}</span>
    </div>
  </div>

  <div class="rec-table">
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

  <Modal isVisible={showModal} imgSrc={modalImageSrc} meta={modalMeta} onClose={closeModal}/>

  <style>
    .rec-group-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-md);
      padding: 18px 20px;
      border-bottom: 1px solid var(--border);
    }

    .rec-group-text {
      flex: 1;
      min-width: 0;
    }

    .rec-group-title {
      font-family: var(--font-px);
      font-size: 10px;
      color: var(--text);
      letter-spacing: 1px;
      margin: 0 0 6px 0;
      line-height: 1.8;
    }

    .rec-group-desc {
      font-family: var(--font-mo);
      font-size: 12px;
      color: var(--muted);
      margin: 0;
      line-height: 1.5;
    }

    .rec-badge {
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid var(--neon);
      color: var(--neon);
      font-family: var(--font-px);
      font-size: 16px;
      padding: 10px 14px;
      border-radius: 2px;
      text-align: center;
      min-width: 64px;
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.18);
      flex-shrink: 0;
      line-height: 1.2;
    }

    .rec-badge span {
      display: block;
      font-size: 7px;
      color: var(--muted);
      margin-top: 4px;
      letter-spacing: 2px;
    }

    .rec-table {
      /* The SortableTable wrapper already gets its own border; let the group card frame it. */
    }

    /* Strip the inner table wrapper border — the outer group card already frames it. */
    .rec-table :global(.tbl-wrap) {
      border: none;
      border-radius: 0;
      background: transparent;
    }

    .description-content {
      color: var(--muted);
      font-style: italic;
      line-height: 1.5;
      font-size: 13px;
    }

    @media (max-width: 600px) {
      .rec-group-head { flex-direction: column; align-items: flex-start; }
      .rec-badge { align-self: flex-start; }
    }
  </style>