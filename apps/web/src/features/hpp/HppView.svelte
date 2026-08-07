<script lang="ts">
  import { onMount } from 'svelte';
  import { formatCurrency } from '../../lib/utils/currency';
  import { calculateMargin } from '../../lib/utils/calculations';
  import { fuzzySearchSubset } from '../../lib/utils/fuzzy-search';
  import {
    Search,
    BarChart3,
    DollarSign,
    TrendingUp,
    Coins,
    Percent,
    X,
    Package,
  } from 'lucide-svelte';
  import { api } from '../../core/api';
  import Spinner from '../../components/ui/Spinner.svelte';
  import Dropdown from '../../components/ui/Dropdown.svelte';
  import type { UIProduct } from '../../types';

  let loading = $state(true);
  let products = $state<UIProduct[]>([]);
  let searchQuery = $state('');
  let selectedCategory = $state('');

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

  // Extract unique categories for category dropdown
  const categories = $derived([
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ]);

  const categoryOptions = $derived([
    { value: '', label: 'Semua Kategori' },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ]);

  const filteredProducts = $derived.by(() => {
    let active = products.filter((p) => p.isActive);
    if (selectedCategory) {
      active = active.filter((p) => p.category === selectedCategory);
    }
    return fuzzySearchSubset(active, searchQuery);
  });

  const isSearchActive = $derived(searchQuery.trim().length > 0);

  function clearSearch() {
    searchQuery = '';
  }

  // Financial summary metrics
  const totalStockValue = $derived(
    filteredProducts.reduce((sum, p) => sum + Math.max(p.stock, 0) * (p.costPrice || 0), 0)
  );

  const totalPotentialRevenue = $derived(
    filteredProducts.reduce((sum, p) => sum + Math.max(p.stock, 0) * (p.sellingPrice || 0), 0)
  );

  const totalPotentialProfit = $derived(
    Math.max(0, totalPotentialRevenue - totalStockValue)
  );

  const averageMargin = $derived.by(() => {
    if (filteredProducts.length === 0) return 0;
    const totalMarginSum = filteredProducts.reduce(
      (sum, p) => sum + calculateMargin(p.costPrice, p.sellingPrice),
      0
    );
    return Math.round((totalMarginSum / filteredProducts.length) * 10) / 10;
  });
</script>

{#if loading}
  <div class="h-96 flex flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">
      Memuat Data HPP & Margin...
    </span>
  </div>
{:else}
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Header Banner -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-surface border border-border-theme rounded-2xl shadow-2xs"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-accent-soft text-accent-soft-text">
            <BarChart3 class="w-5 h-5" />
          </div>
          <h1 class="text-lg sm:text-xl font-black text-h-text tracking-tight">
            Analisis HPP & Margin Keuntungan
          </h1>
        </div>
        <p class="text-xs text-ink-muted font-medium">
          Pantau nilai HPP (modal), estimasi keuntungan per unit, dan total aset persediaan barang toko Anda.
        </p>
      </div>

      <div
        class="inline-flex items-center gap-2 px-3.5 py-2 bg-accent-soft text-accent-soft-text rounded-xl font-extrabold text-xs shrink-0 self-start sm:self-auto border border-accent/20"
      >
        <Package class="w-4 h-4 text-accent-soft-text" />
        <span>{filteredProducts.length} Produk Dianalisis</span>
      </div>
    </div>

    <!-- Summary KPI Cards Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Nilai Stok (Modal HPP) -->
      <div
        class="bg-surface border border-border-theme rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-ink-muted uppercase tracking-wider">
            Total Modal Stok (HPP)
          </span>
          <div class="p-1.5 rounded-lg bg-accent-soft text-accent-soft-text">
            <Coins class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-h-text font-mono truncate">
          {formatCurrency(totalStockValue)}
        </span>
      </div>

      <!-- Potensi Omset Jual -->
      <div
        class="bg-surface border border-border-theme rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-ink-muted uppercase tracking-wider">
            Potensi Omset Jual
          </span>
          <div class="p-1.5 rounded-lg bg-accent-soft text-accent-soft-text">
            <DollarSign class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-accent font-mono truncate">
          {formatCurrency(totalPotentialRevenue)}
        </span>
      </div>

      <!-- Potensi Profit Bersih -->
      <div
        class="bg-surface border border-border-theme rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-ink-muted uppercase tracking-wider">
            Potensi Profit Bersih
          </span>
          <div class="p-1.5 rounded-lg bg-accent-soft text-accent-soft-text">
            <TrendingUp class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-h-text font-mono truncate">
          {formatCurrency(totalPotentialProfit)}
        </span>
      </div>

      <!-- Rata-rata Margin -->
      <div
        class="bg-surface border border-border-theme rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-ink-muted uppercase tracking-wider">
            Rata-rata Margin
          </span>
          <div class="p-1.5 rounded-lg bg-accent-soft text-accent-soft-text">
            <Percent class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-accent font-mono">
          {averageMargin}%
        </span>
      </div>
    </div>

    <!-- Search & Category Dropdown Toolbar -->
    <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between w-full">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1 min-w-0">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Cari produk atau SKU..."
            class="w-full pl-10 pr-9 py-2.5 bg-surface border border-border-theme focus:border-accent rounded-xl text-xs font-medium text-h-text placeholder-ink-muted focus:outline-none transition-all shadow-2xs"
          />
          {#if isSearchActive}
            <button
              type="button"
              onclick={clearSearch}
              class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-ink-muted hover:text-h-text cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          {/if}
        </div>

        <!-- Category Dropdown -->
        {#if categories.length > 0}
          <Dropdown
            options={categoryOptions}
            bind:value={selectedCategory}
            placeholder="Semua Kategori"
          />
        {/if}
      </div>
    </div>

    <!-- Search Results Counter -->
    {#if isSearchActive}
      <div class="text-[11px] font-semibold text-ink-muted -mt-1">
        Menampilkan <span class="font-bold text-accent">{filteredProducts.length}</span> produk cocok
      </div>
    {/if}

    <!-- Executive HPP Table -->
    <div
      class="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-2xs"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr
              class="border-b border-border-theme bg-base/50"
            >
              <th
                class="text-left px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider"
              >
                Informasi Produk
              </th>
              <th
                class="text-left px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider hidden md:table-cell"
              >
                Kategori
              </th>
              <th
                class="text-right px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider"
              >
                HPP (Modal)
              </th>
              <th
                class="text-right px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider"
              >
                Harga Jual
              </th>
              <th
                class="text-right px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider hidden sm:table-cell"
              >
                Margin %
              </th>
              <th
                class="text-right px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider hidden md:table-cell"
              >
                Stok
              </th>
              <th
                class="text-right px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider hidden lg:table-cell"
              >
                Total Nilai Modal
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-theme">
            {#each filteredProducts as p (p.id)}
              {@const marginPercent = calculateMargin(p.costPrice, p.sellingPrice)}
              {@const profitPerUnit = p.sellingPrice - p.costPrice}
              <tr class="hover:bg-accent-soft/40 transition-colors">
                <!-- Product Details -->
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-xl bg-accent-soft border border-border-theme overflow-hidden flex items-center justify-center shrink-0"
                    >
                      {#if p.imageUrl}
                        <img src={p.imageUrl} alt={p.name} class="w-full h-full object-cover" />
                      {:else}
                        <Package class="w-4 h-4 text-accent stroke-[1.5]" />
                      {/if}
                    </div>

                    <div class="flex flex-col min-w-0">
                      <p class="font-bold text-h-text truncate">
                        {p.name}
                      </p>
                      <span class="text-[10px] font-mono font-medium text-ink-muted uppercase mt-0.5">
                        SKU: {p.sku || '-'}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Category -->
                <td class="px-5 py-3.5 hidden md:table-cell">
                  <span
                    class="px-2.5 py-1 bg-accent-soft border border-accent/20 text-accent-soft-text rounded-lg font-bold text-[10px]"
                  >
                    {p.category || 'Umum'}
                  </span>
                </td>

                <!-- HPP Cost Price -->
                <td class="px-5 py-3.5 text-right font-mono">
                  <span class="font-bold text-ink">
                    {formatCurrency(p.costPrice)}
                  </span>
                </td>

                <!-- Selling Price -->
                <td class="px-5 py-3.5 text-right font-mono">
                  <span class="font-black text-accent">
                    {formatCurrency(p.sellingPrice)}
                  </span>
                </td>

                <!-- Margin Percent & Profit per Unit -->
                <td class="px-5 py-3.5 text-right hidden sm:table-cell font-mono">
                  <div class="flex flex-col items-end">
                    <span
                      class="px-2 py-0.5 rounded-md text-[10px] font-extrabold border
												{marginPercent >= 25
                        ? 'bg-accent-soft text-accent-soft-text border-accent/20'
                        : marginPercent >= 10
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20'}"
                    >
                      {marginPercent.toFixed(1)}%
                    </span>
                    <span class="text-[10px] text-ink-muted mt-0.5">
                      +{formatCurrency(profitPerUnit)}/u
                    </span>
                  </div>
                </td>

                <!-- Stock Quantity -->
                <td class="px-5 py-3.5 text-right font-mono hidden md:table-cell">
                  <span class="font-bold text-h-text">
                    {p.stock} {p.unit || 'unit'}
                  </span>
                </td>

                <!-- Total Stock Cost Valuation -->
                <td class="px-5 py-3.5 text-right font-mono hidden lg:table-cell">
                  <span class="font-black text-h-text">
                    {formatCurrency(p.stock * p.costPrice)}
                  </span>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="7" class="py-16 text-center text-ink-muted font-semibold">
                  {isSearchActive
                    ? `Tidak ada produk cocok dengan "${searchQuery}"`
                    : 'Belum ada data produk di katalog'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
{/if}
