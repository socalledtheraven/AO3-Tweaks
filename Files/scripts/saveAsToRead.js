// CONFIG
const privateFandoms = [""]
const SAVE_AS_TO_READ_ENABLED = true;
const UNSUB_FROM_WORKS = false;
const REPLACE_MARK_FOR_LATER = true;
const ADD_PRIV_SAVE_AS = true;
// END CONFIG

function bookmarkSeries() {
    if (UNSUB_FROM_WORKS) {
        unsubscribe();
    }
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

    submitBookmark();
}

function privateBookmarkWork() {
    if (ADD_PRIV_SAVE_AS) {
        const privateBox = document.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    bookmarkWork();

    submitBookmark();
}

function submitBookmark() {
    // this may not play nice with other things modifying the tagbox at bookmarktime
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value += "To Read";

    const bookmarkGroup = document.getElementById("bookmark-form");
    const bookmarkButton = bookmarkGroup.querySelector("[name='commit']");
    bookmarkButton.click();
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

const url = window.location.href;

if (SAVE_AS_TO_READ_ENABLED) {
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

    // switches the function based on series
    if (url.includes("/works/")) {
        const navbar = document.querySelector("ul.navigation.actions.work[role='menu']");

        if (REPLACE_MARK_FOR_LATER) {
            const markForLaterButton = navbar.querySelector(".mark");

            // it might not be there if the user has history turned off
            if (markForLaterButton) {
                markForLaterButton.insertAdjacentElement("beforebegin", toReadButton);
                markForLaterButton.remove();
            } else {
                navbar.appendChild(toReadButton);
            }
        } else {
            navbar.appendChild(toReadButton);
        }

        if (ADD_PRIV_SAVE_AS) {
            const privToReadButton = document.createElement("li");
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

            navbar.appendChild(privToReadButton);
        }

    } else if (url.includes("/series/")) {
        const navbar = document.querySelector("ul.navigation.actions[role='navigation']");
        child.onclick = function () {
            bookmarkSeries();
            return false;
        }
        navbar.appendChild(toReadButton);
    }
}