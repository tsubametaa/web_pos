<script lang="ts">
  /* ProductFormModal.svelte - Redesigned modal component to create or update products with formatted currency inputs */
  import { toast } from '../../../lib/utils/toast.svelte';
  import { API_BASE_URL } from '../../../core/api';
  import { X, Save, Package, Upload, Trash2 } from 'lucide-svelte';
  import Fuse from 'fuse.js';
  import type { UIProduct } from '../../../types';

  interface Props {
    product: UIProduct | null;
    isLoading: boolean;
    products?: UIProduct[];
    onclose: () => void;
    onsave: (data: any) => void;
  }

  let { product, isLoading, products = [], onclose, onsave }: Props = $props();

  let name = $state('');
  let category = $state('');
  let unit = $state('pcs');
  let costPrice = $state(0);
  let sellingPrice = $state(0);
  let displayCostPrice = $state('');
  let displaySellingPrice = $state('');
  let stock = $state(0);
  let minStock = $state(10);
  let imageUrl = $state('');
  let notes = $state('');
  let isFocused = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);
  let uploading = $state(false);

  const quickUnits = ['pcs', 'box', 'kg', 'liter', 'pack', 'porsi'];

  // Helper functions for Indonesian thousand separator dots
  function formatDigits(val: number | string): string {
    if (val === null || val === undefined || val === '') return '';
    const digits = String(val).replace(/\D/g, ''); // Strip all non-digit characters
    if (!digits) return '';
    const num = parseInt(digits, 10);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID').format(num);
  }

  function handleCostPriceInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, ''); // Strip symbols automatically
    const num = digits ? parseInt(digits, 10) : 0;
    costPrice = num;
    const formatted = digits ? formatDigits(digits) : '';
    displayCostPrice = formatted;
    input.value = formatted;
  }

  function handleSellingPriceInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, ''); // Strip symbols automatically
    const num = digits ? parseInt(digits, 10) : 0;
    sellingPrice = num;
    const formatted = digits ? formatDigits(digits) : '';
    displaySellingPrice = formatted;
    input.value = formatted;
  }

  async function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    uploading = true;
    const formData = new FormData();
    formData.append('file', file);

    const savedEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_email') : null;
    const headers: Record<string, string> = {};
    if (savedEmail) {
      headers['Authorization'] = `Bearer ${savedEmail}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/uploads/upload`, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      let result: any;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        result = { success: false, error: text || `HTTP ${response.status}` };
      }

      if (response.ok && result.success) {
        imageUrl = result.url;
        toast.success('Gambar berhasil diunggah!');
      } else if (response.status === 401) {
        toast.error('Sesi habis, silakan login kembali.');
      } else {
        toast.error(result.error || `Gagal mengunggah gambar (${response.status}).`);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      toast.error('Gagal mengunggah gambar: Koneksi ke server bermasalah.');
    } finally {
      uploading = false;
      if (target) target.value = '';
    }
  }

  $effect(() => {
    if (product) {
      name = product.name ?? '';
      category = product.category ?? '';
      unit = product.unit ?? 'pcs';
      costPrice = product.costPrice ?? 0;
      sellingPrice = product.sellingPrice ?? 0;
      displayCostPrice = product.costPrice ? formatDigits(product.costPrice) : '';
      displaySellingPrice = product.sellingPrice ? formatDigits(product.sellingPrice) : '';
      stock = product.stock ?? 0;
      minStock = product.minStock ?? 10;
      imageUrl = product.imageUrl ?? '';
      notes = product.notes ?? '';
    } else {
      name = '';
      category = '';
      unit = 'pcs';
      costPrice = 0;
      sellingPrice = 0;
      displayCostPrice = '';
      displaySellingPrice = '';
      stock = 0;
      minStock = 10;
      imageUrl = '';
      notes = '';
    }
  });

  const isEdit = $derived(!!product?.id);

  // Extract unique categories for fuzzy matching dropdown
  const existingCategories = $derived([
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ]);

  const categoryFuse = $derived(
    new Fuse(existingCategories, {
      threshold: 0.4,
      shouldSort: true,
    })
  );

  // Real-time category suggestions
  const categorySuggestions = $derived.by(() => {
    const query = category.trim();
    if (!query) return [];

    if (existingCategories.includes(query)) return [];

    const matches = categoryFuse.search(query).map((res) => res.item);
    const titleCasedQuery = toTitleCase(query);
    const suggestions = [...matches];

    if (!existingCategories.includes(titleCasedQuery) && !suggestions.includes(titleCasedQuery)) {
      suggestions.unshift(titleCasedQuery);
    }

    return suggestions.filter((sug) => sug !== query).slice(0, 5);
  });

  function toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function normalizeCategory(cat: string): string {
    const trimmed = cat.trim();
    const match = products.find(
      (p) => p.category && p.category.toLowerCase() === trimmed.toLowerCase()
    );
    return match?.category ? match.category : toTitleCase(trimmed);
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error('Nama produk wajib diisi.');
      return;
    }
    if (!category.trim()) {
      toast.error('Kategori wajib diisi.');
      return;
    }
    if (!unit.trim()) {
      toast.error('Satuan wajib diisi.');
      return;
    }
    if (costPrice < 0) {
      toast.error('HPP tidak boleh negatif.');
      return;
    }
    if (sellingPrice < 0) {
      toast.error('Harga jual tidak boleh negatif.');
      return;
    }

    onsave({
      name: name.trim(),
      category: normalizeCategory(category),
      unit: unit.trim(),
      costPrice: isFinite(Number(costPrice)) ? Number(costPrice) : 0,
      sellingPrice: isFinite(Number(sellingPrice)) ? Number(sellingPrice) : 0,
      stock: isFinite(Number(stock)) ? Number(stock) : 0,
      minStock: isFinite(Number(minStock)) ? Number(minStock) : 0,
      ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
  }
</script>

<!-- Backdrop Overlay -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
  role="dialog"
  aria-modal="true"
  tabindex="-1"
>
  <!-- Modal Card -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="relative w-full max-w-xl bg-base dark:bg-surface border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-ink select-none"
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Modal Header -->
    <div
      class="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/60 dark:border-emerald-950/60 bg-base/50 dark:bg-surface/50"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <Package class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-extrabold dark:text-white tracking-tight">
            {isEdit ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
          </h2>
          <p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
            Lengkapi detail produk untuk dimasukkan ke katalog toko.
          </p>
        </div>
      </div>

      <button
        type="button"
        onclick={onclose}
        class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
        aria-label="Tutup modal"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Form Content Body -->
    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-none">
      <!-- Section 1: Informasi Utama -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
          Informasi Utama Produk
        </h3>

        <!-- Nama Produk -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="prod-name">
            Nama Produk *
          </label>
          <input
            id="prod-name"
            type="text"
            bind:value={name}
            placeholder="Contoh: Kopi Susu Gula Aren"
            class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Kategori -->
          <div class="relative">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="prod-cat">
              Kategori *
            </label>
            <input
              id="prod-cat"
              type="text"
              bind:value={category}
              placeholder="Contoh: Minuman"
              autocomplete="off"
              onfocus={() => (isFocused = true)}
              onblur={() => setTimeout(() => (isFocused = false), 200)}
              class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
            />

            <!-- Autocomplete Popup -->
            {#if isFocused && categorySuggestions.length > 0}
              <div
                class="absolute left-0 right-0 z-20 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto py-1"
              >
                {#each categorySuggestions as sug}
                  <button
                    type="button"
                    onclick={() => (category = sug)}
                    class="w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-emerald-500/10 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    {sug}
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Satuan Unit with Quick Pills -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="prod-unit">
              Satuan Unit *
            </label>
            <input
              id="prod-unit"
              type="text"
              bind:value={unit}
              placeholder="pcs / kg / liter"
              class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
            />

            <!-- Quick Unit Pills -->
            <div class="flex items-center gap-1 mt-1.5 flex-wrap">
              {#each quickUnits as qUnit}
                <button
                  type="button"
                  onclick={() => (unit = qUnit)}
                  class="px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer
										{unit.toLowerCase() === qUnit
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-base dark:bg-base/60 text-slate-500 border-slate-200/60 hover:bg-emerald-500/10'}"
                >
                  {qUnit}
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Harga & Persediaan (Formatted with thousand separator dots) -->
      <div class="space-y-4 pt-2 border-t border-slate-200/40 dark:border-emerald-950/40">
        <h3 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
          Harga & Persediaan Stok
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- HPP Modal -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="prod-cost">
              HPP / Modal *
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                Rp
              </span>
              <input
                id="prod-cost"
                type="text"
                inputmode="numeric"
                value={displayCostPrice}
                oninput={handleCostPriceInput}
                placeholder="0"
                class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>

          <!-- Harga Jual -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="prod-sell">
              Harga Jual *
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                Rp
              </span>
              <input
                id="prod-sell"
                type="text"
                inputmode="numeric"
                value={displaySellingPrice}
                oninput={handleSellingPriceInput}
                placeholder="0"
                class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>

          <!-- Stok Awal -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="prod-stock">
              Stok Awal
            </label>
            <input
              id="prod-stock"
              type="number"
              bind:value={stock}
              min="0"
              class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
            />
          </div>

          <!-- Alert Stok Minimal -->
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="prod-minstock">
              Stok Minimal (Warning)
            </label>
            <input
              id="prod-minstock"
              type="number"
              bind:value={minStock}
              min="0"
              class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      <!-- Section 3: Gambar & Details -->
      <div class="space-y-4 pt-2 border-t border-slate-200/40 dark:border-emerald-950/40">
        <h3 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
          Media Gambar & Catatan
        </h3>

        <!-- Image Upload -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="prod-img">
            Gambar Produk (Opsional)
          </label>

          <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {#if imageUrl}
              <div
                class="relative w-20 h-20 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shrink-0 bg-emerald-500/5 group shadow-2xs"
              >
                <img src={imageUrl} alt="Pratinjau produk" class="w-full h-full object-cover" />
                <button
                  type="button"
                  onclick={() => (imageUrl = '')}
                  class="absolute inset-0 bg-slate-950/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold cursor-pointer"
                >
                  <Trash2 class="w-4 h-4 text-rose-400" />
                </button>
              </div>
            {/if}

            <div class="flex-1 w-full flex flex-col gap-1.5">
              <div class="flex gap-2 w-full">
                <input
                  id="prod-img"
                  type="url"
                  bind:value={imageUrl}
                  placeholder="Tempel URL gambar atau unggah file..."
                  class="flex-1 px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                />

                <input
                  type="file"
                  id="file-upload"
                  class="hidden"
                  accept="image/png, image/jpeg, image/webp, image/heic, .heic"
                  bind:this={fileInput}
                  onchange={handleFileChange}
                />

                <button
                  type="button"
                  onclick={() => fileInput?.click()}
                  disabled={uploading}
                  class="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs"
                >
                  {#if uploading}
                    <span class="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                    <span>Mengunggah...</span>
                  {:else}
                    <Upload class="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  {/if}
                </button>
              </div>
              <p class="text-[10px] text-slate-400 font-medium">Format didukung: JPG, PNG, WEBP, HEIC</p>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for="prod-notes">
            Catatan / Spesifikasi
          </label>
          <textarea
            id="prod-notes"
            bind:value={notes}
            rows="2"
            placeholder="Keterangan tambahan produk..."
            class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Modal Footer Actions -->
    <div
      class="px-6 py-4 border-t border-slate-200/60 dark:border-emerald-950/60 bg-base/50 dark:bg-surface/50 flex items-center justify-end gap-3"
    >
      <button
        type="button"
        onclick={onclose}
        class="px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        Batal
      </button>

      <button
        type="button"
        onclick={handleSubmit}
        disabled={isLoading}
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs hover:shadow"
      >
        {#if isLoading}
          <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>Menyimpan...</span>
        {:else}
          <Save class="w-4 h-4" />
          <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}</span>
        {/if}
      </button>
    </div>
  </div>
</div>
