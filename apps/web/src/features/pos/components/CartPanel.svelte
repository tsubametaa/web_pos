<script lang="ts">
  import { cart } from '../logic/cart.svelte';
  import { formatCurrency } from '../../../lib/utils/currency';
  import { toast } from '../../../lib/utils/toast.svelte';
  import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from 'lucide-svelte';
  import type { UISettings } from '../../../types';

  interface Props {
    settings: UISettings | null;
    oncheckout: () => void;
  }

  let { settings, oncheckout }: Props = $props();

  // Tax calculation
  const taxRate = $derived(settings?.taxRate || 0);
  const subtotal = $derived(cart.totalAmount);
  const taxAmount = $derived((subtotal * taxRate) / 100);
  const totalAmount = $derived(subtotal + taxAmount);

  function handleQtyChange(productId: string, currentQty: number, offset: number) {
    const targetQty = currentQty + offset;
    const warning = cart.updateQty(productId, targetQty);
    if (warning) {
      toast.warning(warning);
    }
  }
</script>

<div
  class="flex flex-col h-full bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 sm:p-5 shadow-2xs relative overflow-hidden text-ink select-none"
>
  <!-- Panel Header -->
  <div
    class="flex items-center justify-between pb-3.5 border-b border-slate-200/60 dark:border-emerald-950/60 mb-3"
  >
    <div class="flex items-center gap-2">
      <div class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
        <ShoppingCart class="w-4 h-4" />
      </div>
      <h3 class="text-xs font-bold text-slate-800 dark:text-emerald-100 uppercase tracking-wider">
        Keranjang ({cart.totalItems})
      </h3>
    </div>

    <button
      type="button"
      onclick={() => cart.clear()}
      disabled={cart.items.length === 0}
      class="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
      title="Bersihkan Keranjang"
    >
      <Trash2 class="w-3.5 h-3.5" />
      <span>Bersihkan</span>
    </button>
  </div>

  <!-- Cart Items Scroll List -->
  <div class="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 min-h-65 scrollbar-none">
    {#each cart.items as item (item.product.id)}
      <div
        class="p-3 bg-base dark:bg-slate-900/60 border border-slate-200/60 dark:border-emerald-950/60 rounded-xl flex justify-between gap-3 items-center hover:border-emerald-500/30 transition-all duration-150 shadow-2xs"
      >
        <div class="flex-1 min-w-0">
          <h5 class="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
            {item.product.name}
          </h5>
          <span class="font-mono text-[10px] text-slate-400 block mt-0.5 uppercase">
            SKU: {item.product.sku || '-'}
          </span>
          <span class="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
            {formatCurrency(item.product.sellingPrice)}
          </span>
        </div>

        <!-- Quantity Stepper Controls -->
        <div
          class="flex items-center bg-base dark:bg-surface border border-slate-200/80 dark:border-slate-800 rounded-lg p-0.5 shrink-0"
        >
          <button
            type="button"
            onclick={() => handleQtyChange(item.product.id, item.qty, -1)}
            class="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-300 cursor-pointer transition-colors"
            title="Kurangi Quantity"
          >
            <Minus class="w-3 h-3" />
          </button>
          <span class="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 px-1.5 min-w-[24px] text-center">
            {item.qty}
          </span>
          <button
            type="button"
            onclick={() => handleQtyChange(item.product.id, item.qty, 1)}
            class="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-300 cursor-pointer transition-colors"
            title="Tambah Quantity"
          >
            <Plus class="w-3 h-3" />
          </button>
        </div>

        <!-- Item Subtotal & Delete Action -->
        <div class="flex flex-col items-end gap-1 min-w-[70px] shrink-0">
          <span class="font-mono text-xs font-black text-slate-800 dark:text-white">
            {formatCurrency(item.qty * item.product.sellingPrice)}
          </span>
          <button
            type="button"
            onclick={() => cart.remove(item.product.id)}
            class="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            title="Hapus Item"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    {:else}
      <div
        class="flex-1 flex flex-col items-center justify-center gap-2.5 text-slate-400 text-center py-20"
      >
        <div class="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
          <ShoppingCart class="w-6 h-6 stroke-[1.5]" />
        </div>
        <div class="space-y-0.5">
          <p class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Keranjang Masih Kosong
          </p>
          <p class="text-[11px] text-slate-400">
            Klik produk dari daftar di samping untuk menambahkan.
          </p>
        </div>
      </div>
    {/each}
  </div>

  <!-- Billing Summary Footer -->
  <div class="border-t border-slate-200/60 dark:border-emerald-950/60 pt-3.5 mt-3 flex flex-col gap-2.5">
    <div class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
      <span>Subtotal ({cart.totalItems} item)</span>
      <span class="font-mono font-bold text-slate-700 dark:text-slate-200">
        {formatCurrency(subtotal)}
      </span>
    </div>

    {#if taxRate > 0}
      <div class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
        <span>Pajak PPN ({taxRate}%)</span>
        <span class="font-mono font-bold text-slate-700 dark:text-slate-200">
          {formatCurrency(taxAmount)}
        </span>
      </div>
    {/if}

    <!-- Total Amount Box -->
    <div
      class="flex justify-between items-center p-3.5 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 rounded-xl mt-1"
    >
      <span class="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
        Total Bayar
      </span>
      <span class="font-mono text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300">
        {formatCurrency(totalAmount)}
      </span>
    </div>

    <!-- Checkout Trigger Button -->
    <button
      type="button"
      onclick={oncheckout}
      disabled={cart.items.length === 0}
      class="w-full mt-1.5 inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-35 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-xs hover:shadow transition-all duration-150 disabled:pointer-events-none cursor-pointer"
    >
      <CreditCard class="w-4 h-4" />
      <span>Proses Pembayaran</span>
    </button>
  </div>
</div>
