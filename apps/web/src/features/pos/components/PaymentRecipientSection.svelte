<script lang="ts">
  import { memberStore } from '../logic/member.svelte';
  import { User } from 'lucide-svelte';

  interface Props {
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    onPhoneInput: (val: string) => void;
    onNameInput: (val: string) => void;
    onAddressInput: (val: string) => void;
  }

  let {
    recipientName,
    recipientPhone,
    recipientAddress,
    onPhoneInput,
    onNameInput,
    onAddressInput,
  }: Props = $props();
</script>

<div class="p-4 bg-base border border-border-theme rounded-2xl space-y-3 select-none">
  <div>
    <span class="text-xs font-extrabold text-ink-muted uppercase tracking-wider block">
      Informasi Penerima (Surat Jalan & Invoice)
    </span>
    
    {#if memberStore.current}
      <div class="mt-2.5 flex items-center justify-between gap-2 px-3.5 py-2 bg-accent-soft border border-accent/25 rounded-xl text-xs shadow-2xs">
        <div class="flex items-center gap-2 font-bold text-accent-soft-text">
          <User class="w-4 h-4 text-accent shrink-0" />
          <span>Otomatis Member: <strong class="font-black text-accent-soft-text">{memberStore.current.name}</strong></span>
        </div>
        <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-accent text-white tracking-wider">
          Terhubung
        </span>
      </div>
    {/if}
  </div>

  <div class="grid grid-cols-2 gap-2">
    <div>
      <label class="text-[11px] font-bold text-ink-muted block mb-1" for="recipient-phone-input">
        No. HP Penerima
      </label>
      <input
        id="recipient-phone-input"
        type="text"
        value={recipientPhone}
        oninput={(e) => onPhoneInput(e.currentTarget.value)}
        placeholder="08123456789..."
        class="w-full px-3 py-2 bg-surface border border-border-theme focus:border-accent rounded-xl text-xs text-h-text focus:outline-none font-mono font-bold"
      />
    </div>

    <div>
      <label class="text-[11px] font-bold text-ink-muted block mb-1" for="recipient-name-input">
        Nama Penerima
      </label>
      <input
        id="recipient-name-input"
        type="text"
        value={recipientName}
        oninput={(e) => onNameInput(e.currentTarget.value)}
        placeholder="Nama Pembeli"
        class="w-full px-3 py-2 bg-surface border border-border-theme rounded-xl text-xs text-h-text focus:outline-none focus:border-accent font-semibold"
      />
    </div>
  </div>

  <div>
    <label class="text-[11px] font-bold text-ink-muted block mb-1" for="recipient-address-input">
      Alamat Pengiriman / Penerima
    </label>
    <textarea
      id="recipient-address-input"
      value={recipientAddress}
      oninput={(e) => onAddressInput(e.currentTarget.value)}
      rows="2"
      placeholder="Alamat lengkap penerima..."
      class="w-full px-3 py-2 bg-surface border border-border-theme rounded-xl text-xs text-h-text resize-none focus:outline-none focus:border-accent"
    ></textarea>
  </div>
</div>
