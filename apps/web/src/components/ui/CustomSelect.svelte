<script lang="ts">
  import { ChevronDown, Check } from 'lucide-svelte';

  export interface SelectOption {
    value: string;
    label: string;
    icon?: any;
    subtitle?: string;
  }

  interface Props {
    id?: string;
    value?: string;
    options?: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    icon?: any;
    onchange?: (value: string) => void;
  }

  let {
    id = 'select-' + Math.random().toString(36).substring(2, 7),
    value = $bindable(''),
    options = [],
    placeholder = 'Pilih Opsi...',
    disabled = false,
    label = '',
    icon = null,
    onchange
  }: Props = $props();

  let isOpen = $state(false);

  const selectedOption = $derived(options.find((o) => o.value === value));

  function selectOption(val: string) {
    if (disabled) return;
    value = val;
    isOpen = false;
    onchange?.(val);
  }

  function handleWindowClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (id && !target.closest(`#select-container-${id}`)) {
      isOpen = false;
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div id="select-container-{id}" class="relative w-full">
  {#if label}
    <label class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5" for={id}>
      {label}
    </label>
  {/if}

  <button
    type="button"
    {id}
    {disabled}
    onclick={() => !disabled && (isOpen = !isOpen)}
    class="w-full flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 rounded-xl text-xs font-bold text-slate-800 dark:text-white hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
  >
    <div class="flex items-center gap-2 truncate">
      {#if icon}
        {@const IconComponent = icon}
        <IconComponent class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      {/if}
      <span class="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
    </div>

    <ChevronDown class="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
  </button>

  {#if isOpen}
    <div
      class="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto bg-white dark:bg-surface border border-slate-200 dark:border-emerald-950 rounded-2xl shadow-xl p-1 space-y-1 transition-all animate-in fade-in slide-in-from-top-2 duration-150 scrollbar-none"
    >
      {#each options as opt}
        <button
          type="button"
          onclick={() => selectOption(opt.value)}
          class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border-0
            {opt.value === value
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15'}"
        >
          <div class="flex items-center gap-2 truncate">
            {#if opt.icon}
              {@const OptIcon = opt.icon}
              <OptIcon class="w-3.5 h-3.5 shrink-0 opacity-80" />
            {/if}
            <div class="flex flex-col text-left truncate">
              <span class="truncate">{opt.label}</span>
              {#if opt.subtitle}
                <span class="text-[10px] font-normal opacity-70 truncate">{opt.subtitle}</span>
              {/if}
            </div>
          </div>

          {#if opt.value === value}
            <Check class="w-3.5 h-3.5 text-white shrink-0 ml-1" />
          {/if}
        </button>
      {:else}
        <div class="px-3 py-3 text-center text-slate-400 text-xs font-medium">
          Tidak ada opsi tersedia.
        </div>
      {/each}
    </div>
  {/if}
</div>
