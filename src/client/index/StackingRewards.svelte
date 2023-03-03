<script>
	import { slide } from 'svelte/transition';
	import { StackingClient } from '@stacks/stacking';
	import { openContractCall } from '@stacks/connect';
	import { StacksTestnet, StacksMainnet } from '@stacks/network';

	import { httpGet } from '../utility/Requests';
	import { translate } from '../utility/Translations';
	import { addNotification, user, walletData } from '../utility/Stores';

	let stackingCycleMin = undefined;
	let stackingCycle = undefined;
	let stackingCycleMax = undefined;

	let stackingProgressMin = undefined;
	let stackingProgress = undefined;
	let stackingProgressMax = undefined;

	let canRevoke = false;

	const revoke = async () => {
		const address = $user.stxAddress;
		const config = JSON.parse(await httpGet(`/api/config`));
		const network = config.environment === 'production' ? new StacksMainnet() : new StacksTestnet();
		const client = new StackingClient(address, network);
		const poxInfo = await client.getPoxInfo();

		await openContractCall({
			network: network,
			contractAddress: poxInfo.contract_id.split('.')[0],
			contractName: poxInfo.contract_id.split('.')[1],
			functionName: 'revoke-delegate-stx',
			functionArgs: [],
			appDetails: { name: 'lnstacking', icon: 'https://www.metastackdata.com/wp-content/uploads/2022/03/cropped-favicon.png' },
			onFinish: (data) => {
				console.log('Stacks Transaction:', data.stacksTransaction);
				console.log('Transaction ID:', data.txId);
				console.log('Raw transaction:', data.txRaw);
				addNotification(translate('revocationSuccessful'));
			},
			onCancel: () => {
				addNotification(`${translate('revocationError')}: ${translate('transactionCanceled')}`);
			},
		});
	};

	const fetchData = async () => {
		try {
			stackingCycleMax = undefined;
			stackingCycleMin = undefined;
			stackingCycle = undefined;
			stackingProgressMin = undefined;
			stackingProgress = undefined;
			stackingProgressMax = undefined;

			const config = JSON.parse(await httpGet(`/api/config`));
			const address = $user?.stxAddress ?? config.stxDelegationAddress;
			const network = config.environment === 'production' ? new StacksMainnet() : new StacksTestnet();
			const client = new StackingClient(address, network);
			const coreInfo = await client.getCoreInfo();
			const poxInfo = await client.getPoxInfo();
			const responseBalancesInfo = $user?.stxAddress ? await client.getAccountExtendedBalances() : undefined;

			stackingCycleMax = poxInfo?.next_cycle?.prepare_phase_start_block_height ?? 0;
			stackingCycleMin = stackingCycleMax - poxInfo?.reward_cycle_length ?? 0;
			stackingCycle = coreInfo?.burn_block_height ?? 0;

			stackingProgressMin = responseBalancesInfo?.stx?.burnchain_lock_height ?? 0;
			stackingProgress = coreInfo?.burn_block_height ?? 0;
			stackingProgressMax = responseBalancesInfo?.stx?.burnchain_unlock_height ?? 0;

			canRevoke = $user?.stxAddress ? (await client.getStatus()).stacked : false;
		} catch (error) {
			console.error(error);
		}
	};

	$: fetchData($user);
</script>

<!-- Cycle Data -->
<div class="grid gap-4">
	<span class="ellipsis">{translate('stackingCycle')}</span>
	{#if stackingCycleMin !== undefined && stackingCycle !== undefined && stackingCycleMax !== undefined}
		<div class="relative grid border-2">
			<div class="absolute inset-0 bg-primary" style={`width:${(100 * (stackingCycle - stackingCycleMin)) / (stackingCycleMax - stackingCycleMin)}%`} />
			<div class="z-10 flex items-center justify-between p-2">
				<span class="text-sm">{stackingCycleMin.toLocaleString()}</span>
				<span class="text-md">{stackingCycle.toLocaleString()}</span>
				<span class="text-sm">{stackingCycleMax.toLocaleString()}</span>
			</div>
		</div>
	{:else}
		<img class="m-auto aspect-square w-12 invert" src="/icons/loading.svg" alt={translate('loading')} />
	{/if}
	<span class="ellipsis">{translate('yourStackingProgress')}</span>
	{#if stackingProgressMin !== undefined && stackingProgress !== undefined && stackingProgressMax !== undefined}
		{#if stackingProgressMax === 0}
			<div class="relative grid border-2">
				<span class="p-2 text-center">{translate('noStackingProgress')}</span>
			</div>
		{:else}
			<div class="relative grid border-2">
				<div class="absolute inset-0 bg-primary" style={`width:${(100 * (stackingProgress - stackingProgressMin)) / (stackingProgressMax - stackingProgressMin)}%`} />
				<div class="z-10 flex items-center justify-between p-2">
					<span class="text-sm">{stackingProgressMin.toLocaleString()}</span>
					<span class="text-md">{stackingProgress.toLocaleString()}</span>
					<span class="text-sm">{stackingProgressMax.toLocaleString()}</span>
				</div>
			</div>
		{/if}
	{:else}
		<img class="m-auto aspect-square w-12 invert" src="/icons/loading.svg" alt={translate('loading')} />
	{/if}
	{#if $walletData}
		<button
			class="m-auto grid w-1/2 place-items-center bg-danger p-1 transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
			disabled={!canRevoke}
			type="button"
			on:click={() => revoke()}
			transition:slide|local
		>
			{translate('revokeDelegations')}
		</button>
	{/if}
</div>
