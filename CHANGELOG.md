# @naverpay/nurl

## 1.0.0

### Major Changes

-   393bd3d: 🔧 Fix pathname handling and href generation in NURL class

    -   Previously, when creating an NURL instance with an explicitly empty string ('') for the pathname, the resulting URL automatically defaulted to a root path ('/'). This behavior was inconsistent with the native JavaScript URL object, which retains an empty pathname as-is, resulting in a URL consisting only of query parameters.

    ```javascript
    // as-is
    // Input
    const url = new NURL({pathname: '', query: {test: '1'}})

    // Output
    url.href === '/?test=1'

    // to-be
    // Input
    const url = new NURL({pathname: '', query: {test: '1'}})

    // Output
    url.href === '?test=1'
    ```

    -   Previously, assigning an empty string ('') to the pathname property via setter retained the existing pathname. However, to align with the native JavaScript URL object’s behavior, assigning an empty string now explicitly clears the pathname.

    ```javascript
    // Before
    url.pathname = '' // pathname remained '/hello'

    // After (new default behavior):
    url.pathname = '' // pathname becomes '', resulting in removal of '/hello'
    ```

    PR: [🔧 Fix pathname handling and href generation in NURL class](https://github.com/NaverPayDev/nurl/pull/65)

## 0.1.1

### Patch Changes

-   21a57e7: Update Query type to use more flexible

    PR: [Update Query type to use more flexible](https://github.com/NaverPayDev/nurl/pull/60)

## 0.1.0

### Minor Changes

-   fa4eec3: string 으로 인스턴스 생성시 baseUrl 과 pathname 이 생략된 url 을 지정가능하도록 합니다.

    PR: [string 으로 인스턴스 생성시 baseUrl 과 pathname 이 생략된 url 을 지정가능하도록 합니다.](https://github.com/NaverPayDev/nurl/pull/55)

### Patch Changes

-   fce2c49: fix declaration file bug with pite

    PR: [fix declaration file bug with pite](https://github.com/NaverPayDev/nurl/pull/59)

## 0.0.12

### Patch Changes

-   0764534: 🐛 fix wrong options

    PR: [🐛 fix wrong options](https://github.com/NaverPayDev/nurl/pull/52)

## 0.0.11

### Patch Changes

-   fa088d0: query 타입을 확장합니다.

    PR: [query 타입을 확장합니다.](https://github.com/NaverPayDev/nurl/pull/50)

## 0.0.10

### Patch Changes

-   7d58a89: 🔧 build with pite

    PR: [🔧 build with pite](https://github.com/NaverPayDev/nurl/pull/48)

## 0.0.9

### Patch Changes

-   0e6c484: Add basePath Support to NURL Class with Duplicate Prevention

## 0.0.8

### Patch Changes

-   1047b48: 🚚 punycode 를 내재화합니다.

## 0.0.7

### Patch Changes

-   d2cc84e: [사용하는 값만 받도록 생성자 파라미터 타입 변경](https://github.com/NaverPayDev/nurl/pull/37)

## 0.0.6

### Patch Changes

-   95cf37d: - search 파라미터 이중 인코딩 제거 https://github.com/NaverPayDev/nurl/pull/35

## 0.0.5

### Patch Changes

-   9d429a1: [#31] 💩 esm 에서도 punycode cjs 동작하도록 변경

## 0.0.4

### Patch Changes

-   57b65f2: 잘못 지워진 빌드 스텝 추가

## 0.0.3

### Patch Changes

-   3b4ad06: esm 에서 동작하기 위한 dependency alias 적용 https://github.com/NaverPayDev/nurl/pull/26
