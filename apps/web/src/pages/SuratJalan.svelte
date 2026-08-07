<script lang="ts">
	import SuratJalanView from '../features/sales/SuratJalanView.svelte';

	let { transactionId }: { transactionId: string } = $props();
</script>

<SuratJalanView {transactionId} />
