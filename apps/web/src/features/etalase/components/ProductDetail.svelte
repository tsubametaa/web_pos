<script lang="ts">
  import { onMount } from 'svelte';
  import { formatCurrency } from '../../../lib/utils/currency';
  import { Store, ArrowLeft, MapPin, Phone, Rocket, Package, MessageCircle } from 'lucide-svelte';
  import { api } from '../../../core/api';
  import logoUrl from '../../../assets/img/arthapos.svg';
  import Spinner from '../../../components/ui/Spinner.svelte';
  import type { UIProduct, UISettings } from '../../../types';

  interface Props {
    productId: string;
    onBack: () => void;
  }

  let { productId, onBack }: Props = $props();

  let loading = $state(true);
  let product = $state<UIProduct | null>(null);
  let settings = $state<UISettings | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const printMode = $derived(
    urlParams.get('print') === 'label' || window.location.hash.includes('print=label')
  );

  const shareUrl = $derived(
    product ? `${window.location.origin}/#/etalase/${product.id}` : ''
  );
  const qrCodeUrl = $derived(
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
  );

  async function loadProductDetail() {
    try {
      const res = await api.get(`/etalase/${productId}`);
      if (res.success) {
        product = res.product;
        settings = res.settings;
      }
    } catch (err) {
      console.error('Error loading product details:', err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadProductDetail();
  });

  $effect(() => {
    if (!loading && printMode && product) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  });

  const whatsappMessage = $derived.by(() => {
    if (!product) return '';
    const biz = settings?.businessName || 'Toko';
    const text = `Halo ${biz}, saya berminat untuk membeli produk berikut:\n\n*Nama:* ${product.name}\n*SKU:* ${product.sku || '-'}\n*Harga:* ${formatCurrency(product.sellingPrice)}\n*Link:* ${shareUrl}\n\nApakah stok masih tersedia?`;
    return encodeURIComponent(text);
  });
</script>

{#if loading}
  <div class="min-h-screen flex items-center justify-center bg-base text-ink">
    <Spinner size="lg" />
  </div>
{:else if product}
  {#if printMode}
    <!-- Label Thermal Printing Layout -->
    <div
      class="print-label-container w-[60mm] p-3 bg-white text-black font-sans flex flex-col items-center text-center justify-center border border-slate-200 mx-auto select-none"
    >
      <h5
        class="text-[9px] font-black uppercase tracking-wider truncate w-full border-b border-black pb-1 mb-1"
      >
        {settings?.businessName || 'ARTHAPOS'}
      </h5>

      <img src={qrCodeUrl} alt="QR Code Label" class="w-28 h-28 my-1" />

      <span class="text-[8px] font-mono font-bold tracking-widest">{product.sku || '-'}</span>
      <h4 class="text-[10px] font-bold mt-0.5 max-w-full leading-tight truncate px-1">
        {product.name}
      </h4>
      <span
        class="text-[11px] font-mono font-extrabold mt-1 border-t border-dashed border-black pt-1 w-full block"
      >
        {formatCurrency(product.sellingPrice)}
      </span>
    </div>
  {:else}
    <div class="min-h-screen bg-base text-ink flex flex-col font-sans antialiased select-none">
      <!-- Top Navigation Header -->
      <header
        class="bg-base/90 dark:bg-surface/90 backdrop-blur-md border-b border-slate-200/80 dark:border-emerald-950/80 py-3.5 px-4 sm:px-6 sticky top-0 z-30 shadow-2xs"
      >
        <div class="max-w-5xl w-full mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onclick={onBack}
            class="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer border-0 bg-transparent"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Kembali ke Katalog</span>
          </button>

          <div class="flex items-center">
            <img src={logoUrl} alt="ArthaPOS Logo" class="h-7 w-auto object-contain shrink-0" />
          </div>
        </div>
      </header>

      <!-- Main Workspace Product Details Card -->
      <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div
          class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl p-6 sm:p-8 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
        >
          <!-- Left Column: Product Image -->
          <div
            class="aspect-square w-full rounded-2xl bg-emerald-500/5 border border-slate-200/60 dark:border-emerald-950/60 overflow-hidden flex items-center justify-center relative shadow-2xs"
          >
            {#if product.imageUrl}
              <img src={product.imageUrl} alt={product.name} class="w-full h-full object-cover" />
            {:else}
              <Package class="w-16 h-16 text-emerald-600/50 dark:text-emerald-400/50 stroke-[1.2]" />
            {/if}

            {#if product.stock <= 0}
              <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center">
                <span class="text-white text-xs font-extrabold bg-rose-600 px-3 py-1 rounded-xl uppercase tracking-wider shadow-xs">
                  Stok Habis
                </span>
              </div>
            {/if}
          </div>

          <!-- Right Column: Description & Action -->
          <div class="flex flex-col gap-5">
            <div class="space-y-1.5">
              <span
                class="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-lg text-[10px] font-extrabold uppercase tracking-wider inline-block"
              >
                {product.category || 'Umum'}
              </span>

              <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {product.name}
              </h1>

              <div class="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>SKU: {product.sku || '-'}</span>
                <span>&bull;</span>
                <span>Satuan: {product.unit || 'unit'}</span>
              </div>
            </div>

            <!-- Price Highlight Box -->
            <div
              class="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 space-y-1"
            >
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Harga Jual
              </span>
              <p class="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(product.sellingPrice)}
              </p>
            </div>

            <!-- Stock Availability -->
            <div class="space-y-1.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Ketersediaan Stok
              </span>
              <div>
                {#if product.stock <= 0}
                  <span class="inline-flex items-center px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-600 dark:text-rose-400 rounded-xl">
                    Stok Habis
                  </span>
                {:else}
                  <span class="inline-flex items-center px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 rounded-xl">
                    Tersedia ({product.stock} {product.unit || 'unit'})
                  </span>
                {/if}
              </div>
            </div>

            <!-- Product Notes / Specification -->
            {#if product.notes}
              <div class="space-y-1.5 p-4 rounded-2xl bg-white/50 dark:bg-base/40 border border-slate-200/60 dark:border-emerald-950/60">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Catatan / Spesifikasi
                </span>
                <p class="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {product.notes}
                </p>
              </div>
            {/if}

            <!-- Buy via WhatsApp CTA -->
            {#if settings?.businessPhone}
              <div class="pt-2">
                <a
                  href="https://wa.me/{settings.businessPhone.replace(/\D/g, '')}?text={whatsappMessage}"
                  target="_blank"
                  class="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <MessageCircle class="w-4 h-4" />
                  <span>Beli via WhatsApp</span>
                </a>
              </div>
            {/if}
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-base/90 dark:bg-surface/60 border-t border-slate-200/80 dark:border-emerald-950/80 py-8 px-4 sm:px-6 mt-12">
        <div class="max-w-5xl w-full mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
          <div class="space-y-2 max-w-md">
            <div class="flex items-center">
              <img src={logoUrl} alt="ArthaPOS Logo" class="h-7 w-auto object-contain shrink-0" />
            </div>
            <p class="text-xs text-slate-500 dark:text-emerald-500/70 leading-relaxed font-medium">
              Katalog resmi toko online. Hubungi kami secara langsung untuk pembelian grosir atau konsultasi persediaan produk.
            </p>
          </div>

          <div class="space-y-2 text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
            <span class="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">
              Kontak Toko
            </span>
            {#if settings?.businessAddress}
              <div class="flex items-center gap-2">
                <MapPin class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{settings.businessAddress}</span>
              </div>
            {/if}
            {#if settings?.businessPhone}
              <div class="flex items-center gap-2">
                <Phone class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{settings.businessPhone}</span>
              </div>
            {/if}
          </div>
        </div>

        <div class="max-w-5xl w-full mx-auto border-t border-slate-200/60 dark:border-emerald-950/60 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400 font-medium">
          <span>&copy; {new Date().getFullYear()} {settings?.businessName || 'ArthaPOS'}. Hak Cipta Dilindungi.</span>
          <span class="flex items-center gap-1 font-bold">
            Powered by <span class="text-slate-800 dark:text-white font-black inline-flex items-center gap-1">ArthaPOS <Rocket class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /></span>
          </span>
        </div>
      </footer>
    </div>
  {/if}
{/if}
