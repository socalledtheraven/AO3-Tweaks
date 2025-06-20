// CONFIG START

let messages = Array(
    "Extra Kudos <3",
    "This is an extra kudos, since I've already left one. :)",
    "I just wanted to leave another kudos <3",
    "Update kudos!",
    "Double kudos!"
);
// CONFIG END

function postComment() {
    let kudosMessage = document.querySelector("#kudos_message");

    // checks if a kudos has already been left
    if (kudosMessage.textContent.includes("already")) {
        let random = Math.floor(Math.random() * messages.length);
        let commentBox = document.querySelector(".comment_form");
        let commentButton = document.querySelector("input[value='Comment']");

        commentBox.value = messages[random];
        commentButton.click();
    }
}

function editKudosButton(newKudosButton) {
    // you have to edit the value of a different element, or it overwrites the whole form
    newKudosButton.textContent = "Rekudos?";
    newKudosButton.onclick = function () {
        postComment();
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

function createNewKudos(AUTO) {
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
            postComment();
        } else {
            editKudosButton(newKudosButton);
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
    const { REKUDOS_ACTIVE = false, REKUDOS_AUTO = false } = settings;

    console.log("REKUDOS_ACTIVE: " + REKUDOS_ACTIVE);
    console.log("REKUDOS_AUTO: " + REKUDOS_AUTO);

    if (isLoggedIn() && REKUDOS_ACTIVE) {
        // jump back to the kudos button
        let kudosButton = document.querySelector("#new_kudo");
        let containerLi = createNewKudos(REKUDOS_AUTO);
        console.log("containerLi: " + containerLi);

        overrideButton(kudosButton, containerLi);
    }
}

function onError(error) {
    console.log(`Error: ${error}`);
}

// Get both settings at once and initialise the extension
browser.storage.sync.get(["rekudos_enabled", "auto_rekudos_enabled"])
    .then(initializeExtension)
    .catch(onError);