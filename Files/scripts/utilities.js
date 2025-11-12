// noinspection JSUnusedLocalSymbols
console.log("running the first time")
// LOW-LEVEL UTILITIES

function stringify(json) {
    // turns a JSON document into a single URL-encoded string for sending in POST requests
    let s = "";
    for (const [key, value] of Object.entries(json)) {
        s += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
    }

    // remove the final "&" because it gets unnecessarily added
    return s.substring(0, s.length - 1)
}

function post(url, data) {
    // a POST request with the associated headers
    return fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "archiveofourown.org",
            "Origin": "https://archiveofourown.org",
            "Priority": "u=0, i",
            "Referer": url,
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0"
        },
        body: stringify(data)
    });
}

function get(url) {
    // a GET request with the associated headers
    return fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "archiveofourown.org",
            "Origin": "https://archiveofourown.org",
            "Priority": "u=0, i",
            "Referer": url,
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0"
        }
    });
}

async function getDocument(url) {
    // gets the HTML and document object of a url
    let response = await fetch(url);

    let navPageHTML = await response.text();

    // this is standard parsing
    let parser = new DOMParser();
    return parser.parseFromString(navPageHTML, "text/html");
}

function isLoggedIn() {
    // when used in an if, this will check for the existence of the element
    // it's basically being cast to bool
    return !document.querySelector("#login");
}

function onError(error) {
    console.error(`Error: ${error}`);
}

function removeCommas(wordcount) {
    if (wordcount.includes(',')) {
        wordcount = wordcount.replace(',', '');
        wordcount = removeCommas(wordcount);
    }

    return wordcount;
}

// BOOKMARK UTILITIES

function getTags(doc) {
    // gives a list of the tags, which can then be joined for a string
    return [...doc.querySelectorAll("li.added.tag")];
}

function getStringTags(doc) {
    return getTags(doc).map((tag) => tag.textContent.replace("×", "").trim());
}

function removeToReadTag(doc) {
    // removes the existing tag button
    let tags = getTags(doc);

    for (let tag of tags) {
        if (tag.textContent.includes("To Read")) {
            let deleteButton = tag.querySelector(".delete");
            deleteButton.click();
        }
    }

    // both are necessary to remove the original tag and prevent it from being readded when the bookmark is sent
    const tagBox = doc.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value = tagBox.value.replace("To Read", "");
}

function addTags(tagBox, categorySelector) {
    const categories = document.getElementsByClassName(categorySelector);
    if (categories.length > 0) {
        const categoryTags = categories[1].getElementsByClassName("tag");
        for (let tag of categoryTags) {
            tagBox.value += ", " + tag.textContent;
        }
    }

    return tagBox;
}

// Export functions for use in other scripts
// This allows the functions to be called from other files
window.AO3TweaksUtils = {
    post,
    get,
    getDocument,
    isLoggedIn,
    onError,
    removeCommas,
    getStringTags,
    removeToReadTag,
    addTags
};