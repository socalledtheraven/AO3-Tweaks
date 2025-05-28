import * as browser from "webextension-polyfill";

function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        color: document.querySelector("#color").value,
    });
}

function restoreOptions() {
    function setCurrentChoice(result) {
        document.querySelector("#color").value = result.color || "blue";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    setupSettingsBox();

    let getting = browser.storage.sync.get("color");
    getting.then(setCurrentChoice, onError);
}

function setupSettingsBox() {
    let settingsBox = document.createElement("fieldset");

    let title = document.createElement("legend");
    title.textContent = "Ao3 Tweaks";

    let heading = document.querySelector('a[title="Misc preferences"]').parentNode.cloneNode(true);
    heading.textContent = title.textContent;

    let popup = heading.querySelector("a");
    popup.title = title.textContent + " Preferences";
    popup.href = browser.runtime.getURL("options.html");

    let ul = document.createElement("ul");
    for (let setting in settings) {
        let li = document.createElement("li");

    }
}

// document.addEventListener("DOMContentLoaded", restoreOptions);
// document.querySelector("form").addEventListener("submit", saveOptions);

