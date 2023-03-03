<script>
	import { fade, slide } from 'svelte/transition';

	import { errors, notifications } from '../utility/Stores';

	const formatMessage = (message) => {
		const result = message.map((arg) => {
			if (Array.isArray(arg)) return `<Array${arg.length}>`;
			else if (typeof arg === 'object') {
				if (arg.message) return arg.message;
				else return '<Object>';
			} else return arg;
		});
		return result.join(' ');
	};
</script>

{#if Object.values($errors).length > 0 || Object.values($notifications).length > 0}
	<div class="fixed inset-x-0 bottom-0 grid gap-2 p-4" transition:fade|local>
		<!-- 
		{#if Object.values($errors).length > 0}
			<div class="grid max-h-80 overflow-auto bg-danger p-2 text-sm text-background opacity-95 shadow" transition:fade|local>
				{#each Object.values($errors).sort((a, b) => b.date - a.date) as error (error.id)}
					<div class="ellipsis h-8 border-b-2 border-background py-1 last-of-type:border-0 text-lg" transition:slide|local>{formatMessage(error.message)}</div>
				{/each}
			</div>
		{/if}
    -->
		{#if Object.values($notifications).length > 0}
			<div class="grid max-h-80 overflow-auto bg-secondary p-2 text-sm text-background opacity-95 shadow" transition:fade|local>
				{#each Object.values($notifications).sort((a, b) => b.date - a.date) as notification (notification.id)}
					<div class="ellipsis h-8 border-b-2 border-background py-1 text-lg font-bold last-of-type:border-0" transition:slide|local>{formatMessage(notification.message)}</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
