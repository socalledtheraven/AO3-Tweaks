# Ao3 Utilities
A Firefox addon/Chrome extension for a number of little features I want, but can't seem to find easily. Main attractions include:
- Mobile support!
  - A must-have for everyone reading on their phones!
- Modularity!
  - Turn any individual tweak on or off without breaking anything!
- Configurability!
  - Tweaks have options you can set to your liking!

## Installation
[Install for Firefox](https://addons.mozilla.org/en-GB/firefox/addon/ao3-tweaks/)

[Install for Chrome](https://chromewebstore.google.com/detail/ao3-tweaks/olgicoiembcbaihkjdpgbnemmggbkaho)

## Current list of Tweaks:
- Double kudos!
  - Already kudos'd that excellent fic? Now you can automatically leave a comment exclaiming so!
  - Configure the messages you want to use freely!
- Latest chapter on Updated Bookmarks list!
  - Noticed a fave has just updated and want to get right into the new stuff without having to click on the tiny link? Now there's a special button that takes you to the latest chapter!
  - This will only appear on your bookmarks sorted by update date, so it's not cluttered anywhere else!
- Save as "To Read" Button!
  - The native Marked for Later is great, but it doesn't show any work details except for title! With this tweak, you can browse the works you want to read as part of your bookmarks list, with all the filtering and sorting options you're used to!
  - This adds a button both to the work menu itself, and to page listings of works (for when you're browsing and don't want to open dozens of tabs). When clicked, it will save a bookmark with the "To Read" tag, which you can then filter by in your bookmarks list. (Use My Bookmarks > Bookmarker's Tags)
  - Also adds the "Mark as Read" button at the bottom, which will just remove the "To Read" tag from your bookmark.
  - This will also keep your current bookmark notes intact and integrate with the next tweak.
- Bookmark work details!
  - Ever been looking through your old bookmarks and found one gone without a trace besides when you bookmarked it, and you are left to ponder what had been?
  - This tweak will save the title, link, author name and summary to your bookmark so you can (hopefully) find an archived copy somehow!
  - You can also choose other details to save!
  - Credit goes to [Tyme LaDow](https://greasyfork.org/en/users/250868-tyme-ladow), who wrote the original version of this under MIT, which I then updated a bit.
- Premade comments!
  - For those times when you have no words, only emotions, the premade comments button gives you a random exuberant comment.
- Comment templates!
  - For those times when you _do_ have words, but are lacking structure or aren't sure how to express them - premade comment starters!
- Both of these comment tweaks are derived from the following sources:
  - https://keenmarvellover.tumblr.com/post/632111521465581568/how-to-trick-writers-into-giving-you-more-fanfic,
  - https://www.reddit.com/r/AO3/comments/1ervacj/how_to_write_good_comments/,
  - https://dawnfelagund.tumblr.com/post/170618220828/101-comment-starters,
  - https://keenmarvellover.tumblr.com/post/638597844666925056/levynite-phantoms-lair-joanielspeak
- Comment boxes under each chapter!
  - When you're reading a longfic in full text mode (as one does) and you have many feelings and thoughts, but the comment box is all the way at the bottom, and you might lose your place or see spoilers, and by the time you've finished reading, you forgot what you were going to say... Now there's a comment box under each chapter's notes! 
  - Integrates with the above comment tweaks.

## Development
1. Clone this repo locally.
2. Run `web-ext run` in the Files directory.
3. Make your changes, the extension should reload automatically
