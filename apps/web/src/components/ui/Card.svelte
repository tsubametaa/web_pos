<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		hoverable?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { hoverable = false, class: className = '', children }: Props = $props();
</script>

<div
	class="glass-panel rounded-2xl p-5 shadow-md transition-all duration-350 ease-out border border-sage-200/50
    {hoverable ? 'hover:scale-[1.015] hover:border-sage-500/35 hover:shadow-xl hover:shadow-sage-550/5 hover:bg-white' : ''}
    {className}"
>
	{#if children}
		{@render children()}
	{/if}
</div>
