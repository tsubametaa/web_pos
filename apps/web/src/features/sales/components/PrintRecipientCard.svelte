<script lang="ts">
	interface Props {
		recipientName?: string | null;
		recipientPhone?: string | null;
		recipientAddress?: string | null;
		paymentMethod?: string | null;
		status?: string | null;
		docType: 'INVOICE' | 'SURAT JALAN';
	}

	let {
		recipientName = null,
		recipientPhone = null,
		recipientAddress = null,
		paymentMethod = null,
		status = null,
		docType
	}: Props = $props();
</script>

<div class="grid grid-cols-12 gap-3 text-xs mb-3 bg-slate-50 border border-slate-300 p-2.5 rounded-sm">
	<!-- Left Column: Recipient Details -->
	<div class="col-span-7 space-y-1">
		<span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 border-b border-slate-200 pb-0.5">
			Kepada Yth. (Penerima):
		</span>
		<div class="grid grid-cols-12 gap-1 text-[11px]">
			<span class="col-span-4 font-semibold text-slate-700">Nama Penerima</span>
			<span class="col-span-8 font-bold text-slate-900">: {recipientName || '-'}</span>
		</div>
		<div class="grid grid-cols-12 gap-1 text-[11px]">
			<span class="col-span-4 font-semibold text-slate-700">No. Telepon/HP</span>
			<span class="col-span-8 font-mono font-medium text-slate-900">: {recipientPhone || '-'}</span>
		</div>
		<div class="grid grid-cols-12 gap-1 text-[11px]">
			<span class="col-span-4 font-semibold text-slate-700">Alamat Kirim</span>
			<span class="col-span-8 text-slate-900 leading-tight">: {recipientAddress || '-'}</span>
		</div>
	</div>

	<!-- Right Column: Document Specific Details -->
	<div class="col-span-5 space-y-1 pl-3 border-l border-slate-300">
		<span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 border-b border-slate-200 pb-0.5">
			Informasi {docType === 'INVOICE' ? 'Pembayaran' : 'Pengiriman'}:
		</span>
		{#if docType === 'INVOICE'}
			<div class="grid grid-cols-12 gap-1 text-[11px]">
				<span class="col-span-5 font-semibold text-slate-700">Metode Bayar</span>
				<span class="col-span-7 font-bold uppercase text-slate-900">: {paymentMethod || 'CASH'}</span>
			</div>
			<div class="grid grid-cols-12 gap-1 text-[11px]">
				<span class="col-span-5 font-semibold text-slate-700">Status Nota</span>
				<span class="col-span-7 font-bold uppercase text-red-700">: {status === 'voided' ? 'BATAL' : 'LUNAS (PAID)'}</span>
			</div>
		{:else}
			<div class="grid grid-cols-12 gap-1 text-[11px]">
				<span class="col-span-5 font-semibold text-slate-700">Ekspedisi</span>
				<span class="col-span-7 font-bold uppercase text-slate-900">: Kurir Internal / Sendiri</span>
			</div>
			<div class="grid grid-cols-12 gap-1 text-[11px]">
				<span class="col-span-5 font-semibold text-slate-700">Status Kirim</span>
				<span class="col-span-7 font-bold uppercase text-slate-900">: DALAM PENGIRIMAN</span>
			</div>
		{/if}
	</div>
</div>
