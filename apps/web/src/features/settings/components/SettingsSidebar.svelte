<script lang="ts">
	import { Store, ShieldCheck, Printer, Building2 } from 'lucide-svelte';

	export type TabType = 'profile' | 'security' | 'stores' | 'printer';

	interface Props {
		activeTab: TabType;
		isSuperAdmin?: boolean;
		onTabChange: (tab: TabType) => void;
	}

	let { activeTab, isSuperAdmin = false, onTabChange }: Props = $props();
</script>

<aside
	class="flex lg:flex-col gap-1.5 bg-base/90 dark:bg-surface/50 border border-slate-200/80 dark:border-slate-800/80 p-2 rounded-2xl shadow-2xs overflow-x-auto lg:overflow-visible scrollbar-none"
>
	<button
		type="button"
		onclick={() => onTabChange('profile')}
		class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer select-none shrink-0 w-full border-0
			{activeTab === 'profile'
			? 'bg-accent text-white shadow-xs'
			: 'text-slate-600 dark:text-slate-300 hover:bg-accent-soft'}"
	>
		<Store class="w-4 h-4 shrink-0" />
		<span>Profil Bisnis & Kasir</span>
	</button>

	<button
		type="button"
		onclick={() => onTabChange('security')}
		class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer select-none shrink-0 w-full border-0
			{activeTab === 'security'
			? 'bg-accent text-white shadow-xs'
			: 'text-slate-600 dark:text-slate-300 hover:bg-accent-soft'}"
	>
		<ShieldCheck class="w-4 h-4 shrink-0" />
		<span>Keamanan & Sandi</span>
	</button>

	<button
		type="button"
		onclick={() => onTabChange('printer')}
		class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer select-none shrink-0 w-full border-0
			{activeTab === 'printer'
			? 'bg-accent text-white shadow-xs'
			: 'text-slate-600 dark:text-slate-300 hover:bg-accent-soft'}"
	>
		<Printer class="w-4 h-4 shrink-0" />
		<span>Pengaturan Printer USB</span>
	</button>

	{#if isSuperAdmin}
		<button
			type="button"
			onclick={() => onTabChange('stores')}
			class="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer select-none shrink-0 w-full border-0
				{activeTab === 'stores'
				? 'bg-accent text-white shadow-xs'
				: 'text-slate-600 dark:text-slate-300 hover:bg-accent-soft'}"
		>
			<Building2 class="w-4 h-4 shrink-0" />
			<span>Kelola Daftar Brand</span>
		</button>
	{/if}
</aside>
