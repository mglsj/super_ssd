<script lang="ts">
  import { fmt } from './fmt';
  import Icon from '../icons/Icon.svelte';

  type Card = { q: string; a: string };
  let { cards, title = 'Flashcards' }: { cards: Card[]; title?: string } = $props();

  const allIds = () => cards.map((_, i) => i);

  let order = $state<number[]>(allIds());
  let pos = $state(0);
  let flipped = $state(false);
  let known = $state(0);
  let again = $state<number[]>([]);
  let root: HTMLElement | undefined = $state();

  let finished = $derived(order.length > 0 && pos >= order.length);
  let current = $derived(finished ? undefined : cards[order[pos]]);

  function restart(ids: number[]) {
    order = ids;
    pos = 0;
    flipped = false;
    known = 0;
    again = [];
  }

  function shuffle() {
    const ids = cards.map((_, i) => i);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    restart(ids);
  }

  function answer(gotIt: boolean) {
    if (gotIt) known += 1;
    else again = [...again, order[pos]];
    flipped = false;
    pos += 1;
  }

  function onkeydown(e: KeyboardEvent) {
    if (!root?.contains(document.activeElement)) return;
    if (e.key === ' ' || e.key === 'Enter') {
      if (finished) return;
      e.preventDefault();
      flipped = !flipped;
    } else if (flipped && (e.key === 'ArrowRight' || e.key === '1')) {
      answer(true);
    } else if (flipped && (e.key === 'ArrowLeft' || e.key === '2')) {
      answer(false);
    }
  }
</script>

<svelte:window {onkeydown} />

<section class="deck" bind:this={root} aria-label={title}>
  <header>
    <span class="eyebrow"><Icon name="cards" size={20} />{title}</span>
    <span class="count">{Math.min(pos + 1, order.length)} / {order.length}</span>
    <button type="button" class="ghost" onclick={shuffle} title="Shuffle the deck">⤨ Shuffle</button>
  </header>

  <div class="bar"><div class="fill" style:width="{(pos / Math.max(order.length, 1)) * 100}%"></div></div>

  {#if current}
    <button
      type="button"
      class={['card', flipped && 'flipped']}
      onclick={() => (flipped = !flipped)}
      aria-label={flipped ? 'Answer shown. Click to see the question' : 'Click to reveal the answer'}
    >
      <span class="inner">
        <span class="face front">
          <span class="tag">Question</span>
          <span class="text">{@html fmt(current.q)}</span>
          <span class="hint">tap or press <kbd>Space</kbd> to flip</span>
        </span>
        <span class="face back">
          <span class="tag">Answer</span>
          <span class="text">{@html fmt(current.a)}</span>
        </span>
      </span>
    </button>

    <div class={['actions', !flipped && 'hidden']}>
      <button type="button" class="again" disabled={!flipped} onclick={() => answer(false)}>↺ Again</button>
      <button type="button" class="got" disabled={!flipped} onclick={() => answer(true)}>✓ Got it</button>
    </div>
  {:else if finished}
    <div class="done">
      <div class="big"><Icon name={known === order.length ? 'sparkles' : known >= order.length / 2 ? 'bolt' : 'target'} size={48} /></div>
      <p><strong>{known}</strong> of {order.length} nailed.</p>
      <div class="actions">
        {#if again.length}
          <button type="button" class="got" onclick={() => restart(again)}>Replay {again.length} missed</button>
        {/if}
        <button type="button" class="again" onclick={() => restart(cards.map((_, i) => i))}>Start over</button>
      </div>
    </div>
  {/if}
</section>

<style>
  .deck {
    margin-block: 2em;
    padding: 1.1em 1.2em 1.2em;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--card);
    font-family: var(--font-serif);
  }
  header {
    display: flex;
    align-items: center;
    gap: 0.75em;
    margin-bottom: 0.7em;
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
  .count {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--muted-foreground);
    font-variant-numeric: tabular-nums;
  }
  .ghost {
    background: none;
    border: 1px solid var(--border);
    color: var(--muted-foreground);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    border-radius: 999px;
    padding: 0.25em 0.8em;
    cursor: pointer;
  }
  .ghost:hover {
    color: var(--foreground);
    border-color: var(--muted-foreground);
  }
  .bar {
    height: 3px;
    background: var(--border);
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 1em;
  }
  .fill {
    height: 100%;
    background: var(--secondary);
    transition: width 0.3s ease;
  }
  .card {
    display: block;
    width: 100%;
    perspective: 1200px;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    font: inherit;
    color: inherit;
    text-align: center;
  }
  .inner {
    position: relative;
    display: grid;
    min-height: 11rem;
    transform-style: preserve-3d;
    transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .flipped .inner {
    transform: rotateY(180deg);
  }
  .face {
    grid-area: 1 / 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6em;
    padding: 1.4em;
    border-radius: 0.375rem;
    border: 1px solid var(--border);
    background: var(--background);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .back {
    transform: rotateY(180deg);
    border-color: color-mix(in oklab, var(--secondary) 45%, var(--border));
    background: color-mix(in oklab, var(--secondary) 8%, var(--background));
  }
  .tag {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .text {
    font-size: 1.1em;
    line-height: 1.5;
    max-width: 34em;
    color: var(--foreground);
  }
  .text :global(code) {
    font-family: var(--font-mono);
    font-size: 0.85em;
    background: var(--card);
    border: 1px solid var(--border);
    padding: 0.05em 0.35em;
    border-radius: 0.25rem;
  }
  .hint {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    color: var(--muted-foreground);
  }
  kbd {
    font-family: var(--font-mono);
    border: 1px solid var(--border);
    border-radius: 0.25rem;
    padding: 0 0.35em;
  }
  .actions {
    display: flex;
    justify-content: center;
    gap: 0.6em;
    margin-top: 1em;
    transition: opacity 0.2s;
  }
  .actions.hidden {
    opacity: 0.35;
  }
  .actions button {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: 999px;
    padding: 0.55em 1.3em;
    cursor: pointer;
  }
  .got {
    background: var(--secondary);
    color: var(--background);
    border: 1px solid var(--secondary);
  }
  .again {
    background: transparent;
    color: var(--foreground);
    border: 1px solid var(--border);
  }
  .actions button:disabled {
    cursor: default;
  }
  .done {
    text-align: center;
    padding: 1em 0 0.3em;
  }
  .big {
    color: var(--secondary);
  }
  .done p {
    margin: 0.4em 0 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .inner {
      transition: none;
    }
  }
</style>
