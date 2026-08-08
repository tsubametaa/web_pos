<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../../core/api';
  import { toast } from '../../lib/utils/toast.svelte';
  import { formatDate } from '../../lib/utils/date';
  import Skeleton from '../../components/ui/Skeleton.svelte';
  import MemberFormModal from './components/MemberFormModal.svelte';
  import MemberPricesModal from './components/MemberPricesModal.svelte';
  import {
    Users,
    UserPlus,
    Search,
    X,
    Pencil,
    Trash2,
    Tag,
    Phone,
    CheckCircle2,
    XCircle,
    MapPin,
  } from 'lucide-svelte';
  import type { UIMember } from '../../types';

  let loading = $state(true);
  let membersList = $state<UIMember[]>([]);
  let searchQuery = $state('');

  // Modals state
  let showFormModal = $state(false);
  let showPricesModal = $state(false);
  let selectedMember = $state<UIMember | null>(null);

  async function loadMembers() {
    try {
      const res = await api.get(`/members${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
      if (res.success && Array.isArray(res.members)) {
        membersList = res.members;
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memuat daftar member.');
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadMembers();
  });

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      loadMembers();
    }
  }

  function clearSearch() {
    searchQuery = '';
    loadMembers();
  }

  function openAddModal() {
    selectedMember = null;
    showFormModal = true;
  }

  function openEditModal(m: UIMember) {
    selectedMember = m;
    showFormModal = true;
  }

  function openPricesModal(m: UIMember) {
    selectedMember = m;
    showPricesModal = true;
  }

  async function handleDeleteMember(m: UIMember) {
    const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus member (${m.name} - ${m.phone})? Semua kesepakatan harga khusus member ini akan ikut terhapus.`);
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/members/${m.id}`);
      if (res.success) {
        toast.success(`Member ${m.name} berhasil dihapus.`);
        await loadMembers();
      } else {
        throw new Error(res.error || 'Gagal menghapus member.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat menghapus member.');
    }
  }
</script>

{#if loading}
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Header Banner Skeleton -->
    <div class="p-6 bg-surface border border-border-theme rounded-2xl flex justify-between items-center gap-4">
      <div class="space-y-2 w-full max-w-md">
        <Skeleton class="h-6 w-48" />
        <Skeleton class="h-4 w-full" />
      </div>
      <Skeleton class="h-10 w-36" />
    </div>

    <!-- Table Skeleton -->
    <div class="bg-surface border border-border-theme rounded-2xl p-4 space-y-3">
      <Skeleton class="h-10 w-full" />
      {#each Array(5) as _}
        <Skeleton class="h-12 w-full" />
      {/each}
    </div>
  </div>
{:else}
  <div class="flex flex-col gap-6 text-ink w-full pb-8 select-none">
    <!-- Header Banner -->
    <div
      class="p-5 sm:p-6 bg-surface border border-border-theme rounded-2xl shadow-2xs"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-accent-soft text-accent">
            <Users class="w-5 h-5" />
          </div>
          <h1 class="text-lg sm:text-xl font-black text-h-text tracking-tight">
            Manajemen Member & Harga Khusus
          </h1>
        </div>
        <p class="text-xs text-ink-muted font-medium">
          Kelola database pelanggan member (by No HP) dan atur kesepakatan harga khusus per produk (by SKU).
        </p>
      </div>
    </div>

    <!-- Search & Action Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between w-full">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
        <input
          type="text"
          bind:value={searchQuery}
          onkeydown={handleSearchKeydown}
          placeholder="Cari nama member, nomor HP, atau email..."
          class="w-full pl-10 pr-9 py-2.5 bg-surface border border-border-theme focus:border-accent rounded-xl text-xs font-medium text-h-text placeholder-ink-muted focus:outline-none transition-all shadow-2xs"
        />
        {#if searchQuery}
          <button
            type="button"
            onclick={clearSearch}
            class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-ink-muted hover:text-h-text cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        {/if}
      </div>

      <div class="flex items-center gap-3 justify-between sm:justify-end">
        <span class="text-xs font-bold text-ink-muted bg-surface border border-border-theme px-3.5 py-2.5 rounded-xl shadow-2xs">
          Total <strong class="text-h-text font-black">{membersList.length}</strong> Member Terdaftar
        </span>

        <button
          type="button"
          onclick={openAddModal}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
        >
          <UserPlus class="w-4 h-4" />
          <span>+ Tambah Member Baru</span>
        </button>
      </div>
    </div>

    <!-- Members Table -->
    <div class="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-2xs">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-border-theme bg-base/50">
              <th class="text-left px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider">
                Identitas Member
              </th>
              <th class="text-left px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider">
                Nomor HP (WhatsApp)
              </th>
              <th class="text-center px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider">
                Status
              </th>
              <th class="text-center px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider">
                Deal Harga Khusus
              </th>
              <th class="text-left px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider hidden md:table-cell">
                Terdaftar
              </th>
              <th class="text-center px-5 py-3.5 font-extrabold text-ink-muted uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-theme">
            {#each membersList as m (m.id)}
              <tr class="hover:bg-accent-soft/40 transition-colors">
                <!-- Member Name & Email -->
                <td class="px-5 py-3.5">
                  <div class="flex flex-col">
                    <span class="font-bold text-h-text text-xs">
                      {m.name}
                    </span>
                    {#if m.email}
                      <span class="text-[11px] text-ink-muted">
                        {m.email}
                      </span>
                    {/if}
                    {#if m.address}
                      <span class="text-[11px] text-accent font-medium flex items-center gap-1 mt-0.5 truncate max-w-xs">
                        <MapPin class="w-3 h-3 text-accent shrink-0" />
                        <span>{m.address}</span>
                      </span>
                    {/if}
                    {#if m.notes}
                      <span class="text-[10px] text-ink-muted italic mt-0.5 truncate max-w-xs">
                        "{m.notes}"
                      </span>
                    {/if}
                  </div>
                </td>

                <!-- Phone -->
                <td class="px-5 py-3.5 font-mono">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/20">
                    <Phone class="w-3 h-3 text-emerald-500" />
                    {m.phone}
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="px-5 py-3.5 text-center">
                  {#if m.isActive}
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <CheckCircle2 class="w-3 h-3 text-emerald-500" />
                      Aktif
                    </span>
                  {:else}
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      <XCircle class="w-3 h-3 text-rose-500" />
                      Nonaktif
                    </span>
                  {/if}
                </td>

                <!-- Custom Prices Deal Count & Button -->
                <td class="px-5 py-3.5 text-center">
                  <button
                    type="button"
                    onclick={() => openPricesModal(m)}
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-soft hover:bg-accent-soft/80 border border-accent/30 text-accent font-bold text-xs cursor-pointer transition-all shadow-2xs"
                  >
                    <Tag class="w-3.5 h-3.5 text-accent" />
                    <span>Kelola Harga</span>
                  </button>
                </td>

                <!-- Date Created -->
                <td class="px-5 py-3.5 hidden md:table-cell font-medium text-ink-muted">
                  {m.createdAt ? formatDate(m.createdAt) : '-'}
                </td>

                <!-- Actions -->
                <td class="px-5 py-3.5 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onclick={() => openEditModal(m)}
                      class="p-1.5 rounded-lg text-ink-muted hover:text-accent hover:bg-accent-soft transition-colors cursor-pointer"
                      title="Edit Data Member"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onclick={() => handleDeleteMember(m)}
                      class="p-1.5 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Hapus Member"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="6" class="py-16 text-center text-ink-muted font-semibold">
                  {searchQuery ? `Tidak ada member cocok dengan "${searchQuery}"` : 'Belum ada member terdaftar.'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
{/if}

<!-- Modals -->
<MemberFormModal
  show={showFormModal}
  member={selectedMember}
  onclose={() => (showFormModal = false)}
  onsuccess={() => {
    showFormModal = false;
    loadMembers();
  }}
/>

<MemberPricesModal
  show={showPricesModal}
  member={selectedMember}
  onclose={() => (showPricesModal = false)}
  onupdate={() => loadMembers()}
/>
