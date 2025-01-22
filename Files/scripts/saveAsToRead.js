// CONFIG
const privateFandoms = [""]
const SAVE_AS_TO_READ_ENABLED = true;
const UNSUB_FROM_WORKS = false;
const REPLACE_MARK_FOR_LATER = true;
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
    if (isPrivateFandom(fandomTags)) {
        const privateBox = document.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    submitBookmark();
}

function submitBookmark() {
    // this may not play nice with other things modifying the tagbox at bookmarktime
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value += "To Read";

    const bookmarkGroup = document.getElementById("bookmark-form");
    const bookmarkButton = bookmarkGroup.querySelector("[name='commit']");
    bookmarkButton.click();
    setTimeout(function() {
        window.location.href = url;
    }, (1.0 * 1000));
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
function isPrivateFandom(fandomTags) {
    for (const tag of fandomTags) {
        if (privateFandoms.indexOf(tag.text) > -1) {
            return true;
        }
    }
    return false;
}

const url = window.location.href;

if (SAVE_AS_TO_READ_ENABLED) {
    // creates a new button
    const toReadButton = document.createElement("li");
    toReadButton.className = "to_read";
    const child = document.createElement("a");
    child.text = 'Save as "To Read"'
    // makes it a link in all the important css ways but doesn't actually go anywhere when clicked, just does the function
    child.href = "";
    child.onclick = function () {
        return false;
    }

    toReadButton.appendChild(child);

    // switches the function based on series
    if (url.includes("/works/")) {
        const navbar = document.querySelector("ul.navigation.actions.work[role='menu']");
        child.onclick = bookmarkWork;

        if (REPLACE_MARK_FOR_LATER) {
            const markForLaterButton = navbar.querySelector(".mark");

            // it might not be there if the user has history turned off
            if (markForLaterButton) {
                markForLaterButton.insertAdjacentElement("beforebegin", toReadButton);
                markForLaterButton.remove();
            }
        }

    } else if (url.includes("/series/")) {
        const navbar = document.querySelector("ul.navigation.actions[role='navigation']");
        child.onclick = bookmarkSeries;
        navbar.appendChild(toReadButton);
    }
}