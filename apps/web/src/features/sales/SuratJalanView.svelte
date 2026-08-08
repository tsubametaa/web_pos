<script lang="ts">
	import { onMount } from 'svelte';
	import { Printer, ArrowLeft } from 'lucide-svelte';
	import { api } from '../../core/api';
	import Spinner from '../../components/ui/Spinner.svelte';
	import BrandPrintHeader from './components/BrandPrintHeader.svelte';
	import PrintRecipientCard from './components/PrintRecipientCard.svelte';
	import PrintSignaturesFooter from './components/PrintSignaturesFooter.svelte';
	import type { UITransaction, UISettings } from '../../types';

	let { transactionId }: { transactionId: string } = $props();

	let loading = $state(true);
	let transaction = $state<UITransaction | null>(null);
	let settings = $state<UISettings | null>(null);

	async function loadData() {
		try {
			const res = await api.get(`/transactions/${transactionId}`);
			if (res.success) {
				transaction = res.transaction;
				settings = res.settings;
			}
		} catch (err) {
			console.error('Error fetching surat jalan details:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadData();
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
	<div class="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center pb-16">
		<!-- Control Bar (hidden during printing) -->
		<div class="print:hidden w-full max-w-4xl bg-white border-b border-slate-200 p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
			<a
				href="#/sales"
				class="text-xs font-semibold text-slate-600 hover:text-accent flex items-center gap-1.5 cursor-pointer"
			>
				<ArrowLeft class="w-4 h-4" />
				Kembali ke Riwayat
			</a>

			<div class="flex items-center gap-2">
				<span class="text-xs font-bold text-slate-500">Ukuran Kertas: 9.5" x 5.5"</span>
				<button
					type="button"
					onclick={triggerPrint}
					class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-xs font-bold text-white rounded-xl shadow-sm cursor-pointer transition-all"
				>
					<Printer class="w-3.5 h-3.5" />
					Cetak Surat Jalan
				</button>
			</div>
		</div>

		<!-- Printable Container (Continuous Form 9.5 in x 5.5 in) -->
		<div class="mt-6 flex justify-center w-full px-2">
			<div class="surat-jalan-page bg-white border border-slate-300 p-6 text-black font-sans select-none shadow-md flex flex-col justify-between">
				<div>
					<!-- Modular Header with Logo & Brand Info -->
					<BrandPrintHeader
						logoUrl={settings?.logoUrl}
						businessName={settings?.businessName}
						businessAddress={settings?.businessAddress}
						businessPhone={settings?.businessPhone}
						docType="SURAT JALAN"
						docCode={transaction.transactionCode.replace('TRX-', 'DO/')}
						docDate={transaction.createdAt}
					/>

					<!-- Modular Recipient & Document Info -->
					<PrintRecipientCard
						recipientName={transaction.recipientName}
						recipientPhone={transaction.recipientPhone}
						recipientAddress={transaction.recipientAddress}
						docType="SURAT JALAN"
					/>

					<!-- Items Table -->
					<table class="w-full border-collapse text-xs mb-3 border border-slate-900 text-left">
						<thead>
							<tr class="border-b-2 border-slate-900 bg-slate-100 font-bold text-[11px]">
								<th class="border-r border-slate-900 p-1.5 w-8 text-center">No</th>
								<th class="border-r border-slate-900 p-1.5">Nama Produk</th>
								<th class="border-r border-slate-900 p-1.5">Deskripsi Produk</th>
								<th class="border-r border-slate-900 p-1.5 w-24">Kode SKU</th>
								<th class="border-r border-slate-900 p-1.5 w-16 text-center">Kuantitas</th>
								<th class="p-1.5 w-16 text-center">Unit</th>
							</tr>
						</thead>
						<tbody>
							{#each transaction.items as item, index}
								<tr class="border-b border-slate-300">
									<td class="border-r border-slate-900 p-1.5 text-center font-medium">{index + 1}</td>
									<td class="border-r border-slate-900 p-1.5 font-bold text-slate-900">{item.productName}</td>
									<td class="border-r border-slate-900 p-1.5 text-[11px] text-slate-700">{transaction.notes || '-'}</td>
									<td class="border-r border-slate-900 p-1.5 font-mono text-[11px] font-semibold">{item.sku}</td>
									<td class="border-r border-slate-900 p-1.5 text-center font-black">{item.qty}</td>
									<td class="p-1.5 text-center text-[11px] font-medium">Piece</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Modular Signatures & Footer -->
				<PrintSignaturesFooter
					receiptFooter={settings?.receiptFooter}
					businessName={settings?.businessName}
					recipientName={transaction.recipientName}
					docType="SURAT JALAN"
				/>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Standard Continuous Form 9.5in x 5.5in layout */
	.surat-jalan-page {
		width: 9.5in;
		min-height: 5.5in;
		box-sizing: border-box;
	}

	@media print {
		@page {
			size: 9.5in 5.5in;
			margin: 0.2in;
		}

		:global(body) {
			background: white !important;
			color: black !important;
		}

		.print\:hidden {
			display: none !important;
		}

		.surat-jalan-page {
			border: none !important;
			box-shadow: none !important;
			width: 100% !important;
			min-height: 100% !important;
			margin: 0 !important;
			padding: 0 !important;
		}
	}
</style>
