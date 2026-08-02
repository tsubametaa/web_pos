<script lang="ts">
	import { onMount } from 'svelte';
	import { formatCurrency } from '../../../lib/utils/currency';
	import { Store, ArrowLeft, MapPin, Phone, Rocket } from 'lucide-svelte';
	import { api } from '../../../core/api';
	import Spinner from '../../../components/ui/Spinner.svelte';
	import type { UIProduct, UISettings } from '../../../types';

	interface Props {
		productId: string;
		onBack: () => void;
	}

	let { productId, onBack }: Props = $props();

	let loading = $state(true);
	let product = $state<UIProduct | null>(null);
	let settings = $state<UISettings | null>(null);

	const urlParams = new URLSearchParams(window.location.search);
	const printMode = $derived(urlParams.get('print') === 'label' || window.location.hash.includes('print=label'));

	const shareUrl = $derived(
		product ? `${window.location.origin}/#/etalase/${product.id}` : ''
	);
	const qrCodeUrl = $derived(
		`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`
	);

	const sold = $derived(product ? (product.id ? product.id.charCodeAt(product.id.length - 1) : 0) + product.stock * 2 % 65 + 10 : 0);

	async function loadProductDetail() {
		try {
			const res = await api.get(`/etalase/${productId}`);
			if (res.success) {
				product = res.product;
				settings = res.settings;
			}
		} catch (err) {
			console.error('Error loading product details:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadProductDetail();
	});

	$effect(() => {
		if (!loading && printMode && product) {
			setTimeout(() => {
				window.print();
			}, 500);
		}
	});
</script>

{#if loading}
	<div class="h-64 flex items-center justify-center">
		<Spinner size="lg" />
	</div>
{:else if product}
	{#if printMode}
		<!-- Label Print -->
		<div class="print-label-container w-[60mm] p-2 bg-white text-black font-sans flex flex-col items-center text-center justify-center border border-slate-200 mx-auto select-none">
			<h5 class="text-[9px] font-extrabold uppercase tracking-wider truncate w-full border-b border-black pb-1 mb-1">
				{settings?.businessName || 'KASIR KITA'}
			</h5>
			
			<img src={qrCodeUrl} alt="QR Code Label" class="w-28 h-28 my-1" />
			
			<span class="text-[8px] font-mono font-bold tracking-widest">{product.sku}</span>
			<h4 class="text-[10px] font-bold mt-0.5 max-w-full leading-tight truncate px-1">{product.name}</h4>
			<span class="text-[11px] font-mono font-extrabold mt-1 border-t border-dashed border-black pt-1 w-full block">
				{formatCurrency(product.sellingPrice)}
			</span>
		</div>
	{:else}
		<div class="min-h-screen bg-base text-ink flex flex-col font-sans antialiased">
			<!-- Topbar -->
			<header class="bg-white dark:bg-surface border-b border-sage-200/25 py-3.5 px-4 sticky top-0 z-30 shadow-xs">
				<div class="max-w-4xl w-full mx-auto flex items-center justify-between">
					<button
						onclick={onBack}
						class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-650 dark:text-slate-300 hover:text-sage-500 transition-colors cursor-pointer select-none bg-transparent border-0"
					>
						<ArrowLeft class="w-4 h-4" />
						<span>Kembali ke Katalog</span>
					</button>
					<div class="flex items-center gap-2 text-xs font-bold text-slate-850 dark:text-white">
						<div class="p-1 bg-sage-500 text-white rounded-lg shadow-sm">
							<Store class="w-3.5 h-3.5" />
						</div>
						<span>{settings?.businessName || 'Official Store'}</span>
					</div>
				</div>
			</header>

			<!-- Main Workspace details layout -->
			<main class="flex-1 max-w-4xl w-full mx-auto px-4 mt-6">
				<div class="bg-surface border border-sage-200/50 rounded-xl p-5 md:p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
					
					<!-- Product Media Column (Left) -->
					<div class="aspect-square w-full rounded-lg bg-base border border-sage-200/30 overflow-hidden flex items-center justify-center relative">
						{#if product.imageUrl}
							<img src={product.imageUrl} alt={product.name} class="w-full h-full object-cover" />
						{:else}
							<span class="text-3xl font-black text-slate-200 dark:text-slate-650 uppercase tracking-widest select-none">{product.name.slice(0, 2)}</span>
						{/if}
					</div>

					<!-- Product Description Column (Right) -->
					<div class="flex flex-col gap-4">
						<div>
							<span class="text-[9px] px-2 py-0.5 bg-base border border-sage-200/40 text-slate-500 dark:text-slate-350 rounded font-bold uppercase inline-block select-none">
								{product.category}
							</span>
							
							<h2 class="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight mt-2 leading-snug">
								{product.name}
							</h2>
							
							<span class="font-mono text-[10px] text-slate-400 dark:text-slate-400 tracking-wider block mt-0.5">SKU: {product.sku}</span>
							
							<span class="text-[10px] text-slate-400 dark:text-slate-400 block mt-1.5 select-none font-mono">
								Terjual {sold} • Stok {product.stock} {product.unit}
							</span>
						</div>

						<div class="flex flex-col gap-0.5 border-t border-b border-sage-200/10 py-3.5">
							<span class="text-[10px] text-slate-450 dark:text-slate-300 font-bold uppercase tracking-wider select-none">Harga Jual</span>
							<h3 class="font-mono font-extrabold text-xl text-sage-500 dark:text-accent mt-1">
								{formatCurrency(product.sellingPrice)}
							</h3>
						</div>

						<div class="flex flex-col gap-1.5">
							<span class="text-[10px] font-bold text-slate-450 dark:text-slate-300 uppercase tracking-wider select-none">Ketersediaan Stok</span>
							<div class="flex items-center gap-2 select-none">
								{#if product.stock <= 0}
									<span class="inline-flex items-center px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-600 rounded">
										Stok Habis
									</span>
								{:else}
									<span class="inline-flex items-center px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 rounded">
										Tersedia ({product.stock} {product.unit})
									</span>
								{/if}
							</div>
						</div>

						{#if product.notes}
							<div class="flex flex-col gap-1.5 bg-base/50 p-3.5 border border-sage-200/40 rounded-lg mt-1">
								<span class="text-[10px] font-bold text-slate-450 dark:text-slate-300 uppercase tracking-wider select-none">Keterangan Produk</span>
								<p class="text-slate-650 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-line">{product.notes}</p>
							</div>
						{/if}

						{#if settings?.businessPhone}
							<div class="pt-4 mt-2 border-t border-sage-200/20">
								<a
									href="https://wa.me/{settings.businessPhone.replace(/\D/g, '')}?text={encodeURIComponent(`Halo, saya ingin membeli produk ini:\nNama: ${product?.name}\nSKU: ${product?.sku}\nHarga: ${formatCurrency(product?.sellingPrice ?? 0)}`)}"
									target="_blank"
									class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer select-none"
								>
									<Phone class="w-4 h-4" />
									<span>Beli via WhatsApp</span>
								</a>
							</div>
						{/if}
					</div>
				</div>
			</main>

			<!-- Footer -->
			<footer class="bg-white dark:bg-surface border-t border-sage-200/25 py-8 px-4 mt-12 text-slate-550">
				<div class="max-w-4xl w-full mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
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
				<div class="max-w-4xl w-full mx-auto border-t border-sage-200/20 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-sage-400">
					<span>&copy; {new Date().getFullYear()} {settings?.businessName || 'Kasir Kita'}. Hak Cipta Dilindungi.</span>
					<span class="font-bold flex items-center gap-1">
						Powered by <span class="text-slate-800 dark:text-white font-extrabold tracking-tight inline-flex items-center gap-1">Kasir Kita <Rocket class="w-3.5 h-3.5 text-sage-500 dark:text-accent" /></span>
					</span>
				</div>
			</footer>
		</div>
	{/if}
{/if}

<style>
	@media print {
		:global(body) {
			background: white !important;
			color: black !important;
		}
		
		:global(.min-h-screen) {
			display: none !important;
		}

		.print-label-container {
			display: flex !important;
			border: none !important;
			box-shadow: none !important;
			margin: 0 !important;
			padding: 0 !important;
		}

		@page {
			size: 60mm auto;
			margin: 0;
		}
	}
</style>
