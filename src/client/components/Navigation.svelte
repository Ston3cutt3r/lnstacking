<script>
	import { user } from '../utility/Stores';
	import { httpPost } from '../utility/Requests';
	import { translate } from '../utility/Translations';

	const logout = async () => {
		await httpPost('/api/logout');
		user.set(undefined);
		localStorage.removeItem('token');
	};
</script>

<div class="relative flex justify-between bg-primary shadow-lg">
	<a class="grid place-items-center bg-primary text-background transition-all hover:brightness-90" href="/">
		<span class="ellipsis small-caps py-2 px-4 text-3xl font-bold">lnstacking</span>
	</a>
	{#if $user}
		<div class="flex">
			{#if $user.role === 'admin'}
				<a class="grid w-32 place-items-center bg-primary text-background transition-all hover:brightness-90" href="/admin">
					<span class="ellipsis small-caps py-2 px-4 font-bold">{translate('admin')}</span>
				</a>
			{/if}
			<a class="grid w-32 place-items-center bg-primary text-background transition-all hover:brightness-90" href="/kyc">
				<span class="ellipsis small-caps py-2 px-4 font-bold">{translate('kyc')}</span>
			</a>
			<button class="grid w-32 place-items-center bg-primary text-background transition-all hover:brightness-90" type="button" on:click={() => logout()}>
				<span class="ellipsis small-caps py-2 px-4 font-bold">{translate('logout')}</span>
			</button>
		</div>
	{/if}
</div>
