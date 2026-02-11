const Levenshtein = require("levenshtein");

const COMMON_DOMAINS = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "protonmail.com"
];

function getDidYouMean(email) {
    if (!email || typeof email !== "string" || !email.includes("@")) return null;

    const [local, domain] = email.toLowerCase().split("@");

    let bestMatch = null;
    let minDistance = Infinity;

    for (let correctDomain of COMMON_DOMAINS) {
        const distance = new Levenshtein(domain, correctDomain).distance;

        if (distance <= 2 && distance < minDistance) {
            minDistance = distance;
            bestMatch = correctDomain;
        }
    }

    if (bestMatch && bestMatch !== domain) {
        return `${local}@${bestMatch}`;
    }

    return null;
}

module.exports = { getDidYouMean };
