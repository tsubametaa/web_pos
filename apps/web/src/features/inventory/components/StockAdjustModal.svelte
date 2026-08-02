<script lang="ts">
	import { api } from '../../../core/api';
	import { toast } from '../../../lib/utils/toast.svelte';
	import { X, Plus, Minus } from 'lucide-svelte';
	import type { UIProduct } from '../../../types';

	interface Props {
		product: UIProduct;
		onclose: () => void;
		onsave: () => void;
	}

	let { product, onclose, onsave }: Props = $props();

	let adjustment = $state(0);
	let adjustmentNotes = $state('');
	let isLoading = $state(false);

	const newStock = $derived(product.stock + adjustment);

	async function handleSave() {
		if (adjustment === 0) { toast.warning('Jumlah penyesuaian tidak boleh 0.'); return; }
		if (!adjustmentNotes.trim()) { toast.error('Alasan penyesuaian wajib diisi.'); return; }
		if (newStock < 0) { toast.error('Stok tidak boleh kurang dari 0.'); return; }

		isLoading = true;
		try {
			const res = await api.put('/products', {
				id: product.id,
				stockAdjustment: adjustment,
				adjustmentNotes: adjustmentNotes.trim()
			});
			if (res.success) {
				onsave();
			} else {
				throw new Error(res.error || 'Gagal menyesuaikan stok.');
			}
		} catch (err: any) {
			toast.error(err.message || 'Gagal menyesuaikan stok.');
		} finally {
			isLoading = false;
		}
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
	onclick={onclose}
	role="dialog"
	aria-modal="true"
>
	<div
		class="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl border border-sage-200/50 overflow-hidden text-ink"
		onclick={(e) => e.stopPropagation()}
		role="presentation"
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-6 py-4 border-b border-sage-200/25 bg-base/20">
			<div>
				<h2 class="text-sm font-extrabold text-slate-800 dark:text-white">Penyesuaian Stok</h2>
				<p class="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">{product.name}</p>
			</div>
			<button type="button" onclick={onclose} class="p-2 text-slate-400 hover:text-slate-700 hover:bg-base rounded-xl cursor-pointer transition-all bg-transparent border-0">
				<X class="w-4 h-4" />
			</button>
		</div>

		<div class="px-6 py-5 flex flex-col gap-5">
			<!-- Current Stock -->
			<div class="bg-base border border-sage-200/50 rounded-2xl p-4 text-center">
				<p class="text-xs font-bold text-slate-500 dark:text-slate-350 uppercase tracking-wider mb-1">Stok Saat Ini</p>
				<p class="text-3xl font-black text-slate-900 dark:text-white font-mono">{product.stock}</p>
				<p class="text-xs text-slate-400 mt-0.5">{product.unit}</p>
			</div>

			<!-- Adjustment Input -->
			<div>
				<label class="block text-xs font-bold text-slate-650 dark:text-slate-300 mb-2">Jumlah Penyesuaian</label>
				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={() => adjustment--}
						class="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 text-rose-600 dark:text-rose-450 hover:bg-rose-100 rounded-xl cursor-pointer transition-all"
					>
						<Minus class="w-4 h-4" />
					</button>
					<input
						type="number"
						bind:value={adjustment}
						class="flex-1 text-center px-3 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-lg font-mono font-black text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all"
					/>
					<button
						type="button"
						onclick={() => adjustment++}
						class="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-100 rounded-xl cursor-pointer transition-all"
					>
						<Plus class="w-4 h-4" />
					</button>
				</div>
				<p class="text-xs text-center mt-2 font-bold {newStock < 0 ? 'text-rose-600' : 'text-slate-500'}">
					Stok baru: <span class="font-mono">{newStock} {product.unit}</span>
				</p>
			</div>

			<!-- Notes -->
			<div>
				<label class="block text-xs font-bold text-slate-650 dark:text-slate-300 mb-1.5" for="adj-notes">Alasan Penyesuaian *</label>
				<textarea
					id="adj-notes"
					bind:value={adjustmentNotes}
					rows="2"
					placeholder="Contoh: Terima barang dari supplier..."
					class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-xs text-slate-700 dark:text-slate-200 resize-none focus:outline-none focus:ring-4 transition-all"
				></textarea>
			</div>

			<button
				type="button"
				onclick={handleSave}
				disabled={isLoading || newStock < 0 || adjustment === 0}
				class="w-full py-3.5 bg-sage-500 hover:bg-sage-600 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-black rounded-xl cursor-pointer transition-all shadow-md shadow-sage-500/15"
			>
				{#if isLoading}
					<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></span>
					Menyimpan...
				{:else}
					Simpan Penyesuaian
				{/if}
			</button>
		</div>
	</div>
</div>
