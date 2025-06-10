// CONFIG
const privateFandoms = [""]
const SAVE_AS_TO_READ_ENABLED = true;
const UNSUB_FROM_WORKS = false;
const REPLACE_MARK_FOR_LATER = true;
const ADD_PRIV_SAVE_AS = true;
const MARK_AS_READ_BUTTON = true;
// END CONFIG

function privateBookmarkSeries(button, message) {
    const privateBox = document.getElementById("bookmark_private");
    privateBox.checked = true;

    bookmarkSeries(button, message);
}

function bookmarkSeries(button, message) {
    // html is basically the same, they work in both cases
    bookmarkWork(button, message);
}

function privateBookmarkWork(button, message) {
    const privateBox = document.getElementById("bookmark_private");
    privateBox.checked = true;

    bookmarkWork(button, message);
}

function privateBookmarkWorkExternal(button, message, doc) {
    const privateBox = doc.getElementById("bookmark_private");
    privateBox.checked = true;

    bookmarkWorkExternal(button, message, doc);
}

function bookmarkWork(button, message) {
    let subbed = document.querySelector("#new_subscription");
    if (UNSUB_FROM_WORKS && subbed) {
        unsubscribe(document);
    }

    // this may not play nice with other things modifying the tagbox at bookmarktime
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value += ", To Read";

    submitBookmark(button, message, document);
}

function bookmarkWorkExternal(button, message, doc) {
    let subbed = doc.querySelector("#new_subscription");
    if (UNSUB_FROM_WORKS && subbed) {
        unsubscribe(doc);
    }

    submitBookmark(button, message, doc);
}

function markAsRead(tags, button, completionMessage) {
    // this may not play nice with other things modifying the tagbox at bookmarktime
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    tagBox.value = tagBox.value.replace("To Read", "");

    let toReadTag = [...document.querySelectorAll("li.added.tag")][tags.indexOf("To Read")]
    let deleteButton = toReadTag.querySelector(".delete");
    deleteButton.click();

    submitBookmark(button, completionMessage, document);
}

function submitBookmark(button, completionMessage, doc) {
    const fandoms = doc.getElementsByClassName("fandom tags");
    const fandomTags = fandoms[1].getElementsByClassName("tag");
    const isPrivateFandom = isInArray(fandomTags);
    const privateBox = doc.getElementById("bookmark_private");
    const isPrivate = isPrivateFandom || privateBox.checked;

    const notes = doc.getElementById("bookmark_notes")
    const bookmarkNotes = notes.value;


    let url = doc.querySelector("li.share").querySelector("a").href.split("/");
    // the url gets expanded when everyhting is loaded, so we need to take archiveofourown.org/works/... into mind
    let id = url[4];

    const tagBox = doc.getElementById("bookmark_tag_string_autocomplete");
    let bookmarkTags;
    if (tagBox) {
        bookmarkTags = tagBox.value;
    } else {
        bookmarkTags = "To Read";
    }

    let token = doc.querySelector("meta[name='csrf-token']").getAttribute("content");
    let pseudID = doc.querySelector("input[name='bookmark[pseud_id]']").getAttribute("value");
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
        respondToBookmark(r, doc, button, completionMessage);
    });
}

function unsubscribe(doc) {
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

function workMarkedForLater(tags) {
    if (MARK_AS_READ_BUTTON) {
        createMarkAsReadButton(tags);
    }

    if (REPLACE_MARK_FOR_LATER) {
        const navbar = document.querySelector("ul.navigation.actions.work[role='menu']");
        const markForLaterButton = navbar.querySelector(".mark");
        markForLaterButton.remove();
    }


    function createMarkAsReadButton(tags) {
        const markAsReadButton = document.createElement("li");
        markAsReadButton.id = "mark_as_read";
        const child3 = document.createElement("a");
        child3.text = 'Mark as Read'
        // makes it a link in all the important css ways
        child3.href = "#mark_as_read";
        child3.onclick = function () {
            markAsRead(tags, child3, "Marked as Read!");
            return false;
        }

        markAsReadButton.appendChild(child3);

        let kudosButton = document.querySelector("#new_kudo");
        kudosButton.parentElement.insertAdjacentElement("afterend", document.createElement("li"));
        kudosButton.parentElement.insertAdjacentElement("afterend", markAsReadButton);
    }
}

function createToReadButton(isBookmark, i, url) {
    // creates a new button
    const toReadButton = document.createElement("li");
    toReadButton.id = "to_read";

    const child = document.createElement("a");
    child.text = 'Save as "To Read"'


    // checks if i is nullable (so if it's not passed in or is 0)
    // hence we start i at 1
    // this will be our check if it's coming from a work or another page
    if (i) {
        child.href = "#to_read_" + i;
    } else {
        // makes it a link in all the important css ways
        child.href = "#to_read";
    }

    if (i) {
        child.onclick = async function () {
            let navPageHTML = await getHTML(url);

            // this is standard parsing
            let parser = new DOMParser();
            let doc = parser.parseFromString(navPageHTML, "text/html");

            bookmarkWorkExternal(child, "Saved as \"To Read\"!", doc);
            // makes the link do nothing except the function when clicked
            return false;
        }
    } else {
        child.onclick = function () {
            bookmarkWork(child, "Saved as \"To Read\"!");
            return false;
        }
    }

    toReadButton.appendChild(child);

    return toReadButton;
}

function createPrivateToReadButton(isBookmark, i, url) {
    let privToReadButton = document.createElement("li");
    privToReadButton.id = "priv_to_read";

    const child2 = document.createElement("a");
    child2.text = 'Save privately as "To Read"'
    // makes it a link in all the important css ways

    if (i) {
        child2.href = "#priv_to_read_" + i;
    } else {
        child2.href = "#priv_to_read";
    }

    if (i) {
        child2.onclick = async function () {
            let navPageHTML = await getHTML(url);

            // this is standard parsing
            let parser = new DOMParser();
            let doc = parser.parseFromString(navPageHTML, "text/html");

            privateBookmarkWorkExternal(child2, "Saved privately as \"To Read\"!", doc);
            // makes the link do nothing except the function when clicked
            return false;
        }
    } else {
        child2.onclick = function () {
            privateBookmarkWork(child2, "Saved as \"To Read\"!");
            return false;
        }
    }

    privToReadButton.appendChild(child2);

    return privToReadButton;
}

function workNotMarkedForLater() {
    let isBookmark = document.querySelector(".bookmark_form_placement_open").textContent === "Edit Bookmark";

    let toReadButton = createToReadButton(isBookmark);

    // needs to be outside so the compiler won't yell at me despite the only time this being referenced is inside other ifs with the same condition
    let privToReadButton = document.createElement("li");
    if (ADD_PRIV_SAVE_AS) {
        privToReadButton = createPrivateToReadButton(isBookmark);
    }

    // switches the function based on series
    if (url.includes("/works/")) {
        addWorkSaveButtons(toReadButton, privToReadButton);
    } else if (url.includes("/series/")) {
        addSeriesSaveButtons(toReadButton, privToReadButton);
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
    }

    function addSeriesSaveButtons(toReadButton, privToReadButton) {
        const navbar = document.querySelector("ul.navigation.actions[role='navigation']");
        toReadButton.childNodes.item(0).onclick = function () {
            bookmarkSeries(toReadButton, "Saved as \"To Read\"!");
            return false;
        }

        privToReadButton.childNodes.item(0).onclick = function () {
            privateBookmarkSeries(privToReadButton, "Saved privately as \"To Read\"!");
            return false;
        }

        navbar.appendChild(toReadButton);

        if (ADD_PRIV_SAVE_AS) {
            navbar.appendChild(privToReadButton);
        }
    }
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
            let toReadButton = createToReadButton(i, url);
            toReadButton.className = "actions";

            ul.insertAdjacentElement("beforeend", toReadButton);

            if (ADD_PRIV_SAVE_AS) {
                let privToReadButton = createPrivateToReadButton(i, url);
                privToReadButton.className = "actions";

                ul.insertAdjacentElement("beforeend", privToReadButton);
            }
        }

        let blockquote = work.querySelector("blockquote");
        blockquote.insertAdjacentElement("afterend", ul);
        i++;
    }
}


function parseBookmarkPage(doc, button, completionMessage) {
    let bookmarkID = doc.querySelector("a[data-method='delete']").href.split("/");
    bookmarkID = bookmarkID[bookmarkID.length-1];

    let token = doc.querySelector("meta[name='csrf-token']").getAttribute("content");
    let pseudID = doc.querySelector("input[name='bookmark[pseud_id]']").getAttribute("value");

    let tagString = doc.querySelector(".meta.tags.commas")
        .textContent
        .trim()
        .replaceAll("\n", ",")
        .trim()
        .replaceAll("          ", " ");

    if (tagString) {
        tagString += ", To Read";
    } else {
        tagString = "To Read";
    }

    let notes = doc.querySelector("blockquote.notes")
        .innerHTML.
        replaceAll(" ", "+")
        .replaceAll("\r", "\\r")
        .replaceAll("\n", "\\n")
        .replaceAll("\t", "\\t");

    // will delete private recs, because it doesn't seem possible to tell whether one is or not
    let privacy = doc.querySelector("span.private").title === "Private Bookmark" ? "1" : "0";
    let rec = doc.querySelector("span.rec").title === "Rec" ? "1" : "0";


    post("https://archiveofourown.org/bookmarks" + bookmarkID, {
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
        respondToBookmark(r, doc, button, completionMessage);
    });
}

function respondToBookmark(r, doc, button, completionMessage) {
    if (r.ok) {
        let notice = doc.createElement("div");
        notice.className = "flash notice";
        notice.textContent = `Work successfully saved as "To Read".`;

        let main = doc.querySelector("#main");
        main.insertAdjacentElement("afterbegin", notice);

        button.textContent = completionMessage;
        button.onclick = function () {
            return false;
        }
    } else {
        let notice = doc.createElement("div");
        notice.className = "flash notice error";
        notice.textContent = "We're sorry! Something went wrong.";

        let main = doc.querySelector("#main");
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



const url = window.location.href;

function isWork() {
    return url.includes("chapters") || (url.includes("works") && !url.includes("search")) && !url.includes("tags") || url.includes("series");
}

if (isLoggedIn() && SAVE_AS_TO_READ_ENABLED) {
    if (isWork()) {
        console.log("work")
        let tags = [...document.querySelectorAll("li.added.tag")].map((tag) => tag.textContent.replace("×", "").trim());

        // the whole idea here is to not show redundant buttons - save as buttons only when it's not already saved, and mark as button only when it can be marked as read
        if (tags.includes("To Read")) {
            workMarkedForLater(tags);
        } else {
            workNotMarkedForLater();
        }
    } else {
        outsideWork()
    }
}
