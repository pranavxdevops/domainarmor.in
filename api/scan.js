import { runDNSChecks } from '../lib/dnsService.js';
import { checkBlacklist } from '../lib/blacklistService.js';
import { checkSSL } from '../lib/sslService.js';
import { calculateScore } from '../lib/scoringService.js';
import {
    withErrorHandler,
    isValidDomain,
    errorResponse,
    successResponse,
} from '../lib/authMiddleware.js';

// Cache the IANA RDAP bootstrap data
let rdapBootstrap = null;

/**
 * Get the RDAP server URL for a given TLD from IANA bootstrap
 */
async function getRdapServer(tld) {
    if (!rdapBootstrap) {
        const res = await fetch('https://data.iana.org/rdap/dns.json');
        if (!res.ok) return null;
        rdapBootstrap = await res.json();
    }

    for (const entry of rdapBootstrap.services || []) {
        const tlds = entry[0];
        const urls = entry[1];
        if (tlds.includes(tld) && urls.length > 0) {
            return urls[0].replace(/\/$/, '');
        }
    }
    return null;
}

/**
 * Extract vCard field value from RDAP entity
 */
function getVcardField(entity, fieldName) {
    const vcard = entity?.vcardArray?.[1];
    if (!vcard) return null;
    for (const field of vcard) {
        if (field[0] === fieldName) return field[3];
    }
    return null;
}

/**
 * Get WHOIS info via RDAP (HTTP-based, works on Vercel)
 * RDAP is the modern replacement for the WHOIS protocol
 */
async function getWhoisInfo(domain) {
    const whoisUrl = `https://www.whois.com/whois/${domain}`;

    try {
        const tld = domain.split('.').pop().toLowerCase();
        const rdapServer = await getRdapServer(tld);

        if (rdapServer) {
            const res = await fetch(`${rdapServer}/domain/${domain}`, {
                headers: { Accept: 'application/rdap+json' },
                signal: AbortSignal.timeout(10000),
            });

            if (res.ok) {
                const data = await res.json();

                // Extract dates from events
                let expiryDate = null;
                let createdDate = null;
                let updatedDate = null;

                for (const ev of data.events || []) {
                    if (ev.eventAction === 'expiration') expiryDate = ev.eventDate;
                    if (ev.eventAction === 'registration') createdDate = ev.eventDate;
                    if (ev.eventAction === 'last changed') updatedDate = ev.eventDate;
                }

                // Find registrar entity
                const entities = data.entities || [];
                const registrarEntity = entities.find(e => e.roles?.includes('registrar'));
                const registrantEntity = entities.find(e => e.roles?.includes('registrant'));

                // Extract abuse contact from registrar's sub-entities
                let abuseEmail = null;
                let abusePhone = null;
                if (registrarEntity?.entities) {
                    const abuseEntity = registrarEntity.entities.find(e => e.roles?.includes('abuse'));
                    if (abuseEntity) {
                        abuseEmail = getVcardField(abuseEntity, 'email');
                        abusePhone = getVcardField(abuseEntity, 'tel');
                    }
                }

                const registrar = {
                    name: getVcardField(registrarEntity, 'fn') || null,
                    url: registrarEntity?.links?.[0]?.href || null,
                    ianaId: registrarEntity?.handle || null,
                    abuseEmail,
                    abusePhone,
                    createdDate,
                    updatedDate,
                    registrant: getVcardField(registrantEntity, 'fn') || getVcardField(registrantEntity, 'org') || null,
                    registrantCountry: null,
                    dnssec: data.secureDNS?.delegationSigned ? 'signed' : 'unsigned',
                    status: data.status || null,
                };

                return {
                    expiryDate: expiryDate ? new Date(expiryDate) : null,
                    registrar,
                    whoisUrl,
                };
            }
        }

        // Fallback: use whois-json (raw TCP — works locally / on non-Vercel hosts)
        return await getWhoisFallback(domain, whoisUrl);
    } catch {
        // Last resort fallback
        try {
            return await getWhoisFallback(domain, whoisUrl);
        } catch {
            return { expiryDate: null, registrar: null, whoisUrl };
        }
    }
}

/**
 * Fallback: use whois-json (raw WHOIS over TCP)
 * Works locally and on traditional servers, may fail on Vercel
 */
async function getWhoisFallback(domain, whoisUrl) {
    try {
        const whois = await import('whois-json');
        const result = await whois.default(domain);

        const pick = (...keys) => {
            for (const k of keys) {
                if (result[k]) return result[k];
            }
            return null;
        };

        const expiryRaw = pick('expirationDate', 'registryExpiryDate', 'registrarRegistrationExpirationDate', 'expiresOn', 'paid-till');

        const registrar = {
            name: pick('registrar', 'registrarName', 'sponsoringRegistrar'),
            url: pick('registrarUrl', 'referralUrl', 'registrarURL'),
            ianaId: pick('registrarIanaId', 'registrarIANAID'),
            abuseEmail: pick('registrarAbuseContactEmail', 'abuseContactEmail'),
            abusePhone: pick('registrarAbuseContactPhone', 'abuseContactPhone'),
            createdDate: pick('creationDate', 'createdDate', 'created', 'domainRegistrationDate'),
            updatedDate: pick('updatedDate', 'lastUpdated', 'lastModified', 'changed'),
            registrant: pick('registrantOrganization', 'registrantName', 'orgName', 'org-name'),
            registrantCountry: pick('registrantCountry', 'registrantStateProvince'),
            dnssec: pick('dnssec', 'DNSSEC'),
            status: pick('domainStatus', 'status'),
        };

        return {
            expiryDate: expiryRaw ? new Date(expiryRaw) : null,
            registrar,
            whoisUrl,
        };
    } catch {
        return { expiryDate: null, registrar: null, whoisUrl };
    }
}

async function handler(req, res) {
    if (req.method !== 'POST') {
        return errorResponse(res, 405, 'Method not allowed');
    }

    const { domain } = req.body || {};

    if (!domain) {
        return errorResponse(res, 400, 'Domain is required');
    }

    // Clean and validate domain
    const cleanDomain = domain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/+$/, '');

    if (!isValidDomain(cleanDomain)) {
        return errorResponse(res, 400, 'Please enter a valid domain (e.g., example.com)');
    }

    // Run all checks in parallel
    const [dnsResults, blacklistResult, whoisInfo, sslResult] = await Promise.all([
        runDNSChecks(cleanDomain),
        checkBlacklist(cleanDomain),
        getWhoisInfo(cleanDomain),
        checkSSL(cleanDomain),
    ]);

    const { expiryDate, registrar, whoisUrl } = whoisInfo;

    const scanData = {
        spf: dnsResults.spf,
        dmarc: dnsResults.dmarc,
        dkim: dnsResults.dkim,
        mx: dnsResults.mx,
        expiryDate,
        blacklisted: blacklistResult.blacklisted,
    };

    // Calculate score
    const { score, status } = calculateScore(scanData);

    return successResponse(res, {
        domain: cleanDomain,
        score,
        status,
        // Security checks
        spf: dnsResults.spf,
        dmarc: dnsResults.dmarc,
        dkim: dnsResults.dkim,
        // DNS records
        mx: dnsResults.mx,
        txt: dnsResults.txt,
        aRecords: dnsResults.aRecords,
        aaaaRecords: dnsResults.aaaaRecords,
        cname: dnsResults.cname,
        ns: dnsResults.ns,
        soa: dnsResults.soa,
        // SSL
        ssl: sslResult,
        // WHOIS
        expiryDate,
        registrar,
        whoisUrl,
        blacklisted: blacklistResult.blacklisted,
        blacklistDetails: blacklistResult.details,
    });
}

export default withErrorHandler(handler);
