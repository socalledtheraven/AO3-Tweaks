async function get(url) {
	let response = await fetch(url);
	let html = await response.text();
	return html;
}

function parseNavigation(html) {
	let parser = new DOMParser();
	console.log("got nav page, parsing");
	let doc = parser.parseFromString(html, "text/html");

	let chapters = doc.querySelector('ol[role="navigation"]').children;
	let lastChapterURL = chapters[chapters.length-1];
	lastChapterURL = lastChapterURL.querySelector("a").href.replace("https://archiveofourown.org", "");
	return lastChapterURL;
}

async function main() {
	let bookmarks = document.querySelectorAll('[role="article"]');
	let header;
	for (let bookmark of bookmarks) {
		header = bookmark.querySelector(".heading");
		let href = header.querySelector("a").href;
		if (href.includes("works")) {
			href += "/navigate";
			let html = await get(href);
			let lastChapter = parseNavigation(html);
			console.log(lastChapter);
			header.querySelector("a").href = lastChapter;
		}
	}
}

window.onload = async function() {
	await main();
};