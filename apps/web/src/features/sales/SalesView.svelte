<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../../core/api';
  import { appState } from '../../core/state.svelte';
  import { toast } from '../../lib/utils/toast.svelte';
  import { formatCurrency } from '../../lib/utils/currency';
  import Skeleton from '../../components/ui/Skeleton.svelte';
  import TransactionTable from './components/TransactionTable.svelte';
  import TransactionDetailModal from './components/TransactionDetailModal.svelte';
  import { generateSalesPDF } from '../../lib/utils/pdfGenerator';
  import { generateSalesExcel } from '../../lib/utils/excelGenerator';
  import { activeStore } from '../../core/activeStore.svelte';
  import { History, DollarSign, TrendingUp, ShoppingBag, Calculator, Download } from 'lucide-svelte';
  import type { UITransaction } from '../../types';

  let loading = $state(true);
  let transactions = $state<UITransaction[]>([]);
  let settings = $state<any>(null);

  let selectedTransaction = $state<UITransaction | null>(null);
  let showDetailModal = $state(false);
  let selectedMonth = $state('all');

  const isSuperAdmin = $derived(appState.user?.role === 'super_admin');

  async function handleDownloadPDF() {
    try {
      await generateSalesPDF({
        transactions,
        brandName: activeStore.currentStore?.name || settings?.businessName || 'Brand Utama',
        brandLogo: activeStore.currentStore?.logoUrl || settings?.logoUrl || '',
        brandAddress: activeStore.currentStore?.address || settings?.businessAddress || '',
        brandPhone: activeStore.currentStore?.phone || settings?.businessPhone || '',
        userRole: appState.user?.role || 'admin',
        printedBy: appState.user?.businessName || appState.user?.email || 'Staff Kasir'
      });
      toast.success('Laporan PDF Rekapitulasi Penjualan berhasil diunduh!');
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      toast.error('Gagal mengunduh file PDF.');
    }
  }

  function handleDownloadExcel() {
    try {
      generateSalesExcel({
        transactions,
        brandName: activeStore.currentStore?.name || settings?.businessName || 'Brand Utama',
        userRole: appState.user?.role || 'admin'
      });
      toast.success('Laporan Excel Rekapitulasi Penjualan berhasil diunduh!');
    } catch (err: any) {
      console.error('Error generating Excel:', err);
      toast.error('Gagal mengunduh file Excel.');
    }
  }

  async function loadSalesData() {
    try {
      const monthQuery = selectedMonth !== 'all' ? `?month=${selectedMonth}` : '';
      const res = await api.get(`/transactions${monthQuery}`);
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

  function handleMonthChange(newMonth: string) {
    selectedMonth = newMonth;
    loadSalesData();
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
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Header Banner Skeleton -->
    <div class="p-6 bg-base/90 dark:bg-surface/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="space-y-2 w-full max-w-md">
        <Skeleton class="h-6 w-44" />
        <Skeleton class="h-4 w-full" />
      </div>
      <div class="flex gap-2">
        <Skeleton class="h-10 w-28" />
        <Skeleton class="h-10 w-28" />
      </div>
    </div>

    <!-- Stat Cards Skeleton -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each Array(4) as _}
        <div class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-8 w-36" />
        </div>
      {/each}
    </div>

    <!-- Table Skeleton -->
    <div class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
      <Skeleton class="h-10 w-full" />
      {#each Array(5) as _}
        <Skeleton class="h-12 w-full" />
      {/each}
    </div>
  </div>
{:else}
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Top Bar Header Banner -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-base/90 dark:bg-surface/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-accent-soft text-accent">
            <History class="w-5 h-5" />
          </div>
          <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Riwayat Transaksi
          </h1>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Pantau seluruh catatan penjualan toko, rincian pembayaran, laba rugi, dan kelola faktur invoice.
        </p>
      </div>

      <div
        class="inline-flex items-center gap-2 px-3.5 py-2.5 bg-accent-soft text-accent-soft-text rounded-xl font-extrabold text-xs shrink-0 self-start sm:self-auto"
      >
        <ShoppingBag class="w-4 h-4 text-accent" />
        <span>{transactions.length} Total Transaksi</span>
      </div>
    </div>

    <!-- Summary KPI Cards Row -->
    <div class="grid grid-cols-2 {isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4">
      <!-- Omset Penjualan -->
      <div
        class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Omset
          </span>
          <div class="p-1.5 rounded-lg bg-accent-soft text-accent">
            <DollarSign class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-accent font-mono truncate">
          {formatCurrency(totalRevenue)}
        </span>
      </div>

      <!-- Total Profit (Super Admin only) -->
      {#if isSuperAdmin}
        <div
          class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Profit / Laba
            </span>
            <div class="p-1.5 rounded-lg bg-accent-soft text-accent">
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
        class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Transaksi Selesai
          </span>
          <div class="p-1.5 rounded-lg bg-accent-soft text-accent">
            <ShoppingBag class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-mono">
          {totalCount} <span class="text-xs font-semibold text-slate-400">Nota</span>
        </span>
      </div>

      <!-- Rata-rata Nilai Transaksi -->
      <div
        class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Rata-rata Transaksi
          </span>
          <div class="p-1.5 rounded-lg bg-accent-soft text-accent">
            <Calculator class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-mono truncate">
          {formatCurrency(avgTransaction)}
        </span>
      </div>
    </div>

    <!-- Transaction Table Section -->
    <TransactionTable
      {transactions}
      onview={handleViewTransaction}
      {selectedMonth}
      onmonthchange={handleMonthChange}
      ondownloadpdf={handleDownloadPDF}
      ondownloadexcel={handleDownloadExcel}
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
