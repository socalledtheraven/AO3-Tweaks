// all of this is taken from https://greasyfork.org/en/scripts/491762-ao3-bookmark-helper, but it's MIT so i'm good

/*START SETTINGS: Change these to true/false based on your preferences*/
/*SETTINGS THAT APPLY TO ALL BOOKMARKS*/
let BOOKMARK_NOTES_ENABLED;

let NOTES_APPEND_TO_PREVIOUS; // When editing a pre-existing bookmark, should the pre-existing notes be preserved?
/*Note: If you toggle this to true, and repeatedly edit the same bookmark, it will repeatedly add the same information to the box, growing it over and over.*/
/*This setting is more meant for people who need to go back to their previous bookmarks to add the information this script provides, without losing their old notes.*/
/*In either case, this script does not run on archiveofourown.org/users/USERNAME/bookmarks pages, so you are able to edit bookmarks there with this on and not re-add the same information again*/

/*WORK BOOKMARK SETTINGS*/
let ADD_URL_AND_USERNAME; // Add the title of the work and the username (and pseud if applicable) of the creator with relevant links to each to the bookmark notes.
//Note: Highly recommended as bookmark notes are not deleted when a work is deleted, and finding a lost work is easier with the title, username, and url.

let ADD_SUMMARY; // Add the summary of the work to the bookmark notes
let REC_DEFAULT; // Autocheck the Rec checkbox to make the bookmark a rec
let PRIVATE_DEFAULT; // Autocheck the Private checkbox to make the bookmark private
let ADD_CATEGORIES; // Add a copy of the relationship categories to the bookmarker tag list
let ADD_FANDOM_TAGS; // Add a copy of the fandom tags to the bookmarker tag list
let ADD_CHARACTER_TAGS; // Add a copy of the character tags to the bookmarker tag list
let ADD_RELATIONSHIP_TAGS; // Add a copy of the relationship tags to the bookmarker tag list
let ADD_ADDITIONAL_TAGS; // Add a copy of the additional/freeform tags to the bookmarker tag list
let ADD_RATING; // Add a copy of the rating (with "Rating: " before it) to the bookmarker tag list
let ADD_ARCHIVE_WARNINGS; // Add a copy of the archive warnings to the bookmarker tag list
let ADD_CUSTOM_TAGS; // Add set default tags to bookmarker tag list, default tags listed below
let CUSTOM_TAGS = "TBR, Example Tag, Example Tag 2"; // List of the default tags the bookmark will be given, comma seperated.
let ADD_EXACT_WORDCOUNT_TAG; // Add a tag with the exact word count
let ADD_WORDCOUNT_TAG; // Add a tag for the word count from the following set
//Word count will be split up into 7 groups, edit the list below to change the ranges (default: 1000, 10000, 20000, 50000, 100000, 150000)
//the ranges will be < the first number, first number - second number, second number - third number, etc and finally > the last number
let WORDCOUNTS = [1000, 10000, 20000, 50000, 100000, 150000];
let ADD_EXACT_WORDCOUNT_TAG_LIST; // Add a tag for special case word counts (ie. 100 words, 1000 words, etc) Does not have to be 3, can be any number of special cases
let EXACT_WORDCOUNT_TAG_LIST = ["100", "1000", "10000"]

/*SERIES BOOKMARK SETTINGS*/

let ADD_SERIES_URL_AND_USERNAME; // Add the title of the series and the username(s) (and pseud(s) if applicable) of the creator(s) with relevant links to each to the bookmark notes.
//Highly recommended
let ADD_WORK_COUNT_TAG; // Add the number of works in the series to the tags
let ADD_EXACT_WORDCOUNT_TAG_SERIES; // Add a tag with the exact word count
let ADD_CUSTOM_TAGS_SERIES; // Add set default tags to bookmarker tag list, default tags listed below
let CUSTOM_TAGS_SERIES = "TBR S, Example Tag S, Example Tag 2 S"; // List of the default tags the bookmark will be given, comma seperated.
let ADD_CUSTOM_TAGS_FOR_WORKS; //Add the custom tags that are listed for work bookmarks to series bookmarks too
let REC_DEFAULT_SERIES; // Autocheck the Rec checkbox to make the bookmark a rec on series bookmarks
let PRIVATE_DEFAULT_SERIES; // Autocheck the Private checkbox to make the bookmark private on series bookmarks


/*END SETTINGS*/


function updateWorkBookmark(url) {
    let notesBoxText = "";

    if (ADD_URL_AND_USERNAME) {
        let title = document.getElementsByClassName("title heading")[0];
        let username = document.getElementsByClassName("byline heading")[0];

        // checks for pseuds
        if (username.textContent.includes("(")) {
            let pseud = username.textContent.split("(");
            username = pseud[1].trim();
            pseud = pseud[0].trim();
            username = username.substring(0, username.length-1);
            notesBoxText += "<a href=\"" + url + "\">" + title.textContent.trim() + "</a> by <a href=\"/users/" + username + "/pseuds/" + pseud + "\"> (" + pseud + ") " + username + "</a>";

        } else {
            username = username.textContent.trim();
            notesBoxText += "<a href=\"" + url + "\">" + title.textContent.trim() + "</a> by <a href=\"/users/" + username + "/pseuds/" + username + "\">" + username + "</a>";
        }
    }

    if (ADD_SUMMARY) {
        let summary = document.getElementsByClassName("summary");
        if (summary.length !== 0) {
            summary = summary[0].getElementsByClassName("userstuff")[0].innerHTML;
            notesBoxText += "\n\nSummary: " + summary;
            // sanitise inputs so they display properly
            notesBoxText = notesBoxText.replaceAll("</p>","\n").replaceAll("<p>","");
        }
    }

    const notesBox = document.getElementById("bookmark_notes");
    if (notesBox) {
        // adding a separator for the programmatic notes should allow me to differentiate the two and only copy over real notes
        if (NOTES_APPEND_TO_PREVIOUS) {
            let oldNotes = notesBox.value.split("-~-~-~-")[0];

            notesBox.value = oldNotes + "\n-~-~-~-\n" + notesBoxText;
        } else {
            notesBox.value = "\n-~-~-~-\n" + notesBoxText;
        }
    }

    // the checkboxes
    if (REC_DEFAULT) {
        const recBox = document.getElementById("bookmark_rec");
        recBox.checked = true;
    }

    if (PRIVATE_DEFAULT) {
        const privateBox = document.getElementById("bookmark_private");
        privateBox.checked = true;
    }

    // Tag section begins
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");

    if (ADD_CATEGORIES) {
        addTags(tagBox, "category tags")
    }

    if (ADD_FANDOM_TAGS) {
        addTags(tagBox, "fandom tags")
    }

    if (ADD_CHARACTER_TAGS) {
        addTags(tagBox, "character tags")
    }

    if (ADD_RELATIONSHIP_TAGS) {
        addTags(tagBox, "relationship tags")
    }

    if (ADD_ADDITIONAL_TAGS) {
        addTags(tagBox, "freeform tags")
    }

    if (ADD_RATING) {
        addTags(tagBox, "rating tags")
    }

    if (ADD_ARCHIVE_WARNINGS) {
        addTags(tagBox, "warning tags")
    }

    if (ADD_CUSTOM_TAGS) {
        tagBox.value += ", " + CUSTOM_TAGS
    }

    // the wordcount section begins
    let wordcount = document.getElementsByClassName("words")[1].textContent;
    wordcount = removeCommas(wordcount);

    if (ADD_EXACT_WORDCOUNT_TAG) {
        tagBox.value += ", Word Count:" + wordcount;
    }

    if (ADD_WORDCOUNT_TAG) {
        for (let i = 0; i < WORDCOUNTS.length - 1; i++) {
            if (wordcount >= WORDCOUNTS[i] && wordcount < WORDCOUNTS[i + 1]) {
                tagBox.value += ", Word Count: " + WORDCOUNTS[i] + "-" + WORDCOUNTS[i + 1];
                break;
            }
        }

        // handle when the wordcount is less than the smallest wordcount
        if (wordcount >= WORDCOUNTS[WORDCOUNTS.length - 1]) {
            tagBox.value += ", Word Count: > " + WORDCOUNTS[WORDCOUNTS.length - 1];
        }

        // handle when the wordcount is higher than the largest amount
        if (wordcount < WORDCOUNTS[0]) {
            tagBox.value += ", Word Count: < " + WORDCOUNTS[0];
        }
    }

    if (ADD_EXACT_WORDCOUNT_TAG_LIST) {
        for (let exactWordcountTag of EXACT_WORDCOUNT_TAG_LIST) {
            if (wordcount === exactWordcountTag) {
                tagBox.value += ", Word Count: " + exactWordcountTag;
            }
        }
    }

    tagBox.value += ", "
}

function updateSeriesBookmark(url) {
    if (ADD_SERIES_URL_AND_USERNAME) {
        let seriesTitle = document.getElementsByTagName("h2")[0];

        const notesBox = document.getElementById("bookmark_notes");
        let notesBoxText = "<a href=\"" + url + "\">" + seriesTitle.textContent.trim() + "</a> by ";

        const statsPanel = document.getElementsByClassName("series meta group")[0];
        const usernames = statsPanel.querySelectorAll('[rel="author"]');

        // all of this is presumably calculated so things don't break if the notes isn't there for whatever reason
        if (notesBox) {
            for (let username of usernames) {
                // detects pseuds
                if (username.textContent.includes("(")) {
                    let pseud = username.textContent.split("(");
                    username = pseud[1].trim();
                    pseud = pseud[0].trim();
                    username = username.substring(0, username.length-1);
                    username = "<a href=\"/users/" + username + "/pseuds/" + pseud + "\"> (" + pseud + ") " + username + "</a>";
                } else {
                    username = username.textContent.trim();
                    username ="<a href=\"/users/" + username + "/pseuds/" + username + "\">" + username + "</a>";
                }

                notesBoxText += username + " & ";
            }

            // to avoid having to use an "i" based for loop, an extra space ampersand space is added to the end, so this removes that
            notesBoxText = notesBoxText.slice(0, -3)
            if (NOTES_APPEND_TO_PREVIOUS) {
                notesBox.value += "\n" + notesBoxText
            } else {
                notesBox.value = notesBoxText;
            }
        }
    }

    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    if (ADD_WORK_COUNT_TAG) {
        const workCount = document.getElementsByClassName("works");
        tagBox.value += ", Works in series: " + workCount[1].textContent;
    }

    if (ADD_EXACT_WORDCOUNT_TAG_SERIES) {
        const wordCount = document.getElementsByClassName("words");
        tagBox.value += ", Words in series: " + removeCommas(wordCount[1].textContent);
    }

    if (ADD_CUSTOM_TAGS_SERIES) {
        tagBox.value += ", " + CUSTOM_TAGS_SERIES;
    }

    if (ADD_CUSTOM_TAGS_FOR_WORKS) {
        tagBox.value += ", " + CUSTOM_TAGS;
    }

    if (REC_DEFAULT_SERIES) {
        const recBox = document.getElementById("bookmark_rec");
        recBox.checked = true;
    }

    if (PRIVATE_DEFAULT_SERIES) {
        const privateBox = document.getElementById("bookmark_private");
        privateBox.checked = true;
    }
}

function removeCommas(wordcount) {
    if (wordcount.includes(',')) {
        // no, I don't know why this recursively keeps doing this, it was like this in the original script. my best guess
        // is that in the past, replace only replaced the first match
        wordcount = wordcount.replace(',', '');
        wordcount = removeCommas(wordcount);
    }

    return wordcount;
}

function addTags(tagBox, categorySelector) {
    const categories = document.getElementsByClassName(categorySelector);
    if (categories.length > 0) {
        const categoryTags = categories[1].getElementsByClassName("tag");
        for (let tag of categoryTags) {
            tagBox.value += ", " + tag.textContent;
        }
    }

    return tagBox;
}

function isLoggedIn() {
    // when used in an if, this will check for the existence of the element
    // it's basically being casted to bool
    return !document.querySelector("#login");
}

console.log("loaded bookmarkNotes.js");

function initializeExtension(settings) {
    BOOKMARK_NOTES_ENABLED = settings["bookmark_notes_enabled"];
    NOTES_APPEND_TO_PREVIOUS = settings["notes_append_to_previous"];
    ADD_URL_AND_USERNAME = settings["add_url_and_username"];
    ADD_SUMMARY = settings["add_summary"];
    REC_DEFAULT = settings["rec_default"];
    PRIVATE_DEFAULT = settings["private_default"];
    ADD_CATEGORIES = settings["add_categories"];
    ADD_FANDOM_TAGS = settings["add_fandom_tags"];
    ADD_CHARACTER_TAGS = settings["add_character_tags"];
    ADD_RELATIONSHIP_TAGS = settings["add_relationship_tags"];
    ADD_ADDITIONAL_TAGS = settings["add_additional_tags"];
    ADD_RATING = settings["add_rating"];
    ADD_ARCHIVE_WARNINGS = settings["add_archive_warnings"];
    ADD_EXACT_WORDCOUNT_TAG = settings["add_exact_wordcount_tag"];
    ADD_SERIES_URL_AND_USERNAME = settings["add_series_url_and_username"];
    ADD_WORK_COUNT_TAG = settings["add_work_count_tag"];
    ADD_EXACT_WORDCOUNT_TAG_SERIES = settings["add_exact_wordcount_tag_series"];
    REC_DEFAULT_SERIES = settings["rec_default_series"];
    PRIVATE_DEFAULT_SERIES = settings["private_default_series"];

    console.log("BOOKMARK_NOTES_ENABLED" + BOOKMARK_NOTES_ENABLED);
    console.log("NOTES_APPEND_TO_PREVIOUS" + NOTES_APPEND_TO_PREVIOUS);
    console.log("ADD_URL_AND_USERNAME" + ADD_URL_AND_USERNAME);
    console.log("ADD_SUMMARY" + ADD_SUMMARY);
    console.log("REC_DEFAULT" + REC_DEFAULT);
    console.log("PRIVATE_DEFAULT" + PRIVATE_DEFAULT);
    console.log("ADD_CATEGORIES" + ADD_CATEGORIES);
    console.log("ADD_FANDOM_TAGS" + ADD_FANDOM_TAGS);
    console.log("ADD_CHARACTER_TAGS" + ADD_CHARACTER_TAGS);
    console.log("ADD_RELATIONSHIP_TAGS" + ADD_RELATIONSHIP_TAGS);
    console.log("ADD_ADDITIONAL_TAGS" + ADD_ADDITIONAL_TAGS);
    console.log("ADD_RATING" + ADD_RATING);
    console.log("ADD_ARCHIVE_WARNINGS" + ADD_ARCHIVE_WARNINGS);
    console.log("ADD_EXACT_WORDCOUNT_TAG" + ADD_EXACT_WORDCOUNT_TAG);
    console.log("ADD_SERIES_URL_AND_USERNAME" + ADD_SERIES_URL_AND_USERNAME);
    console.log("ADD_WORK_COUNT_TAG" + ADD_WORK_COUNT_TAG);
    console.log("ADD_EXACT_WORDCOUNT_TAG_SERIES" + ADD_EXACT_WORDCOUNT_TAG_SERIES);
    console.log("REC_DEFAULT_SERIES" + REC_DEFAULT_SERIES);
    console.log("PRIVATE_DEFAULT_SERIES: " + PRIVATE_DEFAULT_SERIES);

    if (isLoggedIn() && BOOKMARK_NOTES_ENABLED) {
        // has a problem with the variable name "url" (presumably something else is using it)
        let uri = window.location.href;
        if (uri.includes("/works/")) {
            updateWorkBookmark(uri);
        } else if (uri.includes("/series/")) {
            updateSeriesBookmark(uri);
        }
    }
}

function onError(error) {
    console.log(`Error: ${error}`);
}

// Get both settings at once and initialise the extension
browser.storage.sync.get([
    "bookmark_notes_enabled",
    "notes_append_to_previous",
    "add_url_and_username",
    "add_summary",
    "rec_default",
    "private_default",
    "add_categories",
    "add_fandom_tags",
    "add_character_tags",
    "add_relationship_tags",
    "add_additional_tags",
    "add_rating",
    "add_archive_warnings",
    "add_exact_wordcount_tag",
    "add_series_url_and_username",
    "add_work_count_tag",
    "add_exact_wordcount_tag_series",
    "rec_default_series",
    "private_default_series"
])
    .then(initializeExtension)
    .catch(onError);