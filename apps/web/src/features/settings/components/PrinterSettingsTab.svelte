<script lang="ts">
	import { Printer, Check } from 'lucide-svelte';
</script>

<div class="space-y-6 select-none">
	<!-- Hardware Connection Status Card -->
	<div class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-2xs space-y-4">
		<div class="flex items-center gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
			<div class="p-2.5 rounded-xl bg-accent-soft text-accent">
				<Printer class="w-6 h-6" />
			</div>
			<div>
				<h2 class="text-base font-extrabold dark:text-white tracking-tight">
					Konfigurasi Printer USB (Kabel Tercolok ke Device)
				</h2>
				<p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
					Panduan dan pengujian koneksi printer dot-matrix / continuous form / thermal yang tercolok via USB.
				</p>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
			<div class="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-base/40 space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold text-slate-700 dark:text-slate-200">Jenis Koneksi Hardware</span>
					<span class="px-2.5 py-1 text-[10px] font-extrabold bg-accent-soft text-accent-soft-text rounded-full border border-accent/20">
						Wired USB Cable
					</span>
				</div>
				<p class="text-xs text-slate-500">
					Printer terhubung langsung via kabel USB ke PC/Laptop kasir (Tanpa Bluetooth/Wi-Fi).
				</p>
			</div>

			<div class="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-base/40 space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold text-slate-700 dark:text-slate-200">Ukuran Kertas Utama</span>
					<span class="px-2.5 py-1 text-[10px] font-extrabold bg-sky-500/10 text-sky-700 dark:text-sky-300 rounded-full border border-sky-500/20">
						Continuous Form 9.5" x 5.5"
					</span>
				</div>
				<p class="text-xs text-slate-500">
					Format gabungan Invoice (Lembar 1) dan Surat Jalan (Lembar 2) berurutan.
				</p>
			</div>
		</div>
	</div>

	<!-- Simple User Guide Card -->
	<div class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-2xs space-y-4">
		<h3 class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
			<Check class="w-4 h-4 text-accent" />
			Cara Mudah Menggunakan Printer USB Tercolok
		</h3>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
			<div class="p-4 bg-slate-100/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1.5">
				<div class="w-6 h-6 rounded-full bg-accent text-white font-extrabold flex items-center justify-center text-xs">1</div>
				<h4 class="font-bold text-slate-900 dark:text-white">Colok Kabel USB</h4>
				<p class="text-slate-500">Sambungkan kabel USB printer ke laptop atau komputer kasir.</p>
			</div>

			<div class="p-4 bg-slate-100/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1.5">
				<div class="w-6 h-6 rounded-full bg-accent text-white font-extrabold flex items-center justify-center text-xs">2</div>
				<h4 class="font-bold text-slate-900 dark:text-white">Klik Tombol Cetak</h4>
				<p class="text-slate-500">Setelah transaksi selesai, klik tombol <span class="font-bold text-accent">"Cetak Invoice & Surat Jalan"</span>.</p>
			</div>

			<div class="p-4 bg-slate-100/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1.5">
				<div class="w-6 h-6 rounded-full bg-accent text-white font-extrabold flex items-center justify-center text-xs">3</div>
				<h4 class="font-bold text-slate-900 dark:text-white">Pilih Printer USB</h4>
				<p class="text-slate-500">Pilih nama printer USB Anda pada jendela cetak. Browser akan mengingatnya secara otomatis!</p>
			</div>
		</div>
	</div>

	<!-- Test Print Button Card -->
	<div class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
		<div>
			<h3 class="text-sm font-extrabold text-slate-900 dark:text-white">Uji Coba Printer USB</h3>
			<p class="text-xs text-slate-500">Tes pencetakan halaman sampel 9.5" x 5.5" ke printer USB yang sedang tercolok.</p>
		</div>

		<button
			type="button"
			onclick={() => window.print()}
			class="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-2 shrink-0"
		>
			<Printer class="w-4 h-4" />
			<span>Tes Print Sekarang</span>
		</button>
	</div>
</div>
