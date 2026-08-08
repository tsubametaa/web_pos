<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "./core/state.svelte";
  import Toaster from "./components/ui/Toaster.svelte";
  import Spinner from "./components/ui/Spinner.svelte";
  import Sidebar from "./components/layout/Sidebar.svelte";
  import Navbar from "./components/layout/Navbar.svelte";

  // Views & Pages
  import Login from "./pages/Login.svelte";
  import Dashboard from "./pages/Dashboard.svelte";
  import Pos from "./pages/Pos.svelte";
  import Inventory from "./pages/Inventory.svelte";
  import Sales from "./pages/Sales.svelte";
  import Hpp from "./pages/Hpp.svelte";
  import Settings from "./pages/Settings.svelte";
  import Users from "./pages/Users.svelte";
  import Members from "./pages/Members.svelte";
  import Etalase from "./pages/Etalase.svelte";
  import Invoice from "./pages/Invoice.svelte";
  import SuratJalan from "./pages/SuratJalan.svelte";
  import CombinedPrint from "./pages/CombinedPrint.svelte";

  // Icons
  import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    History,
    TrendingUp,
    Settings as SettingsIcon,
    Users as UsersIcon,
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
    if (hash.startsWith("#/surat-jalan/")) {
      const id = hash.replace("#/surat-jalan/", "");
      return { name: "surat-jalan", params: { id } };
    }
    if (hash.startsWith("#/print-all/")) {
      const id = hash.replace("#/print-all/", "");
      return { name: "print-all", params: { id } };
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
    if (hash === "#/users") {
      return { name: "users", params: {} };
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
      parsedRoute.name !== "etalase",
  );

  const isShellHidden = $derived(
    parsedRoute.name === "etalase" || parsedRoute.name === "invoice" || parsedRoute.name === "surat-jalan" || parsedRoute.name === "print-all",
  );

  // Handle routing auth guard
  $effect(() => {
    if (appState.initialized) {
      if (requiresAuth && !appState.user) {
        window.location.hash = "#/login";
      } else if (appState.user && parsedRoute.name === "login") {
        window.location.hash = "#/dashboard";
      } else if (parsedRoute.name === "users" && appState.user?.role !== "super_admin") {
        window.location.hash = "#/dashboard";
      } else if (parsedRoute.name === "hpp" && appState.user?.role !== "super_admin") {
        window.location.hash = "#/dashboard";
      }
    }
  });

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
    localStorage.setItem("sidebar_collapsed", String(isCollapsed));
  }

  const menuItems = $derived.by(() => {
    const isSuperAdmin = appState.user?.role === "super_admin";
    const items = [
      {
        name: "Dashboard",
        path: "#/dashboard",
        key: "dashboard",
        icon: LayoutDashboard,
      },
      { name: "POS Kasir", path: "#/pos", key: "pos", icon: ShoppingCart },
      { name: "Inventori", path: "#/inventory", key: "inventory", icon: Package },
      { name: "Member & Harga", path: "#/members", key: "members", icon: UsersIcon },
      { name: "Riwayat Transaksi", path: "#/sales", key: "sales", icon: History },
    ];

    if (isSuperAdmin) {
      items.push({
        name: "HPP & Margin",
        path: "#/hpp",
        key: "hpp",
        icon: TrendingUp,
      });
    }

    items.push({
      name: "Pengaturan",
      path: "#/settings",
      key: "settings",
      icon: SettingsIcon,
    });

    if (isSuperAdmin) {
      items.push({
        name: "Manajemen User",
        path: "#/users",
        key: "users",
        icon: UsersIcon,
      });
    }

    return items;
  });

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
  <!-- Render public or fullscreen layouts (Etalase, Invoice, Surat Jalan) directly -->
  {#if parsedRoute.name === "invoice"}
    <Invoice transactionId={parsedRoute.params.id ?? ""} />
  {:else if parsedRoute.name === "surat-jalan"}
    <SuratJalan transactionId={parsedRoute.params.id ?? ""} />
  {:else if parsedRoute.name === "print-all"}
    <CombinedPrint transactionId={parsedRoute.params.id ?? ""} />
  {:else}
    <Etalase productId={parsedRoute.params.id} />
  {/if}
{:else if parsedRoute.name === "login"}
  <Login />
{:else}
  <!-- Admin Panel Layout Shell -->
  <div
    class="min-h-screen flex bg-base text-ink relative transition-colors duration-200"
  >
    <!-- Redesigned Sidebar -->
    <Sidebar
      currentRouteKey={parsedRoute.name}
      bind:sidebarOpen
      {isCollapsed}
      onToggleCollapse={toggleCollapse}
      onCloseMobile={() => (sidebarOpen = false)}
    />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen">
      <!-- Redesigned Navbar Header -->
      <Navbar
        {activeMenuItem}
        {sidebarOpen}
        onToggleSidebar={() => (sidebarOpen = !sidebarOpen)}
      />

      <!-- Page View Content -->
      <main class="flex-1 p-4 sm:p-6 overflow-y-auto w-full">
        {#if parsedRoute.name === "dashboard"}
          <Dashboard />
        {:else if parsedRoute.name === "pos"}
          <Pos />
        {:else if parsedRoute.name === "inventory"}
          <Inventory />
        {:else if parsedRoute.name === "members"}
          <Members />
        {:else if parsedRoute.name === "sales"}
          <Sales />
        {:else if parsedRoute.name === "hpp"}
          <Hpp />
        {:else if parsedRoute.name === "settings"}
          <Settings />
        {:else if parsedRoute.name === "users"}
          <Users />
        {:else}
          <Dashboard />
        {/if}
      </main>
    </div>
  </div>
{/if}
