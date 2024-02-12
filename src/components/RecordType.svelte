<script>
    export let recordType;
    export let correctScreenshotPath;
  
    const recordTypeMap = {
      "completed_at_difficulty": "Difficulty",
      "high_score": "Score",
      "low_score": "Score",
      "fastest_time": "Time",
      "longest_time": "Time"
    };
  
    const recordTypeToValue = (type) => recordTypeMap[type] || "";
  </script>
  
  <h2>{recordType.name}</h2>
  {#if recordType.description}
    <p><em>{recordType.description}</em></p>
  {/if}
  <table>
    <thead>
      <tr>
        <th>{recordTypeToValue(recordType.type)}</th>
        <th>Date</th>
        <th>Link</th>
      </tr>
    </thead>
    <tbody>
      {#each recordType.records as record}
      <tr>
        <td>{record.difficulty || record.score || record.time || '-'}</td>
        <td>{record.date}</td>
        <td>
          {#if record.screenshot}
          <a href={correctScreenshotPath(record.screenshot)} target="_blank">View</a>
          {:else}
          <span style="color: #ccc;">-</span>
          {/if}
        </td>
      </tr>
      {/each}
    </tbody>
  </table>
  