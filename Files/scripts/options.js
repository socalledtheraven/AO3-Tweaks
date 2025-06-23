// import * as browser from "webextension-polyfill";

const booleanSettingMappings = {
    rekudos_enabled: "#rekudos_enabled",
    auto_rekudos_enabled: "#auto_rekudos_enabled",
    rekudos_messages: "#rekudos_messages",
    comment_templates: "#comment_templates",
    extra_comment_boxes: "#extra_comment_boxes",
    latest_chapter_autofill: "#latest_chapter_autofill",
    save_as_to_read_enabled: "#save_as_to_read_enabled",
    unsub_from_works: "#unsub_from_works",
    replace_mark_for_later: "#replace_mark_for_later",
    add_priv_save_as: "#add_priv_save_as",
    create_mark_as_read_button: "#create_mark_as_read_button",
    bookmark_notes_enabled: "#bookmark_notes_enabled",
    notes_append_to_previous: "#notes_append_to_previous",
    add_url_and_username: "#add_url_and_username",
    add_summary: "#add_summary",
    rec_default: "#rec_default",
    private_default: "#private_default",
    add_categories: "#add_categories",
    add_fandom_tags: "#add_fandom_tags",
    add_character_tags: "#add_character_tags",
    add_relationship_tags: "#add_relationship_tags",
    add_additional_tags: "#add_additional_tags",
    add_rating: "#add_rating",
    add_archive_warnings: "#add_archive_warnings",
    add_exact_wordcount_tag: "#add_exact_wordcount_tag",
    add_series_url_and_username: "#add_series_url_and_username",
    add_work_count_tag: "#add_work_count_tag",
    add_exact_wordcount_tag_series: "#add_exact_wordcount_tag_series",
    rec_default_series: "#rec_default_series",
    private_default_series: "#private_default_series"
}

function saveOptions(e) {
    e.preventDefault();
	
    for (let [key, value] of Object.entries(booleanSettingMappings)) {
        if (document.querySelector(value).type === "checkbox") {
            console.log("setting key " + key + " to " + document.querySelector(value).checked)
            browser.storage.sync.set({[key]: document.querySelector(value).checked});
        } else if (document.querySelector(value).type === "textarea") {
            console.log("setting key " + key + " to " + document.querySelector(value).textContent)
            browser.storage.sync.set({[key]: document.querySelector(value).textContent});
        }
    }
	
	console.log("saved");
}

function restoreOptions() {
    function setCurrentChoice(result, id) {
        let elem = document.querySelector(id);
        console.log(elem);
        if (elem.tagName === "CHECKBOX") {
            console.log("setting id " + id + " to " + result);
            elem.checked = result;

            if (elem.classList.contains("dom") && result) {
                console.log("subing list")
                let checkboxes = elem.parentNode.parentNode.parentNode.querySelector("ul").querySelectorAll(".sub");
                for (let i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].disabled = false;
                }

                elem.onclick = function () {
                    for (let i = 0; i < checkboxes.length; i++) {
                        checkboxes[i].disabled = !this.checked;
                    }
                }
            }
        } else if (elem.tagName === "TEXTAREA") {
            console.log("setting id " + id + " to " + result);
            elem.textContent = result;
        }
    }

    for (let [key, value] of Object.entries(booleanSettingMappings)) {
        console.log("getting key " + key);
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
