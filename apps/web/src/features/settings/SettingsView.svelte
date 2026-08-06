<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from '../../lib/utils/toast.svelte';
  import {
    Settings,
    Store,
    KeyRound,
    Save,
    Printer,
    Check,
    ShieldCheck,
    Lock,
    Phone,
    MapPin,
    Coins,
    Percent,
    Bell,
    FileText,
  } from 'lucide-svelte';
  import { api } from '../../core/api';
  import { appState } from '../../core/state.svelte';
  import Spinner from '../../components/ui/Spinner.svelte';

  let loading = $state(true);
  let activeTab = $state<'profile' | 'security'>('profile');
  let profileSaving = $state(false);
  let securitySaving = $state(false);

  // Settings Form Fields
  let businessName = $state('');
  let businessPhone = $state('');
  let businessAddress = $state('');
  let currencySymbol = $state('Rp');
  let taxRate = $state(0);
  let lowStockThreshold = $state(10);
  let receiptFooter = $state('');

  // Security Form Fields
  let oldPassword = $state('');
  let newPassword = $state('');
  let confirmNewPassword = $state('');

  // Live Preview Computations for thermal receipt
  const mockSubtotal = 45000;
  const mockTax = $derived((mockSubtotal * (taxRate || 0)) / 100);
  const mockTotal = $derived(mockSubtotal + mockTax);

  // Password validation
  const hasMinLength = $derived(newPassword.length >= 6);
  const hasLetter = $derived(/[a-zA-Z]/.test(newPassword));
  const hasNumber = $derived(/[0-9]/.test(newPassword));
  const isNewPasswordValid = $derived(hasMinLength && hasLetter && hasNumber);

  async function loadSettings() {
    try {
      const res = await api.get('/settings');
      if (res.success && res.settings) {
        const s = res.settings;
        businessName = s.businessName || '';
        businessPhone = s.businessPhone || '';
        businessAddress = s.businessAddress || '';
        currencySymbol = s.currencySymbol || 'Rp';
        taxRate = s.taxRate || 0;
        lowStockThreshold = s.lowStockThreshold ?? 10;
        receiptFooter = s.receiptFooter || '';
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadSettings();
  });

  async function handleUpdateProfile(e: SubmitEvent) {
    e.preventDefault();
    profileSaving = true;
    try {
      const res = await api.put('/settings', {
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim() || undefined,
        businessPhone: businessPhone.trim() || undefined,
        currencySymbol: currencySymbol.trim() || undefined,
        taxRate: Number(taxRate),
        lowStockThreshold: Number(lowStockThreshold),
        receiptFooter: receiptFooter.trim() || undefined,
      });
      if (res.success) {
        toast.success(res.message || 'Profil bisnis berhasil diperbarui!');
        await appState.refreshSettings();
      } else {
        throw new Error(res.error || 'Gagal menyimpan.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui profil.');
    } finally {
      profileSaving = false;
    }
  }

  async function handleUpdatePassword(e: SubmitEvent) {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('Konfirmasi password baru tidak cocok.');
      return;
    }
    securitySaving = true;
    try {
      const res = await api.put('/settings/password', {
        oldPassword,
        newPassword,
      });
      if (res.success) {
        toast.success('Password berhasil diperbarui!');
        oldPassword = '';
        newPassword = '';
        confirmNewPassword = '';
      } else {
        throw new Error(res.error || 'Gagal memperbarui password.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah password.');
    } finally {
      securitySaving = false;
    }
  }
</script>

{#if loading}
  <div class="h-96 flex flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">
      Memuat Pengaturan Toko...
    </span>
  </div>
{:else}
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Header Banner -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-base/90 dark:bg-surface/60 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl shadow-2xs"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <Settings class="w-5 h-5" />
          </div>
          <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Pengaturan Toko
          </h1>
        </div>
        <p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
          Kelola profil bisnis, mata uang, pajak, notifikasi stok, format cetak struk, dan keamanan akun Anda.
        </p>
      </div>
    </div>

    <!-- Navigation Tabs & Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <!-- Sidebar Tabs Navigation -->
      <aside
        class="flex lg:flex-col gap-1.5 bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 p-2 rounded-2xl shadow-2xs overflow-x-auto lg:overflow-visible scrollbar-none"
      >
        <button
          type="button"
          onclick={() => (activeTab = 'profile')}
          class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer select-none shrink-0 w-full border-0
						{activeTab === 'profile'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10'}"
        >
          <Store class="w-4 h-4 shrink-0" />
          <span>Profil Bisnis & Kasir</span>
        </button>

        <button
          type="button"
          onclick={() => (activeTab = 'security')}
          class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer select-none shrink-0 w-full border-0
						{activeTab === 'security'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10'}"
        >
          <ShieldCheck class="w-4 h-4 shrink-0" />
          <span>Keamanan & Sandi</span>
        </button>
      </aside>

      <!-- Content Area -->
      <div class="lg:col-span-3">
        <!-- TAB 1: PROFIL BISNIS & KASIR -->
        {#if activeTab === 'profile'}
          <div class="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
            <!-- Left: Profile Form Card -->
            <div class="xl:col-span-3">
              <form
                onsubmit={handleUpdateProfile}
                class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-6 shadow-2xs space-y-6"
              >
                <!-- Section 1: Informasi Bisnis -->
                <div class="space-y-4">
                  <div class="border-b border-slate-200/60 dark:border-emerald-950/60 pb-3">
                    <h2 class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Informasi Profil Bisnis
                    </h2>
                    <p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium mt-0.5">
                      Identitas toko yang ditampilkan pada header struk dan laporan invoice.
                    </p>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                        for="biz-name"
                      >
                        Nama Toko / Usaha *
                      </label>
                      <div class="relative">
                        <input
                          id="biz-name"
                          type="text"
                          bind:value={businessName}
                          placeholder="Contoh: Coffee Shop Kita"
                          required
                          disabled={profileSaving}
                          class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                        for="biz-phone"
                      >
                        Nomor Telepon Kontak
                      </label>
                      <div class="relative">
                        <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          id="biz-phone"
                          type="text"
                          bind:value={businessPhone}
                          placeholder="Contoh: 081234567890"
                          disabled={profileSaving}
                          class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                      for="biz-addr"
                    >
                      Alamat Lengkap Toko
                    </label>
                    <div class="relative">
                      <MapPin class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        id="biz-addr"
                        type="text"
                        bind:value={businessAddress}
                        placeholder="Contoh: Jl. Diponegoro No. 45, Bandung"
                        disabled={profileSaving}
                        class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                <!-- Section 2: Standar Kasir & Keuangan -->
                <div class="space-y-4 pt-2 border-t border-slate-200/40 dark:border-emerald-950/40">
                  <div class="border-b border-slate-200/60 dark:border-emerald-950/60 pb-3">
                    <h2 class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Standar Kasir & Struk
                    </h2>
                    <p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium mt-0.5">
                      Pengaturan mata uang, PPN, notifikasi stok, dan footer pencetakan.
                    </p>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                        for="biz-curr"
                      >
                        Simbol Mata Uang *
                      </label>
                      <div class="relative">
                        <Coins class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          id="biz-curr"
                          type="text"
                          bind:value={currencySymbol}
                          placeholder="Rp"
                          required
                          disabled={profileSaving}
                          class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                        for="biz-tax"
                      >
                        Tarif PPN (%) *
                      </label>
                      <div class="relative">
                        <Percent class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          id="biz-tax"
                          type="number"
                          bind:value={taxRate}
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.1"
                          required
                          disabled={profileSaving}
                          class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                        for="biz-thresh"
                      >
                        Batas Stok Tipis *
                      </label>
                      <div class="relative">
                        <Bell class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          id="biz-thresh"
                          type="number"
                          bind:value={lowStockThreshold}
                          placeholder="10"
                          min="0"
                          required
                          disabled={profileSaving}
                          class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                      for="biz-footer"
                    >
                      Catatan Struk Footer
                    </label>
                    <div class="relative">
                      <FileText class="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                      <textarea
                        id="biz-footer"
                        bind:value={receiptFooter}
                        rows="2"
                        placeholder="Contoh: Barang yang sudah dibeli tidak dapat ditukar."
                        disabled={profileSaving}
                        class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="pt-3 border-t border-slate-200/60 dark:border-emerald-950/60 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs hover:shadow"
                  >
                    {#if profileSaving}
                      <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    {:else}
                      <Save class="w-4 h-4" />
                      <span>Simpan Perubahan Profil</span>
                    {/if}
                  </button>
                </div>
              </form>
            </div>

            <!-- Right: Real-time Live Receipt Preview Card -->
            <div class="xl:col-span-2 xl:sticky xl:top-6">
              <div
                class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs"
              >
                <div
                  class="flex items-center justify-between border-b border-slate-200/60 dark:border-emerald-950/60 pb-2.5"
                >
                  <div class="flex items-center gap-2">
                    <Printer class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span class="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                      Live Preview Struk
                    </span>
                  </div>
                  <span
                    class="text-[10px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20"
                  >
                    Thermal 80mm
                  </span>
                </div>

                <!-- Physical Receipt Card Rendering -->
                <div
                  class="bg-white text-slate-900 border border-slate-200 rounded-xl p-5 shadow-sm font-mono text-[9px] leading-relaxed flex flex-col w-full mx-auto select-none overflow-hidden"
                >
                  <!-- Receipt Header -->
                  <div class="text-center font-bold mb-3 flex flex-col gap-0.5">
                    <span class="text-xs block uppercase tracking-wide truncate text-slate-900 font-black">
                      {businessName || 'NAMA TOKO ANDA'}
                    </span>
                    {#if businessAddress}
                      <span class="font-normal block text-[8px] text-slate-600 truncate">
                        {businessAddress}
                      </span>
                    {/if}
                    {#if businessPhone}
                      <span class="font-normal block text-[8px] text-slate-600 truncate">
                        Telp: {businessPhone}
                      </span>
                    {/if}
                  </div>

                  <!-- Order Info -->
                  <div
                    class="border-t border-b border-dashed border-slate-300 py-2 my-2 flex flex-col gap-1 text-[8px]"
                  >
                    <div class="flex justify-between">
                      <span class="text-slate-600">No. Transaksi:</span>
                      <span class="font-bold">TRX-20260805-001</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-600">Tanggal:</span>
                      <span>05/08/2026 21:00</span>
                    </div>
                  </div>

                  <!-- Mock Sample Item -->
                  <div class="flex flex-col gap-1.5 my-2">
                    <div>
                      <div class="flex justify-between font-bold text-slate-900">
                        <span>Kopi Susu Aren (Large)</span>
                        <span>45.000</span>
                      </div>
                      <div class="text-[8px] text-slate-500">
                        1 &times; 45.000
                      </div>
                    </div>
                  </div>

                  <!-- Total Calculations -->
                  <div class="border-t border-dashed border-slate-300 pt-2 flex flex-col gap-1 text-[8px]">
                    <div class="flex justify-between">
                      <span class="text-slate-600">Subtotal:</span>
                      <span class="font-bold">45.000</span>
                    </div>

                    {#if Number(taxRate) > 0}
                      <div class="flex justify-between">
                        <span class="text-slate-600">PPN ({taxRate}%):</span>
                        <span class="font-bold">{mockTax.toLocaleString('id-ID')}</span>
                      </div>
                    {/if}

                    <div
                      class="flex justify-between font-black text-[10px] border-t border-slate-300 pt-1.5 mt-1 text-slate-900"
                    >
                      <span>TOTAL ({currencySymbol}):</span>
                      <span>{currencySymbol} {mockTotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <!-- Receipt Footer Note -->
                  {#if receiptFooter}
                    <div
                      class="text-center text-[8px] text-slate-600 border-t border-dashed border-slate-300 pt-2.5 mt-3 whitespace-pre-line leading-normal font-medium"
                    >
                      {receiptFooter}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- TAB 2: KEAMANAN & KATA SANDI -->
        {#if activeTab === 'security'}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <!-- Left: Password Change Form -->
            <div class="md:col-span-2">
              <form
                onsubmit={handleUpdatePassword}
                class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-6 shadow-2xs space-y-5"
              >
                <div class="border-b border-slate-200/60 dark:border-emerald-950/60 pb-3 flex items-center gap-3">
                  <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <KeyRound class="w-5 h-5" />
                  </div>
                  <div>
                    <h2 class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Kredensial Keamanan Akun
                    </h2>
                    <p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium mt-0.5">
                      Perbarui kata sandi utama toko Anda secara berkala untuk menjaga keamanan data.
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                    for="pass-old"
                  >
                    Password Saat Ini *
                  </label>
                  <div class="relative">
                    <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      id="pass-old"
                      type="password"
                      bind:value={oldPassword}
                      placeholder="Masukkan password lama"
                      required
                      disabled={securitySaving}
                      class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                    for="pass-new"
                  >
                    Password Baru *
                  </label>
                  <div class="relative">
                    <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      id="pass-new"
                      type="password"
                      bind:value={newPassword}
                      placeholder="Masukkan password baru"
                      required
                      disabled={securitySaving}
                      class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label
                    class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
                    for="pass-confirm"
                  >
                    Konfirmasi Password Baru *
                  </label>
                  <div class="relative">
                    <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      id="pass-confirm"
                      type="password"
                      bind:value={confirmNewPassword}
                      placeholder="Ketik ulang password baru"
                      required
                      disabled={securitySaving}
                      class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
                    />
                  </div>
                  {#if newPassword && confirmNewPassword && newPassword !== confirmNewPassword}
                    <p class="text-[11px] font-bold text-rose-500 mt-1">
                      Konfirmasi password baru tidak cocok.
                    </p>
                  {/if}
                </div>

                <div class="pt-3 border-t border-slate-200/60 dark:border-emerald-950/60 flex justify-end">
                  <button
                    type="submit"
                    disabled={securitySaving ||
                      !oldPassword ||
                      !newPassword ||
                      newPassword !== confirmNewPassword ||
                      !isNewPasswordValid}
                    class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs disabled:pointer-events-none"
                  >
                    {#if securitySaving}
                      <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    {:else}
                      <Save class="w-4 h-4" />
                      <span>Perbarui Password</span>
                    {/if}
                  </button>
                </div>
              </form>
            </div>

            <!-- Right: Password Criteria Card -->
            <div class="md:col-span-1">
              <div
                class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xs"
              >
                <div class="border-b border-slate-200/60 dark:border-emerald-950/60 pb-2.5">
                  <span class="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                    Kriteria Keamanan Password
                  </span>
                </div>

                <ul class="flex flex-col gap-3 text-xs">
                  <li class="flex items-center gap-2.5">
                    <div
                      class="w-4 h-4 rounded-full flex items-center justify-center border shrink-0 transition-colors
												{hasMinLength
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-base dark:bg-base/60 border-slate-300 text-slate-400'}"
                    >
                      {#if hasMinLength}
                        <Check class="w-2.5 h-2.5 stroke-[3]" />
                      {:else}
                        <span class="w-1 h-1 rounded-full bg-slate-400"></span>
                      {/if}
                    </div>
                    <span class={hasMinLength ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-500'}>
                      Minimal 6 karakter
                    </span>
                  </li>

                  <li class="flex items-center gap-2.5">
                    <div
                      class="w-4 h-4 rounded-full flex items-center justify-center border shrink-0 transition-colors
												{hasLetter
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-base dark:bg-base/60 border-slate-300 text-slate-400'}"
                    >
                      {#if hasLetter}
                        <Check class="w-2.5 h-2.5 stroke-[3]" />
                      {:else}
                        <span class="w-1 h-1 rounded-full bg-slate-400"></span>
                      {/if}
                    </div>
                    <span class={hasLetter ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-500'}>
                      Mengandung huruf (A-Z, a-z)
                    </span>
                  </li>

                  <li class="flex items-center gap-2.5">
                    <div
                      class="w-4 h-4 rounded-full flex items-center justify-center border shrink-0 transition-colors
												{hasNumber
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-base dark:bg-base/60 border-slate-300 text-slate-400'}"
                    >
                      {#if hasNumber}
                        <Check class="w-2.5 h-2.5 stroke-[3]" />
                      {:else}
                        <span class="w-1 h-1 rounded-full bg-slate-400"></span>
                      {/if}
                    </div>
                    <span class={hasNumber ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-500'}>
                      Mengandung angka (0-9)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
