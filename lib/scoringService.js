/**
 * Scoring System (0-100)
 *
 * Start at 100, deduct points for missing or failing checks:
 *   - SPF missing      → -25
 *   - DMARC missing    → -25
 *   - DKIM missing     → -20
 *   - Blacklisted      → -30
 *   - Expiry < 30 days → -20
 */

/**
 * Calculate security score based on scan results
 * @param {Object} results - Scan results
 * @param {boolean} results.spf
 * @param {boolean} results.dmarc
 * @param {boolean} results.dkim
 * @param {boolean} results.blacklisted
 * @param {Date|null} results.expiryDate
 * @returns {{ score: number, status: string }}
 */
export function calculateScore(results) {
    let score = 100;

    if (!results.spf) score -= 25;
    if (!results.dmarc) score -= 25;
    if (!results.dkim) score -= 20;
    if (results.blacklisted) score -= 30;

    if (results.expiryDate) {
        const daysUntilExpiry = Math.ceil(
            (new Date(results.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry < 30) {
            score -= 20;
        }
    }

    // Clamp score to 0-100
    score = Math.max(0, Math.min(100, score));

    let status;
    if (score >= 80) {
        status = 'healthy';
    } else if (score >= 60) {
        status = 'warning';
    } else {
        status = 'critical';
    }

    return { score, status };
}
