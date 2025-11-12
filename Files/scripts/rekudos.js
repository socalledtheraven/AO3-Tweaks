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

    let metadata = window.AO3TweaksUtils.getAO3Metadata();
    let token = metadata.token;
    let pseudID = metadata.pseudID;

    window.AO3TweaksUtils.post(url, {
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
            "Double kudos!",
            "<img src='https://64.media.tumblr.com/94b08d177f844232326d7e4f878f27ba/4ce6d86a4b1b1d60-cc/s640x960/ccdc7e76e584f663735e489cd9726f2182c2dbed.png' alt='A small creature with large eyes pawing at the kudos button, which shows the \"You have already left kudos\" message/>",
            "<img src='https://64.media.tumblr.com/7a59d6a32ace63cdcce3911d529f8b88/08d1854086a423d0-e6/s250x400/3e75997487cf31a3ddd8d9314e78d3d63985ec7d.png' alt='A picture of the kudos button with the word \"Second\" written above it to form the words \"Second Kudos\"'>"
        ];
    }

    if (window.AO3TweaksUtils.isLoggedIn() && REKUDOS_ACTIVE) {
        // jump back to the kudos button
        let kudosButton = document.querySelector("#new_kudo");
        let containerLi = createNewKudos(REKUDOS_AUTO, messages);

        overrideButton(kudosButton, containerLi);
    }
}

// Get both settings at once and initialise the extension
browser.storage.sync.get(["rekudos_enabled", "auto_rekudos_enabled", "rekudos_messages"])
    .then(initializeExtension)
    .catch(window.AO3TweaksUtils.onError);