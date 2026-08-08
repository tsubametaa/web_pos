<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "../../core/api";
  import { appState } from "../../core/state.svelte";
  import { formatCurrency } from "../../lib/utils/currency";
  import { formatDate } from "../../lib/utils/date";
  import Skeleton from "../../components/ui/Skeleton.svelte";
  import {
    TrendingUp,
    ShoppingBag,
    AlertTriangle,
    ArrowUpRight,
    Clock,
    Coins,
    ShoppingCart,
    Package,
    Plus,
    History,
    Settings,
  } from "lucide-svelte";
  import SalesChart from "./components/SalesChart.svelte";

  function generateEmptySalesTrend() {
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const dateStr = targetDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
      trend.push({ dateStr, amount: 0, profit: 0 });
    }
    return trend;
  }

  const defaultStats = {
    stats: {
      todaySales: 0,
      todayProfit: 0,
      todayTransactions: 0,
      totalProducts: 0,
      lowStockCount: 0,
    },
    lowStockProducts: [],
    recentTransactions: [],
    salesTrend: generateEmptySalesTrend(),
  };

  let loading = $state(true);
  let loadError = $state<string | null>(null);
  let data = $state<any>(defaultStats);

  async function loadDashboardData() {
    loadError = null;
    try {
      const res = await api.get("/dashboard/stats");
      if (res && res.success) {
        data = {
          stats: {
            todaySales: res.stats?.todaySales ?? 0,
            todayProfit: res.stats?.todayProfit ?? 0,
            todayTransactions: res.stats?.todayTransactions ?? 0,
            totalProducts: res.stats?.totalProducts ?? 0,
            lowStockCount: res.stats?.lowStockCount ?? 0,
          },
          lowStockProducts: res.lowStockProducts ?? [],
          recentTransactions: res.recentTransactions ?? [],
          salesTrend:
            res.salesTrend && res.salesTrend.length > 0
              ? res.salesTrend
              : generateEmptySalesTrend(),
        };
        loadError = null;
      } else if (res && !res.success) {
        // Server returned an explicit error — show error but don't wipe data
        loadError = res.error || "Gagal memuat data dashboard.";
        console.warn("[Dashboard] API returned error:", res.error);
      }
    } catch (err: any) {
      // Network error / auth error — keep existing data, show retry banner
      console.error("[Dashboard] Error fetching stats:", err);
      if (!err?.isAuthError) {
        // Non-auth error: keep showing data, just show a banner
        loadError =
          err?.message ||
          "Koneksi ke server bermasalah. Data mungkin belum terkini.";
      }
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadDashboardData();
  });

  const currentDateFormatted = $derived(() => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  });

  const userNameDisplay = $derived(
    appState.user?.businessName ||
      appState.user?.email?.split("@")[0] ||
      "Pengguna",
  );

  const stats = $derived.by(() => {
    const list = [
      {
        label: "Penjualan Hari Ini",
        value: formatCurrency(data?.stats?.todaySales ?? 0),
        icon: TrendingUp,
        color: "text-red-600 dark:text-red-400",
        badgeBg:
          "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
      },
    ];

    if (appState.user?.role === "super_admin") {
      list.push({
        label: "Profit Hari Ini",
        value: formatCurrency(data?.stats?.todayProfit ?? 0),
        icon: Coins,
        color: "text-red-600 dark:text-red-400",
        badgeBg:
          "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
      });
    }

    list.push(
      {
        label: "Transaksi Hari Ini",
        value: `${data?.stats?.todayTransactions ?? 0} Transaksi`,
        icon: ShoppingBag,
        color: "text-blue-600 dark:text-blue-400",
        badgeBg:
          "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      },
      {
        label: "Stok Perlu Perhatian",
        value: `${data?.stats?.lowStockCount ?? 0} Produk`,
        icon: AlertTriangle,
        color: "text-amber-600 dark:text-amber-400",
        badgeBg:
          "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
      },
    );

    return list;
  });
</script>

{#if loading}
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Header Banner Skeleton -->
    <div class="p-6 bg-surface/90 border border-border-theme rounded-2xl space-y-2">
      <Skeleton class="h-6 w-64" />
      <Skeleton class="h-4 w-96" />
    </div>

    <!-- Stat Cards Grid Skeleton -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each Array(4) as _}
        <div class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-3">
          <Skeleton class="h-4 w-28" />
          <Skeleton class="h-8 w-36" />
        </div>
      {/each}
    </div>

    <!-- Sales Chart & Side Card Skeleton -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-4">
        <Skeleton class="h-6 w-48" />
        <Skeleton class="h-56 w-full" />
      </div>
      <div class="lg:col-span-1 bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-4">
        <Skeleton class="h-6 w-40" />
        {#each Array(4) as _}
          <Skeleton class="h-10 w-full" />
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="flex flex-col gap-6 text-ink w-full pb-8">
    {#if loadError}
      <!-- Connection error banner - non-blocking, shows retry button -->
      <div
        class="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl text-sm"
      >
        <div class="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <AlertTriangle class="w-4 h-4 shrink-0" />
          <span class="font-medium">{loadError}</span>
        </div>
        <button
          onclick={loadDashboardData}
          class="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    {/if}

    <!-- Welcome Header Banner displaying user / business name from DB -->

    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-surface/90 border border-border-theme rounded-2xl shadow-2xs"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <h1 class="text-lg sm:text-xl font-black text-h-text tracking-tight">
            Selamat Datang Kembali, {userNameDisplay}!
          </h1>
        </div>
        <p class="text-xs text-ink-muted font-medium">
          Ringkasan performa dan aktivitas toko Anda per <span
            class="font-semibold text-ink">{currentDateFormatted()}</span
          >.
        </p>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div
      class="grid grid-cols-1 {stats.length === 3
        ? 'sm:grid-cols-3 lg:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4'} gap-4"
    >
      {#each stats as stat}
        {@const Icon = stat.icon}
        <div
          class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-3 hover:border-emerald-500/30 hover:shadow-xs transition-all duration-200"
        >
          <div class="flex items-center justify-between gap-2">
            <span
              class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              {stat.label}
            </span>
            <div
              class="p-2 rounded-xl border {stat.badgeBg} flex items-center justify-center shrink-0"
            >
              <Icon class="w-4 h-4 {stat.color}" />
            </div>
          </div>

          <div>
            <span
              class="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight font-mono"
            >
              {stat.value}
            </span>
          </div>
        </div>
      {/each}
    </div>

    <!-- Analytics & Activity Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Chart & Recent Transactions -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <SalesChart salesTrend={data.salesTrend ?? []} />

        <!-- Recent Transactions Panel -->
        <div
          class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs overflow-hidden flex flex-col"
        >
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 dark:border-slate-800/60"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="p-1.5 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400"
              >
                <Clock class="w-4 h-4" />
              </div>
              <h3
                class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider"
              >
                Transaksi Terbaru
              </h3>
            </div>
            <a
              href="#/sales"
              class="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight class="w-3.5 h-3.5" />
            </a>
          </div>

          <div class="divide-y divide-slate-200/40 dark:divide-slate-800/40">
            {#if data.recentTransactions?.length > 0}
              {#each data.recentTransactions as trx (trx.id)}
                <div
                  class="px-5 py-3 flex items-center justify-between gap-4 hover:bg-red-500/5 transition-colors"
                >
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate"
                    >
                      {trx.transactionCode}
                    </p>
                    <p class="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(trx.createdAt)}
                    </p>
                  </div>
                  <div class="text-right flex flex-col items-end shrink-0">
                    <p
                      class="text-xs font-mono font-black text-red-600 dark:text-red-400"
                    >
                      {formatCurrency(trx.totalAmount)}
                    </p>
                    <span
                      class="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 mt-1"
                    >
                      {trx.paymentMethod}
                    </span>
                  </div>
                </div>
              {/each}
            {:else}
              <div
                class="py-12 text-center text-xs text-slate-400 font-semibold"
              >
                Belum ada transaksi yang tercatat hari ini
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Low Stock Warning & Quick Access Shortcuts -->
      <div class="flex flex-col gap-6">
        <!-- Low Stock Alert Box -->
        <div
          class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs overflow-hidden flex flex-col"
        >
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 dark:border-slate-800/60"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400"
              >
                <AlertTriangle class="w-4 h-4" />
              </div>
              <h3
                class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider"
              >
                Stok Menipis
              </h3>
            </div>
            <a
              href="#/inventory"
              class="text-[11px] font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            >
              Kelola Stok &rarr;
            </a>
          </div>

          <div class="divide-y divide-slate-200/40 dark:divide-slate-800/40">
            {#if data.lowStockProducts?.length > 0}
              {#each data.lowStockProducts as product (product.id)}
                <div
                  class="px-5 py-3 flex items-center justify-between gap-3 hover:bg-amber-500/5 transition-colors"
                >
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate"
                    >
                      {product.name}
                    </p>
                    <p class="text-[10px] font-mono text-slate-400 mt-0.5">
                      SKU: {product.sku || "-"}
                    </p>
                  </div>
                  <span
                    class="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono shrink-0"
                  >
                    {product.stock}
                    {product.unit || "unit"}
                  </span>
                </div>
              {/each}
            {:else}
              <div
                class="py-12 text-center text-xs text-slate-400 font-semibold"
              >
                Semua stok produk saat ini aman
              </div>
            {/if}
          </div>
        </div>

        <!-- Main Quick Action Buttons Box (Transaksi Baru & Kelola Stok) -->
        <div
          class="bg-surface border border-border-theme rounded-2xl p-5 shadow-2xs flex flex-col gap-3.5"
        >
          <h3 class="text-xs font-bold text-ink-muted uppercase tracking-wider">
            Tindakan Utama
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <a
              href="#/pos"
              class="inline-flex items-center justify-center gap-2 px-3.5 py-3 bg-accent hover:bg-accent-hover active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-xs hover:shadow transition-all duration-150 group text-center"
            >
              <Plus
                class="w-4 h-4 group-hover:rotate-90 transition-transform duration-200 shrink-0"
              />
              <span class="truncate">Transaksi Baru</span>
            </a>
            <a
              href="#/inventory"
              class="inline-flex items-center justify-center gap-2 px-3.5 py-3 bg-base hover:bg-accent-soft active:scale-[0.98] text-ink border border-border-theme rounded-xl font-bold text-xs shadow-2xs transition-all duration-150 text-center"
            >
              <Package class="w-4 h-4 text-accent shrink-0" />
              <span class="truncate">Kelola Stok</span>
            </a>
          </div>
        </div>

        <!-- Quick Access Shortcuts Grid -->
        <div
          class="bg-surface border border-border-theme rounded-2xl p-5 shadow-2xs flex flex-col gap-4"
        >
          <h3 class="text-xs font-bold text-ink-muted uppercase tracking-wider">
            Akses Cepat POS
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <a
              href="#/pos"
              class="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-border-theme bg-base/50 hover:bg-accent-soft text-ink transition-all duration-150 group text-center"
            >
              <div
                class="p-2.5 bg-accent text-white rounded-xl shadow-2xs group-hover:scale-110 transition-transform"
              >
                <ShoppingCart class="w-4 h-4" />
              </div>
              <span class="text-xs font-bold">Kasir POS</span>
            </a>

            <a
              href="#/inventory"
              class="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-border-theme bg-base/50 hover:bg-accent-soft text-ink transition-all duration-150 group text-center"
            >
              <div
                class="p-2.5 bg-amber-500 text-white rounded-xl shadow-2xs group-hover:scale-110 transition-transform"
              >
                <Package class="w-4 h-4" />
              </div>
              <span class="text-xs font-bold">Inventori</span>
            </a>

            <a
              href="#/sales"
              class="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-border-theme bg-base/50 hover:bg-accent-soft text-ink transition-all duration-150 group text-center"
            >
              <div
                class="p-2.5 bg-blue-600 text-white rounded-xl shadow-2xs group-hover:scale-110 transition-transform"
              >
                <History class="w-4 h-4" />
              </div>
              <span class="text-xs font-bold">Riwayat</span>
            </a>

            <a
              href="#/settings"
              class="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border border-border-theme bg-base/50 hover:bg-accent-soft text-ink transition-all duration-150 group text-center"
            >
              <div
                class="p-2.5 bg-slate-700 text-white rounded-xl shadow-2xs group-hover:scale-110 transition-transform"
              >
                <Settings class="w-4 h-4" />
              </div>
              <span class="text-xs font-bold">Pengaturan</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
