function main() {
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

                let outerLi = document.createElement("li");
                outerLi.className = "actions";

				let latest = document.createElement("a");
				latest.href = url;
				latest.text = "latest"
				latest.style.position = "absolute";
				latest.style.right = "0";
				latest.style.top = "45px";
				latest.style.margin = "0";

                outerLi.appendChild(latest);
				header.insertAdjacentElement("beforeend", outerLi);
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
	const LATEST_CHAPTER_AUTOFILL = settings["latest_chapter_autofill"] || true;

	console.log("LATEST_CHAPTER_AUTOFILL: " + LATEST_CHAPTER_AUTOFILL);

	if (isLoggedIn() && LATEST_CHAPTER_AUTOFILL) {
		// runs it when the page loads
		console.log("loaded2")
		main();
	}
}

// Get both settings at once and initialise the extension
browser.storage.sync.get("latest_chapter_autofill")
	.then(initializeExtension);