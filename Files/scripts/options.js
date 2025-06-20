// import * as browser from "webextension-polyfill";

const booleanSettingMappings = {
    rekudos_enabled: "#rekudos_enabled",
    auto_rekudos_enabled: "#auto_rekudos_enabled",
    comment_templates: "#comment_templates",
    extra_comment_boxes: "#extra_comment_boxes",
    latest_chapter_autofill: "#latest_chapter_autofill",
    save_as_to_read_enabled: "#save_as_to_read_enabled",
    unsub_from_works: "#unsub_from_works",
    replace_mark_for_later: "#replace_mark_for_later",
    add_priv_save_as: "#add_priv_save_as",
    create_mark_as_read_button: "#create_mark_as_read_button"
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
        console.log(result);
        console.log("setting id " + id + " to " + result);
        document.querySelector(id).checked = result;
    }

    for (let [key, value] of Object.entries(booleanSettingMappings)) {
        browser.storage.sync.get(key).then(
            (result) => setCurrentChoice(result[key], value),
            (e) => {
                console.log(e);
            }
        );
    }
}

console.log("loaded options.js")
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);


let checkalls = document.querySelectorAll(".dom");

for (let checkall of checkalls) {
    let checkboxes = checkall.parentNode.parentNode.parentNode.querySelector("ul").querySelectorAll(".sub");
    checkall.onclick = function () {
        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].disabled = !this.checked;
        }
    }
}