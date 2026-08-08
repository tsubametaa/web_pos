<script lang="ts">
	import CombinedPrintView from '../features/sales/CombinedPrintView.svelte';

	let { transactionId }: { transactionId: string } = $props();
</script>

<CombinedPrintView {transactionId} />
