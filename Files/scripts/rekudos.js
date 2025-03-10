// CONFIG START

let messages = Array(
    "Extra Kudos <3",
    "This is an extra kudos, since I've already left one. :)",
    "I just wanted to leave another kudos <3",
    "Update kudos!",
    "Double kudos!"
);

const REKUDOS_ACTIVE = true;
const AUTO = false;
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
    // you have to edit the value of a different element or it overwrites the whole form
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


if (REKUDOS_ACTIVE) {
    // jump back to the kudos button
    let kudosButton = document.querySelector("#new_kudo");

    let containerLi = document.createElement("li");
    containerLi.style.listStyle = "none"
    containerLi.style.display = "inline"
    containerLi.style.paddingLeft = "0.25em"

    let newKudosButton = document.createElement("a");
    newKudosButton.textContent = "Kudos ♥";
    newKudosButton.href = "";

    if (AUTO) {
        newKudosButton.onclick = function () {
            let oldKudosButton = document.querySelector("#kudo_submit");
            oldKudosButton.click();

            postComment();
            return false;
        };
    } else {
        newKudosButton.onclick = function () {
            let oldKudosButton = document.querySelector("#kudo_submit");
            oldKudosButton.click();

            editKudosButton(newKudosButton);
            return false;
        };
    }

    containerLi.appendChild(newKudosButton);
    overrideButton(kudosButton, containerLi);
}
