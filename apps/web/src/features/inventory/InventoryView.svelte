<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '../../core/api';
	import { toast } from '../../lib/utils/toast.svelte';
	import Spinner from '../../components/ui/Spinner.svelte';
	import ProductTable from './components/ProductTable.svelte';
	import ProductFormModal from './components/ProductFormModal.svelte';
	import StockAdjustModal from './components/StockAdjustModal.svelte';
	import ProductShareModal from './components/ProductShareModal.svelte';
	import { Plus, Package } from 'lucide-svelte';
	import type { UIProduct } from '../../types';

	let loading = $state(true);
	let products = $state<UIProduct[]>([]);

	let showFormModal = $state(false);
	let showStockModal = $state(false);
	let showShareModal = $state(false);
	let selectedProduct = $state<UIProduct | null>(null);
	let isSaving = $state(false);

	async function loadInventory() {
		try {
			const res = await api.get('/products');
			if (res.success) {
				products = res.products;
			}
		} catch (err) {
			console.error('Error fetching inventory products:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadInventory();
	});

	function handleAdd() {
		selectedProduct = null;
		showFormModal = true;
	}

	function handleEdit(product: UIProduct) {
		selectedProduct = product;
		showFormModal = true;
	}

	function handleAdjustStock(product: UIProduct) {
		selectedProduct = product;
		showStockModal = true;
	}

	function handleShare(product: UIProduct) {
		selectedProduct = product;
		showShareModal = true;
	}

	async function handleToggleStatus(product: UIProduct) {
		try {
			const res = await api.delete(`/products?id=${product.id}`);
			if (res.success) {
				const updated = res.product;
				products = products.map((p) => (p.id === updated.id ? updated : p));
				toast.success(`Produk "${updated.name}" ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
			}
		} catch (err: any) {
			toast.error(err.message || 'Gagal mengubah status produk.');
		}
	}

	async function handleFormSave(formData: any) {
		isSaving = true;
		try {
			if (selectedProduct) {
				const res = await api.put('/products', { id: selectedProduct.id, ...formData });
				if (res.success) {
					const updated = res.product;
					products = products.map((p) => (p.id === updated.id ? updated : p));
					toast.success('Produk berhasil diperbarui!');
					showFormModal = false;
				}
			} else {
				const res = await api.post('/products', formData);
				if (res.success) {
					const newProduct = res.product;
					products = [newProduct, ...products];
					toast.success('Produk baru berhasil ditambahkan!');
					showFormModal = false;
				}
			}
		} catch (err: any) {
			toast.error(err.message || 'Gagal menyimpan produk.');
		} finally {
			isSaving = false;
		}
	}

	async function handleStockSave() {
		await loadInventory();
		showStockModal = false;
		toast.success('Stok berhasil disesuaikan!');
	}
</script>

{#if loading}
	<div class="h-64 flex items-center justify-center">
		<Spinner size="lg" />
	</div>
{:else}
	<div class="flex flex-col gap-5 text-ink">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Package class="w-5 h-5 text-sage-600 dark:text-accent" />
				<h2 class="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">Manajemen Inventori</h2>
				<span class="text-xs font-bold text-slate-500 bg-surface dark:bg-base border border-sage-200/40 px-2 py-0.5 rounded-full">
					{products.filter((p) => p.isActive).length} aktif
				</span>
			</div>
			<button
				type="button"
				onclick={handleAdd}
				class="inline-flex items-center gap-2 px-4 py-2.5 bg-sage-500 hover:bg-sage-600 text-white text-xs font-black rounded-xl shadow-md shadow-sage-500/15 cursor-pointer transition-all active:scale-[0.97]"
			>
				<Plus class="w-4 h-4" />
				Tambah Produk
			</button>
		</div>

		<!-- Product Table -->
		<ProductTable
			{products}
			onedit={handleEdit}
			onadjust={handleAdjustStock}
			onshare={handleShare}
			ontoggle={handleToggleStatus}
		/>
	</div>

	<!-- Modals -->
	{#if showFormModal}
		<ProductFormModal
			product={selectedProduct}
			isLoading={isSaving}
			{products}
			onclose={() => (showFormModal = false)}
			onsave={handleFormSave}
		/>
	{/if}

	{#if showStockModal && selectedProduct}
		<StockAdjustModal
			product={selectedProduct}
			onclose={() => (showStockModal = false)}
			onsave={handleStockSave}
		/>
	{/if}

	{#if showShareModal && selectedProduct}
		<ProductShareModal
			product={selectedProduct}
			onclose={() => (showShareModal = false)}
		/>
	{/if}
{/if}
