<script lang="ts">
  import { cart } from '../logic/cart.svelte';
  import { memberStore } from '../logic/member.svelte';
  import { api } from '../../../core/api';
  import { formatCurrency } from '../../../lib/utils/currency';
  import { toast } from '../../../lib/utils/toast.svelte';
  import { X, CreditCard, User } from 'lucide-svelte';
  import type { UISettings, UITransaction } from '../../../types';
  import PaymentRecipientSection from './PaymentRecipientSection.svelte';
  import PaymentMethodSection from './PaymentMethodSection.svelte';
  import PaymentSummarySection from './PaymentSummarySection.svelte';

  interface Props {
    show: boolean;
    settings: UISettings | null;
    onclose: () => void;
    onsuccess: (transaction: UITransaction) => void;
  }

  let { show, settings, onclose, onsuccess }: Props = $props();

  const taxRate = $derived(settings?.taxRate || 0);
  const subtotal = $derived(cart.totalAmount);
  const taxAmount = $derived((subtotal * taxRate) / 100);
  const totalAmount = $derived(subtotal + taxAmount);

  const totalSavings = $derived(
    cart.items.reduce((sum, item) => {
      if (item.customPrice && item.customPrice < item.product.sellingPrice) {
        return sum + (item.product.sellingPrice - item.customPrice) * item.qty;
      }
      return sum;
    }, 0)
  );

  let paymentMethod = $state<'cash' | 'transfer' | 'qris' | 'other'>('cash');
  let amountPaid = $state(0);
  let notes = $state('');
  let recipientName = $state('');
  let recipientPhone = $state('');
  let recipientAddress = $state('');
  let isLoading = $state(false);

  // Professional Nego / Manual Discount state
  let manualDiscountInput = $state<number | ''>('');
  let finalPriceInput = $state<number | ''>('');
  let showNegoEditor = $state(false);

  function handleDiscountInput(val: number | '') {
    manualDiscountInput = val;
    if (typeof val === 'number' && !isNaN(val) && val >= 0) {
      finalPriceInput = Math.max(0, totalAmount - val);
    } else {
      finalPriceInput = '';
    }
  }

  function handleFinalPriceInput(val: number | '') {
    finalPriceInput = val;
    if (typeof val === 'number' && !isNaN(val) && val >= 0) {
      manualDiscountInput = Math.max(0, totalAmount - val);
    } else {
      finalPriceInput = '';
    }
  }

  const manualDiscountAmount = $derived(
    typeof manualDiscountInput === 'number' && !isNaN(manualDiscountInput) && manualDiscountInput > 0
      ? manualDiscountInput
      : 0
  );

  const effectiveFinalTotal = $derived(
    Math.max(0, totalAmount - manualDiscountAmount)
  );

  function resetNegoDiscount() {
    manualDiscountInput = '';
    finalPriceInput = '';
    showNegoEditor = false;
  }

  $effect(() => {
    if (show) {
      if (memberStore.current) {
        recipientName = memberStore.current.name || '';
        recipientPhone = memberStore.current.phone || '';
        recipientAddress = memberStore.current.address || memberStore.current.notes || '';
      } else {
        recipientName = '';
        recipientPhone = '';
        recipientAddress = '';
      }
      notes = '';
      amountPaid = 0;
      resetNegoDiscount();
    }
  });

  const change = $derived(paymentMethod === 'cash' ? Math.max(0, amountPaid - effectiveFinalTotal) : 0);
  const canCheckout = $derived(
    paymentMethod !== 'cash' || amountPaid >= effectiveFinalTotal
  );

  function setExactAmount() {
    amountPaid = effectiveFinalTotal;
  }

  function addCashPreset(amount: number) {
    amountPaid = (amountPaid || 0) + amount;
  }

  async function handleCheckout() {
    if (!canCheckout) {
      toast.error('Uang bayar kurang dari total belanja.');
      return;
    }
    isLoading = true;
    try {
      const scale = (manualDiscountAmount > 0 && totalAmount > 0)
        ? (totalAmount - manualDiscountAmount) / totalAmount
        : 1;

      const payload = {
        items: cart.items.map((item) => {
          const basePrice = item.customPrice ?? item.product.sellingPrice;
          const customPrice = scale !== 1 ? Math.round(basePrice * scale) : item.customPrice;
          return {
            productId: item.product.id,
            qty: item.qty,
            customPrice
          };
        }),
        paymentMethod,
        amountPaid: paymentMethod === 'cash' ? amountPaid : effectiveFinalTotal,
        notes: notes || (manualDiscountAmount > 0 ? `Diskon Nego/Manual: -${formatCurrency(manualDiscountAmount)}` : undefined),
        recipientName: recipientName.trim() || undefined,
        recipientPhone: recipientPhone.trim() || undefined,
        recipientAddress: recipientAddress.trim() || undefined,
        memberId: memberStore.current?.id || undefined,
        isMemberTransaction: Boolean(memberStore.current)
      };
      const res = await api.post('/transactions', payload);
      if (res.success) {
        memberStore.remove();
        onsuccess(res.transaction as UITransaction);
      } else {
        throw new Error(res.error || 'Checkout gagal.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Checkout gagal. Silakan coba lagi.');
    } finally {
      isLoading = false;
    }
  }

  function handleClose() {
    if (!isLoading) onclose();
  }
</script>

{#if show}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none"
    role="dialog"
    aria-modal="true"
    aria-label="Modal Pembayaran"
    tabindex="-1"
  >
    <!-- Landscape Wide Modal Container (max-w-4xl) -->
    <div
      class="relative w-full max-w-4xl bg-surface rounded-3xl shadow-2xl border border-border-theme overflow-hidden text-ink flex flex-col max-h-[92vh]"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <!-- Header Banner -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-border-theme bg-base/80">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-accent-soft text-accent">
            <CreditCard class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-black text-h-text tracking-tight">Proses Pembayaran POS</h2>
            <p class="text-xs text-ink-muted font-medium">Lengkapi info penerima & pilih metode pembayaran</p>
          </div>

          {#if memberStore.current}
            <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-accent-soft border border-accent/25 rounded-xl text-xs font-black text-accent-soft-text ml-2">
              <User class="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Member: {memberStore.current.name}</span>
            </div>
          {/if}
        </div>

        <button
          type="button"
          onclick={handleClose}
          class="p-2 text-ink-muted hover:text-h-text hover:bg-accent-soft rounded-xl transition-all cursor-pointer"
          aria-label="Tutup Modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Main 2-Column Side-by-Side Content Grid -->
      <div class="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto max-h-[calc(92vh-90px)] scrollbar-none">
        
        <!-- Left Column (6 Cols): 1. Informasi Penerima, 2. Metode Pembayaran, 3. Catatan -->
        <div class="md:col-span-6 flex flex-col gap-4">
          <PaymentRecipientSection
            {recipientName}
            {recipientPhone}
            {recipientAddress}
            onPhoneInput={(val) => (recipientPhone = val)}
            onNameInput={(val) => (recipientName = val)}
            onAddressInput={(val) => (recipientAddress = val)}
          />

          <PaymentMethodSection
            {paymentMethod}
            {amountPaid}
            {effectiveFinalTotal}
            {change}
            {settings}
            onMethodSelect={(m) => (paymentMethod = m)}
            onAmountPaidChange={(val) => (amountPaid = val)}
            onSetExactAmount={setExactAmount}
            onAddCashPreset={addCashPreset}
          />

          <!-- 3. Catatan Transaksi (Opsional) -->
          <div>
            <label class="text-xs font-bold text-ink-muted uppercase tracking-wider block mb-1.5" for="checkout-notes-field">
              Catatan Transaksi (Opsional)
            </label>
            <textarea
              id="checkout-notes-field"
              bind:value={notes}
              rows="2"
              placeholder="Catatan tambahan transaksi..."
              class="w-full px-3.5 py-2.5 bg-base border border-border-theme focus:ring-accent/10 focus:border-accent rounded-xl text-xs text-h-text resize-none focus:outline-none focus:ring-2 transition-all"
            ></textarea>
          </div>
        </div>

        <!-- Right Column (6 Cols): Summary Box & Checkout CTA -->
        <PaymentSummarySection
          {subtotal}
          {taxRate}
          {taxAmount}
          {totalAmount}
          {totalSavings}
          {manualDiscountInput}
          {finalPriceInput}
          {manualDiscountAmount}
          {effectiveFinalTotal}
          {showNegoEditor}
          {canCheckout}
          {isLoading}
          onToggleNegoEditor={() => (showNegoEditor = !showNegoEditor)}
          onDiscountInput={handleDiscountInput}
          onFinalPriceInput={handleFinalPriceInput}
          onResetNego={resetNegoDiscount}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  </div>
{/if}
