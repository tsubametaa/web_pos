<script lang="ts">
  /* Barcode.svelte - Reusable Barcode 1D SVG Renderer Component */
  import { generateCode128SVG } from '../../lib/utils/barcode';

  interface Props {
    value: string;
    height?: number;
    showText?: boolean;
    class?: string;
  }

  let { value = '', height = 45, showText = true, class: className = '' }: Props = $props();

  const svgContent = $derived.by(() => {
    if (!value) return '';
    return generateCode128SVG(value, {
      height,
      showText,
      moduleWidth: 2,
      fontSize: 11,
    });
  });
</script>

{#if svgContent}
  <div class="inline-block select-none overflow-hidden {className}">
    {@html svgContent}
  </div>
{/if}
