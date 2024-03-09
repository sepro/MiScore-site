<script>
    import Modal from './Modal.svelte';
    export let recordType;
    export let correctScreenshotPath;
  
    let showModal = false; // State to control the visibility of the modal
    let modalImageSrc = ''; // State to hold the current image src for the modal

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
          <button on:click={() => showScreenshotModal(record.screenshot)}>View</button>
          {:else}
          <span style="color: #ccc;">-</span>
          {/if}
        </td>
      </tr>
      {/each}
    </tbody>
  </table>
  
  <Modal isVisible={showModal} imgSrc={modalImageSrc} onClose={closeModal}/>