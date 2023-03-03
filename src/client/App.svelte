<script>
	import './app.css';

	import { links, Route, Router } from 'svelte-navigator';

	import { user } from './utility/Stores';
	import { httpPost } from './utility/Requests';
	import { translate } from './utility/Translations';
	import Navigation from './components/Navigation.svelte';
	import HeadConfig from './components/HeadConfig.svelte';
	import PrivateRoute from './authentication/PrivateRoute.svelte';

	import KYC from './kyc/index.svelte';
	import Home from './index/index.svelte';
	import Admin from './admin/index.svelte';
	import Login from './authentication/Login.svelte';
	import Register from './authentication/Register.svelte';
	import ResetPassword from './authentication/ResetPassword.svelte';
	import ForgotPassword from './authentication/ForgotPassword.svelte';
	import AdminRoute from './authentication/AdminRoute.svelte';
	import Notifications from './components/Notifications.svelte';

	let confirmationSent = false;
	let confirmationToken = undefined;

	const resendConfirmation = () => {
		httpPost('/api/resendConfirmation');
		confirmationSent = true;
	};

	const confirmEmail = () => {
		try {
			confirmationToken = new URLSearchParams(location.search).get('token');
			if ($user && !$user.emailConfirmedAt && confirmationToken) httpPost('/api/confirmEmail', { token: confirmationToken });
		} catch (error) {
			console.error(error);
		}
	};

	$: confirmEmail($user);
</script>

<Router primary={false}>
	<HeadConfig title="lnstacking" image="/favicon.png" description={translate('textDescription')} />
	<main class="overflow-hidden" use:links>
		<Navigation />

		<div class="my-4 grid p-2">
			{#if $user && !$user.emailConfirmedAt && !confirmationToken}
				<div class="m-4 border-l-8 border-danger bg-danger/25 p-4">
					<span class="">{translate('pleaseConfirmEmail')}</span>
					<button class="underline disabled:pointer-events-none disabled:opacity-25" type="button" disabled={confirmationSent} on:click={() => resendConfirmation()}>
						{translate('resendConfirmation')}
					</button>
				</div>
			{/if}

			{#if $user}
				{#if !$user.document}
					<div class="m-4 border-l-8 border-danger bg-danger/25 p-4">
						<span class="">{translate('pleaseCompleteKyc')}</span>
						<a class="underline" href="/kyc">{translate('goToKyc')}</a>
					</div>
				{:else if !$user.kycConfirmedAt && !$user.kycFailureNote}
					<div class="m-4 border-l-8 border-warning bg-warning/25 p-4">
						<span class="">{translate('pleaseWaitForKyc')}</span>
					</div>
				{:else if $user.kycFailureNote}
					<div class="m-4 grid gap-4 border-l-8 border-danger bg-danger/25 p-4">
						<div class="">
							<span class="">{translate('kycFailed')}</span>
							<a class="underline" href="/kyc">{translate('goToKyc')}</a>
						</div>
						<div class="">
							<span class="">{translate('kycFailureNote')}: </span>
							<p class="whitespace-pre p-4">{$user.kycFailureNote}</p>
						</div>
					</div>
				{/if}
			{/if}

			<Route path="/login">
				<Login />
			</Route>

			<Route path="/register">
				<Register />
			</Route>

			<Route path="/forgotPassword">
				<ForgotPassword />
			</Route>

			<Route path="/resetPassword">
				<ResetPassword />
			</Route>

			<PrivateRoute path="/kyc">
				<KYC />
			</PrivateRoute>

			<AdminRoute path="/admin">
				<Admin />
			</AdminRoute>

			<PrivateRoute path="/">
				<Home />
			</PrivateRoute>

			<Route path="*">
				<div class="grid place-items-center gap-2">
					<span class="text-4xl">404</span>
					<span class="text-2xl">Page not found.</span>
				</div>
			</Route>
		</div>
		<Notifications />
	</main>
</Router>
