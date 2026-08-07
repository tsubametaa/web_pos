<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
		children?: Snippet;
		class?: string;
	}

	let { variant = 'primary', children, class: className = '' }: Props = $props();

	const variants = {
		primary: 'bg-accent-soft text-accent border border-accent/20 shadow-sm shadow-accent/5',
		secondary: 'bg-slate-500/10 text-slate-600 border border-slate-500/15 shadow-sm',
		success: 'bg-accent-soft text-accent border border-accent/20 shadow-sm shadow-accent/5',
		danger: 'bg-rose-500/10 text-rose-700 border border-rose-500/20 shadow-sm shadow-rose-500/5',
		warning: 'bg-amber-500/10 text-amber-700 border border-amber-500/20 shadow-sm shadow-amber-500/5',
		info: 'bg-sky-500/10 text-sky-700 border border-sky-500/20 shadow-sm shadow-sky-500/5'
	};
</script>

<span
	class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide {variants[
		variant
	]} {className}"
>
	{#if children}
		{@render children()}
	{/if}
</span>
