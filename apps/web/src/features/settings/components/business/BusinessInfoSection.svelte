<script lang="ts">
  import { Building2, Upload, Phone, MapPin } from "lucide-svelte";

  interface Props {
    businessName: string;
    logoUrl: string;
    businessPhone: string;
    businessAddress: string;
    profileSaving: boolean;
    uploadingLogo: boolean;
    onLogoUpload: (e: Event) => void;
  }

  let {
    businessName = $bindable(),
    logoUrl = $bindable(),
    businessPhone = $bindable(),
    businessAddress = $bindable(),
    profileSaving,
    uploadingLogo,
    onLogoUpload,
  }: Props = $props();
</script>

<!-- Section 1: Informasi Bisnis & Logo -->
<div class="space-y-4">
  <div class="border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
    <h2
      class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight"
    >
      Informasi Profil Bisnis & Logo
    </h2>
    <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
      Identitas brand & logo yang ditampilkan pada cetak Invoice dan Surat Jalan.
    </p>
  </div>

  <!-- Logo Upload Box -->
  <div
    class="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-base p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60"
  >
    {#if logoUrl}
      <img
        src={logoUrl}
        alt="Logo Brand"
        class="h-16 w-16 object-contain rounded-lg border bg-white p-1"
      />
    {:else}
      <div
        class="h-16 w-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400"
      >
        <Building2 class="w-6 h-6" />
      </div>
    {/if}
    <div class="flex-1 space-y-1 text-center sm:text-left">
      <label
        class="block text-xs font-bold text-slate-700 dark:text-slate-200"
        for="logo-upload-input"
      >
        Logo Brand (Gambar Surat Jalan & Invoice)
      </label>
      <p class="text-[11px] text-slate-400">
        Format: JPG, PNG, WEBP. Maksimal 5 MB.
      </p>
      <div class="pt-1">
        <label
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
          for="logo-upload-input"
        >
          <Upload class="w-3.5 h-3.5" />
          <span>{uploadingLogo ? "Mengunggah..." : "Pilih Gambar Logo"}</span>
        </label>
        <input
          id="logo-upload-input"
          type="file"
          accept="image/*"
          onchange={onLogoUpload}
          disabled={uploadingLogo}
          class="hidden"
        />
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label
        class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
        for="biz-name"
      >
        Nama Toko / Usaha *
      </label>
      <div class="relative">
        <input
          id="biz-name"
          type="text"
          bind:value={businessName}
          placeholder="Contoh: Coffee Shop Kita"
          required
          disabled={profileSaving}
          class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-slate-800/80 focus:border-accent rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-2xs"
        />
      </div>
    </div>

    <div>
      <label
        class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
        for="biz-phone"
      >
        Nomor Telepon Kontak
      </label>
      <div class="relative">
        <Phone
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
        />
        <input
          id="biz-phone"
          type="text"
          bind:value={businessPhone}
          placeholder="Contoh: 081234567890"
          disabled={profileSaving}
          class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-slate-800/80 focus:border-accent rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-2xs"
        />
      </div>
    </div>
  </div>

  <div>
    <label
      class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
      for="biz-addr"
    >
      Alamat Lengkap Toko
    </label>
    <div class="relative">
      <MapPin
        class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
      />
      <input
        id="biz-addr"
        type="text"
        bind:value={businessAddress}
        placeholder="Contoh: Jl. Diponegoro No. 45, Bandung"
        disabled={profileSaving}
        class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-slate-800/80 focus:border-accent rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-2xs"
      />
    </div>
  </div>
</div>
