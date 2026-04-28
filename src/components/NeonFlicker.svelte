<script>
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';

  export let text = '';
  export let tag = 'span';
  let className = '';
  export { className as class };

  let chars = text.split('');
  const opacity = writable(chars.map(() => 1));
  const timeouts = new Set();
  let cancelled = false;

  // Reset when text prop changes (gated so flicker writes don't retrigger it)
  let lastText = text;
  $: if (text !== lastText) {
    lastText = text;
    chars = text.split('');
    opacity.set(chars.map(() => 1));
  }

  // Group chars into word/space segments to prevent mid-word line breaks
  $: segments = (() => {
    const result = [];
    let idx = 0;
    for (const token of text.split(/(\s+)/)) {
      if (!token) continue;
      result.push({
        isSpace: /^\s+$/.test(token),
        chars: token.split('').map(char => ({ char, idx: idx++ }))
      });
    }
    return result;
  })();

  const setOpacity = (idx, v) => {
    opacity.update(s => {
      if (idx < 0 || idx >= s.length) return s;
      const n = s.slice();
      n[idx] = v;
      return n;
    });
  };

  const schedule = (fn, delay) => {
    const t = setTimeout(() => {
      timeouts.delete(t);
      if (!cancelled) fn();
    }, delay);
    timeouts.add(t);
    return t;
  };

  const runSequence = (idx, seq, baseDelay, jitter) => {
    let step = 0;
    const tick = () => {
      setOpacity(idx, seq[step]);
      step++;
      if (step < seq.length) schedule(tick, baseDelay + Math.random() * jitter);
    };
    tick();
  };

  const pickIdx = (cands, exclude = -1) => {
    if (!cands.length) return -1;
    const pool = exclude >= 0 && cands.length > 1 ? cands.filter(c => c !== exclude) : cands;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // each style varies which letters, how deep, and how long the flicker runs
  const styles = [
    // quick single dim — the prototype's basic flicker
    (cands) => {
      runSequence(pickIdx(cands), [0.35, 0.08, 0.5, 1], 45, 70);
    },
    // harsh brownout — long struggling flicker
    (cands) => {
      runSequence(pickIdx(cands), [0.2, 0.05, 0.3, 0.05, 0.45, 0.1, 0.6, 1], 60, 100);
    },
    // soft pulse — barely noticeable dip
    (cands) => {
      runSequence(pickIdx(cands), [0.75, 0.6, 0.85, 1], 90, 60);
    },
    // rapid stutter — sharp repeated cuts
    (cands) => {
      runSequence(pickIdx(cands), [0.1, 1, 0.15, 1, 0.25, 1], 28, 38);
    },
    // double letter cascade — two letters flicker in close succession
    (cands) => {
      const a = pickIdx(cands);
      const b = pickIdx(cands, a);
      runSequence(a, [0.3, 0.08, 0.5, 1], 45, 70);
      schedule(() => runSequence(b, [0.3, 0.08, 0.5, 1], 45, 70), 50 + Math.random() * 120);
    },
    // slow fade — dims and gradually recovers
    (cands) => {
      runSequence(pickIdx(cands), [0.55, 0.4, 0.5, 0.65, 0.8, 1], 110, 90);
    },
    // triple cluster — short burst across three letters
    (cands) => {
      const a = pickIdx(cands);
      const b = pickIdx(cands, a);
      const c = pickIdx(cands, b);
      runSequence(a, [0.25, 0.6, 1], 40, 50);
      schedule(() => runSequence(b, [0.2, 0.55, 1], 40, 50), 30 + Math.random() * 60);
      schedule(() => runSequence(c, [0.3, 0.65, 1], 40, 50), 80 + Math.random() * 90);
    },
  ];

  const scheduleNext = () => {
    const delay = 1400 + Math.random() * 5600;
    schedule(() => {
      const cands = chars
        .map((c, i) => (/\s/.test(c) ? -1 : i))
        .filter(i => i >= 0);
      if (cands.length) {
        const style = styles[Math.floor(Math.random() * styles.length)];
        style(cands);
      }
      scheduleNext();
    }, delay);
  };

  onMount(() => {
    scheduleNext();
  });

  onDestroy(() => {
    cancelled = true;
    timeouts.forEach(t => clearTimeout(t));
    timeouts.clear();
  });
</script>

<svelte:element this={tag} class={className} aria-label={text}>
  {#each segments as seg}
    {#if seg.isSpace}
      {#each seg.chars as {char, idx}}
        <span class="space" style="opacity:{$opacity[idx] ?? 1}">{char}</span>
      {/each}
    {:else}
      <span class="word">
        {#each seg.chars as {char, idx}}
          <span style="opacity:{$opacity[idx] ?? 1}">{char}</span>
        {/each}
      </span>
    {/if}
  {/each}
</svelte:element>

<style>
  span {
    display: inline-block;
    transition: opacity 0.04s linear;
  }
  span.space {
    white-space: pre;
  }
  span.word {
    white-space: nowrap;
  }
</style>
