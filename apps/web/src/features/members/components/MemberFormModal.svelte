<script lang="ts">
  import { api } from "../../../core/api";
  import { toast } from "../../../lib/utils/toast.svelte";
  import Button from "../../../components/ui/Button.svelte";
  import Input from "../../../components/ui/Input.svelte";
  import { UserPlus, Pencil, X, ShieldAlert, User } from "lucide-svelte";
  import type { UIMember } from "../../../types";

  interface Props {
    show: boolean;
    member?: UIMember | null;
    onclose: () => void;
    onsuccess: () => void;
  }

  let { show, member = null, onclose, onsuccess }: Props = $props();

  let name = $state("");
  let phone = $state("");
  let email = $state("");
  let address = $state("");
  let notes = $state("");
  let isActive = $state(true);
  let isSubmitting = $state(false);
  let errorMsg = $state("");

  $effect(() => {
    if (show) {
      if (member) {
        name = member.name || "";
        phone = member.phone || "";
        email = member.email || "";
        address = member.address || "";
        notes = member.notes || "";
        isActive = member.isActive ?? true;
      } else {
        name = "";
        phone = "";
        email = "";
        address = "";
        notes = "";
        isActive = true;
      }
      errorMsg = "";
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      errorMsg = "Nama dan nomor telepon wajib diisi.";
      return;
    }

    isSubmitting = true;
    errorMsg = "";

    try {
      if (member) {
        const res = await api.put(`/members/${member.id}`, {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
          isActive,
        });
        if (res.success) {
          toast.success("Data member berhasil diperbarui!");
          onsuccess();
        } else {
          throw new Error(res.error || "Gagal mengubah data member.");
        }
      } else {
        const res = await api.post("/members", {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        if (res.success) {
          toast.success("Member baru berhasil ditambahkan!");
          onsuccess();
        } else {
          throw new Error(res.error || "Gagal menambah member.");
        }
      }
    } catch (err: any) {
      errorMsg = err.message || "Terjadi kesalahan.";
      toast.error(errorMsg);
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if show}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      class="relative w-full max-w-md bg-base dark:bg-surface border border-border-theme rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-ink select-none"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-6 py-4.5 border-b border-border-theme bg-base/80 dark:bg-surface/80"
      >
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-accent-soft text-accent shrink-0">
            {#if member}
              <Pencil class="w-5 h-5" />
            {:else}
              <UserPlus class="w-5 h-5" />
            {/if}
          </div>
          <div>
            <h2 class="text-base font-black text-h-text tracking-tight">
              {member ? "Edit Member" : "Tambah Member Baru"}
            </h2>
            <p class="text-xs text-ink-muted font-medium">
              {member
                ? "Perbarui informasi identitas member"
                : "Daftarkan pelanggan baru dengan no HP unik"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onclick={onclose}
          class="p-2 rounded-xl text-ink-muted hover:text-h-text hover:bg-accent-soft cursor-pointer transition-colors"
          aria-label="Tutup modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form
        onsubmit={handleSubmit}
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

        <Input
          label="Nama Lengkap"
          id="member-name"
          bind:value={name}
          placeholder="Contoh: Budi Santoso"
          required
          disabled={isSubmitting}
        />

        <Input
          label="Nomor Telepon (WhatsApp)"
          id="member-phone"
          bind:value={phone}
          placeholder="Contoh: 08123456789"
          required
          disabled={isSubmitting}
        />

        <Input
          type="email"
          label="Email (Opsional)"
          id="member-email"
          bind:value={email}
          placeholder="budi@email.com"
          disabled={isSubmitting}
        />

        <div>
          <label
            class="block text-xs font-bold text-ink-muted mb-1"
            for="member-address"
          >
            Alamat Pengiriman / Usaha (Opsional)
          </label>
          <textarea
            id="member-address"
            bind:value={address}
            placeholder="Alamat lengkap penerima / lokasi usaha..."
            rows="2"
            disabled={isSubmitting}
            class="w-full px-3.5 py-2.5 bg-surface border border-border-theme focus:border-accent rounded-xl text-xs font-medium text-h-text placeholder-ink-muted focus:outline-none transition-all shadow-2xs resize-none"
          ></textarea>
        </div>

        <div>
          <label
            class="block text-xs font-bold text-ink-muted mb-1"
            for="member-notes"
          >
            Catatan Pelanggan (Opsional)
          </label>
          <textarea
            id="member-notes"
            bind:value={notes}
            placeholder="Catatan khusus, lokasi usaha, atau preferensi deal..."
            rows="2"
            disabled={isSubmitting}
            class="w-full px-3.5 py-2.5 bg-surface border border-border-theme focus:border-accent rounded-xl text-xs font-medium text-h-text placeholder-ink-muted focus:outline-none transition-all shadow-2xs resize-none"
          ></textarea>
        </div>

        {#if member}
          <div class="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="member-status"
              bind:checked={isActive}
              class="w-4 h-4 rounded border-border-theme text-accent focus:ring-accent accent-emerald-600 cursor-pointer"
            />
            <label
              for="member-status"
              class="text-xs font-bold text-h-text cursor-pointer select-none"
            >
              Status Member Aktif
            </label>
          </div>
        {/if}

        <!-- Footer -->
        <div
          class="flex items-center justify-end gap-3 pt-4 border-t border-border-theme"
        >
          <button
            type="button"
            onclick={onclose}
            class="px-4 py-2.5 text-xs font-bold text-ink-muted hover:text-h-text rounded-xl border border-border-theme hover:bg-accent-soft transition-colors cursor-pointer"
          >
            Batal
          </button>

          <Button
            type="submit"
            loading={isSubmitting}
            class="px-5 py-2.5 font-bold text-white bg-accent hover:bg-accent-hover rounded-xl shadow-xs"
          >
            {member ? "Simpan Perubahan" : "Tambah Member"}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}
