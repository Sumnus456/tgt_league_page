<script>
	import { tabs, isExternal } from '$lib/utils/tabs';
	import { page } from '$app/state';
	import { preloadData } from '$app/navigation';
	import { enableBlog, managers, leagueName, leagueID } from '$lib/utils/leagueInfo';

	let { darkTheme = $bindable(), switchTheme } = $props();

	const SLEEPER_LEAGUE_URL = `https://sleeper.com/leagues/${leagueID}`;

	const currentPath = $derived(page.url.pathname);

	const toggleTheme = () => {
		darkTheme = !darkTheme;
		switchTheme(darkTheme);
	}
</script>

<style>
	.topBar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 80px;
		padding: 0 24px;
		background-color: var(--navBg);
		border-bottom: 2px solid var(--navBorder);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.6em;
		text-decoration: none;
		flex-shrink: 0;
	}

	.logoIcon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		border-radius: 10px;
		background: transparent;
	}

	.logoIcon img {
		width: 34px;
		height: 34px;
		object-fit: contain;
	}

	.leagueName {
		font-weight: 600;
		font-size: 20px;
		color: var(--navActive);
		white-space: nowrap;
	}

	.topBarRight {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.iconLink,
	.themeToggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		background: none;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		color: var(--navInactive);
		transition: color 0.2s ease;
	}

	.iconLink img {
		width: 22px;
		height: 22px;
		object-fit: contain;
	}

	.iconLink:hover,
	.themeToggle:hover {
		color: var(--navHover);
	}

	.themeToggle {
		font-size: 1.3em;
	}

	.leftNav {
		width: 220px;
		flex-shrink: 0;
		background-color: var(--navBg);
		border-right: 1px solid var(--navBorder);
		overflow-y: auto;
		padding: 0.75em 0;
	}

	.navList {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.navItem {
		display: flex;
		align-items: center;
		gap: 0.7em;
		padding: 0.85em 1.25em;
		color: var(--navInactive);
		text-decoration: none;
		font-size: 1em;
		font-weight: 500;
		border-left: 3px solid transparent;
		transition: color 0.2s ease;
	}

	.navItem:hover {
		color: var(--navHover);
	}

	.navItem.active {
		color: var(--navActive);
		border-left-color: var(--navActive);
	}

	.navItem .material-icons {
		font-size: 1.2em;
	}

	.navItem.sub {
		padding-left: calc(1.25em + 12px);
		font-size: 0.9em;
	}

	.sectionLabel {
		margin: 1em 0 0.25em;
		padding: 0 1.25em;
		font-size: 0.7em;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--sectionLabel);
	}
</style>

<header class="topBar">
	<a href="/" class="brand">
		<span class="logoIcon">
				<img src="/badge.png" alt="league logo" />
			</span>
		<span class="leagueName">{leagueName}</span>
	</a>

	<div class="topBarRight">
		<a href={SLEEPER_LEAGUE_URL} target="_blank" rel="noopener noreferrer" class="iconLink" aria-label="Go to Sleeper">
			<img src="/Sleeper.png" alt="Sleeper" />
		</a>
		<button type="button" class="themeToggle" onclick={toggleTheme} aria-label="Toggle dark mode">
			<span class="material-icons">{darkTheme ? 'light_mode' : 'dark_mode'}</span>
		</button>
	</div>
</header>

<nav class="leftNav">
	<ul class="navList">
		{#each tabs as tab}
			{#if tab.nest}
				<li class="sectionLabel">{tab.label.toUpperCase()}</li>
				{#each tab.children as child}
					{#if child.label != 'Managers' || managers.length > 0}
						<li>
							<a
								href={child.dest}
								target={isExternal(child.dest) ? '_blank' : undefined}
								rel={isExternal(child.dest) ? 'noopener noreferrer' : undefined}
								onmouseover={() => { if(!isExternal(child.dest)) preloadData(child.dest); }}
								class="navItem sub {currentPath === child.dest ? 'active' : ''}"
							>
								<span class="material-icons">{child.icon}</span>
								<span>{child.label}</span>
							</a>
						</li>
					{/if}
				{/each}
			{:else if tab.label != 'Blog' || enableBlog}
				<li>
					<a href={tab.dest} onmouseover={() => preloadData(tab.dest)} class="navItem {currentPath === tab.dest ? 'active' : ''}">
						<span class="material-icons">{tab.icon}</span>
						<span>{tab.label}</span>
					</a>
				</li>
			{/if}
		{/each}
	</ul>
</nav>
