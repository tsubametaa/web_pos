<script lang="ts">
	import { Settings } from 'lucide-svelte';
</script>

<div
	class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-base/90 dark:bg-surface/60 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl shadow-2xs"
>
	<div class="space-y-1">
		<div class="flex items-center gap-2.5">
			<div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
				<Settings class="w-5 h-5" />
			</div>
			<h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
				Pengaturan Toko
			</h1>
		</div>
		<p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
			Kelola profil bisnis, mata uang, pajak, notifikasi stok, format cetak struk, dan keamanan akun Anda.
		</p>
	</div>
</div>
