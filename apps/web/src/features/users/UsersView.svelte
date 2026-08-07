<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "../../core/api";
  import { toast } from "../../lib/utils/toast.svelte";
  import { formatDate } from "../../lib/utils/date";
  import { appState } from "../../core/state.svelte";
  import Button from "../../components/ui/Button.svelte";
  import Input from "../../components/ui/Input.svelte";
  import Spinner from "../../components/ui/Spinner.svelte";
  import { activeStore } from "../../core/activeStore.svelte";
  import {
    Users as UsersIcon,
    UserPlus,
    Shield,
    ShieldAlert,
    Trash2,
    CheckCircle2,
    Info,
    X,
    Building2,
    Pencil,
  } from "lucide-svelte";

  import CustomSelect from "../../components/ui/CustomSelect.svelte";

  let loading = $state(true);
  let usersList = $state<any[]>([]);
  let showAddModal = $state(false);
  let showEditModal = $state(false);
  let isSubmitting = $state(false);

  // Derived store options for CustomSelect
  const storeOptions = $derived(
    activeStore.stores.map((s) => ({
      value: s.id,
      label: s.name,
      icon: Building2,
      subtitle: s.address || 'Brand Unit'
    }))
  );

  // Add Form State
  let email = $state("");
  let password = $state("");
  let businessName = $state("");
  let selectedStoreId = $state("");
  let errorMsg = $state("");

  // Edit Form State
  let editingUser = $state<any | null>(null);
  let editBusinessName = $state("");
  let editSelectedStoreId = $state("");
  let editNewPassword = $state("");

  async function loadUsers() {
    try {
      await activeStore.loadStores();
      const res = await api.get("/users");
      if (res.success) {
        usersList = res.users;
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat daftar pengguna.");
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadUsers();
  });

  function openModal() {
    email = "";
    password = "";
    businessName = appState.user?.businessName || "";
    selectedStoreId = activeStore.currentStore?.id || "";
    errorMsg = "";
    showAddModal = true;
  }

  function openEditModal(u: any) {
    editingUser = u;
    editBusinessName = u.businessName || "";
    editSelectedStoreId = u.storeId || "";
    editNewPassword = "";
    errorMsg = "";
    showEditModal = true;
  }

  async function handleAddUser(e: SubmitEvent) {
    e.preventDefault();
    if (!email || !password) {
      errorMsg = "Email dan password wajib diisi.";
      return;
    }

    isSubmitting = true;
    errorMsg = "";

    try {
      const res = await api.post("/users", {
        email,
        password,
        businessName,
        storeId: selectedStoreId || undefined,
      });

      if (res.success) {
        toast.success("Admin Biasa berhasil ditambahkan!");
        showAddModal = false;
        await loadUsers();
      } else {
        throw new Error(res.error || "Gagal menambah user.");
      }
    } catch (err: any) {
      errorMsg = err.message || "Terjadi kesalahan.";
      toast.error(errorMsg);
    } finally {
      isSubmitting = false;
    }
  }

  async function handleEditUser(e: SubmitEvent) {
    e.preventDefault();
    if (!editingUser) return;

    isSubmitting = true;
    errorMsg = "";

    try {
      const res = await api.put(`/users/${editingUser.id}`, {
        businessName: editBusinessName.trim(),
        storeId: editSelectedStoreId || null,
        password: editNewPassword.trim() || undefined
      });

      if (res.success) {
        toast.success("Pengaturan akun staff berhasil diperbarui!");
        showEditModal = false;
        editingUser = null;
        await loadUsers();
      } else {
        throw new Error(res.error || "Gagal mengubah user.");
      }
    } catch (err: any) {
      errorMsg = err.message || "Terjadi kesalahan.";
      toast.error(errorMsg);
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDeleteUser(userId: string, userEmail: string) {
    const confirmDelete = confirm(
      `Apakah Anda yakin ingin menghapus akun (${userEmail})? Pengguna ini tidak akan bisa login lagi.`
    );
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/users/${userId}`);
      if (res.success) {
        toast.success("User berhasil dihapus!");
        await loadUsers();
      } else {
        throw new Error(res.error || "Gagal menghapus user.");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menghapus user.");
    }
  }
</script>

{#if loading}
  <div class="h-96 flex flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">
      Memuat Daftar Pengguna...
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
            <UsersIcon class="w-5 h-5" />
          </div>
          <h1 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Manajemen User & Staff
          </h1>
        </div>
        <p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
          Kelola hak akses akun Admin Biasa (Kasir & Staff) yang dapat mengoperasikan POS Kasir & Inventori.
        </p>
      </div>

      <button
        type="button"
        onclick={openModal}
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all cursor-pointer shrink-0 self-start sm:self-auto"
      >
        <UserPlus class="w-4 h-4" />
        <span>Tambah Admin Biasa</span>
      </button>
    </div>

    <!-- Table Container -->
    <div
      class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl overflow-hidden shadow-2xs"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr
              class="border-b border-slate-200/60 dark:border-emerald-950/60 bg-base/50 dark:bg-surface/30"
            >
              <th
                class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
              >
                Email Akun
              </th>
              <th
                class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
              >
                Nama Staff / Bisnis
              </th>
              <th
                class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
              >
                Penugasan Brand
              </th>
              <th
                class="text-center px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
              >
                Peran (Role)
              </th>
              <th
                class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider hidden md:table-cell"
              >
                Tanggal Dibuat
              </th>
              <th
                class="text-center px-5 py-3.5 font-extrabold text-slate-500 dark:text-emerald-500/70 uppercase tracking-wider"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/40 dark:divide-emerald-950/40">
            {#each usersList as u (u.id)}
              <tr class="hover:bg-emerald-500/5 transition-colors">
                <!-- Email -->
                <td class="px-5 py-3.5 font-medium font-mono text-slate-800 dark:text-slate-100">
                  {u.email}
                </td>

                <!-- Business / Staff Name -->
                <td class="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-200">
                  {u.businessName || "-"}
                </td>

                <!-- Brand Assignment -->
                <td class="px-5 py-3.5 font-bold text-emerald-700 dark:text-emerald-300">
                  {#if u.role === "super_admin"}
                    <span class="text-slate-400 font-normal italic">Semua Brand (Utama)</span>
                  {:else if u.storeId}
                    {@const matchedStore = activeStore.stores.find(s => s.id === u.storeId)}
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <Building2 class="w-3.5 h-3.5 text-emerald-600" />
                      {matchedStore?.name || 'Brand #' + u.storeId.slice(0, 5)}
                    </span>
                  {:else}
                    <span class="text-slate-400 font-normal italic">Belum Diatur</span>
                  {/if}
                </td>

                <!-- Role Badge -->
                <td class="px-5 py-3.5 text-center">
                  {#if u.role === "super_admin"}
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                    >
                      <Shield class="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      Super Admin
                    </span>
                  {:else}
                    <span
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                    >
                      <CheckCircle2 class="w-3 h-3 text-emerald-500" />
                      Admin Biasa
                    </span>
                  {/if}
                </td>

                <!-- Date -->
                <td class="px-5 py-3.5 hidden md:table-cell text-slate-500 dark:text-slate-400 font-medium">
                  {formatDate(u.createdAt)}
                </td>

                <!-- Action -->
                <td class="px-5 py-3.5 text-center">
                  {#if u.id !== appState.user?.id && u.role !== "super_admin"}
                    <div class="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onclick={() => openEditModal(u)}
                        class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        title="Edit Pengaturan Staff & Brand"
                      >
                        <Pencil class="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onclick={() => handleDeleteUser(u.id, u.email)}
                        class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Hapus User"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  {:else}
                    <span class="text-[10px] font-semibold text-slate-400 italic">Utama</span>
                  {/if}
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="6" class="py-12 text-center text-slate-400 font-semibold">
                  Belum ada pengguna tambahan.
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
{/if}

<!-- Add User Modal (Matching ProductFormModal design & structure) -->
{#if showAddModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Modal Card Container -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="relative w-full max-w-md bg-base dark:bg-surface border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-ink select-none"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/60 dark:border-emerald-950/60 bg-base/80 dark:bg-surface/80"
      >
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shrink-0">
            <UserPlus class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Tambah Admin Biasa (Staff)
            </h2>
            <p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
              Buat akun staff baru untuk kasir & inventori
            </p>
          </div>
        </div>

        <button
          type="button"
          onclick={() => (showAddModal = false)}
          class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          aria-label="Tutup modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body Form -->
      <form onsubmit={handleAddUser} class="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-none">
        {#if errorMsg}
          <div
            class="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-bold"
          >
            <ShieldAlert class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        {/if}

        <!-- Role Explanation Banner -->
        <div
          class="flex items-start gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium"
        >
          <Info class="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>Admin Biasa</strong> dapat mengoperasikan Kasir POS, menambah & mengedit produk inventori, serta melihat riwayat penjualan (tanpa akses statistik profit & manajemen user).
          </span>
        </div>

        <Input
          type="email"
          label="Email Akun Staff"
          id="add-email"
          bind:value={email}
          placeholder="staff@email.com"
          required
          disabled={isSubmitting}
        />

        <Input
          type="password"
          label="Password Akun"
          id="add-password"
          bind:value={password}
          placeholder="Minimal 6 karakter"
          required
          disabled={isSubmitting}
        />

        <Input
          label="Nama Staff / Label Toko"
          id="add-businessName"
          bind:value={businessName}
          placeholder="Contoh: Kasir Shift Pagi"
          disabled={isSubmitting}
        />

        {#if activeStore.stores.length > 0}
          <div>
            <CustomSelect
              id="add-store-custom"
              label="Penugasan Brand (Store) *"
              bind:value={selectedStoreId}
              options={storeOptions}
              disabled={isSubmitting}
              placeholder="Pilih Brand Toko..."
              icon={Building2}
            />
            <p class="text-[10px] text-slate-400 mt-1">
              Staff ini hanya dapat mengakses data dan mencetak nota dari Brand yang dipilih.
            </p>
          </div>
        {/if}

        <!-- Action Buttons Footer -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-emerald-950/60">
          <button
            type="button"
            onclick={() => (showAddModal = false)}
            class="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200/80 dark:border-emerald-950/80 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <Button type="submit" loading={isSubmitting} class="px-5 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs">
            Simpan Akun
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Edit User Modal -->
{#if showEditModal && editingUser}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      class="relative w-full max-w-md bg-base dark:bg-surface border border-slate-200/80 dark:border-emerald-950/80 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-ink select-none"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/60 dark:border-emerald-950/60 bg-base/80 dark:bg-surface/80"
      >
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shrink-0">
            <Pencil class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Edit Pengaturan Staff & Brand
            </h2>
            <p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium">
              Ubah penugasan brand & nama staff ({editingUser.email})
            </p>
          </div>
        </div>

        <button
          type="button"
          onclick={() => { showEditModal = false; editingUser = null; }}
          class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          aria-label="Tutup modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body Form -->
      <form onsubmit={handleEditUser} class="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-none">
        {#if errorMsg}
          <div
            class="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-bold"
          >
            <ShieldAlert class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        {/if}

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1" for="edit-email-readonly">Email Akun (Tetap)</label>
          <input
            id="edit-email-readonly"
            type="text"
            value={editingUser.email}
            disabled
            class="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-base/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
          />
        </div>

        <Input
          label="Nama Staff / Label Toko"
          id="edit-businessName"
          bind:value={editBusinessName}
          placeholder="Contoh: Kasir Shift Pagi"
          disabled={isSubmitting}
        />

        {#if activeStore.stores.length > 0}
          <div>
            <CustomSelect
              id="edit-store-custom"
              label="Penugasan Brand (Store) *"
              bind:value={editSelectedStoreId}
              options={storeOptions}
              disabled={isSubmitting}
              placeholder="Pilih Brand Toko..."
              icon={Building2}
            />
            <p class="text-[10px] text-slate-400 mt-1">
              Ubah unit brand tempat staff ini ditugaskan melayani transaksi.
            </p>
          </div>
        {/if}

        <Input
          type="password"
          label="Password Baru (Opsional)"
          id="edit-password"
          bind:value={editNewPassword}
          placeholder="Biarkan kosong jika tidak ingin mengubah password"
          disabled={isSubmitting}
        />

        <!-- Action Buttons Footer -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-emerald-950/60">
          <button
            type="button"
            onclick={() => { showEditModal = false; editingUser = null; }}
            class="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200/80 dark:border-emerald-950/80 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <Button type="submit" loading={isSubmitting} class="px-5 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs">
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}
