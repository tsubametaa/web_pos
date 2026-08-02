<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '../../core/api';
	import { toast } from '../../lib/utils/toast.svelte';
	import Spinner from '../../components/ui/Spinner.svelte';
	import TransactionTable from './components/TransactionTable.svelte';
	import TransactionDetailModal from './components/TransactionDetailModal.svelte';
	import { History } from 'lucide-svelte';
	import type { UITransaction } from '../../types';

	let loading = $state(true);
	let transactions = $state<UITransaction[]>([]);
	let settings = $state<any>(null);

	let selectedTransaction = $state<UITransaction | null>(null);
	let showDetailModal = $state(false);

	async function loadSalesData() {
		try {
			const res = await api.get('/transactions');
			if (res.success) {
				transactions = res.transactions;
			}
			const settingsRes = await api.get('/settings');
			if (settingsRes.success) {
				settings = settingsRes.settings;
			}
		} catch (err) {
			console.error('Error fetching transactions:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadSalesData();
	});

	function handleViewTransaction(trx: UITransaction) {
		selectedTransaction = trx;
		showDetailModal = true;
	}

	async function handleVoidTransaction(id: string) {
		const confirmVoid = confirm('Apakah Anda yakin ingin membatalkan transaksi ini? Stok produk akan dikembalikan.');
		if (!confirmVoid) return;

		try {
			const res = await api.post('/transactions/void', { id });
			if (res.success) {
				toast.success('Transaksi berhasil dibatalkan!');
				showDetailModal = false;
				selectedTransaction = null;
				await loadSalesData();
			} else {
				throw new Error(res.error || 'Gagal membatalkan transaksi.');
			}
		} catch (err: any) {
			toast.error(err.message || 'Terjadi kesalahan saat membatalkan transaksi.');
		}
	}
</script>

{#if loading}
	<div class="h-64 flex items-center justify-center">
		<Spinner size="lg" />
	</div>
{:else}
	<div class="flex flex-col gap-5 text-ink">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<History class="w-5 h-5 text-sage-600 dark:text-accent" />
				<h2 class="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">Riwayat Transaksi</h2>
				<span class="text-xs font-bold text-slate-500 bg-surface dark:bg-base border border-sage-200/40 px-2 py-0.5 rounded-full">
					{transactions.length} total
				</span>
			</div>
		</div>

		<!-- Transaction Table -->
		<TransactionTable
			{transactions}
			onview={handleViewTransaction}
		/>
	</div>

	<!-- Detail Modal -->
	{#if showDetailModal && selectedTransaction}
		<TransactionDetailModal
			transaction={selectedTransaction}
			{settings}
			onclose={() => (showDetailModal = false)}
			onvoid={handleVoidTransaction}
		/>
	{/if}
{/if}
