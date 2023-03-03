<script>
	import DelegateSTX from './DelegateSTX.svelte';
	import ConnectWallet from './ConnectWallet.svelte';
	import { translate } from '../utility/Translations';
	import { user, walletData } from '../utility/Stores';
	import { httpGet, httpPost } from '../utility/Requests';
	import StackingRewards from './StackingRewards.svelte';

	let userCopy = undefined;

	let feeLevel = undefined;
	let rewards = undefined;

	const fetchData = async () => {
		try {
			userCopy = JSON.parse(JSON.stringify($user));

			const lnChannel = JSON.parse(await httpGet(`/api/lnChannel?lnKey=${userCopy.lnKey}`));
			if (lnChannel && lnChannel.capacity > 2500000) feeLevel = 3;
			else if (userCopy.lnKey) feeLevel = 2;
			else feeLevel = 1;
			rewards = parseFloat(JSON.parse(await httpGet(`/api/rewards`)).reward_amount);
		} catch (error) {
			console.error(error);
		}
	};

	const saveData = async () => {
		try {
			const result = JSON.parse(await httpPost('/api/paymentInfo', userCopy));
			user.set(result);
		} catch (error) {
			console.error(error);
		}
	};

	$: fetchData($user);
</script>

{#if userCopy}
	<div class="m-auto grid gap-16 p-4">
		<div class="grid gap-16 lg:grid-cols-2">
			<div class="grid h-fit gap-16">
				<!-- User Data -->
				<div class="grid gap-4">
					<div class="grid grid-cols-auto-fit place-items-center gap-4">
						<img class="aspect-square w-24 object-contain invert" src="/favicon.png" alt={translate('user')} />
						<p class="col-span-3 text-justify">{translate('lnstackingDescription')}</p>
					</div>
					<form class="grid gap-2" on:submit|preventDefault={() => saveData()}>
						<label class="grid grid-cols-auto-fit items-center gap-4">
							<span class="ellipsis">{translate('stxAddress')}</span>
							<input class="col-span-3 grid bg-white/10 p-1 font-mono disabled:opacity-50" type="text" placeholder={translate('stxAddress')} disabled={$walletData} bind:value={userCopy.stxAddress} />
						</label>
						<label class="grid grid-cols-auto-fit items-center gap-4">
							<span class="ellipsis">{translate('btcAddress')}</span>
							<input class="col-span-3 grid bg-white/10 p-1 font-mono disabled:opacity-50" type="text" placeholder={translate('btcAddress')} disabled={$walletData} bind:value={userCopy.btcAddress} />
						</label>
						<label class="grid grid-cols-auto-fit items-center gap-4">
							<span class="ellipsis">{translate('lnKey')}</span>
							<input class="col-span-3 grid bg-white/10 p-1 font-mono disabled:opacity-50" type="text" placeholder={translate('lnKey')} bind:value={userCopy.lnKey} />
						</label>
						<div class="grid grid-cols-auto-fit gap-4">
							<div class="col-span-3 grid grid-cols-auto-fit gap-2">
								<div />
								<button
									class="grid place-items-center bg-background p-1 transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
									disabled={JSON.stringify($user) === JSON.stringify(userCopy)}
									type="button"
									on:click={() => fetchData()}
								>
									{translate('cancel')}
								</button>
								<button
									class="grid place-items-center bg-primary p-1 transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
									disabled={JSON.stringify($user) === JSON.stringify(userCopy)}
									type="submit"
								>
									{translate('save')}
								</button>
								<ConnectWallet />
							</div>
						</div>
					</form>
				</div>
				<DelegateSTX />
			</div>
			<div class="grid h-fit gap-16">
				<StackingRewards />
				<!-- Fee Data -->
				<div class="grid gap-4">
					<div class="grid place-items-center gap-4" style="grid: auto / repeat(auto-fit, minmax(5rem, 1fr))">
						<div class="grid w-24 gap-4 text-center">
							<div class="relative grid aspect-square rounded-full border-2 transition-all" class:bg-primary={feeLevel === 3}>
								<div class="absolute inset-0 flex flex-col justify-center">
									{#if feeLevel}
										<span class="ellipsis">{translate('lnChannel')}</span>
										<span class="ellipsis text-sm">0% {translate('fee')}</span>
									{:else}
										<img class="m-auto aspect-square w-32 invert" src="/icons/loading.svg" alt={translate('loading')} />
									{/if}
								</div>
							</div>
						</div>
						<div class="grid w-24 gap-4 text-center">
							<div class="relative grid aspect-square rounded-full border-2 transition-all" class:bg-primary={feeLevel === 2}>
								<div class="absolute inset-0 flex flex-col justify-center">
									{#if feeLevel}
										<span class="ellipsis">{translate('lnAddress')}</span>
										<span class="ellipsis text-sm">3% {translate('fee')}</span>
									{:else}
										<img class="m-auto aspect-square w-32 invert" src="/icons/loading.svg" alt={translate('loading')} />
									{/if}
								</div>
							</div>
						</div>
						<div class="grid w-24 gap-4 text-center">
							<div class="relative grid aspect-square rounded-full border-2 transition-all" class:bg-primary={feeLevel === 1}>
								<div class="absolute inset-0 flex flex-col justify-center">
									{#if feeLevel}
										<span class="ellipsis">{translate('onchain')}</span>
										<span class="ellipsis text-sm">3% {translate('fee')}</span>
									{:else}
										<img class="m-auto aspect-square w-32 invert" src="/icons/loading.svg" alt={translate('loading')} />
									{/if}
								</div>
							</div>
						</div>
					</div>
					<div class="text-center">{translate('dataUpdateNote')}</div>
				</div>
				<!-- Reward Data -->
				<div class="m-auto grid w-full max-w-[50%] gap-4 border-2 p-8 text-center">
					<div class="grid">{translate('cumulativeStackingRewards')}:</div>
					{#if rewards !== undefined}
						<div class="grid">
							<span class="ellipsis text-xl font-bold">{rewards.toLocaleString()}</span>
							<span class="ellipsis">SATS</span>
						</div>
					{:else}
						<img class="m-auto aspect-square w-16 invert" src="/icons/loading.svg" alt={translate('loading')} />
					{/if}
					<!-- <p class="text-center">{translate('nextPayout1')} {nextPayoutAmount} {translate('nextPayout2')} {nextPayoutDate.toLocaleString()}</p> -->
				</div>
				<a class="flex items-center justify-center gap-4 bg-background p-2 transition-all hover:brightness-110" href="https://metastackdata.com" target="_blank" rel="noreferrer">
					<img class="aspect-square w-16 object-contain p-2 invert" src="/icons/arrowCircle.svg" alt={translate('link')} />
					<p class="text-justify">{translate('transparencyDescription')}</p>
				</a>
			</div>
		</div>
	</div>
{/if}
