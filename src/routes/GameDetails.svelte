<script>
    import '../global.css';
    import { gameRecords } from '../stores.js';
    import RecordType from '../components/RecordType.svelte';
  
    export let id;
    let gameData = {};

    $: gameData = $gameRecords[id];
  
    const correctScreenshotPath = (path) => path && !path.startsWith('/data/') ? `/data/${path}` : path;
  </script>
  
  <main>
    <h1>{gameData.name}</h1>
    {#each gameData.record_types as recordType}
      <RecordType {recordType} {correctScreenshotPath} />
    {/each}
  </main>
  