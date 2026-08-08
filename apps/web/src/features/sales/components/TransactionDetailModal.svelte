<script lang="ts">
  import { formatCurrency } from '../../../lib/utils/currency';
  import { formatDate } from '../../../lib/utils/date';
  import { appState } from '../../../core/state.svelte';
  import { X, Printer, Ban, Receipt, CheckCircle2, AlertCircle } from 'lucide-svelte';
  import type { UITransaction, UISettings } from '../../../types';

  interface Props {
    transaction: UITransaction | null;
    settings: UISettings | null;
    onclose: () => void;
    onvoid?: (id: string) => void;
  }

  let { transaction, settings, onclose, onvoid }: Props = $props();

  const isSuperAdmin = $derived(appState.user?.role === 'super_admin');

  function openInvoice() {
    if (transaction?.id) {
      window.open(`#/invoice/${transaction.id}`, '_blank');
    }
  }

  function openCombinedPrint() {
    if (transaction?.id) {
      window.open(`#/print-all/${transaction.id}`, '_blank');
    }
  }
</script>

{#if transaction}
  <!-- Backdrop Overlay -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    role="dialog"
    aria-modal="true"
  >
    <!-- Modal Card Container -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="relative w-full max-w-md bg-base dark:bg-surface border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-ink select-none"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/60 dark:border-emerald-950/60 bg-base/50 dark:bg-surface/50"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <Receipt class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Rincian Transaksi
            </h2>
            <p class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {transaction.transactionCode}
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

      <!-- Modal Body Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-none">
        <!-- Status Banner -->
        <div class="flex items-center justify-between p-3 rounded-xl border text-xs font-bold
					{transaction.status === 'completed'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'}"
        >
          <div class="flex items-center gap-2">
            {#if transaction.status === 'completed'}
              <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Transaksi Selesai</span>
            {:else}
              <AlertCircle class="w-4 h-4 text-rose-500" />
              <span>Transaksi Dibatalkan (Void)</span>
            {/if}
          </div>
          <span class="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {formatDate(transaction.createdAt)}
          </span>
        </div>

        <!-- Items Purchased List -->
        <div class="space-y-2">
          <h3 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
            Daftar Produk Belanja ({transaction.items.length} Item)
          </h3>

          <div class="divide-y divide-slate-200/40 dark:divide-emerald-950/40 bg-white/50 dark:bg-base/40 rounded-2xl border border-slate-200/60 dark:border-emerald-950/60 p-3">
            {#each transaction.items as item}
              <div class="flex justify-between items-center py-2 text-xs">
                <div class="flex flex-col min-w-0 pr-2">
                  <span class="font-bold text-slate-800 dark:text-white truncate">
                    {item.productName}
                  </span>
                  <span class="text-[10px] font-mono text-slate-400">
                    {item.sku || 'No SKU'} &bull; {formatCurrency(item.sellingPrice)} &times; {item.qty}
                  </span>
                </div>
                <span class="font-mono font-black text-slate-900 dark:text-white shrink-0">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Financial Summary Breakdown -->
        <div class="space-y-2">
          <h3 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-500/70">
            Rincian Pembayaran
          </h3>

          <div class="bg-white/50 dark:bg-base/40 rounded-2xl border border-slate-200/60 dark:border-emerald-950/60 p-3.5 space-y-2.5 text-xs">
            <div class="flex justify-between items-center">
              <span class="font-medium text-slate-500 dark:text-slate-400">Total Belanja</span>
              <span class="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                {formatCurrency(transaction.totalAmount)}
              </span>
            </div>

            {#if isSuperAdmin}
              <div class="flex justify-between items-center">
                <span class="font-medium text-slate-500 dark:text-slate-400">Estimasi HPP (Modal)</span>
                <span class="font-mono font-bold text-slate-600 dark:text-slate-300">
                  {formatCurrency(transaction.totalCost || 0)}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="font-medium text-slate-500 dark:text-slate-400">Estimasi Profit / Laba</span>
                <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(transaction.profit || 0)}
                </span>
              </div>
            {/if}

            <div class="border-t border-dashed border-slate-200 dark:border-slate-800 my-1"></div>

            <div class="flex justify-between items-center">
              <span class="font-medium text-slate-500 dark:text-slate-400">Metode Bayar</span>
              <span class="font-bold text-slate-800 dark:text-white uppercase">
                {transaction.paymentMethod}
              </span>
            </div>

            {#if transaction.paymentMethod === 'cash'}
              <div class="flex justify-between items-center">
                <span class="font-medium text-slate-500 dark:text-slate-400">Uang Diterima</span>
                <span class="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {formatCurrency(transaction.amountPaid)}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-medium text-slate-500 dark:text-slate-400">Kembalian</span>
                <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(transaction.change)}
                </span>
              </div>
            {/if}

            {#if transaction.notes}
              <div class="flex justify-between items-start pt-1">
                <span class="font-medium text-slate-500 dark:text-slate-400">Catatan</span>
                <span class="text-right font-medium text-slate-700 dark:text-slate-200 max-w-[60%]">
                  {transaction.notes}
                </span>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Modal Footer Actions -->
      <div
        class="px-6 py-4 border-t border-slate-200/60 dark:border-emerald-950/60 bg-base/50 dark:bg-surface/50 flex flex-wrap items-center justify-between gap-2"
      >
        {#if transaction.status === 'completed' && onvoid}
          <button
            type="button"
            onclick={() => onvoid?.(transaction!.id)}
            class="px-3 py-2 rounded-xl border border-rose-200/80 dark:border-rose-900/60 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Ban class="w-3.5 h-3.5" />
            <span>Batalkan</span>
          </button>
        {:else}
          <div></div>
        {/if}

        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick={openInvoice}
            class="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-1"
          >
            <Printer class="w-3.5 h-3.5 text-slate-500" />
            <span>Invoice Saja</span>
          </button>
          <button
            type="button"
            onclick={openCombinedPrint}
            class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs hover:shadow"
          >
            <Printer class="w-4 h-4" />
            <span>Cetak Keduanya</span>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
