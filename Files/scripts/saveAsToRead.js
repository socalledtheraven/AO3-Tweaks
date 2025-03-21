// CONFIG
const privateFandoms = [""]
const SAVE_AS_TO_READ_ENABLED = true;
const UNSUB_FROM_WORKS = false;
const REPLACE_MARK_FOR_LATER = true;
const ADD_PRIV_SAVE_AS = true;
const MARK_AS_READ_BUTTON = true;
// END CONFIG

function bookmarkSeries() {
    if (UNSUB_FROM_WORKS) {
        unsubscribe();
    }

    markAsToRead();

    submitBookmark();
}

function privateBookmarkSeries() {
    if (UNSUB_FROM_WORKS) {
        unsubscribe();
    }

    if (ADD_PRIV_SAVE_AS) {
        const privateBox = document.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    markAsToRead();

    submitBookmark();
}

function bookmarkWork() {
    if (UNSUB_FROM_WORKS) {
        unsubscribe();
    }

    const fandoms = document.getElementsByClassName("fandom tags");

    const fandomTags = fandoms[1].getElementsByClassName("tag");
    const isPrivateFandom = isInArray(fandomTags);

    if (isPrivateFandom) {
        const privateBox = document.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    markAsToRead();

    submitBookmark();
}

function privateBookmarkWork() {
    if (ADD_PRIV_SAVE_AS) {
        const privateBox = document.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    bookmarkWork();

    markAsToRead();

    submitBookmark();
}

function submitBookmark() {
    const bookmarkGroup = document.getElementById("bookmark-form");
    const bookmarkButton = bookmarkGroup.querySelector("[name='commit']");
    bookmarkButton.click();
}

function markAsRead(tags) {
    // this may not play nice with other things modifying the tagbox at bookmarktime
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value = tagBox.value.replace("To Read", "");

    let toReadTag = [...document.querySelectorAll("li.added.tag")][tags.indexOf("To Read")]
    let deleteButton = toReadTag.querySelector(".delete");
    deleteButton.click();

    submitBookmark();
}

function markAsToRead() {
    // this may not play nice with other things modifying the tagbox at bookmarktime
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value += "To Read";
}

// kept in here from migrating my things over from using subscriptions to keep track
function unsubscribe() {
    const subscribeButton = document.querySelector("input[value='Unsubscribe']");
    if (subscribeButton) {
        setTimeout(function() {
            subscribeButton.click();
        }, (0.25 * 1000));
    }
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
        bookmarkWork();
        return false;
    }

    toReadButton.appendChild(child);

    return toReadButton;
}

function createPrivateToReadButton(privToReadButton) {
    privToReadButton.id = "priv_to_read";
    const child2 = document.createElement("a");
    child2.text = 'Save privately as "To Read"'
    // makes it a link in all the important css ways
    child2.href = "#priv_to_read";
    child2.onclick = function () {
        privateBookmarkWork();
        return false;
    }

    privToReadButton.appendChild(child2);

    // horrible awful hack for correct alignment because ao3 uses whitespace to handle alignment here for some reason
    privToReadButton.innerHTML = "\n" + privToReadButton.innerHTML;

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
        privToReadButton = createPrivateToReadButton(privToReadButton);
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
    // it's basically being casted to bool
    return !document.querySelector("#login");
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