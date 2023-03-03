<script>
	import { onMount } from 'svelte';

	import CommitSTX from './CommitSTX.svelte';
	import Modal from '../components/Modal.svelte';
	import { filledArray } from '../utility/Utility';
	import { translate } from '../utility/Translations';
	import { httpGet, httpPost } from '../utility/Requests';

	const year = new Date().getFullYear();

	let users = [];
	let loading = false;
	let selectedUser = undefined;

	const submit = async (user) => {
		try {
			loading = true;
			await httpPost('/api/admin', user);
			await loadData();
			loading = false;
			selectedUser = undefined;
		} catch (error) {
			console.error(error);
		}
	};

	const approve = async (user) => {
		try {
			loading = true;
			await httpPost('/api/kyc/approve', user);
			await loadData();
			loading = false;
			selectedUser = undefined;
		} catch (error) {
			console.error(error);
		}
	};

	const deny = async (user) => {
		try {
			loading = true;
			await httpPost('/api/kyc/deny', user);
			await loadData();
			loading = false;
			selectedUser = undefined;
		} catch (error) {
			console.error(error);
		}
	};

	const loadData = async () => {
		try {
			users = JSON.parse(await httpGet('/api/admin'));
		} catch (error) {
			console.error(error);
		}
	};

	onMount(loadData);
</script>

<div class="grid gap-8 p-4">
	<div class="grid gap-16">
		<div class="grid gap-4">
			<span class="text-center text-4xl">{translate('administration')}</span>
			<!-- <p class="">{translate('lipsum')}</p> -->
		</div>
	</div>
	<CommitSTX />
	<div class="grid gap-2">
		<h2 class="ellipsis text-xl">{translate('usersAwaitingConfirmation')}</h2>
		{#each users.filter((user) => user.document && !user.kycConfirmedAt && !user.kycFailureNote) as user}
			<div class="grid border-2 border-white/25">
				<button
					class="grid grid-cols-auto-fit items-center gap-2 bg-background p-2 text-left transition-all hover:brightness-125"
					type="button"
					on:click={() => (selectedUser = JSON.parse(JSON.stringify(user)))}
				>
					<span class="ellipsis col-span-3">{user.email}</span>
					<span class="ellipsis col-span-2">{user.firstName ?? ''}</span>
					<span class="ellipsis col-span-2">{user.lastName ?? ''}</span>
					<span class="ellipsis">{new Date(user.createdAt).toLocaleDateString()}</span>
					<span class="ellipsis">{user.emailConfirmedAt ? '✔️' : '❌'} {translate('email')}</span>
					<span class="ellipsis">{user.kycConfirmedAt ? '✔️' : user.kycFailureNote ? '❌' : '❓'} {translate('kyc')}</span>
				</button>
			</div>
		{/each}
	</div>
	<div class="grid gap-2">
		<h2 class="ellipsis text-xl">{translate('otherUsers')}</h2>
		{#each users.filter((user) => !user.document || user.kycConfirmedAt || user.kycFailureNote) as user}
			<div class="grid border-2 border-white/25">
				<button
					class="grid grid-cols-auto-fit items-center gap-2 bg-background p-2 text-left transition-all hover:brightness-125"
					type="button"
					on:click={() => (selectedUser = JSON.parse(JSON.stringify(user)))}
				>
					<span class="ellipsis col-span-3">{user.email}</span>
					<span class="ellipsis col-span-2">{user.firstName ?? ''}</span>
					<span class="ellipsis col-span-2">{user.lastName ?? ''}</span>
					<span class="ellipsis">{new Date(user.createdAt).toLocaleDateString()}</span>
					<span class="ellipsis">{user.emailConfirmedAt ? '✔️' : '❌'} {translate('email')}</span>
					<span class="ellipsis">{user.kycConfirmedAt ? '✔️' : user.kycFailureNote ? '❌' : '❓'} {translate('kyc')}</span>
				</button>
			</div>
		{/each}
	</div>

	{#if selectedUser}
		<Modal on:backgroundClick={() => (selectedUser = undefined)}>
			<div class="relative mb-20 grid w-screen max-w-full">
				<div class="sticky top-0 z-10 grid grid-cols-auto-fit border-b-2 border-white bg-background shadow">
					<div class="ellipsis p-4 text-xl">{selectedUser.email}</div>
					<button class="ml-auto w-fit p-4" type="button" on:click={() => (selectedUser = undefined)}>
						<img class="aspect-square h-8 invert" src="/icons/close.svg" alt={translate('close')} />
					</button>
				</div>
				<div class="grid gap-4 p-4">
					<form class="grid gap-4 p-4" on:submit|preventDefault={() => submit(selectedUser)}>
						<label class="grid grid-cols-auto-fit items-center gap-2">
							<span class="ellipsis">{translate('role')}</span>
							<select class="col-span-3 grid bg-white/10 p-1" bind:value={selectedUser.role}>
								<option class="bg-background" value="user">{translate('user')}</option>
								<option class="bg-background" value={'admin'}>{translate('admin')}</option>
							</select>
						</label>
						<label class="grid grid-cols-auto-fit items-center gap-2">
							<span class="ellipsis">{translate('createdAt')}</span>
							<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={new Date(selectedUser.createdAt).toLocaleDateString()} />
						</label>
						<label class="grid grid-cols-auto-fit items-center gap-2">
							<span class="ellipsis">{translate('emailConfirmedAt')}</span>
							<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.emailConfirmedAt ? new Date(selectedUser.emailConfirmedAt).toLocaleDateString() : ''} />
						</label>
						<div class="grid grid-cols-auto-fit gap-4">
							<div class="" />
							<div class="col-span-3 grid grid-cols-auto-fit gap-2">
								<button class="grid bg-primary p-1 transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50" type="submit">
									{#if loading}
										<img class="m-auto aspect-square w-6 invert" src="/icons/loading.svg" alt={translate('loading')} />
									{:else}
										<span>{translate('submit')}</span>
									{/if}
								</button>
							</div>
						</div>
					</form>

					<div class="my-2 h-px w-full bg-white" />

					<label class="grid grid-cols-auto-fit items-center gap-2">
						<span class="ellipsis">{translate('stxAddress')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.stxAddress} />
					</label>
					<label class="grid grid-cols-auto-fit items-center gap-2">
						<span class="ellipsis">{translate('btcAddress')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.btcAddress} />
					</label>
					<label class="grid grid-cols-auto-fit items-center gap-2">
						<span class="ellipsis">{translate('lnKey')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.lnKey} />
					</label>

					<div class="my-2 h-px w-full bg-white" />

					<label class="grid grid-cols-auto-fit items-center gap-2">
						<span class="ellipsis">{translate('kycConfirmedAt')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.kycConfirmedAt ? new Date(selectedUser.kycConfirmedAt).toLocaleDateString() : ''} />
					</label>
					<label class="grid grid-cols-auto-fit items-center gap-2">
						<span class="ellipsis">{translate('firstName')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.firstName ?? ''} />
					</label>
					<label class="grid grid-cols-auto-fit items-center gap-2">
						<span class="ellipsis">{translate('lastName')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.lastName ?? ''} />
					</label>
					<label class="grid grid-cols-auto-fit items-center gap-2">
						<span class="ellipsis">{translate('country')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={translate(selectedUser.country ?? '')} />
					</label>
					<label class="grid grid-cols-auto-fit items-center gap-4">
						<span class="ellipsis">{translate('street')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.street ?? ''} />
					</label>
					<label class="grid grid-cols-auto-fit items-center gap-4">
						<span class="ellipsis">{translate('zipCode')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.zipCode ?? ''} />
					</label>
					<label class="grid grid-cols-auto-fit items-center gap-4">
						<span class="ellipsis">{translate('city')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.city ?? ''} />
					</label>
					<label class="grid grid-cols-auto-fit items-center gap-2">
						<span class="ellipsis">{translate('dateOfBirth')}</span>
						<select class="grid bg-white/10 p-1 disabled:opacity-50" disabled value={selectedUser.dateOfBirthDay}>
							{#each filledArray(31) as _, index}
								<option class="bg-background" value={index + 1}>{index + 1}</option>
							{/each}
						</select>
						<select class="grid bg-white/10 p-1 disabled:opacity-50" disabled value={selectedUser.dateOfBirthMonth}>
							{#each filledArray(12) as _, index}
								<option class="bg-background" value={index + 1}>{index + 1}</option>
							{/each}
						</select>
						<select class="grid bg-white/10 p-1 disabled:opacity-50" disabled value={selectedUser.dateOfBirthYear}>
							{#each filledArray(year) as _, index}
								<option class="bg-background" value={year - index}>{year - index}</option>
							{/each}
						</select>
					</label>
					<label class="grid grid-cols-auto-fit items-center gap-2">
						<span class="ellipsis">{translate('documentId')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.documentId ?? ''} />
					</label>
					<label class="grid grid-cols-auto-fit items-center gap-2">
						<span class="ellipsis">{translate('documentName')}</span>
						<input class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" disabled type="text" value={selectedUser.documentName ?? ''} />
					</label>
					{#if selectedUser.document}
						<div class="grid grid-cols-auto-fit gap-2">
							<span class="ellipsis">{translate('documentPreview')}</span>
							<div class="col-span-3 m-auto h-80 overflow-auto bg-white/10 p-4">
								<img class="" src={selectedUser.document} alt="" />
							</div>
						</div>
					{/if}
					<label class="grid grid-cols-auto-fit gap-2">
						<span class="ellipsis">{translate('kycFailureNote')}</span>
						<textarea class="col-span-3 grid bg-white/10 p-1 disabled:opacity-50" rows="5" bind:value={selectedUser.kycFailureNote} />
					</label>
					<div class="grid grid-cols-auto-fit gap-4">
						<div class="" />
						<div class="col-span-3 grid grid-cols-auto-fit gap-2">
							<button class="grid bg-primary p-1 transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50" type="button" on:click={() => approve(selectedUser)}>
								{#if loading}
									<img class="m-auto aspect-square w-6 invert" src="/icons/loading.svg" alt={translate('loading')} />
								{:else}
									<span>{translate('approve')}</span>
								{/if}
							</button>
							<button class="grid bg-danger p-1 transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-50" type="button" on:click={() => deny(selectedUser)}>
								{#if loading}
									<img class="m-auto aspect-square w-6 invert" src="/icons/loading.svg" alt={translate('loading')} />
								{:else}
									<span>{translate('deny')}</span>
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	{/if}
</div>
