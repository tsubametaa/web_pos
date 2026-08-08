<script lang="ts">
	/* ProductShareModal.svelte - Label Barcode Produk modal with 1D Barcode & Print Label options */
	import { X, Link, Barcode as BarcodeIcon, Printer } from 'lucide-svelte';
	import Barcode from '../../../components/ui/Barcode.svelte';
	import type { UIProduct } from '../../../types';

	interface Props {
		product: UIProduct;
		onclose: () => void;
	}

	let { product, onclose }: Props = $props();

	const barcodeValue = $derived(product.barcode || product.sku || 'PRD-0000');

	const shareUrl = $derived(
		'https://karyasejatitest.vercel.app/etalase'
	);

	function copyLink() {
		if (typeof navigator !== 'undefined') {
			navigator.clipboard.writeText(shareUrl);
		}
	}

	function printLabel() {
		window.open(`#/etalase/${product.id}?print=label&barcode=1&qr=0`, '_blank');
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
	role="dialog"
	aria-modal="true"
>
	<div
		class="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-sage-200/50 overflow-hidden text-ink"
		onclick={(e) => e.stopPropagation()}
		role="presentation"
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-6 py-4 border-b border-sage-200/25 bg-base/20">
			<div class="flex items-center gap-2">
				<BarcodeIcon class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
				<h2 class="text-sm font-extrabold text-slate-800 dark:text-white">Barcode Produk</h2>
			</div>
			<button
				type="button"
				onclick={onclose}
				class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-base rounded-xl cursor-pointer transition-all bg-transparent border-0"
			>
				<X class="w-4 h-4" />
			</button>
		</div>

		<div class="px-6 py-5 flex flex-col items-center gap-4 max-h-[85vh] overflow-y-auto scrollbar-none">
			<!-- Product Info Header -->
			<div class="text-center">
				<h3 class="font-extrabold dark:text-white text-base">{product.name}</h3>
				<div class="flex items-center justify-center gap-2 mt-0.5">
					<span class="font-mono text-xs text-slate-400 font-bold">SKU: {product.sku}</span>
					{#if product.barcode && product.barcode !== product.sku}
						<span class="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">• Barcode: {product.barcode}</span>
					{/if}
				</div>
			</div>

			<!-- Visual Preview Box -->
			<div class="w-full p-6 bg-white border border-slate-200/80 rounded-2xl shadow-inner flex flex-col items-center justify-center gap-3">
				<div class="flex flex-col items-center w-full px-2">
					<Barcode value={barcodeValue} height={54} showText={true} />
				</div>
			</div>

			<!-- Public Etalase Link -->
			<div class="w-full">
				<p class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Link Etalase Produk</p>
				<div class="flex gap-2">
					<input
						type="text"
						value={shareUrl}
						readonly
						class="flex-1 px-3 py-2 bg-base border border-slate-200/80 dark:border-emerald-950/80 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none truncate"
					/>
					<button
						type="button"
						onclick={copyLink}
						class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1"
					>
						<Link class="w-3.5 h-3.5" />
						Salin
					</button>
				</div>
			</div>

			<!-- Print Action Button -->
			<button
				type="button"
				onclick={printLabel}
				class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow"
			>
				<Printer class="w-4 h-4" />
				Cetak Label Thermal (60mm)
			</button>
		</div>
	</div>
</div>
