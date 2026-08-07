<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '../../core/state.svelte';
  import { activeStore } from '../../core/activeStore.svelte';
  import { Menu, X, Sun, Moon, Store, ChevronRight, Building2, ChevronDown, Check } from 'lucide-svelte';

  interface Props {
    activeMenuItem?: {
      name: string;
      path: string;
      key: string;
      icon: any;
    };
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
  }

  let { activeMenuItem, sidebarOpen, onToggleSidebar }: Props = $props();

  const activeIcon = $derived(activeMenuItem?.icon);
  const isSuperAdmin = $derived(appState.user?.role === 'super_admin');
  let dropdownOpen = $state(false);

  onMount(() => {
    activeStore.loadStores();
  });

  function selectStore(storeId: string) {
    activeStore.selectStore(storeId);
    dropdownOpen = false;
  }

  function handleWindowClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('#brand-dropdown-container')) {
      dropdownOpen = false;
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<header
  class="h-16 flex items-center justify-between px-4 sm:px-6 bg-base/90 dark:bg-base/85 backdrop-blur-md border-b border-slate-200/80 dark:border-emerald-950/80 shadow-2xs sticky top-0 z-30 transition-all duration-200 select-none"
>
  <!-- Left Side: Mobile Toggle & Breadcrumb / Page Title -->
  <div class="flex items-center gap-3">
    <!-- Mobile Hamburger Toggle -->
    <button
      type="button"
      onclick={onToggleSidebar}
      class="p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 lg:hidden cursor-pointer bg-transparent border-0 transition-colors"
      aria-label="Toggle menu"
    >
      {#if sidebarOpen}
        <X class="w-5 h-5 text-rose-500" />
      {:else}
        <Menu class="w-5 h-5" />
      {/if}
    </button>

    <!-- Page Breadcrumb & Title -->
    <div class="flex items-center gap-2.5">
      {#if activeIcon}
        {@const IconComp = activeIcon}
        <div class="hidden sm:flex p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
          <IconComp class="w-4 h-4" />
        </div>
      {/if}

      <div class="flex items-center gap-1.5 text-xs">
        <span class="text-slate-400 dark:text-emerald-500/60 font-medium hidden md:inline">Navigasi</span>
        <ChevronRight class="w-3.5 h-3.5 text-slate-300 dark:text-emerald-500/40 hidden md:inline" />
        <h2 class="font-bold text-sm text-slate-800 dark:text-emerald-100 tracking-tight">
          {activeMenuItem?.name || 'Dashboard'}
        </h2>
      </div>
    </div>
  </div>

  <!-- Right Side: Brand Switcher, Etalase Link & Theme Switcher -->
  <div class="flex items-center gap-2.5">
    <!-- Custom Interactive Brand Dropdown UI -->
    {#if isSuperAdmin && activeStore.stores.length > 0}
      <div id="brand-dropdown-container" class="relative">
        <button
          type="button"
          onclick={() => (dropdownOpen = !dropdownOpen)}
          class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 cursor-pointer transition-all duration-150 shadow-2xs"
        >
          <Building2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span class="truncate max-w-[130px] sm:max-w-[180px]">
            {activeStore.currentStore?.name || 'Pilih Brand'}
          </span>
          <ChevronDown class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 {dropdownOpen ? 'rotate-180' : ''}" />
        </button>

        {#if dropdownOpen}
          <div
            class="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface border border-slate-200 dark:border-emerald-950 rounded-2xl shadow-xl p-1.5 z-50 flex flex-col gap-1 transition-all animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-emerald-950/50">
              Pilih Brand Aktif ({activeStore.stores.length})
            </div>

            {#each activeStore.stores as store}
              <button
                type="button"
                onclick={() => selectStore(store.id)}
                class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border-0
                  {store.id === activeStore.currentStore?.id
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15'}"
              >
                <div class="flex items-center gap-2 truncate">
                  {#if store.logoUrl}
                    <img src={store.logoUrl} alt={store.name} class="w-4 h-4 object-contain rounded" />
                  {:else}
                    <Building2 class="w-3.5 h-3.5 shrink-0 opacity-70" />
                  {/if}
                  <span class="truncate">{store.name}</span>
                </div>

                {#if store.id === activeStore.currentStore?.id}
                  <Check class="w-3.5 h-3.5 text-white shrink-0 ml-1" />
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300">
        <Building2 class="w-3.5 h-3.5" />
        <span>{activeStore.currentStore?.name || appState.user?.businessName || 'Brand Utama'}</span>
      </div>
    {/if}

    <!-- Public Storefront Shortcut -->
    <a
      href="#/etalase"
      target="_blank"
      class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-emerald-200 hover:text-emerald-700 dark:hover:text-white bg-base hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 border border-slate-200/80 dark:border-emerald-900/40 rounded-xl shadow-2xs transition-all duration-150 group"
      title="Buka Etalase Publik di Tab Baru"
    >
      <Store class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
      <span class="hidden sm:inline">Etalase Publik</span>
      <span class="text-slate-400 dark:text-slate-500 text-[10px] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
    </a>

    <!-- Theme Switcher -->
    <button
      type="button"
      onclick={() => appState.toggleTheme()}
      class="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-emerald-300 dark:hover:text-white bg-base hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 border border-slate-200/80 dark:border-emerald-900/40 cursor-pointer transition-all duration-150 shadow-2xs hover:scale-105"
      title={appState.theme === 'light' ? 'Ganti ke Mode Gelap' : 'Ganti ke Mode Terang'}
      aria-label="Ganti Tema"
    >
      {#if appState.theme === 'light'}
        <Moon class="w-4 h-4 text-emerald-800" />
      {:else}
        <Sun class="w-4 h-4 text-amber-400" />
      {/if}
    </button>
  </div>
</header>

