// all of this is taken from https://greasyfork.org/en/scripts/491762-ao3-bookmark-helper, but it's MIT so i'm good

/*START SETTINGS: Change these to true/false based on your preferences*/
/*SETTINGS THAT APPLY TO ALL BOOKMARKS*/

const NOTES_APPEND_TO_PREVIOUS = false; // When editing a pre-existing bookmark, should the pre-existing notes be preserved?
/*Note: If you toggle this to true, and repeatedly edit the same bookmark, it will repeatedly add the same information to the box, growing it over and over.*/
/*This setting is more meant for people who need to go back to their previous bookmarks to add the information this script provides, without losing their old notes.*/
/*In either case, this script does not run on archiveofourown.org/users/USERNAME/bookmarks pages, so you are able to edit bookmarks there with this on and not re-add the same information again*/

/*WORK BOOKMARK SETTINGS*/
const ADD_URL_AND_USERNAME = true; // Add the title of the work and the username (and pseud if applicable) of the creator with relevant links to each to the bookmark notes.
//Note: Highly recommended as bookmark notes are not deleted when a work is deleted, and finding a lost work is easier with the title, username, and url.

const ADD_SUMMARY = true; // Add the summary of the work to the bookmark notes

const REC_DEFAULT= false; // Autocheck the Rec checkbox to make the bookmark a rec
const PRIVATE_DEFAULT = false; // Autocheck the Private checkbox to make the bookmark private


const ADD_CATEGORIES = false; // Add a copy of the relationship categories to the bookmarker tag list
const ADD_FANDOM_TAGS = true; // Add a copy of the fandom tags to the bookmarker tag list
const ADD_CHARACTER_TAGS = false; // Add a copy of the character tags to the bookmarker tag list
const ADD_RELATIONSHIP_TAGS = false; // Add a copy of the relationship tags to the bookmarker tag list
const ADD_ADDITIONAL_TAGS = false; // Add a copy of the additional/freeform tags to the bookmarker tag list
const ADD_RATING = false; // Add a copy of the rating (with "Rating: " before it) to the bookmarker tag list
const ADD_ARCHIVE_WARNINGS = false; // Add a copy of the archive warnings to the bookmarker tag list

const ADD_CUSTOM_TAGS = false; // Add set default tags to bookmarker tag list, default tags listed below
const CUSTOM_TAGS = "TBR, Example Tag, Example Tag 2"; // List of the default tags the bookmark will be given, comma seperated.

const ADD_EXACT_WORDCOUNT_TAG = false; // Add a tag with the exact word count

const ADD_WORDCOUNT_TAG = true; // Add a tag for the word count from the following set
//Word count will be split up into 7 groups, edit the list below to change the ranges (default: 1000, 10000, 20000, 50000, 100000, 150000)
//the ranges will be < the first number, first number - second number, second number - third number, etc and finally > the last number
const WORDCOUNTS = [1000, 10000, 20000, 50000, 100000, 150000];

const ADD_EXACT_WORDCOUNT_TAG_LIST = true; // Add a tag for special case word counts (ie. 100 words, 1000 words, etc) Does not have to be 3, can be any number of special cases
const EXACT_WORDCOUNT_TAG_LIST = ["100", "1000", "10000"]

/*SERIES BOOKMARK SETTINGS*/

const ADD_SERIES_URL_AND_USERNAME = true; // Add the title of the series and the username(s) (and pseud(s) if applicable) of the creator(s) with relevant links to each to the bookmark notes.
//Highly recommended

const ADD_WORK_COUNT_TAG = true; // Add the number of works in the series to the tags

const ADD_EXACT_WORDCOUNT_TAG_SERIES = true; // Add a tag with the exact word count

const ADD_CUSTOM_TAGS_SERIES = false; // Add set default tags to bookmarker tag list, default tags listed below
const CUSTOM_TAGS_SERIES = "TBR S, Example Tag S, Example Tag 2 S"; // List of the default tags the bookmark will be given, comma seperated.

const ADD_CUSTOM_TAGS_FOR_WORKS = false; //Add the custom tags that are listed for work bookmarks to series bookmarks too

const REC_DEFAULT_SERIES = false; // Autocheck the Rec checkbox to make the bookmark a rec on series bookmarks
const PRIVATE_DEFAULT_SERIES = false; // Autocheck the Private checkbox to make the bookmark private on series bookmarks


/*END SETTINGS*/


function updateWorkBookmark(url) {
    let notesBoxText = "";

    if (ADD_URL_AND_USERNAME) {
        let title = document.getElementsByClassName("title heading")[0];
        let username = document.getElementsByClassName("byline heading")[0];

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
            notesBoxText = notesBoxText.replaceAll("</p>","\n").replaceAll("<p>","");
        }
    }

    const notesBox = document.getElementById("bookmark_notes");
    if (notesBox) {
        if (NOTES_APPEND_TO_PREVIOUS) {
            notesBox.value += "\n" + notesBoxText;
        } else {
            notesBox.value = notesBoxText;
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
    let username;
    const notesBox = document.getElementById("bookmark_notes");
    let notesBoxText = "";
    const statsPanel = document.getElementsByClassName("series meta group")[0];
    const tagBox = document.getElementById("bookmark_tag_string_autocomplete");
    if (ADD_SERIES_URL_AND_USERNAME) {

        let seriesTitle = document.getElementsByTagName("h2");

        const userNames = statsPanel.querySelectorAll('[rel="author"]');


        seriesTitle = seriesTitle[0];
        if (notesBox) {
            for(let i = 0; i < userNames.length; i++) {
                if (userNames[i].textContent.includes("(")) {
                    let pseud = userNames[i].textContent.split("(");
                    username = pseud[1].trim();
                    pseud = pseud[0].trim();
                    username = username.substring(0, username.length-1);
                    username = "<a href=\"/users/" + username + "/pseuds/" + pseud + "\"> (" + pseud + ") " + username + "</a>";
                } else {
                    username = userNames[i].textContent.trim();
                    username ="<a href=\"/users/" + username + "/pseuds/" + username + "\">" + username + "</a>";
                }
                if (i === 0) {
                    notesBoxText = "<a href=\"" + url + "\">" + seriesTitle.textContent.trim() + "</a> by " + username;
                } else {
                    notesBoxText = notesBoxText + " & " + username;
                }
            }

        }

    }


    if (ADD_WORK_COUNT_TAG) {
        const workCount = document.getElementsByClassName("works");
        tagBox.value += ", Works in series: " + workCount[1].textContent;
    }

    if (ADD_EXACT_WORDCOUNT_TAG_SERIES) {
        const wordCount = document.getElementsByClassName("words");
        tagBox.value += ", Words in series: " + wordCount[1].textContent;
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

    if (NOTES_APPEND_TO_PREVIOUS) {
        if (notesBox) {
            notesBox.value = notesBox.value + "\n" + notesBoxText;
        }
    } else {
        if (notesBox) {
            notesBox.value = notesBoxText;
        }
    }

}

function removeCommas(wordcount) {
    if (wordcount.includes(',')) {
        wordcount = wordcount.replace(',', '');
        wordcount = removeCommas(wordcount);
    }

    return wordcount;
}

function addTags(tagBox, categorySelector) {
    const categories = document.getElementsByClassName(categorySelector);
    const categoryTags = categories[1].getElementsByClassName("tag");
    for (let tag of categoryTags) {
        tagBox.value += ", " + tag.textContent;
    }

    return tagBox;
}

let uri = window.location.href;
if (uri.includes("/works/")) {
    updateWorkBookmark(uri);
} else if (uri.includes("/series/")) {
    updateSeriesBookmark(uri);
}