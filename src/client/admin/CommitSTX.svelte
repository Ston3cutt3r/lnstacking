<script>
	import { StackingClient } from '@stacks/stacking';
	import { StacksTestnet, StacksMainnet } from '@stacks/network';

	import { translate } from '../utility/Translations';
	import { httpGet, httpPost } from '../utility/Requests';
	import { addNotification, user } from '../utility/Stores';

	let stackingCycleMin = undefined;
	let stackingCycle = undefined;
	let stackingCycleMax = undefined;
	let cycleEnding = false;
	let hasMinimumStx = false;
	let loading = false;

	const commit = async () => {
		loading = true;
		try {
			const poolCommitment = JSON.parse(await httpPost('/api/commit'));
			if (poolCommitment.stackAggregationCommit.error) addNotification(`${translate('poolError')}: ${translate(poolCommitment.stackAggregationCommit.reason)}`);
		} catch (error) {
			addNotification(`${translate('poolError')}: ${translate('undefinedError')}`);
		}
		loading = false;
	};

	const fetchData = async () => {
		try {
			stackingCycleMax = undefined;
			stackingCycleMin = undefined;
			stackingCycle = undefined;

			const config = JSON.parse(await httpGet(`/api/config`));
			const address = $user?.stxAddress ?? config.stxDelegationAddress;
			const network = config.environment === 'production' ? new StacksMainnet() : new StacksTestnet();
			const client = new StackingClient(address, network);
			const coreInfo = await client.getCoreInfo();
			const poxInfo = await client.getPoxInfo();

			stackingCycleMax = poxInfo?.next_cycle?.prepare_phase_start_block_height ?? 0;
			stackingCycleMin = stackingCycleMax - poxInfo?.reward_cycle_length ?? 0;
			stackingCycle = coreInfo?.burn_block_height ?? 0;

			cycleEnding = stackingCycleMax - stackingCycle <= 200;
			hasMinimumStx = await client.hasMinimumStx();
		} catch (error) {
			console.error(error);
		}
	};

	$: fetchData($user);
</script>

<!-- Cycle Data -->
<div class="grid gap-4">
	<h2 class="ellipsis text-xl">{translate('stackingCommitment')}</h2>
	{#if stackingCycleMin !== undefined && stackingCycle !== undefined && stackingCycleMax !== undefined}
		<div class="relative grid border-2">
			<div class="absolute inset-0 bg-primary" style={`width:${(100 * (stackingCycle - stackingCycleMin)) / (stackingCycleMax - stackingCycleMin)}%`} />
			<div class="z-10 flex items-center justify-between p-2">
				<span class="text-sm">{stackingCycleMin.toLocaleString()}</span>
				<span class="text-md">{cycleEnding ? '✔️' : '❌'} {stackingCycleMax - stackingCycle} {translate('blocksRemaining')} {cycleEnding ? '✔️' : '❌'}</span>
				<span class="text-sm">{stackingCycleMax.toLocaleString()}</span>
			</div>
		</div>
	{:else}
		<img class="m-auto aspect-square w-12 invert" src="/icons/loading.svg" alt={translate('loading')} />
	{/if}
	<!-- 
	<div class="grid grid-cols-auto-fit place-items-center gap-4">
		<span class="ellipsis">{hasMinimumStx ? '✔️' : '❌'} {translate('hasMinimumStx')}</span>
		<span class="ellipsis">{cycleEnding ? '✔️' : '❌'} {translate('cycleEnding')}</span>
	</div>
  -->
	{#if !loading}
		<button class="m-auto grid w-1/2 place-items-center bg-primary p-2 transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50" type="button" on:click={() => commit()}>
			{translate('commit')}
		</button>
	{:else}
		<img class="m-auto aspect-square w-12 invert" src="/icons/loading.svg" alt={translate('loading')} />
	{/if}
</div>
