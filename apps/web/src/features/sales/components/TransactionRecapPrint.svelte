<script lang="ts">
  import { onMount } from 'svelte';
  import { formatCurrency } from '../../../lib/utils/currency';
  import { formatDate } from '../../../lib/utils/date';
  import { Download, Printer, X } from 'lucide-svelte';
  import type { UITransaction } from '../../../types';

  interface Props {
    transactions: UITransaction[];
    brandName?: string;
    brandLogo?: string;
    brandAddress?: string;
    brandPhone?: string;
    userRole?: string;
    printedBy?: string;
    onclose: () => void;
  }

  let {
    transactions = [],
    brandName = 'Brand Utama',
    brandLogo = '',
    brandAddress = '',
    brandPhone = '',
    userRole = 'admin',
    printedBy = 'Staff Kasir',
    onclose
  }: Props = $props();

  const isSuperAdmin = $derived(userRole === 'super_admin');

  // Filter completed transactions
  const completedTx = $derived(transactions.filter((t) => t.status === 'completed'));
  const totalRevenue = $derived(completedTx.reduce((acc, t) => acc + t.totalAmount, 0));
  const totalProfit = $derived(completedTx.reduce((acc, t) => acc + (t.profit || 0), 0));

  const printDate = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  function triggerPrint() {
    window.print();
  }

  function downloadDirectReport() {
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Rekap_Penjualan_${brandName.replace(/\s+/g, '_')}_${dateStr}.html`;

    const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rekap Penjualan - ${brandName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; background: #ffffff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #047857; padding-bottom: 12px; margin-bottom: 20px; }
    .brand-title { font-size: 20px; font-weight: 900; color: #047857; text-transform: uppercase; }
    .brand-sub { font-size: 11px; color: #64748b; }
    .doc-title { font-size: 13px; font-weight: 900; color: #065f46; text-transform: uppercase; text-align: right; }
    .doc-sub { font-size: 11px; color: #64748b; text-align: right; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
    th { background: #047857; color: #ffffff; padding: 10px; text-align: left; text-transform: uppercase; font-size: 11px; font-weight: 800; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .total-row { font-weight: 900; background: #e2e8f0 !important; font-size: 13px; }
    .status-badge { padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; bg-color: #d1fae5; color: #065f46; display: inline-block; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${brandLogo ? `<img src="${brandLogo}" style="height: 48px; max-width: 180px; object-fit: contain; margin-bottom: 4px;" />` : ''}
      <div class="brand-title">${brandName}</div>
      ${brandAddress ? `<div class="brand-sub">${brandAddress}</div>` : ''}
    </div>
    <div>
      <div class="doc-title">LAPORAN REKAPITULASI PENJUALAN</div>
      <div class="doc-sub">Tanggal Cetak: ${printDate}</div>
      <div class="doc-sub">Dicetak Oleh: ${printedBy}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Kode Transaksi</th>
        <th>Waktu & Tanggal</th>
        <th>Metode Pembayaran</th>
        <th style="text-align: right;">Total Belanja</th>
        ${isSuperAdmin ? `<th style="text-align: right;">Profit</th>` : ''}
        <th style="text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${transactions.map((t) => `
        <tr>
          <td style="font-family: monospace; font-weight: bold;">${t.id}</td>
          <td>${formatDate(t.createdAt)}</td>
          <td style="text-transform: uppercase;">${t.paymentMethod}</td>
          <td style="text-align: right; font-family: monospace; font-weight: bold; color: #047857;">${formatCurrency(t.totalAmount)}</td>
          ${isSuperAdmin ? `<td style="text-align: right; font-family: monospace; font-weight: bold;">${formatCurrency(t.profit || 0)}</td>` : ''}
          <td style="text-align: center;"><span class="status-badge">${t.status === 'completed' ? 'Selesai' : 'Batal'}</span></td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3" style="text-align: right;">TOTAL REKAP PENJUALAN (${completedTx.length} NOTA):</td>
        <td style="text-align: right; font-family: monospace; color: #047857;">${formatCurrency(totalRevenue)}</td>
        ${isSuperAdmin ? `<td style="text-align: right; font-family: monospace;">${formatCurrency(totalProfit)}</td>` : ''}
        <td></td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  onMount(() => {
    const handleAfterPrint = () => {
      onclose();
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  });
</script>

<!-- Clean Printable Document Overlay -->
<div
  id="recap-print-root"
  class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs p-4 sm:p-6 flex flex-col items-center select-none print:p-0 print:bg-white print:static print:overflow-visible"
>
  <!-- Action Bar (Hidden when printing) -->
  <div
    class="w-full max-w-4xl flex items-center justify-between bg-surface border border-slate-700/50 rounded-2xl px-5 py-3 mb-4 shadow-xl text-white print:hidden shrink-0"
  >
    <div class="flex items-center gap-2">
      <Printer class="w-5 h-5 text-emerald-400" />
      <span class="font-bold text-sm">Dokumen Laporan Rekap Penjualan</span>
    </div>

    <div class="flex items-center gap-2.5">
      <button
        type="button"
        onclick={downloadDirectReport}
        class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
      >
        <Download class="w-4 h-4" />
        <span>Langsung Unduh File (Instant)</span>
      </button>

      <button
        type="button"
        onclick={triggerPrint}
        class="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
      >
        <Printer class="w-4 h-4" />
        <span>Cetak / Save PDF Browser</span>
      </button>

      <button
        type="button"
        onclick={onclose}
        class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        aria-label="Tutup Modal"
      >
        <X class="w-5 h-5" />
      </button>
    </div>
  </div>

  <!-- Printable Container (ONLY THIS IS PRINTED) -->
  <div
    id="recap-printable-document"
    class="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 print:p-0 print:shadow-none print:w-full print:max-w-none print:rounded-none font-sans text-xs flex flex-col justify-between min-h-[85vh] print:min-h-0 select-text"
  >
    <div>
      <!-- Header: Logo & Title Only -->
      <div class="flex items-center justify-between border-b-2 border-emerald-700 pb-4 mb-5">
        <div class="flex items-center gap-3.5">
          {#if brandLogo}
            <img src={brandLogo} alt={brandName} class="h-12 max-w-[160px] object-contain" />
          {:else}
            <div class="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-black text-base tracking-tight">
              {brandName}
            </div>
          {/if}

          <div class="text-left">
            <h1 class="text-lg font-black text-slate-900 tracking-tight">{brandName}</h1>
            {#if brandAddress}
              <p class="text-[10px] text-slate-500 font-medium">{brandAddress}</p>
            {/if}
          </div>
        </div>

        <div class="text-right">
          <h2 class="text-xs font-black text-emerald-800 uppercase tracking-wider">
            LAPORAN REKAPITULASI PENJUALAN
          </h2>
          <p class="text-[10px] text-slate-500 font-medium">Tanggal Cetak: {printDate}</p>
          <p class="text-[10px] text-slate-500 font-medium">Dicetak Oleh: {printedBy}</p>
        </div>
      </div>

      <!-- Pure Sales Table (Matches User Screenshot Exactly) -->
      <div class="w-full">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-emerald-800 text-white font-black uppercase text-[10px] tracking-wider">
              <th class="p-2.5 rounded-tl-lg">Kode Transaksi</th>
              <th class="p-2.5">Waktu & Tanggal</th>
              <th class="p-2.5">Metode Pembayaran</th>
              <th class="p-2.5 text-right">Total Belanja</th>
              {#if isSuperAdmin}
                <th class="p-2.5 text-right">Profit</th>
              {/if}
              <th class="p-2.5 text-center rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-xs">
            {#each transactions as t, i}
              <tr class={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                <!-- Kode Transaksi -->
                <td class="p-2.5 font-bold font-mono text-slate-900">
                  {t.id}
                </td>

                <!-- Waktu & Tanggal -->
                <td class="p-2.5 text-slate-700">
                  {formatDate(t.createdAt)}
                </td>

                <!-- Metode Pembayaran -->
                <td class="p-2.5">
                  <span class="inline-block px-2 py-0.5 rounded font-extrabold text-[10px] uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {t.paymentMethod}
                  </span>
                </td>

                <!-- Total Belanja -->
                <td class="p-2.5 text-right font-bold font-mono text-emerald-700">
                  {formatCurrency(t.totalAmount)}
                </td>

                <!-- Profit (SUPER ADMIN ONLY - STRICTLY HIDDEN FOR ADMIN BIASA) -->
                {#if isSuperAdmin}
                  <td class="p-2.5 text-right font-bold font-mono text-slate-800">
                    {formatCurrency(t.profit || 0)}
                  </td>
                {/if}

                <!-- Status -->
                <td class="p-2.5 text-center">
                  {#if t.status === 'completed'}
                    <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Selesai
                    </span>
                  {:else}
                    <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      Batal
                    </span>
                  {/if}
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan={isSuperAdmin ? 6 : 5} class="p-8 text-center text-slate-400 font-semibold">
                  Tidak ada transaksi penjualan.
                </td>
              </tr>
            {/each}
          </tbody>

          <!-- Table Footer Summary -->
          <tfoot>
            <tr class="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
              <td colspan="3" class="p-3 text-right uppercase tracking-wider text-xs">
                TOTAL PENJUALAN REKAP ({completedTx.length} NOTA):
              </td>
              <td class="p-3 text-right font-mono text-sm text-emerald-800">
                {formatCurrency(totalRevenue)}
              </td>
              {#if isSuperAdmin}
                <td class="p-3 text-right font-mono text-sm text-slate-900">
                  {formatCurrency(totalProfit)}
                </td>
              {/if}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</div>

<style>
  @media print {
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    :global(body > *:not(#recap-print-root)) {
      display: none !important;
    }
    :global(body) {
      background: white !important;
      color: black !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    #recap-print-root {
      display: block !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  }
</style>
