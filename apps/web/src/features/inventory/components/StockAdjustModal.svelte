<script lang="ts">
  import { api } from '../../../core/api';
  import { toast } from '../../../lib/utils/toast.svelte';
  import { X, Plus, Minus, Package2, Save } from 'lucide-svelte';
  import type { UIProduct } from '../../../types';

  interface Props {
    product: UIProduct;
    onclose: () => void;
    onsave: () => void;
  }

  let { product, onclose, onsave }: Props = $props();

  let adjustment = $state(0);
  let adjustmentNotes = $state('');
  let isLoading = $state(false);

  const newStock = $derived(product.stock + adjustment);

  async function handleSave() {
    if (adjustment === 0) {
      toast.warning('Jumlah penyesuaian tidak boleh 0.');
      return;
    }
    if (!adjustmentNotes.trim()) {
      toast.error('Alasan penyesuaian wajib diisi.');
      return;
    }
    if (newStock < 0) {
      toast.error('Stok tidak boleh kurang dari 0.');
      return;
    }

    isLoading = true;
    try {
      const res = await api.put('/products', {
        id: product.id,
        stockAdjustment: adjustment,
        adjustmentNotes: adjustmentNotes.trim(),
      });
      if (res.success) {
        onsave();
      } else {
        throw new Error(res.error || 'Gagal menyesuaikan stok.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyesuaikan stok.');
    } finally {
      isLoading = false;
    }
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
  role="dialog"
  aria-modal="true"
  tabindex="-1"
>
  <!-- Modal Card Container -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="relative w-full max-w-md bg-base dark:bg-surface border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-ink select-none"
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/60 dark:border-emerald-950/60 bg-base/50 dark:bg-surface/50"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
          <Package2 class="w-5 h-5" />
        </div>
        <div>
          <h2 class="font-extrabold text-slate-900 dark:text-white tracking-tight">
            Penyesuaian Stok
          </h2>
          <p class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-60">
            {product.name}
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

    <!-- Body Content -->
    <div class="px-6 py-5 flex flex-col gap-5">
      <!-- Current Stock Box -->
      <div
        class="bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4 text-center"
      >
        <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Stok Persediaan Saat Ini
        </p>
        <p class="text-3xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
          {product.stock}
        </p>
        <p class="text-xs font-medium text-slate-400 mt-0.5">{product.unit || 'unit'}</p>
      </div>

      <!-- Adjustment Controls -->
      <div>
        <label
          class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2"
          for="adj-qty"
        >
          Jumlah Penyesuaian (+ / -)
        </label>
        <div class="flex items-center gap-3">
          <button
            type="button"
            onclick={() => adjustment--}
            class="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-xl cursor-pointer transition-all"
            title="Kurangi stok"
          >
            <Minus class="w-4 h-4" />
          </button>

          <input
            id="adj-qty"
            type="number"
            bind:value={adjustment}
            class="flex-1 text-center px-3 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-lg font-mono font-black text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
          />

          <button
            type="button"
            onclick={() => adjustment++}
            class="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl cursor-pointer transition-all"
            title="Tambah stok"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <p class="text-xs text-center mt-2.5 font-bold {newStock < 0 ? 'text-rose-600' : 'text-slate-500'}">
          Stok Setelah Disesuaikan: <span class="font-mono font-black text-slate-800 dark:text-white">{newStock} {product.unit || 'unit'}</span>
        </p>
      </div>

      <!-- Notes -->
      <div>
        <label
          class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
          for="adj-notes"
        >
          Alasan Penyesuaian *
        </label>
        <textarea
          id="adj-notes"
          bind:value={adjustmentNotes}
          rows="2"
          placeholder="Contoh: Penerimaan barang supplier / Penyesuaian stok opname..."
          class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
        ></textarea>
      </div>
    </div>

    <!-- Footer Actions -->
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
        onclick={handleSave}
        disabled={isLoading || newStock < 0 || adjustment === 0}
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs disabled:pointer-events-none"
      >
        {#if isLoading}
          <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>Menyimpan...</span>
        {:else}
          <Save class="w-4 h-4" />
          <span>Simpan Stok</span>
        {/if}
      </button>
    </div>
  </div>
</div>
