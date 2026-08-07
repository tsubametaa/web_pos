<script lang="ts">
  import { onMount } from 'svelte';
  import { cart } from './logic/cart.svelte';
  import { api } from '../../core/api';
  import { toast } from '../../lib/utils/toast.svelte';
  import Spinner from '../../components/ui/Spinner.svelte';
  import ProductGrid from './components/ProductGrid.svelte';
  import CartPanel from './components/CartPanel.svelte';
  import PaymentModal from './components/PaymentModal.svelte';
  import ReceiptView from './components/ReceiptView.svelte';
  import type { UIProduct, UITransaction } from '../../types';
  import confetti from 'canvas-confetti';

  let loading = $state(true);
  let products = $state<UIProduct[]>([]);
  let settings = $state<any>(null);

  // Modal states
  let showPaymentModal = $state(false);
  let showReceiptModal = $state(false);
  let completedTransaction = $state<UITransaction | null>(null);

  // Derived categories list
  const categories = $derived([...new Set(products.map((p) => p.category).filter(Boolean))]);

  async function loadPosData() {
    try {
      const prodRes = await api.get('/products?active=true');
      if (prodRes.success) {
        products = prodRes.products;
      }
      const settingsRes = await api.get('/settings');
      if (settingsRes.success) {
        settings = settingsRes.settings;
      }
    } catch (err) {
      console.error('POS load error:', err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadPosData();
  });

  function handleProductSelect(product: UIProduct) {
    const warning = cart.add(product);
    if (warning) {
      toast.warning(warning);
    } else {
      toast.info(`Ditambahkan: ${product.name}`, 1500);
    }
  }

  function handleCheckoutTrigger() {
    if (cart.items.length === 0) {
      toast.error('Keranjang belanja kosong!');
      return;
    }
    showPaymentModal = true;
  }

  async function handleCheckoutSuccess(transaction: UITransaction) {
    completedTransaction = transaction;
    showPaymentModal = false;
    showReceiptModal = true;

    // Clear cart & play success confetti
    cart.clear();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });

    // Refresh data to update stock levels
    await loadPosData();
  }

  function handleReceiptClose() {
    showReceiptModal = false;
    completedTransaction = null;
  }
</script>

{#if loading}
  <div class="h-96 flex flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">
      Memuat Sistem POS Kasir...
    </span>
  </div>
{:else}
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)] items-stretch w-full pb-2">
    <!-- Left Side: Product Grid (2/3 width on large screens) -->
    <div class="lg:col-span-2 flex flex-col h-full min-w-0">
      <ProductGrid {products} {categories} onselect={handleProductSelect} />
    </div>

    <!-- Right Side: Cart Panel (1/3 width on large screens) -->
    <div class="lg:col-span-1 flex flex-col h-full">
      <CartPanel {settings} oncheckout={handleCheckoutTrigger} />
    </div>
  </div>

  <!-- Checkout Modals -->
  {#if showPaymentModal}
    <PaymentModal
      show={showPaymentModal}
      {settings}
      onclose={() => (showPaymentModal = false)}
      onsuccess={handleCheckoutSuccess}
    />
  {/if}

  {#if showReceiptModal}
    <ReceiptView
      show={showReceiptModal}
      transaction={completedTransaction}
      {settings}
      onclose={handleReceiptClose}
    />
  {/if}
{/if}
