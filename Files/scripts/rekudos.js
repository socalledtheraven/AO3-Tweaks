// CONFIG START
let messages = Array(
    "Extra Kudos <3",
    "This is an extra kudos, since I've already left one. :)",
    "I just wanted to leave another kudos <3",
    "Update kudos!"
);

const AUTO = false;
const REKUDOS_ACTIVE = true;
const BACK_TO_ORIGINAL_PAGE = true;
// CONFIG END

function postComment() {
    setTimeout(function () {
        // checks if a kudos has already been left
        if (kudosMessage.textContent.includes("already")) {
            let random = Math.floor(Math.random() * messages.length);
            let commentBox = document.querySelector(".comment_form");
            let commentButton = document.querySelector("input[value='Comment']");

            commentBox.value = messages[random];
            commentButton.click();

            if (BACK_TO_ORIGINAL_PAGE) {
                setTimeout(function () {
                    window.location.href = url;
                }, (1.0 * 1000));
            }
        }
    }, 0.25 * 1000);
}

function editKudosButton() {
    setTimeout(function () {
        // you have to edit the value of a different element or it overwrites the whole form
        let kudosButtonText = document.querySelector("#kudo_submit");
        kudosButtonText.value = "Rekudos?";
        kudosButton.addEventListener("click", postComment);
    }, 0.25 * 1000);
}

const url = window.location.href;
let kudosButton = document.querySelector("#new_kudo");
let kudosMessage = document.querySelector("#kudos_message");

if (REKUDOS_ACTIVE) {
    if (AUTO) {
        kudosButton.addEventListener("click", postComment);
    } else {
        kudosButton.addEventListener("click", editKudosButton);
    }
}
