<script lang="ts">
	import { cart } from '../logic/cart.svelte';
	import { formatCurrency } from '../../../lib/utils/currency';
	import { createProductFuse, fuzzySearchProducts } from '../../../lib/utils/fuzzy-search';
	import { Search, AlertCircle, ChevronDown, Package } from 'lucide-svelte';
	import type { UIProduct } from '../../../types';

	interface Props {
		products: UIProduct[];
		categories: string[];
		onselect: (p: UIProduct) => void;
	}

	let { products, categories, onselect }: Props = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('');
	let isDropdownOpen = $state(false);
	let dropdownRef = $state<HTMLElement | null>(null);

	const fuse = $derived(createProductFuse(products));

	const filteredProducts = $derived(() => {
		const fuzzyResults = fuzzySearchProducts(fuse, products, searchQuery);
		if (!selectedCategory) return fuzzyResults;
		return fuzzyResults.filter((p) => p.category === selectedCategory);
	});

	const isSearchActive = $derived(searchQuery.trim().length >= 2);

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}

	function selectCategory(cat: string) {
		selectedCategory = cat;
		isDropdownOpen = false;
	}

	function handleWindowClick(e: MouseEvent) {
		if (isDropdownOpen && dropdownRef && !dropdownRef.contains(e.target as Node)) {
			isDropdownOpen = false;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} />

<div class="flex flex-col gap-4.5 h-full text-ink">
	<!-- Search & Filters -->
	<div class="flex flex-wrap gap-3 items-center w-full">
		<!-- Search -->
		<div class="relative flex-1 min-w-[200px] sm:max-w-[260px]">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 transition-colors" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari SKU atau nama produk..."
				class="w-full pl-9 pr-4 py-2 bg-white dark:bg-base border border-sage-200/80 focus:border-sage-500 rounded-lg text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
			/>
			{#if isSearchActive}
				<span class="absolute -bottom-4.5 left-0 text-[10px] text-slate-400 dark:text-slate-350 font-medium">
					{filteredProducts().length} produk ditemukan
				</span>
			{/if}
		</div>

		<!-- Category filter buttons with Dropdown -->
		<div class="relative flex gap-2 shrink-0" bind:this={dropdownRef}>
			<button
				type="button"
				onclick={() => {
					selectedCategory = '';
					isDropdownOpen = false;
				}}
				class="px-3.5 py-2 rounded-lg text-xs font-medium border cursor-pointer transition-colors duration-150 shrink-0
          {!selectedCategory
					? 'bg-slate-950 border-slate-950 text-white shadow-sm'
					: 'bg-white dark:bg-base border-slate-200/80 text-slate-650 dark:text-slate-300 hover:bg-sage-50 dark:hover:bg-slate-850 hover:text-slate-950'}"
			>
				Semua
			</button>

			<div class="relative">
				<button
					type="button"
					onclick={toggleDropdown}
					class="px-3.5 py-2 rounded-lg text-xs font-medium border cursor-pointer transition-colors duration-150 shrink-0 inline-flex items-center gap-1.5
						{selectedCategory
							? 'bg-slate-950 border-slate-950 text-white shadow-sm'
							: 'bg-white dark:bg-base border-slate-200/80 text-slate-650 dark:text-slate-300 hover:bg-sage-50 dark:hover:bg-slate-850 hover:text-slate-950'}"
				>
					<span>{selectedCategory || 'Kategori'}</span>
					<ChevronDown class="w-3.5 h-3.5 opacity-75" />
				</button>

				{#if isDropdownOpen}
					<div 
						class="absolute right-0 md:left-0 md:right-auto mt-1.5 bg-white dark:bg-surface border border-slate-200/85 rounded-lg shadow-lg z-20 w-40 py-1"
					>
						{#each categories as cat}
							<button
								type="button"
								onclick={() => selectCategory(cat)}
								class="w-full text-left px-3 py-1.5 text-xs font-medium transition-colors duration-100 cursor-pointer
									{selectedCategory === cat 
										? 'bg-sage-50 dark:bg-base text-slate-950 dark:text-white font-semibold' 
										: 'text-slate-650 dark:text-slate-300 hover:bg-sage-50/50 dark:hover:bg-base/50 hover:text-slate-950'}"
							>
								{cat}
							</button>
						{:else}
							<div class="px-3 py-1.5 text-xs text-slate-400">Tidak ada kategori</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Products Grid Scroll -->
	<div class="flex-1 min-h-[50vh] max-h-[calc(100vh-280px)] overflow-y-auto pr-1 pb-10 scrollbar-none">
		{#if filteredProducts().length > 0}
			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
				{#each filteredProducts() as product (product.id)}
					{@const cartItem = cart.items.find((item) => item.product.id === product.id)}
					{@const displayStock = product.stock - (cartItem?.qty || 0)}
					{@const outOfStock = displayStock <= 0}
					<button
						type="button"
						onclick={() => !outOfStock && onselect(product)}
						disabled={outOfStock}
						class="flex flex-col text-left bg-surface rounded-xl p-3 border border-sage-200/40 hover:border-sage-200 transition-colors duration-150 focus:outline-none group relative select-none
              {outOfStock ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer hover:bg-base/40'}"
					>
						<!-- Product Image or Placeholder -->
						<div class="aspect-4/3 w-full rounded-lg bg-base border border-sage-200/20 mb-3 overflow-hidden flex items-center justify-center relative">
							{#if product.imageUrl}
								<img src={product.imageUrl} alt={product.name} class="w-full h-full object-cover" />
							{:else}
								<div class="absolute inset-0 bg-base flex items-center justify-center">
									<Package class="w-6 h-6 text-slate-300 stroke-[1.5]" />
								</div>
							{/if}

							<!-- Stock badge floating -->
							<div class="absolute top-2 right-2">
								{#if displayStock <= 0}
									<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-rose-50 text-rose-600 border border-rose-100">Habis</span>
								{:else if displayStock <= product.minStock}
									<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-amber-50 text-amber-700 border border-amber-100">{displayStock} {product.unit}</span>
								{:else}
									<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-base text-slate-650 dark:text-slate-300 border border-sage-200/40">{displayStock} {product.unit}</span>
								{/if}
							</div>
						</div>

						<span class="font-mono text-[9px] text-slate-400 dark:text-slate-400 font-medium tracking-wider uppercase">{product.sku}</span>
						<h4 class="font-semibold text-slate-800 dark:text-white text-xs mt-0.5 line-clamp-1 min-h-5 group-hover:text-sage-600 transition-colors duration-150">{product.name}</h4>
						<span class="font-semibold text-xs text-slate-900 dark:text-white mt-1 block font-mono">{formatCurrency(product.sellingPrice)}</span>
					</button>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center gap-3.5 py-24 text-slate-400">
				<AlertCircle class="w-10 h-10 text-sage-350" />
				<span class="text-xs font-semibold text-slate-400">
					{isSearchActive ? `Tidak ada produk cocok dengan "${searchQuery}"` : 'Produk tidak ditemukan'}
				</span>
			</div>
		{/if}
	</div>
</div>
