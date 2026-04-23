// CONFIG
import {
    addSavedSeriesToStorage,
    addSavedWorkToStorage,
    clearTags,
    extractIdFromUrl,
    get,
    getAO3Metadata,
    getDocument,
    getStringTags,
    isLoggedIn,
    onError,
    post,
    removeToReadTag, seriesAlreadySaved, setup,
    showFlashNotice, workAlreadySaved
} from "./utilities.js";

let ENABLE_PRIVATE_FANDOMS;
let PRIVATE_FANDOMS;
let SAVE_AS_TO_READ_ENABLED;
let REMOVE_FROM_MARKED_FOR_LATER;
let UNSUB_FROM_WORKS;
let REPLACE_MARK_FOR_LATER;
let ADD_PRIV_SAVE_AS;
let CREATE_MARK_AS_READ_BUTTON;
let EASY_DELETE_BUTTON;
// END CONFIG

const URL = window.location.href;

// LOW-LEVEL UTILITIES

function isInArray(arr) {
    // an "is in list" function checking against `PRIVATE_FANDOMS`
    for (const elem of arr) {
        if (PRIVATE_FANDOMS.indexOf(elem.text) > -1) {
            return true;
        }
    }
    return false;
}

// BOOKMARK HANDLING

function createSeriesBookmark(data, buttonID) {
    _createBookmark(data, buttonID, true);

    addSavedSeriesToStorage(data[0]);
}

function createWorkBookmark(data, buttonID) {
    _createBookmark(data, buttonID, false)

    addSavedWorkToStorage(data[0]);
}

function _createBookmark(data, buttonID, series) {
    // sends off the bookmark request with the data provided

    let id = data[0];
    let token = data[1];
    let pseudID = data[2];
    let bookmarkNotes = data[3];
    let bookmarkTags = data[4];
    let privacy = data[5];

    let url;
    if (series) {
        url = "https://archiveofourown.org/series/" + id + "/bookmarks";
    } else {
        url = "https://archiveofourown.org/works/" + id + "/bookmarks";
    }

    post(url, {
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

function updateBookmark(data, buttonID) {
    let bookmarkID = data[0];
    let token = data[1];
    let pseudID = data[2];
    let notes = data[3];
    let tagString = data[4];
    let privacy = data[5];
    let rec = data[6];

    // sends an update request with the data
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

function deleteBookmark(button) {
    let data = getBookmarkData(document);
    let bookmarkID = data[0];
    let token = data[1];

    // sends a POST which deletes the bookmark
    post("https://archiveofourown.org/bookmarks/" + bookmarkID, {
        "_method": "delete",
        "authenticity_token": token,
    }).then((r) => {
        respondToBookmark(r, button.id);
    });

    console.log("clearing tags");
    clearTags(document);
}

function respondToBookmark(r, type) {
    // adds a flash notice to the top of the screen and changes the text of the button
    if (r.ok) {
        let button;

        if (type.includes("to_read")) {
            button = document.querySelector(`#${type}`).children[0];
            button.textContent = "Saved as \"To Read\"!";
            // always document rather than doc because these will always be seen on the page the user is looking at
            showFlashNotice(`Work successfully saved as "To Read".`);

            button.onclick = function () {
                return false;
            }
        } else if (type.includes("priv_to_read")) {
            button = document.querySelector(`#${type}`).children[0];
            button.textContent = "Saved privately as \"To Read\"!";
            // always document rather than doc because these will always be seen on the page the user is looking at
            showFlashNotice(`Work successfully saved as "To Read".`);

            button.onclick = function () {
                return false;
            }
        } else if (type === "mark_as_read") {
            button = document.querySelector(`#${type}`).children[0];
            button.textContent = "Marked as Read!";
            // always document rather than doc because these will always be seen on the page the user is looking at
            showFlashNotice(`Work successfully marked as read.`);

            button.onclick = function () {
                return false;
            }
        } else if (type === "easy_delete") {
            button = document.querySelector(`#${type}`).children[0];
            button.textContent = "Deleted!";
            // always document rather than doc because these will always be seen on the page the user is looking at
            showFlashNotice(`Bookmark was successfully deleted.`);

            button.onclick = function () {
                return false;
            }
        }
    } else {
        showFlashNotice("We're sorry! Something went wrong.", true);
    }
}


// SMALL UTILITIES


function isWork() {
    if (URL.includes("collections")) {
        // not work:
        // https://archiveofourown.org/collections/yuletide2025
        // https://archiveofourown.org/collections/yuletide2025/works
        // work:
        // https://archiveofourown.org/collections/yuletide2025/works/76350276

        let parts = URL.split("/");
        console.log(parts)
        console.log(parts[6])
        console.log(/[0-9]+/.test(parts[6]))
        if (!parts) {
            return false;
        } else {
            return /[0-9]+/.test(parts[6]);
        }
    } else {
        return URL.includes("chapters")
            || (URL.includes("series")
                && !URL.includes("tags"))
            || (URL.includes("works")
                && !URL.includes("search")
                && !URL.includes("users")
                && !URL.includes("tags")
                && !(URL === "https://archiveofourown.org/works"));
    }
}

function isMarkedForLater() {
    let tags = getStringTags(document);
    return tags.includes("To Read");
}


// BUTTON CREATION

function createWorkToReadButton(priv, series) {
    // these will always be on the user-facing page
    const toReadButton = document.createElement("li");
    const child = document.createElement("button");
    child.type = "button";
    if (priv) {
        toReadButton.id = "priv_to_read";
        child.textContent = 'Save privately as "To Read"';
    } else {
        toReadButton.id = "to_read";
        child.textContent = 'Save as "To Read"';
    }

    if (series) {
        child.onclick = function () {
            bookmarkSeries(document, toReadButton, priv);
            return false;
        };
    } else {
        child.onclick = function () {
            bookmarkWork(document, toReadButton, priv);
            createMarkAsReadButton();
            createEasyDeleteButton();

            let button = document.querySelector("#to_read");

            // we add a delay so the user can see the "saved as ... " message before the button disappears
            setTimeout(function () {
                button.remove();
            }, 3 * 1000);

            if (ADD_PRIV_SAVE_AS) {
                let privButton = document.querySelector("#priv_to_read");
                setTimeout(function () {
                    privButton.remove();
                }, 3 * 1000);
            }

            return false;
        };
    }
    toReadButton.appendChild(child);

    return toReadButton;
}

function createExternalToReadButton(i, url, series, priv) {
    // creates a new button
    const toReadButton = document.createElement("li");
    const child = document.createElement("button");
    child.type = "button";
    const workID = extractIdFromUrl(url);
    console.log(`SaveAsToRead: id is ${workID}`)

    if (priv) {
        toReadButton.id = "priv_to_read_" + workID;
        child.textContent = 'Save privately as "To Read"';
    } else {
        toReadButton.id = "to_read_" + workID;
        child.textContent = 'Save as "To Read"';
    }

    child.onclick = async function () {
        let doc = await getDocument(url);

        if (series) {
            bookmarkSeries(doc, toReadButton, priv);
        } else {
            bookmarkWork(doc, toReadButton, priv, url);
        }
        // makes the link do nothing except the function when clicked
        return false;
    };

    toReadButton.appendChild(child);

    return toReadButton;
}

function addSaveButton(series, priv) {
    function replaceMarkForLater(navbar) {
        const markForLaterButton = navbar.querySelector(".mark");

        // it might not be there if the user has history turned off
        if (markForLaterButton) {
            markForLaterButton.insertAdjacentElement("beforebegin", saveButton);
            markForLaterButton.style.display = "none";

            return true;
        } else {
            console.warn(`SaveAsToRead: mark for later button not found`);
            return false;
        }
    }

    let navbar;
    if (series) {
        navbar = document.querySelector("ul.navigation.actions[role='navigation']");
    } else {
        navbar = document.querySelector("ul.navigation.actions.work");
    }

    if (!navbar) {
        console.log("navbar selector broke :(")
    }

    let saveButton = createWorkToReadButton(priv, series);

    if (REPLACE_MARK_FOR_LATER) {
        let success = replaceMarkForLater(navbar);

        if (!success) {
            navbar.appendChild(saveButton);
        }
    } else {
        navbar.appendChild(saveButton);
    }
}

function createMarkAsReadButton() {
    // all the mark as read button functionality in one function
    function createButton() {
        const markAsReadButton = document.createElement("li");
        markAsReadButton.id = "mark_as_read";
        const child = document.createElement("button");
        child.type = "button";
        child.textContent = "Mark as Read";

        // makes it a link in all the important CSS ways
        child.href = "#mark_as_read";
        child.onclick = function () {
            markAsRead(markAsReadButton);

            addSaveButton(false);

            if (ADD_PRIV_SAVE_AS) {
                addSaveButton(false, true);
            }

            let button = document.querySelector("#mark_as_read");

            // we add a delay so the user can see the "marked as ... " message before the button disappears
            setTimeout(function () {
                button.remove();
            }, 3 * 1000);

            return false;
        }

        markAsReadButton.appendChild(child);

        return markAsReadButton;
    }

    function addMarkAsReadButton(markAsReadButton) {
        let kudosButton = document.querySelector("#new_kudo");
        kudosButton.parentElement.insertAdjacentElement("afterend", document.createElement("li"));
        kudosButton.parentElement.insertAdjacentElement("afterend", markAsReadButton);
    }

    let button = createButton();
    addMarkAsReadButton(button);
}

function createEasyDeleteButton() {
    function createButton() {
        const easyDeleteButton = document.createElement("li");
        easyDeleteButton.id = "easy_delete";
        const child = document.createElement("button");
        child.type = "button";
        child.textContent = "Easy Delete";

        // makes it a link in all the important CSS ways
        child.href = "#easy_delete";
        child.onclick = function () {
            deleteBookmark(easyDeleteButton);

            addSaveButton(false);

            if (ADD_PRIV_SAVE_AS) {
                addSaveButton(false, true);
            }

            let button = document.querySelector("#easy_delete");

            // we add a delay so the user can see the "deleted" message before the button disappears
            setTimeout(function () {
                button.remove();
            }, 3 * 1000);

            return false;
        }

        easyDeleteButton.appendChild(child);

        return easyDeleteButton;
    }

    function addEasyDeleteButton(easyDeleteButton) {
        let navbar = document.querySelector("ul.navigation.actions.work");

        if (!navbar) {
            console.log("navbar selector broke :(")
        }

        navbar.appendChild(easyDeleteButton);
    }

    let button = createButton();
    addEasyDeleteButton(button);
}


// BUTTON FUNCTIONS


function unsubscribe(doc) {
    // unsubscribes from a story, given a document
    // can probably be left as-is, because it's all self-contained and works fine
    let metadata = getAO3Metadata(doc);
    let token = metadata.token;

    let subWorkID = doc.querySelector("#subscription_subscribable_id").getAttribute("value");
    let subType = doc.querySelector("#subscription_subscribable_type").getAttribute("value");
    let subscriptionID = doc.querySelector("input[name='authenticity_token']").parentElement.getAttribute("id").split("_");
    subscriptionID = subscriptionID[subscriptionID.length - 1];
    let userURL = doc.querySelector("#greeting").querySelector("ul").querySelector("li").querySelector("a").href;

    post(userURL + "/subscriptions/" + subscriptionID, {
        "authenticity_token": token,
        "subscription[subscribable_id]": subWorkID,
        "subscription[subscribable_type]": subType,
        "_method": "delete"
    }).then((r) => {
        if (r.ok) {
            showFlashNotice(`You have successfully unsubscribed from ${doc.querySelector(".title.heading").textContent}.`, false, doc);
        } else {
            showFlashNotice("We're sorry! Something went wrong.", true, doc)
        }
    });
}

function removeFromMarkedForLater(doc, url) {
    let userURL = doc.querySelector("#greeting").querySelector("ul").querySelector("li").querySelector("a").href;

    get(url + "/mark_as_read").then((r) => {
        if (r.ok) {
            let notice = showFlashNotice("This work was removed from your marked for later.", false, doc);

            let listLink = doc.createElement("a");
            listLink.href = userURL + "/readings?show=to-read";
            listLink.text = "Marked for Later list";

            notice.childNodes.add(listLink);
            notice.insertAdjacentText("beforeend", ".");
        } else {
            showFlashNotice("We're sorry! Something went wrong.", true, doc);
        }
    });
}

function markAsRead(button) {
    // provides the actual function of a mark as read button
    let doc = document;

    removeToReadTag(doc);

    updateBookmark(getBookmarkData(doc), button.id);
}

function bookmarkWork(doc, button, priv, url = URL) {
    let subbed = doc.querySelector("#new_subscription");
    if (UNSUB_FROM_WORKS && subbed) {
        unsubscribe(doc);
    }

    let mainList = doc.querySelector("li[class='mark']");
    let linksOfList = mainList.querySelector("a");
    if (linksOfList) {
        let isInMarkedForLaterList = linksOfList.textContent.includes("Mark as Read");
        if (REMOVE_FROM_MARKED_FOR_LATER && isInMarkedForLaterList) {
            removeFromMarkedForLater(doc, url);
        }
    }

    if (priv) {
        const privateBox = doc.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    let isBookmark = doc.querySelector(".bookmark_form_placement_open").textContent.includes("Edit");

    let data;
    if (isBookmark) {
        console.log(`SaveAsToRead: currently bookmarked, updating`)

        data = getBookmarkData(doc);
        data[4] += ", To Read";

        updateBookmark(data, button.id);
    } else {
        data = getWorkData(doc);
        data[4] += ", To Read";

        createWorkBookmark(data, button.id);
    }
}

function bookmarkSeries(doc, button, priv) {
    if (priv) {
        const privateBox = doc.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    let bookmarkTags = doc.querySelector("#bookmark_tag_string").value.trim();

    console.log(`SaveAsToRead: this is a series`)

    let data = getSeriesData(doc);
    data[4] += ", To Read";
    createSeriesBookmark(data, button.id);
}


// GET DATA FUNCS


function getWorkData(doc) {
    const fandoms = doc.getElementsByClassName("fandom tags");
    const fandomTags = fandoms[1].getElementsByClassName("tag");
    const isPrivateFandom = isInArray(fandomTags);
    const privateBox = doc.getElementById("bookmark_private");
    const isPrivate = (isPrivateFandom && ENABLE_PRIVATE_FANDOMS) || privateBox.checked;

    const bookmarkNotes = doc.getElementById("bookmark_notes").value;

    let downloadButton = doc.querySelector("li.download");
    if (!downloadButton) {
        console.error("No download button found");
    }
    let linkElem = downloadButton.querySelector("ul").querySelector("li").querySelector("a");
    let url = linkElem.href;
    let id = extractIdFromUrl(url);

    const tagBox = doc.getElementById("bookmark_tag_string_autocomplete");
    let bookmarkTags;
    if (tagBox) {
        bookmarkTags = tagBox.value;
    } else {
        bookmarkTags = "";
    }

    let metadata = getAO3Metadata(doc);
    let token = metadata.token;
    let pseudID = metadata.pseudID;

    let privacy = isPrivate ? "1" : "0"

    return [id, token, pseudID, bookmarkNotes, bookmarkTags, privacy];
}

function getBookmarkData(doc) {
    let url = doc.querySelector("#bookmark-form").querySelector("form").action;
    // the url gets expanded when everything is loaded, so we need to take `archiveofourown.org/works/...` into mind
    let id = extractIdFromUrl(url);
    console.info(`SaveAsToRead: url: ${url}`)
    console.info(`SaveAsToRead: id: ${id}`)


    let metadata = getAO3Metadata(doc);
    let token = metadata.token;
    let pseudID = metadata.pseudID;
    console.info(`SaveAsToRead: pseudID: ${pseudID}`)

    let bookmarkNotes = doc.getElementById("bookmark_notes").value.trim();
    console.info(`SaveAsToRead: bookmarkNotes: ${bookmarkNotes}`)

    let bookmarkTags = getStringTags(doc).join(", ");
    if (bookmarkTags.length === 0) {
        bookmarkTags = doc.querySelector("#bookmark_tag_string").value.trim();
    }
    console.info(`SaveAsToRead: bookmarkTags: ${bookmarkTags}`)

    let privacy = doc.getElementById("bookmark_private").checked ? "1" : "0";
    console.info(`SaveAsToRead: privacy: ${privacy}`)
    let rec = doc.getElementById("bookmark_rec").checked ? "1" : "0";
    console.info(`SaveAsToRead: rec: ${rec}`)

    return [id, token, pseudID, bookmarkNotes, bookmarkTags, privacy, rec];
}

function getSeriesData(doc) {
    let id = doc.querySelector("#subscription_subscribable_id").value;

    let metadata = getAO3Metadata(doc);
    let token = metadata.token;
    let pseudID = metadata.pseudID;

    const notes = doc.getElementById("bookmark_notes")
    const bookmarkNotes = notes.value;
    console.info(`SaveAsToRead: bookmarkNotes for series: ${bookmarkNotes}`)

    const tagBox = doc.getElementById("bookmark_tag_string");
    let bookmarkTags;
    if (tagBox) {
        bookmarkTags = tagBox.value;
    } else {
        bookmarkTags = "";
    }

    const privateBox = doc.getElementById("bookmark_private");
    const isPrivate = privateBox.checked;
    let privacy = isPrivate ? "1" : "0"

    return [id, token, pseudID, bookmarkNotes, bookmarkTags, privacy];
}


// MAIN CODE


async function addButtonsToMultiWorkPage() {
    const works = document.querySelectorAll('li[role="article"]');
    let i = 1;

    for (const work of works) {
        let header = work.querySelector(".header");

        if (!header) {
            // we hit some kind of issue with the header of this one, but the next might be fine
            console.error(`SaveAsToRead: header of work ${i} has no link, skipping`);
            continue;
        }

        let url = header.querySelector("a").href;

        const id = extractIdFromUrl(url);
        let isWorkSaved = await workAlreadySaved(id);
        console.log(`isWorkSaved: ${isWorkSaved}`)

        let isSeriesSaved = await seriesAlreadySaved(id);
        console.log(`isSeriesSaved: ${isSeriesSaved}`)

        if (isWorkSaved || isSeriesSaved) {
            console.log(`SaveAsToRead: ${i} already saved, add border`);
            // header.parentElement.style.border = "3px solid #63f542";
        } else {
            console.log(`SaveAsToRead: ${i} not saved, no border`);
        }

        let ul = document.createElement("ul");
        ul.style.display = "flex";
        ul.style.justifyContent = "space-evenly";

        let toReadButton = createExternalToReadButton(i, url, url.includes("series"), false);
        toReadButton.className = "actions";

        ul.insertAdjacentElement("beforeend", toReadButton);

        if (ADD_PRIV_SAVE_AS) {
            let privToReadButton = createExternalToReadButton(i, url, url.includes("series"), true);
            privToReadButton.className = "actions";

            ul.insertAdjacentElement("beforeend", privToReadButton);
        }


        let blockquote = work.querySelector("dl.stats");
        blockquote.insertAdjacentElement("beforebegin", ul);
        i++;
    }
}

console.log("loaded saveAsToRead.js");

function initialiseExtension(settings) {
    // needs to be global variables because they are referenced everywhere
    SAVE_AS_TO_READ_ENABLED = settings["save_as_to_read_enabled"] ?? true;
    REMOVE_FROM_MARKED_FOR_LATER = settings["remove_from_marked_for_later"] ?? false;
    UNSUB_FROM_WORKS = settings["unsub_from_works"] ?? false;
    REPLACE_MARK_FOR_LATER = settings["replace_mark_for_later"] ?? true;
    ADD_PRIV_SAVE_AS = settings["add_priv_save_as"] ?? true;
    ENABLE_PRIVATE_FANDOMS = settings["enable_private_fandoms"] ?? false;
    PRIVATE_FANDOMS = settings["private_fandoms"] ?? [];
    CREATE_MARK_AS_READ_BUTTON = settings["create_mark_as_read_button"] ?? true;
    EASY_DELETE_BUTTON = settings["easy_delete_button"] ?? true;

    if (isLoggedIn() && SAVE_AS_TO_READ_ENABLED) {
        if (isWork()) {
            console.log(`SaveAsToRead: this is a work`)
            // the whole idea here is to not show redundant buttons - save as buttons only when it's not already saved, and mark as button only when it can be marked as read
            if (isMarkedForLater()) {
                if (REPLACE_MARK_FOR_LATER) {
                    const navbar = document.querySelector("ul.navigation.actions.work");
                    const markForLaterButton = navbar.querySelector(".mark");
                    markForLaterButton.remove();
                }

                if (CREATE_MARK_AS_READ_BUTTON) {
                    console.log(`SaveAsToRead: currently marked for later, adding mark as read button`)
                    createMarkAsReadButton();
                }

                if (EASY_DELETE_BUTTON) {
                    console.log(`SaveAsToRead: currently marked for later, adding an easy-delete button`)
                    createEasyDeleteButton();
                }
            } else {
                console.log(`SaveAsToRead: not marked for later, adding save as to read buttons`)

                let isSeries = URL.includes("/series/");
                addSaveButton(isSeries);

                if (ADD_PRIV_SAVE_AS) {
                    addSaveButton(isSeries, true);
                }

                // add save as to read buttons for the series before adding all the individual ones
                if (isSeries) {
                    addButtonsToMultiWorkPage().then();
                }
            }
        } else {
            addButtonsToMultiWorkPage().then();
        }
    }
}

setup([
    "save_as_to_read_enabled",
    "remove_from_marked_for_later",
    "unsub_from_works",
    "replace_mark_for_later",
    "add_priv_save_as",
    "enable_private_fandoms",
    "private_fandoms",
    "create_mark_as_read_button"
], initialiseExtension);