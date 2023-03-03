<script>
	import { navigate } from 'svelte-navigator';

	import { user } from '../utility/Stores';
	import { httpPost } from '../utility/Requests';
	import { filledArray } from '../utility/Utility';
	import { translate } from '../utility/Translations';

	const year = new Date().getFullYear();

	let data = {};
	let loading = false;
	let fileInput = undefined;
	let fileSizeError = false;

	const initialize = (user) => (data = JSON.parse(JSON.stringify(user)));
	$: initialize($user);

	const submit = async () => {
		try {
			loading = true;
			await httpPost('/api/kyc', data);
			loading = false;
			navigate('/');
		} catch (error) {
			console.error(error);
		}
	};

	const handleFileUpload = () => {
		const file = fileInput?.files[0];
		if (file) {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				fileSizeError = file.size > 25 * 1024 * 1024;
				data.document = reader.result;
				data.documentName = file.name;
			};
			reader.onerror = console.error;
		}
	};
</script>

<div class="m-auto grid gap-16 p-4">
	<div class="grid gap-16">
		<div class="grid gap-4">
			<span class="text-center text-4xl">{translate('personalIdentification')}</span>
			<div class="m-auto grid gap-4">
				<p class="text-justify">{translate('personalIdentificationText1')}</p>
				<p class="text-justify">{translate('personalIdentificationText2')}</p>
			</div>
		</div>
		<form class="grid gap-4" on:submit|preventDefault={() => submit()}>
			<label class="grid grid-cols-auto-fit items-center gap-4">
				<span class="ellipsis">{translate('firstName')}</span>
				<input class="col-span-3 grid bg-white/10 p-1" type="text" required placeholder={translate('firstName')} bind:value={data.firstName} />
			</label>
			<label class="grid grid-cols-auto-fit items-center gap-4">
				<span class="ellipsis">{translate('lastName')}</span>
				<input class="col-span-3 grid bg-white/10 p-1" type="text" required placeholder={translate('lastName')} bind:value={data.lastName} />
			</label>
			<label class="grid grid-cols-auto-fit items-center gap-4">
				<span class="ellipsis">{translate('country')}</span>
				<select class="col-span-3 grid bg-white/10 p-1" bind:value={data.country}>
					{#each ['belgium', 'bulgaria', 'croatia', 'republicOfCyprus', 'czechRepublic', 'denmark', 'estonia', 'finland', 'france', 'germany', 'greece', 'hungary', 'ireland', 'italy', 'latvia', 'lithuania', 'luxembourg', 'malta', 'netherlands', 'poland', 'portugal', 'romania', 'slovakia', 'slovenia', 'spain', 'sweden'] as country}
						<option class="bg-background" value={country}>{translate(country)}</option>
					{/each}
				</select>
			</label>
			<label class="grid grid-cols-auto-fit items-center gap-4">
				<span class="ellipsis">{translate('street')}</span>
				<input class="col-span-3 grid bg-white/10 p-1" type="text" required placeholder={translate('street')} bind:value={data.street} />
			</label>
			<label class="grid grid-cols-auto-fit items-center gap-4">
				<span class="ellipsis">{translate('zipCode')}</span>
				<input class="col-span-3 grid bg-white/10 p-1" type="text" required placeholder={translate('zipCode')} bind:value={data.zipCode} />
			</label>
			<label class="grid grid-cols-auto-fit items-center gap-4">
				<span class="ellipsis">{translate('city')}</span>
				<input class="col-span-3 grid bg-white/10 p-1" type="text" required placeholder={translate('city')} bind:value={data.city} />
			</label>
			<label class="grid grid-cols-auto-fit items-center gap-4">
				<span class="ellipsis">{translate('dateOfBirth')}</span>
				<select class="grid bg-white/10 p-1" bind:value={data.dateOfBirthDay}>
					{#each filledArray(31) as _, index}
						<option class="bg-background" value={index + 1}>{index + 1}</option>
					{/each}
				</select>
				<select class="grid bg-white/10 p-1" bind:value={data.dateOfBirthMonth}>
					{#each filledArray(12) as _, index}
						<option class="bg-background" value={index + 1}>{index + 1}</option>
					{/each}
				</select>
				<select class="grid bg-white/10 p-1" bind:value={data.dateOfBirthYear}>
					{#each filledArray(year) as _, index}
						<option class="bg-background" value={year - index}>{year - index}</option>
					{/each}
				</select>
			</label>
			<label class="grid grid-cols-auto-fit items-center gap-4">
				<span class="ellipsis">{translate('documentId')}</span>
				<input class="col-span-3 grid bg-white/10 p-1" type="text" required placeholder={translate('documentId')} bind:value={data.documentId} />
			</label>
			<label class="grid grid-cols-auto-fit items-center gap-4">
				<span class="ellipsis">{translate('document')}</span>
				<span class="ellipsis col-span-2 h-full bg-white/10 p-1" class:text-danger={!data.documentName}>{data.documentName ?? translate('none')}</span>
				<button class="bg-white/10 p-1" type="button" on:click={() => fileInput.click()}>{translate('browse')}</button>
				<input class="hidden" type="file" accept="image/*" on:change={handleFileUpload} bind:this={fileInput} />
			</label>
			{#if data.document}
				{#if !fileSizeError}
					<div class="grid grid-cols-auto-fit gap-4">
						<span class="ellipsis">{translate('documentPreview')}</span>
						<div class="col-span-3 m-auto h-80 overflow-auto bg-white/10 p-4">
							<img class="" src={data.document} alt="" />
						</div>
					</div>
				{:else}
					<span class="text-center text-danger">{translate('fileSizeError')}</span>
				{/if}
			{/if}
			<div class="grid grid-cols-auto-fit gap-4">
				<div class="" />
				<div class="col-span-3 grid grid-cols-auto-fit gap-2">
					<button class="grid bg-primary p-1 transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50" type="submit" disabled={fileSizeError}>
						{#if loading}
							<img class="m-auto aspect-square w-6 invert" src="/icons/loading.svg" alt={translate('loading')} />
						{:else}
							<span>{translate('submit')}</span>
						{/if}
					</button>
					<a class="grid place-items-center bg-background p-1 transition-all hover:brightness-110" href="/">{translate('cancel')}</a>
				</div>
			</div>
		</form>
	</div>
</div>
