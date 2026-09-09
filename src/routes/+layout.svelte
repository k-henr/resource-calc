<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<link rel="stylesheet" href="index.css" />
	<title>Resource calculator</title>
	<link rel="icon" href={favicon} />
	<link rel="icon" type="image/x-icon" href="/icons/favicon.ico" />
</svelte:head>

{@render children()}
