<script lang="ts">
	import { cart } from '../../features/pos/logic/cart.svelte';
	import { api } from '../../core/api';
	import { formatCurrency } from '../../lib/utils/currency';
	import { toast } from '../../lib/utils/toast.svelte';
	import { X, CreditCard, Banknote, Smartphone, Package } from 'lucide-svelte';
	import type { UISettings, UITransaction } from '../../types';

	interface Props {
		show: boolean;
		settings: UISettings | null;
		onclose: () => void;
		onsuccess: (transaction: UITransaction) => void;
	}

	let { show, settings, onclose, onsuccess }: Props = $props();

	const taxRate = $derived(settings?.taxRate || 0);
	const subtotal = $derived(cart.totalAmount);
	const taxAmount = $derived((subtotal * taxRate) / 100);
	const totalAmount = $derived(subtotal + taxAmount);

	let paymentMethod = $state<'cash' | 'transfer' | 'qris' | 'other'>('cash');
	let amountPaid = $state(0);
	let notes = $state('');
	let recipientName = $state('');
	let recipientPhone = $state('');
	let recipientAddress = $state('');
	let isLoading = $state(false);

	const change = $derived(paymentMethod === 'cash' ? Math.max(0, amountPaid - totalAmount) : 0);
	const canCheckout = $derived(
		paymentMethod !== 'cash' || amountPaid >= totalAmount
	);

	const paymentMethods = [
		{ value: 'cash', label: 'Tunai', icon: Banknote },
		{ value: 'transfer', label: 'Transfer', icon: CreditCard },
		{ value: 'qris', label: 'QRIS', icon: Smartphone },
		{ value: 'other', label: 'Lainnya', icon: Package }
	] as const;

	function setExactAmount() {
		amountPaid = totalAmount;
	}

	async function handleCheckout() {
		if (!canCheckout) {
			toast.error('Uang bayar kurang dari total belanja.');
			return;
		}
		isLoading = true;
		try {
			const payload = {
				items: cart.items.map((item) => ({
					productId: item.product.id,
					qty: item.qty
				})),
				paymentMethod,
				amountPaid: paymentMethod === 'cash' ? amountPaid : totalAmount,
				notes: notes || undefined,
				recipientName: recipientName.trim() || undefined,
				recipientPhone: recipientPhone.trim() || undefined,
				recipientAddress: recipientAddress.trim() || undefined
			};
			const res = await api.post('/transactions', payload);
			if (res.success) {
				onsuccess(res.transaction as UITransaction);
			} else {
				throw new Error(res.error || 'Checkout gagal.');
			}
		} catch (err: any) {
			toast.error(err.message || 'Checkout gagal. Silakan coba lagi.');
		} finally {
			isLoading = false;
		}
	}

	function handleClose() {
		if (!isLoading) onclose();
	}
</script>

{#if show}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
		role="dialog"
		aria-modal="true"
		aria-label="Modal Pembayaran"
		tabindex="-1"
	>
		<!-- Modal Panel -->
		<div
			class="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-sage-200/50 overflow-hidden text-ink"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-5 border-b border-sage-200/20 bg-base">
				<div class="flex items-center gap-2">
					<CreditCard class="w-5 h-5 text-sage-600" />
					<h2 class="text-base font-extrabold dark:text-white tracking-tight">Pembayaran</h2>
				</div>
				<button
					type="button"
					onclick={handleClose}
					class="p-2 text-slate-400 hover:text-slate-700 hover:bg-sage-50 rounded-xl transition-all cursor-pointer"
					aria-label="Tutup"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<div class="p-6 flex flex-col gap-5">
				<!-- Order Summary -->
				<div class="bg-base border border-sage-200/50 rounded-2xl p-4 flex flex-col gap-2">
					<div class="flex justify-between text-xs text-slate-600 dark:text-slate-350">
						<span>Subtotal ({cart.totalItems} item)</span>
						<span class="font-mono font-bold">{formatCurrency(subtotal)}</span>
					</div>
					{#if taxRate > 0}
						<div class="flex justify-between text-xs text-slate-600 dark:text-slate-350">
							<span>Pajak PPN ({taxRate}%)</span>
							<span class="font-mono font-bold">{formatCurrency(taxAmount)}</span>
						</div>
					{/if}
					<div class="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white border-t border-dashed border-sage-200/70 pt-2 mt-1">
						<span>Total Bayar</span>
						<span class="font-mono text-sage-600 dark:text-accent">{formatCurrency(totalAmount)}</span>
					</div>
				</div>

				<!-- Payment Method -->
				<div>
					<span class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
						Metode Pembayaran
					</span>
					<div class="grid grid-cols-4 gap-2">
						{#each paymentMethods as method}
							{@const Icon = method.icon}
							<button
								type="button"
								onclick={() => (paymentMethod = method.value)}
								class="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer
									{paymentMethod === method.value
									? 'bg-sage-500 border-sage-500 text-white shadow-md shadow-sage-500/20'
									: 'bg-white dark:bg-base border-sage-200/60 text-slate-600 dark:text-slate-300 hover:bg-sage-50 hover:border-sage-300'}"
							>
								<Icon class="w-4 h-4" />
								{method.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Cash Amount Input -->
				{#if paymentMethod === 'cash'}
					<div>
						<div class="flex items-center justify-between mb-2">
							<label class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider" for="amount-paid">
								Uang Diterima
							</label>
							<button
								type="button"
								onclick={setExactAmount}
								class="text-xs font-bold text-sage-650 dark:text-accent hover:underline cursor-pointer"
							>
								Uang Pas
							</button>
						</div>
						<div class="relative">
							<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
								{settings?.currencySymbol || 'Rp'}
							</span>
							<input
								id="amount-paid"
								type="number"
								bind:value={amountPaid}
								min={totalAmount}
								step="1000"
								class="w-full pl-10 pr-4 py-3 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-sm font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-4 transition-all"
								placeholder="0"
							/>
						</div>
						{#if amountPaid >= totalAmount}
							<div class="mt-2 flex justify-between text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-xl px-3 py-2">
								<span class="font-bold">Kembalian</span>
								<span class="font-mono font-extrabold">{formatCurrency(change)}</span>
							</div>
						{:else if amountPaid > 0}
							<p class="mt-2 text-xs text-rose-600 font-bold">
								Kurang {formatCurrency(totalAmount - amountPaid)}
							</p>
						{/if}
					</div>
				{/if}

				<!-- Recipient Information (Surat Jalan & Invoice) -->
				<div class="space-y-3 border-t border-dashed border-sage-200/50 pt-3">
					<span class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
						Informasi Penerima (Surat Jalan & Invoice)
					</span>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="text-[11px] font-bold text-slate-500 block mb-1" for="recipient-name">Nama Penerima</label>
							<input
								id="recipient-name"
								type="text"
								bind:value={recipientName}
								placeholder="Nama Pembeli / Penerima"
								class="w-full px-3 py-2 bg-white dark:bg-base border border-sage-200 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500/20"
							/>
						</div>
						<div>
							<label class="text-[11px] font-bold text-slate-500 block mb-1" for="recipient-phone">No. HP Penerima</label>
							<input
								id="recipient-phone"
								type="text"
								bind:value={recipientPhone}
								placeholder="08123456789"
								class="w-full px-3 py-2 bg-white dark:bg-base border border-sage-200 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500/20"
							/>
						</div>
					</div>
					<div>
						<label class="text-[11px] font-bold text-slate-500 block mb-1" for="recipient-address">Alamat Pengiriman / Penerima</label>
						<textarea
							id="recipient-address"
							bind:value={recipientAddress}
							rows="2"
							placeholder="Alamat lengkap penerima..."
							class="w-full px-3 py-2 bg-white dark:bg-base border border-sage-200 rounded-xl text-xs text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-sage-500/20"
						></textarea>
					</div>
				</div>

				<!-- Notes -->
				<div>
					<label class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2" for="checkout-notes">
						Catatan (opsional)
					</label>
					<textarea
						id="checkout-notes"
						bind:value={notes}
						rows="2"
						placeholder="Catatan transaksi..."
						class="w-full px-3.5 py-2.5 bg-white dark:bg-base border border-sage-200 focus:ring-sage-500/10 focus:border-sage-500 rounded-xl text-xs text-slate-700 dark:text-slate-200 resize-none focus:outline-none focus:ring-4 transition-all"
					></textarea>
				</div>

				<!-- Checkout Button -->
				<button
					type="button"
					onclick={handleCheckout}
					disabled={!canCheckout || isLoading}
					class="w-full inline-flex items-center justify-center gap-2 px-5 py-4 bg-sage-500 hover:bg-sage-600 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-black uppercase tracking-wider rounded-xl shadow-md shadow-sage-500/15 active:scale-[0.97] transition-all duration-200 cursor-pointer"
				>
					{#if isLoading}
						<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
						Memproses...
					{:else}
						<CreditCard class="w-4 h-4" />
						Konfirmasi Pembayaran
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
