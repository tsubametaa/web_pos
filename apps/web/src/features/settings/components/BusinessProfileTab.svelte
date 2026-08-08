<script lang="ts">
  import { Save } from "lucide-svelte";
  import BusinessInfoSection from "./business/BusinessInfoSection.svelte";
  import CashierSettingsSection from "./business/CashierSettingsSection.svelte";
  import DocumentPreviewCard from "./business/DocumentPreviewCard.svelte";

  interface Props {
    businessName: string;
    logoUrl: string;
    businessPhone: string;
    businessAddress: string;
    currencySymbol: string;
    taxRate: number;
    lowStockThreshold: number;
    receiptFooter: string;
    profileSaving: boolean;
    uploadingLogo: boolean;
    onLogoUpload: (e: Event) => void;
    onSubmit: (e: SubmitEvent) => void;
  }

  let {
    businessName = $bindable(),
    logoUrl = $bindable(),
    businessPhone = $bindable(),
    businessAddress = $bindable(),
    currencySymbol = $bindable(),
    taxRate = $bindable(),
    lowStockThreshold = $bindable(),
    receiptFooter = $bindable(),
    profileSaving,
    uploadingLogo,
    onLogoUpload,
    onSubmit,
  }: Props = $props();
</script>

<div class="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start select-none">
  <!-- Left: Profile Form Card -->
  <div class="xl:col-span-3">
    <form
      onsubmit={onSubmit}
      class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-2xs space-y-6"
    >
      <BusinessInfoSection
        bind:businessName
        bind:logoUrl
        bind:businessPhone
        bind:businessAddress
        {profileSaving}
        {uploadingLogo}
        {onLogoUpload}
      />

      <CashierSettingsSection
        bind:currencySymbol
        bind:taxRate
        bind:lowStockThreshold
        bind:receiptFooter
        {profileSaving}
      />

      <!-- Submit Button -->
      <div
        class="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end"
      >
        <button
          type="submit"
          disabled={profileSaving}
          class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs hover:shadow"
        >
          {#if profileSaving}
            <span
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            <span>Menyimpan...</span>
          {:else}
            <Save class="w-4 h-4" />
            <span>Simpan Perubahan Profil</span>
          {/if}
        </button>
      </div>
    </form>
  </div>

  <!-- Right: Live Document Preview -->
  <DocumentPreviewCard
    {businessName}
    {logoUrl}
    {businessPhone}
    {businessAddress}
    {currencySymbol}
    {taxRate}
    {receiptFooter}
  />
</div>
