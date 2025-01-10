// CONFIG
const privateFandoms = [""]
// END CONFIG

function bookmarkSeries() {
    // unsubscribe();
    submitBookmark();
}


function bookmarkWork() {
    // unsubscribe();

    const fandoms = document.getElementsByClassName("fandom tags");

    const fandomTags = fandoms[1].getElementsByClassName("tag");
    if (isPrivateFandom(fandomTags)) {
        const privateBox = document.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    submitBookmark();
}

function submitBookmark() {
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value += "To Read";

    const bookmarkGroup = document.getElementById("bookmark-form");
    const bookmarkButton = bookmarkGroup.querySelector("[name='commit']");
    bookmarkButton.click();
    setTimeout(function() {
        window.location.href = url;
    }, (1 * 1000));
}

function unsubscribe() {
    const subscribeButton = document.querySelector("input[value='Unsubscribe']");
    if (subscribeButton) {
        setTimeout(function() {
            subscribeButton.click();
        }, (0.25 * 1000));
    }
}

function isPrivateFandom(fandomTags) {
    for (const tag of fandomTags) {
        if (privateFandoms.indexOf(tag.text) > -1) {
            return true;
        }
    }
    return false;
}

const url = window.location.href;
console.log("1")


// creates a new button
const toReadButton = document.createElement("li");
const child = document.createElement("a");
child.text = 'Save as "To Read"'
child.href = "#";
console.log(child)

toReadButton.appendChild(child);

// switches the function based on series
if (url.includes("/works/")) {
    const navbar = document.querySelector("ul.navigation.actions.work[role='menu']");
    child.onclick = bookmarkWork;
    navbar.appendChild(toReadButton);
    console.log(navbar)
} else if (url.includes("/series/")) {
    const navbar = document.querySelector("ul.navigation.actions[role='navigation']");
    child.onclick = bookmarkSeries;
    navbar.appendChild(toReadButton);
    console.log(navbar)
}