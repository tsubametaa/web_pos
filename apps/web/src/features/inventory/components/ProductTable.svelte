<script lang="ts">
	import { formatCurrency } from '../../../lib/utils/currency';
	import { fuzzySearchSubset } from '../../../lib/utils/fuzzy-search';
	import { Search, Edit, Package2, Share2, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-svelte';
	import type { UIProduct } from '../../../types';

	interface Props {
		products: UIProduct[];
		onedit: (p: UIProduct) => void;
		onadjust: (p: UIProduct) => void;
		onshare: (p: UIProduct) => void;
		ontoggle: (p: UIProduct) => void;
	}

	let { products, onedit, onadjust, onshare, ontoggle }: Props = $props();

	let searchQuery = $state('');
	let showInactive = $state(false);

	const filteredProducts = $derived(() => {
		// 1. Filter by active status first
		const visible = showInactive ? products : products.filter((p) => p.isActive);
		// 2. Then fuzzy-search within that subset
		return fuzzySearchSubset(visible, searchQuery);
	});

	const isSearchActive = $derived(searchQuery.trim().length >= 2);
</script>

<div class="flex flex-col gap-4 text-ink">
	<!-- Filters -->
	<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
		<div class="relative w-full sm:max-w-xs">
			<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari nama, SKU, atau kategori..."
				class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all"
			/>
			{#if isSearchActive}
				<span class="absolute -bottom-5 left-0 text-[10px] text-slate-400 dark:text-slate-350 font-medium">
					{filteredProducts().length} produk ditemukan
				</span>
			{/if}
		</div>
		<label class="flex items-center gap-2 cursor-pointer select-none">
			<input type="checkbox" bind:checked={showInactive} class="w-4 h-4 rounded accent-sage-500 cursor-pointer" />
			<span class="text-xs font-bold text-slate-650 dark:text-slate-300">Tampilkan non-aktif</span>
		</label>
	</div>

	<!-- Table -->
	<div class="bg-surface border border-sage-200/50 rounded-2xl overflow-hidden shadow-sm">
		<div class="overflow-x-auto">
			<table class="w-full text-xs">
				<thead>
					<tr class="border-b border-sage-200/20 bg-base/20">
						<th class="text-left px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-300 uppercase tracking-wider">Produk</th>
						<th class="text-left px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-300 uppercase tracking-wider hidden md:table-cell">Kategori</th>
						<th class="text-right px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-300 uppercase tracking-wider">Harga Jual</th>
						<th class="text-center px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-300 uppercase tracking-wider">Stok</th>
						<th class="text-center px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-300 uppercase tracking-wider hidden sm:table-cell">Status</th>
						<th class="px-5 py-3.5 text-center font-extrabold text-slate-650 dark:text-slate-300 uppercase tracking-wider">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-sage-200/10">
					{#each filteredProducts() as product (product.id)}
						<tr class="hover:bg-base/20 transition-colors {!product.isActive ? 'opacity-50' : ''}">
							<td class="px-5 py-3.5">
								<div>
									<p class="font-bold text-slate-800 dark:text-white">{product.name}</p>
									<p class="text-[10px] font-mono text-slate-400 mt-0.5">{product.sku} · {product.unit}</p>
								</div>
							</td>
							<td class="px-5 py-3.5 hidden md:table-cell">
								<span class="px-2.5 py-1 bg-base dark:bg-slate-900 border border-sage-200/40 text-slate-600 dark:text-slate-300 rounded-full font-bold text-[10px]">{product.category}</span>
							</td>
							<td class="px-5 py-3.5 text-right font-mono">
								<span class="font-extrabold text-sage-600 dark:text-accent">{formatCurrency(product.sellingPrice)}</span>
							</td>
							<td class="px-5 py-3.5 text-center">
								<span class="font-mono font-bold {product.stock <= 0 ? 'text-rose-600' : product.stock <= product.minStock ? 'text-amber-600' : 'text-slate-800 dark:text-slate-200'}">
									{product.stock}
									{#if product.stock <= product.minStock && product.stock > 0}
										<AlertTriangle class="w-3 h-3 inline text-amber-500 ml-0.5" />
									{/if}
								</span>
							</td>
							<td class="px-5 py-3.5 text-center hidden sm:table-cell">
								<button
									type="button"
									onclick={() => ontoggle(product)}
									class="cursor-pointer transition-colors bg-transparent border-0"
									title={product.isActive ? 'Nonaktifkan' : 'Aktifkan'}
								>
									{#if product.isActive}
										<ToggleRight class="w-6 h-6 text-emerald-500 hover:text-emerald-600" />
									{:else}
										<ToggleLeft class="w-6 h-6 text-slate-300 dark:text-slate-650 hover:text-slate-400" />
									{/if}
								</button>
							</td>
							<td class="px-5 py-3.5 text-center">
								<div class="flex items-center justify-center gap-1">
									<button
										type="button"
										onclick={() => onedit(product)}
										class="p-1.5 text-slate-400 hover:text-sage-600 hover:bg-base rounded-lg cursor-pointer transition-all bg-transparent border-0"
										title="Edit Produk"
									>
										<Edit class="w-3.5 h-3.5" />
									</button>
									<button
										type="button"
										onclick={() => onadjust(product)}
										class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-base rounded-lg cursor-pointer transition-all bg-transparent border-0"
										title="Sesuaikan Stok"
									>
										<Package2 class="w-3.5 h-3.5" />
									</button>
									<button
										type="button"
										onclick={() => onshare(product)}
										class="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-base rounded-lg cursor-pointer transition-all bg-transparent border-0"
										title="Bagikan / QR Code"
									>
										<Share2 class="w-3.5 h-3.5" />
									</button>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="py-16 text-center text-slate-450 font-bold">
								{isSearchActive ? `Tidak ada produk cocok dengan "${searchQuery}"` : 'Tidak ada produk ditemukan'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
