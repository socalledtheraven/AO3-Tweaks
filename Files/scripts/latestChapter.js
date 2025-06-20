// CONFIG
const LATEST_CHAPTER_AUTOFILL = true;
// CONFIG

function addStyles() {
	const styleSheet = document.createElement("style");
	styleSheet.textContent = `
        .latest-link {
            color: #5998D6 !important;
        }
        
        .latest-link:visited {
            color: #7F7F7F;
        }
    `;
	document.head.appendChild(styleSheet);
}

function main() {
	addStyles();

	// collects all the bookmarks and iterates through them
	const bookmarks = document.querySelectorAll('[role="article"]');

	for (const bookmark of bookmarks) {
		let header = bookmark.querySelector(".header");
		let url = header.querySelector("a").href;

		// checks it's not a series
		if (url.includes("works")) {
			let latestChapter = bookmark.querySelector("dd.chapters a")

			// checks that it's not a single-chapter dealie
			if (latestChapter) {
				console.log("test1")
				let url = latestChapter.href;

				let latest = document.createElement("a");
				latest.href = url;
				latest.text = "(latest)"
				latest.className = "latest-link";
				latest.style.position = "absolute";
				latest.style.right = "0";
				latest.style.top = "43px";
				latest.style.margin = "0";

				header.insertAdjacentElement("beforeend", latest);
			}
		}
	}
}

function isLoggedIn() {
	// when used in an if, this will check for the existence of the element
	// it's basically being casted to bool
	return !document.querySelector("#login");
}

console.log("loaded latestChapter.js");

function initializeExtension(settings) {
	const LATEST_CHAPTER_AUTOFILL = settings["latest_chapter_autofill"];

	console.log("LATEST_CHAPTER_AUTOFILL: " + LATEST_CHAPTER_AUTOFILL);

	if (isLoggedIn() && LATEST_CHAPTER_AUTOFILL) {
		// runs it when the page loads
		console.log("loaded2")
		main();
	}
}

function onError(error) {
	console.log(`Error: ${error}`);
}

// Get both settings at once and initialise the extension
browser.storage.sync.get("latest_chapter_autofill")
	.then(initializeExtension)
	.catch(onError);