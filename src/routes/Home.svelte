<script>
    import '../global.css';
    import { Link } from 'svelte-routing';
    import { gameRecords } from '../stores.js'

    let records = [];

    function aggregateRecords(games) {
      return games.map(game => ({
        name: game.name,
        recordCount: game.record_types.reduce((sum, type) => sum + type.records.length, 0)
      }));
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
        {#each records as game, gameIdx}
          <tr>
            <td><Link to="/game/{gameIdx}">{game.name}</Link></td>
            <td>{game.recordCount}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </main>