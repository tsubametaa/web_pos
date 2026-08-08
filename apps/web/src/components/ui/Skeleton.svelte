<script lang="ts">
  interface Props {
    class?: string;
    width?: string;
    height?: string;
    rounded?: string;
  }

  let {
    class: className = "",
    width = "",
    height = "",
    rounded = "rounded-xl",
  }: Props = $props();
</script>

<div
  class="animate-pulse bg-slate-200/80 dark:bg-slate-800/80 {rounded} {width} {height} {className}"
></div>
