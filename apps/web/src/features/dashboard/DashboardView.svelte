<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '../../core/api';
	import { formatCurrency } from '../../lib/utils/currency';
	import { formatDate } from '../../lib/utils/date';
	import Spinner from '../../components/ui/Spinner.svelte';
	import {
		TrendingUp,
		ShoppingBag,
		Package,
		AlertTriangle,
		ArrowUpRight,
		Clock,
		Coins,
		ShoppingCart
	} from 'lucide-svelte';
	import SalesChart from './components/SalesChart.svelte';

	let loading = $state(true);
	let data = $state<any>(null);

	async function loadDashboardData() {
		try {
			const res = await api.get('/dashboard/stats');
			if (res.success) {
				data = res;
			}
		} catch (err) {
			console.error('Error fetching dashboard stats:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadDashboardData();
	});

	const stats = $derived(
		data ? [
			{
				label: 'Penjualan Hari Ini',
				value: formatCurrency(data.stats?.todaySales ?? 0),
				icon: TrendingUp,
				color: 'text-emerald-600 dark:text-emerald-400',
				bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50'
			},
			{
				label: 'Profit Hari Ini',
				value: formatCurrency(data.stats?.todayProfit ?? 0),
				icon: Coins,
				color: 'text-sage-600 dark:text-accent',
				bg: 'bg-sage-50 dark:bg-sage-950/40 border-sage-200/50'
			},
			{
				label: 'Transaksi Hari Ini',
				value: data.stats?.todayTransactions ?? 0,
				icon: ShoppingBag,
				color: 'text-blue-600 dark:text-blue-400',
				bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/50'
			},
			{
				label: 'Stok Menipis',
				value: data.stats?.lowStockCount ?? 0,
				icon: AlertTriangle,
				color: 'text-amber-600 dark:text-amber-400',
				bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/50'
			}
		] : []
	);
</script>

{#if loading}
	<div class="h-64 flex items-center justify-center">
		<Spinner size="lg" />
	</div>
{:else if data}
	<div class="flex flex-col gap-4 text-ink">
		<!-- Stats Grid -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
			{#each stats as stat}
				{@const Icon = stat.icon}
				<div class="bg-surface border border-sage-200/40 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
					<div class="flex-1 min-w-0">
						<span class="text-[10px] font-bold text-slate-500 dark:text-slate-350 uppercase tracking-wider block leading-none">{stat.label}</span>
						<span class="text-lg font-black text-slate-800 dark:text-white tracking-tight font-mono mt-1.5 block">{stat.value}</span>
					</div>
					<div class="p-2.5 rounded-xl {stat.bg} border flex items-center justify-center shrink-0 shadow-inner">
						<Icon class="w-4 h-4 {stat.color}" />
					</div>
				</div>
			{/each}
		</div>

		<!-- Analytics -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
			<div class="lg:col-span-2 flex flex-col gap-4">
				<SalesChart salesTrend={data.salesTrend ?? []} />

				<!-- Recent Transactions -->
				<div class="bg-surface border border-sage-200/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
					<div class="flex items-center justify-between px-4 py-3.5 border-b border-sage-200/20 bg-base/10">
						<div class="flex items-center gap-2">
							<Clock class="w-4 h-4 text-sage-650" />
							<h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Transaksi Terbaru</h3>
						</div>
						<a href="#/sales" class="text-[10px] font-bold text-sage-600 dark:text-accent hover:underline flex items-center gap-0.5 transition-colors">
							Semua <ArrowUpRight class="w-3 h-3" />
						</a>
					</div>
					<div class="divide-y divide-sage-200/10">
						{#if data.recentTransactions?.length > 0}
							{#each data.recentTransactions as trx (trx.id)}
								<div class="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-base/20 transition-colors">
									<div class="flex-1 min-w-0">
										<p class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate">{trx.transactionCode}</p>
										<p class="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">{formatDate(trx.createdAt)}</p>
									</div>
									<div class="text-right">
										<p class="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(trx.totalAmount)}</p>
										<span class="inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-base text-slate-500 dark:text-slate-350 border border-sage-200/40 mt-0.5">
											{trx.paymentMethod}
										</span>
									</div>
								</div>
							{/each}
						{:else}
							<div class="py-8 text-center text-xs text-slate-400 font-bold">
								Belum ada transaksi hari ini
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Alert & Quick Actions -->
			<div class="flex flex-col gap-4">
				<div class="bg-surface border border-sage-200/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
					<div class="flex items-center gap-2 px-4 py-3.5 border-b border-sage-200/20 bg-base/10">
						<AlertTriangle class="w-4 h-4 text-amber-500" />
						<h3 class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Produk Stok Tipis</h3>
					</div>
					<div class="divide-y divide-sage-200/10">
						{#if data.lowStockProducts?.length > 0}
							{#each data.lowStockProducts as product (product.id)}
								<div class="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-base/20 transition-colors">
									<div class="flex-1 min-w-0">
										<p class="text-xs font-bold text-slate-700 dark:text-slate-255 truncate">{product.name}</p>
										<p class="text-[10px] font-mono text-slate-400 mt-0.5">{product.sku}</p>
									</div>
									<span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200/60 font-mono shrink-0">
										{product.stock} {product.unit}
									</span>
								</div>
							{/each}
						{:else}
							<div class="py-8 text-center text-xs text-slate-400 font-bold">
								Semua stok aman
							</div>
						{/if}
					</div>
				</div>

				<!-- Quick Actions Panel -->
				<div class="bg-surface border border-sage-200/50 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
					<h3 class="text-xs font-bold text-slate-500 dark:text-slate-350 uppercase tracking-wider">Akses Cepat POS</h3>
					<div class="grid grid-cols-2 gap-2">
						<a
							href="#/pos"
							class="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-sage-200/40 bg-base/20 hover:bg-base/50 text-slate-700 dark:text-slate-200 hover:text-sage-700 transition-all duration-200 group text-center"
						>
							<div class="p-2 bg-sage-500 text-white rounded-lg group-hover:scale-105 transition-transform duration-200">
								<ShoppingCart class="w-4 h-4" />
							</div>
							<span class="text-[10px] font-extrabold uppercase tracking-wide">Kasir POS</span>
						</a>
						<a
							href="#/inventory"
							class="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-sage-200/40 bg-base/20 hover:bg-base/50 text-slate-700 dark:text-slate-200 hover:text-sage-700 transition-all duration-200 group text-center"
						>
							<div class="p-2 bg-amber-500 text-white rounded-lg group-hover:scale-105 transition-transform duration-200">
								<Package class="w-4 h-4" />
							</div>
							<span class="text-[10px] font-extrabold uppercase tracking-wide">Kelola Stok</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
