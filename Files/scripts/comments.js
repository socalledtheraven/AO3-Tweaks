// CONFIG
const COMMENT_TEMPLATES = true;
const EXTRA_COMMENT_BOXES = false;

/* sourced from:
https://keenmarvellover.tumblr.com/post/632111521465581568/how-to-trick-writers-into-giving-you-more-fanfic,
https://www.reddit.com/r/AO3/comments/1ervacj/how_to_write_good_comments/,
https://dawnfelagund.tumblr.com/post/170618220828/101-comment-starters
 */
const TEMPLATE_COMMENTS = [
    "[lavish praise]",
    "[inside fandom joke]",
    "[quote fave part] [fill in keysmash]",
    "[fill in keysmash]",
    "This made me [cry/squeal/giggle/wake the dead with my laughter]",
    "I almost woke my family laughing at [part]",
    "and [writer’s name] strikes again!",
    "[favorite sentences/scenes/characterizations and explain why you liked them]",
    "[type in caps, make some spelling errors and repeat compliment]",
    "This made me feel [emotion]",
    "I love the way you wrote [this character]",
    "Wow! This chapter was so good!! I really like how you described/explained [this]! I'm excited to see what happens next! Thank you for the awesome story, and have a great day, author!",
    "My favorite character in this story is [character] because […]",
    "[Character] felt really believable to me because […]",
    "I really connected with [character] when […]",
    "I felt [emotion] for [character] when […]",
    "I thought it was interesting how you wrote [character] as […]",
    "I never thought about [character] in this way until your story.",
    "After your story, I always imagine [character] as […]",
    "The relationship between [character] and [character] was very believable.",
    "[Character] was a perfect hero because […]",
    "[Character] was a perfect villain because […]",
    "[Character] was a really original interpretation of the canon.",
    "The way you wrote [character] was like seeing my own interpretation on the page because […]",
    "I can totally see [character] doing […]",
    "I enjoyed how [character action] foreshadowed [plot event].",
    "[Original character] really enhanced the story because […]",
    "Your characters are believable and complex.",
    "I could not put your story down after [plot event].",
    "I did not expect [plot event] to happen.",
    "When [plot event] happened, I felt […]",
    "I could not stop reading your story because […]",
    "[Scene] was written with intense suspense.",
    "The pacing in [scene] kept the story moving and made me keep reading.",
    "The way you wrote [scene], I could really imagine what was happening.",
    "[Scene] was emotion-packed and made me feel [emotion].",
    "I didn’t mean to read as much as I did, but I couldn’t put your story down.",
    "Your story is such a satisfying slow burn.",
    "When you described [place], I felt like I was there.",
    "The way you write it, I want to visit [place] because […]",
    "I enjoyed how you described [place] as [quote line or passage].",
    "Your description of [place] was exactly how I picture it in my head because […]",
    "Your description of [place] is really fitting because […]",
    "I enjoyed how you used your description of [place] to foreshadow [plot event].",
    "Your description of [place] made me see [place] differently because […]",
    "The way you developed [culture/group] really brought them to life.",
    "The way you wrote [culture/group] made me think of them differently because […]",
    "The [worldbuilding element, e.g., government, religion, language, etc.] of [place] was completely believable.",
    "I was fascinated by the way you wrote [worldbuilding element, e.g., government, religion, language, etc.].",
    "The level of detail in your thinking about [worldbuilding element] is impressive.",
    "You really expanded the worldbuilding of [culture, place, etc.] beyond the original canon.",
    "Your worldbuilding of [worldbuilding element] made me think differently about [worldbuilding element].",
    "Your worldbuilding of [worldbuilding element] was interesting to me because […]",
    "This story was a thoughtful exploration of [theme, e.g., coming of age, justice, good vs. evil, etc.].",
    "The concept of [theme] was strongly conveyed when [plot event].",
    "This story presented a unique take on the theme of [theme] because […]",
    "Your presentation of [theme] in this story was [description, e.g., poignant, thought-provoking, intriguiging, etc.].",
    "[Character] is central to your ideas about [theme] because […]",
    "The way you handled [theme] is complex and thoughtful because […]",
    "Your writing makes me feel [emotion] because […]",
    "[Quote line or passage] This part of the story made me feel […]",
    "[Quote line or passage] I felt like this passage was effective because […]",
    "[Quote line or passage] This passage/line was beautiful and poetic writing.",
    "[Quote line or passage] Because of the imagery here, I could imagine exactly what was happening in this passage.",
    "[Quote line or passage] Your choice of words here is […]",
    "When you said, [quote line or passage], you made me feel […]",
    "Your dialogue is very [description, e.g., believable, witty, etc.].",
    "You really captured [character]’s voice when […]",
    "[Quote line or passage] This passage is effective foreshadowing.",
    "[Quote line or passage] This passage made me want to learn more about [character, event, worldbuilding element, etc.].",
    "Your use of [literary element, e.g., metaphor, sensory detail, suspense, etc.] is well done.",
    "You write beautiful descriptions.",
    "The mood you create in [passage/scene] is really effective.",
    "I’d never thought of [canon element] this way until your story.",
    "You really made me stop and think about [canon].",
    "Your story has changed how I think about [canon/fanon].",
    "I enjoyed how you used [canon detail(s)] to write an original take on [character/scene].",
    "Reading your story has made me want to learn more about [canon].",
    "I learned a lot about [canon] as a result of reading your story.",
    "Your story is a thought-provoking take on [canon/fanon].",
    "Your story made me seek out other stories about [canon/fanon].",
    "Your story has made me believe in [fanon/head canon].",
    "Your head canon about [head canon] is […]",
    "Your level of research and knowledge about [canon] is impressive.",
    "This story is an excellent example of [fanon/ship/kink/trope].",
    "I wanted to cry when […]",
    "I needed a box of tissues when […]",
    "I was so angry when […]",
    "I wanted to throw something at [character] when […]",
    "I laughed out loud when […]",
    "The way you wrote [character/scene] is hilarious.",
    "I keep thinking about [character/scene] and cracking up.",
    "I needed a beverage warning when […]",
    "The way you wrote [character/scene] is heartbreaking.",
    "The love scene between [character] and [character] was super hot.",
    "I wanted so badly for […]",
    "I was really happy when […]",
    "I felt relief when […]",
    "I was so surprised when […]",
    "This story provided me with some much-needed distraction when […]",
    "This story gave me a lot of joy when I needed it because […]",
    "This story got me through a [personal event, e.g., boring workday, long flight, etc.].",
    "The [emotion] in this story really resonated with me because […]",
    "[Plot point/Character] felt realistic to me because of my experience with […]",
]

const PREWRITTEN_COMMENTS = [
    "I love you",
    "*assorted keysmashing*",
    "h OW DA RE",
    "DID I SAY YOU COULD HURT ME LIKE THIS?!?;?!;",
    "DONT HURT MY BABY WHY WOULD YOU DO THIS",
    "why must you hurt me this way",
    "WHY IS THIS A CLIFFHANGER?! WHAT HAPPENS NEXT I NEED TO KNOW",
    "I DIDNT KNOW I NEEDED THIS AU UNTIL YOU POSTED THIS",
    "this is so cute I’m dying",
    "I had to reread this bc it’s so good and I love it",
    "I wish I could kudos this more than once",
    "loved this!",
    "❤️",
    "*squeeeeeee*"
]
// CONFIG

async function fullTextCommentBoxes() {
    // checks if the "chapter by chapter" button is present (to indicate it is currently in fulltext mode
    const fullText = document.querySelector(".chapter.bychapter");
    if (fullText) {
        console.log("is fulltext")
        let commentBox = document.querySelector("#add_comment");
        let chapters = document.querySelector("#chapters");
        let chapterNodes = chapters.children;
        // we do this because the length will be updated when I'm dynamically inserting new ones
        let chaptersLength = chapterNodes.length;
        let chapterUrls = await getChapterUrls();

        for (let i = chaptersLength; i > 0; i--) {
            let newCommentBox = commentBox.cloneNode(true);
            newCommentBox.querySelector("form.new_comment").action = chapterUrls[i];

            chapters.insertBefore(newCommentBox, chapterNodes[i]);
        }
    }
}

async function getChapterUrls() {
    let navigationUrl = window.location.href + "/navigate";
    let navPageHTML = await getHTML(navigationUrl);

    // this is standard parsing
    let parser = new DOMParser();
    let doc = parser.parseFromString(navPageHTML, "text/html");

    // grabs all the things in that list and filters it down to just the urls, then format them appropriately
    let urls = Array.from(doc.querySelector('ol[role="navigation"]').querySelectorAll("a"));
    return urls.map((url) => {
        return "/chapters" + url.href.split("chapters")[1] + "/comments";
    });
}

async function getHTML(url) {
    let response = await fetch(url);
    return await response.text();
}

function templateComments() {
    let ul = document.createElement("ul");

    // all the styling here is so that it will look like the actions in terms of spacing
    // same reason for why I'm bothering with using a ul and lis
    let containerLi1 = document.createElement("li");
    containerLi1.style.listStyle = "none"
    containerLi1.style.display = "inline"
    containerLi1.style.paddingLeft = "0.25em"

    let commentTemplateButton = document.createElement("a");
    commentTemplateButton.textContent = "Fill comment template";
    commentTemplateButton.href = "";
    commentTemplateButton.onclick = function () {
        autofillComment(TEMPLATE_COMMENTS);
        return false;
    };
    containerLi1.appendChild(commentTemplateButton);

    let paddingLi1 = document.createElement("li");
    paddingLi1.style.listStyle = "none"
    paddingLi1.style.display = "inline"
    paddingLi1.style.paddingLeft = "0.25em"

    let containerLi2 = document.createElement("li");
    containerLi2.style.listStyle = "none"
    containerLi2.style.display = "inline"
    containerLi2.style.paddingLeft = "0.25em"

    let premadeCommentButton = document.createElement("a");
    premadeCommentButton.textContent = "Fill prewritten comment";
    premadeCommentButton.href = "";
    premadeCommentButton.onclick = function () {
        autofillComment(PREWRITTEN_COMMENTS);
        return false;
    };
    containerLi2.appendChild(premadeCommentButton);

    let paddingLi2 = document.createElement("li");
    paddingLi2.style.listStyle = "none"
    paddingLi2.style.display = "inline"
    paddingLi2.style.paddingLeft = "0.25em"

    let containerLi3 = document.createElement("li");
    containerLi3.style.listStyle = "none"
    containerLi3.style.display = "inline"
    containerLi3.style.paddingLeft = "0.25em"

    let commentButton = document.querySelector("input[value='Comment']");
    let commentButtonContainer = commentButton.parentNode;
    containerLi3.appendChild(commentButton);

    ul.appendChild(containerLi1);
    ul.appendChild(paddingLi1);
    ul.appendChild(containerLi2);
    ul.appendChild(paddingLi2);
    ul.appendChild(containerLi3);
    commentButtonContainer.appendChild(ul);
}

function autofillComment(templates) {
    let random = Math.floor(Math.random() * templates.length);
    let commentBox = document.querySelector(".comment_form");
    commentBox.value = templates[random];
}

// run this first so the extra buttons are copied to all the other comment boxes
if (COMMENT_TEMPLATES) {
    templateComments()
}

// needs the .then because it's async
if (EXTRA_COMMENT_BOXES) {
    fullTextCommentBoxes().then(
        function () {
            console.log("");
        }
    );
}