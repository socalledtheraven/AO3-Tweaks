// CONFIG
const privateFandoms = [""]
const SAVE_AS_TO_READ_ENABLED = true;
const UNSUB_FROM_WORKS = false;
const REPLACE_MARK_FOR_LATER = true;
const ADD_PRIV_SAVE_AS = true;
const CREATE_MARK_AS_READ_BUTTON = true;
const MARK_AS_READ_MESSAGE = "Marked as Read!";
const SAVE_AS_TO_READ_MESSAGE = "Saved as \"To Read\"!";
const PRIV_SAVE_AS_TO_READ_MESSAGE = "Saved privately as \"To Read\"!";
// END CONFIG

const URL = window.location.href;

let IS_WORK;
let IS_BOOKMARK;
let IS_SERIES;
let MARK_AS_READ_BUTTON;
let SAVE_AS_TO_READ_BUTTON;
let PRIV_SAVE_AS_TO_READ_BUTTON;
let DOC;


function privateBookmarkSeries(button) {
    const privateBox = document.getElementById("bookmark_private");
    privateBox.checked = true;

    bookmarkSeries(button);
}

function bookmarkSeries(button) {
    // html is basically the same, they work in both cases
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value += ", To Read";

    console.log("seris")
    let data = getSeriesData();
    createSeriesBookmark(data[0], data[1], data[2], data[3], data[4], data[5], button.id);
}

function privateBookmarkWorkExternal(button, message, doc) {
    const privateBox = doc.getElementById("bookmark_private");
    privateBox.checked = true;

    bookmarkWorkExternal(button, message, doc);
}

function bookmarkWorkExternal(button, message, doc) {
    let subbed = doc.querySelector("#new_subscription");
    if (UNSUB_FROM_WORKS && subbed) {
        unsubscribe(doc);
    }

    createBookmark(button, message, doc);
}


// OUT OF WORK

function outsideWork() {
    const works = document.querySelectorAll('li[role="article"]');
    let i = 1;

    for (const work of works) {
        let header = work.querySelector(".header");
        let url = header.querySelector("a").href;
        let ul = document.createElement("ul");
        ul.style.display = "flex";

        // checks it's not a series
        if (url.includes("works")) {
            let toReadButton = createExternalToReadButton(i, url);
            toReadButton.className = "actions";

            ul.insertAdjacentElement("beforeend", toReadButton);

            if (ADD_PRIV_SAVE_AS) {
                let privToReadButton = createExternalPrivateToReadButton(i, url);
                privToReadButton.className = "actions";

                ul.insertAdjacentElement("beforeend", privToReadButton);
            }
        }

        let blockquote = work.querySelector("blockquote");
        blockquote.insertAdjacentElement("afterend", ul);
        i++;
    }
}

function respondToBookmark(r, type) {
    if (r.ok) {
        let notice = DOC.createElement("div");
        notice.className = "flash notice";
        notice.textContent = `Work successfully saved as "To Read".`;

        let main = DOC.querySelector("#main");
        main.insertAdjacentElement("afterbegin", notice);

        let button;
        let completionMessage;
        if (type === "to_read") {
            button = DOC.querySelector(`#${type}`).children[0];
            completionMessage = SAVE_AS_TO_READ_MESSAGE;
        } else if (type === "priv_to_read") {
            button = DOC.querySelector(`#${type}`).children[0];
            completionMessage = PRIV_SAVE_AS_TO_READ_MESSAGE;
        } else if (type === "mark_as_read") {
            button = DOC.querySelector(`#${type}`).children[0];
            completionMessage = MARK_AS_READ_MESSAGE;
        }
        button.textContent = completionMessage;
        button.onclick = function () {
            return false;
        }
    } else {
        let notice = DOC.createElement("div");
        notice.className = "flash notice error";
        notice.textContent = "We're sorry! Something went wrong.";

        let main = DOC.querySelector("#main");
        main.insertAdjacentElement("afterbegin", notice);
    }
}


function isLoggedIn() {
    // when used in an if, this will check for the existence of the element
    // it's basically being cast to bool
    return !document.querySelector("#login");
}


// GENERAL UTILITY FUNCTIONS


function stringify(json) {
    let s = "";
    for (const [key, value] of Object.entries(json)) {
        s += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
    }

    // remove the final "&" because it gets unnecessarily added
    return s.substring(0, s.length-1)
}

function post(url, data) {
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


function isInArray(arr) {
    // literally just an "is in list" function
    for (const elem of arr) {
        if (privateFandoms.indexOf(elem.text) > -1) {
            return true;
        }
    }
    return false;
}

async function getHTML(url) {
    let response = await fetch(url);
    console.log(response)
    return await response.text();
}


// MAIN RUN-ON-ENTER STUFF


function isWork() {
    return URL.includes("chapters") || URL.includes("series") && !URL.includes("tags") || (URL.includes("works") && !URL.includes("search"));
}

function getTags() {
    return [...DOC.querySelectorAll("li.added.tag")].map((tag) => tag.textContent.replace("×", "").trim());
}

function isMarkedForLater() {
    let tags = getTags();
    return tags.includes("To Read");
}


if (isLoggedIn() && SAVE_AS_TO_READ_ENABLED) {
    IS_WORK = isWork();
    if (IS_WORK) {
        console.log("work")
        DOC = document;

        let IS_MARKED_FOR_LATER = isMarkedForLater();
        // the whole idea here is to not show redundant buttons - save as buttons only when it's not already saved, and mark as button only when it can be marked as read
        if (IS_MARKED_FOR_LATER) {
            MARK_AS_READ_BUTTON = workMarkedForLater();
        } else {
            IS_BOOKMARK = document.querySelector(".bookmark_form_placement_open").textContent === "Edit Bookmark";
            let buttons = createSaveButtonElements();
            SAVE_AS_TO_READ_BUTTON = buttons[0];
            if (ADD_PRIV_SAVE_AS) {
                PRIV_SAVE_AS_TO_READ_BUTTON = buttons[1];
            }

            IS_SERIES = URL.includes("/series/");
            if (IS_SERIES) {
                // add save as to read buttons for the series before adding all the individual ones
                let funcs = createSeriesButtonFunctions();
                addButtonFunctions(funcs);
                addSeriesSaveButtons();
                outsideWork();
            } else {
                let funcs = createWorkButtonFunctions();
                addButtonFunctions(funcs);
                addWorkSaveButtons();
            }
        }
    } else {
        outsideWork()
    }
}

function workMarkedForLater() {
    function createMarkAsReadButton() {
        const markAsReadButton = document.createElement("li");
        markAsReadButton.id = "mark_as_read";
        const child3 = document.createElement("a");
        child3.text = 'Mark as Read'

        // makes it a link in all the important CSS ways
        child3.href = "#mark_as_read";
        child3.onclick = function () {
            markAsRead(markAsReadButton);
            return false;
        }

        markAsReadButton.appendChild(child3);

        return markAsReadButton;
    }

    function addMarkAsReadButton(markAsReadButton) {
        let kudosButton = document.querySelector("#new_kudo");
        kudosButton.parentElement.insertAdjacentElement("afterend", document.createElement("li"));
        kudosButton.parentElement.insertAdjacentElement("afterend", markAsReadButton);
    }

    // needs to come first so it doesn't end after that return in the second if
    if (REPLACE_MARK_FOR_LATER) {
        const navbar = document.querySelector("ul.navigation.actions.work[role='menu']");
        const markForLaterButton = navbar.querySelector(".mark");
        markForLaterButton.remove();
    }

    if (CREATE_MARK_AS_READ_BUTTON) {
        let button = createMarkAsReadButton();
        addMarkAsReadButton(button);
        return button;
    }
}

function markAsRead(button) {
    DOC = document;

    removeToReadTag();

    let data = getBookmarkData();
    updateBookmark(data[0], data[1], data[2], data[3], data[4], data[5], data[6], button.id);
}

function removeToReadTag() {
    let tags = getTags();
    let toReadTag = [...document.querySelectorAll("li.added.tag")][tags.indexOf("To Read")]
    let deleteButton = toReadTag.querySelector(".delete");
    deleteButton.click();

    // both are necessary to remove the original tag and prevent it from being readded when the bookmark is sent
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value = tagBox.value.replace("To Read", "");
}

function getWorkData() {
    const fandoms = DOC.getElementsByClassName("fandom tags");
    const fandomTags = fandoms[1].getElementsByClassName("tag");
    const isPrivateFandom = isInArray(fandomTags);
    const privateBox = DOC.getElementById("bookmark_private");
    const isPrivate = isPrivateFandom || privateBox.checked;

    const bookmarkNotes = DOC.getElementById("bookmark_notes").value;


    let url = DOC.querySelector("li.share").querySelector("a").href.split("/");
    // the url gets expanded when everything is loaded, so we need to take `archiveofourown.org/works/...` into mind
    let id = url[4];

    const tagBox = DOC.getElementById("bookmark_tag_string_autocomplete");
    let bookmarkTags;
    if (tagBox) {
        bookmarkTags = tagBox.value;
    } else {
        bookmarkTags = "To Read";
    }

    let token = DOC.querySelector("meta[name='csrf-token']").getAttribute("content");
    let pseudID = DOC.querySelector("input[name='bookmark[pseud_id]']").getAttribute("value");
    let privacy = isPrivate ? "1" : "0"

    return [id, token, pseudID, bookmarkNotes, bookmarkTags, privacy];
}

function getBookmarkData() {
    let url = DOC.querySelector("#bookmark-form").querySelector("form").action.split("/");
    // the url gets expanded when everything is loaded, so we need to take `archiveofourown.org/works/...` into mind
    let id = url[4];
    console.log("url: " + url)
    console.log("id: " + id)

    let token = DOC.querySelector("meta[name='csrf-token']").getAttribute("content");
    let pseudID = DOC.querySelector("input[name='bookmark[pseud_id]']").getAttribute("value");
    console.log("pseudID: " + pseudID)
    // 2126828671

    let bookmarkNotes = DOC.getElementById("bookmark_notes").value.trim();
    console.log("bookmarkNotes: " + bookmarkNotes)

    let bookmarkTags = getTags().join(", ");
    console.log("bookmarkTags: " + bookmarkTags)

    let privacy = DOC.getElementById("bookmark_private").checked ? "1" : "0";
    console.log("privacy: " + privacy)
    let rec = DOC.getElementById("bookmark_rec").checked ? "1" : "0";
    console.log("rec: " + rec)

    return [id, token, pseudID, bookmarkNotes, bookmarkTags, privacy, rec];
}

function getSeriesData() {
    let id = DOC.querySelector("#subscription_subscribable_id").value;

    let token = DOC.querySelector("meta[name='csrf-token']").getAttribute("content");
    let pseudID = DOC.querySelector("input[name='bookmark[pseud_id]']").getAttribute("value");

    const notes = DOC.getElementById("bookmark_notes")
    const bookmarkNotes = notes.value;

    const tagBox = DOC.getElementById("bookmark_tag_string_autocomplete");
    let bookmarkTags;
    if (tagBox) {
        bookmarkTags = tagBox.value;
    } else {
        bookmarkTags = "To Read";
    }

    const privateBox = DOC.getElementById("bookmark_private");
    const isPrivate = privateBox.checked;
    let privacy = isPrivate ? "1" : "0"

    return [id, token, pseudID, bookmarkNotes, bookmarkTags, privacy];
}

function createSeriesBookmark(id, token, pseudID, bookmarkNotes, bookmarkTags, privacy, buttonID) {
    post("https://archiveofourown.org/series/" + id + "/bookmarks", {
        "authenticity_token": token,
        "bookmark[pseud_id]": pseudID,
        "bookmark[bookmarker_notes]": bookmarkNotes, // url encode the output of bookmarkNotes, if enabled
        "bookmark[tag_string]": bookmarkTags, // see above
        "bookmark[collection_names]": "",
        "bookmark[private]": privacy, // possibly variable
        "bookmark[rec]": "0",
        "commit": "Create"
    }).then((r) => {
        respondToBookmark(r, buttonID);
    });
}

function createBookmark(id, token, pseudID, bookmarkNotes, bookmarkTags, privacy, buttonID) {
    post("https://archiveofourown.org/works/" + id + "/bookmarks", {
        "authenticity_token": token,
        "bookmark[pseud_id]": pseudID,
        "bookmark[bookmarker_notes]": bookmarkNotes, // url encode the output of bookmarkNotes, if enabled
        "bookmark[tag_string]": bookmarkTags, // see above
        "bookmark[collection_names]": "",
        "bookmark[private]": privacy, // possibly variable
        "bookmark[rec]": "0",
        "commit": "Create"
    }).then((r) => {
        respondToBookmark(r, buttonID);
    });
}

function updateBookmark(bookmarkID, token, pseudID, notes, tagString, privacy, rec, buttonID) {
    post("https://archiveofourown.org/bookmarks/" + bookmarkID, {
        "_method": "put",
        "authenticity_token": token,
        "bookmark[pseud_id]": pseudID,
        "bookmark[bookmarker_notes]": notes, // url encode the output of bookmarkNotes, if enabled
        "bookmark[tag_string]": tagString, // see above
        "bookmark[collection_names]": "",
        "bookmark[private]": privacy, // possibly variable
        "bookmark[rec]": rec,
        "commit": "Update"
    }).then((r) => {
        respondToBookmark(r, buttonID);
    });
}

function createSaveButtonElements() {
    let toReadButton = createWorkToReadButton();

    // needs to be outside so the compiler won't yell at me despite the only time this being referenced is inside other ifs with the same condition
    let privToReadButton;
    if (ADD_PRIV_SAVE_AS) {
        privToReadButton = createWorkPrivateToReadButton();
    }

    return [toReadButton, privToReadButton];
}

function createWorkToReadButton() {
    // creates a new button
    const toReadButton = document.createElement("li");
    toReadButton.id = "to_read";

    const child = document.createElement("a");
    child.text = 'Save as "To Read"'

    // makes it a link in all the important CSS ways
    child.href = "#to_read";

    toReadButton.appendChild(child);

    return toReadButton;
}

function createExternalToReadButton(i, url) {
    // creates a new button
    const toReadButton = document.createElement("li");
    toReadButton.id = "to_read";

    const child = document.createElement("a");
    child.text = 'Save as "To Read"'

    child.href = "#to_read_" + i;

    child.onclick = async function () {
        let navPageHTML = await getHTML(url);

        // this is standard parsing
        let parser = new DOMParser();
        let doc = parser.parseFromString(navPageHTML, "text/html");
        DOC = doc;

        bookmarkWorkExternal(child, "Saved as \"To Read\"!", doc);
        // makes the link do nothing except the function when clicked
        return false;
    };

    toReadButton.appendChild(child);

    return toReadButton;
}

function createWorkPrivateToReadButton(i, url) {
    let privToReadButton = document.createElement("li");
    privToReadButton.id = "priv_to_read";

    const child2 = document.createElement("a");
    child2.text = 'Save privately as "To Read"'

    // makes it a link in all the important CSS ways
    child2.href = "#priv_to_read";

    privToReadButton.appendChild(child2);

    return privToReadButton;
}

function createExternalPrivateToReadButton(i, url) {
    let privToReadButton = document.createElement("li");
    privToReadButton.id = "priv_to_read";

    const child2 = document.createElement("a");
    child2.text = 'Save privately as "To Read"'

    // makes it a link in all the important CSS ways
    child2.href = "#priv_to_read_" + i;

    child2.onclick = async function () {
        let navPageHTML = await getHTML(url);

        // this is standard parsing
        let parser = new DOMParser();
        let doc = parser.parseFromString(navPageHTML, "text/html");
        DOC = doc;

        privateBookmarkWorkExternal(child2, "Saved privately as \"To Read\"!", doc);
        // makes the link do nothing except the function when clicked
        return false;
    }

    privToReadButton.appendChild(child2);

    return privToReadButton;
}

function addWorkSaveButtons() {
    const navbar = document.querySelector("ul.navigation.actions.work[role='menu']");

    if (REPLACE_MARK_FOR_LATER) {
        let success = replaceMarkForLater(navbar);

        if (!success) {
            navbar.appendChild(SAVE_AS_TO_READ_BUTTON);

            if (ADD_PRIV_SAVE_AS) {
                navbar.appendChild(PRIV_SAVE_AS_TO_READ_BUTTON);
            }
        }
    }


    function replaceMarkForLater(navbar) {
        const markForLaterButton = navbar.querySelector(".mark");

        // it might not be there if the user has history turned off
        if (markForLaterButton) {
            markForLaterButton.insertAdjacentElement("beforebegin", SAVE_AS_TO_READ_BUTTON);

            if (ADD_PRIV_SAVE_AS) {
                markForLaterButton.insertAdjacentElement("beforebegin", PRIV_SAVE_AS_TO_READ_BUTTON);
            }

            markForLaterButton.remove();

            return true;
        } else {
            console.log("mark for later button not found");
            return false;
        }
    }
}

function addSeriesSaveButtons() {
    const navbar = document.querySelector("ul.navigation.actions[role='navigation']");
    navbar.appendChild(SAVE_AS_TO_READ_BUTTON);

    if (ADD_PRIV_SAVE_AS) {
        navbar.appendChild(PRIV_SAVE_AS_TO_READ_BUTTON);
    }
}

function createSeriesButtonFunctions() {
    let seriesSaveButtonFunc = function () {
        DOC = document;

        bookmarkSeries(SAVE_AS_TO_READ_BUTTON);
        return false;
    };

    let seriesPrivSaveButtonFunc;
    if (ADD_PRIV_SAVE_AS) {
        seriesPrivSaveButtonFunc = function () {
            DOC = document;

            privateBookmarkSeries(PRIV_SAVE_AS_TO_READ_BUTTON);
            return false;
        }
    }

    return [seriesSaveButtonFunc, seriesPrivSaveButtonFunc]
}

function createWorkButtonFunctions() {
    let workSaveButtonFunc = function () {
        DOC = document;

        bookmarkWork(SAVE_AS_TO_READ_BUTTON);
        return false;
    };

    let workPrivSaveButtonFunc;
    if (ADD_PRIV_SAVE_AS) {

        workPrivSaveButtonFunc = function () {
            DOC = document;

            privateBookmarkWork(PRIV_SAVE_AS_TO_READ_BUTTON);
            return false;
        }
    }

    return [workSaveButtonFunc, workPrivSaveButtonFunc];
}

function bookmarkWork(button) {
    let subbed = DOC.querySelector("#new_subscription");
    if (UNSUB_FROM_WORKS && subbed) {
        unsubscribe();
    }

    if (IS_BOOKMARK) {
        console.log("currently bookmarked, updating")
        let data = getBookmarkData();
        data[4] += ", To Read";
        updateBookmark(data[0], data[1], data[2], data[3], data[4], data[5], data[6], button.id);
    } else {
        let data = getWorkData();
        data[4] += ", To Read";
        createBookmark(data[0], data[1], data[2], data[3], data[4], data[5], button.id);
    }
}

function privateBookmarkWork(button) {
    const privateBox = document.getElementById("bookmark_private");
    privateBox.checked = true;

    bookmarkWork(button);
}

function unsubscribe() {
    // can probably be left as-is, because it's all self-contained and works fine
    let token = DOC.querySelector("input[name='authenticity_token']").getAttribute("value");
    let subWorkID = DOC.querySelector("#subscription_subscribable_id").getAttribute("value");
    let subType = DOC.querySelector("#subscription_subscribable_type").getAttribute("value");
    let subscriptionID = DOC.querySelector("input[name='authenticity_token']").parentElement.getAttribute("id").split("_");
    subscriptionID = subscriptionID[subscriptionID.length-1];
    let userURL = DOC.querySelector("#greeting").querySelector("ul").querySelector("li").querySelector("a").href;

    post(userURL + "/subscriptions/" + subscriptionID, {
        "authenticity_token": token,
        "subscription[subscribable_id]": subWorkID,
        "subscription[subscribable_type]": subType,
        "_method": "delete"
    }).then((r) => {
        if (r.ok) {
            let notice = DOC.createElement("div");
            notice.className = "flash notice";
            notice.textContent = `You have successfully unsubscribed from ${DOC.querySelector(".title.heading").textContent}.`;

            let main = DOC.querySelector("#main");
            main.insertAdjacentElement("afterbegin", notice);
        } else {
            let notice = DOC.createElement("div");
            notice.className = "flash notice error";
            notice.textContent = "We're sorry! Something went wrong.";

            let main = DOC.querySelector("#main");
            main.insertAdjacentElement("afterbegin", notice);
        }
    });
}

function addButtonFunctions(funcs) {
    SAVE_AS_TO_READ_BUTTON.childNodes.item(0).onclick = funcs[0];

    if (ADD_PRIV_SAVE_AS) {
        PRIV_SAVE_AS_TO_READ_BUTTON.childNodes.item(0).onclick = funcs[1];
    }
}
