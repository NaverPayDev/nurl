import NURL from './nurl'

describe('NURL', () => {
    describe('Constructor', () => {
        describe('new NURL("")', () => {
            test('should initialize with empty string', () => {
                const nurl = new NURL('')

                expect(nurl.href).toBe('')
                expect(nurl.protocol).toBe('')
                expect(nurl.host).toBe('')
                expect(nurl.hostname).toBe('')
                expect(nurl.port).toBe('')
                expect(nurl.pathname).toBe('')
                expect(nurl.search).toBe('')
                expect(nurl.hash).toBe('')
                expect(nurl.origin).toBe('')
                expect(nurl.username).toBe('')
                expect(nurl.password).toBe('')
                expect(nurl.searchParams.toString()).toBe('')
            })

            test('should initialize with undefined', () => {
                const nurl = new NURL()

                expect(nurl.href).toBe('')
                expect(nurl.protocol).toBe('')
                expect(nurl.host).toBe('')
                expect(nurl.hostname).toBe('')
                expect(nurl.port).toBe('')
                expect(nurl.pathname).toBe('')
                expect(nurl.search).toBe('')
                expect(nurl.hash).toBe('')
                expect(nurl.origin).toBe('')
                expect(nurl.username).toBe('')
                expect(nurl.password).toBe('')
                expect(nurl.searchParams.toString()).toBe('')
            })

            test('should allow setting properties after empty initialization', () => {
                const nurl = new NURL('')

                nurl.href = 'https://example.com/path?query=value#hash'

                expect(nurl.href).toBe('https://example.com/path?query=value#hash')
                expect(nurl.protocol).toBe('https:')
                expect(nurl.host).toBe('example.com')
                expect(nurl.hostname).toBe('example.com')
                expect(nurl.pathname).toBe('/path')
                expect(nurl.search).toBe('?query=value')
                expect(nurl.hash).toBe('#hash')
            })

            test('should handle invalid URLs gracefully', () => {
                const nurl = new NURL('invalid-url')

                expect(nurl.href).toBe('')
                expect(nurl.protocol).toBe('')
                expect(nurl.host).toBe('')
                expect(nurl.hostname).toBe('')
                expect(nurl.port).toBe('')
                expect(nurl.pathname).toBe('')
                expect(nurl.search).toBe('')
                expect(nurl.hash).toBe('')
                expect(nurl.origin).toBe('')
                expect(nurl.username).toBe('')
                expect(nurl.password).toBe('')
                expect(nurl.searchParams.toString()).toBe('')
            })
        })

        describe('new NURL(stringOrURL)', () => {
            test('should create an instance with the same behavior as URL', () => {
                const urlString = 'https://example.com:8080/path/to/page?query=value#hash'
                const url = new URL(urlString)
                const nurl = new NURL(urlString)

                expect(nurl.toString()).toBe(url.toString())
                expect(nurl.href).toBe(url.href)
                expect(nurl.origin).toBe(url.origin)
                expect(nurl.protocol).toBe(url.protocol)
                expect(nurl.username).toBe(url.username)
                expect(nurl.password).toBe(url.password)
                expect(nurl.host).toBe(url.host)
                expect(nurl.hostname).toBe(url.hostname)
                expect(nurl.port).toBe(url.port)
                expect(nurl.pathname).toBe(url.pathname)
                expect(nurl.search).toBe(url.search)
                expect(nurl.searchParams.toString()).toBe(url.searchParams.toString())
                expect(nurl.hash).toBe(url.hash)
            })

            test('should update properties correctly', () => {
                const urlString = 'https://example.com/path'
                const nurl = new NURL(urlString)
                const url = new URL(urlString)

                nurl.protocol = 'http:'
                url.protocol = 'http:'
                expect(nurl.protocol).toBe(url.protocol)

                nurl.hostname = 'newexample.com'
                url.hostname = 'newexample.com'
                expect(nurl.hostname).toBe(url.hostname)

                nurl.port = '8080'
                url.port = '8080'
                expect(nurl.port).toBe(url.port)

                nurl.pathname = '/newpath'
                url.pathname = '/newpath'
                expect(nurl.pathname).toBe(url.pathname)

                nurl.search = '?newquery=newvalue'
                url.search = '?newquery=newvalue'
                expect(nurl.search).toBe(url.search)

                nurl.hash = '#newhash'
                url.hash = '#newhash'
                expect(nurl.hash).toBe(url.hash)
            })

            test('should handle special cases', () => {
                const urlString = 'https://user:pass@example.com:8080/path?query=value#hash'
                const nurl = new NURL(urlString)
                const url = new URL(urlString)

                expect(nurl.username).toBe(url.username)
                expect(nurl.password).toBe(url.password)

                nurl.username = 'newuser'
                url.username = 'newuser'
                expect(nurl.username).toBe(url.username)

                nurl.password = 'newpass'
                url.password = 'newpass'
                expect(nurl.password).toBe(url.password)
            })

            test('should handle searchParams operations', () => {
                const urlString = 'https://example.com/path?query=value'
                const nurl = new NURL(urlString)
                const url = new URL(urlString)

                nurl.searchParams.append('newParam', 'newValue')
                url.searchParams.append('newParam', 'newValue')
                expect(nurl.search).toBe(url.search)

                nurl.searchParams.delete('query')
                url.searchParams.delete('query')
                expect(nurl.search).toBe(url.search)

                nurl.searchParams.set('updatedParam', 'updatedValue')
                url.searchParams.set('updatedParam', 'updatedValue')
                expect(nurl.search).toBe(url.search)
            })
        })

        describe('new NURL({ baseUrl, pathname, query })', () => {
            test('should create a URL with baseUrl and pathname', () => {
                const nurl = new NURL({
                    baseUrl: 'https://example.com',
                    pathname: '/path',
                })

                expect(nurl.href).toBe('https://example.com/path')
                expect(nurl.origin).toBe('https://example.com')
                expect(nurl.pathname).toBe('/path')
            })

            test('should add query parameters', () => {
                const nurl = new NURL({
                    baseUrl: 'https://example.com',
                    pathname: '/path',
                    query: {key: 'value', another: 'param'},
                })

                expect(nurl.href).toBe('https://example.com/path?key=value&another=param')
                expect(nurl.search).toBe('?key=value&another=param')
            })

            test('should replace /:id with query parameter', () => {
                const nurl = new NURL({
                    baseUrl: 'https://example.com',
                    pathname: '/users/:id',
                    query: {id: '123'},
                })

                expect(nurl.href).toBe('https://example.com/users/123')
                expect(nurl.pathname).toBe('/users/123')
            })

            test('should replace /[id] with query parameter', () => {
                const nurl = new NURL({
                    baseUrl: 'https://example.com',
                    pathname: '/posts/[id]/comments',
                    query: {id: '456'},
                })

                expect(nurl.href).toBe('https://example.com/posts/456/comments')
                expect(nurl.pathname).toBe('/posts/456/comments')
            })

            test('should handle multiple dynamic segments', () => {
                const nurl = new NURL({
                    baseUrl: 'https://example.com',
                    pathname: '/users/:userId/posts/:postId',
                    query: {userId: '789', postId: '101112'},
                })

                expect(nurl.href).toBe('https://example.com/users/789/posts/101112')
                expect(nurl.pathname).toBe('/users/789/posts/101112')
            })

            test('should keep query parameters not used in pathname', () => {
                const nurl = new NURL({
                    pathname: '/users/:id',
                    query: {id: '123', sort: 'asc', filter: 'active'},
                })

                expect(nurl.href).toBe('/users/123?sort=asc&filter=active')
                expect(nurl.pathname).toBe('/users/123')
                expect(nurl.search).toBe('?sort=asc&filter=active')
            })

            test('should handle empty query object', () => {
                const nurl = new NURL({
                    pathname: '/path',
                    query: {},
                })

                expect(nurl.href).toBe('/path')
                expect(nurl.search).toBe('')
            })

            test('should throw error if dynamic segment is not provided in query', () => {
                expect(() => {
                    // eslint-disable-next-line no-new
                    new NURL({
                        baseUrl: 'https://example.com',
                        pathname: '/users/:id',
                        query: {},
                    })
                }).toThrow('Missing query parameter for dynamic segment: id')
            })
        })
    })

    describe('Static methods', () => {
        describe('NURL.canParse', () => {
            test.each([
                ['https://example.com', true],
                ['https://example.com/path?query=value#hash', true],
                ['http://localhost:3000', true],
                ['ftp://ftp.example.com', true],
                ['mailto:user@example.com', true],
                ['/path/to/resource', true],
                ['/path/to/resource?query=value', true],
                ['/path/to/resource#hash', true],
                ['example.com', true],
                ['example.com/path', true],
                ['subdomain.example.com/path?query=value#hash', true],
                ['invalid-url', false],
                ['http://', false],
                ['', false],
            ])('should return %p for %s', (input, expected) => {
                expect(NURL.canParse(input)).toBe(expected)
            })
        })
    })

    describe('Extended functionality', () => {
        describe('Constructor and basic operations', () => {
            test('should create NURL from string', () => {
                const url = new NURL('https://example.com/path?query=value#hash')
                expect(url.href).toBe('https://example.com/path?query=value#hash')
            })

            test('should create NURL from URLOptions', () => {
                const url = new NURL({
                    baseUrl: 'https://example.com',
                    pathname: '/path',
                    query: {key: 'value'},
                })
                expect(url.href).toBe('https://example.com/path?key=value')
            })

            test('should handle dynamic segments in pathname', () => {
                const url = new NURL({
                    baseUrl: 'https://api.example.com',
                    pathname: '/users/:id/posts/:postId',
                    query: {id: '123', postId: '456', filter: 'recent'},
                })
                expect(url.pathname).toBe('/users/123/posts/456')
                expect(url.search).toBe('?filter=recent')
            })
        })

        describe('Property getters and setters', () => {
            test('should update href when changing properties', () => {
                const url = new NURL('https://example.com')
                url.pathname = '/newpath'
                url.search = 'key=value'
                url.hash = 'newhash'
                expect(url.href).toBe('https://example.com/newpath?key=value#newhash')
            })

            test('should update searchParams when changing search', () => {
                const url = new NURL('https://example.com')
                url.search = 'key1=value1&key2=value2'
                expect(url.searchParams.get('key1')).toBe('value1')
                expect(url.searchParams.get('key2')).toBe('value2')
            })
        })

        describe.skip('Search Parameters Operations', () => {
            describe('setSearchParams', () => {
                test('should set multiple search parameters', () => {
                    const url = new NURL('https://example.com')
                    url.setSearchParams({key1: 'value1', key2: 'value2'})
                    expect(url.search).toBe('?key1=value1&key2=value2')
                })

                test('should override existing search parameters', () => {
                    const url = new NURL('https://example.com?old=param')
                    url.setSearchParams({new: 'value', another: 'param'})
                    expect(url.search).toBe('?new=value&another=param')
                })

                test('should handle empty object', () => {
                    const url = new NURL('https://example.com?existing=value')
                    url.setSearchParams({})
                    expect(url.search).toBe('')
                })

                test('should handle special characters', () => {
                    const url = new NURL('https://example.com')
                    url.setSearchParams({'special=char': 'value&with=symbols'})
                    expect(url.search).toBe('?special%3Dchar=value%26with%3Dsymbols')
                })

                test('should handle Korean characters', () => {
                    const url = new NURL('https://example.com')
                    url.setSearchParams({한글키: '한글값'})
                    expect(url.search).toBe('?%ED%95%9C%EA%B8%80%ED%82%A4=%ED%95%9C%EA%B8%80%EA%B0%92')
                })
            })

            describe('appendSearchParams', () => {
                test('should add new search parameters', () => {
                    const url = new NURL('https://example.com?existing=value')
                    url.appendSearchParams({new: 'param'})
                    expect(url.search).toBe('?existing=value&new=param')
                })

                test('should not override existing parameters', () => {
                    const url = new NURL('https://example.com?key=value1')
                    url.appendSearchParams({key: 'value2'})
                    expect(url.searchParams.getAll('key')).toEqual(['value1', 'value2'])
                })

                test('should handle multiple parameters', () => {
                    const url = new NURL('https://example.com')
                    url.appendSearchParams({key1: 'value1', key2: 'value2'})
                    expect(url.search).toBe('?key1=value1&key2=value2')
                })

                test('should handle empty object', () => {
                    const url = new NURL('https://example.com?existing=value')
                    url.appendSearchParams({})
                    expect(url.search).toBe('?existing=value')
                })

                test('should handle special characters', () => {
                    const url = new NURL('https://example.com')
                    url.appendSearchParams({'special=char': 'value&with=symbols'})
                    expect(url.search).toBe('?special%3Dchar=value%26with%3Dsymbols')
                })

                test('should handle Korean characters', () => {
                    const url = new NURL('https://example.com?existing=value')
                    url.appendSearchParams({한글키: '한글값'})
                    expect(url.search).toBe('?existing=value&%ED%95%9C%EA%B8%80%ED%82%A4=%ED%95%9C%EA%B8%80%EA%B0%92')
                })
            })

            describe('removeSearchParam', () => {
                test('should remove specified search parameter', () => {
                    const url = new NURL('https://example.com?key1=value1&key2=value2')
                    url.removeSearchParam('key1')
                    expect(url.search).toBe('?key2=value2')
                })

                test('should handle non-existent parameter', () => {
                    const url = new NURL('https://example.com?existing=value')
                    url.removeSearchParam('nonexistent')
                    expect(url.search).toBe('?existing=value')
                })

                test('should handle multiple parameters', () => {
                    const url = new NURL('https://example.com?key1=value1&key2=value2&key3=value3')
                    url.removeSearchParam('key1', 'key3')
                    expect(url.search).toBe('?key2=value2')
                })

                test('should handle all parameters removal', () => {
                    const url = new NURL('https://example.com?key1=value1&key2=value2')
                    url.removeSearchParam('key1', 'key2')
                    expect(url.search).toBe('')
                })

                test('should handle Korean characters', () => {
                    const url = new NURL(
                        'https://example.com?existing=value&%ED%95%9C%EA%B8%80%ED%82%A4=%ED%95%9C%EA%B8%80%EA%B0%92',
                    )
                    url.removeSearchParam('한글키')
                    expect(url.search).toBe('?existing=value')
                })
            })

            describe('Complex scenarios', () => {
                test('should handle a series of operations', () => {
                    const url = new NURL('https://example.com')
                    url.setSearchParams({initial: 'value'})
                    url.appendSearchParams({added: 'later'})
                    url.removeSearchParam('initial')
                    url.appendSearchParams({'new=param': 'complex&value'})
                    expect(url.search).toBe('?added=later&new%3Dparam=complex%26value')
                })

                test('should handle setting, appending, and removing Korean parameters', () => {
                    const url = new NURL('https://example.com')
                    url.setSearchParams({키1: '값1', 키2: '값2'})
                    url.appendSearchParams({키3: '값3'})
                    url.removeSearchParam('키2')
                    expect(url.searchParams.get('키1')).toBe('값1')
                    expect(url.searchParams.has('키2')).toBe(false)
                    expect(url.searchParams.get('키3')).toBe('값3')
                })
            })
        })

        describe.skip('Edge cases and error handling', () => {
            test('should handle URLs with auth info', () => {
                const url = new NURL('https://user:pass@example.com')
                expect(url.username).toBe('user')
                expect(url.password).toBe('pass')
            })

            test('should handle IPv6 addresses', () => {
                const url = new NURL('http://[2001:db8::1]:8080/path')
                expect(url.hostname).toBe('[2001:db8::1]')
                expect(url.port).toBe('8080')
            })

            test('should handle very long URLs', () => {
                const longPath = 'a'.repeat(2000)
                const url = new NURL(`https://example.com/${longPath}`)
                expect(url.pathname.length).toBe(2001) // Including leading slash
            })

            test('should handle invalid input gracefully', () => {
                const url = new NURL('invalid-url')
                expect(url.href).toBe('')
                expect(url.protocol).toBe('')
                expect(url.hostname).toBe('')
            })
        })

        describe.skip('Internationalization support', () => {
            test('should handle Korean IDN hostnames', () => {
                const originalDomain = '한글도메인.테스트'
                const url = new NURL(`https://${originalDomain}`)
                expect(url.href.includes('xn--')).toBe(true)
                expect(url.hostname).not.toBe(originalDomain)
                expect(url.hostname.startsWith('xn--')).toBe(true)
                expect(url.decodedHostname).toBe(originalDomain)
            })

            test('should handle Korean characters in pathname and search', () => {
                const originalPath = '/한글경로'
                const originalSearch = '검색어=값'
                const url = new NURL(`https://example.com${originalPath}?${originalSearch}`)
                expect(url.pathname).not.toBe(originalPath)
                expect(url.search).not.toBe(`?${originalSearch}`)
                expect(decodeURIComponent(url.pathname)).toBe(originalPath)
                expect(decodeURIComponent(url.search)).toBe(`?${originalSearch}`)
            })

            test('should properly encode and decode Korean characters', () => {
                const originalPath = '/한글/경로'
                const url = new NURL(`https://example.com${originalPath}`)
                expect(url.pathname).not.toBe(originalPath)
                expect(decodeURIComponent(url.pathname)).toBe(originalPath)
            })

            test('should handle complex Korean URLs', () => {
                const originalURL = 'https://사용자:비밀번호@한글주소.한국/경로/테스트?키=값#부분'
                const url = new NURL(originalURL)
                expect(url.href).not.toBe(originalURL)
                expect(decodeURIComponent(url.decodedIDN)).toBe(originalURL)
                expect(decodeURIComponent(url.username)).toBe('사용자')
                expect(decodeURIComponent(url.password)).toBe('비밀번호')
                expect(url.hostname).not.toBe('한글주소.한국')
                expect(url.hostname.startsWith('xn--')).toBe(true)
                expect(url.decodedHostname).toBe('한글주소.한국')
                expect(decodeURIComponent(url.pathname)).toBe('/경로/테스트')
                expect(decodeURIComponent(url.search)).toBe('?키=값')
                expect(decodeURIComponent(url.hash)).toBe('#부분')
            })

            test('should correctly handle Korean characters in searchParams', () => {
                const url = new NURL('https://example.com')
                const key = '한글키'
                const value = '한글값'
                url.searchParams.append(key, value)
                expect(url.search).not.toBe(`?${key}=${value}`)
                expect(url.search.includes('%')).toBe(true)
                expect(decodeURIComponent(url.search)).toBe(`?${key}=${value}`)
                expect(url.searchParams.get(key)).toBe(value)
            })
        })
    })
})
