<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from '../../lib/utils/toast.svelte';
  import { api, API_BASE_URL } from '../../core/api';
  import { appState } from '../../core/state.svelte';
  import { activeStore } from '../../core/activeStore.svelte';
  import Skeleton from '../../components/ui/Skeleton.svelte';

  import SettingsHeader from './components/SettingsHeader.svelte';
  import SettingsSidebar, { type TabType } from './components/SettingsSidebar.svelte';
  import BusinessProfileTab from './components/BusinessProfileTab.svelte';
  import SecurityTab from './components/SecurityTab.svelte';
  import BrandManagementTab from './components/BrandManagementTab.svelte';
  import PrinterSettingsTab from './components/PrinterSettingsTab.svelte';

  let loading = $state(true);
  let activeTab = $state<TabType>('profile');
  let profileSaving = $state(false);
  let securitySaving = $state(false);
  let uploadingLogo = $state(false);

  // Settings Form Fields
  let businessName = $state('');
  let logoUrl = $state('');
  let businessPhone = $state('');
  let businessAddress = $state('');
  let currencySymbol = $state('Rp');
  let taxRate = $state(0);
  let lowStockThreshold = $state(10);
  let receiptFooter = $state('');

  // Brand Management Fields (Super Admin)
  let newBrandName = $state('');
  let newBrandAddress = $state('');
  let newBrandPhone = $state('');
  let brandSaving = $state(false);

  // Security Form Fields
  let oldPassword = $state('');
  let newPassword = $state('');
  let confirmNewPassword = $state('');

  async function loadSettings() {
    try {
      const res = await api.get('/settings');
      if (res.success && res.settings) {
        const s = res.settings;
        businessName = s.businessName || '';
        logoUrl = s.logoUrl || '';
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

  function checkHashTab() {
    if (window.location.hash.includes('tab=stores') || window.location.hash.includes('stores')) {
      activeTab = 'stores';
    }
  }

  onMount(() => {
    checkHashTab();
    window.addEventListener('hashchange', checkHashTab);
    loadSettings();
    return () => {
      window.removeEventListener('hashchange', checkHashTab);
    };
  });

  async function handleLogoUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      uploadingLogo = true;
      const authEmail = localStorage.getItem('auth_email') || '';
      const res = await fetch(`${API_BASE_URL}/uploads/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authEmail}`,
          'X-User-Email': authEmail
        },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        logoUrl = data.url;
        toast.success('Logo brand berhasil diunggah!');
      } else {
        throw new Error(data.error || 'Gagal mengunggah logo.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengunggah logo.');
    } finally {
      uploadingLogo = false;
    }
  }

  async function handleUpdateProfile(e: SubmitEvent) {
    e.preventDefault();
    profileSaving = true;
    try {
      const res = await api.put('/settings', {
        businessName: businessName.trim(),
        logoUrl: logoUrl || undefined,
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
        await activeStore.loadStores();
      } else {
        throw new Error(res.error || 'Gagal menyimpan.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui profil.');
    } finally {
      profileSaving = false;
    }
  }

  async function handleCreateBrand(e: SubmitEvent) {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    brandSaving = true;
    try {
      const res = await api.post('/stores', {
        name: newBrandName.trim(),
        address: newBrandAddress.trim() || undefined,
        phone: newBrandPhone.trim() || undefined
      });
      if (res.success) {
        toast.success(res.message || 'Brand baru berhasil dibuat!');
        newBrandName = '';
        newBrandAddress = '';
        newBrandPhone = '';
        await activeStore.loadStores();
      } else {
        throw new Error(res.error || 'Gagal membuat brand.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat brand baru.');
    } finally {
      brandSaving = false;
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
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Header Banner Skeleton -->
    <div class="p-6 bg-surface/90 border border-border-theme rounded-2xl flex justify-between items-center gap-4">
      <div class="space-y-2 w-full max-w-md">
        <Skeleton class="h-6 w-40" />
        <Skeleton class="h-4 w-full" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <!-- Sidebar Skeleton -->
      <div class="lg:col-span-1 space-y-2 bg-surface/90 border border-border-theme p-4 rounded-2xl">
        {#each Array(4) as _}
          <Skeleton class="h-10 w-full" />
        {/each}
      </div>

      <!-- Main Form Skeleton -->
      <div class="lg:col-span-3 space-y-4 bg-surface/90 border border-border-theme p-6 rounded-2xl">
        <Skeleton class="h-8 w-60" />
        <Skeleton class="h-20 w-full" />
        <div class="grid grid-cols-2 gap-4">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
        </div>
        <Skeleton class="h-24 w-full" />
      </div>
    </div>
  </div>
{:else}
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <SettingsHeader />

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <SettingsSidebar
        {activeTab}
        isSuperAdmin={appState.user?.role === 'super_admin'}
        onTabChange={(tab) => (activeTab = tab)}
      />

      <div class="lg:col-span-3">
        {#if activeTab === 'profile'}
          <BusinessProfileTab
            bind:businessName
            bind:logoUrl
            bind:businessPhone
            bind:businessAddress
            bind:currencySymbol
            bind:taxRate
            bind:lowStockThreshold
            bind:receiptFooter
            {profileSaving}
            {uploadingLogo}
            onLogoUpload={handleLogoUpload}
            onSubmit={handleUpdateProfile}
          />
        {:else if activeTab === 'security'}
          <SecurityTab
            bind:oldPassword
            bind:newPassword
            bind:confirmNewPassword
            {securitySaving}
            onSubmit={handleUpdatePassword}
          />
        {:else if activeTab === 'stores' && appState.user?.role === 'super_admin'}
          <BrandManagementTab
            bind:newBrandName
            bind:newBrandPhone
            bind:newBrandAddress
            {brandSaving}
            onSubmit={handleCreateBrand}
          />
        {:else if activeTab === 'printer'}
          <PrinterSettingsTab />
        {/if}
      </div>
    </div>
  </div>
{/if}
