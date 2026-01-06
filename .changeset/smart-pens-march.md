---
"@naverpay/nurl": minor
---

feat: add `NURL.match()` and `NURL.mask()` static methods

- `NURL.match(url, pattern)`: Match URL path against a pattern with dynamic segments and extract parameters
- `NURL.mask(url, options)`: Mask sensitive path parameters in a URL for logging purposes
