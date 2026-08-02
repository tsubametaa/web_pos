<script lang="ts">
	import { toast } from '../../lib/utils/toast.svelte';
	import { fly, fade } from 'svelte/transition';
	import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-svelte';
</script>

<div class="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
	{#each toast.messages as msg (msg.id)}
		<div
			in:fly={{ y: -10, duration: 200 }}
			out:fade={{ duration: 150 }}
			class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-white dark:bg-surface shadow-xl transition-all duration-150
				{msg.type === 'success' ? 'border-emerald-100/80 dark:border-emerald-900/50' : ''}
				{msg.type === 'error' ? 'border-rose-100/80 dark:border-rose-900/50' : ''}
				{msg.type === 'warning' ? 'border-amber-100/80 dark:border-amber-900/50' : ''}
				{msg.type === 'info' ? 'border-blue-100/80 dark:border-blue-900/50' : ''}"
			role="alert"
		>
			<div class="shrink-0 mt-0.5">
				{#if msg.type === 'success'}
					<CheckCircle class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
				{:else if msg.type === 'error'}
					<AlertCircle class="w-5 h-5 text-rose-600 dark:text-rose-400" />
				{:else if msg.type === 'warning'}
					<AlertTriangle class="w-5 h-5 text-amber-600 dark:text-amber-400" />
				{:else}
					<Info class="w-5 h-5 text-blue-600 dark:text-blue-400" />
				{/if}
			</div>

			<div class="flex-1 text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug wrap-break-word">
				{msg.message}
			</div>

			<button
				type="button"
				onclick={() => toast.dismiss(msg.id)}
				class="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-250 transition-colors p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{/each}
</div>
