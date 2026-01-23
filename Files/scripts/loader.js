(async () => {
    const url = window.location.href;

    // Helper to load a module
    const loadModule = async (path) => {
        try {
            const src = browser.runtime.getURL(path);
            return await import(src);
        } catch (err) {
            console.error(`Failed to load module: ${path}`, err);
        }
    };

    // 1. Latest Chapter logic
    if (url.includes("bookmark_search%5Bsort_column%5D=bookmarkable_date")) {
        await loadModule("scripts/latestChapter.js");
    }

    // 2. Define exclusions (works/ID/bookmarks and works/ID/navigate)
    const isExcluded = !url.search(/works\/[0-9]+\/bookmarks/) || url.includes("/navigate");
    const isSearch = url.includes("/works/search");

    // 3. SaveAsToRead (Matches all AO3 except exclusions)
    if (!isExcluded) {
        console.log("here")
        await loadModule("scripts/saveAsToRead.js");
    }

    // 4. Bookmark Notes, Rekudos, and Comments
    // Matches works, chapters, series, and collections
    const isWorkOrSeries = /archiveofourown\.org\/(collections\/[^\/]*)?\/(works|chapters|series)\//.test(url);

    if (isWorkOrSeries && !isExcluded && !isSearch) {
        await loadModule("scripts/bookmarkNotes.js");
        await loadModule("scripts/rekudos.js");
        await loadModule("scripts/comments.js");
    }
})();