<script>
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="fixed inset-0 z-10 grid bg-black/50" on:click={() => dispatch('backgroundClick')} transition:fade|local>
	<div class="m-auto max-h-[85%] max-w-[85%] overflow-y-auto bg-background shadow-lg" on:click|stopPropagation>
		<slot />
	</div>
</div>
