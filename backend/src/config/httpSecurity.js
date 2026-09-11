function createHelmetConfig(env = process.env) {
    const production = env.NODE_ENV === 'production';
    return {
        // This process serves JSON/PDF only. The React HTML host owns browser CSP.
        contentSecurityPolicy: false,
        // CORS already constrains which frontend origins may read API responses.
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        frameguard: { action: 'deny' },
        referrerPolicy: { policy: 'no-referrer' },
        strictTransportSecurity: production
            ? { maxAge: 31536000, includeSubDomains: true }
            : false
    };
}

module.exports = { createHelmetConfig };
