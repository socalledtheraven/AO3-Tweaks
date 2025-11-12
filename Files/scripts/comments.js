async function fullTextCommentBoxes() {
    // checks if the "chapter by chapter" button is present (to indicate it is currently in fulltext mode
    const fullText = document.querySelector(".chapter.bychapter");
    if (fullText) {
        let chapters = document.querySelector("#chapters");
        let chapterNodes = chapters.children;
        // we do this because the length will be updated when I'm dynamically inserting new ones
        let chaptersLength = chapterNodes.length;
        let chapterUrls = await getChapterUrls();

        for (let i = chaptersLength; i > 0; i--) {
            await appendCommentBox(i, chapterUrls[i-1], chapters, chapterNodes[i]);
        }
    }
}

async function getChapterUrls() {
    // sometimes works will have parameters like this
    let navigationUrl = window.location.href.split("?")[0].split("#")[0] + "/navigate";
    let doc = await window.AO3TweaksUtils.getDocument(navigationUrl);
    let links = Array.from(doc.querySelector('ol[role="navigation"]').querySelectorAll("a"));

    // grabs all the things in that list and filters it down to just the urls, then format them appropriately
    return links.map(link => {
        // Extract the chapter ID from URLs like "/works/62424268/chapters/159744247"
        let href = link.getAttribute('href');
        let chapterMatch = href.match(/chapters\/(\d+)/);

        if (chapterMatch) {
            let chapterId = chapterMatch[1];
            return `https://archiveofourown.org/chapters/${chapterId}/comments`;
        }

        return href; // fallback in case the format is unexpected
    });
}

async function appendCommentBox(i, url, chapters, chapterNode) {
    const box = document.querySelector("#add_comment");
    let commentBox = box.cloneNode(true);
    commentBox.id = "add_comment_" + i;

    // AES compatibility
    let aesCommentButton = commentBox.querySelector('input[class="aes-fake-submit"]');
    if (aesCommentButton) {
        aesCommentButton.remove();
    }

    let aesMessage = commentBox.querySelector(".aes-fcb-recommendation");
    if (aesMessage) {
        aesMessage.remove();
    }

    let button = commentBox.querySelector('input[value="Comment"]');
    button.remove();

    let newButton = document.createElement("a");
    newButton.textContent = "Comment";
    newButton.id = "comment_button_" + i;
    newButton.href = "#comment_button_" + i;

    newButton.onclick = function () {
        let metadata = window.AO3TweaksUtils.getAO3Metadata();
        let token = metadata.token;
        let pseudID = metadata.pseudID;

        window.AO3TweaksUtils.post(url, {
            "authenticity_token": token,
            "comment[pseud_id]": pseudID,
            "comment[comment_content]": commentBox.querySelector("textarea").value,
            "controller_name": "chapters",
            "commit": "Comment"
        }).then((r) => {
            if (r.ok) {
                newButton.textContent = "Commented!";
            } else {
                newButton.textContent = "Comment failed";
            }
        });
    };

    let parent = commentBox.querySelector("p.actions");
    parent.appendChild(newButton);

    chapters.insertBefore(commentBox, chapterNode);
}

// Code for comment templates begins

function templateComments(TEMPLATE_COMMENTS, PREWRITTEN_COMMENTS) {
    let commentButtons = document.querySelectorAll("input[value='Comment']");
    let commentButtonContainers = Array.from(commentButtons, button => button.parentNode);

    for (let i = 0; i <= commentButtonContainers.length-1; i++) {
        let container = commentButtonContainers[i];

        let ul = document.createElement("ul");

        // all the styling here is so that it will look like the actions in terms of spacing
        // same reason for why I'm bothering with using a ul and lis
        let containerLi1 = window.AO3TweaksUtils.createInlineListItem();
        containerLi1.style.cursor = "pointer";

        let commentTemplateButton = document.createElement("a");
        commentTemplateButton.textContent = "Fill comment template";
        commentTemplateButton.onclick = function () {
            autofillComment(container, TEMPLATE_COMMENTS);
            return false;
        };
        containerLi1.appendChild(commentTemplateButton);

        let paddingLi1 = window.AO3TweaksUtils.createInlineListItem();

        let containerLi2 = window.AO3TweaksUtils.createInlineListItem(true);

        let premadeCommentButton = document.createElement("a");
        premadeCommentButton.textContent = "Fill prewritten comment";
        premadeCommentButton.onclick = function () {
            autofillComment(container, PREWRITTEN_COMMENTS);
            return false;
        };
        containerLi2.appendChild(premadeCommentButton);

        let paddingLi2 = window.AO3TweaksUtils.createInlineListItem();

        let containerLi3 = window.AO3TweaksUtils.createInlineListItem(true);
        containerLi3.appendChild(commentButtons[i]);

        ul.appendChild(containerLi1);
        ul.appendChild(paddingLi1);
        ul.appendChild(containerLi2);
        ul.appendChild(paddingLi2);
        ul.appendChild(containerLi3);
        container.appendChild(ul);
    }
}

function autofillComment(parentContainer, templates) {
    parentContainer = parentContainer.parentNode;
    let random = Math.floor(Math.random() * templates.length);
    let commentBox = parentContainer.querySelector(".comment_form");
    commentBox.value = templates[random];
}

console.log("loaded comments.js");

function initializeExtension(settings) {
    let COMMENT_TEMPLATES = settings["comment_templates"] || true;
    COMMENT_TEMPLATES = false;
    let EXTRA_COMMENT_BOXES = settings["extra_comment_boxes"] || true;
    let TEMPLATE_COMMENTS = settings["template_comments"] || [
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
        "[Plot point/Character] felt realistic to me because of my experience with […]"
    ];
    let PREWRITTEN_COMMENTS = settings["prewritten_comments"] || [
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
        "*squeeeeeee*",
        "(✿◠‿◠)",
        "I heart this so much!!”",
        "⊂◉‿◉つ",
        "OMG, the surprise was so sweet!",
        "☆(❁‿❁)☆",
        "AHH! Love it!",
        "≧◠‿◠≦",
        "All the feels!",
        "٩(˘◡˘)۶",
        "Woot!!",
        "( ͡° ͜ʖ ͡°)",
        "I see what you did there and/or that smut was on point.",
        "┑(￣▽￣)┍",
        "Sweet praises for you!",
        "ლ(╹◡╹ლ)",
        "I love this story so hard, I get tingles when it updates!",
        "ʘ‿ʘ",
        "WHat?!",
        "(●⌒∇⌒●)",
        "Squee!!",
        "(❁´◡`❁)",
        "Oh dear god, cavities!",
        "(ﾉ´▽｀)ﾉ♪",
        "This made me siiiinnnnnggggg!!",
        "┏(＾0＾)┛",
        "Happy dance!",
        "ヾ(＾∇＾)",
        "Wonderful fic! Thanks again!",
        "(┬＿┬)",
        "Literally crying, rn.",
        "(^)o(^)",
        "Holy moly!”",
        "(◕﹏◕✿)",
        "How … how could you do this to me?!",
        "ಥ‿ಥ",
        "I’m not crying you are!",
        "ᕕ(◉Д◉ )ᕗ",
        "WTAF?!",
        "(⊙…⊙,)",
        "Did yoU JUST.",
        "ᕕ(˵•̀෴•́˵)ᕗ",
        "HOW DARE YOU! With my OWN EYES!",
        "(ノ°Д°）ノ︵ ┻━┻",
        "TABLE FLIP, you son-OF-A-!",
        "(@[]@!!)",
        "WHAT IN THE HOLY HELL ARE YOU DOING?!",
        "＼(◎o◎)／！– “WAS NOT EXPECTING THAT.",
        "(´･_･`)",
        "I do not know how I feel about this.",
        "><((((’>",
        "This fish is delicious"
    ];

    if (window.AO3TweaksUtils.isLoggedIn()) {
        // full text comment boxes is async, so it needs to happen first, so we have to have an overly complicated if structure
        if (EXTRA_COMMENT_BOXES) {
            fullTextCommentBoxes().then(function () {
                if (COMMENT_TEMPLATES) {
                    templateComments(TEMPLATE_COMMENTS, PREWRITTEN_COMMENTS)
                }
            });
        } else {
            if (COMMENT_TEMPLATES) {
                templateComments(TEMPLATE_COMMENTS, PREWRITTEN_COMMENTS)
            }
        }
    }
}

// Get both settings at once and initialise the extension
browser.storage.sync.get(["comment_templates", "extra_comment_boxes", "template_comments", "prewritten_comments"])
    .then(initializeExtension)
    .catch(window.AO3TweaksUtils.onError);