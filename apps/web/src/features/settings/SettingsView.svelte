<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "../../lib/utils/toast.svelte";
  import Card from "../../components/ui/Card.svelte";
  import Input from "../../components/ui/Input.svelte";
  import Button from "../../components/ui/Button.svelte";
  import { Store, KeyRound } from "lucide-svelte";
  import { api } from "../../core/api";
  import { appState } from "../../core/state.svelte";
  import Spinner from "../../components/ui/Spinner.svelte";

  let loading = $state(true);
  let activeTab = $state<"profile" | "security">("profile");
  let profileSaving = $state(false);
  let securitySaving = $state(false);

  // Settings Form Fields
  let businessName = $state("");
  let businessPhone = $state("");
  let businessAddress = $state("");
  let currencySymbol = $state("Rp");
  let taxRate = $state(0);
  let lowStockThreshold = $state(10);
  let receiptFooter = $state("");

  // Security Form Fields
  let oldPassword = $state("");
  let newPassword = $state("");
  let confirmNewPassword = $state("");

  // Live Preview Computations
  const mockSubtotal = 43000;
  const mockTax = $derived((mockSubtotal * (taxRate || 0)) / 100);
  const mockTotal = $derived(mockSubtotal + mockTax);

  // Password validation
  const hasMinLength = $derived(newPassword.length >= 6);
  const hasLetter = $derived(/[a-zA-Z]/.test(newPassword));
  const hasNumber = $derived(/[0-9]/.test(newPassword));
  const isNewPasswordValid = $derived(hasMinLength && hasLetter && hasNumber);

  async function loadSettings() {
    try {
      const res = await api.get("/settings");
      if (res.success && res.settings) {
        const s = res.settings;
        businessName = s.businessName || "";
        businessPhone = s.businessPhone || "";
        businessAddress = s.businessAddress || "";
        currencySymbol = s.currencySymbol || "Rp";
        taxRate = s.taxRate || 0;
        lowStockThreshold = s.lowStockThreshold ?? 10;
        receiptFooter = s.receiptFooter || "";
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadSettings();
  });

  async function handleUpdateProfile(e: SubmitEvent) {
    e.preventDefault();
    profileSaving = true;
    try {
      const res = await api.put("/settings", {
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim() || undefined,
        businessPhone: businessPhone.trim() || undefined,
        currencySymbol: currencySymbol.trim() || undefined,
        taxRate: Number(taxRate),
        lowStockThreshold: Number(lowStockThreshold),
        receiptFooter: receiptFooter.trim() || undefined,
      });
      if (res.success) {
        toast.success(res.message || "Profil bisnis berhasil diperbarui!");
        await appState.refreshSettings();
      } else {
        throw new Error(res.error || "Gagal menyimpan.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui profil.");
    } finally {
      profileSaving = false;
    }
  }

  async function handleUpdatePassword(e: SubmitEvent) {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("Konfirmasi password baru tidak cocok.");
      return;
    }
    securitySaving = true;
    try {
      const res = await api.put("/settings/password", {
        oldPassword,
        newPassword,
      });
      if (res.success) {
        toast.success("Password berhasil diperbarui!");
        oldPassword = "";
        newPassword = "";
        confirmNewPassword = "";
      } else {
        throw new Error(res.error || "Gagal memperbarui password.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah password.");
    } finally {
      securitySaving = false;
    }
  }
</script>

{#if loading}
  <div class="h-64 flex items-center justify-center">
    <Spinner size="lg" />
  </div>
{:else}
  <div class="flex flex-col gap-6 w-full text-ink">
    <div class="flex flex-col gap-1.5 pb-4 border-b border-sage-200/25">
      <h1
        class="text-xl font-black text-slate-800 dark:text-white tracking-tight"
      >
        Pengaturan Toko
      </h1>
      <p class="text-xs text-slate-500 dark:text-slate-350 font-medium">
        Kelola informasi bisnis, mata uang, pajak, notifikasi stok, dan password
        keamanan.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <aside
        class="flex lg:flex-col gap-1 bg-surface border border-sage-200/50 p-1.5 rounded-2xl overflow-x-auto lg:overflow-visible scrollbar-none"
      >
        <button
          type="button"
          onclick={() => (activeTab = "profile")}
          class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer select-none shrink-0 w-full bg-transparent border-0
						{activeTab === 'profile'
            ? 'bg-sage-500! text-white font-extrabold shadow-md'
            : 'text-slate-650 hover:bg-base/40'}"
        >
          <Store class="w-4 h-4" />
          Profil Bisnis
        </button>
        <button
          type="button"
          onclick={() => (activeTab = "security")}
          class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer select-none shrink-0 w-full bg-transparent border-0
						{activeTab === 'security'
            ? 'bg-sage-500! text-white font-extrabold shadow-md'
            : 'text-slate-650 hover:bg-base/40'}"
        >
          <KeyRound class="w-4 h-4" />
          Keamanan & Sandi
        </button>
      </aside>

      <div class="lg:col-span-3 flex flex-col gap-6">
        {#if activeTab === "profile"}
          <div class="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
            <div class="xl:col-span-3 flex flex-col gap-6">
              <Card class="p-6 bg-surface">
                <form
                  onsubmit={handleUpdateProfile}
                  class="flex flex-col gap-5"
                >
                  <div class="flex flex-col gap-4">
                    <div class="border-b border-sage-200/20 pb-2.5 mb-1">
                      <h3
                        class="font-extrabold text-slate-800 dark:text-white text-sm tracking-tight"
                      >
                        Informasi Dasar
                      </h3>
                      <p
                        class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5"
                      >
                        Identitas toko Anda pada cetak struk/invoice.
                      </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Nama"
                        bind:value={businessName}
                        placeholder="Contoh: Coffee Shop Kita"
                        required
                        disabled={profileSaving}
                      />
                      <Input
                        label="Nomor Telepon Kontak"
                        bind:value={businessPhone}
                        placeholder="Contoh: 081234567890"
                        disabled={profileSaving}
                      />
                    </div>

                    <Input
                      label="Alamat Lengkap Toko"
                      bind:value={businessAddress}
                      placeholder="Contoh: Jl. Diponegoro No. 45, Bandung"
                      disabled={profileSaving}
                    />
                  </div>

                  <div class="flex flex-col gap-4 mt-2">
                    <div class="border-b border-sage-200/20 pb-2.5 mb-1">
                      <h3
                        class="font-extrabold text-slate-800 dark:text-white text-sm tracking-tight"
                      >
                        Kasir & Keuangan
                      </h3>
                      <p
                        class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5"
                      >
                        Pengaturan standar transaksi dan inventori POS.
                      </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Mata Uang"
                        bind:value={currencySymbol}
                        placeholder="Rp"
                        required
                        disabled={profileSaving}
                      />
                      <Input
                        type="number"
                        label="Tarif PPN (%)"
                        bind:value={taxRate}
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                        disabled={profileSaving}
                      />
                      <Input
                        type="number"
                        label="Batas Stok Tipis"
                        bind:value={lowStockThreshold}
                        placeholder="10"
                        min="0"
                        required
                        disabled={profileSaving}
                      />
                    </div>

                    <Input
                      label="Catatan Struk (Footer)"
                      bind:value={receiptFooter}
                      placeholder="Contoh: Terima kasih atas kunjungan Anda!"
                      disabled={profileSaving}
                    />
                  </div>

                  <div
                    class="flex justify-end mt-4 pt-3 border-t border-sage-200/25"
                  >
                    <Button
                      type="submit"
                      loading={profileSaving}
                      variant="primary"
                      class="px-5 text-white"
                    >
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            <!-- Receipt Preview -->
            <div class="xl:col-span-2 flex flex-col gap-4 xl:sticky xl:top-20">
              <div
                class="bg-surface border border-sage-200/40 rounded-2xl p-4 flex flex-col gap-3 shadow-xs"
              >
                <div
                  class="flex items-center justify-between border-b border-sage-200/20 pb-2"
                >
                  <span
                    class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider"
                    >Live Preview Struk</span
                  >
                  <span
                    class="text-[9px] bg-base text-slate-500 dark:text-slate-300 font-extrabold px-2 py-0.5 rounded-full select-none border border-sage-200/40"
                    >Thermal 80mm</span
                  >
                </div>

                <div
                  class="bg-white text-slate-900 border border-slate-200 rounded-lg p-5 shadow-inner font-mono text-[9px] leading-relaxed flex flex-col w-full mx-auto select-none relative overflow-hidden"
                >
                  <div class="text-center font-bold mb-3 flex flex-col gap-0.5">
                    <span class="text-xs block uppercase tracking-wide truncate"
                      >{businessName || "NAMA TOKO"}</span
                    >
                    {#if businessAddress}
                      <span
                        class="font-normal block text-[8px] text-slate-500 truncate"
                        >{businessAddress}</span
                      >
                    {/if}
                    {#if businessPhone}
                      <span
                        class="font-normal block text-[8px] text-slate-500 truncate"
                        >Telp: {businessPhone}</span
                      >
                    {/if}
                  </div>

                  <div
                    class="border-t border-b border-dashed border-slate-350 py-2 my-2 flex flex-col gap-1 text-[8px]"
                  >
                    <div class="flex justify-between">
                      <span>No. Transaksi:</span>
                      <span class="font-bold">TRX-20260604-0012</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Tanggal:</span>
                      <span>04/06/2026 21:00</span>
                    </div>
                  </div>

                  <div class="flex flex-col gap-1.5 my-2">
                    <div>
                      <div class="flex justify-between font-bold">
                        <span>Americano Ice Coffee</span>
                        <span>{(25000).toLocaleString("id-ID")}</span>
                      </div>
                      <div class="text-[8px] text-slate-450">
                        1 x {(25000).toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>

                  <div
                    class="border-t border-dashed border-slate-350 pt-2 flex flex-col gap-1 text-[8px]"
                  >
                    <div class="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{(25000).toLocaleString("id-ID")}</span>
                    </div>
                    {#if parseFloat(taxRate.toString()) > 0}
                      <div class="flex justify-between">
                        <span>PPN ({taxRate}%):</span>
                        <span>{mockTax.toLocaleString("id-ID")}</span>
                      </div>
                    {/if}
                    <div
                      class="flex justify-between font-bold text-[10px] border-t border-slate-200 pt-1 mt-1"
                    >
                      <span>TOTAL ({currencySymbol}):</span>
                      <span
                        >{currencySymbol}
                        {mockTotal.toLocaleString("id-ID")}</span
                      >
                    </div>
                  </div>

                  {#if receiptFooter}
                    <div
                      class="text-center text-[8px] text-slate-500 border-t border-dashed border-slate-300 pt-2.5 mt-3 whitespace-pre-line leading-normal"
                    >
                      {receiptFooter}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/if}

        {#if activeTab === "security"}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div class="md:col-span-2">
              <Card class="p-6 bg-surface">
                <form
                  onsubmit={handleUpdatePassword}
                  class="flex flex-col gap-5"
                >
                  <div
                    class="border-b border-sage-200/20 pb-3 mb-1 flex items-start gap-3"
                  >
                    <div
                      class="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl"
                    >
                      <KeyRound class="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        class="font-extrabold text-slate-800 dark:text-white text-sm tracking-tight"
                      >
                        Kredensial Keamanan
                      </h3>
                      <p
                        class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium"
                      >
                        Perbarui kunci akses utama kasir toko Anda secara
                        berkala.
                      </p>
                    </div>
                  </div>

                  <Input
                    type="password"
                    label="Password Lama"
                    bind:value={oldPassword}
                    placeholder="Masukkan password lama"
                    required
                    disabled={securitySaving}
                  />

                  <Input
                    type="password"
                    label="Password Baru"
                    bind:value={newPassword}
                    placeholder="Masukkan password baru"
                    required
                    disabled={securitySaving}
                  />

                  <Input
                    type="password"
                    label="Konfirmasi Password Baru"
                    bind:value={confirmNewPassword}
                    placeholder="Ketik ulang password baru"
                    required
                    error={newPassword &&
                    confirmNewPassword &&
                    newPassword !== confirmNewPassword
                      ? "Konfirmasi password tidak cocok"
                      : undefined}
                    disabled={securitySaving}
                  />

                  <div
                    class="flex justify-end mt-4 pt-3 border-t border-sage-200/25"
                  >
                    <Button
                      type="submit"
                      loading={securitySaving}
                      variant="danger"
                      disabled={!oldPassword ||
                        !newPassword ||
                        newPassword !== confirmNewPassword ||
                        !isNewPasswordValid}
                      class="px-5 text-white bg-rose-600 hover:bg-rose-700"
                    >
                      Perbarui Password
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            <div class="md:col-span-1">
              <div
                class="bg-surface border border-sage-200/50 rounded-2xl p-5 flex flex-col gap-4 shadow-xs"
              >
                <div
                  class="flex items-center gap-2 border-b border-sage-200/20 pb-2"
                >
                  <span
                    class="text-xs font-black text-slate-700 dark:text-white uppercase tracking-wider"
                    >Kriteria Password</span
                  >
                </div>

                <ul class="flex flex-col gap-3 text-xs text-slate-650">
                  <li class="flex items-center gap-2.5">
                    <div
                      class="w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-350
											{hasMinLength
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-slate-200 text-slate-400'}"
                    >
                      {#if hasMinLength}
                        <svg
                          class="w-2.5 h-2.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="4"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      {:else}
                        <span class="w-1 h-1 rounded-full bg-slate-350"></span>
                      {/if}
                    </div>
                    <span
                      class={hasMinLength ? "text-emerald-700 font-bold" : ""}
                      >Minimal 6 karakter</span
                    >
                  </li>
                  <li class="flex items-center gap-2.5">
                    <div
                      class="w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-350
											{hasLetter
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-slate-200 text-slate-400'}"
                    >
                      {#if hasLetter}
                        <svg
                          class="w-2.5 h-2.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="4"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      {:else}
                        <span class="w-1 h-1 rounded-full bg-slate-350"></span>
                      {/if}
                    </div>
                    <span class={hasLetter ? "text-emerald-700 font-bold" : ""}
                      >Mengandung huruf (A-Z, a-z)</span
                    >
                  </li>
                  <li class="flex items-center gap-2.5">
                    <div
                      class="w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-350
											{hasNumber
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-slate-200 text-slate-400'}"
                    >
                      {#if hasNumber}
                        <svg
                          class="w-2.5 h-2.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="4"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      {:else}
                        <span class="w-1 h-1 rounded-full bg-slate-350"></span>
                      {/if}
                    </div>
                    <span class={hasNumber ? "text-emerald-700 font-bold" : ""}
                      >Mengandung angka (0-9)</span
                    >
                  </li>
                </ul>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
