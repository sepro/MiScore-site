<script>
    import '../global.css';
    import { gameRecords, basePath } from '../stores.js';
    import RecordType from '../components/RecordType.svelte';
  
    export let id;
    let gameData = {};

    $: gameData = $gameRecords[id];
  
    const correctScreenshotPath = (path) => {
        if (!path) return path;
        const fullPath = path.startsWith('/records/data/') ? path : `/records/data/${path}`;
        return `${$basePath}${fullPath}`;
    };
  </script>
  
  <main>
    <h1>{gameData.name}</h1>
    {#each gameData.record_types as recordType}
      <RecordType {recordType} {correctScreenshotPath} />
    {/each}
  </main>
  