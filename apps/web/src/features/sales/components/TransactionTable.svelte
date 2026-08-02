<script lang="ts">
	import { formatCurrency } from '../../../lib/utils/currency';
	import { formatDate } from '../../../lib/utils/date';
	import { Search, Eye, ChevronDown } from 'lucide-svelte';
	import type { UITransaction } from '../../../types';

	interface Props {
		transactions: UITransaction[];
		onview: (t: UITransaction) => void;
	}

	let { transactions, onview }: Props = $props();

	let searchQuery = $state('');
	let filterMethod = $state('');

	const methods = ['cash', 'transfer', 'qris', 'other'];

	const filteredTransactions = $derived(
		transactions.filter((t) => {
			const matchesSearch =
				t.transactionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
				t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesMethod = !filterMethod || t.paymentMethod === filterMethod;
			return matchesSearch && matchesMethod;
		})
	);
</script>

<div class="flex flex-col gap-4 text-ink">
	<!-- Filters -->
	<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
		<div class="relative w-full sm:max-w-xs">
			<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari kode transaksi..."
				class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all"
			/>
		</div>
		<div class="relative">
			<select
				bind:value={filterMethod}
				class="appearance-none pl-3.5 pr-8 py-2.5 bg-white dark:bg-base border border-sage-200 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-sage-500/10 focus:border-sage-500 cursor-pointer transition-all"
			>
				<option value="">Semua Metode</option>
				{#each methods as m}
					<option value={m} class="capitalize">{m}</option>
				{/each}
			</select>
			<ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
		</div>
	</div>

	<!-- Table -->
	<div class="bg-surface border border-sage-200/50 rounded-2xl overflow-hidden shadow-sm">
		<div class="overflow-x-auto">
			<table class="w-full text-xs">
				<thead>
					<tr class="border-b border-sage-200/20 bg-base/20">
						<th class="text-left px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider">Kode</th>
						<th class="text-left px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider hidden md:table-cell">Tanggal</th>
						<th class="text-left px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider hidden sm:table-cell">Metode</th>
						<th class="text-right px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider">Total</th>
						<th class="text-right px-5 py-3.5 font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider hidden lg:table-cell">Profit</th>
						<th class="px-5 py-3.5"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-sage-200/10">
					{#each filteredTransactions as trx (trx.id)}
						<tr class="hover:bg-base/20 transition-colors">
							<td class="px-5 py-3.5">
								<span class="font-mono font-bold text-slate-700 dark:text-slate-300">{trx.transactionCode}</span>
							</td>
							<td class="px-5 py-3.5 hidden md:table-cell text-slate-500 dark:text-slate-400">{formatDate(trx.createdAt)}</td>
							<td class="px-5 py-3.5 hidden sm:table-cell">
								<span class="capitalize px-2.5 py-1 bg-base dark:bg-slate-900 border border-sage-200/40 text-blue-750 dark:text-blue-400 rounded-full font-bold text-[10px]">{trx.paymentMethod}</span>
							</td>
							<td class="px-5 py-3.5 text-right font-mono">
								<span class="font-extrabold text-slate-900 dark:text-white">{formatCurrency(trx.totalAmount)}</span>
							</td>
							<td class="px-5 py-3.5 text-right hidden lg:table-cell font-mono">
								<span class="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(trx.profit)}</span>
							</td>
							<td class="px-5 py-3.5 text-right">
								<button
									type="button"
									onclick={() => onview(trx)}
									class="p-1.5 text-slate-400 hover:text-sage-600 hover:bg-base rounded-lg transition-all cursor-pointer bg-transparent border-0"
									title="Lihat Detail"
								>
									<Eye class="w-4 h-4" />
								</button>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="py-16 text-center text-slate-450 font-bold">
								Tidak ada transaksi ditemukan
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
