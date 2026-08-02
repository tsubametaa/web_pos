<script lang="ts">
	import InvoiceView from '../features/sales/InvoiceView.svelte';

	let { transactionId }: { transactionId: string } = $props();
</script>

<InvoiceView {transactionId} />
