# hide-pii

<p align="center"><a href="https://nodei.co/npm/hide-pii/"><img src="https://nodei.co/npm/hide-pii.png"></a></a></p>
<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg">
</p>

* 🎭 A zero-dependency, recursive *PII (Personally Identifiable Information)* masker for modern JavaScript. Keep sensitive data out of your logs and don't leak information!
* ♻️ Works seamlessly with `CommonJS`, `ESM` and `TypeScript`
* 🧊 Does not mutate original object!

# 🤔 Why `hide-pii` ?

* 🎭 A lightweight, zero-dependency utility that automatically scrubs sensitive data like passwords, emails, and credit cards from your objects and logs before they reach your storage or third-party providers. It uses recursive traversal and smart pattern matching to redact private information while preserving the context you need for debugging, helping you stay compliant with `GDPR` and `CCPA` effortlessly.
* 🛡️ The best use case for this package is sanitizing application logs and error reports to prevent sensitive credentials, emails, and database strings from leaking into third-party monitoring tools or plain-text storage.

# ✨ Features

| Feature                   | Description                                                           | Example Input                                    | Example Output                                                 |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| Sensitive Key Masking     | Replaces values for keys like `password`, `token`, `secret`, `apiKey` | `{ password: "mySecret123" }`                    | `{ password: "[REDACTED]" }`                                   |
| Email Obfuscation         | Masks email username while preserving domain                          | `"john.doe@test.com"`                            | `"jo*****@test.com"`                                           |
| Credit Card Masking       | Detects and masks card numbers                                        | `"4111111111111111"`                             | `"**********"`                                                 |
| Secret Token Masking      | Masks API keys, bearer tokens, auth tokens                            | `"Bearer abcdefghijklmnop"`                      | `"Bearer **********"`                                          |
| Connection String Masking | Masks credentials in DB URLs                                          | `"postgres://user:pass@host:5432/db"`            | `"**********"`                                                 |
| IPv4 Address Masking      | Detects and masks IP addresses                                        | `"192.168.1.1"`                                  | `"**********"`                                                 |
| Recursive Traversal       | Automatically scans nested objects and arrays                         | `{ user: { email: "john@test.com" } }`           | `{ user: { email: "jo*****@test.com" } }`                      |
| Custom mask character     | Allows changing the character used for masking (default: `*`)         | `{ email: "john@test.com" }, maskChar: "#" `     | `{ email: "jo#####@test.com" }`                                |
| Placeholder Customization | Lets you choose the string used to replace sensitive keys             | `{ password: "1234" }, placeholder: "🔒"`        | `{ password: "🔒" }`                                           |
| Array Support             | Masks data inside arrays as well                                      | `[ { email: "a@test.com" }, { password: "x" } ]` | `[ { email: "a*****@test.com" }, { password: "[REDACTED]" } ]` |

---

# 📦 Install via [NPM](https://www.npmjs.com/package/hide-pii)

```bash
$ npm i hide-pii
```

# 💻 Usage

- See examples below

## CommonJS
```javascript
const hidePii = require('hide-pii');

const payload = {
    user: {
        id: "usr_12345",
        email: "john.doe@test.com",
        password: "SuperSecretPassword123!",
        profile: {
            ipv4: "192.168.1.1",
            backupEmail: "support.agent@company.org"
        }
    },
    billing: {
        creditCard: "4111111111111111",
        backupCard: "5555555555554444"
    },
    auth: {
        apiKey: "api_key: sk_live_1234567890abcdefghijklmnop",
        authToken: "auth_token: abcdefghijklmnop123456",
        bearer: "Bearer 1a2b3c4d5e6f7g8h9i0j"
    },
    infrastructure: {
        mongo: "mongodb://admin:superpass@localhost:27017/app",
        postgres: "postgres://user:password@localhost:5432/db",
        redis: "redis://cache:secret@127.0.0.1:6379"
    },
    logs: [
        "User john.doe@test.com logged in from 10.0.0.5",
        "Attempt with card 4111111111111111",
        "Bearer zyxwvutsrqponmlkjihg"
    ],
    misc: {
        privateKey: "myUltraSensitiveKey12345678",
        pwd: "plainTextPassword"
    }
};

// --| Add placeholder and a mask character
console.log(hidePii(payload, { placeholder: "🔒", maskChar: "#" }));

// --| OR default "[REDACTED]"
console.log(hidePii(payload));
```

## ESM
```javascript
import hidePii from 'hide-pii';

const payload = {
    user: {
        id: "usr_12345",
        email: "john.doe@test.com",
        password: "SuperSecretPassword123!",
        profile: {
            ipv4: "192.168.1.1",
            backupEmail: "support.agent@company.org"
        }
    },
    billing: {
        creditCard: "4111111111111111",
        backupCard: "5555555555554444"
    },
    auth: {
        apiKey: "api_key: sk_live_1234567890abcdefghijklmnop",
        authToken: "auth_token: abcdefghijklmnop123456",
        bearer: "Bearer 1a2b3c4d5e6f7g8h9i0j"
    },
    infrastructure: {
        mongo: "mongodb://admin:superpass@localhost:27017/app",
        postgres: "postgres://user:password@localhost:5432/db",
        redis: "redis://cache:secret@127.0.0.1:6379"
    },
    logs: [
        "User john.doe@test.com logged in from 10.0.0.5",
        "Attempt with card 4111111111111111",
        "Bearer zyxwvutsrqponmlkjihg"
    ],
    misc: {
        privateKey: "myUltraSensitiveKey12345678",
        pwd: "plainTextPassword"
    }
};

// --| Add placeholder and a mask character
console.log(hidePii(payload, { placeholder: "🔒", maskChar: "#" }));

// --| OR default "[REDACTED]"
console.log(hidePii(payload));
```

## TypeScript
```javascript
import hidePii, { PiiMaskerOptions } from 'hide-pii';

const payload = {
    user: {
        id: "usr_12345",
        email: "john.doe@test.com",
        password: "SuperSecretPassword123!",
        profile: {
            ipv4: "192.168.1.1",
            backupEmail: "support.agent@company.org"
        }
    },
    billing: {
        creditCard: "4111111111111111",
        backupCard: "5555555555554444"
    },
    auth: {
        apiKey: "api_key: sk_live_1234567890abcdefghijklmnop",
        authToken: "auth_token: abcdefghijklmnop123456",
        bearer: "Bearer 1a2b3c4d5e6f7g8h9i0j"
    },
    infrastructure: {
        mongo: "mongodb://admin:superpass@localhost:27017/app",
        postgres: "postgres://user:password@localhost:5432/db",
        redis: "redis://cache:secret@127.0.0.1:6379"
    },
    logs: [
        "User john.doe@test.com logged in from 10.0.0.5",
        "Attempt with card 4111111111111111",
        "Bearer zyxwvutsrqponmlkjihg"
    ],
    misc: {
        privateKey: "myUltraSensitiveKey12345678",
        pwd: "plainTextPassword"
    }
};

// --| Add placeholder
const options: PiiMaskerOptions = { placeholder: "🔒", maskChar: "#" };
const maskedWithEmoji = hidePii(payload, options);

console.log(maskedWithEmoji);

// --| OR default "[REDACTED]"
console.log(hidePii(payload));
```

## Output "[REDACTED]" with no mask character specified

```javascript
{
  user: {
    id: 'usr_12345',
    email: 'jo*****@test.com',
    password: '[REDACTED]',
    profile: { ipv4: '**********', backupEmail: 'su*****@company.org' }
  },
  billing: { creditCard: '**********', backupCard: '**********' },
  auth: {
    apiKey: '[REDACTED]',
    authToken: '[REDACTED]',
    bearer: 'Bearer **********0'
  },
  infrastructure: { mongo: '**********', postgres: '**********', redis: '**********' },
  logs: [
    'User jo*****@test.com logged in from ********',
    'Attempt with card **********',
    'Bearer **********0'
  ],
  misc: { privateKey: '[REDACTED]', pwd: '[REDACTED]' }
}
```

## Output custom placeholder and custom mask character

```javascript
{
  user: {
    id: 'usr_12345',
    email: 'jo#####@test.com',
    password: '🔒',
    profile: { ipv4: '###########', backupEmail: 'su#####@company.org' }
  },
  billing: { creditCard: '################', backupCard: '################' },
  auth: '🔒',
  infrastructure: {
    mongo: '#############################################',
    postgres: '##########################################',
    redis: '###################################'
  },
  logs: [
    'User jo#####@test.com logged in from ########',
    'Attempt with card ################',
    'Bearer ##########'
  ],
  misc: { privateKey: '🔒', pwd: '🔒' }
}
```
