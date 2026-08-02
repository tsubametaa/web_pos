<script lang="ts">
	import EtalaseView from '../features/etalase/EtalaseView.svelte';

	let { productId }: { productId?: string } = $props();
</script>

<EtalaseView {productId} />
