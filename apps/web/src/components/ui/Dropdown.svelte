<script lang="ts">
  /* Dropdown.svelte - Reusable custom dropdown component with icon support and clean styling */
  import { ChevronDown, Check } from 'lucide-svelte';

  export interface DropdownOption {
    value: string;
    label: string;
    icon?: any;
  }

  interface Props {
    options: DropdownOption[];
    value?: string;
    placeholder?: string;
    onchange?: (value: string) => void;
  }

  let { options, value = $bindable(''), placeholder = 'Pilih opsi...', onchange }: Props = $props();

  let isOpen = $state(false);
  let dropdownRef = $state<HTMLDivElement | null>(null);

  const selectedOption = $derived(options.find((o) => o.value === value));

  function toggleOpen() {
    isOpen = !isOpen;
  }

  function selectOption(optionValue: string) {
    value = optionValue;
    isOpen = false;
    onchange?.(optionValue);
  }

  function handleOutsideClick(e: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
      isOpen = false;
    }
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<div class="relative inline-block text-left select-none" bind:this={dropdownRef}>
  <!-- Trigger Button -->
  <button
    type="button"
    onclick={toggleOpen}
    class="w-full inline-flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 dark:text-white transition-all shadow-2xs cursor-pointer min-w-52.5"
  >
    <div class="flex items-center gap-2 truncate">
      {#if selectedOption?.icon}
        {@const Icon = selectedOption.icon}
        <Icon class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      {/if}
      <span class="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
    </div>
    <ChevronDown
      class="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 {isOpen
        ? 'rotate-180'
        : ''}"
    />
  </button>

  <!-- Dropdown Menu Popup -->
  {#if isOpen}
    <div
      class="absolute left-0 right-0 z-30 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 overflow-hidden min-w-52.5"
    >
      {#each options as option}
        {@const OptionIcon = option.icon}
        <button
          type="button"
          onclick={() => selectOption(option.value)}
          class="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer text-left
						{value === option.value
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'}"
        >
          <div class="flex items-center gap-2.5 truncate">
            {#if OptionIcon}
              <OptionIcon class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {/if}
            <span class="truncate">{option.label}</span>
          </div>

          {#if value === option.value}
            <Check class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
