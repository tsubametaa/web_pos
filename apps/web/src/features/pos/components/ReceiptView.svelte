<script lang="ts">
	import { formatCurrency } from '../../../lib/utils/currency';
	import { formatDate } from '../../../lib/utils/date';
	import { Printer, X, CheckCircle, FileText, User } from 'lucide-svelte';
	import type { UITransaction, UISettings } from '../../../types';

	interface Props {
		show: boolean;
		transaction: UITransaction | null;
		settings: UISettings | null;
		onclose: () => void;
	}

	let { show, transaction, settings, onclose }: Props = $props();

	function handlePrintBoth() {
		if (transaction?.id) {
			window.open(`#/print-all/${transaction.id}`, '_blank');
		}
	}

	function handlePrintInvoice() {
		if (transaction?.id) {
			window.open(`#/invoice/${transaction.id}`, '_blank');
		}
	}

	function handlePrintSuratJalan() {
		if (transaction?.id) {
			window.open(`#/surat-jalan/${transaction.id}`, '_blank');
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
			class="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-sage-200/50 overflow-hidden text-ink"
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
				{#if transaction.memberName || transaction.isMemberTransaction}
					<div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
						<span class="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
							<User class="w-3.5 h-3.5" />
							TRANSAKSI MEMBER
						</span>
						{#if transaction.memberName}
							<span class="text-slate-700 dark:text-slate-200 block font-semibold">Nama: {transaction.memberName}</span>
						{/if}
						{#if transaction.memberPhone}
							<span class="text-slate-500 dark:text-slate-400 block font-mono">No HP: {transaction.memberPhone}</span>
						{/if}
					</div>
				{/if}

				{#if transaction.recipientName}
					<div class="p-3 bg-base border rounded-xl text-xs space-y-1">
						<span class="font-bold text-slate-700 dark:text-slate-200 block">Penerima: {transaction.recipientName}</span>
						{#if transaction.recipientPhone}
							<span class="text-slate-500 block">Telp: {transaction.recipientPhone}</span>
						{/if}
						{#if transaction.recipientAddress}
							<span class="text-slate-500 block truncate">Alamat: {transaction.recipientAddress}</span>
						{/if}
					</div>
				{/if}

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
			<div class="px-6 pb-6 flex flex-col gap-2">
				<button
					type="button"
					onclick={handlePrintBoth}
					class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl cursor-pointer transition-all shadow-xs flex items-center justify-center gap-2"
				>
					<Printer class="w-4 h-4" />
					<span>Cetak Invoice & Surat Jalan</span>
				</button>

				<div class="flex gap-2 pt-1">
					<button
						type="button"
						onclick={handlePrintInvoice}
						class="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
					>
						<Printer class="w-3.5 h-3.5 text-slate-500" />
						Invoice Saja
					</button>
					<button
						type="button"
						onclick={handlePrintSuratJalan}
						class="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
					>
						<FileText class="w-3.5 h-3.5 text-slate-500" />
						Surat Jalan Saja
					</button>
				</div>
				<button
					type="button"
					onclick={onclose}
					class="w-full py-2 border border-sage-200 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-base cursor-pointer transition-all mt-1"
				>
					<X class="w-3.5 h-3.5 inline mr-1" />
					Tutup
				</button>
			</div>
		</div>
	</div>
{/if}
