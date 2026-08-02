<script lang="ts">
	/* ProductFormModal.svelte - Modal component to create or update products with category autocompletion */
	import { toast } from '../../../lib/utils/toast.svelte';
	import { X, Save } from 'lucide-svelte';
	import Fuse from 'fuse.js';
	import type { UIProduct } from '../../../types';

	interface Props {
		product: UIProduct | null;
		isLoading: boolean;
		products?: UIProduct[];
		onclose: () => void;
		onsave: (data: any) => void;
	}

	let { product, isLoading, products = [], onclose, onsave }: Props = $props();

	let name = $state('');
	let category = $state('');
	let unit = $state('pcs');
	let costPrice = $state(0);
	let sellingPrice = $state(0);
	let stock = $state(0);
	let minStock = $state(10);
	let imageUrl = $state('');
	let notes = $state('');
	let isFocused = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);
	let uploading = $state(false);

	async function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		uploading = true;
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch('http://localhost:3000/api/uploads/upload', {
				method: 'POST',
				body: formData,
				credentials: 'include'
			});

			// Safely parse the JSON response (some error responses may be plain text)
			let result: any;
			const contentType = response.headers.get('content-type') || '';
			if (contentType.includes('application/json')) {
				result = await response.json();
			} else {
				const text = await response.text();
				result = { success: false, error: text || `HTTP ${response.status}` };
			}

			if (response.ok && result.success) {
				imageUrl = result.url;
				toast.success('Gambar berhasil diunggah!');
			} else if (response.status === 401) {
				toast.error('Sesi habis, silakan login kembali.');
			} else {
				toast.error(result.error || `Gagal mengunggah gambar (${response.status}).`);
			}
		} catch (err: any) {
			console.error('File upload error:', err);
			toast.error('Gagal mengunggah gambar: Koneksi ke server bermasalah.');
		} finally {
			uploading = false;
			if (target) target.value = '';
		}
	}

	$effect(() => {
		name = product?.name ?? '';
		category = product?.category ?? '';
		unit = product?.unit ?? 'pcs';
		costPrice = product?.costPrice ?? 0;
		sellingPrice = product?.sellingPrice ?? 0;
		stock = product?.stock ?? 0;
		minStock = product?.minStock ?? 10;
		imageUrl = product?.imageUrl ?? '';
		notes = product?.notes ?? '';
	});

	const isEdit = $derived(!!product?.id);

	// Extract unique categories for fuzzy matching dropdown
	const existingCategories = $derived([
		...new Set(products.map((p) => p.category).filter(Boolean))
	]);

	const categoryFuse = $derived(new Fuse(existingCategories, {
		threshold: 0.4,
		shouldSort: true
	}));

	// Real-time suggestions including Title Case and fuzzy matching existing ones
	const categorySuggestions = $derived.by(() => {
		const query = category.trim();
		if (!query) return [];

		if (existingCategories.includes(query)) return [];

		const matches = categoryFuse.search(query).map((res) => res.item);
		const titleCasedQuery = toTitleCase(query);
		const suggestions = [...matches];

		if (!existingCategories.includes(titleCasedQuery) && !suggestions.includes(titleCasedQuery)) {
			suggestions.unshift(titleCasedQuery);
		}

		return suggestions.filter((sug) => sug !== query).slice(0, 5);
	});

	function toTitleCase(str: string): string {
		return str
			.toLowerCase()
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	// Normalize casing to match existing categories case-insensitively, or title-case new ones
	function normalizeCategory(cat: string): string {
		const trimmed = cat.trim();
		const match = products.find(
			(p) => p.category && p.category.toLowerCase() === trimmed.toLowerCase()
		);
		return match?.category ? match.category : toTitleCase(trimmed);
	}

	function handleSubmit() {
		if (!name.trim()) { toast.error('Nama produk wajib diisi.'); return; }
		if (!category.trim()) { toast.error('Kategori wajib diisi.'); return; }
		if (!unit.trim()) { toast.error('Satuan wajib diisi.'); return; }
		if (costPrice < 0) { toast.error('HPP tidak boleh negatif.'); return; }
		if (sellingPrice < 0) { toast.error('Harga jual tidak boleh negatif.'); return; }

		onsave({
			name: name.trim(),
			category: normalizeCategory(category),
			unit: unit.trim(),
			costPrice: Number(costPrice),
			sellingPrice: Number(sellingPrice),
			stock: Number(stock),
			minStock: Number(minStock),
			imageUrl: imageUrl.trim() || undefined,
			notes: notes.trim() || undefined
		});
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
	onclick={onclose}
	onkeydown={(e) => e.key === 'Escape' && onclose()}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<div
		class="relative w-full max-w-lg bg-surface border border-sage-200/50 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-ink"
		onclick={(e) => e.stopPropagation()}
		role="presentation"
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-6 py-4 border-b border-sage-200/25 bg-base/20">
			<h2 class="text-sm font-extrabold text-slate-800 dark:text-white">{isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
			<button type="button" onclick={onclose} class="p-2 text-slate-400 hover:text-slate-700 hover:bg-base rounded-xl cursor-pointer transition-all bg-transparent border-0">
				<X class="w-4 h-4" />
			</button>
		</div>

		<!-- Form Body -->
		<div class="flex-1 overflow-y-auto px-6 py-5">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<!-- Name -->
				<div class="sm:col-span-2">
					<label class="block text-xs font-bold text-slate-650 dark:text-slate-300 mb-1.5" for="prod-name">Nama Produk *</label>
					<input id="prod-name" type="text" bind:value={name} placeholder="Contoh: Kaos Polos Putih"
						class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all" />
				</div>

				<!-- Category -->
				<div class="relative">
					<label class="block text-xs font-bold text-slate-650 dark:text-slate-300 mb-1.5" for="prod-cat">Kategori *</label>
					<input 
						id="prod-cat" 
						type="text" 
						bind:value={category} 
						placeholder="Contoh: Pakaian"
						autocomplete="off"
						onfocus={() => (isFocused = true)}
						onblur={() => setTimeout(() => (isFocused = false), 200)}
						class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all" 
					/>
					
					{#if isFocused && categorySuggestions.length > 0}
						<div class="absolute left-0 right-0 z-10 mt-1 bg-white dark:bg-surface border border-sage-200/80 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1.5">
							{#each categorySuggestions as sug}
								<button
									type="button"
									onclick={() => (category = sug)}
									class="w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-base text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
								>
									{sug}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Unit -->
				<div>
					<label class="block text-xs font-bold text-slate-650 dark:text-slate-300 mb-1.5" for="prod-unit">Satuan *</label>
					<input id="prod-unit" type="text" bind:value={unit} placeholder="pcs / kg / liter"
						class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all" />
				</div>

				<!-- Cost Price -->
				<div>
					<label class="block text-xs font-bold text-slate-650 dark:text-slate-300 mb-1.5" for="prod-cost">HPP (Modal) *</label>
					<input id="prod-cost" type="number" bind:value={costPrice} min="0" step="100"
						class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all" />
				</div>

				<!-- Selling Price -->
				<div>
					<label class="block text-xs font-bold text-slate-650 dark:text-slate-300 mb-1.5" for="prod-sell">Harga Jual *</label>
					<input id="prod-sell" type="number" bind:value={sellingPrice} min="0" step="100"
						class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all" />
				</div>

				<!-- Stock -->
				<div>
					<label class="block text-xs font-bold text-slate-650 dark:text-slate-300 mb-1.5" for="prod-stock">Stok Awal</label>
					<input id="prod-stock" type="number" bind:value={stock} min="0"
						class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all" />
				</div>

				<!-- Min Stock -->
				<div>
					<label class="block text-xs font-bold text-slate-650 dark:text-slate-300 mb-1.5" for="prod-minstock">Stok Minimal (Alert)</label>
					<input id="prod-minstock" type="number" bind:value={minStock} min="0"
						class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all" />
				</div>

				<!-- Image Upload & URL -->
				<div class="sm:col-span-2 flex flex-col gap-2">
					<label class="block text-xs font-bold text-slate-650 dark:text-slate-300" for="prod-img">Gambar Produk (opsional)</label>
					
					<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
						{#if imageUrl}
							<div class="relative w-20 h-20 rounded-2xl border border-sage-200 overflow-hidden shrink-0 bg-base/10 group">
								<img src={imageUrl} alt="Pratinjau produk" class="w-full h-full object-cover" />
								<button 
									type="button" 
									onclick={() => imageUrl = ''} 
									class="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs font-bold cursor-pointer border-0"
								>
									Hapus
								</button>
							</div>
						{/if}

						<div class="flex-1 w-full flex flex-col gap-1.5">
							<div class="flex gap-2 w-full">
								<input id="prod-img" type="url" bind:value={imageUrl} placeholder="Tempel URL gambar atau unggah file..."
									class="flex-1 px-3.5 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all" />
								
								<input 
									type="file" 
									id="file-upload" 
									class="hidden" 
									accept="image/png, image/jpeg, image/webp, image/heic, .heic" 
									bind:this={fileInput}
									onchange={handleFileChange}
								/>
								
								<button
									type="button"
									onclick={() => fileInput?.click()}
									disabled={uploading}
									class="px-4 py-2.5 bg-accent-soft hover:bg-accent-soft/80 dark:bg-accent-soft/20 text-accent font-bold text-xs rounded-xl transition-all cursor-pointer border-0 whitespace-nowrap flex items-center gap-1.5"
								>
									{#if uploading}
										<span class="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin"></span>
										<span>Mengunggah...</span>
									{:else}
										<span>Pilih File</span>
									{/if}
								</button>
							</div>
							<p class="text-[10px] text-slate-400 font-medium">Menerima format: JPG, PNG, WEBP, HEIC</p>
						</div>
					</div>
				</div>

				<!-- Notes -->
				<div class="sm:col-span-2">
					<label class="block text-xs font-bold text-slate-650 dark:text-slate-300 mb-1.5" for="prod-notes">Keterangan / Spesifikasi</label>
					<textarea id="prod-notes" bind:value={notes} rows="2" placeholder="Deskripsi produk..."
						class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-sm text-slate-700 dark:text-slate-200 resize-none focus:outline-none focus:ring-4 transition-all"></textarea>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="px-6 pb-6 pt-3 border-t border-sage-200/25">
			<button
				type="button"
				onclick={handleSubmit}
				disabled={isLoading}
				class="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-sage-500 hover:bg-sage-600 disabled:opacity-50 text-white text-sm font-black rounded-xl cursor-pointer transition-all shadow-md shadow-sage-500/15 active:scale-[0.97]"
			>
				{#if isLoading}
					<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
					Menyimpan...
				{:else}
					<Save class="w-4 h-4" />
					{isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
				{/if}
			</button>
		</div>
	</div>
</div>
