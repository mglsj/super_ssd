<script lang="ts">
  import { iconSvg, type IconSize } from './index';

  let { name, size = 24, class: className = '' }: { name: string; size?: IconSize; class?: string } = $props();
  let svg = $derived(iconSvg(name, size));
</script>

<!-- the SVG comes from our own built icon files, never from user input -->
<span class={['icon', className]} style:width="{size}px" style:height="{size}px">{@html svg}</span>

<style>
  .icon {
    display: inline-grid;
    place-items: center;
    flex-shrink: 0;
    line-height: 0;
  }
</style>
