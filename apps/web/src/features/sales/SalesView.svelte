<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../../core/api';
  import { appState } from '../../core/state.svelte';
  import { toast } from '../../lib/utils/toast.svelte';
  import { formatCurrency } from '../../lib/utils/currency';
  import Spinner from '../../components/ui/Spinner.svelte';
  import TransactionTable from './components/TransactionTable.svelte';
  import TransactionDetailModal from './components/TransactionDetailModal.svelte';
  import { History, DollarSign, TrendingUp, ShoppingBag, Calculator } from 'lucide-svelte';
  import type { UITransaction } from '../../types';

  let loading = $state(true);
  let transactions = $state<UITransaction[]>([]);
  let settings = $state<any>(null);

  let selectedTransaction = $state<UITransaction | null>(null);
  let showDetailModal = $state(false);

  const isSuperAdmin = $derived(appState.user?.role === 'super_admin');

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
    const confirmVoid = confirm(
      'Apakah Anda yakin ingin membatalkan transaksi ini? Stok produk akan dikembalikan ke gudang.'
    );
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

  // Summary statistics calculation
  const completedTransactions = $derived(transactions.filter((t) => t.status === 'completed'));
  const totalRevenue = $derived(completedTransactions.reduce((acc, t) => acc + t.totalAmount, 0));
  const totalProfit = $derived(completedTransactions.reduce((acc, t) => acc + (t.profit || 0), 0));
  const totalCount = $derived(completedTransactions.length);
  const avgTransaction = $derived(totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0);
</script>

{#if loading}
  <div class="h-96 flex flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">
      Memuat Riwayat Transaksi...
    </span>
  </div>
{:else}
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Top Bar Header Banner -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-base/90 dark:bg-surface/60 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl shadow-2xs"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <History class="w-5 h-5" />
          </div>
          <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Riwayat Transaksi
          </h1>
        </div>
        <p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
          Pantau seluruh catatan penjualan toko, rincian pembayaran, laba rugi, dan kelola faktur invoice.
        </p>
      </div>

      <div
        class="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 rounded-xl font-extrabold text-xs shrink-0 self-start sm:self-auto"
      >
        <ShoppingBag class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>{transactions.length} Total Transaksi</span>
      </div>
    </div>

    <!-- Summary KPI Cards Row -->
    <div class="grid grid-cols-2 {isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4">
      <!-- Omset Penjualan -->
      <div
        class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Omset
          </span>
          <div class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <DollarSign class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono truncate">
          {formatCurrency(totalRevenue)}
        </span>
      </div>

      <!-- Total Profit (Super Admin only) -->
      {#if isSuperAdmin}
        <div
          class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Profit / Laba
            </span>
            <div class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <TrendingUp class="w-4 h-4" />
            </div>
          </div>
          <span class="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-mono truncate">
            {formatCurrency(totalProfit)}
          </span>
        </div>
      {/if}

      <!-- Transaksi Selesai -->
      <div
        class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Transaksi Selesai
          </span>
          <div class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <ShoppingBag class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-mono">
          {totalCount} <span class="text-xs font-semibold text-slate-400">Nota</span>
        </span>
      </div>

      <!-- Rata-rata Nilai Transaksi -->
      <div
        class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Rata-rata Transaksi
          </span>
          <div class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <Calculator class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-mono truncate">
          {formatCurrency(avgTransaction)}
        </span>
      </div>
    </div>

    <!-- Transaction Table Section -->
    <TransactionTable {transactions} onview={handleViewTransaction} />
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
