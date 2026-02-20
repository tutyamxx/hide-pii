const hidePii = require('../index.js');

describe('hidePii', () => {
    test('Should mask standalone emails and preserve domain', () => {
        expect(hidePii('alex.smith@gmail.com')).toBe('al*****@gmail.com');
        expect(hidePii('a@b.com')).toBe('a*****@b.com');
    });

    test('Should handle null, undefined, and non-string primitives', () => {
        expect(hidePii(null)).toBe('');
        expect(hidePii(undefined)).toBe('');
        expect(hidePii(12345)).toBe('12345');
        expect(hidePii(true)).toBe('true');
    });

    test('Should redact sensitive keys and mask strings in objects', () => {
        const input = {
            username: 'dev_user',
            password: 'super-secret-password',
            email: 'dev@test.local',
            api_key: '123-456'
        };
        const result = hidePii(input);

        expect(result.password).toBe('[REDACTED]');
        expect(result.api_key).toBe('[REDACTED]');
        expect(result.email).toBe('de*****@test.local');
        expect(result.username).toBe('dev_user');
    });

    test('Should deeply traverse nested structures', () => {
        const complex = {
            level1: {
                level2: {
                    secret: 'shhh',
                    contact: 'nested@mail.com'
                },
                list: ['simple', 'user@service.io']
            }
        };
        const result = hidePii(complex);

        expect(result.level1.level2.secret).toBe('[REDACTED]');
        expect(result.level1.level2.contact).toBe('ne*****@mail.com');
        expect(result.level1.list[1]).toBe('us*****@service.io');
    });

    test('Should process arrays of objects', () => {
        const users = [
            { id: 1, token: 'abc' },
            { id: 2, token: 'def' }
        ];
        const result = hidePii(users);

        expect(result[0].token).toBe('[REDACTED]');
        expect(result[1].token).toBe('[REDACTED]');
    });

    test('Should respect custom placeholder option', () => {
        const input = { password: '123' };
        const result = hidePii(input, { placeholder: 'HIDDEN_VAL' });

        expect(result.password).toBe('HIDDEN_VAL');
    });

    test('Should not mutate the original input', () => {
        const original = { key: 'secret', nested: { email: 'a@b.com' } };
        const copy = JSON.parse(JSON.stringify(original));

        hidePii(original);
        expect(original).toEqual(copy);
    });

    test('Should use the lock emoji as a placeholder', () => {
        const input = { apiKey: 'secret-123', token: 'bearer-456' };
        const result = hidePii(input, { placeholder: '🔒' });

        expect(result.apiKey).toBe('🔒');
        expect(result.token).toBe('🔒');
    });

    test('Should handle extremely deep nesting (10+ levels)', () => {
        const deep = { a: { b: { c: { d: { e: { f: { g: { h: { secret: 'found-me' } } } } } } } } };
        const result = hidePii(deep, { placeholder: '🔒' });

        expect(result.a.b.c.d.e.f.g.h.secret).toBe('🔒');
    });

    test('Should mask emails inside mixed arrays', () => {
        const mixed = [
            'plain string',
            'user@domain.com',
            { email: 'admin@system.com' },
            ['nested-email@work.com']
        ];
        const result = hidePii(mixed, { placeholder: '🔒' });

        expect(result[1]).toBe('us*****@domain.com');
        expect(result[2].email).toBe('ad*****@system.com');
        expect(result[3][0]).toBe('ne*****@work.com');
    });

    test('Should return empty structures for empty inputs', () => {
        expect(hidePii({})).toEqual({});
        expect(hidePii([])).toEqual([]);
        expect(hidePii('')).toBe('');
    });

    test('Should catch various "secret" key permutations', () => {
        const input = {
            MY_SECRET: 'val',
            user_password: 'val',
            AccessToken: 'val',
            SUPER_KEY: 'val'
        };
        const result = hidePii(input, { placeholder: '🔒' });

        expect(result.MY_SECRET).toBe('🔒');
        expect(result.user_password).toBe('🔒');
        expect(result.AccessToken).toBe('🔒');
        expect(result.SUPER_KEY).toBe('🔒');
    });

    test('Should not mask strings that look like emails but are not', () => {
        const safeStrings = [
            'not-an-email',
            '@@@',
            'name@domain', // --| Missing TLD
            'just.a.string.with.dots'
        ];

        safeStrings.forEach(str => expect(hidePii(str)).toBe(str));
    });

    test('Should catch credit card numbers', () => {
        const input = "Pay with my Visa 4111111111111111";
        expect(hidePii(input)).toContain('*****');
    });

    test('Should catch database credentials in URLs', () => {
        const dbUrl = "mongodb://admin:P@ssword123@localhost:27017/db";
        const result = hidePii(dbUrl);

        expect(result).not.toContain('P@ssword123');
    });

    test('Should catch Bearer tokens in strings', () => {
        const header = "Authorization: Bearer 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p";

        expect(hidePii(header)).toContain('Bearer');
        expect(hidePii(header)).not.toContain('1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p');
    });
});
