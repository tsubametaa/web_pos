<script lang="ts">
  import { Printer, Receipt, Truck } from "lucide-svelte";

  interface Props {
    businessName: string;
    logoUrl: string;
    businessPhone: string;
    businessAddress: string;
    currencySymbol: string;
    taxRate: number;
    receiptFooter: string;
  }

  let {
    businessName,
    logoUrl,
    businessPhone,
    businessAddress,
    currencySymbol,
    taxRate,
    receiptFooter,
  }: Props = $props();

  let previewTab = $state<"invoice" | "suratJalan">("invoice");

  const mockSubtotal = 45000;
  const mockTax = $derived((mockSubtotal * (taxRate || 0)) / 100);
  const mockTotal = $derived(mockSubtotal + mockTax);
</script>

<!-- Live Continuous Form Document Preview Card -->
<div class="xl:col-span-2 xl:sticky xl:top-6">
  <div
    class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs"
  >
    <!-- Card Header & Document Selector -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5 gap-2"
    >
      <div class="flex items-center gap-2">
        <Printer class="w-4 h-4 text-accent" />
        <span
          class="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider"
        >
          Pratinjau Dokumen Cetak
        </span>
      </div>
      <span
        class="text-[10px] bg-accent-soft text-accent-soft-text font-bold px-2.5 py-0.5 rounded-full border border-accent/20 shrink-0"
      >
        Continuous 9.5" x 5.5"
      </span>
    </div>

    <!-- Document Type Switcher Buttons -->
    <div class="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-base rounded-xl">
      <button
        type="button"
        onclick={() => (previewTab = "invoice")}
        class="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-0
          {previewTab === 'invoice'
          ? 'bg-accent text-white shadow-2xs'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}"
      >
        <Receipt class="w-3.5 h-3.5" />
        <span>Invoice (Faktur)</span>
      </button>

      <button
        type="button"
        onclick={() => (previewTab = "suratJalan")}
        class="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-0
          {previewTab === 'suratJalan'
          ? 'bg-accent text-white shadow-2xs'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}"
      >
        <Truck class="w-3.5 h-3.5" />
        <span>Surat Jalan (DO)</span>
      </button>
    </div>

    <!-- Document Live Rendering Box -->
    <div
      class="bg-white text-slate-900 border border-slate-300 rounded-xl p-4 shadow-sm font-sans text-[10px] leading-tight flex flex-col justify-between w-full mx-auto select-none overflow-hidden min-h-90"
    >
      <div>
        <!-- Document Header -->
        <div class="border-b-2 border-slate-900 pb-2 mb-2 flex justify-between items-start">
          <div class="flex items-start gap-2.5 max-w-[65%]">
            {#if logoUrl}
              <img
                src={logoUrl}
                alt="Logo Brand"
                class="h-9 w-auto max-w-25 object-contain shrink-0"
              />
            {:else}
              <div
                class="h-8 w-8 rounded bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 uppercase"
              >
                {(businessName || "B")[0]}
              </div>
            {/if}
            <div class="space-y-0.5">
              <h1 class="text-xs font-black text-slate-900 uppercase truncate">
                {businessName || "NAMA TOKO ANDA"}
              </h1>
              {#if businessAddress}
                <p class="text-[8px] text-slate-600 leading-tight truncate max-w-42.5">
                  {businessAddress}
                </p>
              {/if}
              {#if businessPhone}
                <p class="text-[8px] text-slate-600">
                  Telp: {businessPhone}
                </p>
              {/if}
            </div>
          </div>

          <div class="text-right">
            <div
              class="inline-block px-2 py-0.5 bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider rounded-xs mb-0.5"
            >
              {previewTab === "invoice" ? "INVOICE" : "SURAT JALAN"}
            </div>
            <p class="text-[9px] font-black font-mono text-slate-900">
              {previewTab === "invoice" ? "TRX-20260805-001" : "DO/20260805-001"}
            </p>
            <p class="text-[8px] text-slate-500 font-medium">Tgl: 05/08/2026</p>
          </div>
        </div>

        <!-- Recipient Mock Card -->
        <div
          class="grid grid-cols-12 gap-2 text-[9px] mb-2 bg-slate-50 border border-slate-200 p-2 rounded-xs"
        >
          <div class="col-span-7 space-y-0.5">
            <span
              class="text-[8px] font-bold text-slate-500 uppercase block border-b border-slate-200 pb-0.5"
            >
              Kepada Yth. (Penerima):
            </span>
            <div class="flex justify-between text-[8.5px]">
              <span class="text-slate-600">Nama:</span>
              <span class="font-bold text-slate-900 truncate">Pelanggan Setia</span>
            </div>
            <div class="flex justify-between text-[8.5px]">
              <span class="text-slate-600">Telepon:</span>
              <span class="font-mono text-slate-900">08123456789</span>
            </div>
          </div>
          <div class="col-span-5 space-y-0.5 pl-2 border-l border-slate-200">
            <span
              class="text-[8px] font-bold text-slate-500 uppercase block border-b border-slate-200 pb-0.5"
            >
              Informasi:
            </span>
            {#if previewTab === "invoice"}
              <div class="flex justify-between text-[8.5px]">
                <span class="text-slate-600">Metode:</span>
                <span class="font-bold text-slate-900 uppercase">CASH</span>
              </div>
              <div class="flex justify-between text-[8.5px]">
                <span class="text-slate-600">Status:</span>
                <span class="font-bold text-red-700 uppercase">LUNAS</span>
              </div>
            {:else}
              <div class="flex justify-between text-[8.5px]">
                <span class="text-slate-600">Ekspedisi:</span>
                <span class="font-bold text-slate-900">Internal</span>
              </div>
              <div class="flex justify-between text-[8.5px]">
                <span class="text-slate-600">Status:</span>
                <span class="font-bold text-slate-900">KIRIM</span>
              </div>
            {/if}
          </div>
        </div>

        <!-- Items Table -->
        <table class="w-full border-collapse text-[8.5px] mb-2 border border-slate-900 text-left">
          <thead>
            <tr class="border-b border-slate-900 bg-slate-100 font-bold">
              <th class="border-r border-slate-900 p-1 w-5 text-center">No</th>
              <th class="border-r border-slate-900 p-1">Nama Produk</th>
              <th class="border-r border-slate-900 p-1 w-14">SKU</th>
              <th class="border-r border-slate-900 p-1 w-8 text-center">Qty</th>
              {#if previewTab === "invoice"}
                <th class="border-r border-slate-900 p-1 text-right w-16">Harga</th>
                <th class="p-1 text-right w-18">Subtotal</th>
              {:else}
                <th class="p-1 text-center w-12">Unit</th>
              {/if}
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-200">
              <td class="border-r border-slate-900 p-1 text-center font-medium">1</td>
              <td class="border-r border-slate-900 p-1 font-bold text-slate-900">Kopi Susu Aren (Large)</td>
              <td class="border-r border-slate-900 p-1 font-mono text-[8px]">SKU-KPA</td>
              <td class="border-r border-slate-900 p-1 text-center font-black">1</td>
              {#if previewTab === "invoice"}
                <td class="border-r border-slate-900 p-1 text-right font-mono">45.000</td>
                <td class="p-1 text-right font-mono font-bold">45.000</td>
              {:else}
                <td class="p-1 text-center text-[8px]">Piece</td>
              {/if}
            </tr>
          </tbody>
        </table>

        <!-- Totals Summary (Invoice Mode Only) -->
        {#if previewTab === "invoice"}
          <div class="flex justify-end text-[8.5px] mb-2">
            <div class="w-44 border border-slate-900 p-1.5 bg-slate-50 space-y-0.5">
              <div
                class="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-0.5"
              >
                <span>Total:</span>
                <span class="font-mono font-black"
                  >{currencySymbol} {mockTotal.toLocaleString("id-ID")}</span
                >
              </div>
              {#if Number(taxRate) > 0}
                <div class="flex justify-between text-slate-600 text-[8px]">
                  <span>PPN ({taxRate}%):</span>
                  <span class="font-mono"
                    >{currencySymbol} {mockTax.toLocaleString("id-ID")}</span
                  >
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer Signatures & Receipt Note -->
      <div class="border-t border-slate-300 pt-2 mt-1">
        <div class="grid grid-cols-2 text-center text-[8px] text-slate-600 gap-2 mb-1">
          <div>
            <p class="font-bold text-slate-800 mb-4">Penerima,</p>
            <p class="border-t border-slate-400 w-20 mx-auto pt-0.5 font-medium">
              ( Pelanggan )
            </p>
          </div>
          <div>
            <p class="font-bold text-slate-800 mb-4">Hormat Kami,</p>
            <p class="border-t border-slate-400 w-20 mx-auto pt-0.5 font-medium">
              ({businessName || "Kasir"})
            </p>
          </div>
        </div>

        {#if receiptFooter}
          <p
            class="text-center text-[7.5px] text-slate-500 italic border-t border-dashed border-slate-200 pt-1 leading-snug"
          >
            {receiptFooter}
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>
