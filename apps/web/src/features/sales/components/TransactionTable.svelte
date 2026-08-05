<script lang="ts">
  import { formatCurrency } from "../../../lib/utils/currency";
  import { formatDate } from "../../../lib/utils/date";
  import {
    Search,
    Eye,
    Receipt,
    Banknote,
    CreditCard,
    QrCode,
    Smartphone,
    Package,
    X,
    ExternalLink,
    ChevronDown,
  } from "lucide-svelte";
  import Dropdown from "../../../components/ui/Dropdown.svelte";
  import type { UITransaction } from "../../../types";

  interface Props {
    transactions: UITransaction[];
    onview: (t: UITransaction) => void;
  }

  let { transactions, onview }: Props = $props();

  let searchQuery = $state("");
  let filterMethod = $state("");

  const dropdownOptions = [
    { value: "", label: "Semua Metode Pembayaran" },
    { value: "cash", label: "Tunai", icon: Banknote },
    { value: "transfer", label: "Transfer", icon: CreditCard },
    { value: "qris", label: "QRIS", icon: QrCode },
    { value: "other", label: "Lainnya", icon: Package },
  ];

  const filteredTransactions = $derived(
    transactions.filter((t) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.transactionCode.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q));
      const matchesMethod = !filterMethod || t.paymentMethod === filterMethod;
      return matchesSearch && matchesMethod;
    }),
  );

  const isSearchActive = $derived(searchQuery.trim().length > 0);

  function clearSearch() {
    searchQuery = "";
  }

  function getMethodIcon(method: string) {
    switch (method.toLowerCase()) {
      case "cash":
      case "tunai":
        return Banknote;
      case "transfer":
        return CreditCard;
      case "qris":
        return Smartphone;
      default:
        return Package;
    }
  }

  function openInvoice(id: string) {
    window.open(`#/invoice/${id}`, "_blank");
  }
</script>

<div class="flex flex-col gap-4 text-ink">
  <!-- Search & Method Filter Pills Bar -->
  <div
    class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between w-full"
  >
    <!-- Left: Search Bar & Method Pills -->
    <div
      class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1 min-w-0"
    >
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
        />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cari kode transaksi atau catatan..."
          class="w-full pl-10 pr-9 py-2.5 bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
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

      <!-- Custom Filter Dropdown for Payment Methods -->
      <Dropdown
        options={dropdownOptions}
        bind:value={filterMethod}
        placeholder="Semua Metode Pembayaran"
      />
    </div>
  </div>

  <!-- Search Results Counter -->
  {#if isSearchActive}
    <div class="text-[11px] font-semibold text-slate-400 -mt-1">
      Menampilkan <span class="font-bold text-emerald-600 dark:text-emerald-400"
        >{filteredTransactions.length}</span
      > hasil transaksi
    </div>
  {/if}

  <!-- Main Transaction Table Container -->
  <div
    class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl overflow-hidden shadow-2xs"
  >
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr
            class="border-b border-slate-200/60 dark:border-emerald-950/60 bg-base/50 dark:bg-surface/30"
          >
            <th
              class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
            >
              Kode Transaksi
            </th>
            <th
              class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider hidden md:table-cell"
            >
              Waktu & Tanggal
            </th>
            <th
              class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider hidden sm:table-cell"
            >
              Metode Pembayaran
            </th>
            <th
              class="text-right px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
            >
              Total Belanja
            </th>
            <th
              class="text-right px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider hidden lg:table-cell"
            >
              Profit
            </th>
            <th
              class="text-center px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider hidden sm:table-cell"
            >
              Status
            </th>
            <th
              class="px-5 py-3.5 text-center font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200/40 dark:divide-emerald-950/40">
          {#each filteredTransactions as trx (trx.id)}
            {@const IconComp = getMethodIcon(trx.paymentMethod)}
            <tr
              class="hover:bg-emerald-500/5 transition-colors {trx.status !==
              'completed'
                ? 'opacity-50'
                : ''}"
            >
              <!-- Kode Transaksi -->
              <td class="px-5 py-3.5 font-mono">
                <div class="flex items-center gap-2">
                  <Receipt
                    class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                  />
                  <span class="font-black text-slate-800 dark:text-slate-100">
                    {trx.transactionCode}
                  </span>
                </div>
              </td>

              <!-- Date & Time -->
              <td
                class="px-5 py-3.5 hidden md:table-cell text-slate-500 dark:text-slate-400 font-medium"
              >
                {formatDate(trx.createdAt)}
              </td>

              <!-- Payment Method -->
              <td class="px-5 py-3.5 hidden sm:table-cell">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg font-bold text-[10px] uppercase"
                >
                  <IconComp
                    class="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                  />
                  {trx.paymentMethod}
                </span>
              </td>

              <!-- Total Amount -->
              <td class="px-5 py-3.5 text-right font-mono">
                <span class="font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(trx.totalAmount)}
                </span>
              </td>

              <!-- Profit -->
              <td class="px-5 py-3.5 text-right hidden lg:table-cell font-mono">
                <span class="font-bold text-slate-700 dark:text-slate-300">
                  {formatCurrency(trx.profit || 0)}
                </span>
              </td>

              <!-- Status -->
              <td class="px-5 py-3.5 text-center hidden sm:table-cell">
                {#if trx.status === "completed"}
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  >
                    Selesai
                  </span>
                {:else}
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  >
                    Dibatalkan
                  </span>
                {/if}
              </td>

              <!-- Action Toolbar -->
              <td class="px-5 py-3.5 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onclick={() => onview(trx)}
                    class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg cursor-pointer transition-colors bg-transparent border-0"
                    title="Lihat Rincian Transaksi"
                  >
                    <Eye class="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onclick={() => openInvoice(trx.id)}
                    class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg cursor-pointer transition-colors bg-transparent border-0"
                    title="Buka / Cetak Struk Invoice"
                  >
                    <ExternalLink class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td
                colspan="7"
                class="py-16 text-center text-slate-400 font-semibold"
              >
                {isSearchActive
                  ? `Tidak ada transaksi cocok dengan "${searchQuery}"`
                  : "Belum ada transaksi penjualan tercatat"}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
