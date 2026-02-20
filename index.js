const dataPatterns = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    creditCard: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    secretToken: /((?:api[_-]?key|auth[_-]?token|secret|password|bearer|pwd)[-_\s:="']+)(.+?)(?=['"]|$|\s)/gi,
    connectionString: /(mongodb(?:\+srv)?|postgres|mysql|redis):\/\/[^@\s]+:[^@\s]+@[^\s]+/gi,
    ipv4: /\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g
};

/**
 * hide-pii - 🎭 A zero-dependency, recursive PII (Personally Identifiable Information) masker for modern JavaScript. Keep sensitive data out of your logs and don't leak information!
 * @version: v1.0.1
 * @link: https://github.com/tutyamxx/hide-pii
 * @license: MIT
 **/


/**
 * Masks sensitive patterns in a string.
 * @example
 * maskString("Contact: john.doe@test.com") -> "Contact: jo*****@test.com"
 * maskString("Bearer 1a2b3c4d5e6f7g8h9i0j") -> "Bearer **********"
 *
 * @param {string} [str=''] - Input string to sanitize.
 * @param {string} [maskChar='*'] - Character used for masking.
 * @returns {string} Obfuscated string.
 */
const maskString = (str = '', maskChar = '*') => {
    let sanitized = str?.toString() ?? '';

    // --| Apply email masking with partial preservation
    sanitized = sanitized?.replace(dataPatterns?.email, (match) => {
        const [name, domain] = match?.split('@');
        const visible = name?.slice(0, 2);
        const filler = (maskChar ?? '*')?.repeat(5);

        return `${visible}${filler}@${domain}`;
    });

    // --| Apply masking for secret tokens (Capturing groups preserve prefix context like "Bearer ")
    sanitized = sanitized?.replace(dataPatterns?.secretToken, (_match, prefix, _secret, suffix) => {
        const filler = (maskChar ?? '*')?.repeat(10);

        return `${prefix}${filler}${suffix ?? ''}`;
    });

    // --| Apply general masking for other sensitive patterns
    const otherPatterns = ['creditCard', 'connectionString', 'ipv4'];

    for (const pattern of otherPatterns) {
        sanitized = sanitized?.replace(dataPatterns?.[pattern] ?? '', (match) => {
            return (maskChar ?? '*')?.repeat(match?.length > 10 ? 10 : match?.length);
        });
    }

    return sanitized;
};

/**
 * Recursively traverses an object or array and masks sensitive data.
 *
 * Behaviour:
 * - Replaces values for keys matching sensitive patterns (e.g. password, token, secret, key).
 * - Masks email addresses and other PII found in string values.
 * - Safely processes nested objects and arrays.
 * - Returns a new structure without mutating the original input.
 *
 * @param {Object|Array|*} data
 * Data structure to inspect. Can be:
 * - Object
 * - Array
 * - Primitive value (string, number, boolean, null, etc.)
 *
 * @param {Object} [options]
 * @param {string} [options.placeholder='[REDACTED]']
 * Replacement value used when masking sensitive keys.
 *
 * @returns {Object|Array|string}
 * A new structure with masked values.
 */
const hidePii = (data, options = {}) => {
    // --| If it's not an object (or it's null), process as a simple string
    if (typeof data !== 'object' || data === null) {
        return maskString(data?.toString() ?? '');
    }

    const maskedOutput = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
        // --| Check if the property name itself is suspicious
        const isSecretKey = /password|token|secret|key|pwd/i.test(key);

        // --| Use placeholder from options or default to '[REDACTED]'
        maskedOutput[key] = isSecretKey
            ? (options?.placeholder ?? '[REDACTED]')
            : hidePii(value, options);
    }

    return maskedOutput;
};

// --| CommonJS export
module.exports = hidePii;

// --| ESM default export for `import` statements
module.exports.default = hidePii;
