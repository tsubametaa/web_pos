<script lang="ts">
	import { KeyRound, Lock, Save, Check } from 'lucide-svelte';

	interface Props {
		oldPassword: string;
		newPassword: string;
		confirmNewPassword: string;
		securitySaving: boolean;
		onSubmit: (e: SubmitEvent) => void;
	}

	let {
		oldPassword = $bindable(),
		newPassword = $bindable(),
		confirmNewPassword = $bindable(),
		securitySaving,
		onSubmit
	}: Props = $props();

	// Password validation criteria
	const hasMinLength = $derived(newPassword.length >= 6);
	const hasLetter = $derived(/[a-zA-Z]/.test(newPassword));
	const hasNumber = $derived(/[0-9]/.test(newPassword));
	const isNewPasswordValid = $derived(hasMinLength && hasLetter && hasNumber);
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start select-none">
	<!-- Left: Password Change Form -->
	<div class="md:col-span-2">
		<form
			onsubmit={onSubmit}
			class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-6 shadow-2xs space-y-5"
		>
			<div class="border-b border-slate-200/60 dark:border-emerald-950/60 pb-3 flex items-center gap-3">
				<div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
					<KeyRound class="w-5 h-5" />
				</div>
				<div>
					<h2 class="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
						Kredensial Keamanan Akun
					</h2>
					<p class="text-xs text-slate-500 dark:text-emerald-500/70 font-medium mt-0.5">
						Perbarui kata sandi utama toko Anda secara berkala untuk menjaga keamanan data.
					</p>
				</div>
			</div>

			<div>
				<label
					class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
					for="pass-old"
				>
					Password Saat Ini *
				</label>
				<div class="relative">
					<Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
					<input
						id="pass-old"
						type="password"
						bind:value={oldPassword}
						placeholder="Masukkan password lama"
						required
						disabled={securitySaving}
						class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
					/>
				</div>
			</div>

			<div>
				<label
					class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
					for="pass-new"
				>
					Password Baru *
				</label>
				<div class="relative">
					<Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
					<input
						id="pass-new"
						type="password"
						bind:value={newPassword}
						placeholder="Masukkan password baru"
						required
						disabled={securitySaving}
						class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
					/>
				</div>
			</div>

			<div>
				<label
					class="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5"
					for="pass-confirm"
				>
					Konfirmasi Password Baru *
				</label>
				<div class="relative">
					<Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
					<input
						id="pass-confirm"
						type="password"
						bind:value={confirmNewPassword}
						placeholder="Ketik ulang password baru"
						required
						disabled={securitySaving}
						class="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-base border border-slate-200/80 dark:border-emerald-950/80 focus:border-emerald-500 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs"
					/>
				</div>
				{#if newPassword && confirmNewPassword && newPassword !== confirmNewPassword}
					<p class="text-[11px] font-bold text-rose-500 mt-1">
						Konfirmasi password baru tidak cocok.
					</p>
				{/if}
			</div>

			<div class="pt-3 border-t border-slate-200/60 dark:border-emerald-950/60 flex justify-end">
				<button
					type="submit"
					disabled={securitySaving ||
						!oldPassword ||
						!newPassword ||
						newPassword !== confirmNewPassword ||
						!isNewPasswordValid}
					class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs disabled:pointer-events-none"
				>
					{#if securitySaving}
						<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
						<span>Menyimpan...</span>
					{:else}
						<Save class="w-4 h-4" />
						<span>Perbarui Password</span>
					{/if}
				</button>
			</div>
		</form>
	</div>

	<!-- Right: Password Criteria Card -->
	<div class="md:col-span-1">
		<div
			class="bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-emerald-950/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xs"
		>
			<div class="border-b border-slate-200/60 dark:border-emerald-950/60 pb-2.5">
				<span class="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
					Kriteria Keamanan Password
				</span>
			</div>

			<ul class="flex flex-col gap-3 text-xs">
				<li class="flex items-center gap-2.5">
					<div
						class="w-4 h-4 rounded-full flex items-center justify-center border shrink-0 transition-colors
							{hasMinLength
							? 'bg-emerald-600 border-emerald-600 text-white'
							: 'bg-base dark:bg-base/60 border-slate-300 text-slate-400'}"
					>
						{#if hasMinLength}
							<Check class="w-2.5 h-2.5 stroke-3" />
						{:else}
							<span class="w-1 h-1 rounded-full bg-slate-400"></span>
						{/if}
					</div>
					<span class={hasMinLength ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-500'}>
						Minimal 6 karakter
					</span>
				</li>

				<li class="flex items-center gap-2.5">
					<div
						class="w-4 h-4 rounded-full flex items-center justify-center border shrink-0 transition-colors
							{hasLetter
							? 'bg-emerald-600 border-emerald-600 text-white'
							: 'bg-base dark:bg-base/60 border-slate-300 text-slate-400'}"
					>
						{#if hasLetter}
							<Check class="w-2.5 h-2.5 stroke-3" />
						{:else}
							<span class="w-1 h-1 rounded-full bg-slate-400"></span>
						{/if}
					</div>
					<span class={hasLetter ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-500'}>
						Mengandung huruf (A-Z, a-z)
					</span>
				</li>

				<li class="flex items-center gap-2.5">
					<div
						class="w-4 h-4 rounded-full flex items-center justify-center border shrink-0 transition-colors
							{hasNumber
							? 'bg-emerald-600 border-emerald-600 text-white'
							: 'bg-base dark:bg-base/60 border-slate-300 text-slate-400'}"
					>
						{#if hasNumber}
							<Check class="w-2.5 h-2.5 stroke-3" />
						{:else}
							<span class="w-1 h-1 rounded-full bg-slate-400"></span>
						{/if}
					</div>
					<span class={hasNumber ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-500'}>
						Mengandung angka (0-9)
					</span>
				</li>
			</ul>
		</div>
	</div>
</div>
