<script lang="ts">
	import { Plus, Building2 } from 'lucide-svelte';
	import { activeStore } from '../../../core/activeStore.svelte';

	interface Props {
		newBrandName: string;
		newBrandPhone: string;
		newBrandAddress: string;
		brandSaving: boolean;
		onSubmit: (e: SubmitEvent) => void;
	}

	let {
		newBrandName = $bindable(),
		newBrandPhone = $bindable(),
		newBrandAddress = $bindable(),
		brandSaving,
		onSubmit
	}: Props = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start select-none">
	<!-- Left: Add New Brand Form -->
	<div class="md:col-span-1">
		<form
			onsubmit={onSubmit}
			class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-6 shadow-2xs space-y-4"
		>
			<div class="border-b border-slate-200/60 dark:border-emerald-950/60 pb-3 flex items-center gap-2.5">
				<div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
					<Plus class="w-4 h-4" />
				</div>
				<div>
					<h2 class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
						Tambah Brand Baru
					</h2>
					<p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
						Buat unit brand / anak perusahaan baru.
					</p>
				</div>
			</div>

			<div>
				<label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="brand-new-name">
					Nama Brand / Perusahaan *
				</label>
				<input
					id="brand-new-name"
					type="text"
					bind:value={newBrandName}
					placeholder="Contoh: PT Perusahaan Kedua"
					required
					disabled={brandSaving}
					class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
				/>
			</div>

			<div>
				<label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="brand-new-phone">
					No Telepon Kontak
				</label>
				<input
					id="brand-new-phone"
					type="text"
					bind:value={newBrandPhone}
					placeholder="Contoh: 081299998888"
					disabled={brandSaving}
					class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
				/>
			</div>

			<div>
				<label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="brand-new-addr">
					Alamat Lengkap Perusahaan
				</label>
				<textarea
					id="brand-new-addr"
					bind:value={newBrandAddress}
					rows="2"
					placeholder="Alamat kantor / gudang brand..."
					disabled={brandSaving}
					class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
				></textarea>
			</div>

			<button
				type="submit"
				disabled={brandSaving || !newBrandName.trim()}
				class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs"
			>
				{#if brandSaving}
					<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
					<span>Menyimpan...</span>
				{:else}
					<Plus class="w-4 h-4" />
					<span>Tambah Brand</span>
				{/if}
			</button>
		</form>
	</div>

	<!-- Right: List of Registered Brands -->
	<div class="md:col-span-2 space-y-4">
		<div class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-6 shadow-2xs">
			<div class="border-b border-slate-200/60 dark:border-emerald-950/60 pb-3 flex items-center justify-between">
				<div>
					<h2 class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
						Daftar Brand Terdaftar ({activeStore.stores.length})
					</h2>
					<p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
						Pilih brand untuk beralih konteks aktif.
					</p>
				</div>
			</div>

			<div class="divide-y divide-slate-200/60 dark:divide-emerald-950/60 mt-2">
				{#each activeStore.stores as store}
					<div class="py-3.5 flex items-center justify-between gap-3">
						<div class="flex items-center gap-3">
							{#if store.logoUrl}
								<img src={store.logoUrl} alt={store.name} class="w-10 h-10 object-contain rounded-lg border bg-white p-1" />
							{:else}
								<div class="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center border border-emerald-500/20">
									<Building2 class="w-5 h-5" />
								</div>
							{/if}
							<div>
								<h4 class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
									{store.name}
									{#if store.id === activeStore.currentStore?.id}
										<span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full">Aktif</span>
									{/if}
								</h4>
								<p class="text-[11px] text-slate-400 truncate max-w-xs">
									{store.address || 'Alamat belum diatur'} {store.phone ? `• Telp: ${store.phone}` : ''}
								</p>
							</div>
						</div>

						<div class="flex items-center gap-2">
							{#if store.id !== activeStore.currentStore?.id}
								<button
									type="button"
									onclick={() => activeStore.selectStore(store.id)}
									class="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30 cursor-pointer transition-all"
								>
									Pilih Brand
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
