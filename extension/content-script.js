console.log("Tweet-Temizleme Content Script Loaded");

function remoteLog(msg) {
    console.log(msg);
    try {
        chrome.runtime.sendMessage({ type: "LOG", message: msg });
    } catch (e) {
        // ignore
    }
}


// --- Control Logic ---
let scrapingInterval = null;

function startScraping() {
    if (scrapingInterval) return;
    console.log("Starting scraping...");
    scrapeTweets(); // Run once immediately
    scrapingInterval = setInterval(scrapeTweets, 4000); // Slowed down to prevent outrunning user
}

function stopScraping() {
    if (scrapingInterval) {
        console.log("Stopping scraping...");
        clearInterval(scrapingInterval);
        scrapingInterval = null;
    }
}

// Listen for messages from Background Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CMD_DELETE") {
        console.log("Received DELETE command for:", message.tweetId);
        deleteTweet(message.tweetId);
    } else if (message.type === "CMD_START") {
        startScraping();
    } else if (message.type === "CMD_STOP") {
        stopScraping();
    }
});

// --- Scraping Logic ---
// ... (rest of the file remains the same, but setInterval at the bottom is removed)


// --- Scraping Logic ---

function extractTweetData(article) {
    if (!article) return null;

    // Extract Tweet ID
    const timeEl = article.querySelector("time");
    let id = null;
    let createdAt = new Date().toISOString();

    if (timeEl) {
        createdAt = timeEl.getAttribute("datetime");
        const timeParent = timeEl.closest("a");
        if (timeParent) {
            const href = timeParent.getAttribute("href");
            if (href && href.includes("/status/")) {
                id = href.split("/status/")[1]?.split("/")[0];
            }
        }
    }

    if (!id) {
        const links = Array.from(article.querySelectorAll("a"));
        const statusLink = links.find((a) => {
            const href = a.getAttribute("href");
            return href && href.includes("/status/") && !href.includes("/photo/");
        });
        if (statusLink) {
            const href = statusLink.getAttribute("href");
            id = href.split("/status/")[1]?.split("/")[0];
        }
    }

    // Extract Content
    const textEl = article.querySelector("[data-testid='tweetText']");
    const content = textEl ? textEl.innerText : "[Media/No Text]";

    // Extract Author Info
    const userEl = article.querySelector("[data-testid='User-Name']");
    let authorName = "Unknown";
    let authorHandle = "@unknown";
    let avatar = "";

    if (userEl) {
        const textParts = userEl.innerText.split("\n");
        if (textParts.length >= 2) {
            authorName = textParts[0];
            authorHandle = textParts[1];
        }
    }

    const avatarImg = article.querySelector("img[src*='profile_images']");
    if (avatarImg) {
        avatar = avatarImg.src;
    }

    // Extract Metrics
    const likeBtn = article.querySelector("[data-testid='like']");
    const retweetBtn = article.querySelector("[data-testid='retweet']");
    const replyBtn = article.querySelector("[data-testid='reply']");

    const likes = likeBtn ? likeBtn.getAttribute("aria-label")?.match(/\d+/)?.[0] || "0" : "0";
    const retweets = retweetBtn ? retweetBtn.getAttribute("aria-label")?.match(/\d+/)?.[0] || "0" : "0";
    const replyCount = replyBtn ? replyBtn.getAttribute("aria-label")?.match(/\d+/)?.[0] || "0" : "0";

    // Extract Media
    const media = [];
    const photoDivs = article.querySelectorAll("[data-testid='tweetPhoto'] img");
    photoDivs.forEach((img) => {
        if (img.src) media.push(img.src);
    });
    const videoDivs = article.querySelectorAll("[data-testid='videoPlayer'] video");
    videoDivs.forEach((video) => {
        if (video.poster) media.push(video.poster);
    });
    if (videoDivs.length === 0) {
        const videoComponent = article.querySelector("[data-testid='videoComponent'] img");
        if (videoComponent && videoComponent.src) {
            media.push(videoComponent.src);
        }
    }

    // Check Retweet
    const socialContext = article.querySelector("[data-testid='socialContext']");
    let isRetweet = false;
    if (socialContext) {
        const text = socialContext.innerText.toLowerCase();
        if (text.includes("retweeted") || text.includes("retweetledi")) {
            isRetweet = true;
        }
    }

    // Extract Link Card
    let cardTitle = null;
    let cardDescription = null;
    let cardDomain = null;
    let cardImage = null;

    const cardWrapper = article.querySelector("[data-testid='card.wrapper']");
    if (cardWrapper) {
        // Try to find image
        const img = cardWrapper.querySelector("img");
        if (img) cardImage = img.src;

        // Try to find text content
        // This structure varies, so we try a few selectors
        const textNodes = Array.from(cardWrapper.querySelectorAll("span"));
        // Usually domain is small gray text, title is bold
        // Simple heuristic:
        if (textNodes.length > 0) {
            // Often the last one is the domain or the first one is the domain depending on layout
            // Let's try to find the domain (usually contains '.')
            const domainNode = textNodes.find(n => n.innerText.includes(".") && n.innerText.length < 30);
            if (domainNode) cardDomain = domainNode.innerText;

            // Title is usually the longest text or the one with specific styling
            // For now, let's grab the first non-domain text as title
            const titleNode = textNodes.find(n => n !== domainNode && n.innerText.length > 0);
            if (titleNode) cardTitle = titleNode.innerText;
        }
    }

    return {
        id,
        content,
        createdAt,
        status: "PENDING",
        authorName,
        authorHandle,
        avatar,
        likes,
        retweets,
        replyCount,
        media,
        isRetweet,
        cardTitle,
        cardDescription,
        cardDomain,
        cardImage
    };
}

function scrapeTweets() {
    remoteLog("Scraping started...");
    const articles = Array.from(document.querySelectorAll("article[data-testid='tweet']"));
    remoteLog(`Found ${articles.length} articles`);
    const tweets = [];

    // Get logged-in user handle - Robust Strategy
    let myHandle = null;

    // Strategy 1: SideNav Account Switcher (Desktop/Tablet)
    const accountSwitcher = document.querySelector("[data-testid='SideNav_AccountSwitcher_Button']");
    if (accountSwitcher) {
        const handleEl = accountSwitcher.querySelector("div[dir='ltr'] > span");
        if (handleEl && handleEl.innerText.startsWith("@")) {
            myHandle = handleEl.innerText.replace("@", "").toLowerCase();
        }
    }

    // Strategy 2: AppTabBar Profile Link (Sidebar)
    if (!myHandle) {
        const profileLink = document.querySelector("[data-testid='AppTabBar_Profile_Link']");
        if (profileLink) {
            const href = profileLink.getAttribute("href");
            if (href) {
                myHandle = href.replace("/", "").toLowerCase();
            }
        }
    }

    // Strategy 3: Mobile Bottom Nav
    if (!myHandle) {
        // Sometimes the profile link is in the bottom bar on narrow screens
        const mobileProfile = document.querySelector("a[href*='/'][role='link'][aria-label*='Profile']");
        if (mobileProfile) {
            const href = mobileProfile.getAttribute("href");
            if (href) myHandle = href.replace("/", "").toLowerCase();
        }
    }

    // Strict Profile Page Check
    if (myHandle) {
        const currentPath = window.location.pathname.toLowerCase();
        // Check if path starts with /username (ignoring /status/, /media, etc for now, but user said "User Profile")
        // Actually, user said "only scrape the User Profile".
        // So we should check if we are on /username or /username/with_replies
        if (currentPath !== `/${myHandle}` && currentPath !== `/${myHandle}/with_replies`) {
            console.warn(`Not on profile page (Current: ${currentPath}, Expected: /${myHandle}). Skipping scrape.`);
            return;
        }
    }

    if (myHandle) {
        remoteLog(`Detected current user: ${myHandle}`);
    } else {
        remoteLog("Could not detect current user handle. Filtering disabled (but strict check will fail).");
    }

    articles.forEach((article, index) => {
        // Pre-validation: Check for "More" button (Caret)
        // If it doesn't exist, we can't delete it, so don't scrape it.
        const moreButton = article.querySelector("[data-testid='caret']");
        if (!moreButton) return;

        const tweetData = extractTweetData(article);

        // Filter: Only include tweets from the logged-in user OR if it's a retweet by the user
        if (tweetData && tweetData.id) {
            let shouldInclude = false;

            // 1. Check if it's my own tweet
            if (myHandle && tweetData.authorHandle) {
                const tweetHandle = tweetData.authorHandle.replace("@", "").toLowerCase();
                if (tweetHandle === myHandle) {
                    shouldInclude = true;
                }
            }

            // 2. Check if it's a Retweet (even if author is different)
            if (tweetData.isRetweet) {
                shouldInclude = true;
            }

            if (!shouldInclude) {
                // remoteLog(`Skipping tweet ${tweetData.id} (Author: ${tweetData.authorHandle}, Me: ${myHandle}, Retweet: ${tweetData.isRetweet})`);
                return;
            }

            // Thread Context Logic
            // We look at the previous and next articles in the DOM

            // Check Parent
            if (index > 0) {
                const prevArticle = articles[index - 1];
                const prevTweet = extractTweetData(prevArticle);
                // Simple heuristic: if same author or visually connected (hard to detect visual line in DOM)
                // For now, we just grab it as context if it exists
                if (prevTweet) {
                    tweetData.threadParent = JSON.stringify(prevTweet);
                }
            }

            // Check Child
            if (index < articles.length - 1) {
                const nextArticle = articles[index + 1];
                const nextTweet = extractTweetData(nextArticle);
                if (nextTweet) {
                    tweetData.threadChild = JSON.stringify(nextTweet);
                }
            }

            tweets.push(tweetData);
        }
    });

    if (tweets.length > 0) {
        console.log(`Scraped ${tweets.length} tweets`);
        try {
            chrome.runtime.sendMessage({ type: "SCRAPED_TWEETS", tweets }, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn("Runtime error sending tweets:", chrome.runtime.lastError.message);
                    if (chrome.runtime.lastError.message.includes("Extension context invalidated")) {
                        console.error("Extension context invalidated. Stopping scraper.");
                        stopScraping();
                    }
                }
            });
        } catch (error) {
            console.error("Error sending message:", error);
            if (error.message && error.message.includes("Extension context invalidated")) {
                console.error("Extension context invalidated (catch). Stopping scraper.");
                stopScraping();
            }
        }
    }

    // Auto-scroll
    window.scrollBy({
        top: 150, // Drastically reduced to prevent skipping
        behavior: "smooth"
    });
}

// --- Action Logic ---

async function findTweetInDOM(tweetId) {
    // Helper to find article by ID
    const find = () => {
        const articles = document.querySelectorAll("article");
        for (const article of articles) {
            const links = Array.from(article.querySelectorAll("a"));
            if (links.some((a) => a.getAttribute("href")?.includes(tweetId))) {
                return article;
            }
        }
        return null;
    };

    let article = find();
    if (article) return article;

    console.log(`Tweet ${tweetId} not found. Searching (Scrolling Up)...`);

    // Retry Strategy: Scroll UP in steps
    for (let i = 0; i < 5; i++) {
        window.scrollBy(0, -300); // Scroll up
        await delay(300); // Wait for render
        article = find();
        if (article) {
            console.log(`Found tweet ${tweetId} after scrolling up.`);
            article.scrollIntoView({ block: "center", behavior: "smooth" });
            await delay(500);
            return article;
        }
    }

    // Reset scroll (optional, or just give up)
    // console.log("Searching (Scrolling Down)...");
    // window.scrollBy(0, 1500); 

    return null;
}

async function deleteTweet(tweetId) {
    // 1. Find the tweet in the DOM with retry/scroll logic
    const targetArticle = await findTweetInDOM(tweetId);

    if (!targetArticle) {
        console.warn(`Tweet ${tweetId} not found in DOM after search.`);
        return;
    }

    // Check if it's a Retweet (Green Retweet Button)
    const retweetButton = targetArticle.querySelector("[data-testid='unretweet']");

    if (retweetButton) {
        console.log(`Unretweeting ${tweetId}...`);
        retweetButton.click();
        await delay(500);

        // Click "Undo Retweet" in the menu
        const menuItems = document.querySelectorAll("[role='menuitem']");
        const undoRetweetItem = Array.from(menuItems).find((item) => item.innerText.includes("Undo Retweet") || item.innerText.includes("Retweeti Geri Al"));

        if (undoRetweetItem) {
            undoRetweetItem.click();
            console.log(`Tweet ${tweetId} unretweeted successfully.`);
            return;
        } else {
            console.warn("Undo Retweet option not found.");
            document.body.click(); // Close menu
        }
    }

    // Standard Delete Flow
    // 2. Click the "More" (three dots) button
    const moreButton = targetArticle.querySelector("[data-testid='caret']");

    if (!moreButton) {
        console.error("Could not find 'More' button for tweet", tweetId);
        return;
    }

    moreButton.click();
    await delay(500);

    // 3. Find "Delete" option in the menu
    const menuItems = document.querySelectorAll("[role='menuitem']");
    const deleteItem = Array.from(menuItems).find((item) => item.innerText.includes("Delete") || item.innerText.includes("Sil"));

    if (!deleteItem) {
        console.warn("Delete option not found in menu. Closing menu.");
        document.body.click();
        return;
    }

    deleteItem.click();
    await delay(500);

    // 4. Confirm deletion
    const confirmButton = document.querySelector("[data-testid='confirmationSheetConfirm']");
    if (confirmButton) {
        confirmButton.click();
        console.log(`Tweet ${tweetId} deleted successfully.`);
    } else {
        console.warn("Confirmation button not found.");
    }
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
