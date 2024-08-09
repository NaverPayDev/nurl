import NURL from './nurl'

describe('NURL', () => {
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

            expect(nurl.href).toBe('https://example.com/users/123?sort=asc&filter=active')
            expect(nurl.pathname).toBe('/users/123')
            expect(nurl.search).toBe('?sort=asc&filter=active')
        })

        test('should handle empty query object', () => {
            const nurl = new NURL({
                pathname: '/path',
                query: {},
            })

            expect(nurl.href).toBe('https://example.com/path')
            expect(nurl.search).toBe('')
        })

        test('should throw error if dynamic segment is not provided in query', () => {
            expect(() => {
                // 에러 던지는게 맞을까?
                // eslint-disable-next-line
                new NURL({
                    baseUrl: 'https://example.com',
                    pathname: '/users/:id',
                    query: {},
                })
            }).toThrow('Missing query parameter for dynamic segment: id')
        })
    })

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
