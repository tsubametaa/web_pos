<script lang="ts">
	import PaymentModal from '../../features/pos/components/PaymentModal.svelte';
	import type { UISettings, UITransaction } from '../../types';

	interface Props {
		show: boolean;
		settings: UISettings | null;
		onclose: () => void;
		onsuccess: (transaction: UITransaction) => void;
	}

	let props: Props = $props();
</script>

<PaymentModal {...props} />
