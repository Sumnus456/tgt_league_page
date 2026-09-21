<script>
    import Paper, { Title, Content } from '@smui/paper';

    export let article;

    // Generic newspaper icon shown when a source has no icon or its image fails to load
    const FALLBACK_ICON = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#888888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="13" y2="16"/></svg>'
    );

    const handleIconError = (e) => {
        if(e?.target && e.target.src !== FALLBACK_ICON) {
            e.target.src = FALLBACK_ICON;
        }
    }
</script>

<style>
    :global(.card-media-square) {
        background-size: 600px;
    }
    
     :global(.article-title) {
        display: flex;
        margin: 1em 0 0.5em;
    }

    .title-link {
        font-weight: 500;
        color: var(--blueOne);
        text-decoration: none;
        text-align: center;
        max-height: 96px;
        margin: 0 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 3;
        display: -webkit-box;
        -webkit-box-orient: vertical;
    }

    .title-link:hover {
        color: var(--blueOne);
    }

    .body {
        display: flex;
        margin: 2em 0 1em;
    }

    .icon {
        height: 40px;
        width: auto;
    }

    .body-text {
        position: relative;
        flex-grow: 1;
        min-width: 0;
        max-height: 480px;
        margin: 0 auto;
        overflow: hidden;
    }

    .body-text::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 60px;
        top: 420px;
        background: -webkit-linear-gradient(
            var(--fadeOne),
            var(--fadeTwo),
            var(--fadeThree),
            var(--fadeFour)
        ); 
        background-image: -moz-linear-gradient(
            var(--fadeOne),
            var(--fadeTwo),
            var(--fadeThree),
            var(--fadeFour)
        );
        background-image: -o-linear-gradient(
            var(--fadeOne),
            var(--fadeTwo),
            var(--fadeThree),
            var(--fadeFour)
        );
        background-image: linear-gradient(
            var(--fadeOne),
            var(--fadeTwo),
            var(--fadeThree),
            var(--fadeFour)
        );
        background-image: -ms-linear-gradient(
            var(--fadeOne),
            var(--fadeTwo),
            var(--fadeThree),
            var(--fadeFour)
        );
    }

    :global(.body-text p) {
        margin-top: 0;
    }

    :global(.body-text a) {
        margin-top: 0;
        word-break: break-word;
    }

    :global(.body-text blockquote) {
        margin-top: 0;
    }

    :global(.body-text div) {
        overflow-x: scroll;
    }

    .date {
        font-style: italic;
        color: #888;
    }
</style>


<Paper class="article" elevation=3>
    <Title class="article-title">
        {#if article.icon}
            <img class="icon" src="{article.icon}" alt="article thumbnail" onerror={handleIconError} />
        {/if}
        {#if article.link}
            <a href="{article.link}" target="_blank" class="title-link">{article.title}</a>
        {:else}
            {article.title}
        {/if}
    </Title>
    <Content>
        <div class="body">
            <div class="body-text">{@html article.article}</div>
        </div>
        <hr />
        {#if article.author}
            <span class="author">
                {article.author}
            </span>
        {/if}
        <span class="date">{article.date}</span>
    </Content>
</Paper>