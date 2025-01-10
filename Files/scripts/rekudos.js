let messages = Array(
    "Extra Kudos<3",
    "This is an extra kudos, since I've already left one. :)",
    "I just wanted to leave another kudos<3"
);

let kudoButton = document.querySelector("#new_kudo")
let kudosMessage = document.querySelector("#kudos_message")
kudoButton.addEventListener("click", postComment)

function postComment() {
    setTimeout(function () {
        // checks if a kudos has already been left
        if (kudosMessage.textContent.includes("already")) {
            let random = Math.floor(Math.random() * messages.length);
            let commentBox = document.querySelector(".comment_form")
            let commentButton = document.querySelector("input[value='Comment']")

            commentBox.value = messages[random];
            commentButton.click();
        }
    }, 0.75 * 1000);
}