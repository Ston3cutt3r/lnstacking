<script>
	import { showConnect } from '@stacks/connect';

	import { translate } from '../utility/Translations';
	import { httpGet, httpPost } from '../utility/Requests';
	import { addNotification, user, userSession, walletData } from '../utility/Stores';

	const authenticate = async () => {
		showConnect({
			appDetails: { name: 'lnstacking', icon: 'https://www.metastackdata.com/wp-content/uploads/2022/03/cropped-favicon.png' },
			redirectTo: '/',
			userSession,
			onFinish: () => {
				walletData.set(userSession.loadUserData());
			},
			onCancel: () => {
				addNotification(`${translate('connectionError')}: ${translate('connectionCanceled')}`);
			},
		});
	};

	const disconnect = () => {
		userSession.signUserOut();
		walletData.set(undefined);
	};

	const saveData = async () => {
		try {
			const userCopy = JSON.parse(JSON.stringify($user));
			const config = JSON.parse(await httpGet(`/api/config`));
			userCopy.stxAddress = config.environment === 'production' ? $walletData?.profile?.stxAddress?.mainnet : $walletData?.profile?.stxAddress?.testnet;
			userCopy.btcAddress = $walletData?.identityAddress;
			const result = JSON.parse(await httpPost('/api/paymentInfo', userCopy));
			user.set(result);
		} catch (error) {
			console.error(error);
		}
	};

	$: saveData($walletData);
</script>

{#if $walletData}
	<button class="grid place-items-center bg-warning p-1 transition-all hover:brightness-110" type="button" on:click={disconnect}>{translate('disconnectWallet')}</button>
{:else}
	<button class="grid place-items-center bg-primary p-1 transition-all hover:brightness-110" type="button" on:click={authenticate}>{translate('connectWallet')}</button>
{/if}
