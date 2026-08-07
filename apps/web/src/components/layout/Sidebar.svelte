<script lang="ts">
  import { appState } from '../../core/state.svelte';
  import logoUrl from '../../assets/img/kslogo.svg';
  import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    History,
    TrendingUp,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Shield,
    Users,
  } from 'lucide-svelte';

  interface Props {
    currentRouteKey: string;
    sidebarOpen: boolean;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onCloseMobile: () => void;
  }

  let {
    currentRouteKey,
    sidebarOpen = $bindable(false),
    isCollapsed,
    onToggleCollapse,
    onCloseMobile,
  }: Props = $props();

  const menuGroups = $derived.by(() => {
    const isSuperAdmin = appState.user?.role === 'super_admin';
    const managementItems = [
      {
        name: 'Inventori',
        path: '#/inventory',
        key: 'inventory',
        icon: Package,
      },
      {
        name: 'Member & Harga',
        path: '#/members',
        key: 'members',
        icon: Users,
      },
      {
        name: 'Riwayat Transaksi',
        path: '#/sales',
        key: 'sales',
        icon: History,
      },
    ];

    if (isSuperAdmin) {
      managementItems.push({
        name: 'HPP & Margin',
        path: '#/hpp',
        key: 'hpp',
        icon: TrendingUp,
      });
    }

    const systemItems = [
      {
        name: 'Pengaturan',
        path: '#/settings',
        key: 'settings',
        icon: Settings,
      },
    ];

    if (isSuperAdmin) {
      systemItems.push({
        name: 'Manajemen User',
        path: '#/users',
        key: 'users',
        icon: Users,
      });
    }

    return [
      {
        title: 'Utama',
        items: [
          {
            name: 'Dashboard',
            path: '#/dashboard',
            key: 'dashboard',
            icon: LayoutDashboard,
          },
          {
            name: 'POS Kasir',
            path: '#/pos',
            key: 'pos',
            icon: ShoppingCart,
          },
        ],
      },
      {
        title: 'Manajemen',
        items: managementItems,
      },
      {
        title: 'Sistem',
        items: systemItems,
      },
    ];
  });

  const userDisplayName = $derived(
    appState.user?.businessName || appState.user?.email || 'Admin'
  );

  const userInitials = $derived(() => {
    const name = userDisplayName;
    return name.substring(0, 2).toUpperCase();
  });
</script>

<!-- Mobile Sidebar Overlay Backdrop -->
{#if sidebarOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden transition-opacity duration-200"
    onclick={onCloseMobile}
  ></div>
{/if}

<!-- Sticky Desktop Sidebar Container -->
<aside
  class="fixed inset-y-0 left-0 z-50 bg-base/95 backdrop-blur-md border-r border-border-theme flex flex-col justify-between transition-all duration-200 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 shadow-2xs select-none
		{sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
		{isCollapsed ? 'w-64 lg:w-19' : 'w-64 lg:w-64'}"
>
  <!-- Collapse Desktop Toggle Button -->
  <button
    type="button"
    onclick={onToggleCollapse}
    class="hidden lg:flex absolute -right-3.5 top-7 z-50 items-center justify-center w-7 h-7 rounded-full border border-border-theme bg-base text-ink-muted hover:text-accent shadow-md hover:scale-105 cursor-pointer transition-all duration-150"
    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    title={isCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
  >
    {#if isCollapsed}
      <ChevronRight class="w-4 h-4" />
    {:else}
      <ChevronLeft class="w-4 h-4" />
    {/if}
  </button>

  <!-- Top Header & Brand Area -->
  <div
    class="flex flex-col flex-1 min-h-0 {isCollapsed
      ? 'lg:overflow-visible overflow-y-auto'
      : 'overflow-y-auto'} scrollbar-none"
  >
    <div
      class="h-16 px-5 flex items-center border-b border-border-theme transition-all duration-200
			{isCollapsed ? 'lg:justify-center' : 'justify-start'}"
    >
      <a href="#/dashboard" class="flex items-center group overflow-hidden">
        <img
          src={logoUrl}
          alt="ArthaPOS Logo"
          class="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </a>
    </div>

    <!-- Navigation List -->
    <nav class="p-3 space-y-5">
      {#each menuGroups as group}
        <div class="space-y-1">
          <!-- Section Title (Hidden when collapsed on desktop) -->
          <div
            class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted transition-all duration-200
						{isCollapsed ? 'lg:hidden' : 'block'}"
          >
            {group.title}
          </div>

          {#each group.items as item}
            {@const isActive = currentRouteKey === item.key}
            <a
              href={item.path}
              onclick={onCloseMobile}
              class="relative group flex items-center rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer
								{isCollapsed ? 'lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2.5 gap-3' : 'gap-3 px-3.5 py-2.5'}
								{isActive
                ? 'bg-accent-soft text-accent-soft-text font-extrabold shadow-2xs border border-accent/20'
                : 'text-p-text hover:text-h-text hover:bg-accent-soft/60'}"
            >
              <!-- Active Highlight Pill -->
              {#if isActive}
                <div
                  class="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r-full shadow-xs"
                ></div>
              {/if}

              <item.icon
                class="w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-110
								{isActive ? 'text-accent-soft-text' : 'text-ink-muted group-hover:text-accent-soft-text'}"
              />

              <span
                class="transition-all duration-200 truncate whitespace-nowrap
								{isCollapsed ? 'lg:hidden' : 'block'}"
              >
                {item.name}
              </span>

              <!-- Hover Tooltip for Collapsed Desktop Mode -->
              {#if isCollapsed}
                <div
                  class="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-950 text-white text-xs font-bold rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 whitespace-nowrap z-50 border border-slate-800/80 shadow-slate-950/40"
                >
                  {item.name}
                  <div
                    class="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-900 dark:border-r-slate-950"
                  ></div>
                </div>
              {/if}
            </a>
          {/each}
        </div>
      {/each}
    </nav>
  </div>

  <!-- User Profile Footer Area -->
  <div class="p-3 border-t border-slate-200/60 dark:border-slate-800/60 bg-base/60 dark:bg-base/40">
    {#if isCollapsed}
      <!-- Collapsed Desktop Mode: ONLY Clean Centered Logout Button -->
      <div class="hidden lg:flex items-center justify-center">
        <button
          type="button"
          onclick={() => appState.logout()}
          class="w-10 h-10 rounded-xl text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-emerald-500/5 dark:bg-emerald-950/30 hover:bg-rose-500/15 dark:hover:bg-rose-950/40 border border-slate-200/60 dark:border-emerald-950/60 hover:border-rose-500/30 cursor-pointer transition-all duration-150 relative group flex items-center justify-center shadow-2xs"
          aria-label="Keluar Akun"
        >
          <LogOut class="w-4.5 h-4.5 stroke-2" />
          <!-- Floating Tooltip -->
          <div
            class="absolute left-full ml-3 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150 whitespace-nowrap z-50 flex flex-col gap-0.5"
          >
            <span>Keluar Akun</span>
            <span class="text-[10px] font-normal text-rose-100">{userDisplayName}</span>
            <div
              class="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-rose-600"
            ></div>
          </div>
        </button>
      </div>

      <!-- Mobile Fallback Mode -->
      <div class="flex lg:hidden items-center justify-between gap-3">
        <div class="flex items-center gap-3 overflow-hidden">
          <div
            class="w-9 h-9 shrink-0 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-emerald-500/20"
            title={userDisplayName}
          >
            {userInitials()}
          </div>
          <div class="flex flex-col truncate">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {userDisplayName}
            </span>
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate flex items-center gap-1">
              <Shield class="w-2.5 h-2.5 text-emerald-500 inline" />
              {appState.user?.role === 'super_admin' ? 'Super Admin' : 'Admin Biasa'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onclick={() => appState.logout()}
          class="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors duration-150 shrink-0"
          aria-label="Keluar Akun"
          title="Keluar Akun"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    {:else}
      <!-- Expanded Mode: Full User Profile & Logout -->
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 overflow-hidden">
          <div
            class="w-9 h-9 shrink-0 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-emerald-500/20"
            title={userDisplayName}
          >
            {userInitials()}
          </div>
          <div class="flex flex-col truncate">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {userDisplayName}
            </span>
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate flex items-center gap-1">
              <Shield class="w-2.5 h-2.5 text-emerald-500 inline" />
              {appState.user?.role === 'super_admin' ? 'Super Admin' : 'Admin Biasa'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onclick={() => appState.logout()}
          class="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors duration-150 shrink-0"
          aria-label="Keluar Akun"
          title="Keluar Akun"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    {/if}
  </div>
</aside>
