<script>
	import { useNavigate, useLocation } from 'svelte-navigator';

	import { user } from '../utility/Stores';
	import { getHash } from '../utility/Utility';
	import { httpPost } from '../utility/Requests';
	import { translate } from '../utility/Translations';

	const navigate = useNavigate();
	const location = useLocation();

	let email = '';
	let password = '';

	let loginFailed = false;

	const handleSubmit = async () => {
		try {
			const response = JSON.parse(await httpPost('/api/login', { email: email, password: await getHash(password) }));
			user.set(response);
			localStorage.setItem('token', response.token);
			let from = $location.state?.from ?? '/';
			if (from === '/login') from = '/';
			navigate(from, { replace: true });
		} catch (error) {
			loginFailed = true;
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
	<button class="grid bg-primary p-2 text-background transition-all hover:brightness-90" type="submit">{translate('login')}</button>
	{#if loginFailed}
		<span class="text-danger">{translate('loginFailed')}</span>
	{/if}
	<a class="bg-background p-2 transition-all hover:brightness-110" href="/register">{translate('register')}</a>
	<a class="bg-background p-2 transition-all hover:brightness-110" href="/forgotPassword">{translate('forgotPassword')}</a>
</form>
