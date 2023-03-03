<script>
	import { getHash } from '../utility/Utility';
	import { httpPost } from '../utility/Requests';
	import { translate } from '../utility/Translations';

	let password = '';
	let passwordRepeat = '';
	let complete = false;

	$: passwordMismatch = password && passwordRepeat && password !== passwordRepeat;

	const handleSubmit = async () => {
		try {
			if (!passwordMismatch) {
				const token = new URLSearchParams(location.search).get('token');
				await httpPost('/api/resetPassword', { token: token, password: await getHash(password) });
				complete = true;
			}
		} catch (error) {
			console.error(error);
		}
	};
</script>

{#if !complete}
	<form class="m-auto grid w-full max-w-[25rem] gap-4 text-center" on:submit|preventDefault={handleSubmit}>
		<label class="grid">
			<span class="ellipsis">{translate('password')}</span>
			<input class="bg-primary/10 p-2" type="password" name="password" placeholder={translate('password')} bind:value={password} />
		</label>
		<label class="grid">
			<span class="ellipsis">{translate('passwordRepeat')}</span>
			<input class="bg-primary/10 p-2" type="password" name="passwordRepeat" placeholder={translate('passwordRepeat')} bind:value={passwordRepeat} />
		</label>
		<button class="grid bg-primary p-2 text-background transition-all hover:brightness-90" type="submit">{translate('register')}</button>
		{#if passwordMismatch}
			<span class="text-danger">{translate('passwordMismatch')}</span>
		{/if}
	</form>
{:else}
	<span class="text-center">{translate('passwordReset')}</span>
{/if}
