// CONFIG
const privateFandoms = [""]
const SAVE_AS_TO_READ_ENABLED = true;
const UNSUB_FROM_WORKS = false;
const REPLACE_MARK_FOR_LATER = true;
const ADD_PRIV_SAVE_AS = true;
const MARK_AS_READ_BUTTON = true;
// END CONFIG

function bookmarkSeries() {
    let subbed = document.querySelector("#new_subscription");
    if (UNSUB_FROM_WORKS && subbed) {
        unsubscribe();
    }

    // this may not play nice with other things modifying the tagbox at bookmarktime
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value += ", To Read";

    submitBookmark();
}

function privateBookmarkSeries() {
    let subbed = document.querySelector("#new_subscription");
    if (UNSUB_FROM_WORKS && subbed) {
        unsubscribe();
    }

    if (ADD_PRIV_SAVE_AS) {
        const privateBox = document.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    // this may not play nice with other things modifying the tagbox at bookmarktime
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value += ", To Read";

    submitBookmark();
}

function bookmarkWork(button, message) {
    let subbed = document.querySelector("#new_subscription");
    if (UNSUB_FROM_WORKS && subbed) {
        unsubscribe();
    }

    const fandoms = document.getElementsByClassName("fandom tags");
    const fandomTags = fandoms[1].getElementsByClassName("tag");
    const isPrivateFandom = isInArray(fandomTags);

    const notes = document.getElementById("bookmark_notes")

    // this may not play nice with other things modifying the tagbox at bookmarktime
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value += ", To Read";

    let url = location.href.split("/");
    let id = url[url.length-1];

    const privateBox = document.getElementById("bookmark_private");

    submitBookmark(id, isPrivateFandom || privateBox.checked, notes.value, tagBox.value, button, message);
}

function privBookmarkWork(button, message) {
    const privateBox = document.getElementById("bookmark_private");
    privateBox.checked = true;

    bookmarkWork(button, message);
}

function markAsRead(tags) {
    // this may not play nice with other things modifying the tagbox at bookmarktime
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value = tagBox.value.replace("To Read", "");

    let toReadTag = [...document.querySelectorAll("li.added.tag")][tags.indexOf("To Read")]
    let deleteButton = toReadTag.querySelector(".delete");
    deleteButton.click();

    const fandoms = document.getElementsByClassName("fandom tags");
    const fandomTags = fandoms[1].getElementsByClassName("tag");
    const isPrivateFandom = isInArray(fandomTags);

    const notes = document.getElementById("bookmark_notes")

    let url = location.href.split("/");
    let id = url[url.length-1];

    submitBookmark(id, isPrivateFandom || ADD_PRIV_SAVE_AS, notes.value, tagBox.value);
}

// literally just an "is in list" function
function isInArray(arr) {
    for (const elem of arr) {
        if (privateFandoms.indexOf(elem.text) > -1) {
            return true;
        }
    }
    return false;
}

function createToReadButton() {
    // creates a new button
    const toReadButton = document.createElement("li");
    toReadButton.id = "to_read";
    const child = document.createElement("a");
    child.text = 'Save as "To Read"'
    // makes it a link in all the important css ways
    child.href = "#to_read";
    // makes the link do nothing except the function when clicked
    child.onclick = function () {
        bookmarkWork(child, "Saved as \"To Read\"!");
        return false;
    }

    toReadButton.appendChild(child);

    return toReadButton;
}

function createPrivateToReadButton() {
    let privToReadButton = document.createElement("li");
    privToReadButton.id = "priv_to_read";
    const child2 = document.createElement("a");
    child2.text = 'Save privately as "To Read"'
    // makes it a link in all the important css ways
    child2.href = "#priv_to_read";
    child2.onclick = function () {
        privBookmarkWork(child2, "Saved privately as \"To Read\"!");
    }

    privToReadButton.appendChild(child2);

    return privToReadButton;
}

function createMarkAsReadButton(tags) {
    const markAsReadButton = document.createElement("li");
    markAsReadButton.id = "mark_as_read";
    const child3 = document.createElement("a");
    child3.text = 'Mark as Read'
    // makes it a link in all the important css ways
    child3.href = "#mark_as_read";
    child3.onclick = function () {
        markAsRead(tags);
        return false;
    }

    markAsReadButton.appendChild(child3);

    let kudosButton = document.querySelector("#new_kudo");
    kudosButton.parentElement.insertAdjacentElement("afterend", document.createElement("li"));
    kudosButton.parentElement.insertAdjacentElement("afterend", markAsReadButton);
}

function replaceMarkForLater(navbar, toReadButton, privToReadButton) {
    const markForLaterButton = navbar.querySelector(".mark");

    // it might not be there if the user has history turned off
    if (markForLaterButton) {
        markForLaterButton.insertAdjacentElement("beforebegin", toReadButton);

        if (ADD_PRIV_SAVE_AS) {
            markForLaterButton.insertAdjacentElement("beforebegin", privToReadButton);
        }

        markForLaterButton.remove();
    } else {
        navbar.appendChild(toReadButton);

        if (ADD_PRIV_SAVE_AS) {
            navbar.appendChild(privToReadButton);
        }
    }
}

function addWorkSaveButtons(toReadButton, privToReadButton) {
    const navbar = document.querySelector("ul.navigation.actions.work[role='menu']");

    if (REPLACE_MARK_FOR_LATER) {
        replaceMarkForLater(navbar, toReadButton, privToReadButton);
    } else {
        navbar.appendChild(toReadButton);

        if (ADD_PRIV_SAVE_AS) {
            navbar.appendChild(privToReadButton);
        }
    }
}

function addSeriesSaveButtons(toReadButton, privToReadButton) {
    const navbar = document.querySelector("ul.navigation.actions[role='navigation']");
    toReadButton.childNodes.item(0).onclick = function () {
        bookmarkSeries();
        return false;
    }

    privToReadButton.childNodes.item(0).onclick = function () {
        privateBookmarkSeries();
        return false;
    }

    navbar.appendChild(toReadButton);

    if (ADD_PRIV_SAVE_AS) {
        navbar.appendChild(privToReadButton);
    }
}

function workMarkedForLater(tags) {
    if (MARK_AS_READ_BUTTON) {
        createMarkAsReadButton(tags);
    }

    if (REPLACE_MARK_FOR_LATER) {
        const navbar = document.querySelector("ul.navigation.actions.work[role='menu']");
        const markForLaterButton = navbar.querySelector(".mark");
        markForLaterButton.remove();
    }
}

function workNotMarkedForLater() {
    let toReadButton = createToReadButton();

    // needs to be outside so the compiler won't yell at me despite the only time this being referenced is inside other ifs with the same condition
    let privToReadButton = document.createElement("li");
    if (ADD_PRIV_SAVE_AS) {
        privToReadButton = createPrivateToReadButton();
    }

    // switches the function based on series
    if (url.includes("/works/")) {
        addWorkSaveButtons(toReadButton, privToReadButton);
    } else if (url.includes("/series/")) {
        addSeriesSaveButtons(toReadButton, privToReadButton);
    }
}

function isLoggedIn() {
    // when used in an if, this will check for the existence of the element
    // it's basically being cast to bool
    return !document.querySelector("#login");
}

function submitBookmark(id, isPrivate, bookmarkNotes, bookmarkTags, button, completionMessage) {
    let token = document.querySelector("meta[name='csrf-token']").getAttribute("content");
    let pseudID = document.querySelector("input[name='comment[pseud_id]']").getAttribute("value");
    let privacy = isPrivate ? "1" : "0"

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
        if (r.ok) {
            let notice = document.createElement("div");
            notice.className = "flash notice";
            notice.textContent = `Work successfully saved as "To Read".`;

            let main = document.querySelector("#main");
            main.insertAdjacentElement("afterbegin", notice);

            button.textContent = completionMessage;
            button.onclick = function () {
                return false;
            }
        } else {
            let notice = document.createElement("div");
            notice.className = "flash notice error";
            notice.textContent = "We're sorry! Something went wrong.";

            let main = document.querySelector("#main");
            main.insertAdjacentElement("afterbegin", notice);
        }
    });
}

function unsubscribe() {
    let token = document.querySelector("input[name='authenticity_token']").getAttribute("value");
    let subWorkID = document.querySelector("#subscription_subscribable_id").getAttribute("value");
    let subType = document.querySelector("#subscription_subscribable_type").getAttribute("value");
    let subscriptionID = document.querySelector("input[name='authenticity_token']").parentElement.getAttribute("id").split("_");
    subscriptionID = subscriptionID[subscriptionID.length-1];
    let userURL = document.querySelector("#greeting").querySelector("ul").querySelector("li").querySelector("a").href;

    post(userURL + "/subscriptions/" + subscriptionID, {
            "authenticity_token": token,
            "subscription[subscribable_id]": subWorkID,
            "subscription[subscribable_type]": subType,
            "_method": "delete"
        }).then((r) => {
            if (r.ok) {
                let notice = document.createElement("div");
                notice.className = "flash notice";
                notice.textContent = `You have successfully unsubscribed from ${document.querySelector(".title.heading").textContent}.`;

                let main = document.querySelector("#main");
                main.insertAdjacentElement("afterbegin", notice);
            } else {
                let notice = document.createElement("div");
                notice.className = "flash notice error";
                notice.textContent = "We're sorry! Something went wrong.";

                let main = document.querySelector("#main");
                main.insertAdjacentElement("afterbegin", notice);
            }
    });
}

function stringify(json) {
    let s = "";
    for (const [key, value] of Object.entries(json)) {
        s += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
    }

    // remove final & because it gets unnecessarily add
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

const url = window.location.href;

if (isLoggedIn() && SAVE_AS_TO_READ_ENABLED) {
    let tags = [...document.querySelectorAll("li.added.tag")].map((tag) => tag.textContent.replace("×", "").trim());

    // the whole idea here is to not show redundant buttons - save as buttons only when it's not already saved, and mark as button only when it can be marked as read
    if (tags.includes("To Read")) {
        workMarkedForLater(tags);
    } else {
        workNotMarkedForLater();
    }
}