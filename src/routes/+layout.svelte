<!-- __layout.svelte -->
<script>
	import { Nav, Footer } from "$lib/components"
    import { dev } from '$app/environment';
    import { injectAnalytics } from '@vercel/analytics/sveltekit';
    import { sidebarContent } from '$lib/stores';

    injectAnalytics({ mode: dev ? 'development' : 'production' });
</script>

<main>
    <div class="appShell" class:has-sidebar={$sidebarContent}>
        <Nav /> <!-- adds the nav (small and large) -->

        <div class="pageContent">
            <slot />
        </div>

        {#if $sidebarContent}
            <div class="rightSidebar">
                <svelte:component this={$sidebarContent} />
            </div>
        {/if}
    </div>

    <Footer /> <!-- adds the footer -->
</main>

<style>
    .appShell {
        display: block;
    }

    :global(.pageContent) {
        min-width: 400px;
    }

    @media (min-width: 900px) {
        .appShell {
            display: grid;
            grid-template-columns: 220px 1fr;
            grid-template-rows: 80px 1fr;
            grid-template-areas:
                "leftnav topbar"
                "leftnav content";
            min-height: 100vh;
        }

        .appShell.has-sidebar {
            grid-template-columns: 220px 1fr clamp(220px, 22vw, 300px);
            grid-template-areas:
                "leftnav topbar topbar"
                "leftnav content sidebar";
        }

        :global(.appShell .topBar) {
            grid-area: topbar;
        }

        :global(.appShell .leftNav) {
            grid-area: leftnav;
            grid-row: 1 / -1;
        }

        :global(.appShell .pageContent) {
            grid-area: content;
            flex: 1;
            overflow-y: auto;
        }

        .rightSidebar {
            grid-area: sidebar;
            overflow-y: auto;
            padding-top: 3px;
        }
    }
</style>
