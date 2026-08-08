<script lang="ts">
  import { formatCurrency } from "../../../lib/utils/currency";
  import { formatDate } from "../../../lib/utils/date";
  import { appState } from "../../../core/state.svelte";
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
    ChevronLeft,
    ChevronRight,
    Calendar,
    Download,
    FileText,
    FileSpreadsheet
  } from "lucide-svelte";
  import Dropdown from "../../../components/ui/Dropdown.svelte";
  import CustomSelect from "../../../components/ui/CustomSelect.svelte";
  import type { UITransaction } from "../../../types";

  interface Props {
    transactions: UITransaction[];
    onview: (t: UITransaction) => void;
    selectedMonth?: string;
    onmonthchange?: (month: string) => void;
    ondownloadpdf?: () => void;
    ondownloadexcel?: () => void;
  }

  let {
    transactions,
    onview,
    selectedMonth = "all",
    onmonthchange,
    ondownloadpdf,
    ondownloadexcel
  }: Props = $props();

  let searchQuery = $state("");
  let filterMethod = $state("");
  let itemsPerPage = $state<number>(50);
  let currentPage = $state<number>(1);

  const isSuperAdmin = $derived(appState.user?.role === 'super_admin');

  const dropdownOptions = [
    { value: "", label: "Semua Metode Pembayaran" },
    { value: "cash", label: "Tunai", icon: Banknote },
    { value: "transfer", label: "Transfer", icon: CreditCard },
    { value: "qris", label: "QRIS", icon: QrCode },
    { value: "other", label: "Lainnya", icon: Package },
  ];

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const monthOptions = $derived.by(() => {
    const options = [{ value: "all", label: "Semua Bulan", icon: Calendar }];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const val = `${year}-${month}`;
      const label = `${monthNames[d.getMonth()]} ${year}`;
      options.push({ value: val, label, icon: Calendar });
    }
    return options;
  });

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

  const pageSize = $derived(itemsPerPage === 0 ? (filteredTransactions.length || 1) : itemsPerPage);
  const totalPages = $derived(itemsPerPage === 0 ? 1 : Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage)));

  const paginatedTransactions = $derived.by(() => {
    if (itemsPerPage === 0) return filteredTransactions;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  });

  $effect(() => {
    // Reset page to 1 when filters or search change
    searchQuery;
    filterMethod;
    selectedMonth;
    itemsPerPage;
    currentPage = 1;
  });

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
  <!-- Search & Method & Month Filter Bar -->
  <div
    class="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between w-full"
  >
    <!-- Left: Search Bar, Payment Method & Month Dropdowns -->
    <div
      class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1 min-w-0 flex-wrap"
    >
      <!-- Search Input -->
      <div class="relative flex-1 min-w-50 max-w-xs">
        <Search
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
        />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cari kode transaksi..."
          class="w-full pl-10 pr-9 py-2.5 bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 focus:border-accent rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
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
      <div class="min-w-52.5">
        <Dropdown
          options={dropdownOptions}
          bind:value={filterMethod}
          placeholder="Semua Metode Pembayaran"
        />
      </div>

      <!-- Custom Filter Dropdown for Months (CustomSelect UI) -->
      <div class="min-w-45">
        <CustomSelect
          options={monthOptions}
          value={selectedMonth}
          onchange={(val) => onmonthchange && onmonthchange(val)}
          placeholder="Pilih Bulan..."
        />
      </div>
    </div>

    <!-- Right: Unduh PDF & Excel Buttons -->
    <div class="flex items-center gap-2 shrink-0 self-start lg:self-auto">
      {#if ondownloadpdf}
        <button
          type="button"
          onclick={ondownloadpdf}
          class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
          title="Unduh Laporan Rekapan PDF"
        >
          <FileText class="w-4 h-4" />
          <span>Unduh PDF</span>
        </button>
      {/if}

      {#if ondownloadexcel}
        <button
          type="button"
          onclick={ondownloadexcel}
          class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
          title="Unduh Laporan Rekapan Excel (.csv)"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>Unduh Excel</span>
        </button>
      {/if}
    </div>
  </div>

  <!-- Search Results Counter -->
  {#if isSearchActive}
    <div class="text-[11px] font-semibold text-slate-400 -mt-1">
      Menampilkan <span class="font-bold text-accent"
        >{filteredTransactions.length}</span
      > hasil transaksi
    </div>
  {/if}

  <!-- Main Transaction Table Container -->
  <div
    class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs"
  >
    <div class="overflow-x-auto scrollbar-none">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr
            class="border-b border-slate-200/80 dark:border-slate-800/80 bg-base/80 dark:bg-surface/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none"
          >
            <th class="px-5 py-3.5">Kode Transaksi</th>
            <th class="px-5 py-3.5 hidden md:table-cell">Waktu & Tanggal</th>
            <th class="px-5 py-3.5 hidden sm:table-cell">Metode Pembayaran</th>
            <th class="px-5 py-3.5 text-right">Total Belanja</th>
            {#if isSuperAdmin}
              <th class="px-5 py-3.5 text-right hidden lg:table-cell">Profit</th>
            {/if}
            <th class="px-5 py-3.5 text-center hidden sm:table-cell">Status</th>
            <th class="px-5 py-3.5 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody
          class="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs font-medium"
        >
          {#each paginatedTransactions as trx, i (trx.id)}
            {@const IconComp = getMethodIcon(trx.paymentMethod)}
            <tr
              class="hover:bg-accent-soft/30 transition-colors group text-slate-800 dark:text-slate-200"
            >
              <!-- Kode Transaksi & Icon -->
              <td class="px-5 py-3.5 font-bold font-mono">
                <div class="flex items-center gap-2.5">
                  <div
                    class="p-1.5 rounded-lg bg-accent-soft text-accent shrink-0"
                  >
                    <Receipt class="w-4 h-4" />
                  </div>
                  <span class="truncate max-w-45 sm:max-w-none">
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
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-soft border border-accent/20 text-accent-soft-text rounded-lg font-bold text-[10px] uppercase"
                >
                  <IconComp
                    class="w-3 h-3 text-accent"
                  />
                  {trx.paymentMethod}
                </span>
              </td>

              <!-- Total Amount -->
              <td class="px-5 py-3.5 text-right font-mono">
                <span class="font-black text-accent">
                  {formatCurrency(trx.totalAmount)}
                </span>
              </td>

              <!-- Profit (Super Admin only) -->
              {#if isSuperAdmin}
                <td class="px-5 py-3.5 text-right hidden lg:table-cell font-mono">
                  <span class="font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency(trx.profit || 0)}
                  </span>
                </td>
              {/if}

              <!-- Status -->
              <td class="px-5 py-3.5 text-center hidden sm:table-cell">
                {#if trx.status === "completed"}
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-soft text-accent border border-accent/20"
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
                    class="p-1.5 text-slate-400 hover:text-accent hover:bg-accent-soft rounded-lg cursor-pointer transition-colors bg-transparent border-0"
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
                colspan={isSuperAdmin ? 7 : 6}
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

  <!-- Pagination Control Bar -->
  <div
    class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-base/80 dark:bg-surface/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs text-xs font-semibold text-slate-600 dark:text-slate-300"
  >
    <!-- Left: Rows per page selector & Total Items Counter -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5">
        <span class="text-slate-400 font-medium">Tampilkan:</span>
        <div class="w-28">
          <CustomSelect
            options={[
              { value: '50', label: '50 Item' },
              { value: '100', label: '100 Item' },
              { value: '0', label: 'Semua' }
            ]}
            value={String(itemsPerPage)}
            position="up"
            onchange={(val) => (itemsPerPage = Number(val))}
          />
        </div>
      </div>

      <span class="hidden sm:inline-block text-slate-400 font-medium">
        Menampilkan <strong class="text-accent">{filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> - <strong class="text-accent">{Math.min(currentPage * pageSize, filteredTransactions.length)}</strong> dari <strong class="text-slate-800 dark:text-white">{filteredTransactions.length}</strong> Transaksi
      </span>
    </div>

    <!-- Right: Previous / Next Navigation Buttons -->
    <div class="flex items-center gap-2 self-end sm:self-auto">
      <span class="text-[11px] text-slate-400 font-medium mr-1">
        Halaman <strong class="text-slate-800 dark:text-white">{currentPage}</strong> dari <strong class="text-slate-800 dark:text-white">{totalPages}</strong>
      </span>

      <button
        type="button"
        disabled={currentPage <= 1}
        onclick={() => (currentPage = Math.max(1, currentPage - 1))}
        class="inline-flex items-center gap-1 px-3 py-1.5 bg-base dark:bg-base border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-accent-soft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-xs font-bold text-slate-700 dark:text-slate-200"
      >
        <ChevronLeft class="w-4 h-4" />
        <span>Sebelumnya</span>
      </button>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
        class="inline-flex items-center gap-1 px-3 py-1.5 bg-base dark:bg-base border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-accent-soft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-xs font-bold text-slate-700 dark:text-slate-200"
      >
        <span>Selanjutnya</span>
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
