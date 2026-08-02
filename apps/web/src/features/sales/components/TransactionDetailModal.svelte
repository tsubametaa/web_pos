<script lang="ts">
	import { formatCurrency } from '../../../lib/utils/currency';
	import { formatDate } from '../../../lib/utils/date';
	import { X, Printer, Ban } from 'lucide-svelte';
	import type { UITransaction, UISettings } from '../../../types';

	interface Props {
		transaction: UITransaction | null;
		settings: UISettings | null;
		onclose: () => void;
		onvoid?: (id: string) => void;
	}

	let { transaction, settings, onclose, onvoid }: Props = $props();

	function openInvoice() {
		if (transaction?.id) {
			window.open(`#/invoice/${transaction.id}`, '_blank');
		}
	}
</script>

{#if transaction}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
		onclick={onclose}
		role="dialog"
		aria-modal="true"
	>
		<div
			class="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-sage-200/50 overflow-hidden max-h-[90vh] flex flex-col text-ink"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-sage-200/25 bg-base/20">
				<div>
					<h2 class="text-sm font-extrabold text-slate-800 dark:text-white">Detail Transaksi</h2>
					<p class="text-xs font-mono text-slate-500 mt-0.5">{transaction.transactionCode}</p>
				</div>
				<button
					type="button"
					onclick={onclose}
					class="p-2 text-slate-400 hover:text-slate-700 hover:bg-base rounded-xl cursor-pointer transition-all bg-transparent border-0"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Body -->
			<div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
				<!-- Items -->
				<div>
					<h3 class="text-xs font-bold text-slate-500 dark:text-slate-350 uppercase tracking-wider mb-2">Item</h3>
					<div class="flex flex-col gap-1.5">
						{#each transaction.items as item}
							<div class="flex justify-between items-center text-xs py-1.5 border-b border-sage-200/10">
								<div>
									<span class="font-bold text-slate-800 dark:text-white">{item.productName}</span>
									<span class="text-slate-450 dark:text-slate-400 ml-1">× {item.qty}</span>
									<p class="text-[10px] font-mono text-slate-400 dark:text-slate-400">{item.sku} · {formatCurrency(item.sellingPrice)}/unit</p>
								</div>
								<span class="font-mono font-extrabold text-slate-805 dark:text-white">{formatCurrency(item.subtotal)}</span>
							</div>
						{/each}
					</div>
				</div>

				<hr class="border-dashed border-sage-200/20" />

				<!-- Summary -->
				<div class="flex flex-col gap-2 text-xs">
					<div class="flex justify-between">
						<span class="text-slate-550 dark:text-slate-300">Total Penjualan</span>
						<span class="font-mono font-extrabold text-slate-900 dark:text-white">{formatCurrency(transaction.totalAmount)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-550 dark:text-slate-300">HPP</span>
						<span class="font-mono text-slate-700 dark:text-slate-300">{formatCurrency(transaction.totalCost)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-550 dark:text-slate-300">Profit</span>
						<span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(transaction.profit)}</span>
					</div>
					<hr class="border-dashed border-sage-200/10 my-1" />
					<div class="flex justify-between">
						<span class="text-slate-550 dark:text-slate-300">Metode Bayar</span>
						<span class="font-bold capitalize">{transaction.paymentMethod}</span>
					</div>
					{#if transaction.paymentMethod === 'cash'}
						<div class="flex justify-between">
							<span class="text-slate-550 dark:text-slate-300">Uang Diterima</span>
							<span class="font-mono">{formatCurrency(transaction.amountPaid)}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-slate-550 dark:text-slate-300">Kembalian</span>
							<span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(transaction.change)}</span>
						</div>
					{/if}
					<div class="flex justify-between">
						<span class="text-slate-550 dark:text-slate-300">Tanggal</span>
						<span class="font-mono">{formatDate(transaction.createdAt)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-550 dark:text-slate-300">Status</span>
						<span class="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold
							{transaction.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-250/20' : 'bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-455 border border-rose-250/20'}">
							{transaction.status === 'completed' ? 'Selesai' : 'Batal (Void)'}
						</span>
					</div>
					{#if transaction.notes}
						<div class="flex justify-between">
							<span class="text-slate-550 dark:text-slate-300">Catatan</span>
							<span class="text-right text-slate-700 dark:text-slate-300 max-w-[60%]">{transaction.notes}</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Actions -->
			<div class="px-6 pb-6 pt-3 border-t border-sage-200/25 flex gap-3">
				<button
					type="button"
					onclick={openInvoice}
					class="flex-1 py-3 bg-sage-500 hover:bg-sage-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md shadow-sage-500/20 flex items-center justify-center gap-1.5"
				>
					<Printer class="w-3.5 h-3.5" />
					Cetak Invoice
				</button>
				{#if transaction.status === 'completed' && onvoid}
					<button
						type="button"
						onclick={() => onvoid?.(transaction!.id)}
						class="flex-1 py-3 border border-rose-200 text-rose-600 dark:text-rose-455 text-xs font-bold rounded-xl hover:bg-base cursor-pointer transition-all flex items-center justify-center gap-1.5"
					>
						<Ban class="w-3.5 h-3.5" />
						Batalkan
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
