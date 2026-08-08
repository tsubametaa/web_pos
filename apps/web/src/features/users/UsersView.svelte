<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "../../core/api";
  import { toast } from "../../lib/utils/toast.svelte";
  import { appState } from "../../core/state.svelte";
  import Skeleton from "../../components/ui/Skeleton.svelte";
  import { activeStore } from "../../core/activeStore.svelte";

  import UsersHeader from "./components/UsersHeader.svelte";
  import UsersTable from "./components/UsersTable.svelte";
  import AddUserModal from "./components/AddUserModal.svelte";
  import EditUserModal from "./components/EditUserModal.svelte";

  let loading = $state(true);
  let usersList = $state<any[]>([]);
  let showAddModal = $state(false);
  let showEditModal = $state(false);
  let isSubmitting = $state(false);

  // Add Form State
  let email = $state("");
  let password = $state("");
  let businessName = $state("");
  let errorMsg = $state("");

  // Edit Form State
  let editingUser = $state<any | null>(null);
  let editBusinessName = $state("");
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

  function openAddModal() {
    email = "";
    password = "";
    businessName = appState.user?.businessName || "";
    errorMsg = "";
    showAddModal = true;
  }

  function closeAddModal() {
    showAddModal = false;
  }

  function openEditModal(u: any) {
    editingUser = u;
    editBusinessName = u.businessName || "";
    editNewPassword = "";
    errorMsg = "";
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
    editingUser = null;
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
        storeId: activeStore.currentStore?.id || undefined,
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
        password: editNewPassword.trim() || undefined,
      });

      if (res.success) {
        toast.success("Pengaturan akun staff berhasil diperbarui!");
        closeEditModal();
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
      `Apakah Anda yakin ingin menghapus akun (${userEmail})? Pengguna ini tidak akan bisa login lagi.`,
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
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Header Banner Skeleton -->
    <div class="p-6 bg-base/90 dark:bg-surface/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="space-y-2 w-full max-w-md">
        <Skeleton class="h-6 w-48" />
        <Skeleton class="h-4 w-full" />
      </div>
      <Skeleton class="h-10 w-36" />
    </div>

    <!-- Table Skeleton -->
    <div class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
      <Skeleton class="h-10 w-full" />
      {#each Array(5) as _}
        <Skeleton class="h-12 w-full" />
      {/each}
    </div>
  </div>
{:else}
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Header Banner -->
    <UsersHeader onOpenAddModal={openAddModal} />

    <!-- Table Container -->
    <UsersTable
      {usersList}
      currentUserId={appState.user?.id}
      onEditUser={openEditModal}
      onDeleteUser={handleDeleteUser}
    />
  </div>
{/if}

<!-- Add User Modal -->
<AddUserModal
  show={showAddModal}
  {isSubmitting}
  {errorMsg}
  bind:email
  bind:password
  bind:businessName
  onClose={closeAddModal}
  onSubmit={handleAddUser}
/>

<!-- Edit User Modal -->
<EditUserModal
  show={showEditModal}
  {editingUser}
  {isSubmitting}
  {errorMsg}
  bind:editBusinessName
  bind:editNewPassword
  onClose={closeEditModal}
  onSubmit={handleEditUser}
/>
