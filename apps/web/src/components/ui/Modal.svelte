<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import { X } from 'lucide-svelte';

	interface Props {
		show?: boolean;
		title?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
		onclose?: () => void;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		show = false,
		title = '',
		size = 'md',
		onclose,
		children,
		footer
	}: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && show && onclose) {
			onclose();
		}
	}

	const sizes = {
		sm: 'max-w-md',
		md: 'max-w-lg',
		lg: 'max-w-2xl',
		xl: 'max-w-4xl',
		'2xl': 'max-w-6xl',
		full: 'max-w-full h-full my-0 rounded-none'
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
	<div class="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-y-auto">
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			transition:fade={{ duration: 250 }}
			class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
			onclick={onclose}
		></div>

		<!-- Modal Content -->
		<div
			transition:scale={{ duration: 300, start: 0.96 }}
			class="relative w-full glass-panel-glow border border-sage-200/40 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] z-50 {sizes[size]}"
			role="dialog"
			aria-modal="true"
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-4.5 border-b border-sage-200/30">
				<h3 class="text-base font-bold tracking-tight">{title}</h3>
				{#if onclose}
					<button
						type="button"
						onclick={onclose}
						class="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-sage-50 transition-colors cursor-pointer"
					>
						<X class="w-4 h-4" />
					</button>
				{/if}
			</div>

			<!-- Body -->
			<div class="flex-1 overflow-y-auto px-6 py-5.5 text-slate-700">
				{#if children}
					{@render children()}
				{/if}
			</div>

			<!-- Footer -->
			{#if footer}
				<div
					class="flex items-center justify-end gap-3 px-6 py-4.5 border-t border-sage-200/30 bg-sage-50/20 rounded-b-2xl"
				>
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
