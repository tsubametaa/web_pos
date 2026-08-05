<script lang="ts">
	import { X, Link, QrCode } from 'lucide-svelte';
	import type { UIProduct } from '../../../types';

	interface Props {
		product: UIProduct;
		onclose: () => void;
	}

	let { product, onclose }: Props = $props();

	const shareUrl = $derived(
		typeof window !== 'undefined' ? `${window.location.origin}/#/etalase/${product.id}` : ''
	);
	const qrCodeUrl = $derived(
		`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
	);

	function copyLink() {
		if (typeof navigator !== 'undefined') {
			navigator.clipboard.writeText(shareUrl);
		}
	}

	function printLabel() {
		window.open(`#/etalase/${product.id}?print=label`, '_blank');
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
	role="dialog"
	aria-modal="true"
>
	<div
		class="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl border border-sage-200/50 overflow-hidden text-ink"
		onclick={(e) => e.stopPropagation()}
		role="presentation"
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-6 py-4 border-b border-sage-200/25 bg-base/20">
			<div class="flex items-center gap-2">
				<QrCode class="w-4 h-4 text-sage-600" />
				<h2 class="text-sm font-extrabold text-slate-800 dark:text-white">Bagikan Produk</h2>
			</div>
			<button type="button" onclick={onclose} class="p-2 text-slate-400 hover:text-slate-700 hover:bg-base rounded-xl cursor-pointer transition-all bg-transparent border-0">
				<X class="w-4 h-4" />
			</button>
		</div>

		<div class="px-6 py-5 flex flex-col items-center gap-5">
			<!-- Product Info -->
			<div class="text-center">
				<h3 class="font-extrabold text-slate-800 dark:text-white text-sm">{product.name}</h3>
				<p class="font-mono text-xs text-slate-400 mt-0.5">{product.sku}</p>
			</div>

			<!-- QR Code -->
			{#if shareUrl}
				<div class="p-4 bg-white border border-sage-200/50 rounded-2xl shadow-inner">
					<img src={qrCodeUrl} alt="QR Code Produk" class="w-44 h-44" />
				</div>
			{/if}

			<!-- Link -->
			<div class="w-full">
				<p class="text-xs font-bold text-slate-500 dark:text-slate-350 mb-1.5">Link Etalase Publik</p>
				<div class="flex gap-2">
					<input
						type="text"
						value={shareUrl}
						readonly
						class="flex-1 px-3 py-2 bg-base border border-sage-200/60 rounded-xl text-xs font-mono text-slate-650 dark:text-slate-300 focus:outline-none truncate"
					/>
					<button
						type="button"
						onclick={copyLink}
						class="px-3 py-2 bg-sage-500 hover:bg-sage-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1"
					>
						<Link class="w-3.5 h-3.5" />
						Salin
					</button>
				</div>
			</div>

			<!-- Print Label -->
			<button
				type="button"
				onclick={printLabel}
				class="w-full py-3 border border-sage-350 text-sage-750 dark:text-accent font-bold text-xs rounded-xl hover:bg-base cursor-pointer transition-all flex items-center justify-center gap-2"
			>
				<QrCode class="w-4 h-4" />
				Cetak Label QR (60mm)
			</button>
		</div>
	</div>
</div>
