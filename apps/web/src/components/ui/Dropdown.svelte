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
    position?: 'auto' | 'up' | 'down';
    onchange?: (value: string) => void;
  }

  let { options, value = $bindable(''), placeholder = 'Pilih opsi...', position = 'auto', onchange }: Props = $props();

  let isOpen = $state(false);
  let direction = $state<'down' | 'up'>('down');
  let dropdownRef = $state<HTMLDivElement | null>(null);
  let buttonRef = $state<HTMLButtonElement | null>(null);

  const selectedOption = $derived(options.find((o) => o.value === value));

  function toggleOpen() {
    if (!isOpen) {
      if (position === 'up') {
        direction = 'up';
      } else if (position === 'down') {
        direction = 'down';
      } else if (buttonRef) {
        const rect = buttonRef.getBoundingClientRect();
        direction = rect.bottom > window.innerHeight * 0.65 ? 'up' : 'down';
      }
    }
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
    bind:this={buttonRef}
    onclick={toggleOpen}
    class="w-full inline-flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-surface border border-border-theme hover:border-accent/40 rounded-xl text-xs font-bold text-h-text transition-all shadow-2xs cursor-pointer min-w-52.5"
  >
    <div class="flex items-center gap-2 truncate">
      {#if selectedOption?.icon}
        {@const Icon = selectedOption.icon}
        <Icon class="w-4 h-4 text-accent shrink-0" />
      {/if}
      <span class="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
    </div>
    <ChevronDown
      class="w-4 h-4 text-ink-muted shrink-0 transition-transform duration-150 {isOpen
        ? 'rotate-180'
        : ''}"
    />
  </button>

  <!-- Dropdown Menu Popup -->
  {#if isOpen}
    <div
      class="absolute left-0 right-0 z-30 max-h-56 overflow-y-auto scrollbar-none bg-surface border border-border-theme rounded-2xl shadow-xl py-1.5 min-w-52.5 transition-all animate-in fade-in duration-150 {direction === 'up' ? 'bottom-full mb-1.5 slide-in-from-bottom-2' : 'top-full mt-1.5 slide-in-from-top-2'}"
    >
      {#each options as option}
        {@const OptionIcon = option.icon}
        <button
          type="button"
          onclick={() => selectOption(option.value)}
          class="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer text-left
						{value === option.value
            ? 'bg-accent-soft text-accent-soft-text font-extrabold border-l-2 border-accent'
            : 'text-ink hover:bg-accent-soft/60'}"
        >
          <div class="flex items-center gap-2.5 truncate">
            {#if OptionIcon}
              <OptionIcon class="w-4 h-4 text-accent shrink-0" />
            {/if}
            <span class="truncate">{option.label}</span>
          </div>

          {#if value === option.value}
            <Check class="w-4 h-4 text-accent-soft-text shrink-0" />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
