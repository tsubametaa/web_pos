<script lang="ts">
	import { onMount } from 'svelte';
	import { formatCurrency } from '../../lib/utils/currency';
	import { formatDate } from '../../lib/utils/date';
	import { Printer, ArrowLeft, FileText, Banknote } from 'lucide-svelte';
	import { api } from '../../core/api';
	import Spinner from '../../components/ui/Spinner.svelte';
	import type { UITransaction, UISettings } from '../../types';

	let { transactionId }: { transactionId: string } = $props();

	let loading = $state(true);
	let transaction = $state<UITransaction | null>(null);
	let settings = $state<UISettings | null>(null);
	let printLayout = $state<'a4' | 'thermal'>('thermal');

	async function loadInvoiceData() {
		try {
			const res = await api.get(`/transactions/${transactionId}`);
			if (res.success) {
				transaction = res.transaction;
				settings = res.settings;
			}
		} catch (err) {
			console.error('Error fetching invoice details:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadInvoiceData();
	});

	function triggerPrint() {
		window.print();
	}
</script>

{#if loading}
	<div class="min-h-screen flex items-center justify-center bg-base text-ink">
		<Spinner size="lg" />
	</div>
{:else if transaction}
	<div class="min-h-screen bg-base text-slate-800 flex flex-col items-center pb-16">
		<!-- Control Bar (hidden during printing) -->
		<div class="print:hidden w-full max-w-2xl bg-surface border border-sage-200/50 p-4 sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md rounded-b-2xl">
			<a
				href="#/sales"
				class="text-xs font-semibold text-slate-500 hover:text-sage-600 flex items-center gap-1.5 cursor-pointer"
			>
				<ArrowLeft class="w-4 h-4" />
				Kembali ke Riwayat
			</a>

			<!-- Layout Selector -->
			<div class="flex items-center gap-1 p-0.5 bg-base border border-sage-200/50 rounded-xl">
				<button
					type="button"
					onclick={() => (printLayout = 'thermal')}
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer border-0
						{printLayout === 'thermal' ? 'bg-white text-sage-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-transparent'}"
				>
					<Banknote class="w-3.5 h-3.5" />
					Thermal Struk
				</button>
				<button
					type="button"
					onclick={() => (printLayout = 'a4')}
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer border-0
						{printLayout === 'a4' ? 'bg-white text-sage-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-transparent'}"
				>
					<FileText class="w-3.5 h-3.5" />
					Invoice A4
				</button>
			</div>

			<button
				type="button"
				onclick={triggerPrint}
				class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-sage-500 hover:bg-sage-600 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer border-0 transition-all active:scale-95"
			>
				<Printer class="w-3.5 h-3.5" />
				Cetak Dokumen
			</button>
		</div>

		<!-- Printable Area -->
		<div class="mt-8 flex justify-center w-full px-4">
			{#if printLayout === 'thermal'}
				<!-- THERMAL RECEIPT LAYOUT -->
				<div class="thermal-receipt w-[80mm] p-5 bg-white text-slate-900 border border-slate-200 rounded shadow-md font-mono text-[11px] leading-relaxed select-none">
					<div class="text-center font-bold mb-3">
						<span class="text-sm block uppercase tracking-wide">{settings?.businessName}</span>
						{#if settings?.businessAddress}
							<span class="font-normal block text-[9px] text-slate-600 mt-0.5">{settings.businessAddress}</span>
						{/if}
						{#if settings?.businessPhone}
							<span class="font-normal block text-[9px] text-slate-600">{settings.businessPhone}</span>
						{/if}
					</div>

					<div class="border-t border-b border-dashed border-slate-350 py-2 my-2 flex flex-col gap-1 text-[10px]">
						<div class="flex justify-between">
							<span>No. Transaksi:</span>
							<span class="font-bold">{transaction.transactionCode}</span>
						</div>
						<div class="flex justify-between">
							<span>Tanggal:</span>
							<span>{formatDate(transaction.createdAt).slice(0, 16)}</span>
						</div>
						<div class="flex justify-between">
							<span>Metode:</span>
							<span class="uppercase">{transaction.paymentMethod}</span>
						</div>
						<div class="flex justify-between">
							<span>Status:</span>
							<span class="font-bold uppercase">{transaction.status === 'voided' ? 'BATAL' : 'SELESAI'}</span>
						</div>
					</div>

					<!-- Items -->
					<div class="flex flex-col gap-2 my-3">
						{#each transaction.items as item}
							<div>
								<div class="flex justify-between font-bold">
									<span>{item.productName}</span>
									<span>{formatCurrency(item.subtotal, '')}</span>
								</div>
								<div class="text-[9px] text-slate-500">
									{item.qty} x {formatCurrency(item.sellingPrice, '')}
								</div>
							</div>
						{/each}
					</div>

					<!-- Totals -->
					<div class="border-t border-dashed border-slate-350 pt-2 flex flex-col gap-1 text-[10px]">
						<div class="flex justify-between font-bold text-xs">
							<span>TOTAL:</span>
							<span>{formatCurrency(transaction.totalAmount, '')}</span>
						</div>
						<div class="flex justify-between">
							<span>BAYAR:</span>
							<span>{formatCurrency(transaction.amountPaid, '')}</span>
						</div>
						<div class="flex justify-between font-bold border-t border-slate-200 pt-1 mt-1">
							<span>KEMBALI:</span>
							<span>{formatCurrency(transaction.change, '')}</span>
						</div>
					</div>

					{#if settings?.receiptFooter}
						<div class="text-center text-[9px] text-slate-550 border-t border-dashed border-slate-350 pt-3 mt-4">
							{settings.receiptFooter}
						</div>
					{/if}
				</div>
			{:else}
				<!-- PROFESSIONAL A4 INVOICE LAYOUT -->
				<div class="a4-invoice w-full max-w-4xl p-10 bg-white text-slate-800 border border-slate-200 rounded shadow-lg flex flex-col select-none min-h-[297mm]">
					<!-- Header Brand -->
					<div class="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
						<div>
							<h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase">{settings?.businessName}</h1>
							<p class="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
								{settings?.businessAddress}<br/>
								Telp: {settings?.businessPhone}
							</p>
						</div>
						<div class="text-right">
							<h2 class="text-xl font-bold text-slate-400 uppercase tracking-widest">INVOICE</h2>
							<p class="text-xs font-bold text-slate-900 font-mono mt-1">{transaction.transactionCode}</p>
							<p class="text-xs text-slate-500 mt-0.5">{formatDate(transaction.createdAt)}</p>
						</div>
					</div>

					<!-- Invoice Meta Details -->
					<div class="grid grid-cols-2 gap-6 bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-6 text-xs leading-relaxed">
						<div>
							<span class="text-slate-500 block font-semibold uppercase tracking-wider mb-1">Rincian Pembayaran</span>
							<p class="text-slate-800 font-bold">Metode: <span class="uppercase">{transaction.paymentMethod}</span></p>
							<p class="text-slate-600">Status: <span class="font-bold uppercase {transaction.status === 'voided' ? 'text-rose-600' : 'text-emerald-600'}">{transaction.status === 'voided' ? 'Dibatalkan (Voided)' : 'Selesai (Paid)'}</span></p>
						</div>
						<div class="text-right">
							<span class="text-slate-500 block font-semibold uppercase tracking-wider mb-1">Kasir</span>
							<p class="text-slate-800 font-bold">Owner / Cashier</p>
						</div>
					</div>

					<!-- Table of items -->
					<table class="w-full border-collapse text-left text-xs mb-8">
						<thead>
							<tr class="border-b border-slate-200 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
								<th class="py-3 pr-4">SKU</th>
								<th class="py-3">Deskripsi Barang</th>
								<th class="py-3 text-center">Jumlah</th>
								<th class="py-3 text-right">Harga Satuan</th>
								<th class="py-3 text-right">Subtotal</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each transaction.items as item}
								<tr class="text-slate-700">
									<td class="py-4 pr-4 font-mono font-medium text-slate-400">{item.sku}</td>
									<td class="py-4 font-bold text-slate-900">{item.productName}</td>
									<td class="py-4 text-center font-semibold">{item.qty}</td>
									<td class="py-4 text-right font-mono">{formatCurrency(item.sellingPrice)}</td>
									<td class="py-4 text-right font-mono font-bold text-slate-900">{formatCurrency(item.subtotal)}</td>
								</tr>
							{/each}
						</tbody>
					</table>

					<!-- Bottom totals -->
					<div class="mt-auto border-t-2 border-slate-100 pt-6 flex justify-between items-start">
						<div class="text-xs text-slate-500 italic max-w-xs leading-normal">
							{#if settings?.receiptFooter}
								<p class="mt-2 font-medium">{settings.receiptFooter}</p>
							{/if}
						</div>
						<div class="w-64 flex flex-col gap-2.5 text-xs">
							<div class="flex justify-between text-slate-500">
								<span>Subtotal</span>
								<span class="font-mono">{formatCurrency(transaction.totalAmount)}</span>
							</div>
							<div class="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2.5 text-sm">
								<span>Total Bayar</span>
								<span class="font-mono text-sage-600">{formatCurrency(transaction.totalAmount)}</span>
							</div>
							<div class="flex justify-between text-slate-500">
								<span>Diterima</span>
								<span class="font-mono">{formatCurrency(transaction.amountPaid)}</span>
							</div>
							<div class="flex justify-between font-bold text-slate-800">
								<span>Kembalian</span>
								<span class="font-mono text-emerald-600">{formatCurrency(transaction.change)}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	@media print {
		:global(.print-hidden) {
			display: none !important;
		}

		:global(body) {
			background: white !important;
			color: black !important;
		}

		:global(.min-h-screen) {
			background: white !important;
			padding-bottom: 0 !important;
		}

		.thermal-receipt {
			border: none !important;
			box-shadow: none !important;
			width: 80mm !important;
			margin: 0 !important;
			padding: 0 !important;
		}

		.a4-invoice {
			border: none !important;
			box-shadow: none !important;
			width: 100% !important;
			max-width: 100% !important;
			margin: 0 !important;
			padding: 0 !important;
		}

		@page {
			margin: 10mm;
		}
	}
</style>
