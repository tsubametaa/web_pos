<script lang="ts">
  import { UserPlus, UserRoundKey } from "lucide-svelte";

  interface Props {
    onOpenAddModal: () => void;
  }

  let { onOpenAddModal }: Props = $props();
</script>

<div
  class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-base/90 dark:bg-surface/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs"
>
  <div class="space-y-1">
    <div class="flex items-center gap-2.5">
      <div class="p-2 rounded-xl bg-accent-soft text-accent">
        <UserRoundKey class="w-5 h-5" />
      </div>
      <h1
        class="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight"
      >
        Manajemen User & Staff
      </h1>
    </div>
    <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
      Kelola hak akses akun Admin Biasa (Kasir & Staff) yang dapat mengoperasikan POS Kasir & Inventori.
    </p>
  </div>

  <button
    type="button"
    onclick={onOpenAddModal}
    class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all cursor-pointer shrink-0 self-start sm:self-auto"
  >
    <UserPlus class="w-4 h-4" />
    <span>Tambah Admin Biasa</span>
  </button>
</div>
