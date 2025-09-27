function postComment(messages, button) {
    let kudosMessage = document.querySelector("#kudos_message");

    // checks if a kudos has already been left
    if (kudosMessage.textContent.includes("already")) {
        let comment;

        if (messages.length === 1) {
            comment = messages;
        } else {
            let random = Math.floor(Math.random() * messages.length);
            comment = messages[random];
        }

        sendComment(comment, button);
    }
}

function sendComment(comment, button) {
    let url = window.location.href + "/comments";
    let token = document.querySelector("meta[name='csrf-token']").getAttribute("content");
    let pseudID = document.querySelector("input[name='bookmark[pseud_id]']").getAttribute("value");

    post(url, {
        "authenticity_token": token,
        "comment[pseud_id]": pseudID,
        "comment[comment_content]": comment,
        "controller_name": "chapters",
        "commit": "Comment"
    }).then((r) => {
        if (r.ok) {
            button.textContent = "Left extra kudos!";
        } else {
            button.textContent = "Rekudos failed, try again later.";
        }
    });
}

function post(url, data) {
    // a POST request with the associated headers
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

function editKudosButton(newKudosButton, messages) {
    // you have to edit the value of a different element, or it overwrites the whole form
    newKudosButton.textContent = "Rekudos?";
    newKudosButton.onclick = function () {
        postComment(messages, newKudosButton);
        return false;
    };
}

function overrideButton(oldButton, newButton) {
    if (oldButton) {
        oldButton.insertAdjacentElement("beforebegin", newButton);

        // hide it but allow it to be clicked
        oldButton.style.display = 'none';
    }
}

function createNewKudos(AUTO, messages) {
    let containerLi = document.createElement("li");
    containerLi.style.listStyle = "none"
    containerLi.style.display = "inline"
    containerLi.style.paddingLeft = "0.25em"

    let newKudosButton = document.createElement("a");
    newKudosButton.textContent = "Kudos ♥";
    newKudosButton.id = "#kudos";
    newKudosButton.href = "#kudos";

    newKudosButton.onclick = function () {
        let oldKudosButton = document.querySelector("#kudo_submit");
        oldKudosButton.click();

        if (AUTO) {
            postComment(messages, oldKudosButton);
        } else {
            editKudosButton(newKudosButton, messages);
        }
        return false;
    };

    containerLi.appendChild(newKudosButton);

    return containerLi;
}

function isLoggedIn() {
    // when used in an if, this will check for the existence of the element
    // it's basically being cast to bool
    return !document.querySelector("#login");
}

console.log("loaded rekudos.js")

function initializeExtension(settings) {
    let REKUDOS_ACTIVE = settings["rekudos_enabled"] || true;
    let REKUDOS_AUTO = settings["auto_rekudos_enabled"] || false;
    let messages;
    if (settings["rekudos_messages"]) {
        messages = settings["rekudos_messages"].split("\n");
    } else {
        messages = [
            "Extra Kudos <3",
            "This is an extra kudos, since I've already left one. :)",
            "I just wanted to leave another kudos <3",
            "Update kudos!",
            "Double kudos!"
        ];
    }

    if (isLoggedIn() && REKUDOS_ACTIVE) {
        // jump back to the kudos button
        let kudosButton = document.querySelector("#new_kudo");
        let containerLi = createNewKudos(REKUDOS_AUTO, messages);

        overrideButton(kudosButton, containerLi);
    }
}

function onError(error) {
    console.log(`Error: ${error}`);
}

// Get both settings at once and initialise the extension
browser.storage.sync.get(["rekudos_enabled", "auto_rekudos_enabled", "rekudos_messages"])
    .then(initializeExtension);