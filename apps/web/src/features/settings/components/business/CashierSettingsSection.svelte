<script lang="ts">
  import { Coins, Percent, Bell, FileText } from "lucide-svelte";

  interface Props {
    currencySymbol: string;
    taxRate: number;
    lowStockThreshold: number;
    receiptFooter: string;
    profileSaving: boolean;
  }

  let {
    currencySymbol = $bindable(),
    taxRate = $bindable(),
    lowStockThreshold = $bindable(),
    receiptFooter = $bindable(),
    profileSaving,
  }: Props = $props();
</script>

<!-- Section 2: Standar Kasir & Keuangan -->
<div class="space-y-4 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
  <div class="border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
    <h2
      class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight"
    >
      Standar Kasir & Struk
    </h2>
    <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
      Pengaturan mata uang, PPN, notifikasi stok, dan footer pencetakan.
    </p>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div>
      <label
        class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
        for="biz-curr"
      >
        Simbol Mata Uang *
      </label>
      <div class="relative">
        <Coins
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
        />
        <input
          id="biz-curr"
          type="text"
          bind:value={currencySymbol}
          placeholder="Rp"
          required
          disabled={profileSaving}
          class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-slate-800/80 focus:border-accent rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-2xs"
        />
      </div>
    </div>

    <div>
      <label
        class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
        for="biz-tax"
      >
        Tarif PPN (%) *
      </label>
      <div class="relative">
        <Percent
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
        />
        <input
          id="biz-tax"
          type="number"
          bind:value={taxRate}
          placeholder="0"
          min="0"
          max="100"
          step="0.1"
          required
          disabled={profileSaving}
          class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-slate-800/80 focus:border-accent rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-2xs"
        />
      </div>
    </div>

    <div>
      <label
        class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
        for="biz-thresh"
      >
        Batas Stok Tipis *
      </label>
      <div class="relative">
        <Bell
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
        />
        <input
          id="biz-thresh"
          type="number"
          bind:value={lowStockThreshold}
          placeholder="10"
          min="0"
          required
          disabled={profileSaving}
          class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-slate-800/80 focus:border-accent rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-2xs"
        />
      </div>
    </div>
  </div>

  <div>
    <label
      class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
      for="biz-footer"
    >
      Catatan Struk Footer
    </label>
    <div class="relative">
      <FileText class="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
      <textarea
        id="biz-footer"
        bind:value={receiptFooter}
        rows="2"
        placeholder="Contoh: Barang yang sudah dibeli tidak dapat ditukar."
        disabled={profileSaving}
        class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-slate-800/80 focus:border-accent rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-2xs"
      ></textarea>
    </div>
  </div>
</div>
