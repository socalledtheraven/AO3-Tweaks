function overlapping(elem1, elem2) {
	let rect1 = elem1.getBoundingClientRect();
	let rect2 = elem2.getBoundingClientRect();

	return !(rect1.right < rect2.left ||
		rect1.left > rect2.right ||
		rect1.bottom < rect2.top ||
		rect1.top > rect2.bottom)
}


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
				console.info(`LatestChapter: multiple chapters`)
				let url = latestChapter.href;

				let outerLi = document.createElement("li");
				outerLi.className = "actions";
				outerLi.style.margin = "0";

				let latest = document.createElement("a");
				latest.href = url;
				latest.text = "latest"
				latest.style.position = "absolute";
				latest.style.right = "0";
				latest.style.top = "45px";
				latest.style.margin = "0";

				outerLi.appendChild(latest);
				header.insertAdjacentElement("beforeend", outerLi);

				const tags = bookmark.querySelector("ul.tags.commas");
				if (overlapping(latest, tags)) {
					tags.style.paddingTop = "10px";
				}
			}
		}
	}
}

console.log("loaded latestChapter.js");

function initializeExtension(settings) {
	const LATEST_CHAPTER_AUTOFILL = settings["latest_chapter_autofill"] || true;

	if (window.AO3TweaksUtils.isLoggedIn() && LATEST_CHAPTER_AUTOFILL) {
		// runs it when the page loads
		console.log("LatestChapter: loaded")
		main();
	}
}

// Get both settings at once and initialise the extension
browser.storage.sync.get("latest_chapter_autofill")
	.then(initializeExtension)
	.catch(window.AO3TweaksUtils.onError);