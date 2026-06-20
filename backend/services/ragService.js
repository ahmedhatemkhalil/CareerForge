import axios from "axios";

const SERPER_API_KEY = process.env.SERPER_API_KEY;

const FREE_PLATFORMS = [
    "youtube.com",
    "youtu.be",
    "maharatech.gov.eg",
    "itimooca.iti.gov.eg",
    "developer.mozilla.org",
    "freecodecamp.org",
    "w3schools.com",
    "geeksforgeeks.org",
    "react.dev",
    "nextjs.org",
];

const PAID_PLATFORMS = ["udemy.com", "coursera.org"];

const PLATFORM_SITE_FILTERS = {
    udemy: "site:udemy.com",
    coursera: "site:coursera.org",
    youtube: "site:youtube.com",
    maharatech: "(site:maharatech.gov.eg OR site:itimooca.iti.gov.eg)",
    mdn: "site:developer.mozilla.org",
    documentation: "site:developer.mozilla.org",
    freecodecamp: "site:freecodecamp.org",
    w3schools: "site:w3schools.com",
    geeksforgeeks: "site:geeksforgeeks.org",
    react: "site:react.dev",
};

const DEFAULT_SITE_FILTER = [
    "site:udemy.com",
    "site:coursera.org",
    "site:youtube.com",
    "site:maharatech.gov.eg",
    "site:itimooca.iti.gov.eg",
    "site:developer.mozilla.org",
    "site:freecodecamp.org",
    "site:w3schools.com",
    "site:geeksforgeeks.org",
    "site:react.dev",
].join(" OR ");

const inferPlatform = (url, fallback = "") => {
    const lowerUrl = String(url).toLowerCase();
    if (lowerUrl.includes("udemy.com")) return "Udemy";
    if (lowerUrl.includes("coursera.org")) return "Coursera";
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "YouTube";
    if (lowerUrl.includes("maharatech.gov.eg") || lowerUrl.includes("itimooca.iti.gov.eg")) {
        return "MaharaTech";
    }
    if (lowerUrl.includes("developer.mozilla.org")) return "MDN";
    if (lowerUrl.includes("freecodecamp.org")) return "freeCodeCamp";
    if (lowerUrl.includes("w3schools.com")) return "W3Schools";
    if (lowerUrl.includes("geeksforgeeks.org")) return "GeeksforGeeks";
    if (lowerUrl.includes("react.dev")) return "React";
    if (lowerUrl.includes("nextjs.org")) return "Next.js";
    return fallback || "Web";
};

const isFreeUrl = (url) => {
    const lowerUrl = String(url).toLowerCase();
    if (FREE_PLATFORMS.some((domain) => lowerUrl.includes(domain))) {
        return true;
    }
    if (PAID_PLATFORMS.some((domain) => lowerUrl.includes(domain))) {
        return false;
    }
    return null;
};

const inferIsFree = (url, type) => {
    const fromUrl = isFreeUrl(url);
    if (fromUrl !== null) {
        return fromUrl;
    }
    if (type === "course") {
        return false;
    }
    return true;
};

const finalizeResource = (resource) => {
    const url = String(resource.url || "").trim();
    const platform = resource.platform || inferPlatform(url);
    let type = resource.type || "article";
    let isFree = resource.isFree ?? inferIsFree(url, type);

    if (platform === "YouTube") {
        type = "video";
        isFree = true;
    } else if (platform === "MaharaTech") {
        type = type === "documentation" ? "documentation" : "course";
        isFree = true;
    } else if (["MDN", "freeCodeCamp", "W3Schools", "GeeksforGeeks", "React", "Next.js"].includes(platform)) {
        if (type === "course") {
            type = platform === "MDN" || platform === "React" || platform === "Next.js" ? "documentation" : "article";
        }
        isFree = true;
    }

    return {
        ...resource,
        url,
        platform,
        type,
        isFree,
    };
};

const pickBestResult = (results, platform) => {
    const normalizedPlatform = String(platform || "").trim().toLowerCase();

    if (normalizedPlatform === "udemy") {
        const udemyCourse = results.find((result) =>
            /udemy\.com\/course\//i.test(result.link || "")
        );
        if (udemyCourse) {
            return udemyCourse;
        }
    }

    if (normalizedPlatform === "coursera") {
        const courseraCourse = results.find((result) =>
            /coursera\.org\/(learn|specializations)\//i.test(result.link || "")
        );
        if (courseraCourse) {
            return courseraCourse;
        }
    }

    if (normalizedPlatform === "youtube") {
        const youtubeVideo = results.find((result) =>
            /(youtube\.com\/watch|youtu\.be\/)/i.test(result.link || "")
        );
        if (youtubeVideo) {
            return youtubeVideo;
        }
    }

    if (normalizedPlatform === "maharatech") {
        const maharaCourse = results.find((result) =>
            /(maharatech\.gov\.eg|itimooca\.iti\.gov\.eg)\/course\//i.test(result.link || "")
        );
        if (maharaCourse) {
            return maharaCourse;
        }
    }

    if (normalizedPlatform === "mdn" || normalizedPlatform === "documentation") {
        const mdnDoc = results.find((result) =>
            /developer\.mozilla\.org/i.test(result.link || "")
        );
        if (mdnDoc) {
            return mdnDoc;
        }
    }

    return results.find((result) => result.link);
};

const buildSearchQuery = ({ topic, platform, type }) => {
    const normalizedPlatform = String(platform || "").trim().toLowerCase();
    const siteFilter =
        PLATFORM_SITE_FILTERS[normalizedPlatform] || DEFAULT_SITE_FILTER;
    const typeHint = type === "course" ? "course" : type || "tutorial";

    if (normalizedPlatform === "udemy") {
        return `"${topic}" ${typeHint} site:udemy.com/course`;
    }

    if (normalizedPlatform === "maharatech") {
        return `"${topic}" course (site:maharatech.gov.eg OR site:itimooca.iti.gov.eg)`;
    }

    if (normalizedPlatform === "youtube") {
        return `"${topic}" tutorial site:youtube.com/watch`;
    }

    return `"${topic}" ${typeHint} ${siteFilter}`;
};

const searchWithSerper = async (query) => {
    if (!SERPER_API_KEY) {
        throw new Error("SERPER_API_KEY is not configured");
    }

    const response = await axios.post(
        "https://google.serper.dev/search",
        {
            q: query,
            num: 5,
        },
        {
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": SERPER_API_KEY,
            },
            timeout: 20000,
        }
    );

    return response.data?.organic || [];
};

/**
 * RAG retrieval: search the web for a real learning resource URL
 * based on the roadmap topic/platform suggested by AI.
 */
export const searchLearningResource = async ({ topic, platform, type, title }) => {
    const searchTopic = String(topic || title || "").trim();
    if (!searchTopic) {
        return null;
    }

    const primaryQuery = buildSearchQuery({ topic: searchTopic, platform, type });

    try {
        let results = await searchWithSerper(primaryQuery);

        if (results.length === 0) {
            const fallbackQuery = buildSearchQuery({
                topic: searchTopic,
                platform: "",
                type,
            });
            results = await searchWithSerper(fallbackQuery);
        }

        const bestMatch = pickBestResult(results, platform);
        if (!bestMatch) {
            return null;
        }

        return finalizeResource({
            title: title || bestMatch.title || searchTopic,
            url: bestMatch.link,
            type: type || "article",
            platform: inferPlatform(bestMatch.link, platform),
            isFree: inferIsFree(bestMatch.link, type),
        });
    } catch (error) {
        console.error("RAG resource search error:", error.message);
        return null;
    }
};

export const enrichResourcesWithRag = async (weeks) => {
    const enrichedWeeks = [];

    for (const week of weeks) {
        const resources = [];

        for (const resource of week.resources || []) {
            const hasValidUrl =
                resource.url &&
                !resource.url.includes("example.com") &&
                /^https?:\/\//i.test(resource.url);

            if (hasValidUrl) {
                resources.push(finalizeResource(resource));
                continue;
            }

            const resolved = await searchLearningResource({
                topic: resource.searchTopic || resource.title || week.theme,
                platform: resource.platform,
                type: resource.type,
                title: resource.title,
            });

            if (resolved) {
                resources.push(resolved);
            }
        }

        if (resources.length === 0) {
            continue;
        }

        enrichedWeeks.push({
            ...week,
            resources,
        });
    }

    return enrichedWeeks.map((week, index) => ({
        ...week,
        weekNumber: index + 1,
    }));
};
