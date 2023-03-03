<script>
	import { useNavigate } from 'svelte-navigator';

	import { user } from '../utility/Stores';
	import { getHash } from '../utility/Utility';
	import { httpPost } from '../utility/Requests';
	import { translate } from '../utility/Translations';

	const navigate = useNavigate();

	let email = '';
	let password = '';
	let passwordRepeat = '';
	let registerError = false;

	$: passwordMismatch = password && passwordRepeat && password !== passwordRepeat;

	const handleSubmit = async () => {
		try {
			if (password && passwordRepeat && !passwordMismatch) {
				const response = JSON.parse(await httpPost('/api/register', { email: email, password: await getHash(password) }));
				user.set(response);
				localStorage.setItem('token', response.token);
				navigate('/', { replace: true });
			}
		} catch (error) {
			console.error(error);
			registerError = true;
		}
	};
</script>

<form class="m-auto grid w-full max-w-[25rem] gap-4 text-center" on:submit|preventDefault={handleSubmit}>
	<label class="grid">
		<span class="ellipsis">{translate('email')}</span>
		<input class="bg-primary/10 p-2" type="email" name="email" placeholder={translate('email')} bind:value={email} />
	</label>
	<label class="grid">
		<span class="ellipsis">{translate('password')}</span>
		<input class="bg-primary/10 p-2" type="password" name="password" placeholder={translate('password')} bind:value={password} />
	</label>
	<label class="grid">
		<span class="ellipsis">{translate('passwordRepeat')}</span>
		<input class="bg-primary/10 p-2" type="password" name="passwordRepeat" placeholder={translate('passwordRepeat')} bind:value={passwordRepeat} />
	</label>
	<button class="grid bg-primary p-2 text-background transition-all hover:brightness-90" type="submit">{translate('register')}</button>
	{#if registerError}
		<span class="text-danger">{translate('registerError')}</span>
	{/if}
	{#if passwordMismatch}
		<span class="text-danger">{translate('passwordMismatch')}</span>
	{/if}
</form>
