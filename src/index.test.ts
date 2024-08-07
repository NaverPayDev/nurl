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

    describe('new NURL({ baseUrl, pathname, query })', () => {})

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
