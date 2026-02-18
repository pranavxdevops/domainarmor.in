import tls from 'tls';

/**
 * Check SSL certificate for a domain
 * Returns certificate details including validity, issuer, expiry
 */
export function checkSSL(domain) {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            resolve({
                valid: false,
                error: 'Connection timed out',
            });
        }, 8000);

        try {
            const socket = tls.connect(
                {
                    host: domain,
                    port: 443,
                    servername: domain,
                    rejectUnauthorized: false,
                },
                () => {
                    try {
                        const cert = socket.getPeerCertificate();
                        const authorized = socket.authorized;

                        if (!cert || !cert.valid_to) {
                            clearTimeout(timeout);
                            socket.destroy();
                            resolve({
                                valid: false,
                                error: 'No certificate found',
                            });
                            return;
                        }

                        const validFrom = new Date(cert.valid_from);
                        const validTo = new Date(cert.valid_to);
                        const now = new Date();
                        const daysUntilExpiry = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));
                        const isExpired = now > validTo;

                        clearTimeout(timeout);
                        socket.destroy();

                        resolve({
                            valid: authorized && !isExpired,
                            issuer: cert.issuer
                                ? `${cert.issuer.O || ''}${cert.issuer.CN ? ` (${cert.issuer.CN})` : ''}`.trim()
                                : 'Unknown',
                            subject: cert.subject?.CN || domain,
                            validFrom: validFrom.toISOString(),
                            validTo: validTo.toISOString(),
                            daysUntilExpiry,
                            isExpired,
                            serialNumber: cert.serialNumber || null,
                            fingerprint: cert.fingerprint256 || cert.fingerprint || null,
                            protocol: socket.getProtocol() || null,
                        });
                    } catch {
                        clearTimeout(timeout);
                        socket.destroy();
                        resolve({ valid: false, error: 'Failed to read certificate' });
                    }
                }
            );

            socket.on('error', (err) => {
                clearTimeout(timeout);
                socket.destroy();
                resolve({
                    valid: false,
                    error: err.code === 'ENOTFOUND' ? 'Domain not found' : `Connection failed: ${err.code || err.message}`,
                });
            });
        } catch (err) {
            clearTimeout(timeout);
            resolve({ valid: false, error: err.message });
        }
    });
}
