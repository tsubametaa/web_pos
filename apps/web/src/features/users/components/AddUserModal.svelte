<script lang="ts">
  import Button from "../../../components/ui/Button.svelte";
  import Input from "../../../components/ui/Input.svelte";
  import { UserPlus, ShieldAlert, Info, X } from "lucide-svelte";

  interface Props {
    show: boolean;
    isSubmitting: boolean;
    errorMsg: string;
    email: string;
    password: string;
    businessName: string;
    onClose: () => void;
    onSubmit: (e: SubmitEvent) => void;
  }

  let {
    show,
    isSubmitting,
    errorMsg,
    email = $bindable(),
    password = $bindable(),
    businessName = $bindable(),
    onClose,
    onSubmit,
  }: Props = $props();
</script>

{#if show}
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
      class="relative w-full max-w-md bg-base dark:bg-surface border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-ink select-none"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Modal Header -->
      <div
        class="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/60 dark:border-slate-800/60 bg-base/80 dark:bg-surface/80"
      >
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-accent-soft text-accent shrink-0">
            <UserPlus class="w-5 h-5" />
          </div>
          <div>
            <h2
              class="font-black text-slate-900 dark:text-white tracking-tight"
            >
              Tambah Admin Biasa (Staff)
            </h2>
            <p
              class="text-xs text-slate-500 dark:text-slate-400 font-medium"
            >
              Buat akun staff baru untuk kasir & inventori
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

        <!-- Role Explanation Banner -->
        <div
          class="flex items-start gap-2.5 p-3 bg-accent-soft border border-accent/20 rounded-xl text-xs text-accent-soft-text font-medium"
        >
          <Info class="w-4 h-4 shrink-0 mt-0.5 text-accent" />
          <span>
            <strong>Admin Biasa</strong> dapat mengoperasikan Kasir POS, menambah
            & mengedit produk inventori, serta melihat riwayat penjualan (tanpa akses
            statistik profit & manajemen user).
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
            Simpan Akun
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}
