// noinspection JSUnusedLocalSymbols
console.log("running the first time")

const extensionApi = globalThis.browser ?? globalThis.chrome;
// LOW-LEVEL UTILITIES

// turns a JSON document into a single URL-encoded string for sending in POST requests
export function stringify(json) {
    return new URLSearchParams(json).toString();
}

// Helper to create base headers (browser handles Host and User-Agent automatically)
const AO3_HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Content-Type": "application/x-www-form-urlencoded",
    "Upgrade-Insecure-Requests": "1"
};

export function post(url, data) {
    // a POST request with the associated headers
    return fetch(url, {
        method: "POST",
        credentials: "include",
        headers: AO3_HEADERS,
        body: stringify(data)
    });
}

export function get(url) {
    // a GET request with the associated headers
    return fetch(url, {
        method: "GET",
        credentials: "include",
        headers: AO3_HEADERS,
    });
}

export async function getDocument(url) {
    // gets the HTML and document object of a url
    let response = await fetch(url);

    let navPageHTML = await response.text();

    // this is standard parsing
    let parser = new DOMParser();
    return parser.parseFromString(navPageHTML, "text/html");
}

export function isLoggedIn() {
    // when used in an if, this will check for the existence of the element
    // it's basically being cast to bool
    return !document.querySelector("#login");
}

export function onError(error, DEBUG_ENABLED = false) {
    console.error(`Error: ${error}`);

    if (DEBUG_ENABLED) {
        alert(`An error occurred: ${error}`);
    }
}

export function removeCommas(wordcount) {
    return wordcount.replace(",", "");
}

// BOOKMARK UTILITIES

export function getTags(doc) {
    // gives a list of the tags, which can then be joined for a string
    return [...doc.querySelectorAll("li.added.tag")];
}

export function getStringTags(doc) {
    return getTags(doc).map((tag) => tag.textContent.replace("×", "").trim());
}

export function removeToReadTag(doc) {
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

export function addTags(tagBox, categorySelector) {
    const categories = document.getElementsByClassName(categorySelector);
    if (categories.length > 0) {
        const categoryTags = categories[1].getElementsByClassName("tag");
        for (let tag of categoryTags) {
            tagBox.value += ", " + tag.textContent;
        }
    }

    return tagBox;
}

export function clearTags(doc) {
    // clears all the applied tags, which makes sense right after a deletion
    let tags = getTags(doc);

    for (let tag of tags) {
        console.log(tag);
        let deleteButton = tag.querySelector(".delete");
        deleteButton.click();
    }
}

export function getAO3Metadata(doc = document) {
    return {
        token: doc.querySelector("meta[name='csrf-token']")?.getAttribute("content"),
        pseudID: doc.querySelector("input[name='bookmark[pseud_id]']")?.getAttribute("value")
    };
}

export function showFlashNotice(message, isError = false, doc = document) {
    let notice = doc.createElement("div");
    notice.className = isError ? "flash notice error" : "flash notice";
    notice.textContent = message;

    let main = doc.querySelector("#main");
    if (main) {
        main.insertAdjacentElement("afterbegin", notice);
    }
    return notice;
}

export function createInlineListItem(pointer) {
    let li = document.createElement("li");
    li.style.listStyle = "none";
    li.style.display = "inline";
    li.style.paddingLeft = "0.25em";

    if (pointer) {
        li.style.cursor = "pointer";
    }

    return li;
}

export function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Handles URLs like `/works/123/chapters/456` or `https://archiveofourown.org/works/123`
// should hopefully also work for download links
export function extractIdFromUrl(url) {
    // the url gets expanded when everything is loaded, so we need to take `archiveofourown.org/works/...` into mind
    const parts = url.split("/");
    if (url.includes("collections")) {
        return parts[6];
    } else {
        return parts[4]; // Works for both absolute and relative URLs after split
    }
}

export function addSavedWorkToStorage(id) {
    addItemToStorage("savedWorks", id).then(() => console.log(`${id} sent to storage`));
}

export function addSavedSeriesToStorage(id) {
    addItemToStorage("savedSeries", id).then(() => console.log(`${id} sent to storage`));;
}

async function addItemToStorage(key, value) {
    await extensionApi.storage.sync.get(key).then(
        async (result) => {
            let items = result[key];

            if (!items || items.length === 0) {
                items = new Set([value]);
                console.log("Persistent saved works created");
            } else {
                items = new Set(items);
                items.add(value);
                console.log(`Saved work ${value} added to persistent storage`);
                console.log(items)
            }

            await extensionApi.storage.sync.set({
                [key]: Array.from(items)
            });
        }
    );
}

export async function workAlreadySaved(id) {
    return await isItemSaved("savedWorks", id);
}

export async function seriesAlreadySaved(id) {
    return await isItemSaved("savedSeries", id);
}

async function isItemSaved(key, value) {
    const result = await extensionApi.storage.sync.get(key);

    if (!result || result[key] === undefined) {
        return false;
    }

    return result[key].includes(`${value}`);
}

export function setup(keys, func) {
    const extensionApi = globalThis.browser ?? globalThis.chrome;

    let debugEnabled = false;

    extensionApi.storage.sync.get("debug_enabled")
        .then((result) => {
            debugEnabled = result.debug_enabled ?? false;
            return extensionApi.storage.sync.get(keys);
        })
        .then(func)
        .catch((error) => onError(error, debugEnabled));
}