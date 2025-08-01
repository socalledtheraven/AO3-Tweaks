async function fullTextCommentBoxes() {
    // checks if the "chapter by chapter" button is present (to indicate it is currently in fulltext mode
    const fullText = document.querySelector(".chapter.bychapter");
    if (fullText) {
        let chapters = document.querySelector("#chapters");
        let chapterNodes = chapters.children;
        // we do this because the length will be updated when I'm dynamically inserting new ones
        let chaptersLength = chapterNodes.length;
        let chapterUrls = await getChapterUrls();

        for (let i = chaptersLength; i > 0; i--) {
            let newCommentBox = await getCommentBox(i, chapterUrls[i-1]);

            chapters.insertBefore(newCommentBox, chapterNodes[i]);
        }
    }
}

async function getChapterUrls() {
    // sometimes works will have parameters like this
    let navigationUrl = window.location.href.split("?")[0].split("#")[0] + "/navigate";
    let doc = await getDocument(navigationUrl);
    let links = Array.from(doc.querySelector('ol[role="navigation"]').querySelectorAll("a"));

    // grabs all the things in that list and filters it down to just the urls, then format them appropriately
    return links.map(link => {
        // Extract the chapter ID from URLs like "/works/62424268/chapters/159744247"
        let href = link.getAttribute('href');
        let chapterMatch = href.match(/chapters\/(\d+)/);

        if (chapterMatch) {
            let chapterId = chapterMatch[1];
            return `https://archiveofourown.org/chapters/${chapterId}/comments`;
        }

        return href; // fallback in case the format is unexpected
    });
}

async function getCommentBox(i, url) {
    const box = document.querySelector("#add_comment");
    let commentBox = box.cloneNode(true);
    commentBox.id = "add_comment_" + i;

    let button = commentBox.querySelector('input[name="commit"]');

    let newButton = document.createElement("a");
    newButton.style.cursor = "pointer";
    newButton.textContent = "Comment";
    newButton.id = "comment_button_" + i;

    newButton.onclick = function () {
        let token = document.querySelector("meta[name='csrf-token']").getAttribute("content");
        let pseudID = document.querySelector("input[name='bookmark[pseud_id]']").getAttribute("value");

        post(url, {
                "authenticity_token": token,
                "comment[pseud_id]": pseudID,
                "comment[comment_content]": commentBox.querySelector("textarea").value,
                "controller_name": "chapters",
                "commit": "Comment"
            }).then((r) => {
                if (r.ok) {
                    newButton.textContent = "Commented!";
                } else {
                    newButton.textContent = "Comment failed";
                }
        });
    }

    overrideButton(button, newButton);

    return commentBox;
}

function overrideButton(oldButton, newButton) {
    if (oldButton) {
        oldButton.insertAdjacentElement("beforebegin", newButton);

        // hide it but allow it to be clicked
        oldButton.style.display = 'none';
    }
}

async function getDocument(url) {
    // gets the HTML and document object of a url
    let response = await fetch(url);

    let navPageHTML = await response.text();

    // this is standard parsing
    let parser = new DOMParser();
    return parser.parseFromString(navPageHTML, "text/html");
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

function stringify(json) {
    // turns a JSON document into a single URL-encoded string for sending in POST requests
    let s = "";
    for (const [key, value] of Object.entries(json)) {
        s += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
    }

    // remove the final "&" because it gets unnecessarily added
    return s.substring(0, s.length-1)
}

// Code for comment templates begins

function templateComments(TEMPLATE_COMMENTS, PREWRITTEN_COMMENTS) {
    let commentButtons = document.querySelectorAll("input[value='Comment']");
    let commentButtonContainers = Array.from(commentButtons, button => button.parentNode);

    for (let i = 0; i <= commentButtonContainers.length-1; i++) {
        let container = commentButtonContainers[i];

        let ul = document.createElement("ul");

        // all the styling here is so that it will look like the actions in terms of spacing
        // same reason for why I'm bothering with using a ul and lis
        let containerLi1 = document.createElement("li");
        containerLi1.style.listStyle = "none"
        containerLi1.style.display = "inline"
        containerLi1.style.paddingLeft = "0.25em"

        let commentTemplateButton = document.createElement("a");
        commentTemplateButton.textContent = "Fill comment template";
        commentTemplateButton.href = "";
        commentTemplateButton.onclick = function () {
            autofillComment(container, TEMPLATE_COMMENTS);
            return false;
        };
        containerLi1.appendChild(commentTemplateButton);

        let paddingLi1 = document.createElement("li");
        paddingLi1.style.listStyle = "none"
        paddingLi1.style.display = "inline"
        paddingLi1.style.paddingLeft = "0.25em"

        let containerLi2 = document.createElement("li");
        containerLi2.style.listStyle = "none"
        containerLi2.style.display = "inline"
        containerLi2.style.paddingLeft = "0.25em"

        let premadeCommentButton = document.createElement("a");
        premadeCommentButton.textContent = "Fill prewritten comment";
        premadeCommentButton.href = "";
        premadeCommentButton.onclick = function () {
            autofillComment(container, PREWRITTEN_COMMENTS);
            return false;
        };
        containerLi2.appendChild(premadeCommentButton);

        let paddingLi2 = document.createElement("li");
        paddingLi2.style.listStyle = "none"
        paddingLi2.style.display = "inline"
        paddingLi2.style.paddingLeft = "0.25em"

        let containerLi3 = document.createElement("li");
        containerLi3.style.listStyle = "none"
        containerLi3.style.display = "inline"
        containerLi3.style.paddingLeft = "0.25em"
        containerLi3.appendChild(commentButtons[i]);

        // .cloneNode(true);
        ul.appendChild(containerLi1);
        ul.appendChild(paddingLi1);
        ul.appendChild(containerLi2);
        ul.appendChild(paddingLi2);
        ul.appendChild(containerLi3);
        container.appendChild(ul);
    }
}

function autofillComment(parentContainer, templates) {
    parentContainer = parentContainer.parentNode;
    let random = Math.floor(Math.random() * templates.length);
    let commentBox = parentContainer.querySelector(".comment_form");
    commentBox.value = templates[random];
}

function isLoggedIn() {
    // when used in an if, this will check for the existence of the element
    // it's basically being cast to bool
    return !document.querySelector("#login");
}

console.log("loaded comments.js");

function initializeExtension(settings) {
    const COMMENT_TEMPLATES = settings["comment_templates"];
    const EXTRA_COMMENT_BOXES = settings["extra_comment_boxes"];
    const TEMPLATE_COMMENTS = settings["template_comments"];
    const PREWRITTEN_COMMENTS = settings["prewritten_comments"];

    console.log("COMMENT_TEMPLATES: " + COMMENT_TEMPLATES);
    console.log("EXTRA_COMMENT_BOXES: " + EXTRA_COMMENT_BOXES);

    if (isLoggedIn()) {
        // full text comment boxes is async, so it needs to happen first, so we have to have an overly complicated if structure
        if (EXTRA_COMMENT_BOXES) {
            fullTextCommentBoxes().then(function () {
                if (COMMENT_TEMPLATES) {
                    templateComments(TEMPLATE_COMMENTS, PREWRITTEN_COMMENTS)
                }
            });
        } else {
            if (COMMENT_TEMPLATES) {
                templateComments(TEMPLATE_COMMENTS, PREWRITTEN_COMMENTS)
            }
        }
    }
}

function onError(error) {
    console.log(`Error: ${error}`);
}

// Get both settings at once and initialise the extension
browser.storage.sync.get(["comment_templates", "extra_comment_boxes", "template_comments", "prewritten_comments"])
    .then(initializeExtension)
    .catch(onError);