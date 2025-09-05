<script>
    import '../global.css';
    import { Link } from 'svelte-routing';
    import { gameRecords, basePath } from '../stores.js'

    let records = [];

    function aggregateRecords(games) {
      return games.map((game, index) => ({
        name: game.name,
        recordCount: game.record_types.reduce((sum, type) => sum + type.records.length, 0),
        originalIndex: index
      })).sort((a, b) => {
        const nameA = a.name.replace(/^The /i, '');
        const nameB = b.name.replace(/^The /i, '');
        return nameA.localeCompare(nameB);
      });
    }

    $: {
        records = aggregateRecords($gameRecords)
    }
</script>

<main>
    <h1>Game Records Overview</h1>
    <table>
      <thead>
        <tr>
          <th>Game</th>
          <th>Record Count</th>
        </tr>
      </thead>
      <tbody>
        {#each records as game}
          <tr>
            <td><Link to="{$basePath}/game/{game.originalIndex}">{game.name}</Link></td>
            <td>{game.recordCount}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </main>