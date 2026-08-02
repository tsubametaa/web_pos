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
		<label for={id} class="text-xs font-bold text-amber-950/80 uppercase tracking-wider">
			{label}
			{#if required}
				<span class="text-rose-500">*</span>
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
			class="w-full px-4 py-2.5 bg-white border {error ? 'border-rose-500/85 focus:ring-rose-500/10 focus:border-rose-500' : 'border-sage-200 hover:border-sage-300 focus:ring-sage-500/10 focus:border-sage-500'} rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-40 disabled:bg-slate-100 {className}"
			{...rest}
		/>
	</div>
	{#if error}
		<span class="text-xs text-rose-500 mt-0.5">{error}</span>
	{/if}
</div>
