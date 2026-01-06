<h1 align="center">@naverpay/nurl</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@naverpay/nurl">
    <img src="https://img.shields.io/npm/v/@naverpay/nurl.svg?style=flat" alt="npm version">
  </a>
  <a href="https://bundlephobia.com/result?p=@naverpay/nurl">
    <img src="https://badgen.net/bundlephobia/minzip/@naverpay/nurl" alt="minzipped size">
  </a>
</p>

NURL is a powerful URL manipulation library that extends the standard URL class. It provides dynamic segment processing and flexible URL creation capabilities.

## Features

- Extends and implements the URL class
- Supports various URL creation methods (string, URL object, custom options object)
- Provides a factory function NURL.create() for creating instances without the new keyword
- Dynamic segment processing functionality
- Setters behave differently from the standard URL
- Provides decoded hostname for IDN (Internationalized Domain Names) support

## Usage

### Basic Usage

```javascript
import {NURL} from 'nurl'

// Create URL from string
const url1 = new NURL('https://example.com/users/123?name=John')

// Create URL from existing URL object
const standardUrl = new URL('https://example.com')
const url2 = new NURL(standardUrl)

// Create URL from custom options object
const url3 = new NURL({
    baseUrl: 'https://example.com',
    pathname: '/users/:id',
    query: {id: '123', name: 'John'},
})

// Create empty URL
const url4 = new NURL()

// Using the factory function
const url5 = NURL.create('https://example.com')

// The factory function also works with options object
const url6 = NURL.create({
    baseUrl: 'https://example.com',
    pathname: '/users/:id',
    query: {id: '123', name: 'John'},
})
```

### Dynamic Segment Processing

NURL processes dynamic segments in the pathname and replaces them with values from the query object. If a dynamic segment doesn't have a corresponding query value, it remains unchanged in the pathname without any encoding:

```javascript
const url = new NURL({
    baseUrl: 'https://api.example.com',
    pathname: '/users/:a/posts/[b]/[c]',
    query: {
        a: '123',
        b: '456',
        format: 'json',
    },
})

console.log(url.href)
// Output: https://api.example.com/users/123/posts/456/[c]?format=json
```

### IDN Support

NURL automatically handles Internationalized Domain Names:

```javascript
const url = new NURL('https://한글.도메인')
console.log(url.hostname) // xn--bj0bj06e.xn--hq1bm8jm9l
console.log(url.decodedHostname) // 한글.도메인 (in human-readable format)
```

### URL Pattern Matching

NURL supports `NURL.match(url, pattern)` static method to match a URL path against a pattern with dynamic segments:

```tsx
NURL.match('/v1/user/12345/info', '/v1/user/:userId/info')
// → { userId: '12345' }

NURL.match('/v1/friends/SENDMONEY/block/111/222', '/v1/friends/:serviceCode/block/:nidNo/:friendNidNo')
// → { serviceCode: 'SENDMONEY', nidNo: '111', friendNidNo: '222' }

NURL.match('/v1/user/12345', '/v1/admin/:id')
// → null (no match)
```

### Masking Path Parameters

NURL provides `NURL.mask(url, options)` static method to mask sensitive path parameters in a URL for logging purposes:

```tsx
// Default masking (**** with length 4)
NURL.mask('/v1/user/12345/info', {
    patterns: ['/v1/user/:userId/info'],
    sensitiveParams: ['userId'],
})
// → '/v1/user/****/info'

// Custom mask character and length
NURL.mask('/v1/user/12345/info', {
    patterns: ['/v1/user/[userId]/info'],
    sensitiveParams: ['userId'],
    maskChar: 'X',
    maskLength: 6,
})
// → '/v1/user/XXXXXX/info'

// Preserve original value length
NURL.mask('/v1/user/12345/info', {
    patterns: ['/v1/user/:userId/info'],
    sensitiveParams: ['userId'],
    preserveLength: true,
})
// → '/v1/user/*****/info' (5 chars, same as '12345')

// Multiple sensitive params
NURL.mask('/v1/friends/SENDMONEY/block/12345/67890', {
    patterns: ['/v1/friends/:serviceCode/block/[nidNo]/:friendNidNo'],
    sensitiveParams: ['nidNo', 'friendNidNo'],
    preserveLength: true,
})
// → '/v1/friends/SENDMONEY/block/*****/*****' (5 and 5 chars)
```

## API

### `constructor(input?: string | URL | URLOptions)`

- `input`: Can be one of the following:
  - `string`: Standard URL string
  - `URL`: Standard URL object
  - `URLOptions`: Custom options object that extends `Partial<URL>` and includes:
    - `baseUrl?: string`: Optional base URL string
    - `query?: Record<string, string>`: Optional object for query parameters
    - Can include any property from the standard URL object (e.g., `pathname`, `protocol`, etc.)

### Dynamic Segments

- Supports `:paramName` or `[paramName]` format in the pathname.
- If a corresponding key exists in the query object or URLOptions, the dynamic segment is replaced with its value.
- If a corresponding key does not exist, the dynamic segment remains unchanged in the pathname without throwing an error.

### Properties

NURL inherits all properties from the standard URL class:

- `href`, `origin`, `protocol`, `username`, `password`, `host`, `hostname`, `port`, `pathname`, `search`, `searchParams`, `hash`

### Methods

- `toString()`: Returns the URL as a string
- `toJSON()`: Returns the URL as a JSON representation

### Static Methods

- `NURL.create(input?: string | URL | URLOptions): NURL`
  - Factory function to create a NURL instance without the `new` keyword.
- `NURL.canParse(url: string): boolean`
  - Checks if the given string can be parsed as a valid URL.
- `NURL.match(url: string, pattern: string): Record<string, string> | null`
  - Matches a URL path against a pattern with dynamic segments and returns an object with extracted parameters or `null` if no match.
- `NURL.mask(url: string, options: MaskOptions): string`
  - Masks sensitive path parameters in a URL based on the provided options.
  - `MaskOptions`:
    - `patterns: string[]`: Array of URL patterns with dynamic segments.
    - `sensitiveParams: string[]`: Array of path parameters to be masked.
    - `maskChar?: string`: Character used for masking (default: `'*'`).
    - `maskLength?: number`: Length of the mask (default: `4`).
    - `preserveLength?: boolean`: If true, mask length matches original value length (overrides `maskLength`).

## Important Notes

1. NURL's setter methods behave differently from the standard URL. They are designed to consider dynamic segment and query parameter replacement functionality.
2. When created with no arguments, all properties are initialized as empty strings.
3. When using `URLOptions`, if a query value corresponding to a dynamic segment is missing, the dynamic segment remains unchanged in the pathname.
4. Dynamic segments only support the `:paramName` or `[paramName]` format.

## Differences from Standard URL

1. **Constructor Flexibility**: NURL can create a URL from a string, URL object, or custom options object.
2. **Empty URL Creation**: NURL can create an empty URL when called with no arguments.
3. **Dynamic Segments**: NURL supports dynamic segments in the pathname.
4. **Setter Behavior**: NURL's setter methods behave differently from the standard URL, considering dynamic segment processing and query parameter replacement.
