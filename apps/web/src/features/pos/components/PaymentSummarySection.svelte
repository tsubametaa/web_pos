<script lang="ts">
  import { cart } from '../logic/cart.svelte';
  import { formatCurrency } from '../../../lib/utils/currency';
  import { Tag, Pencil, X, CreditCard } from 'lucide-svelte';

  interface Props {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    totalSavings: number;
    manualDiscountInput: number | '';
    finalPriceInput: number | '';
    manualDiscountAmount: number;
    effectiveFinalTotal: number;
    showNegoEditor: boolean;
    canCheckout: boolean;
    isLoading: boolean;
    onToggleNegoEditor: () => void;
    onDiscountInput: (val: number | '') => void;
    onFinalPriceInput: (val: number | '') => void;
    onResetNego: () => void;
    onCheckout: () => void;
  }

  let {
    subtotal,
    taxRate,
    taxAmount,
    totalAmount,
    totalSavings,
    manualDiscountInput,
    finalPriceInput,
    manualDiscountAmount,
    effectiveFinalTotal,
    showNegoEditor,
    canCheckout,
    isLoading,
    onToggleNegoEditor,
    onDiscountInput,
    onFinalPriceInput,
    onResetNego,
    onCheckout,
  }: Props = $props();
</script>

<div class="md:col-span-6 flex flex-col justify-between gap-4 border-t md:border-t-0 md:border-l border-border-theme md:pl-6 pt-4 md:pt-0 select-none">
  <!-- Total Order Summary Card -->
  <div class="bg-accent-soft/40 border border-accent/25 rounded-2xl p-5 flex flex-col gap-3 shadow-2xs">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-extrabold text-h-text uppercase tracking-wider">
        Ringkasan Harga Transaksi
      </h3>
      {#if !showNegoEditor && manualDiscountAmount === 0}
        <button
          type="button"
          onclick={onToggleNegoEditor}
          class="text-[11px] font-extrabold text-accent hover:underline cursor-pointer flex items-center gap-1"
        >
          <Pencil class="w-3 h-3" />
          <span>+ Diskon Nego</span>
        </button>
      {/if}
    </div>

    <div class="flex justify-between text-xs text-ink-muted">
      <span>Subtotal ({cart.totalItems} item)</span>
      <span class="font-mono font-bold text-ink">{formatCurrency(subtotal)}</span>
    </div>

    {#if totalSavings > 0}
      <div class="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
        <span class="flex items-center gap-1">
          <Tag class="w-3.5 h-3.5" />
          Diskon Member
        </span>
        <span class="font-mono">-{formatCurrency(totalSavings)}</span>
      </div>
    {/if}

    {#if taxRate > 0}
      <div class="flex justify-between text-xs text-ink-muted">
        <span>Pajak PPN ({taxRate}%)</span>
        <span class="font-mono font-bold text-ink">{formatCurrency(taxAmount)}</span>
      </div>
    {/if}

    <!-- Applied Nego Discount Line Item -->
    {#if manualDiscountAmount > 0}
      <div class="flex justify-between items-center text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 font-bold">
        <span class="flex items-center gap-1.5">
          <Tag class="w-3.5 h-3.5 text-amber-600" />
          <span>Potongan Nego / Manual</span>
        </span>
        <div class="flex items-center gap-2">
          <span class="font-mono">-{formatCurrency(manualDiscountAmount)}</span>
          <button
            type="button"
            onclick={onResetNego}
            class="p-0.5 rounded text-amber-600 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer transition-colors"
            title="Hapus Diskon Nego"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    {/if}

    <!-- Nego Editor Form Box -->
    {#if showNegoEditor}
      <div class="p-3 bg-surface border border-accent/30 rounded-xl space-y-2.5 mt-1 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-extrabold text-accent uppercase tracking-wider flex items-center gap-1">
            <Pencil class="w-3 h-3" />
            Atur Diskon Nego / Harga Final
          </span>
          <button
            type="button"
            onclick={onToggleNegoEditor}
            class="text-ink-muted hover:text-h-text cursor-pointer p-0.5"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-[10px] font-bold text-ink-muted block mb-1" for="discount-val-input">
              Potongan (Rp)
            </label>
            <input
              id="discount-val-input"
              type="number"
              value={manualDiscountInput}
              oninput={(e) => onDiscountInput(e.currentTarget.valueAsNumber || '')}
              placeholder="e.g. 10000"
              min="0"
              step="500"
              class="w-full px-2.5 py-1.5 bg-base border border-border-theme focus:border-accent rounded-lg text-xs font-mono font-bold text-h-text focus:outline-none"
            />
          </div>
          <div>
            <label class="text-[10px] font-bold text-ink-muted block mb-1" for="final-price-val-input">
              Harga Akhir (Rp)
            </label>
            <input
              id="final-price-val-input"
              type="number"
              value={finalPriceInput}
              oninput={(e) => onFinalPriceInput(e.currentTarget.valueAsNumber || '')}
              placeholder={String(totalAmount)}
              min="0"
              step="500"
              class="w-full px-2.5 py-1.5 bg-base border border-accent rounded-lg text-xs font-mono font-black text-accent focus:outline-none"
            />
          </div>
        </div>

        <div class="flex justify-end gap-1.5 pt-1">
          <button
            type="button"
            onclick={onResetNego}
            class="px-2.5 py-1 text-[10px] font-bold text-ink-muted hover:text-h-text rounded-md border border-border-theme cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onclick={onToggleNegoEditor}
            class="px-3 py-1 text-[10px] font-bold text-white bg-accent hover:bg-accent-hover rounded-md cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    {/if}

    <!-- Total Bayar Prominent Banner -->
    <div class="flex justify-between items-center border-t border-accent/20 pt-3 mt-1">
      <span class="text-xs font-black text-rose-950 dark:text-rose-100 uppercase tracking-wider">Total Bayar</span>
      <div class="text-right">
        {#if manualDiscountAmount > 0}
          <span class="text-[10px] font-mono text-ink-muted line-through block">
            {formatCurrency(totalAmount)}
          </span>
        {/if}
        <span class="font-mono text-2xl font-black text-rose-950 dark:text-rose-100">
          {formatCurrency(effectiveFinalTotal)}
        </span>
      </div>
    </div>
  </div>

  <!-- Bottom Action CTA Button -->
  <div class="pt-2">
    <button
      type="button"
      onclick={onCheckout}
      disabled={!canCheckout || isLoading}
      class="w-full inline-flex items-center justify-center gap-2 px-5 py-4 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-black uppercase tracking-wider rounded-xl shadow-md shadow-accent/20 active:scale-[0.98] transition-all duration-150 cursor-pointer"
    >
      {#if isLoading}
        <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>Memproses Transaksi...</span>
      {:else}
        <CreditCard class="w-5 h-5" />
        <span>Konfirmasi Pembayaran ({formatCurrency(effectiveFinalTotal)})</span>
      {/if}
    </button>
  </div>
</div>
