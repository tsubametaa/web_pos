<script lang="ts">
	interface Props {
		type?: string;
		label?: string;
		id?: string;
		value?: any;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		class?: string;
		[key: string]: any;
	}

	let {
		type = 'text',
		label,
		id = Math.random().toString(36).substring(2, 9),
		value = $bindable(),
		placeholder = '',
		required = false,
		disabled = false,
		error,
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div class="flex flex-col gap-1.5 w-full">
	{#if label}
		<label for={id} class="text-xs font-bold text-ink-muted uppercase tracking-wider block">
			{label}
			{#if required}
				<span class="text-accent">*</span>
			{/if}
		</label>
	{/if}
	<div class="relative">
		<input
			{type}
			{id}
			bind:value
			{placeholder}
			{required}
			{disabled}
			class="w-full px-4 py-2.5 bg-surface border {error ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' : 'border-border-theme hover:border-accent/40 focus:ring-accent/10 focus:border-accent'} rounded-xl text-xs font-semibold text-h-text placeholder-ink-muted focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-40 {className}"
			{...rest}
		/>
	</div>
	{#if error}
		<span class="text-xs text-rose-500 mt-0.5">{error}</span>
	{/if}
</div>
