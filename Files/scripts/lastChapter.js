// CONFIG
const LAST_CHAPTER_AUTOFILL = true;
// CONFIG

function main() {
	// collects all the bookmarks and iterates through them
	const bookmarks = document.querySelectorAll('[role="article"]');

	for (const bookmark of bookmarks) {
		let header = bookmark.querySelector(".heading");
		let url = header.querySelector("a").href;

		// checks it's not a series
		if (url.includes("works")) {
			let lastChapter = bookmark.querySelector("dd.chapters a").href

			// checks that it's not a single-chapter dealie
			if (lastChapter) {
				header.querySelector("a").href = lastChapter;
			}
		}
	}
}

// runs it when the page loads
if (LAST_CHAPTER_AUTOFILL) {
	main();
}