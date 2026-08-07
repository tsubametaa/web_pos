<script lang="ts">
	import { formatDate } from '../../../lib/utils/date';

	interface Props {
		logoUrl?: string | null;
		businessName?: string | null;
		businessAddress?: string | null;
		businessPhone?: string | null;
		docType: 'INVOICE' | 'SURAT JALAN';
		docCode: string;
		docDate: string | Date;
	}

	let {
		logoUrl = null,
		businessName = 'NAMA BRAND / PERUSAHAAN',
		businessAddress = null,
		businessPhone = null,
		docType,
		docCode,
		docDate
	}: Props = $props();

	let imageError = $state(false);
</script>

<div class="border-b-2 border-slate-900 pb-3 mb-3">
	<div class="flex justify-between items-start">
		<!-- Left: Brand Logo & Information -->
		<div class="flex items-start gap-3.5 max-w-[65%]">
			{#if logoUrl && !imageError}
				<img
					src={logoUrl}
					alt="Logo Brand"
					class="h-14 w-auto max-w-[140px] object-contain shrink-0"
					onerror={() => (imageError = true)}
				/>
			{:else}
				<div class="h-12 w-12 rounded bg-slate-900 text-white font-black text-lg flex items-center justify-center shrink-0 uppercase shadow-xs">
					{(businessName || 'B')[0]}
				</div>
			{/if}

			<div class="space-y-0.5">
				<h1 class="text-base font-black text-slate-900 tracking-tight uppercase leading-snug">
					{businessName || 'NAMA PERUSAHAAN'}
				</h1>
				{#if businessAddress}
					<p class="text-[10px] text-slate-700 leading-tight">
						{businessAddress}
					</p>
				{/if}
				{#if businessPhone}
					<p class="text-[10px] text-slate-700 font-medium">
						Telp: {businessPhone}
					</p>
				{/if}
			</div>
		</div>

		<!-- Right: Document Title & Metadata -->
		<div class="text-right">
			<div class="inline-block px-3 py-1 bg-slate-900 text-white font-black text-sm uppercase tracking-wider rounded-xs mb-1">
				{docType}
			</div>
			<p class="text-xs font-black text-slate-900 font-mono">
				{docCode}
			</p>
			<p class="text-[10px] text-slate-600 font-medium mt-0.5">
				Tgl: {formatDate(docDate).slice(0, 11)}
			</p>
		</div>
	</div>
</div>
