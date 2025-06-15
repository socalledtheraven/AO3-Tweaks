// CONFIG
const PRIVATE_FANDOMS = [""]
const SAVE_AS_TO_READ_ENABLED = true;
const UNSUB_FROM_WORKS = false;
const REPLACE_MARK_FOR_LATER = true;
const ADD_PRIV_SAVE_AS = true;
const CREATE_MARK_AS_READ_BUTTON = true;
// END CONFIG

const URL = window.location.href;

function outsideWork() {
    const works = document.querySelectorAll('li[role="article"]');
    let i = 1;

    for (const work of works) {
        let header = work.querySelector(".header");
        let url = header.querySelector("a").href;
        let ul = document.createElement("ul");
        ul.style.display = "flex";

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

function respondToBookmark(r, type) {
    if (r.ok) {
        // always document rather than doc because these will always be seen on the page the user is looking at
        let notice = document.createElement("div");
        notice.className = "flash notice";
        notice.textContent = `Work successfully saved as "To Read".`;

        let main = document.querySelector("#main");
        main.insertAdjacentElement("afterbegin", notice);

        let button;
        console.log(type)
        if (type.includes("to_read")) {
            console.log("to_read")
            button = document.querySelector(`#${type}`).children[0];
            console.log(button)
            button.textContent = "Saved as \"To Read\"!";
            button.onclick = function () {
                return false;
            }
        } else if (type.includes("priv_to_read")) {
            console.log("priv_to_read")
            button = document.querySelector(`#${type}`).children[0];
            console.log(button)
            button.textContent = "Saved privately as \"To Read\"!";
            button.onclick = function () {
                return false;
            }
        } else if (type === "mark_as_read") {
            button = document.querySelector(`#${type}`).children[0];
            button.textContent = "Marked as Read!";
            button.onclick = function () {
                return false;
            }
        }
    } else {
        let notice = document.createElement("div");
        notice.className = "flash notice error";
        notice.textContent = "We're sorry! Something went wrong.";

        let main = document.querySelector("#main");
        main.insertAdjacentElement("afterbegin", notice);
    }
}

function isLoggedIn() {
    // when used in an if, this will check for the existence of the element
    // it's basically being cast to bool
    return !document.querySelector("#login");
}

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
        if (PRIVATE_FANDOMS.indexOf(elem.text) > -1) {
            return true;
        }
    }
    return false;
}

async function getHTML(url) {
    let response = await fetch(url);
    return await response.text();
}

function isWork() {
    return URL.includes("chapters") || (URL.includes("series") && !URL.includes("tags")) || (URL.includes("works") && !URL.includes("search") && !URL.includes("users") && !URL.includes("tags"));
}

function getTags(doc) {
    return [...doc.querySelectorAll("li.added.tag")].map((tag) => tag.textContent.replace("×", "").trim());
}

function isMarkedForLater() {
    let tags = getTags(document);
    return tags.includes("To Read");
}

function markAsReadButton() {
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
    }
}

function markAsRead(button) {
    let doc = document;

    removeToReadTag(doc);

    let data = getBookmarkData(doc);
    updateBookmark(data[0], data[1], data[2], data[3], data[4], data[5], data[6], button.id);
}

function removeToReadTag(doc) {
    let tags = getTags(doc);
    let toReadTag = tags[tags.indexOf("To Read")]
    let deleteButton = toReadTag.querySelector(".delete");
    deleteButton.click();

    // both are necessary to remove the original tag and prevent it from being readded when the bookmark is sent
    const tagBox = doc.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value = tagBox.value.replace("To Read", "");
}

function getWorkData(doc) {
    const fandoms = doc.getElementsByClassName("fandom tags");
    const fandomTags = fandoms[1].getElementsByClassName("tag");
    const isPrivateFandom = isInArray(fandomTags);
    const privateBox = doc.getElementById("bookmark_private");
    const isPrivate = isPrivateFandom || privateBox.checked;

    const bookmarkNotes = doc.getElementById("bookmark_notes").value;

    let url = doc.querySelector("li.share").querySelector("a").href.split("/");
    // the url gets expanded when everything is loaded, so we need to take `archiveofourown.org/works/...` into mind
    let id = url[4];

    const tagBox = doc.getElementById("bookmark_tag_string_autocomplete");
    let bookmarkTags;
    if (tagBox) {
        bookmarkTags = tagBox.value;
    } else {
        bookmarkTags = "";
    }

    let token = doc.querySelector("meta[name='csrf-token']").getAttribute("content");
    let pseudID = doc.querySelector("input[name='bookmark[pseud_id]']").getAttribute("value");
    let privacy = isPrivate ? "1" : "0"

    return [id, token, pseudID, bookmarkNotes, bookmarkTags, privacy];
}

function getBookmarkData(doc) {
    let url = doc.querySelector("#bookmark-form").querySelector("form").action.split("/");
    // the url gets expanded when everything is loaded, so we need to take `archiveofourown.org/works/...` into mind
    let id = url[4];
    console.log("url: " + url)
    console.log("id: " + id)

    let token = doc.querySelector("meta[name='csrf-token']").getAttribute("content");
    let pseudID = doc.querySelector("input[name='bookmark[pseud_id]']").getAttribute("value");
    console.log("pseudID: " + pseudID)

    let bookmarkNotes = doc.getElementById("bookmark_notes").value.trim();
    console.log("bookmarkNotes: " + bookmarkNotes)

    let bookmarkTags = getTags(doc).join(", ");
    if (bookmarkTags.length === 0) {
        bookmarkTags = doc.querySelector("#bookmark_tag_string").value.trim();
    }
    console.log("bookmarkTags: " + bookmarkTags)

    let privacy = doc.getElementById("bookmark_private").checked ? "1" : "0";
    console.log("privacy: " + privacy)
    let rec = doc.getElementById("bookmark_rec").checked ? "1" : "0";
    console.log("rec: " + rec)

    return [id, token, pseudID, bookmarkNotes, bookmarkTags, privacy, rec];
}

function getSeriesData(doc) {
    let id = doc.querySelector("#subscription_subscribable_id").value;

    let token = doc.querySelector("meta[name='csrf-token']").getAttribute("content");
    let pseudID = doc.querySelector("input[name='bookmark[pseud_id]']").getAttribute("value");

    const notes = doc.getElementById("bookmark_notes")
    const bookmarkNotes = notes.value;

    const tagBox = doc.getElementById("bookmark_tag_string");
    let bookmarkTags;
    if (tagBox) {
        bookmarkTags = tagBox.value;
    } else {
        bookmarkTags = "To Read";
    }

    const privateBox = doc.getElementById("bookmark_private");
    const isPrivate = privateBox.checked;
    let privacy = isPrivate ? "1" : "0"

    return [id, token, pseudID, bookmarkNotes, bookmarkTags, privacy];
}

function createBookmark(id, token, pseudID, bookmarkNotes, bookmarkTags, privacy, buttonID, series) {
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
    let toReadButton = createWorkToReadButton(false);

    // needs to be outside so the compiler won't yell at me despite the only time this being referenced is inside other ifs with the same condition
    let privToReadButton;
    if (ADD_PRIV_SAVE_AS) {
        privToReadButton = createWorkToReadButton(true);
    }

    return [toReadButton, privToReadButton];
}

function createWorkToReadButton(priv, series) {
    // these will always be on the user-facing page
    const toReadButton = document.createElement("li");
    if (priv) {
        toReadButton.id = "priv_to_read";
    } else {
        toReadButton.id = "to_read";
    }

    const child = document.createElement("a");
    if (priv) {
        child.text = 'Save privately as "To Read"'
    } else {
        child.text = 'Save as "To Read"'
    }

    // makes it a link in all the important CSS ways
    if (priv) {
        child.href = "#priv_to_read";
    } else {
        child.href = "#to_read";
    }

    if (series) {
        child.onclick = function () {
            bookmarkSeries(document, toReadButton, priv);
            return false;
        };
    } else {
        child.onclick = function () {
            bookmarkWork(document, toReadButton, priv);
            return false;
        };
    }
    toReadButton.appendChild(child);

    return toReadButton;
}

function createExternalToReadButton(i, url, series, priv) {
    // creates a new button
    const toReadButton = document.createElement("li");
    if (priv) {
        toReadButton.id = "priv_to_read_" + i;
    } else {
        toReadButton.id = "to_read_" + i;
    }

    const child = document.createElement("a");
    if (priv) {
        child.text = 'Save privately as "To Read"'
    } else {
        child.text = 'Save as "To Read"'
    }

    if (priv) {
        child.href = "#priv_to_read_" + i;
    } else {
        child.href = "#to_read_" + i;
    }

    child.onclick = async function () {
        let navPageHTML = await getHTML(url);

        // this is standard parsing
        let parser = new DOMParser();
        let doc = parser.parseFromString(navPageHTML, "text/html");

        if (series) {
            bookmarkSeries(doc, toReadButton, priv);
        } else {
            bookmarkWork(doc, toReadButton, priv);
        }
        // makes the link do nothing except the function when clicked
        return false;
    };

    toReadButton.appendChild(child);

    return toReadButton;
}

function addSaveButtons(series, saveButton, privSaveButton) {
    let navbar;
    if (series) {
        navbar = document.querySelector("ul.navigation.actions[role='navigation']");
    } else {
        navbar = document.querySelector("ul.navigation.actions.work[role='menu']");
    }

    if (REPLACE_MARK_FOR_LATER) {
        let success = replaceMarkForLater(navbar);

        if (!success) {
            navbar.appendChild(saveButton);

            if (ADD_PRIV_SAVE_AS) {
                navbar.appendChild(privSaveButton);
            }
        }
    }


    function replaceMarkForLater(navbar) {
        const markForLaterButton = navbar.querySelector(".mark");

        // it might not be there if the user has history turned off
        if (markForLaterButton) {
            markForLaterButton.insertAdjacentElement("beforebegin", saveButton);

            if (ADD_PRIV_SAVE_AS) {
                markForLaterButton.insertAdjacentElement("beforebegin", privSaveButton);
            }

            markForLaterButton.remove();

            return true;
        } else {
            console.log("mark for later button not found");
            return false;
        }
    }
}

function bookmarkWork(doc, button, priv) {
    let subbed = doc.querySelector("#new_subscription");
    if (UNSUB_FROM_WORKS && subbed) {
        unsubscribe(doc);
    }

    if (priv) {
        const privateBox = doc.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    let isBookmark = doc.querySelector(".bookmark_form_placement_open").textContent.includes("Edit");

    if (isBookmark) {
        console.log("currently bookmarked, updating")
        let data = getBookmarkData(doc);
        data[4] += ", To Read";
        updateBookmark(data[0], data[1], data[2], data[3], data[4], data[5], data[6], button.id);
    } else {
        let data = getWorkData(doc);
        data[4] += ", To Read";
        console.log(button.id)
        createBookmark(data[0], data[1], data[2], data[3], data[4], data[5], button.id, false);
    }
}

function bookmarkSeries(doc, button, priv) {
    if (priv) {
        const privateBox = doc.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    let bookmarkTags = doc.querySelector("#bookmark_tag_string").value.trim();
    bookmarkTags.value += ", To Read";

    console.log("seris")
    let data = getSeriesData(doc);
    createBookmark(data[0], data[1], data[2], data[3], data[4], data[5], button.id, true);
}

function unsubscribe(doc) {
    // can probably be left as-is, because it's all self-contained and works fine
    let token = doc.querySelector("input[name='authenticity_token']").getAttribute("value");
    let subWorkID = doc.querySelector("#subscription_subscribable_id").getAttribute("value");
    let subType = doc.querySelector("#subscription_subscribable_type").getAttribute("value");
    let subscriptionID = doc.querySelector("input[name='authenticity_token']").parentElement.getAttribute("id").split("_");
    subscriptionID = subscriptionID[subscriptionID.length-1];
    let userURL = doc.querySelector("#greeting").querySelector("ul").querySelector("li").querySelector("a").href;

    post(userURL + "/subscriptions/" + subscriptionID, {
        "authenticity_token": token,
        "subscription[subscribable_id]": subWorkID,
        "subscription[subscribable_type]": subType,
        "_method": "delete"
    }).then((r) => {
        if (r.ok) {
            let notice = doc.createElement("div");
            notice.className = "flash notice";
            notice.textContent = `You have successfully unsubscribed from ${doc.querySelector(".title.heading").textContent}.`;

            let main = doc.querySelector("#main");
            main.insertAdjacentElement("afterbegin", notice);
        } else {
            let notice = doc.createElement("div");
            notice.className = "flash notice error";
            notice.textContent = "We're sorry! Something went wrong.";

            let main = doc.querySelector("#main");
            main.insertAdjacentElement("afterbegin", notice);
        }
    });
}

if (isLoggedIn() && SAVE_AS_TO_READ_ENABLED) {
    if (isWork()) {
        console.log("work")
        // the whole idea here is to not show redundant buttons - save as buttons only when it's not already saved, and mark as button only when it can be marked as read
        if (isMarkedForLater()) {
            markAsReadButton();
        } else {
            let buttons = createSaveButtonElements();
            let saveAsToReadButton = buttons[0];

            let privSaveAsToReadButton;
            if (ADD_PRIV_SAVE_AS) {
                privSaveAsToReadButton = buttons[1];
            }

            let isSeries = URL.includes("/series/");
            addSaveButtons(isSeries, saveAsToReadButton, privSaveAsToReadButton);

            if (isSeries) {
                // add save as to read buttons for the series before adding all the individual ones
                outsideWork();
            }
        }
    } else {
        outsideWork()
    }
}
