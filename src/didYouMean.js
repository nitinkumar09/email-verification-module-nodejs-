// Built-in Levenshtein distance (no external package needed)
function levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    // Fill the matrix
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,      // deletion
                matrix[j - 1][i] + 1,      // insertion
                matrix[j - 1][i - 1] + cost // substitution
            );
        }
    }

    return matrix[str2.length][str1.length];
}

const COMMON_DOMAINS = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "protonmail.com"
];

export function getDidYouMean(email) {
    if (!email || typeof email !== "string" || !email.includes("@")) return null;

    const [local, domain] = email.toLowerCase().split("@");

    let bestMatch = null;
    let minDistance = Infinity;

    for (let correctDomain of COMMON_DOMAINS) {
        const distance = levenshteinDistance(domain, correctDomain);

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
