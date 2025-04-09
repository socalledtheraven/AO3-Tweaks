// CONFIG
const LATEST_CHAPTER_AUTOFILL = true;
// CONFIG

function main() {
	// collects all the bookmarks and iterates through them
	const bookmarks = document.querySelectorAll('[role="article"]');

	for (const bookmark of bookmarks) {
		let header = bookmark.querySelector(".heading");
		let url = header.querySelector("a").href;

		// checks it's not a series
		if (url.includes("works")) {
			let latestChapter = bookmark.querySelector("dd.chapters a")

			// checks that it's not a single-chapter dealie
			if (latestChapter) {
				let url = latestChapter.href;

				let latest = document.createElement("a");
				latest.href = url;
				latest.text = "(latest)"
				latest.style.position = "absolute";
				latest.style.right = "0";
				latest.style.top = "4em";
				latest.style.padding = "5px";
				latest.style.border = "1px solid"
				latest.style.color = "#5998D6";

				let mainHeading = bookmark.querySelector(".header");
				// add latest to end of mainheading
				mainHeading.appendChild(latest);
			}
		}
	}
}

function isLoggedIn() {
	// when used in an if, this will check for the existence of the element
	// it's basically being casted to bool
	return !document.querySelector("#login");
}

if (isLoggedIn() && LATEST_CHAPTER_AUTOFILL) {
	// runs it when the page loads
	main();
}