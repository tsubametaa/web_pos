<script lang="ts">
	import { cart } from '../logic/cart.svelte';
	import { formatCurrency } from '../../../lib/utils/currency';
	import { toast } from '../../../lib/utils/toast.svelte';
	import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from 'lucide-svelte';
	import type { UISettings } from '../../../types';

	interface Props {
		settings: UISettings | null;
		oncheckout: () => void;
	}

	let { settings, oncheckout }: Props = $props();

	// Tax calculation
	const taxRate = $derived(settings?.taxRate || 0);
	const subtotal = $derived(cart.totalAmount);
	const taxAmount = $derived((subtotal * taxRate) / 100);
	const totalAmount = $derived(subtotal + taxAmount);

	function handleQtyChange(productId: string, currentQty: number, offset: number) {
		const targetQty = currentQty + offset;
		const warning = cart.updateQty(productId, targetQty);
		if (warning) {
			toast.warning(warning);
		}
	}
</script>

<div class="flex flex-col h-full bg-surface border border-sage-200/40 rounded-xl p-5 shadow-sm relative overflow-hidden text-ink">
	<!-- Panel Header -->
	<div class="flex items-center justify-between pb-3.5 border-b border-sage-200/20 mb-3.5">
		<div class="flex items-center gap-1.5 font-bold">
			<ShoppingCart class="w-4 h-4 text-slate-500 dark:text-slate-350" />
			<span class="text-xs font-bold uppercase tracking-wider">Keranjang</span>
		</div>
		<button
			type="button"
			onclick={() => cart.clear()}
			disabled={cart.items.length === 0}
			class="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
		>
			Bersihkan
		</button>
	</div>

	<!-- Cart Items Scroll -->
	<div class="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 min-h-[30vh] scrollbar-none">
		{#each cart.items as item (item.product.id)}
			<div class="p-2.5 bg-base/40 border border-sage-200/10 rounded-lg flex justify-between gap-3 items-center hover:bg-base/70 transition-colors duration-150">
				<div class="flex-1 min-w-0">
					<h5 class="font-semibold text-slate-800 dark:text-white text-xs truncate leading-normal">{item.product.name}</h5>
					<span class="font-mono text-[9px] text-slate-400 dark:text-slate-400 tracking-wider block mt-0.5 uppercase">{item.product.sku}</span>
					<span class="font-mono text-[11px] text-slate-650 dark:text-slate-300 font-medium block mt-0.5">
						{formatCurrency(item.product.sellingPrice)}
					</span>
				</div>

				<!-- Quantity Selector -->
				<div class="flex items-center bg-white dark:bg-base border border-sage-200/50 rounded-md p-0.5">
					<button
						type="button"
						onclick={() => handleQtyChange(item.product.id, item.qty, -1)}
						class="p-0.5 hover:bg-sage-50 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-650 cursor-pointer transition-colors duration-100"
					>
						<Minus class="w-3 h-3" />
					</button>
					<span class="text-[11px] font-semibold text-slate-850 dark:text-slate-200 px-1 w-5 text-center">{item.qty}</span>
					<button
						type="button"
						onclick={() => handleQtyChange(item.product.id, item.qty, 1)}
						class="p-0.5 hover:bg-sage-50 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-650 cursor-pointer transition-colors duration-100"
					>
						<Plus class="w-3 h-3" />
					</button>
				</div>

				<!-- Subtotal / Delete -->
				<div class="flex flex-col items-end gap-1 min-w-[65px]">
					<span class="font-mono text-[11px] font-bold text-slate-800 dark:text-white">
						{formatCurrency(item.qty * item.product.sellingPrice)}
					</span>
					<button
						type="button"
						onclick={() => cart.remove(item.product.id)}
						class="p-0.5 text-slate-350 hover:text-rose-600 transition-colors duration-150 cursor-pointer"
					>
						<Trash2 class="w-3 h-3" />
					</button>
				</div>
			</div>
		{:else}
			<div class="flex-1 flex flex-col items-center justify-center gap-2.5 text-slate-450 text-center py-24 select-none">
				<div class="p-2 bg-base border border-sage-200/30 text-slate-400 rounded-lg">
					<ShoppingCart class="w-5 h-5 stroke-[1.5]" />
				</div>
				<span class="text-xs text-slate-400 font-medium">Keranjang belanja kosong</span>
			</div>
		{/each}
	</div>

	<!-- Billing Details -->
	<div class="border-t border-sage-200/20 pt-3.5 mt-3.5 flex flex-col gap-2">
		<div class="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-300">
			<span>Subtotal ({cart.totalItems} item)</span>
			<span class="font-mono font-medium text-slate-700 dark:text-slate-200">{formatCurrency(subtotal)}</span>
		</div>
		
		{#if taxRate > 0}
			<div class="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-300">
				<span>Pajak PPN ({taxRate}%)</span>
				<span class="font-mono font-medium text-slate-700 dark:text-slate-200">{formatCurrency(taxAmount)}</span>
			</div>
		{/if}

		<div class="flex justify-between items-center border-t border-dashed border-sage-200/20 pt-3 mt-1">
			<span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Bayar</span>
			<span class="font-mono text-slate-900 dark:text-white text-sm font-bold">{formatCurrency(totalAmount)}</span>
		</div>

		<button
			type="button"
			onclick={oncheckout}
			disabled={cart.items.length === 0}
			class="w-full mt-2.5 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 disabled:opacity-35 text-white text-xs font-bold uppercase tracking-wide rounded-lg shadow-sm hover:shadow transition-colors duration-150 disabled:pointer-events-none cursor-pointer"
		>
			<CreditCard class="w-4 h-4" />
			Bayar Sekarang
		</button>
	</div>
</div>
