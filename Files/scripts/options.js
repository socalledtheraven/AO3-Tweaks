// import * as browser from "webextension-polyfill";

const booleanSettingMappings = {
    REKUDOS_ACTIVE: "#preference_rekudos_enabled",
    REKUDOS_AUTO: "#preference_auto_rekudos_enabled",
}

function saveOptions(e) {
    e.preventDefault();
	
    for (let [key, value] of Object.entries(booleanSettingMappings)) {
        console.log("setting key " + key + " to " + document.querySelector(value).checked)
        browser.storage.sync.set({[key]: document.querySelector(value).checked});
    }
	
	console.log("saved");
}

function restoreOptions() {
    function setCurrentChoice(result, id) {
        console.log("setting id " + id + " to " + result);
        document.querySelector(id).checked = result;
    }

    for (let [key, value] of Object.entries(booleanSettingMappings)) {
        browser.storage.sync.get(key).then(
            (r) => {
                setCurrentChoice(r, value)
            }, (e) => {
                console.log(e);
            });
    }
}

console.log("loaded")
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);