<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../../../core/api';
  import { toast } from '../../../lib/utils/toast.svelte';
  import { formatCurrency } from '../../../lib/utils/currency';
  import Button from '../../../components/ui/Button.svelte';
  import Spinner from '../../../components/ui/Spinner.svelte';
  import Dropdown from '../../../components/ui/Dropdown.svelte';
  import { Tag, Plus, Trash2, X, ShieldAlert, Package } from 'lucide-svelte';
  import type { UIMember, UIMemberPrice, UIProduct } from '../../../types';

  interface Props {
    show: boolean;
    member: UIMember | null;
    onclose: () => void;
    onupdate: () => void;
  }

  let { show, member, onclose, onupdate }: Props = $props();

  let loading = $state(true);
  let productsList = $state<UIProduct[]>([]);
  let pricesList = $state<UIMemberPrice[]>([]);

  // Add custom price form state
  let selectedSku = $state('');
  let customPriceInput = $state<number | ''>('');
  let isSubmitting = $state(false);
  let errorMsg = $state('');

  async function loadData() {
    if (!member) return;
    loading = true;
    try {
      // 1. Fetch products
      const prodRes = await api.get('/products');
      if (prodRes.success) {
        productsList = prodRes.products;
      }

      // 2. Fetch member detail + prices
      const memRes = await api.get(`/members/${member.id}`);
      if (memRes.success && memRes.member) {
        pricesList = memRes.member.prices || [];
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat data harga khusus.');
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (show && member) {
      selectedSku = '';
      customPriceInput = '';
      errorMsg = '';
      loadData();
    }
  });

  // Filter products that don't have custom price yet
  const availableProducts = $derived.by(() => {
    const existingSkus = new Set(pricesList.map((p) => p.sku.toUpperCase()));
    return productsList.filter((p) => p.isActive && !existingSkus.has(p.sku.toUpperCase()));
  });

  const productOptions = $derived(
    availableProducts.map((p) => ({
      value: p.sku,
      label: `${p.name} (SKU: ${p.sku}) — Normal: ${formatCurrency(p.sellingPrice)}`
    }))
  );

  const selectedProductDetail = $derived(
    productsList.find((p) => p.sku.toUpperCase() === selectedSku.toUpperCase())
  );

  async function handleAddPrice(e: SubmitEvent) {
    e.preventDefault();
    if (!member) return;
    if (!selectedSku) {
      errorMsg = 'Pilih produk terlebih dahulu.';
      return;
    }
    if (typeof customPriceInput !== 'number' || customPriceInput <= 0) {
      errorMsg = 'Harga member harus berupa angka lebih dari 0.';
      return;
    }

    isSubmitting = true;
    errorMsg = '';

    try {
      const res = await api.post(`/members/${member.id}/prices`, {
        sku: selectedSku,
        customPrice: Number(customPriceInput)
      });

      if (res.success) {
        toast.success(`Harga khusus SKU ${selectedSku} berhasil disimpan!`);
        selectedSku = '';
        customPriceInput = '';
        await loadData();
        onupdate();
      } else {
        throw new Error(res.error || 'Gagal menyimpan harga khusus.');
      }
    } catch (err: any) {
      errorMsg = err.message || 'Terjadi kesalahan.';
      toast.error(errorMsg);
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDeletePrice(sku: string) {
    if (!member) return;
    const confirmDelete = confirm(`Hapus harga khusus untuk produk SKU ${sku}?`);
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/members/${member.id}/prices/${encodeURIComponent(sku)}`);
      if (res.success) {
        toast.success(`Harga khusus SKU ${sku} berhasil dihapus.`);
        await loadData();
        onupdate();
      } else {
        throw new Error(res.error || 'Gagal menghapus harga khusus.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat menghapus harga khusus.');
    }
  }
</script>

{#if show && member}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      class="relative w-full max-w-xl bg-base dark:bg-surface border border-border-theme rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-ink select-none"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-6 py-4.5 border-b border-border-theme bg-base/80 dark:bg-surface/80"
      >
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Tag class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-black text-h-text tracking-tight flex items-center gap-2">
              <span>Kelola Harga Khusus</span>
              <span class="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-lg">
                {member.name}
              </span>
            </h2>
            <p class="text-xs text-ink-muted font-medium">
              Atur deal harga khusus per SKU untuk member ({member.phone})
            </p>
          </div>
        </div>

        <button
          type="button"
          onclick={onclose}
          class="p-2 rounded-xl text-ink-muted hover:text-h-text hover:bg-accent-soft cursor-pointer transition-colors"
          aria-label="Tutup modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-none">
        {#if loading}
          <div class="py-12 flex flex-col items-center justify-center gap-2">
            <Spinner size="lg" />
            <span class="text-xs font-bold text-ink-muted">Memuat data deal harga member...</span>
          </div>
        {:else}
          <!-- Add Deal Price Form Box -->
          <form onsubmit={handleAddPrice} class="p-4 bg-accent-soft/40 border border-accent/20 rounded-2xl space-y-3">
            <h4 class="text-xs font-extrabold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Deal Harga Produk Baru</span>
            </h4>

            {#if errorMsg}
              <div class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 font-bold flex items-center gap-2">
                <ShieldAlert class="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            {/if}

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Select Product Dropdown -->
              <div>
                <label class="block text-[11px] font-bold text-ink-muted mb-1" for="select-sku">
                  Pilih Produk (SKU)
                </label>
                <Dropdown
                  options={productOptions}
                  bind:value={selectedSku}
                  placeholder="-- Pilih Produk Catalog --"
                />
              </div>

              <!-- Custom Member Price Input -->
              <div>
                <label class="block text-[11px] font-bold text-ink-muted mb-1" for="custom-price-input">
                  Harga Deal Member (Rp)
                </label>
                <input
                  id="custom-price-input"
                  type="number"
                  bind:value={customPriceInput}
                  placeholder="e.g. 15000"
                  min="1"
                  disabled={isSubmitting || !selectedSku}
                  class="w-full px-3 py-2 bg-surface border border-border-theme focus:border-accent rounded-xl text-xs font-mono font-bold text-h-text placeholder-ink-muted focus:outline-none transition-colors"
                />
              </div>
            </div>

            {#if selectedProductDetail}
              <div class="text-[11px] text-ink-muted font-medium flex items-center justify-between pt-1 border-t border-border-theme/40">
                <span>Harga Normal: <strong class="text-h-text">{formatCurrency(selectedProductDetail.sellingPrice)}</strong></span>
                {#if typeof customPriceInput === 'number' && customPriceInput > 0}
                  {@const diff = selectedProductDetail.sellingPrice - customPriceInput}
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">
                    {diff > 0 ? `Hemat ${formatCurrency(diff)}/unit` : 'Sama dengan harga normal'}
                  </span>
                {/if}
              </div>
            {/if}

            <div class="flex justify-end pt-1">
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!selectedSku || typeof customPriceInput !== 'number' || customPriceInput <= 0}
                class="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                + Simpan Deal Harga
              </Button>
            </div>
          </form>

          <!-- Configured Deal Prices List Table -->
          <div class="space-y-2">
            <h4 class="text-xs font-extrabold text-h-text uppercase tracking-wider">
              Daftar Harga Member Aktif ({pricesList.length} Produk)
            </h4>

            {#if pricesList.length > 0}
              <div class="bg-base border border-border-theme rounded-2xl overflow-hidden shadow-2xs">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="border-b border-border-theme bg-surface/50">
                      <th class="text-left px-4 py-3 font-extrabold text-ink-muted uppercase">Produk</th>
                      <th class="text-right px-4 py-3 font-extrabold text-ink-muted uppercase">Harga Normal</th>
                      <th class="text-right px-4 py-3 font-extrabold text-ink-muted uppercase">Harga Member</th>
                      <th class="text-center px-4 py-3 font-extrabold text-ink-muted uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border-theme">
                    {#each pricesList as item (item.id || item.sku)}
                      {@const matchedProd = productsList.find((p) => p.sku.toUpperCase() === item.sku.toUpperCase())}
                      <tr class="hover:bg-accent-soft/30 transition-colors">
                        <td class="px-4 py-3">
                          <div class="flex flex-col">
                            <span class="font-bold text-h-text">
                              {matchedProd?.name || 'Produk SKU #' + item.sku}
                            </span>
                            <span class="text-[10px] font-mono text-ink-muted">
                              SKU: {item.sku}
                            </span>
                          </div>
                        </td>

                        <td class="px-4 py-3 text-right font-mono text-ink-muted line-through">
                          {matchedProd ? formatCurrency(matchedProd.sellingPrice) : '-'}
                        </td>

                        <td class="px-4 py-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.customPrice)}
                        </td>

                        <td class="px-4 py-3 text-center">
                          <button
                            type="button"
                            onclick={() => handleDeletePrice(item.sku)}
                            class="p-1.5 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer transition-colors"
                            title="Hapus Harga Khusus"
                          >
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <div class="p-8 text-center border border-dashed border-border-theme rounded-2xl text-ink-muted">
                <Package class="w-8 h-8 mx-auto text-ink-muted opacity-40 mb-2" />
                <p class="text-xs font-bold text-h-text">Belum ada deal harga khusus untuk member ini.</p>
                <p class="text-[11px] text-ink-muted mt-0.5">
                  Produk yang belum ditambahkan deal harganya akan otomatis menggunakan harga normal saat transaksi di kasir.
                </p>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-border-theme bg-surface/50 flex justify-end">
        <button
          type="button"
          onclick={onclose}
          class="px-5 py-2 text-xs font-bold text-h-text bg-base border border-border-theme rounded-xl hover:bg-accent-soft cursor-pointer transition-colors"
        >
          Selesai
        </button>
      </div>
    </div>
  </div>
{/if}
