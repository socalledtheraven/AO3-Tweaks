async function fullTextCommentBoxes() {
    const fullText = document.querySelector(".chapter.bychapter");
    if (fullText) {
        console.log("is fulltext")
        let commentBox = document.querySelector("#add_comment");
        let chapters = document.querySelector("#chapters");
        let chapterNodes = chapters.children;
        let chaptersLength = chapterNodes.length;
        let chapterUrls = await getChapterUrls();

        for (let i = chaptersLength; i > 0; i--) {
            let newCommentBox = commentBox.cloneNode(true);
            newCommentBox.querySelector("form.new_comment").action = chapterUrls[i];

            chapters.insertBefore(newCommentBox, chapterNodes[i]);
        }
    }
}

async function getChapterUrls() {
    let navigationUrl = window.location.href + "/navigate";
    let navPageHTML = await getHTML(navigationUrl);

    // this is standard parsing
    let parser = new DOMParser();
    let doc = parser.parseFromString(navPageHTML, "text/html");

    // grabs all the things in that list and filters it down to just the urls, then format them appropriately
    let urls = Array.from(doc.querySelector('ol[role="navigation"]').querySelectorAll("a"));
    return urls.map((url) => {
        return "/chapters" + url.href.split("chapters")[1] + "/comments";
    });
}

async function getHTML(url) {
    let response = await fetch(url);
    return await response.text();
}

// add config for if this actually does what it's supposed to
fullTextCommentBoxes().then(
    function () {
        console.log("finished");
    }
);