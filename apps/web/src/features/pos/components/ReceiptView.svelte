<script lang="ts">
	import { formatCurrency } from '../../../lib/utils/currency';
	import { formatDate } from '../../../lib/utils/date';
	import { Printer, X, CheckCircle } from 'lucide-svelte';
	import type { UITransaction, UISettings } from '../../../types';

	interface Props {
		show: boolean;
		transaction: UITransaction | null;
		settings: UISettings | null;
		onclose: () => void;
	}

	let { show, transaction, settings, onclose }: Props = $props();

	function handlePrintInvoice() {
		if (transaction?.id) {
			window.open(`#/invoice/${transaction.id}`, '_blank');
		}
	}
</script>

{#if show && transaction}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
		role="dialog"
		aria-modal="true"
		aria-label="Struk Transaksi"
	>
		<div
			class="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl border border-sage-200/50 overflow-hidden text-ink"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<!-- Success Header -->
			<div class="flex flex-col items-center gap-2 px-6 pt-8 pb-5 bg-linear-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-transparent border-b border-sage-250/20">
				<div class="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-200 flex items-center justify-center">
					<CheckCircle class="w-8 h-8 text-emerald-500" />
				</div>
				<h2 class="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">Pembayaran Berhasil!</h2>
				<p class="text-xs text-slate-500 dark:text-slate-400 font-mono">{transaction.transactionCode}</p>
			</div>

			<!-- Receipt Body -->
			<div class="px-6 py-5 flex flex-col gap-3">
				<!-- Items -->
				<div class="flex flex-col gap-1.5">
					{#each transaction.items as item}
						<div class="flex justify-between text-xs text-slate-700 dark:text-slate-200">
							<span class="flex-1 truncate pr-2">{item.productName} <span class="text-slate-400 dark:text-slate-400">×{item.qty}</span></span>
							<span class="font-mono font-bold">{formatCurrency(item.subtotal)}</span>
						</div>
					{/each}
				</div>

				<hr class="border-dashed border-sage-200/20" />

				<!-- Totals -->
				<div class="flex flex-col gap-1.5">
					<div class="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
						<span>Total</span>
						<span class="font-mono text-sage-600 dark:text-accent">{formatCurrency(transaction.totalAmount)}</span>
					</div>
					<div class="flex justify-between text-xs text-slate-650 dark:text-slate-300">
						<span>Metode Bayar</span>
						<span class="font-bold capitalize">{transaction.paymentMethod}</span>
					</div>
					{#if transaction.paymentMethod === 'cash'}
						<div class="flex justify-between text-xs text-slate-650 dark:text-slate-300">
							<span>Uang Diterima</span>
							<span class="font-mono font-bold">{formatCurrency(transaction.amountPaid)}</span>
						</div>
						<div class="flex justify-between text-xs text-emerald-700 dark:text-emerald-400">
							<span class="font-bold">Kembalian</span>
							<span class="font-mono font-extrabold">{formatCurrency(transaction.change)}</span>
						</div>
					{/if}
					<div class="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
						<span>Waktu Transaksi</span>
						<span class="font-mono">{formatDate(transaction.createdAt)}</span>
					</div>
				</div>

				{#if settings?.receiptFooter}
					<p class="text-center text-xs text-slate-500 dark:text-slate-400 italic border-t border-dashed border-sage-200/20 pt-3 mt-1">
						{settings.receiptFooter}
					</p>
				{/if}
			</div>

			<!-- Actions -->
			<div class="px-6 pb-6 flex gap-3">
				<button
					type="button"
					onclick={onclose}
					class="flex-1 py-3 border border-sage-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-base cursor-pointer transition-all"
				>
					<X class="w-3.5 h-3.5 inline mr-1" />
					Tutup
				</button>
				<button
					type="button"
					onclick={handlePrintInvoice}
					class="flex-1 py-3 bg-sage-500 hover:bg-sage-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md shadow-sage-500/20 active:scale-[0.97]"
				>
					<Printer class="w-3.5 h-3.5 inline mr-1" />
					Cetak Invoice
				</button>
			</div>
		</div>
	</div>
{/if}
