<script lang="ts">
  import { cart } from '../logic/cart.svelte';
  import { formatCurrency } from '../../../lib/utils/currency';
  import { createProductFuse, fuzzySearchProducts } from '../../../lib/utils/fuzzy-search';
  import { Search, AlertCircle, Package, X, Plus, Barcode as BarcodeIcon } from 'lucide-svelte';
  import { toast } from '../../../lib/utils/toast.svelte';
  import type { UIProduct } from '../../../types';

  interface Props {
    products: UIProduct[];
    categories: string[];
    onselect: (p: UIProduct) => void;
  }

  let { products, categories, onselect }: Props = $props();

  let searchQuery = $state('');
  let selectedCategory = $state('');

  const fuse = $derived(createProductFuse(products));

  const filteredProducts = $derived(() => {
    const fuzzyResults = fuzzySearchProducts(fuse, products, searchQuery);
    if (!selectedCategory) return fuzzyResults;
    return fuzzyResults.filter((p) => p.category === selectedCategory);
  });

  const isSearchActive = $derived(searchQuery.trim().length > 0);

  function clearSearch() {
    searchQuery = '';
  }

  function handleSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return;

      // Find exact match by Barcode or SKU
      const exactMatch = products.find(
        (p) =>
          p.isActive &&
          ((p.barcode && p.barcode.toLowerCase() === q) ||
            (p.sku && p.sku.toLowerCase() === q))
      );

      if (exactMatch) {
        const cartItem = cart.items.find((item) => item.product.id === exactMatch.id);
        const availableStock = exactMatch.stock - (cartItem?.qty || 0);

        if (availableStock > 0) {
          onselect(exactMatch);
          searchQuery = '';
          toast.success(`+1 ${exactMatch.name} ditambahkan!`);
        } else {
          toast.error(`Stok ${exactMatch.name} sudah habis.`);
        }
      }
    }
  }
</script>

<div class="flex flex-col gap-4 h-full text-ink">
  <!-- Search & Category Filters Header -->
  <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between w-full">
    <!-- Search & Barcode Scanner Input Bar -->
    <div class="relative flex-1 min-w-[220px]">
      <div class="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
        <Search class="w-4 h-4" />
      </div>
      <input
        type="text"
        bind:value={searchQuery}
        onkeydown={handleSearchKeyDown}
        placeholder="Scan Barcode atau cari nama/SKU..."
        class="w-full pl-10 pr-20 py-2.5 bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
      />
      <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {#if isSearchActive}
          <button
            type="button"
            onclick={clearSearch}
            class="p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        {/if}
        <span
          class="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
          title="Siap terima scan dari scanner barcode USB/Bluetooth"
        >
          <BarcodeIcon class="w-3 h-3" />
          <span>Scanner Ready</span>
        </span>
      </div>
    </div>

    <!-- Scrollable Category Pills -->
    <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
      <button
        type="button"
        onclick={() => (selectedCategory = '')}
        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer select-none
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
          class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer select-none
						{selectedCategory === cat
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10'}"
        >
          {cat}
        </button>
      {/each}
    </div>
  </div>

  <!-- Search Result Status Indicator -->
  {#if isSearchActive}
    <div class="text-[11px] font-semibold text-slate-400 dark:text-slate-400 -mt-1">
      Menampilkan <span class="font-bold text-emerald-600 dark:text-emerald-400">{filteredProducts().length}</span> produk untuk "{searchQuery}"
    </div>
  {/if}

  <!-- Products Grid Area -->
  <div class="flex-1 min-h-[50vh] overflow-y-auto pr-1 pb-6 scrollbar-none">
    {#if filteredProducts().length > 0}
      <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {#each filteredProducts() as product (product.id)}
          {@const cartItem = cart.items.find((item) => item.product.id === product.id)}
          {@const displayStock = product.stock - (cartItem?.qty || 0)}
          {@const outOfStock = displayStock <= 0}
          {@const inCartQty = cartItem?.qty || 0}

          <button
            type="button"
            onclick={() => !outOfStock && onselect(product)}
            disabled={outOfStock}
            class="flex flex-col text-left bg-base/90 dark:bg-surface/50 rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-emerald-950/80 hover:border-emerald-500/40 transition-all duration-150 focus:outline-none group relative select-none shadow-2xs hover:shadow-xs
							{outOfStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}"
          >
            <!-- Product Thumbnail Image & Badges -->
            <div
              class="aspect-4/3 w-full rounded-xl bg-emerald-500/5 dark:bg-emerald-950/30 border border-slate-200/40 dark:border-emerald-950/50 mb-3 overflow-hidden flex items-center justify-center relative"
            >
              {#if product.imageUrl}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              {:else}
                <div class="flex flex-col items-center gap-1 text-slate-400 dark:text-emerald-500/40">
                  <Package class="w-7 h-7 stroke-[1.5]" />
                </div>
              {/if}

              <!-- Active Cart Quantity Badge (Top-Left) -->
              {#if inCartQty > 0}
                <div class="absolute top-2 left-2 z-10">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-xs ring-2 ring-white/50 dark:ring-slate-900/50"
                  >
                    +{inCartQty} di keranjang
                  </span>
                </div>
              {/if}

              <!-- Floating Stock Badge (Top-Right) -->
              <div class="absolute top-2 right-2 z-10">
                {#if displayStock <= 0}
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  >
                    Habis
                  </span>
                {:else if displayStock <= product.minStock}
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                  >
                    Sisa {displayStock} {product.unit}
                  </span>
                {:else}
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-base/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800"
                  >
                    {displayStock} {product.unit}
                  </span>
                {/if}
              </div>
            </div>

            <!-- Product SKU & Title -->
            <span class="font-mono text-[10px] text-slate-400 dark:text-slate-400 font-medium uppercase tracking-wider">
              SKU: {product.sku || '-'}
            </span>
            <h4
              class="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm mt-0.5 line-clamp-1 min-h-[20px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
            >
              {product.name}
            </h4>

            <!-- Product Selling Price & Quick Add Button -->
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/40 dark:border-emerald-950/40 w-full">
              <span class="font-mono font-black text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                {formatCurrency(product.sellingPrice)}
              </span>

              <div
                class="p-1.5 rounded-xl bg-emerald-600 text-white shadow-2xs group-hover:scale-110 group-hover:bg-emerald-700 transition-all flex items-center justify-center shrink-0"
                title="Tambah ke keranjang"
              >
                <Plus class="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </button>
        {/each}
      </div>
    {:else}
      <div class="flex flex-col items-center justify-center gap-3 py-20 text-slate-400 select-none">
        <AlertCircle class="w-10 h-10 text-emerald-500/40" />
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {isSearchActive ? `Tidak ada produk cocok dengan "${searchQuery}"` : 'Belum ada produk aktif'}
        </span>
      </div>
    {/if}
  </div>
</div>
