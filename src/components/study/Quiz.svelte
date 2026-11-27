<script lang="ts">
  import { fmt } from './fmt';
  import Icon from '../icons/Icon.svelte';

  type Question = {
    q: string;
    options: string[];
    /** index of the right option, or several indexes for "pick all that apply" */
    answer: number | number[];
    why?: string;
  };
  let { questions, title = 'Pop quiz' }: { questions: Question[]; title?: string } = $props();

  const correctSet = (q: Question) => new Set(Array.isArray(q.answer) ? q.answer : [q.answer]);
  const isMulti = (q: Question) => Array.isArray(q.answer);

  const freshPicks = () => questions.map((): number[] => []);
  const freshChecks = () => questions.map(() => false);

  let picked = $state<number[][]>(freshPicks());
  let checked = $state<boolean[]>(freshChecks());

  function isRight(i: number) {
    const want = correctSet(questions[i]);
    const got = picked[i];
    return got.length === want.size && got.every((g) => want.has(g));
  }

  let answered = $derived(checked.filter(Boolean).length);
  let score = $derived(checked.reduce((n, c, i) => n + (c && isRight(i) ? 1 : 0), 0));
  let allDone = $derived(answered === questions.length);
  let perfect = $derived(allDone && score === questions.length);

  function choose(qi: number, oi: number) {
    if (checked[qi]) return;
    if (isMulti(questions[qi])) {
      picked[qi] = picked[qi].includes(oi) ? picked[qi].filter((x) => x !== oi) : [...picked[qi], oi];
    } else {
      picked[qi] = [oi];
      checked[qi] = true;
    }
  }

  function reset() {
    picked = freshPicks();
    checked = freshChecks();
  }

  const confetti = ['sparkles', 'music-note', 'circle-check', 'bolt'];
</script>

<section class="quiz" aria-label={title}>
  <header>
    <span class="eyebrow"><Icon name="dice" size={20} />{title}</span>
    <span class="score">{score} / {questions.length}</span>
  </header>

  {#each questions as q, qi (q.q)}
    <div class="q">
      <p class="prompt"><span class="num">{qi + 1}</span>{@html fmt(q.q)}</p>
      {#if isMulti(q)}<p class="multi">Pick all that apply</p>{/if}
      <div class="opts">
        {#each q.options as opt, oi (opt)}
          {@const sel = picked[qi].includes(oi)}
          {@const right = correctSet(q).has(oi)}
          <button
            type="button"
            class={[
              'opt',
              sel && 'sel',
              checked[qi] && right && 'right',
              checked[qi] && sel && !right && 'wrong',
            ]}
            disabled={checked[qi]}
            aria-pressed={sel}
            onclick={() => choose(qi, oi)}
          >
            <span class="letter">{String.fromCharCode(65 + oi)}</span>
            <span>{@html fmt(opt)}</span>
            {#if checked[qi] && right}<span class="mark">✓</span>{:else if checked[qi] && sel}<span class="mark">✗</span>{/if}
          </button>
        {/each}
      </div>
      {#if isMulti(q) && !checked[qi]}
        <button type="button" class="check" disabled={picked[qi].length === 0} onclick={() => (checked[qi] = true)}>Check</button>
      {/if}
      {#if checked[qi]}
        <p class={['feedback', isRight(qi) ? 'ok' : 'bad']}>
          <strong>{isRight(qi) ? 'Nice! ' : 'Not quite. '}</strong>{#if q.why}{@html fmt(q.why)}{/if}
        </p>
      {/if}
    </div>
  {/each}

  {#if allDone}
    <div class="end">
      {#if perfect}
        <div class="burst" aria-hidden="true">
          {#each Array.from({ length: 18 }, (_, i) => i) as i (i)}
            <span style:--x="{(i * 37) % 100}%" style:--d="{(i % 6) * 0.08}s"><Icon name={confetti[i % confetti.length]} size={20} /></span>
          {/each}
        </div>
        <p class="big">Perfect score! You're on fire.</p>
      {:else}
        <p class="big">{score} / {questions.length}. Replay to beat it?</p>
      {/if}
      <button type="button" class="check" onclick={reset}>↺ Replay quiz</button>
    </div>
  {/if}
</section>

<style>
  .quiz {
    position: relative;
    margin-block: 2em;
    padding: 1.1em 1.2em 1.2em;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--card);
    overflow: hidden;
  }
  header {
    display: flex;
    align-items: center;
    margin-bottom: 0.4em;
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--secondary);
  }
  .score {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--muted-foreground);
    font-variant-numeric: tabular-nums;
  }
  .q {
    padding: 1em 0;
    border-top: 1px solid var(--border);
  }
  .q:first-of-type {
    border-top: 0;
  }
  .prompt {
    display: flex;
    gap: 0.6em;
    margin: 0 0 0.7em !important;
    color: var(--foreground);
    line-height: 1.5;
  }
  .num {
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--muted-foreground);
    padding-top: 0.3em;
    min-width: 1.4em;
  }
  .multi {
    margin: -0.4em 0 0.6em 2em !important;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--primary);
  }
  .opts {
    display: grid;
    gap: 0.4em;
    padding-left: 2em;
  }
  .opt {
    display: flex;
    align-items: center;
    gap: 0.7em;
    text-align: left;
    background: var(--background);
    color: var(--foreground);
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    padding: 0.55em 0.8em;
    font: inherit;
    font-size: 0.95em;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .opt:hover:not(:disabled) {
    border-color: var(--muted-foreground);
  }
  .opt:disabled {
    cursor: default;
  }
  .opt.sel {
    border-color: var(--foreground);
  }
  .opt.right {
    border-color: var(--secondary);
    background: color-mix(in oklab, var(--secondary) 10%, var(--background));
  }
  .opt.wrong {
    border-color: var(--error);
    background: color-mix(in oklab, var(--error) 9%, var(--background));
  }
  .letter {
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--muted-foreground);
    width: 1em;
  }
  .mark {
    margin-left: auto;
    font-family: var(--font-mono);
  }
  .right .mark {
    color: var(--secondary);
  }
  .wrong .mark {
    color: var(--error);
  }
  .opt :global(code),
  .prompt :global(code),
  .feedback :global(code) {
    font-family: var(--font-mono);
    font-size: 0.85em;
    background: var(--card);
    border: 1px solid var(--border);
    padding: 0.05em 0.35em;
    border-radius: 0.25rem;
  }
  .check {
    margin: 0.7em 0 0 2em;
    background: var(--foreground);
    color: var(--background);
    border: 0;
    border-radius: 999px;
    padding: 0.45em 1.2em;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .check:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .feedback {
    margin: 0.7em 0 0 2em !important;
    font-size: 0.92em;
    padding: 0.5em 0.8em;
    border-radius: 0.375rem;
    border-inline-start: 3px solid var(--c);
    background: color-mix(in oklab, var(--c) 8%, var(--background));
  }
  .ok {
    --c: var(--secondary);
  }
  .bad {
    --c: var(--error);
  }
  .end {
    text-align: center;
    padding-top: 0.8em;
  }
  .end .check {
    margin: 0.4em 0 0;
  }
  .big {
    margin: 0 0 0.4em !important;
    color: var(--foreground);
  }
  .burst span {
    position: absolute;
    top: -20px;
    left: var(--x);
    color: var(--secondary);
    animation: fall 1.6s ease-in var(--d) forwards;
    pointer-events: none;
  }
  @keyframes fall {
    to {
      transform: translateY(520px) rotate(360deg);
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .burst {
      display: none;
    }
  }
</style>
