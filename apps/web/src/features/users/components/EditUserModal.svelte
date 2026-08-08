<script lang="ts">
  import Button from "../../../components/ui/Button.svelte";
  import Input from "../../../components/ui/Input.svelte";
  import { Pencil, ShieldAlert, X } from "lucide-svelte";

  interface Props {
    show: boolean;
    editingUser: any;
    isSubmitting: boolean;
    errorMsg: string;
    editBusinessName: string;
    editNewPassword: string;
    onClose: () => void;
    onSubmit: (e: SubmitEvent) => void;
  }

  let {
    show,
    editingUser,
    isSubmitting,
    errorMsg,
    editBusinessName = $bindable(),
    editNewPassword = $bindable(),
    onClose,
    onSubmit,
  }: Props = $props();
</script>

{#if show && editingUser}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      class="relative w-full max-w-md bg-base dark:bg-surface border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-ink select-none"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/60 dark:border-slate-800/60 bg-base/80 dark:bg-surface/80"
      >
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-accent-soft text-accent shrink-0">
            <Pencil class="w-5 h-5" />
          </div>
          <div>
            <h2
              class="font-black text-slate-900 dark:text-white tracking-tight"
            >
              Edit Pengaturan Staff
            </h2>
            <p
              class="text-xs text-slate-500 dark:text-slate-400 font-medium"
            >
              Ubah nama staff & password ({editingUser.email})
            </p>
          </div>
        </div>

        <button
          type="button"
          onclick={onClose}
          class="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          aria-label="Tutup modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body Form -->
      <form
        onsubmit={onSubmit}
        class="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-none"
      >
        {#if errorMsg}
          <div
            class="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-bold"
          >
            <ShieldAlert class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        {/if}

        <div>
          <label
            class="block text-xs font-bold text-slate-500 mb-1"
            for="edit-email-readonly">Email Akun (Tetap)</label
          >
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

        <Input
          type="password"
          label="Password Baru (Opsional)"
          id="edit-password"
          bind:value={editNewPassword}
          placeholder="Biarkan kosong jika tidak ingin mengubah password"
          disabled={isSubmitting}
        />

        <!-- Action Buttons Footer -->
        <div
          class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60"
        >
          <button
            type="button"
            onclick={onClose}
            class="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <Button
            type="submit"
            loading={isSubmitting}
            class="px-5 py-2.5 font-bold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-xs"
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}
