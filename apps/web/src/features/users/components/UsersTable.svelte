<script lang="ts">
  import { formatDate } from "../../../lib/utils/date";
  import { Shield, CheckCircle2, Pencil, Trash2 } from "lucide-svelte";

  interface Props {
    usersList: any[];
    currentUserId?: string;
    onEditUser: (u: any) => void;
    onDeleteUser: (userId: string, userEmail: string) => void;
  }

  let { usersList, currentUserId, onEditUser, onDeleteUser }: Props = $props();
</script>

<div
  class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs"
>
  <div class="overflow-x-auto">
    <table class="w-full text-xs">
      <thead>
        <tr
          class="border-b border-slate-200/60 dark:border-slate-800/60 bg-base/50 dark:bg-surface/30"
        >
          <th
            class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            Email Akun
          </th>
          <th
            class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            Nama Staff / Bisnis
          </th>
          <th
            class="text-center px-5 py-3.5 font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            Peran (Role)
          </th>
          <th
            class="text-left px-5 py-3.5 font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell"
          >
            Tanggal Dibuat
          </th>
          <th
            class="text-center px-5 py-3.5 font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            Aksi
          </th>
        </tr>
      </thead>
      <tbody
        class="divide-y divide-slate-200/40 dark:divide-slate-800/40"
      >
        {#each usersList as u (u.id)}
          <tr class="hover:bg-accent-soft/30 transition-colors">
            <!-- Email -->
            <td
              class="px-5 py-3.5 font-medium font-mono text-slate-800 dark:text-slate-100"
            >
              {u.email}
            </td>

            <!-- Business / Staff Name -->
            <td
              class="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-200"
            >
              {u.businessName || "-"}
            </td>

            <!-- Role Badge -->
            <td class="px-5 py-3.5 text-center">
              {#if u.role === "super_admin"}
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                >
                  <Shield
                    class="w-3 h-3 text-purple-600 dark:text-purple-400"
                  />
                  Super Admin
                </span>
              {:else}
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-accent-soft text-accent border border-accent/20"
                >
                  <CheckCircle2 class="w-3 h-3 text-accent" />
                  Admin Biasa
                </span>
              {/if}
            </td>

            <!-- Date -->
            <td
              class="px-5 py-3.5 hidden md:table-cell text-slate-500 dark:text-slate-400 font-medium"
            >
              {formatDate(u.createdAt)}
            </td>

            <!-- Action -->
            <td class="px-5 py-3.5 text-center">
              {#if u.id !== currentUserId && u.role !== "super_admin"}
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onclick={() => onEditUser(u)}
                    class="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-accent-soft transition-colors cursor-pointer"
                    title="Edit Pengaturan Staff & Brand"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onclick={() => onDeleteUser(u.id, u.email)}
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Hapus User"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              {:else}
                <span
                  class="text-[10px] font-semibold text-slate-400 italic"
                  >Utama</span
                >
              {/if}
            </td>
          </tr>
        {:else}
          <tr>
            <td
              colspan="6"
              class="py-12 text-center text-slate-400 font-semibold"
            >
              Belum ada pengguna tambahan.
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
