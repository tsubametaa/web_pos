<script lang="ts">
	import {
		Building2,
		Upload,
		Phone,
		MapPin,
		Coins,
		Percent,
		Bell,
		FileText,
		Save,
		Printer
	} from 'lucide-svelte';

	interface Props {
		businessName: string;
		logoUrl: string;
		businessPhone: string;
		businessAddress: string;
		currencySymbol: string;
		taxRate: number;
		lowStockThreshold: number;
		receiptFooter: string;
		profileSaving: boolean;
		uploadingLogo: boolean;
		onLogoUpload: (e: Event) => void;
		onSubmit: (e: SubmitEvent) => void;
	}

	let {
		businessName = $bindable(),
		logoUrl = $bindable(),
		businessPhone = $bindable(),
		businessAddress = $bindable(),
		currencySymbol = $bindable(),
		taxRate = $bindable(),
		lowStockThreshold = $bindable(),
		receiptFooter = $bindable(),
		profileSaving,
		uploadingLogo,
		onLogoUpload,
		onSubmit
	}: Props = $props();

	// Live Preview Computations for thermal receipt
	const mockSubtotal = 45000;
	const mockTax = $derived((mockSubtotal * (taxRate || 0)) / 100);
	const mockTotal = $derived(mockSubtotal + mockTax);
</script>

<div class="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start select-none">
	<!-- Left: Profile Form Card -->
	<div class="xl:col-span-3">
		<form
			onsubmit={onSubmit}
			class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-6 shadow-2xs space-y-6"
		>
			<!-- Section 1: Informasi Bisnis & Logo -->
			<div class="space-y-4">
				<div class="border-b border-slate-200/60 dark:border-emerald-950/60 pb-3">
					<h2 class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
						Informasi Profil Bisnis & Logo
					</h2>
					<p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium mt-0.5">
						Identitas brand & logo yang ditampilkan pada cetak Invoice dan Surat Jalan.
					</p>
				</div>

				<!-- Logo Upload Box -->
				<div class="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-base p-4 rounded-xl border border-slate-200/60 dark:border-emerald-950/60">
					{#if logoUrl}
						<img src={logoUrl} alt="Logo Brand" class="h-16 w-16 object-contain rounded-lg border bg-white p-1" />
					{:else}
						<div class="h-16 w-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
							<Building2 class="w-6 h-6" />
						</div>
					{/if}
					<div class="flex-1 space-y-1 text-center sm:text-left">
						<label class="block text-xs font-bold text-slate-700 dark:text-slate-200" for="logo-upload-input">
							Logo Brand (Gambar Surat Jalan & Invoice)
						</label>
						<p class="text-[11px] text-slate-400">
							Format: JPG, PNG, WEBP. Maksimal 5 MB.
						</p>
						<div class="pt-1">
							<label class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs" for="logo-upload-input">
								<Upload class="w-3.5 h-3.5" />
								<span>{uploadingLogo ? 'Mengunggah...' : 'Pilih Gambar Logo'}</span>
							</label>
							<input id="logo-upload-input" type="file" accept="image/*" onchange={onLogoUpload} disabled={uploadingLogo} class="hidden" />
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label
							class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
							for="biz-name"
						>
							Nama Toko / Usaha *
						</label>
						<div class="relative">
							<input
								id="biz-name"
								type="text"
								bind:value={businessName}
								placeholder="Contoh: Coffee Shop Kita"
								required
								disabled={profileSaving}
								class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
							/>
						</div>
					</div>

					<div>
						<label
							class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
							for="biz-phone"
						>
							Nomor Telepon Kontak
						</label>
						<div class="relative">
							<Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
							<input
								id="biz-phone"
								type="text"
								bind:value={businessPhone}
								placeholder="Contoh: 081234567890"
								disabled={profileSaving}
								class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
							/>
						</div>
					</div>
				</div>

				<div>
					<label
						class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
						for="biz-addr"
					>
						Alamat Lengkap Toko
					</label>
					<div class="relative">
						<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
						<input
							id="biz-addr"
							type="text"
							bind:value={businessAddress}
							placeholder="Contoh: Jl. Diponegoro No. 45, Bandung"
							disabled={profileSaving}
							class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
						/>
					</div>
				</div>
			</div>

			<!-- Section 2: Standar Kasir & Keuangan -->
			<div class="space-y-4 pt-2 border-t border-slate-200/40 dark:border-emerald-950/40">
				<div class="border-b border-slate-200/60 dark:border-emerald-950/60 pb-3">
					<h2 class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
						Standar Kasir & Struk
					</h2>
					<p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium mt-0.5">
						Pengaturan mata uang, PPN, notifikasi stok, dan footer pencetakan.
					</p>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label
							class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
							for="biz-curr"
						>
							Simbol Mata Uang *
						</label>
						<div class="relative">
							<Coins class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
							<input
								id="biz-curr"
								type="text"
								bind:value={currencySymbol}
								placeholder="Rp"
								required
								disabled={profileSaving}
								class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
							/>
						</div>
					</div>

					<div>
						<label
							class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
							for="biz-tax"
						>
							Tarif PPN (%) *
						</label>
						<div class="relative">
							<Percent class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
							<input
								id="biz-tax"
								type="number"
								bind:value={taxRate}
								placeholder="0"
								min="0"
								max="100"
								step="0.1"
								required
								disabled={profileSaving}
								class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
							/>
						</div>
					</div>

					<div>
						<label
							class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
							for="biz-thresh"
						>
							Batas Stok Tipis *
						</label>
						<div class="relative">
							<Bell class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
							<input
								id="biz-thresh"
								type="number"
								bind:value={lowStockThreshold}
								placeholder="10"
								min="0"
								required
								disabled={profileSaving}
								class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
							/>
						</div>
					</div>
				</div>

				<div>
					<label
						class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
						for="biz-footer"
					>
						Catatan Struk Footer
					</label>
					<div class="relative">
						<FileText class="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
						<textarea
							id="biz-footer"
							bind:value={receiptFooter}
							rows="2"
							placeholder="Contoh: Barang yang sudah dibeli tidak dapat ditukar."
							disabled={profileSaving}
							class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
						></textarea>
					</div>
				</div>
			</div>

			<!-- Submit Button -->
			<div class="pt-3 border-t border-slate-200/60 dark:border-emerald-950/60 flex justify-end">
				<button
					type="submit"
					disabled={profileSaving}
					class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs hover:shadow"
				>
					{#if profileSaving}
						<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
						<span>Menyimpan...</span>
					{:else}
						<Save class="w-4 h-4" />
						<span>Simpan Perubahan Profil</span>
					{/if}
				</button>
			</div>
		</form>
	</div>

	<!-- Right: Real-time Live Receipt Preview Card -->
	<div class="xl:col-span-2 xl:sticky xl:top-6">
		<div
			class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs"
		>
			<div
				class="flex items-center justify-between border-b border-slate-200/60 dark:border-emerald-950/60 pb-2.5"
			>
				<div class="flex items-center gap-2">
					<Printer class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
					<span class="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
						Live Preview Struk
					</span>
				</div>
				<span
					class="text-[10px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20"
				>
					Thermal 80mm
				</span>
			</div>

			<!-- Physical Receipt Card Rendering -->
			<div
				class="bg-white text-slate-900 border border-slate-200 rounded-xl p-5 shadow-sm font-mono text-[9px] leading-relaxed flex flex-col w-full mx-auto select-none overflow-hidden"
			>
				<!-- Receipt Header -->
				<div class="text-center font-bold mb-3 flex flex-col gap-0.5">
					<span class="text-xs block uppercase tracking-wide truncate text-slate-900 font-black">
						{businessName || 'NAMA TOKO ANDA'}
					</span>
					{#if businessAddress}
						<span class="font-normal block text-[8px] text-slate-600 truncate">
							{businessAddress}
						</span>
					{/if}
					{#if businessPhone}
						<span class="font-normal block text-[8px] text-slate-600 truncate">
							Telp: {businessPhone}
						</span>
					{/if}
				</div>

				<!-- Order Info -->
				<div
					class="border-t border-b border-dashed border-slate-300 py-2 my-2 flex flex-col gap-1 text-[8px]"
				>
					<div class="flex justify-between">
						<span class="text-slate-600">No. Transaksi:</span>
						<span class="font-bold">TRX-20260805-001</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-600">Tanggal:</span>
						<span>05/08/2026 21:00</span>
					</div>
				</div>

				<!-- Mock Sample Item -->
				<div class="flex flex-col gap-1.5 my-2">
					<div>
						<div class="flex justify-between font-bold text-slate-900">
							<span>Kopi Susu Aren (Large)</span>
							<span>45.000</span>
						</div>
						<div class="text-[8px] text-slate-500">
							1 &times; 45.000
						</div>
					</div>
				</div>

				<!-- Total Calculations -->
				<div class="border-t border-dashed border-slate-300 pt-2 flex flex-col gap-1 text-[8px]">
					<div class="flex justify-between">
						<span class="text-slate-600">Subtotal:</span>
						<span class="font-bold">45.000</span>
					</div>

					{#if Number(taxRate) > 0}
						<div class="flex justify-between">
							<span class="text-slate-600">PPN ({taxRate}%):</span>
							<span class="font-bold">{mockTax.toLocaleString('id-ID')}</span>
						</div>
					{/if}

					<div
						class="flex justify-between font-black text-[10px] border-t border-slate-300 pt-1.5 mt-1 text-slate-900"
					>
						<span>TOTAL ({currencySymbol}):</span>
						<span>{currencySymbol} {mockTotal.toLocaleString('id-ID')}</span>
					</div>
				</div>

				<!-- Receipt Footer Note -->
				{#if receiptFooter}
					<div
						class="text-center text-[8px] text-slate-600 border-t border-dashed border-slate-300 pt-2.5 mt-3 whitespace-pre-line leading-normal font-medium"
					>
						{receiptFooter}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
