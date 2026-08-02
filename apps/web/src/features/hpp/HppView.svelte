<script lang="ts">
	import { onMount } from 'svelte';
	import { formatCurrency } from '../../lib/utils/currency';
	import { calculateMargin } from '../../lib/utils/calculations';
	import { Search, BarChart3 } from 'lucide-svelte';
	import { api } from '../../core/api';
	import Spinner from '../../components/ui/Spinner.svelte';
	import type { UIProduct } from '../../types';

	let loading = $state(true);
	let products = $state<UIProduct[]>([]);
	let searchQuery = $state('');

	async function loadHppData() {
		try {
			const res = await api.get('/products');
			if (res.success) {
				products = res.products;
			}
		} catch (err) {
			console.error('Error loading HPP products:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadHppData();
	});

	const filteredProducts = $derived(
		products.filter(
			(p) =>
				p.isActive &&
				(p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	const totalStockValue = $derived(
		filteredProducts.reduce((sum, p) => sum + p.stock * p.costPrice, 0)
	);

	const totalPotentialRevenue = $derived(
		filteredProducts.reduce((sum, p) => sum + p.stock * p.sellingPrice, 0)
	);
</script>

{#if loading}
	<div class="h-64 flex items-center justify-center">
		<Spinner size="lg" />
	</div>
{:else}
	<div class="flex flex-col gap-5 text-ink">
		<!-- Header -->
		<div class="flex items-center gap-2">
			<BarChart3 class="w-5 h-5 text-sage-600 dark:text-accent" />
			<h2 class="text-base font-extrabold dark:text-white tracking-tight font-display">Analisis HPP & Margin Keuntungan</h2>
		</div>

		<!-- Summary Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div class="bg-surface border border-sage-200/50 rounded-2xl p-5 shadow-sm">
				<p class="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Total Nilai Stok (Modal)</p>
				<p class="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(totalStockValue)}</p>
			</div>
			<div class="bg-surface border border-sage-200/50 rounded-2xl p-5 shadow-sm">
				<p class="text-xs font-bold text-slate-500 dark:text-slate-350 uppercase tracking-wider mb-1">Potensi Pendapatan</p>
				<p class="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">{formatCurrency(totalPotentialRevenue)}</p>
			</div>
		</div>

		<!-- Search -->
		<div class="relative w-full sm:max-w-xs">
			<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari produk..."
				class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all"
			/>
		</div>

		<!-- HPP Table -->
		<div class="bg-surface border border-sage-200/50 rounded-2xl overflow-hidden shadow-sm">
			<div class="overflow-x-auto">
				<table class="w-full text-xs">
					<thead>
						<tr class="border-b border-sage-200/20 bg-base/20">
							<th class="text-left px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider">Produk</th>
							<th class="text-right px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider">HPP</th>
							<th class="text-right px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider">Harga Jual</th>
							<th class="text-right px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider hidden sm:table-cell">Margin</th>
							<th class="text-right px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider hidden md:table-cell">Stok</th>
							<th class="text-right px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider hidden lg:table-cell">Nilai Stok</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-sage-200/10">
						{#each filteredProducts as p (p.id)}
							{@const marginPercent = calculateMargin(p.costPrice, p.sellingPrice)}
							<tr class="hover:bg-base/20 transition-colors">
								<td class="px-5 py-3.5">
									<p class="font-bold text-slate-800 dark:text-white">{p.name}</p>
									<p class="text-[10px] font-mono text-slate-400 mt-0.5">{p.sku}</p>
								</td>
								<td class="px-5 py-3.5 text-right font-mono font-bold text-slate-700 dark:text-slate-200">{formatCurrency(p.costPrice)}</td>
								<td class="px-5 py-3.5 text-right font-mono font-bold text-sage-600 dark:text-accent">{formatCurrency(p.sellingPrice)}</td>
								<td class="px-5 py-3.5 text-right hidden sm:table-cell">
									<span class="font-bold {marginPercent >= 20 ? 'text-emerald-600 dark:text-emerald-400' : marginPercent >= 10 ? 'text-amber-600' : 'text-rose-600'}">
										{marginPercent.toFixed(1)}%
									</span>
								</td>
								<td class="px-5 py-3.5 text-right font-mono hidden md:table-cell text-slate-700 dark:text-slate-300">{p.stock} {p.unit}</td>
								<td class="px-5 py-3.5 text-right font-mono font-bold hidden lg:table-cell text-slate-850 dark:text-white">{formatCurrency(p.stock * p.costPrice)}</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="py-16 text-center text-slate-455 font-bold">Tidak ada produk</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
