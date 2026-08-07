<script lang="ts">
	interface Props {
		receiptFooter?: string | null;
		businessName?: string | null;
		recipientName?: string | null;
		docType: 'INVOICE' | 'SURAT JALAN';
	}

	let {
		receiptFooter = null,
		businessName = 'Pengirim',
		recipientName = 'Penerima',
		docType
	}: Props = $props();
</script>

<div class="mt-auto pt-3 border-t border-slate-300">
	<div class="flex justify-between items-end text-xs">
		<!-- Left: Notes & Footer Message -->
		<div class="max-w-[45%] space-y-1">
			{#if receiptFooter}
				<p class="text-[10px] text-slate-600 italic leading-snug">
					<strong>Catatan:</strong> {receiptFooter}
				</p>
			{:else}
				<p class="text-[10px] text-slate-500 italic">
					* Barang yang sudah dibeli tidak dapat ditukar/dikembalikan tanpa perjanjian.
				</p>
			{/if}
		</div>

		<!-- Right: Signatures Grid -->
		<div class="flex gap-12 text-center text-[11px]">
			<!-- Sender Signature -->
			<div class="w-28 flex flex-col items-center">
				<span class="font-bold text-slate-800 uppercase">Hormat Kami,</span>
				<div class="h-12 border-b border-dashed border-slate-400 w-full my-1"></div>
				<span class="font-bold text-slate-900 truncate max-w-[110px]">
					{businessName || 'Pengirim'}
				</span>
			</div>

			<!-- Recipient Signature -->
			<div class="w-28 flex flex-col items-center">
				<span class="font-bold text-slate-800 uppercase">Penerima,</span>
				<div class="h-12 border-b border-dashed border-slate-400 w-full my-1"></div>
				<span class="font-bold text-slate-900 truncate max-w-[110px]">
					{recipientName || 'Penerima'}
				</span>
			</div>
		</div>
	</div>

	<!-- Page Footer Tag -->
	<div class="flex justify-between items-center text-[9px] text-slate-500 pt-2 border-t border-slate-200 mt-2">
		<span>Dicetak secara otomatis oleh POS System</span>
		<span class="font-mono font-bold">Halaman 1 / 1</span>
	</div>
</div>
