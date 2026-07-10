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
    "site:youtube.com",
    "site:developer.mozilla.org",
    "site:freecodecamp.org",
    "site:w3schools.com",
    "site:geeksforgeeks.org",
    "site:udemy.com",
    "site:coursera.org",
].join(" OR ");

const normalizePlatformKey = (platform) => {
    const value = String(platform || "").trim().toLowerCase();

    if (!value) return "";
    if (value.includes("youtube")) return "youtube";
    if (value.includes("udemy")) return "udemy";
    if (value.includes("coursera")) return "coursera";
    if (value.includes("mahara")) return "maharatech";
    if (value.includes("mdn") || value.includes("mozilla")) return "mdn";
    if (value.includes("freecodecamp")) return "freecodecamp";
    if (value.includes("w3schools")) return "w3schools";
    if (value.includes("geeksforgeeks")) return "geeksforgeeks";
    if (value.includes("react")) return "react";
    if (value === "documentation" || value.includes("doc")) return "documentation";

    return value;
};

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
    const normalizedPlatform = normalizePlatformKey(platform);
    const withLinks = results.filter((result) => result?.link);

    if (withLinks.length === 0) {
        return null;
    }

    if (normalizedPlatform === "udemy") {
        const match = withLinks.find((result) => /udemy\.com/i.test(result.link));
        if (match) return match;
    }

    if (normalizedPlatform === "coursera") {
        const match = withLinks.find((result) => /coursera\.org/i.test(result.link));
        if (match) return match;
    }

    if (normalizedPlatform === "youtube") {
        const match = withLinks.find((result) =>
            /(youtube\.com|youtu\.be)/i.test(result.link)
        );
        if (match) return match;
    }

    if (normalizedPlatform === "maharatech") {
        const match = withLinks.find((result) =>
            /(maharatech\.gov\.eg|itimooca\.iti\.gov\.eg)/i.test(result.link)
        );
        if (match) return match;
    }

    if (normalizedPlatform === "mdn" || normalizedPlatform === "documentation") {
        const match = withLinks.find((result) => /developer\.mozilla\.org/i.test(result.link));
        if (match) return match;
    }

    return withLinks[0];
};

const buildSearchQuery = ({ topic, platform, type, simple = false }) => {
    const normalizedPlatform = normalizePlatformKey(platform);
    const typeHint = type === "course" ? "course" : type || "tutorial";

    if (simple) {
        return `${topic} ${typeHint}`;
    }

    if (normalizedPlatform === "udemy") {
        return `${topic} course site:udemy.com`;
    }

    if (normalizedPlatform === "maharatech") {
        return `${topic} course site:maharatech.gov.eg`;
    }

    if (normalizedPlatform === "youtube") {
        return `${topic} tutorial site:youtube.com`;
    }

    const siteFilter = PLATFORM_SITE_FILTERS[normalizedPlatform] || DEFAULT_SITE_FILTER;
    return `${topic} ${typeHint} ${siteFilter}`;
};

const buildFallbackResource = ({ topic, platform, type, title }) => {
    const searchTopic = String(topic || title || "career learning").trim();
    const encodedTopic = encodeURIComponent(`${searchTopic} tutorial`);
    const normalizedPlatform = normalizePlatformKey(platform);

    if (normalizedPlatform === "udemy") {
        return finalizeResource({
            title: title || searchTopic,
            url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(searchTopic)}`,
            type: "course",
            platform: "Udemy",
            isFree: false,
        });
    }

    if (normalizedPlatform === "coursera") {
        return finalizeResource({
            title: title || searchTopic,
            url: `https://www.coursera.org/search?query=${encodeURIComponent(searchTopic)}`,
            type: "course",
            platform: "Coursera",
            isFree: false,
        });
    }

    return finalizeResource({
        title: title || searchTopic,
        url: `https://www.youtube.com/results?search_query=${encodedTopic}`,
        type: type === "course" ? "video" : type || "video",
        platform: "YouTube",
        isFree: true,
    });
};

const searchWithSerper = async (query) => {
    if (!SERPER_API_KEY) {
        return [];
    }

    const response = await axios.post(
        "https://google.serper.dev/search",
        {
            q: query,
            num: 8,
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

    const normalizedPlatform = normalizePlatformKey(platform);
    const queries = [
        buildSearchQuery({ topic: searchTopic, platform: normalizedPlatform, type }),
        buildSearchQuery({ topic: searchTopic, platform: "", type }),
        buildSearchQuery({ topic: searchTopic, platform: normalizedPlatform, type, simple: true }),
    ];

    try {
        for (const query of queries) {
            const results = await searchWithSerper(query);
            const bestMatch = pickBestResult(results, normalizedPlatform);

            if (bestMatch?.link) {
                return finalizeResource({
                    title: title || bestMatch.title || searchTopic,
                    url: bestMatch.link,
                    type: type || "article",
                    platform: inferPlatform(bestMatch.link, platform),
                    isFree: inferIsFree(bestMatch.link, type),
                });
            }
        }

        console.warn(`RAG: no Serper results for "${searchTopic}", using fallback URL`);
        return buildFallbackResource({
            topic: searchTopic,
            platform: normalizedPlatform,
            type,
            title,
        });
    } catch (error) {
        console.error("RAG resource search error:", error.message);
        return buildFallbackResource({
            topic: searchTopic,
            platform: normalizedPlatform,
            type,
            title,
        });
    }
};

const ensureWeekResources = (week) => {
    const existing = Array.isArray(week.resources) ? week.resources.filter(Boolean) : [];

    if (existing.length > 0) {
        return existing;
    }

    if (!week.theme) {
        return [];
    }

    return [
        {
            title: `Introduction to ${week.theme}`,
            searchTopic: week.theme,
            type: "video",
            platform: "YouTube",
            isFree: true,
        },
    ];
};

export const enrichResourcesWithRag = async (weeks) => {
    const enrichedWeeks = [];

    for (const week of weeks) {
        const resources = [];
        const weekResources = ensureWeekResources(week);

        for (const resource of weekResources) {
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

            if (resolved?.url) {
                resources.push(resolved);
            }
        }

        if (resources.length === 0 && week.theme) {
            const fallback = buildFallbackResource({
                topic: week.theme,
                platform: "youtube",
                type: "video",
                title: `Learn ${week.theme}`,
            });
            resources.push(fallback);
        }

        enrichedWeeks.push({
            ...week,
            resources,
        });
    }

    return enrichedWeeks
        .filter((week) => week.resources.length > 0)
        .map((week, index) => ({
            ...week,
            weekNumber: index + 1,
        }));
};