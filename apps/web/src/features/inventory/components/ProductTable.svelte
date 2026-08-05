<script lang="ts">
  import { formatCurrency } from '../../../lib/utils/currency';
  import { fuzzySearchSubset } from '../../../lib/utils/fuzzy-search';
  import {
    Search,
    Edit,
    Package2,
    Share2,
    ToggleLeft,
    ToggleRight,
    AlertTriangle,
    X,
    Package,
  } from 'lucide-svelte';
  import type { UIProduct } from '../../../types';

  interface Props {
    products: UIProduct[];
    categories?: string[];
    onedit: (p: UIProduct) => void;
    onadjust: (p: UIProduct) => void;
    onshare: (p: UIProduct) => void;
    ontoggle: (p: UIProduct) => void;
  }

  let { products, categories = [], onedit, onadjust, onshare, ontoggle }: Props = $props();

  let searchQuery = $state('');
  let selectedCategory = $state('');
  let showInactive = $state(false);

  const filteredProducts = $derived(() => {
    // 1. Filter by active status
    let visible = showInactive ? products : products.filter((p) => p.isActive);
    // 2. Filter by category if selected
    if (selectedCategory) {
      visible = visible.filter((p) => p.category === selectedCategory);
    }
    // 3. Fuzzy search within subset
    return fuzzySearchSubset(visible, searchQuery);
  });

  const isSearchActive = $derived(searchQuery.trim().length > 0);

  function clearSearch() {
    searchQuery = '';
  }
</script>

<div class="flex flex-col gap-4 text-ink">
  <!-- Search, Category Pills & Filters Bar -->
  <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between w-full">
    <!-- Left: Search & Category Pills -->
    <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1 min-w-0">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cari produk, SKU, atau kategori..."
          class="w-full pl-10 pr-9 py-2.5 bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
        />
        {#if isSearchActive}
          <button
            type="button"
            onclick={clearSearch}
            class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        {/if}
      </div>

      <!-- Category Filter Pills -->
      {#if categories.length > 0}
        <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <button
            type="button"
            onclick={() => (selectedCategory = '')}
            class="px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer select-none
							{!selectedCategory
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10'}"
          >
            Semua
          </button>

          {#each categories as cat}
            <button
              type="button"
              onclick={() => (selectedCategory = cat)}
              class="px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer select-none
								{selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10'}"
            >
              {cat}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Right: Show Inactive Checkbox -->
    <label class="flex items-center gap-2 cursor-pointer select-none shrink-0 px-1 py-1">
      <input
        type="checkbox"
        bind:checked={showInactive}
        class="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
      />
      <span class="text-xs font-bold text-slate-600 dark:text-slate-300">
        Tampilkan Non-aktif
      </span>
    </label>
  </div>

  <!-- Search Results Counter -->
  {#if isSearchActive}
    <div class="text-[11px] font-semibold text-slate-400 -mt-1">
      Menampilkan <span class="font-bold text-emerald-600 dark:text-emerald-400">{filteredProducts().length}</span> produk cocok
    </div>
  {/if}

  <!-- Main Product Table Container -->
  <div
    class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl overflow-hidden shadow-2xs"
  >
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr
            class="border-b border-slate-200/60 dark:border-emerald-950/60 bg-base/50 dark:bg-surface/30"
          >
            <th
              class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
            >
              Informasi Produk
            </th>
            <th
              class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider hidden md:table-cell"
            >
              Kategori
            </th>
            <th
              class="text-right px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
            >
              Harga & HPP
            </th>
            <th
              class="text-center px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
            >
              Stok
            </th>
            <th
              class="text-center px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider hidden sm:table-cell"
            >
              Status
            </th>
            <th
              class="px-5 py-3.5 text-center font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200/40 dark:divide-emerald-950/40">
          {#each filteredProducts() as product (product.id)}
            <tr
              class="hover:bg-emerald-500/5 transition-colors {!product.isActive ? 'opacity-45' : ''}"
            >
              <!-- Product Image & Details -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-slate-200/40 dark:border-emerald-950/60 overflow-hidden flex items-center justify-center shrink-0"
                  >
                    {#if product.imageUrl}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        class="w-full h-full object-cover"
                      />
                    {:else}
                      <Package class="w-5 h-5 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
                    {/if}
                  </div>

                  <div class="flex flex-col min-w-0">
                    <p class="font-bold text-slate-800 dark:text-slate-100 truncate">
                      {product.name}
                    </p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="text-[10px] font-mono font-medium text-slate-400 uppercase">
                        SKU: {product.sku || '-'}
                      </span>
                      <span class="text-slate-300 dark:text-slate-600">&bull;</span>
                      <span class="text-[10px] font-medium text-slate-400">
                        {product.unit || 'unit'}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Category Pill -->
              <td class="px-5 py-3.5 hidden md:table-cell">
                <span
                  class="px-2.5 py-1 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg font-bold text-[10px]"
                >
                  {product.category || 'Umum'}
                </span>
              </td>

              <!-- Price & Cost Price -->
              <td class="px-5 py-3.5 text-right font-mono">
                <p class="font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(product.sellingPrice)}
                </p>
                {#if product.costPrice}
                  <p class="text-[10px] text-slate-400 mt-0.5">
                    HPP: {formatCurrency(product.costPrice)}
                  </p>
                {/if}
              </td>

              <!-- Stock Level Badge -->
              <td class="px-5 py-3.5 text-center">
                {#if product.stock <= 0}
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono"
                  >
                    Habis (0)
                  </span>
                {:else if product.stock <= product.minStock}
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono"
                  >
                    <AlertTriangle class="w-3 h-3 text-amber-500" />
                    {product.stock} {product.unit}
                  </span>
                {:else}
                  <span
                    class="font-mono font-bold text-slate-800 dark:text-slate-200"
                  >
                    {product.stock} {product.unit}
                  </span>
                {/if}
              </td>

              <!-- Status Toggle -->
              <td class="px-5 py-3.5 text-center hidden sm:table-cell">
                <button
                  type="button"
                  onclick={() => ontoggle(product)}
                  class="cursor-pointer transition-transform hover:scale-110 bg-transparent border-0"
                  title={product.isActive ? 'Nonaktifkan Produk' : 'Aktifkan Produk'}
                >
                  {#if product.isActive}
                    <ToggleRight class="w-6 h-6 text-emerald-500" />
                  {:else}
                    <ToggleLeft class="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  {/if}
                </button>
              </td>

              <!-- Action Toolbar Buttons -->
              <td class="px-5 py-3.5 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onclick={() => onedit(product)}
                    class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg cursor-pointer transition-colors bg-transparent border-0"
                    title="Edit Produk"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onclick={() => onadjust(product)}
                    class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg cursor-pointer transition-colors bg-transparent border-0"
                    title="Sesuaikan Stok Persediaan"
                  >
                    <Package2 class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onclick={() => onshare(product)}
                    class="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-500/10 rounded-lg cursor-pointer transition-colors bg-transparent border-0"
                    title="Bagikan / QR Code"
                  >
                    <Share2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="6" class="py-16 text-center text-slate-400 font-semibold">
                {isSearchActive
                  ? `Tidak ada produk cocok dengan "${searchQuery}"`
                  : 'Belum ada produk terdaftar di inventori'}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
