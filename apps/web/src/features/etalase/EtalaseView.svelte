<script lang="ts">
	import { onMount } from 'svelte';
	import { formatCurrency } from '../../lib/utils/currency';
	import { Search, Store, Phone, MapPin, Filter, Rocket } from 'lucide-svelte';
	import { api } from '../../core/api';
	import Spinner from '../../components/ui/Spinner.svelte';
	import ProductDetail from './components/ProductDetail.svelte';
	import type { UIProduct, UISettings } from '../../types';

	let { productId }: { productId?: string } = $props();

	let loading = $state(true);
	let products = $state<UIProduct[]>([]);
	let settings = $state<UISettings | null>(null);

	let searchQuery = $state('');
	let selectedCategory = $state('');

	const categories = $derived([...new Set(products.map((p) => p.category).filter(Boolean))]);

	const filteredProducts = $derived(
		products.filter((p) => {
			const matchesSearch =
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.sku.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = !selectedCategory || p.category === selectedCategory;
			return matchesSearch && matchesCategory && p.isActive;
		})
	);

	async function loadCatalog() {
		try {
			const res = await api.get('/etalase');
			if (res.success) {
				products = res.products || [];
				settings = res.settings || null;
			}
		} catch (err) {
			console.error('Error fetching etalase catalog:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (!productId) {
			loadCatalog();
		}
	});

	function getMockSold(id: string, stock: number) {
		const seed = id ? id.charCodeAt(id.length - 1) : 0;
		return (seed + stock * 2) % 65 + 10;
	}

	function handleBackToCatalog() {
		window.location.hash = '#/etalase';
	}
</script>

{#if productId}
	<ProductDetail {productId} onBack={handleBackToCatalog} />
{:else if loading}
	<div class="min-h-screen flex items-center justify-center bg-base text-ink">
		<Spinner size="lg" />
	</div>
{:else}
	<div class="min-h-screen bg-base text-ink flex flex-col font-sans antialiased">
		<!-- Tokopedia/Shopee-style Header -->
		<header class="bg-white dark:bg-surface border-b border-sage-200/25 py-3.5 px-4 sticky top-0 z-30 shadow-xs">
			<div class="max-w-6xl w-full mx-auto flex items-center gap-4 justify-between">
				<!-- Logo & Store Info -->
				<a href="#/etalase" class="flex items-center gap-2 shrink-0 group">
					<div class="p-1.5 bg-sage-500 text-white rounded-lg shadow-sm">
						<Store class="w-4 h-4" />
					</div>
					<div class="flex flex-col">
						<span class="font-bold text-sm tracking-tight text-slate-800 dark:text-white leading-none">{settings?.businessName || 'Etalase'}</span>
						<span class="text-[9px] font-extrabold text-sage-500 uppercase tracking-wider mt-0.5 select-none">Official Store</span>
					</div>
				</a>

				<!-- Search Box -->
				<div class="flex-1 max-w-lg relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari di {settings?.businessName || 'toko kami'}..."
						class="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-base border border-transparent rounded-lg text-xs text-slate-805 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sage-500 transition-all"
					/>
				</div>

				<!-- Contact Button -->
				{#if settings?.businessPhone}
					<a
						href="https://wa.me/{settings.businessPhone.replace(/\D/g, '')}"
						target="_blank"
						class="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-sm hover:bg-emerald-700 transition-colors shrink-0"
					>
						<Phone class="w-3.5 h-3.5" />
						<span class="hidden sm:inline">Hubungi Toko</span>
					</a>
				{/if}
			</div>
		</header>

		<!-- Main Workspace Layout -->
		<main class="flex-1 max-w-6xl w-full mx-auto px-4 py-5 flex flex-col gap-4">
			<!-- Mobile Category Slider -->
			<div class="lg:hidden flex flex-col gap-2">
				<div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
					<button
						type="button"
						onclick={() => (selectedCategory = '')}
						class="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 select-none
							{!selectedCategory 
								? 'bg-sage-500 border-sage-500 text-white' 
								: 'bg-white dark:bg-surface border-slate-200 text-slate-600 dark:text-slate-300'}"
					>Semua</button>
					{#each categories as cat}
						<button
							type="button"
							onclick={() => (selectedCategory = cat)}
							class="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 select-none
								{selectedCategory === cat 
									? 'bg-sage-500 border-sage-500 text-white' 
									: 'bg-white dark:bg-surface border-slate-200 text-slate-600 dark:text-slate-300'}"
						>{cat}</button>
					{/each}
				</div>
			</div>

			<div class="flex gap-4 items-start">
				<!-- Desktop Category Sidebar -->
				<aside class="hidden lg:block w-52 bg-surface border border-sage-200/50 rounded-xl p-4 shrink-0 shadow-xs sticky top-20">
					<div class="flex items-center gap-1.5 pb-3 border-b border-sage-200/20 mb-3 text-slate-800 dark:text-white">
						<Filter class="w-4 h-4 text-sage-500" />
						<h3 class="text-xs font-bold uppercase tracking-wider">Kategori</h3>
					</div>
					<nav class="flex flex-col gap-1">
						<button
							type="button"
							onclick={() => (selectedCategory = '')}
							class="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-all select-none bg-transparent border-0
								{!selectedCategory 
									? 'bg-sage-500/10 text-sage-500 dark:text-accent font-bold' 
									: 'text-slate-600 dark:text-slate-300 hover:bg-base/40'}"
						>
							Semua Produk
						</button>
						{#each categories as cat}
							<button
								type="button"
								onclick={() => (selectedCategory = cat)}
								class="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-all select-none bg-transparent border-0
									{selectedCategory === cat 
										? 'bg-sage-500/10 text-sage-500 dark:text-accent font-bold' 
										: 'text-slate-600 dark:text-slate-300 hover:bg-base/40'}"
							>
								{cat}
							</button>
						{/each}
					</nav>
				</aside>

				<!-- Desktop/Mobile Grid Area -->
				<div class="flex-1">
					{#if filteredProducts.length > 0}
						<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
							{#each filteredProducts as product (product.id)}
								{@const sold = getMockSold(product.id, product.stock)}
								<a
									href={`#/etalase/${product.id}`}
									class="flex flex-col bg-surface rounded-lg border border-sage-200/50 hover:shadow-md hover:border-sage-350 transition-all duration-200 overflow-hidden cursor-pointer"
								>
									<!-- Image Block -->
									<div class="aspect-square w-full bg-base overflow-hidden flex items-center justify-center relative border-b border-sage-200/10">
										{#if product.imageUrl}
											<img src={product.imageUrl} alt={product.name} class="w-full h-full object-cover" />
										{:else}
											<span class="text-2xl font-black text-slate-200 dark:text-slate-650 uppercase tracking-widest">{product.name.slice(0, 2)}</span>
										{/if}
										{#if product.stock <= 0}
											<div class="absolute inset-0 bg-black/35 flex items-center justify-center select-none">
												<span class="text-white text-[10px] font-extrabold bg-red-500 px-2 py-0.5 rounded uppercase tracking-wider">Habis</span>
											</div>
										{/if}
									</div>

									<!-- Card Body -->
									<div class="p-2.5 flex flex-col gap-1 flex-1 justify-between bg-surface">
										<div class="flex flex-col gap-0.5">
											<span class="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{product.category}</span>
											<h4 class="text-[12px] text-slate-750 dark:text-white font-medium line-clamp-2 leading-tight h-8">
												{product.name}
											</h4>
										</div>
										<div class="flex flex-col mt-2">
											<span class="text-xs font-mono font-extrabold text-sage-500 dark:text-accent">
												{formatCurrency(product.sellingPrice)}
											</span>
											<span class="text-[9px] text-slate-400 dark:text-slate-400 font-bold block mt-1 select-none">
												{settings?.businessName || 'Toko'}
											</span>
											<span class="text-[9px] text-slate-400 dark:text-slate-400 block mt-0.5 select-none font-mono">
												Stok {product.stock} • Terjual {sold}
											</span>
										</div>
									</div>
								</a>
							{/each}
						</div>
					{:else}
						<div class="py-20 text-center text-slate-400 bg-surface rounded-xl border border-sage-200/50">
							<p class="text-xs font-bold">Tidak ada produk ditemukan</p>
						</div>
					{/if}
				</div>
			</div>
		</main>

		<!-- Footer -->
		<footer class="bg-white dark:bg-surface border-t border-sage-200/25 py-8 px-4 mt-12 text-slate-550">
			<div class="max-w-6xl w-full mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
				<div class="flex flex-col gap-1.5">
					<div class="flex items-center gap-1.5 text-slate-800 dark:text-white">
						<Store class="w-5 h-5 text-sage-500" />
						<span class="font-bold text-sm tracking-tight">{settings?.businessName || 'Kasir Kita'}</span>
					</div>
					<p class="text-xs text-slate-400 max-w-sm leading-relaxed">
						Katalog resmi e-commerce online shop. Hubungi kami secara langsung untuk melakukan pembelian grosir atau konsultasi stok.
					</p>
				</div>
				
				<div class="flex flex-col gap-2 text-xs text-slate-400">
					<span class="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[9px]">Kontak & Alamat</span>
					{#if settings?.businessAddress}
						<div class="flex items-start gap-1.5">
							<MapPin class="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
							<span>{settings.businessAddress}</span>
						</div>
					{/if}
					{#if settings?.businessPhone}
						<div class="flex items-center gap-1.5">
							<Phone class="w-3.5 h-3.5 text-slate-400" />
							<span>{settings.businessPhone}</span>
						</div>
					{/if}
				</div>
			</div>
			<div class="max-w-6xl w-full mx-auto border-t border-sage-200/20 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-sage-400">
				<span>&copy; {new Date().getFullYear()} {settings?.businessName || 'Kasir Kita'}. Hak Cipta Dilindungi.</span>
				<span class="font-bold flex items-center gap-1">
					Powered by <span class="text-slate-800 dark:text-white font-extrabold tracking-tight inline-flex items-center gap-1">Kasir Kita <Rocket class="w-3.5 h-3.5 text-sage-500 dark:text-accent" /></span>
				</span>
			</div>
		</footer>
	</div>
{/if}
