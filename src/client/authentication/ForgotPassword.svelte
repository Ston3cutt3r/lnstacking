<script>
	import { httpPost } from '../utility/Requests';
	import { translate } from '../utility/Translations';

	let email = '';
	let complete = false;

	const handleSubmit = async () => {
		try {
			await httpPost('/api/forgotPassword', { email: email });
			complete = true;
		} catch (error) {
			console.error(error);
		}
	};
</script>

{#if !complete}
	<form class="m-auto grid w-full max-w-[25rem] gap-4 text-center" on:submit|preventDefault={handleSubmit}>
		<label class="grid">
			<span class="ellipsis">{translate('email')}</span>
			<input class="bg-primary/10 p-2" type="email" name="email" placeholder={translate('email')} bind:value={email} />
		</label>
		<button class="grid bg-primary p-2 text-background transition-all hover:brightness-90" type="submit">{translate('requestPasswordReset')}</button>
	</form>
{:else}
	<span class="text-center">{translate('passwordResetRequested')}</span>
{/if}
