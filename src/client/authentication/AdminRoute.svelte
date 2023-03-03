<script>
	import { Route } from 'svelte-navigator';
	import AdminRouteGuard from './AdminRouteGuard.svelte';

	export let path;
</script>

<Route {path} let:params let:location let:navigate>
	<AdminRouteGuard let:registerFocus>
		<slot {params} {location} {navigate} {registerFocus} />
	</AdminRouteGuard>
</Route>
