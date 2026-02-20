export interface PiiMaskerOptions {
    /**
     * Replacement value used when masking sensitive keys (e.g., password, token, secret, key).
     * @default "[REDACTED]"
     */
    placeholder?: string;

    /**
     * Character used for masking sensitive patterns in string values (e.g., emails, credit cards, IPs, tokens).
     * @default "*"
     */
    maskChar?: string;
};

/**
 * Recursively traverses an object or array and masks sensitive data.
 *
 * - Masks email addresses in string values.
 * - Replaces values of sensitive keys such as: "password", "token", "secret", or "key".
 * - Traverses nested objects and arrays.
 * - Does NOT mutate the original input.
 *
 * @param data The input data to scan.
 * @param options Optional masking configuration.
 * @returns A new structure with masked values while preserving original shape.
 */
declare function hidePii<T>(data: T, options?: PiiMaskerOptions): T;

export { hidePii };
export default hidePii;
