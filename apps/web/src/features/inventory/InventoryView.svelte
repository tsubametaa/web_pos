<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../../core/api';
  import { toast } from '../../lib/utils/toast.svelte';
  import { formatCurrency } from '../../lib/utils/currency';
  import Spinner from '../../components/ui/Spinner.svelte';
  import ProductTable from './components/ProductTable.svelte';
  import ProductFormModal from './components/ProductFormModal.svelte';
  import StockAdjustModal from './components/StockAdjustModal.svelte';
  import ProductShareModal from './components/ProductShareModal.svelte';
  import { Plus, Package, CheckCircle2, AlertTriangle, Coins } from 'lucide-svelte';
  import type { UIProduct } from '../../types';

  let loading = $state(true);
  let products = $state<UIProduct[]>([]);

  let showFormModal = $state(false);
  let showStockModal = $state(false);
  let showShareModal = $state(false);
  let selectedProduct = $state<UIProduct | null>(null);
  let isSaving = $state(false);

  async function loadInventory() {
    try {
      const res = await api.get('/products');
      if (res.success) {
        products = res.products;
      }
    } catch (err) {
      console.error('Error fetching inventory products:', err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadInventory();
  });

  function handleAdd() {
    selectedProduct = null;
    showFormModal = true;
  }

  function handleEdit(product: UIProduct) {
    selectedProduct = product;
    showFormModal = true;
  }

  function handleAdjustStock(product: UIProduct) {
    selectedProduct = product;
    showStockModal = true;
  }

  function handleShare(product: UIProduct) {
    selectedProduct = product;
    showShareModal = true;
  }

  async function handleToggleStatus(product: UIProduct) {
    try {
      const res = await api.delete(`/products?id=${product.id}`);
      if (res.success) {
        const updated = res.product;
        products = products.map((p) => (p.id === updated.id ? updated : p));
        toast.success(
          `Produk "${updated.name}" ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status produk.');
    }
  }

  async function handleFormSave(formData: any) {
    isSaving = true;
    try {
      if (selectedProduct) {
        const res = await api.put('/products', { id: selectedProduct.id, ...formData });
        if (res.success) {
          const updated = res.product;
          products = products.map((p) => (p.id === updated.id ? updated : p));
          toast.success('Produk berhasil diperbarui!');
          showFormModal = false;
        }
      } else {
        const res = await api.post('/products', formData);
        if (res.success) {
          const newProduct = res.product;
          products = [newProduct, ...products];
          toast.success('Produk baru berhasil ditambahkan!');
          showFormModal = false;
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan produk.');
    } finally {
      isSaving = false;
    }
  }

  async function handleStockSave() {
    await loadInventory();
    showStockModal = false;
    toast.success('Stok berhasil disesuaikan!');
  }

  // Summary statistics
  const totalProducts = $derived(products.length);
  const activeProducts = $derived(products.filter((p) => p.isActive).length);
  const lowStockProducts = $derived(
    products.filter((p) => p.isActive && p.stock <= p.minStock).length
  );
  const totalInventoryValuation = $derived(
    products.reduce((acc, p) => acc + Math.max(p.stock, 0) * (p.costPrice || 0), 0)
  );

  const categories = $derived([...new Set(products.map((p) => p.category).filter(Boolean))]);
</script>

{#if loading}
  <div class="h-96 flex flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">
      Memuat Data Inventori...
    </span>
  </div>
{:else}
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Top Bar & Title -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-base/90 dark:bg-surface/60 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl shadow-2xs"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <Package class="w-5 h-5" />
          </div>
          <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Manajemen Inventori
          </h1>
        </div>
        <p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
          Kelola katalog produk, pantau persediaan stok, dan atur harga jual serta HPP toko Anda.
        </p>
      </div>

      <button
        type="button"
        onclick={handleAdd}
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs hover:shadow transition-all duration-150 group shrink-0 cursor-pointer"
      >
        <Plus class="w-4 h-4 group-hover:rotate-90 transition-transform" />
        <span>Tambah Produk Baru</span>
      </button>
    </div>

    <!-- Summary KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Produk
          </span>
          <div class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <Package class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-mono">
          {totalProducts} <span class="text-xs font-semibold text-slate-400">Item</span>
        </span>
      </div>

      <div
        class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Produk Aktif
          </span>
          <div class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
          {activeProducts} <span class="text-xs font-semibold text-slate-400">Aktif</span>
        </span>
      </div>

      <div
        class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Stok Menipis
          </span>
          <div class="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
          {lowStockProducts} <span class="text-xs font-semibold text-slate-400">Perlu Restock</span>
        </span>
      </div>

      <div
        class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Nilai Estimasi Stok
          </span>
          <div class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <Coins class="w-4 h-4" />
          </div>
        </div>
        <span class="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-mono truncate">
          {formatCurrency(totalInventoryValuation)}
        </span>
      </div>
    </div>

    <!-- Product Table Section -->
    <ProductTable
      {products}
      {categories}
      onedit={handleEdit}
      onadjust={handleAdjustStock}
      onshare={handleShare}
      ontoggle={handleToggleStatus}
    />
  </div>

  <!-- Modals -->
  {#if showFormModal}
    <ProductFormModal
      product={selectedProduct}
      isLoading={isSaving}
      {products}
      onclose={() => (showFormModal = false)}
      onsave={handleFormSave}
    />
  {/if}

  {#if showStockModal && selectedProduct}
    <StockAdjustModal
      product={selectedProduct}
      onclose={() => (showStockModal = false)}
      onsave={handleStockSave}
    />
  {/if}

  {#if showShareModal && selectedProduct}
    <ProductShareModal
      product={selectedProduct}
      onclose={() => (showShareModal = false)}
    />
  {/if}
{/if}
