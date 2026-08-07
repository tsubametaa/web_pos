<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		class?: string;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
		[key: string]: any;
	}

	let {
		type = 'button',
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		class: className = '',
		children,
		onclick,
		...rest
	}: Props = $props();

	const baseStyles =
		'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-350 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none';

	const variants = {
		primary:
			'bg-accent hover:bg-accent-hover text-white shadow-md shadow-accent/10 focus:ring-accent',
		secondary:
			'bg-accent-soft hover:bg-accent-soft/80 text-ink border border-border-theme focus:ring-accent shadow-sm',
		success:
			'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 focus:ring-emerald-500',
		danger:
			'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/10 focus:ring-rose-500',
		warning:
			'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 focus:ring-amber-500',
		ghost: 'hover:bg-accent-soft text-ink-muted hover:text-ink focus:ring-accent',
		outline:
			'border border-border-theme text-ink bg-surface hover:bg-accent-soft focus:ring-accent shadow-sm'
	};

	const sizes = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2.5 text-sm',
		lg: 'px-6 py-3.5 text-base'
	};
</script>

<button
	{type}
	class="{baseStyles} {variants[variant]} {sizes[size]} {className}"
	disabled={disabled || loading}
	{onclick}
	{...rest}
>
	{#if loading}
		<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>
