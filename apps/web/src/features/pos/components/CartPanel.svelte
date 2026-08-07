<script lang="ts">
  import { cart } from '../logic/cart.svelte';
  import { memberStore } from '../logic/member.svelte';
  import { formatCurrency } from '../../../lib/utils/currency';
  import { toast } from '../../../lib/utils/toast.svelte';
  import { ShoppingCart, Minus, Plus, Trash2, CreditCard, User, Check, X, Tag, MapPin, AlertCircle } from 'lucide-svelte';
  import type { UISettings, UIMember } from '../../../types';
  import Spinner from '../../../components/ui/Spinner.svelte';
  import { api } from '../../../core/api';

  interface Props {
    settings: UISettings | null;
    oncheckout: () => void;
  }

  let { settings, oncheckout }: Props = $props();

  let memberPhoneInput = $state('');
  let searchResults = $state<UIMember[]>([]);
  let isSearchingMember = $state(false);
  let showSuggestions = $state(false);
  let memberInputRef = $state<HTMLDivElement | null>(null);
  let debounceCartTimer: ReturnType<typeof setTimeout> | null = null;

  // Tax & Savings calculation
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

  function handleQtyChange(productId: string, currentQty: number, offset: number) {
    const targetQty = currentQty + offset;
    const warning = cart.updateQty(productId, targetQty);
    if (warning) {
      toast.warning(warning);
    }
  }

  function handleCartPhoneInput(val: string) {
    memberPhoneInput = val;
    if (memberStore.error) memberStore.error = null;
    if (debounceCartTimer) clearTimeout(debounceCartTimer);

    const clean = val.trim();
    const digitsOnly = clean.replace(/[^0-9]/g, '');

    if (!clean) {
      if (memberStore.current) memberStore.remove();
      searchResults = [];
      showSuggestions = false;
      return;
    }

    // 1. If full 10-13 digit phone number is entered, try auto-confirming exact match
    if (digitsOnly.length >= 10 && digitsOnly.length <= 13) {
      debounceCartTimer = setTimeout(async () => {
        const success = await memberStore.confirm(clean);
        if (success) {
          showSuggestions = false;
          searchResults = [];
        } else {
          // Fallback search suggestions
          fetchSuggestions(clean);
        }
      }, 300);
      return;
    }

    // 2. For partial search input (length >= 2), fetch and show suggestions list
    if (clean.length >= 2) {
      fetchSuggestions(clean);
    } else {
      searchResults = [];
      showSuggestions = false;
    }
  }

  function fetchSuggestions(clean: string) {
    isSearchingMember = true;
    debounceCartTimer = setTimeout(async () => {
      try {
        const res = await api.get(`/members?search=${encodeURIComponent(clean)}`);
        if (res.success && Array.isArray(res.members)) {
          searchResults = res.members;
          showSuggestions = true;
        } else {
          searchResults = [];
          showSuggestions = true;
        }
      } catch {
        searchResults = [];
        showSuggestions = true;
      } finally {
        isSearchingMember = false;
      }
    }, 200);
  }

  async function handleSelectSuggestion(m: UIMember) {
    const success = await memberStore.selectMember(m);
    if (success) {
      memberPhoneInput = m.phone;
      showSuggestions = false;
      searchResults = [];
      toast.success(`Member Aktif: ${m.name}`);
    } else if (memberStore.error) {
      toast.error(memberStore.error);
    }
  }

  async function handleConfirmMember() {
    if (!memberPhoneInput.trim()) return;
    const clean = memberPhoneInput.trim();
    const digits = clean.replace(/[^0-9]/g, '');

    if (digits.length < 10 && clean.length >= 2) {
      fetchSuggestions(clean);
      return;
    }

    const success = await memberStore.confirm(clean);
    if (success) {
      showSuggestions = false;
      searchResults = [];
      toast.success(`Member Aktif: ${memberStore.current?.name}`);
    } else if (memberStore.error) {
      toast.error(memberStore.error);
    }
  }

  function handleRemoveMember() {
    memberStore.remove();
    memberPhoneInput = '';
    showSuggestions = false;
    searchResults = [];
    toast.info('Member dilepas. Harga kembali ke normal.');
  }

  function handleWindowClick(e: MouseEvent) {
    if (memberInputRef && !memberInputRef.contains(e.target as Node)) {
      showSuggestions = false;
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div
  class="flex flex-col h-full bg-surface border border-border-theme rounded-2xl p-4 sm:p-5 shadow-2xs relative text-ink select-none"
>
  <!-- Panel Header -->
  <div
    class="flex items-center justify-between pb-3.5 border-b border-border-theme mb-3"
  >
    <div class="flex items-center gap-2">
      <div class="p-1.5 rounded-lg bg-accent-soft text-accent">
        <ShoppingCart class="w-4 h-4" />
      </div>
      <h3 class="text-xs font-bold text-h-text uppercase tracking-wider">
        Keranjang ({cart.totalItems})
      </h3>
    </div>

    <button
      type="button"
      onclick={() => cart.clear()}
      disabled={cart.items.length === 0}
      class="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
      title="Bersihkan Keranjang"
    >
      <Trash2 class="w-3.5 h-3.5" />
      <span>Bersihkan</span>
    </button>
  </div>

  <!-- Member Lookup Header Section -->
  <div class="mb-3 p-2.5 bg-base border border-border-theme rounded-xl flex flex-col gap-2 relative z-20">
    {#if memberStore.current}
      <!-- Active Member Badge -->
      <div class="flex items-center justify-between gap-2 p-2.5 bg-accent-soft border border-accent/25 rounded-xl shadow-2xs">
        <div class="flex items-center gap-2 min-w-0">
          <div class="p-1.5 rounded-lg bg-accent text-white shrink-0">
            <User class="w-3.5 h-3.5" />
          </div>
          <div class="truncate">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-black text-accent-soft-text truncate">
                {memberStore.current.name}
              </span>
              <span class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-accent text-white shrink-0">
                Member
              </span>
            </div>
            <span class="text-[10px] font-mono text-accent-soft-text font-bold block truncate">
              {memberStore.current.phone}
            </span>
          </div>
        </div>

        <button
          type="button"
          onclick={handleRemoveMember}
          class="p-1.5 rounded-lg text-accent-soft-text hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer transition-colors shrink-0"
          title="Lepas Member"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    {:else}
      <!-- Member Phone Input Form with Autocomplete Suggestions Dropdown -->
      <div class="relative w-full" bind:this={memberInputRef}>
        <div class="flex items-center gap-1.5">
          <div class="relative flex-1">
            <User class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
            <input
              type="text"
              value={memberPhoneInput}
              oninput={(e) => handleCartPhoneInput(e.currentTarget.value)}
              onkeydown={(e) => e.key === 'Enter' && handleConfirmMember()}
              onfocus={() => memberPhoneInput.trim().length >= 2 && (showSuggestions = true)}
              placeholder="No HP / Nama Member..."
              class="w-full pl-8 pr-7 py-1.5 bg-surface border border-border-theme focus:border-accent rounded-lg text-xs font-mono font-bold text-h-text placeholder-ink-muted focus:outline-none transition-colors"
            />
            {#if isSearchingMember}
              <div class="absolute right-2 top-1/2 -translate-y-1/2">
                <span class="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin block"></span>
              </div>
            {/if}
          </div>
          <button
            type="button"
            onclick={handleConfirmMember}
            disabled={memberStore.loading || !memberPhoneInput.trim()}
            class="px-3 py-1.5 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shrink-0 flex items-center gap-1"
          >
            {#if memberStore.loading}
              <Spinner size="sm" />
            {:else}
              <Check class="w-3.5 h-3.5" />
              <span>Cek</span>
            {/if}
          </button>
        </div>

        <!-- Autocomplete Suggestions List Dropdown -->
        {#if showSuggestions && memberPhoneInput.trim().length >= 2}
          <div
            class="absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface border border-border-theme rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto divide-y divide-border-theme/40 animate-in fade-in duration-100"
          >
            {#if searchResults.length > 0}
              {#each searchResults as m}
                <button
                  type="button"
                  onclick={() => handleSelectSuggestion(m)}
                  class="w-full px-3.5 py-2.5 text-left hover:bg-accent-soft/80 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs font-bold text-h-text truncate">
                        {m.name}
                      </span>
                      {#if m.address}
                        <span class="text-[9px] text-accent font-medium truncate flex items-center gap-0.5">
                          <MapPin class="w-2.5 h-2.5 text-accent shrink-0 inline" />
                          <span>{m.address}</span>
                        </span>
                      {/if}
                    </div>
                    <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold block">
                      {m.phone}
                    </span>
                  </div>
                  <span class="text-[9px] font-extrabold text-accent bg-accent-soft px-2 py-0.5 rounded-md shrink-0">
                    Pilih
                  </span>
                </button>
              {/each}
            {:else if !isSearchingMember}
              <div class="px-3.5 py-3 text-center text-xs text-ink-muted font-medium">
                Tidak ada member yang cocok dengan "<span class="font-bold text-h-text">{memberPhoneInput}</span>"
              </div>
            {/if}
          </div>
        {/if}
      </div>

      {#if memberStore.error}
        <p class="text-[10px] text-rose-500 font-semibold px-1 flex items-center gap-1">
          <AlertCircle class="w-3 h-3 text-rose-500 shrink-0 inline" />
          <span>{memberStore.error}</span>
        </p>
      {/if}
    {/if}
  </div>

  <!-- Cart Items Scroll List -->
  <div class="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 min-h-65 scrollbar-none">
    {#each cart.items as item (item.product.id)}
      {@const effectivePrice = item.customPrice ?? item.product.sellingPrice}
      {@const isMemberDiscount = item.customPrice !== undefined && item.customPrice < item.product.sellingPrice}

      <div
        class="p-3 bg-base border border-border-theme rounded-xl flex justify-between gap-3 items-center hover:border-accent/30 transition-all duration-150 shadow-2xs"
      >
        <div class="flex-1 min-w-0">
          <h5 class="font-bold text-h-text text-xs truncate">
            {item.product.name}
          </h5>
          <span class="font-mono text-[10px] text-ink-muted block mt-0.5 uppercase">
            SKU: {item.product.sku || '-'}
          </span>
          <div class="flex items-center gap-1.5 mt-1">
            {#if isMemberDiscount}
              <span class="font-mono text-[10px] text-ink-muted line-through">
                {formatCurrency(item.product.sellingPrice)}
              </span>
              <span class="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-0.5">
                <Tag class="w-3 h-3 inline shrink-0" />
                {formatCurrency(effectivePrice)}
              </span>
            {:else}
              <span class="font-mono text-xs text-accent-soft-text font-black">
                {formatCurrency(effectivePrice)}
              </span>
            {/if}
          </div>
        </div>

        <!-- Quantity Stepper Controls -->
        <div
          class="flex items-center bg-surface border border-border-theme rounded-lg p-0.5 shrink-0"
        >
          <button
            type="button"
            onclick={() => handleQtyChange(item.product.id, item.qty, -1)}
            class="p-1 hover:bg-accent-soft rounded-md text-ink cursor-pointer transition-colors"
            title="Kurangi Quantity"
          >
            <Minus class="w-3 h-3" />
          </button>
          <span class="text-xs font-mono font-bold text-h-text px-1.5 min-w-6 text-center">
            {item.qty}
          </span>
          <button
            type="button"
            onclick={() => handleQtyChange(item.product.id, item.qty, 1)}
            class="p-1 hover:bg-accent-soft rounded-md text-ink cursor-pointer transition-colors"
            title="Tambah Quantity"
          >
            <Plus class="w-3 h-3" />
          </button>
        </div>

        <!-- Item Subtotal & Delete Action -->
        <div class="flex flex-col items-end gap-1 min-w-17.5 shrink-0">
          <span class="font-mono text-xs font-black text-h-text">
            {formatCurrency(item.qty * effectivePrice)}
          </span>
          <button
            type="button"
            onclick={() => cart.remove(item.product.id)}
            class="p-1 text-ink-muted hover:text-rose-600 transition-colors cursor-pointer"
            title="Hapus Item"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    {:else}
      <div
        class="flex-1 flex flex-col items-center justify-center gap-2.5 text-ink-muted text-center py-20"
      >
        <div class="p-3 bg-accent-soft text-accent rounded-2xl">
          <ShoppingCart class="w-6 h-6 stroke-[1.5]" />
        </div>
        <div class="space-y-0.5">
          <p class="text-xs font-bold text-h-text">
            Keranjang Masih Kosong
          </p>
          <p class="text-[11px] text-ink-muted">
            Klik produk dari daftar di samping untuk menambahkan.
          </p>
        </div>
      </div>
    {/each}
  </div>

  <!-- Billing Summary Footer -->
  <div class="border-t border-border-theme pt-3.5 mt-3 flex flex-col gap-2.5">
    <div class="flex justify-between items-center text-xs text-ink-muted">
      <span>Subtotal ({cart.totalItems} item)</span>
      <span class="font-mono font-extrabold text-h-text">
        {formatCurrency(subtotal)}
      </span>
    </div>

    {#if totalSavings > 0}
      <div class="flex justify-between items-center text-xs text-emerald-700 dark:text-emerald-300 font-bold">
        <span class="flex items-center gap-1">
          <Tag class="w-3.5 h-3.5" />
          Hemat Member
        </span>
        <span class="font-mono">
          -{formatCurrency(totalSavings)}
        </span>
      </div>
    {/if}

    {#if taxRate > 0}
      <div class="flex justify-between items-center text-xs text-ink-muted">
        <span>Pajak PPN ({taxRate}%)</span>
        <span class="font-mono font-extrabold text-h-text">
          {formatCurrency(taxAmount)}
        </span>
      </div>
    {/if}

    <!-- Total Amount Box -->
    <div
      class="flex justify-between items-center p-3.5 bg-accent-soft border border-accent/25 rounded-xl mt-1"
    >
      <span class="text-xs font-black text-rose-950 dark:text-rose-100 uppercase tracking-wide">
        Total Bayar
      </span>
      <span class="font-mono text-lg font-black text-rose-950 dark:text-rose-100">
        {formatCurrency(totalAmount)}
      </span>
    </div>

    <!-- Checkout Trigger Button -->
    <button
      type="button"
      onclick={oncheckout}
      disabled={cart.items.length === 0}
      class="w-full mt-1.5 inline-flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-hover disabled:opacity-35 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-xs hover:shadow transition-all duration-150 disabled:pointer-events-none cursor-pointer"
    >
      <CreditCard class="w-4 h-4" />
      <span>Proses Pembayaran</span>
    </button>
  </div>
</div>
