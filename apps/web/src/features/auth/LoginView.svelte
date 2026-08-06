<script lang="ts">
  import Button from "../../components/ui/Button.svelte";
  import Input from "../../components/ui/Input.svelte";
  import { ShieldAlert, ArrowRight } from "lucide-svelte";
  import { api } from "../../core/api";
  import { appState } from "../../core/state.svelte";
  import { toast } from "../../lib/utils/toast.svelte";
  import logoUrl from "../../assets/img/arthapos.svg";

  let loading = $state(false);

  // Form binding values
  let email = $state("");
  let password = $state("");
  let errorMsg = $state("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    errorMsg = "";

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.success) {
        toast.success("Login berhasil!");
        appState.setUser(res.user);
        appState.needSetup = false;
        window.location.hash = "#/dashboard";
      }
    } catch (err: any) {
      errorMsg = err.message || "Terjadi kesalahan.";
      toast.error(errorMsg);
    } finally {
      loading = false;
    }
  }
</script>

<div
  class="min-h-screen w-full flex items-center justify-center bg-base text-p-text overflow-x-hidden relative transition-colors duration-200 px-4 py-12"
>
  <!-- Decorative Blobs -->
  <div
    class="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/8 dark:bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none"
  ></div>
  <div
    class="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accent-soft/10 dark:bg-accent-soft/5 rounded-full blur-3xl -z-10 pointer-events-none"
  ></div>

  <div class="w-full max-w-105 z-10 transition-all duration-300">
    <!-- Glass Panel Container -->
    <div
      class="glass-panel-glow border border-accent-soft/30 dark:border-accent-soft/20 rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col gap-6"
    >
      <!-- Logo & Branding inside the card -->
      <div class="flex flex-col items-center gap-3 text-center">
        <div class="h-16 w-auto transition-all duration-300 hover:scale-105 mb-1">
          <img
            src={logoUrl}
            alt="ArthaPOS Logo"
            class="h-full w-auto object-contain"
          />
        </div>
        <div>
          <h2 class="text-lg font-bold text-h-text tracking-tight mt-1">
            Owner Login
          </h2>
          <p class="text-xs text-p-text mt-1 leading-relaxed font-medium">
            Masukkan email dan password untuk masuk ke dashboard admin.
          </p>
        </div>
      </div>

      <!-- Form -->
      <form onsubmit={handleSubmit} class="flex flex-col gap-4">
        {#if errorMsg}
          <div
            class="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-bold transition-all duration-300"
          >
            <ShieldAlert class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        {/if}

        <Input
          type="email"
          label="Email"
          id="email"
          bind:value={email}
          placeholder="nama@email.com"
          required
          disabled={loading}
        />

        <Input
          type="password"
          label="Password"
          id="password"
          bind:value={password}
          placeholder="Masukkan password Anda"
          required
          disabled={loading}
        />

        <Button
          type="submit"
          class="w-full mt-3 py-3 font-display font-bold text-white bg-accent hover:bg-accent-hover transition-all duration-300 rounded-xl shadow-lg shadow-accent/15 cursor-pointer relative overflow-hidden group flex items-center justify-center gap-2"
          {loading}
        >
          <span>Masuk Dashboard</span>
          <ArrowRight
            class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
          />
        </Button>
      </form>

      <!-- Footer Links -->
      <div
        class="flex flex-col gap-4 pt-4 border-t border-accent-soft/20 dark:border-accent-soft/10 text-center"
      >
        <a
          href="#/etalase"
          class="text-xs text-ink hover:text-accent font-bold transition-colors duration-150 inline-flex items-center justify-center gap-1"
        >
          <span>Kunjungi Etalase Publik</span>
          <span>&rarr;</span>
        </a>
      </div>
    </div>
  </div>
</div>
