---
"@naverpay/nurl": major
---

🔧 Fix pathname handling and href generation in NURL class

- Previously, when creating an NURL instance with an explicitly empty string ('') for the pathname, the resulting URL automatically defaulted to a root path ('/'). This behavior was inconsistent with the native JavaScript URL object, which retains an empty pathname as-is, resulting in a URL consisting only of query parameters.

```javascript
// as-is
// Input
const url = new NURL({ pathname: '', query: { test: '1' } });

// Output
url.href === '/?test=1';

// to-be
// Input
const url = new NURL({ pathname: '', query: { test: '1' } });

// Output
url.href === '?test=1';
```

- Previously, assigning an empty string ('') to the pathname property via setter retained the existing pathname. However, to align with the native JavaScript URL object’s behavior, assigning an empty string now explicitly clears the pathname.

```javascript
// Before 
url.pathname = ''; // pathname remained '/hello'

// After (new default behavior):
url.pathname = ''; // pathname becomes '', resulting in removal of '/hello'
```

PR: [🔧 Fix pathname handling and href generation in NURL class](https://github.com/NaverPayDev/nurl/pull/65)
