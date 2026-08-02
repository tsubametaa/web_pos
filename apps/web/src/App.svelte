<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "./core/state.svelte";
  import { api } from "./core/api";
  import { toast } from "./lib/utils/toast.svelte";
  import Toaster from "./components/ui/Toaster.svelte";
  import Spinner from "./components/ui/Spinner.svelte";
  import logoUrl from "./assets/img/arthapos.svg";

  // Views
  // Pages
  import Login from "./pages/Login.svelte";
  import Register from "./pages/Register.svelte";
  import Dashboard from "./pages/Dashboard.svelte";
  import Pos from "./pages/Pos.svelte";
  import Inventory from "./pages/Inventory.svelte";
  import Sales from "./pages/Sales.svelte";
  import Hpp from "./pages/Hpp.svelte";
  import Settings from "./pages/Settings.svelte";
  import Etalase from "./pages/Etalase.svelte";
  import Invoice from "./pages/Invoice.svelte";

  // Icons
  import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    History,
    TrendingUp,
    Settings as SettingsIcon,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon,
  } from "lucide-svelte";

  let currentRoute = $state("#/dashboard");
  let sidebarOpen = $state(false);
  let isCollapsed = $state(false);

  interface ParsedRoute {
    name: string;
    params: {
      id?: string;
    };
  }

  // Parse current hash route and arguments
  const parsedRoute = $derived.by((): ParsedRoute => {
    const hash = currentRoute || "#/dashboard";

    if (hash.startsWith("#/invoice/")) {
      const id = hash.replace("#/invoice/", "");
      return { name: "invoice", params: { id } };
    }
    if (hash.startsWith("#/etalase/")) {
      const id = hash.replace("#/etalase/", "");
      return { name: "etalase", params: { id } };
    }
    if (hash === "#/etalase") {
      return { name: "etalase", params: {} };
    }
    if (hash === "#/login") {
      return { name: "login", params: {} };
    }
    if (hash === "#/register") {
      return { name: "register", params: {} };
    }

    const name = hash.replace("#/", "");
    return { name: name || "dashboard", params: {} };
  });

  function updateRoute() {
    currentRoute = window.location.hash || "#/dashboard";
  }

  onMount(() => {
    // Initialize session, settings, and theme
    appState.initialize();

    // Update route on hashchange
    updateRoute();
    window.addEventListener("hashchange", updateRoute);

    const storedCollapse = localStorage.getItem("sidebar_collapsed");
    if (storedCollapse !== null) {
      isCollapsed = storedCollapse === "true";
    }

    return () => {
      window.removeEventListener("hashchange", updateRoute);
    };
  });

  const requiresAuth = $derived(
    parsedRoute.name !== "login" &&
      parsedRoute.name !== "register" &&
      parsedRoute.name !== "etalase",
  );

  const isShellHidden = $derived(
    parsedRoute.name === "etalase" || parsedRoute.name === "invoice",
  );

  // Handle routing auth guard
  $effect(() => {
    if (appState.initialized) {
      if (appState.needSetup && parsedRoute.name !== "register") {
        window.location.hash = "#/register";
      } else if (requiresAuth && !appState.user) {
        window.location.hash = "#/login";
      } else if (
        appState.user &&
        (parsedRoute.name === "login" || parsedRoute.name === "register")
      ) {
        window.location.hash = "#/dashboard";
      }
    }
  });

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
    localStorage.setItem("sidebar_collapsed", String(isCollapsed));
  }

  const menuItems = [
    {
      name: "Dashboard",
      path: "#/dashboard",
      key: "dashboard",
      icon: LayoutDashboard,
    },
    { name: "POS Kasir", path: "#/pos", key: "pos", icon: ShoppingCart },
    { name: "Inventori", path: "#/inventory", key: "inventory", icon: Package },
    { name: "Riwayat Transaksi", path: "#/sales", key: "sales", icon: History },
    { name: "HPP & Margin", path: "#/hpp", key: "hpp", icon: TrendingUp },
    {
      name: "Pengaturan",
      path: "#/settings",
      key: "settings",
      icon: SettingsIcon,
    },
  ];

  const activeMenuItem = $derived(
    menuItems.find((item) => parsedRoute.name === item.key),
  );
</script>

<Toaster />

{#if !appState.initialized}
  <div
    class="fixed inset-0 flex flex-col items-center justify-center bg-base text-ink z-50"
  >
    <Spinner size="lg" />
    <span class="text-xs font-bold mt-4 uppercase tracking-widest opacity-60"
      >Memuat Sistem POS...</span
    >
  </div>
{:else if isShellHidden}
  <!-- Render public or fullscreen layouts (Etalase, Invoice) directly -->
  {#if parsedRoute.name === "invoice"}
    <Invoice transactionId={parsedRoute.params.id ?? ""} />
  {:else}
    <Etalase productId={parsedRoute.params.id} />
  {/if}
{:else if parsedRoute.name === "login"}
  <Login />
{:else if parsedRoute.name === "register"}
  <Register />
{:else}
  <!-- Admin Panel Layout -->
  <div
    class="min-h-screen flex bg-base text-ink relative transition-colors duration-200"
  >
    <!-- Sidebar Mobile Overlay -->
    {#if sidebarOpen}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="fixed inset-0 z-35 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        onclick={() => (sidebarOpen = false)}
      ></div>
    {/if}

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 bg-surface border-r border-sage-200/40 flex flex-col justify-between transition-all duration-150 ease-out lg:translate-x-0 lg:static lg:shrink-0 shadow-xs
			{sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
			{isCollapsed ? 'w-64 lg:w-20' : 'w-64 lg:w-64'}"
    >
      <!-- Collapse Toggle Button (Desktop only) -->
      <button
        type="button"
        onclick={toggleCollapse}
        class="hidden lg:flex absolute -right-3 top-6 z-50 items-center justify-center w-6 h-6 rounded-full border border-sage-200 bg-white dark:bg-base text-slate-400 hover:text-slate-700 hover:bg-sage-50 shadow-sm cursor-pointer transition-colors duration-150"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {#if isCollapsed}
          <ChevronRight class="w-3.5 h-3.5" />
        {:else}
          <ChevronLeft class="w-3.5 h-3.5" />
        {/if}
      </button>

      <div>
        <!-- Logo / Store Header -->
        <div
          class="h-16 flex items-center border-b border-sage-200/20 transition-all duration-150 {isCollapsed
            ? 'lg:justify-center lg:px-4 px-6 gap-3'
            : 'px-6 gap-3'}"
        >
          <div
            class="h-8 shrink-0 flex items-center justify-center transition-all duration-150"
          >
            <img
              src={logoUrl}
              alt="ArthaPOS Logo"
              class="h-full w-auto object-contain"
            />
          </div>
        </div>

        <!-- Navigation -->
        <nav class="p-3 flex flex-col gap-1 transition-all duration-150">
          {#each menuItems as item}
            {@const isActive = parsedRoute.name === item.key}
            <a
              href={item.path}
              onclick={() => (sidebarOpen = false)}
              class="relative group flex items-center rounded-lg text-[13px] font-semibold transition-colors duration-150 cursor-pointer select-none
								{isCollapsed
                ? 'lg:justify-center lg:p-2.5 px-4 py-2.5 gap-3'
                : 'gap-3 px-4 py-2.5'}
								{isActive
                ? 'bg-base text-sage-700 dark:text-accent font-bold'
                : 'text-slate-650 hover:text-slate-850 hover:bg-base/40 dark:text-slate-300'}"
            >
              <!-- Active indicator line -->
              {#if isActive}
                <div
                  class="absolute left-0 top-2 bottom-2 w-0.5 bg-sage-500 rounded-r-md"
                ></div>
              {/if}

              <item.icon class="w-5 h-5 shrink-0" />

              <span
                class="transition-all duration-150 truncate whitespace-nowrap {isCollapsed
                  ? 'lg:opacity-0 lg:w-0 lg:pointer-events-none lg:absolute lg:-z-50'
                  : 'opacity-100 w-auto'}"
              >
                {item.name}
              </span>

              {#if isCollapsed}
                <!-- Tooltip (Desktop collapsed only) -->
                <div
                  class="hidden lg:block absolute left-full ml-3 px-2 py-1 bg-slate-950 text-white text-[11px] font-medium rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150 whitespace-nowrap z-50"
                >
                  {item.name}
                  <div
                    class="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-950"
                  ></div>
                </div>
              {/if}
            </a>
          {/each}
        </nav>
      </div>

      <!-- Logout Button -->
      <div
        class="p-3 border-t border-sage-200/20 transition-all duration-150 {isCollapsed
          ? 'lg:flex lg:justify-center'
          : ''}"
      >
        <button
          type="button"
          onclick={() => appState.logout()}
          class="relative group flex items-center justify-center transition-colors duration-150 cursor-pointer border border-transparent bg-transparent text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 hover:border-rose-100/30
						{isCollapsed
            ? 'lg:w-10 lg:h-10 lg:rounded-lg lg:p-0 w-full gap-2.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold'
            : 'w-full gap-2.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold'}"
        >
          <LogOut class="w-5 h-5 shrink-0" />
          <span
            class="transition-all duration-150 truncate whitespace-nowrap {isCollapsed
              ? 'lg:opacity-0 lg:w-0 lg:pointer-events-none lg:absolute lg:-z-50'
              : 'opacity-100 w-auto'}"
          >
            Keluar Akun
          </span>

          {#if isCollapsed}
            <div
              class="hidden lg:block absolute left-full ml-3 px-2 py-1 bg-rose-600 text-white text-[11px] font-medium rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150 whitespace-nowrap z-50"
            >
              Keluar Akun
              <div
                class="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-rose-600"
              ></div>
            </div>
          {/if}
        </button>
      </div>
    </aside>

    <!-- Main Workspace -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen">
      <!-- Header -->
      <header
        class="h-16 flex items-center justify-between px-6 bg-surface border-b border-sage-200/30 shadow-xs sticky top-0 z-30 transition-colors"
      >
        <div class="flex items-center gap-3">
          <!-- Mobile menu hamburger -->
          <button
            type="button"
            onclick={() => (sidebarOpen = !sidebarOpen)}
            class="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-base lg:hidden cursor-pointer bg-transparent border-0"
          >
            {#if sidebarOpen}
              <X class="w-4 h-4" />
            {:else}
              <Menu class="w-4 h-4" />
            {/if}
          </button>

          <h2
            class="font-bold text-sm text-slate-800 dark:text-white tracking-tight"
          >
            {activeMenuItem?.name || "Dashboard"}
          </h2>
        </div>

        <div class="flex items-center gap-3">
          <!-- Public Etalase Shortcut -->
          <a
            href="#/etalase"
            target="_blank"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-650 hover:text-slate-900 bg-white dark:bg-base hover:bg-sage-50 border border-sage-200/50 rounded-lg shadow-sm font-semibold transition-colors duration-150"
          >
            <span>Lihat Etalase Publik</span>
            <span class="text-slate-400 font-normal">&rarr;</span>
          </a>

          <!-- Theme Switcher -->
          <button
            type="button"
            onclick={() => appState.toggleTheme()}
            class="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white bg-white dark:bg-base hover:bg-sage-50 border border-sage-200/50 cursor-pointer transition-colors"
            title="Ganti Tema"
          >
            {#if appState.theme === "light"}
              <Moon class="w-4 h-4" />
            {:else}
              <Sun class="w-4 h-4" />
            {/if}
          </button>
        </div>
      </header>

      <!-- Content view -->
      <main class="flex-1 p-4 overflow-y-auto w-full">
        {#if parsedRoute.name === "dashboard"}
          <Dashboard />
        {:else if parsedRoute.name === "pos"}
          <Pos />
        {:else if parsedRoute.name === "inventory"}
          <Inventory />
        {:else if parsedRoute.name === "sales"}
          <Sales />
        {:else if parsedRoute.name === "hpp"}
          <Hpp />
        {:else if parsedRoute.name === "settings"}
          <Settings />
        {:else}
          <Dashboard />
        {/if}
      </main>
    </div>
  </div>
{/if}
