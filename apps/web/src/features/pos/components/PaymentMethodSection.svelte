<script lang="ts">
  import { Banknote, CreditCard, Smartphone, Package, Check } from 'lucide-svelte';
  import { formatCurrency } from '../../../lib/utils/currency';
  import type { UISettings } from '../../../types';

  interface Props {
    paymentMethod: 'cash' | 'transfer' | 'qris' | 'other';
    amountPaid: number;
    effectiveFinalTotal: number;
    change: number;
    settings: UISettings | null;
    onMethodSelect: (method: 'cash' | 'transfer' | 'qris' | 'other') => void;
    onAmountPaidChange: (val: number) => void;
    onSetExactAmount: () => void;
    onAddCashPreset: (amount: number) => void;
  }

  let {
    paymentMethod,
    amountPaid,
    effectiveFinalTotal,
    change,
    settings,
    onMethodSelect,
    onAmountPaidChange,
    onSetExactAmount,
    onAddCashPreset,
  }: Props = $props();

  const paymentMethods = [
    { value: 'cash', label: 'Tunai', icon: Banknote },
    { value: 'transfer', label: 'Transfer', icon: CreditCard },
    { value: 'qris', label: 'QRIS', icon: Smartphone },
    { value: 'other', label: 'Lainnya', icon: Package },
  ] as const;
</script>

<div class="space-y-4 select-none">
  <!-- Payment Method Selection Grid -->
  <div>
    <span class="text-xs font-extrabold text-ink-muted uppercase tracking-wider block mb-2">
      Metode Pembayaran *
    </span>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {#each paymentMethods as method}
        {@const Icon = method.icon}
        <button
          type="button"
          onclick={() => onMethodSelect(method.value)}
          class="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer
            {paymentMethod === method.value
            ? 'bg-accent border-accent text-white shadow-md shadow-accent/25 scale-[1.02]'
            : 'bg-base border-border-theme text-ink hover:bg-accent-soft hover:border-accent/30'}"
        >
          <Icon class="w-4 h-4" />
          <span>{method.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Cash Amount Input & Presets Box -->
  {#if paymentMethod === 'cash'}
    <div class="p-4 bg-base border border-border-theme rounded-2xl flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <label class="text-xs font-bold text-h-text uppercase tracking-wider" for="amount-paid-field">
          Uang Diterima (Tunai)
        </label>
        <button
          type="button"
          onclick={onSetExactAmount}
          class="text-xs font-extrabold text-accent hover:underline cursor-pointer flex items-center gap-1"
        >
          <Check class="w-3.5 h-3.5" />
          <span>Uang Pas</span>
        </button>
      </div>

      <div class="relative">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-muted">
          {settings?.currencySymbol || 'Rp'}
        </span>
        <input
          id="amount-paid-field"
          type="number"
          value={amountPaid}
          oninput={(e) => onAmountPaidChange(e.currentTarget.valueAsNumber || 0)}
          min={effectiveFinalTotal}
          step="1000"
          class="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-theme focus:ring-accent/10 focus:border-accent rounded-xl text-sm font-mono font-bold text-h-text focus:outline-none focus:ring-4 transition-all"
          placeholder="0"
        />
      </div>

      <!-- Quick Preset Buttons -->
      <div class="flex items-center gap-2 pt-1">
        <button
          type="button"
          onclick={() => onAddCashPreset(50000)}
          class="px-2.5 py-1 text-[11px] font-bold bg-surface hover:bg-accent-soft border border-border-theme rounded-lg cursor-pointer transition-colors"
        >
          +50rb
        </button>
        <button
          type="button"
          onclick={() => onAddCashPreset(100000)}
          class="px-2.5 py-1 text-[11px] font-bold bg-surface hover:bg-accent-soft border border-border-theme rounded-lg cursor-pointer transition-colors"
        >
          +100rb
        </button>
        <button
          type="button"
          onclick={onSetExactAmount}
          class="px-2.5 py-1 text-[11px] font-bold bg-accent-soft text-accent border border-accent/20 rounded-lg cursor-pointer transition-colors ml-auto"
        >
          Pas ({formatCurrency(effectiveFinalTotal)})
        </button>
      </div>

      <!-- Change / Deficit Indicator -->
      {#if amountPaid >= effectiveFinalTotal}
        <div class="flex justify-between items-center text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 mt-0.5">
          <span class="font-bold">Kembalian</span>
          <span class="font-mono font-extrabold text-sm">{formatCurrency(change)}</span>
        </div>
      {:else if amountPaid > 0}
        <div class="flex justify-between items-center text-xs text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 mt-0.5 font-bold">
          <span>Kurang Pembayaran</span>
          <span class="font-mono">{formatCurrency(effectiveFinalTotal - amountPaid)}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>
