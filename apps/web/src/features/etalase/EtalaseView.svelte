<script lang="ts">
  import { onMount } from 'svelte';
  import { formatCurrency } from '../../lib/utils/currency';
  import {
    Search,
    Store,
    Phone,
    MapPin,
    Package,
    Rocket,
    X,
    MessageCircle,
    SlidersHorizontal,
  } from 'lucide-svelte';
  import { api } from '../../core/api';
  import Spinner from '../../components/ui/Spinner.svelte';
  import Dropdown from '../../components/ui/Dropdown.svelte';
  import logoUrl from '../../assets/img/kslogo.svg';
  import ProductDetail from './components/ProductDetail.svelte';
  import type { UIProduct, UISettings } from '../../types';

  let { productId }: { productId?: string } = $props();

  let loading = $state(true);
  let products = $state<UIProduct[]>([]);
  let settings = $state<UISettings | null>(null);

  let searchQuery = $state('');
  let selectedCategory = $state('');
  let sortBy = $state<'newest' | 'price-asc' | 'price-desc' | 'stock-desc'>('newest');

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'price-asc', label: 'Harga: Termurah' },
    { value: 'price-desc', label: 'Harga: Tertinggi' },
    { value: 'stock-desc', label: 'Stok: Terbanyak' },
  ];

  const categories = $derived([
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ]);

  const categoryOptions = $derived([
    { value: '', label: 'Semua Kategori' },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ]);

  const filteredProducts = $derived.by(() => {
    let list = products.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q));
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory && p.isActive;
    });

    // Apply sorting
    return list.sort((a, b) => {
      if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'stock-desc') return b.stock - a.stock;
      return 0; // Default newest order from DB
    });
  });

  const isSearchActive = $derived(searchQuery.trim().length > 0);

  function clearSearch() {
    searchQuery = '';
  }

  async function loadCatalog() {
    try {
      const res = await api.get('/etalase');
      if (res.success) {
        products = res.products || [];
        settings = res.settings || null;
      }
    } catch (err) {
      console.error('Error fetching etalase catalog:', err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    if (!productId) {
      loadCatalog();
    }
  });

  function handleBackToCatalog() {
    window.location.hash = '#/etalase';
  }

  function getWhatsAppUrl(product: UIProduct) {
    if (!settings?.businessPhone) return '#';
    const biz = settings.businessName || 'Toko';
    const link = `${window.location.origin}/#/etalase/${product.id}`;
    const text = `Halo ${biz}, saya berminat untuk membeli produk berikut:\n\n*Nama:* ${product.name}\n*SKU:* ${product.sku || '-'}\n*Harga:* ${formatCurrency(product.sellingPrice)}\n*Link:* ${link}\n\nApakah stok masih tersedia?`;
    return `https://wa.me/${settings.businessPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  }
</script>

{#if productId}
  <ProductDetail {productId} onBack={handleBackToCatalog} />
{:else if loading}
  <div class="min-h-screen flex items-center justify-center bg-base text-ink">
    <Spinner size="lg" />
  </div>
{:else}
  <div class="min-h-screen bg-base text-ink flex flex-col font-sans antialiased select-none">
    <!-- E-Commerce Minimalist Sticky Header Bar -->
    <header
      class="bg-base/90 dark:bg-surface/90 backdrop-blur-md border-b border-slate-200/80 dark:border-emerald-950/80 py-3.5 px-4 sm:px-6 sticky top-0 z-30 shadow-2xs"
    >
      <div class="max-w-7xl w-full mx-auto flex items-center gap-4 justify-between">
        <!-- Store Brand Identity -->
        <a href="#/etalase" class="flex items-center shrink-0 group">
          <img src={logoUrl} alt="ArthaPOS Logo" class="h-9 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform" />
        </a>

        <!-- Search Input Bar -->
        <div class="flex-1 max-w-md relative hidden sm:block">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Cari produk di {settings?.businessName || 'toko kami'}..."
            class="w-full pl-10 pr-9 py-2 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
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

        <!-- WhatsApp Store Contact Button -->
        {#if settings?.businessPhone}
          <a
            href="https://wa.me/{settings.businessPhone.replace(/\D/g, '')}"
            target="_blank"
            class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all shrink-0 cursor-pointer"
          >
            <Phone class="w-4 h-4" />
            <span class="hidden sm:inline">Hubungi Toko</span>
          </a>
        {/if}
      </div>

      <!-- Mobile Search Bar -->
      <div class="sm:hidden mt-3 relative w-full">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cari produk..."
          class="w-full pl-10 pr-9 py-2 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
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
    </header>

    <!-- Main Content Workspace -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
      <!-- Toolbar Strip: Category Dropdown & Sorting Dropdown -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full border-b border-slate-200/60 dark:border-emerald-950/60 pb-4">
        <!-- Category Filter Dropdown -->
        <div class="flex items-center gap-3">
          <Dropdown
            options={categoryOptions}
            bind:value={selectedCategory}
            placeholder="Semua Kategori"
          />
        </div>

        <!-- Sort Selector Dropdown & Products Counter -->
        <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span class="text-xs font-semibold text-slate-400">
            <span class="font-bold text-emerald-600 dark:text-emerald-400">{filteredProducts.length}</span> produk
          </span>

          <Dropdown
            options={sortOptions}
            bind:value={sortBy}
            placeholder="Urutkan..."
          />
        </div>
      </div>

      <!-- Search Counter Banner if Search Query Active -->
      {#if isSearchActive}
        <div class="text-[11px] font-semibold text-slate-400 -mt-2">
          Menampilkan <span class="font-bold text-emerald-600 dark:text-emerald-400">{filteredProducts.length}</span> hasil pencarian untuk "{searchQuery}"
        </div>
      {/if}

      <!-- Clean Product Cards Grid -->
      {#if filteredProducts.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {#each filteredProducts as product (product.id)}
            <div
              class="group flex flex-col bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-500/50 transition-all duration-200"
            >
              <!-- Aspect 1:1 Image Box (Clickable to detail page) -->
              <a
                href={`#/etalase/${product.id}`}
                class="aspect-square w-full bg-emerald-500/5 overflow-hidden flex items-center justify-center relative border-b border-slate-200/40 dark:border-emerald-950/40 cursor-pointer"
              >
                {#if product.imageUrl}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                {:else}
                  <Package class="w-10 h-10 text-emerald-600/60 dark:text-emerald-400/60 stroke-[1.2]" />
                {/if}

                <!-- Out of Stock Overlay -->
                {#if product.stock <= 0}
                  <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center">
                    <span class="text-white text-[10px] font-extrabold bg-rose-600 px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-xs">
                      Stok Habis
                    </span>
                  </div>
                {/if}
              </a>

              <!-- Product Info Body -->
              <div class="p-3.5 flex flex-col justify-between flex-1 gap-3">
                <div class="space-y-1">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {product.category || 'Umum'}
                  </span>
                  <a
                    href={`#/etalase/${product.id}`}
                    class="block text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug hover:text-emerald-600 transition-colors"
                  >
                    {product.name}
                  </a>
                </div>

                <div class="pt-2.5 border-t border-slate-200/40 dark:border-emerald-950/40 flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(product.sellingPrice)}
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium">
                      Stok {product.stock}
                    </span>
                  </div>

                  <!-- Direct 1-Click WhatsApp Purchase Button -->
                  {#if settings?.businessPhone}
                    <a
                      href={getWhatsAppUrl(product)}
                      target="_blank"
                      class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-2xs hover:shadow transition-all cursor-pointer"
                    >
                      <MessageCircle class="w-3.5 h-3.5" />
                      <span>Beli via WA</span>
                    </a>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="py-24 text-center bg-base/90 dark:bg-surface/50 rounded-2xl border border-slate-200/80 dark:border-emerald-950/80 shadow-2xs">
          <p class="text-xs font-bold text-slate-400">
            {isSearchActive
              ? `Tidak ada produk cocok dengan "${searchQuery}"`
              : 'Belum ada produk terdaftar di etalase'}
          </p>
        </div>
      {/if}
    </main>

    <!-- Footer -->
    <footer class="bg-base/90 dark:bg-surface/60 border-t border-slate-200/80 dark:border-emerald-950/80 py-8 px-4 sm:px-6 mt-12">
      <div class="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
        <div class="space-y-2 max-w-md">
          <div class="flex items-center">
            <img src={logoUrl} alt="ArthaPOS Logo" class="h-7 w-auto object-contain shrink-0" />
          </div>
          <p class="text-xs text-slate-500 dark:text-emerald-500/70 leading-relaxed font-medium">
            Katalog resmi toko online. Hubungi kami secara langsung untuk pembelian grosir atau konsultasi persediaan produk.
          </p>
        </div>

        <div class="space-y-2 text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
          <span class="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">
            Kontak Toko
          </span>
          {#if settings?.businessAddress}
            <div class="flex items-center gap-2">
              <MapPin class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{settings.businessAddress}</span>
            </div>
          {/if}
          {#if settings?.businessPhone}
            <div class="flex items-center gap-2">
              <Phone class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{settings.businessPhone}</span>
            </div>
          {/if}
        </div>
      </div>

      <div class="max-w-7xl w-full mx-auto border-t border-slate-200/60 dark:border-emerald-950/60 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400 font-medium">
        <span>&copy; {new Date().getFullYear()} {settings?.businessName || 'ArthaPOS'}. Hak Cipta Dilindungi.</span>
        <span class="flex items-center gap-1 font-bold">
          Powered by <span class="text-slate-800 dark:text-white font-black inline-flex items-center gap-1">ArthaPOS <Rocket class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /></span>
        </span>
      </div>
    </footer>
  </div>
{/if}
