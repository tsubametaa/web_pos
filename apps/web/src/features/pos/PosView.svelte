<script lang="ts">
  import { onMount } from 'svelte';
  import { cart } from './logic/cart.svelte';
  import { api } from '../../core/api';
  import { toast } from '../../lib/utils/toast.svelte';
  import Skeleton from '../../components/ui/Skeleton.svelte';
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
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)] items-stretch w-full pb-2 select-none">
    <!-- Left Side: Product Grid Skeleton -->
    <div class="lg:col-span-2 flex flex-col h-full gap-4">
      <div class="flex gap-3">
        <Skeleton class="h-10 flex-1" />
        <Skeleton class="h-10 w-28" />
      </div>
      <div class="flex gap-2">
        {#each Array(4) as _}
          <Skeleton class="h-8 w-20" />
        {/each}
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
        {#each Array(6) as _}
          <div class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-3">
            <Skeleton class="h-28 w-full" />
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-5 w-1/2" />
          </div>
        {/each}
      </div>
    </div>

    <!-- Right Side: Cart Panel Skeleton -->
    <div class="lg:col-span-1 bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between h-full gap-4">
      <Skeleton class="h-8 w-36" />
      <div class="space-y-3 flex-1">
        {#each Array(3) as _}
          <Skeleton class="h-12 w-full" />
        {/each}
      </div>
      <Skeleton class="h-14 w-full" />
    </div>
  </div>
{:else}
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)] items-stretch w-full pb-2 tablet-pos-grid">
    <!-- Left Side: Product Grid (2/3 width on large screens) -->
    <div class="col-span-full lg:col-span-2 flex flex-col h-full min-w-0 w-full tablet-product-grid">
      <ProductGrid {products} {categories} onselect={handleProductSelect} />
    </div>

    <!-- Right Side: Cart Panel (1/3 width on large screens) -->
    <div class="col-span-full lg:col-span-1 flex flex-col h-full w-full tablet-cart-panel">
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
