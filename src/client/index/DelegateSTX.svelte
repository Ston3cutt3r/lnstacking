<script>
	import { StackingClient } from '@stacks/stacking';
	import { openContractCall } from '@stacks/connect';
	import { principalCV, uintCV } from '@stacks/transactions';
	import { StacksTestnet, StacksMainnet } from '@stacks/network';

	import { filledArray } from '../utility/Utility';
	import { translate } from '../utility/Translations';
	import { httpGet, httpPost } from '../utility/Requests';
	import { addNotification, user, walletData } from '../utility/Stores';

	let stackingMinimum = 50;
	let initialDays = 35;
	let daysPerCycle = 35;

	let stackingCycles = Infinity;
	let stackingAmount = stackingMinimum;

	let lnChannelAddress = undefined;
	let stxDelegationAddress = undefined;

	const delegate = async () => {
		const address = $user.stxAddress;
		const config = JSON.parse(await httpGet(`/api/config`));
		const network = config.environment === 'production' ? new StacksMainnet() : new StacksTestnet();
		const client = new StackingClient(address, network);

		const coreInfo = await client.getCoreInfo();
		const poxInfo = await client.getPoxInfo();
		const cycles = stackingCycles === Infinity ? Infinity : poxInfo.next_reward_cycle_in < 200 ? stackingCycles : stackingCycles - 1;
		const untilBurnBlockHeight = cycles === Infinity ? undefined : poxInfo.next_cycle.reward_phase_start_block_height + cycles * poxInfo.reward_cycle_length;

		await openContractCall({
			network: network,
			contractAddress: poxInfo.contract_id.split('.')[0],
			contractName: poxInfo.contract_id.split('.')[1],
			functionName: 'delegate-stx',
			functionArgs: [
				uintCV(stackingAmount * 1000000), // amount-ustx
				principalCV(stxDelegationAddress), // delegate-to
				uintCV(untilBurnBlockHeight ?? 0), // until-burn-ht
			],
			appDetails: { name: 'lnstacking', icon: 'https://www.metastackdata.com/wp-content/uploads/2022/03/cropped-favicon.png' },
			onFinish: (data) => {
				console.log('Stacks Transaction:', data.stacksTransaction);
				console.log('Transaction ID:', data.txId);
				console.log('Raw transaction:', data.txRaw);
				addNotification(translate('stackingSuccessful'));
				serverDelegate(
					$user.stxAddress,
					stackingAmount * 1000000,
					poxInfo.next_reward_cycle_in < 200 ? poxInfo.next_cycle.prepare_phase_start_block_height : coreInfo.burn_block_height,
					stackingCycles === Infinity ? 999999 : stackingCycles
				);
			},
			onCancel: () => {
				addNotification(`${translate('stackingError')}: ${translate('transactionCanceled')}`);
			},
		});
	};

	const serverDelegate = async (stacker, amountMicroStx, burnBlockHeight, cycles) => {
		const result = JSON.parse(await httpPost('/api/delegate', { stacker, amountMicroStx, burnBlockHeight, cycles }));
		if (result.error) addNotification(`${translate('serverStackingError')}: ${translate(result.reason)}`);
		else addNotification(translate('serverStackingSuccessful'));
	};

	const fetchData = async () => {
		const config = JSON.parse(await httpGet(`/api/config`));
		lnChannelAddress = config.lnChannelAddress;
		stxDelegationAddress = config.stxDelegationAddress;

		const address = $user?.stxAddress ?? stxDelegationAddress;
		const network = config.environment === 'production' ? new StacksMainnet() : new StacksTestnet();
		const client = new StackingClient(address, network);

		const poxInfo = await client.getPoxInfo();
		// stackingMinimum = poxInfo.min_amount_ustx / 1000000;
		if (stackingAmount ?? 0 < stackingMinimum) stackingAmount = stackingMinimum;

		const cycleDuration = await client.getCycleDuration();
		initialDays = (poxInfo.next_reward_cycle_in < 200 ? cycleDuration : (poxInfo.next_reward_cycle_in * cycleDuration) / poxInfo.reward_cycle_length) / 86400;
		daysPerCycle = cycleDuration / 86400;
	};

	$: fetchData($user);
</script>

<div class="grid gap-4">
	<!-- LN Payout -->
	<label class="grid gap-4">
		<p class="text-justify">{translate('lnChannelDescription')}</p>
		<input class="grid bg-white/10 p-1 font-mono" type="text" placeholder={translate('lnChannel')} value={lnChannelAddress} readonly />
	</label>
	{#if $walletData}
		<!-- Stacking Cycles with Wallet -->
		<form class="grid gap-2" on:submit|preventDefault={() => delegate()}>
			<label class="grid grid-cols-auto-fit items-center gap-4">
				<span class="ellipsis">{translate('stackingCycles')}</span>
				<select class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" bind:value={stackingCycles}>
					<option class="bg-background" value={Infinity}>{Infinity}</option>
					{#each filledArray(4) as index}
						<option class="bg-background" value={index + 1}>{index + 1}</option>
					{/each}
				</select>
			</label>
			<label class="grid grid-cols-auto-fit items-center gap-4">
				<span class="ellipsis">{translate('stackingAmount')}</span>
				<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" type="number" min={stackingMinimum} required placeholder={translate('stackingAmount')} bind:value={stackingAmount} />
			</label>
			<div class="grid grid-cols-auto-fit items-start gap-4">
				<p class="col-span-3">
					<span class="">{translate('stackingPrompt1')}</span>
					<span class="text-primary">{stackingAmount ?? 0}</span>
					<span class="">{translate('stackingPrompt2')}</span>
					<span class="text-primary">{stackingCycles}</span>
					<span class="">{translate('stackingPrompt3')}</span>
					<span class="text-primary">{(initialDays + (stackingCycles - 1) * daysPerCycle).toFixed(1)}</span>
					<span class="">{translate('stackingPrompt4')}</span>
				</p>
				<button class="grid place-items-center bg-primary p-1 transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50" disabled={stackingAmount < stackingMinimum} type="submit">
					{translate('go')}
				</button>
			</div>
		</form>
	{:else}
		<!-- Stacking Cycles without Wallet -->
		<label class="grid gap-4">
			<p class="text-justify">{translate('stxDelegationDescription')}</p>
			<input class="grid bg-white/10 p-1 font-mono" type="text" placeholder={translate('stxDelegation')} value={stxDelegationAddress} readonly />
		</label>
		<p class="text-justify">
			<span class="">{translate('manualDescription1')}</span>
			<span class="text-primary">{stackingMinimum}</span>
			<span class="">{translate('manualDescription2')}</span>
		</p>
	{/if}
	<p class="text-justify text-warning">{translate('cycleDescription1')}</p>
	<p class="text-justify">{translate('cycleDescription2')}</p>
</div>
