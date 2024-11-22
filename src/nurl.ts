/**
 * Note: We use 'npm-punycode' alias instead of 'punycode/' to properly support dual packages in ESM.
 * This ensures that this third-party module is used instead of the built-in
 * Node.js 'punycode' module, which has been deprecated since Node.js v7.0.0.
 * @see https://github.com/mathiasbynens/punycode.js#installation
 * @see https://nodejs.org/api/punycode.html for deprecation info
 */
import punycode from 'npm-punycode'

import {QueryValue} from './types'
import {
    extractPathKey,
    getDynamicPaths,
    isASCIICodeChar,
    isDynamicPath,
    refinePathnameWithQuery,
    refineQueryWithPathname,
} from './utils'

interface URLOptions
    extends Partial<
        Pick<
            URL,
            | 'href'
            | 'protocol'
            | 'host'
            | 'hostname'
            | 'port'
            | 'pathname'
            | 'search'
            | 'hash'
            | 'username'
            | 'password'
        >
    > {
    baseUrl?: string
    query?: Record<string, QueryValue>
}

export default class NURL implements URL {
    private _href: string = ''
    private _protocol: string = ''
    private _host: string = ''
    private _hostname: string = ''
    private _port: string = ''
    private _pathname: string = ''
    private _search: string = ''
    private _hash: string = ''
    private _origin: string = ''
    private _username: string = ''
    private _password: string = ''
    private _baseUrl: string = ''
    private _searchParams: URLSearchParams = new URLSearchParams()

    constructor(input?: string | URL | URLOptions) {
        this._searchParams = new URLSearchParams()
        if (typeof input === 'string' || input instanceof URL) {
            this.href = input.toString()
        } else if (input) {
            if (input.baseUrl) {
                this.baseUrl = input.baseUrl
            }
            if (input.href) {
                this.href = input.href
            }
            if (input.protocol) {
                this.protocol = input.protocol
            }
            if (input.host) {
                this.host = input.host
            }
            if (input.hostname) {
                this.hostname = input.hostname
            }
            if (input.port) {
                this.port = input.port
            }
            if (input.pathname) {
                this.pathname = refinePathnameWithQuery(input.pathname, input.query ?? {})
            }
            if (input.search) {
                this.search = input.search
            }
            if (input.hash) {
                this.hash = input.hash
            }
            if (input.username) {
                this.username = input.username
            }
            if (input.password) {
                this.password = input.password
            }
            if (input.query) {
                const refinedQuery = refineQueryWithPathname(input.pathname ?? '', input.query)
                if (Object.keys(refinedQuery).length > 0) {
                    this.search = new URLSearchParams(refinedQuery).toString()
                }
            }
            this.updateHref()
        }
    }

    static create(input?: string | URL | URLOptions) {
        return new NURL(input)
    }

    static canParse(input: string): boolean {
        if (input.startsWith('/')) {
            return /^\/[^?#]*(\?[^#]*)?(#.*)?$/.test(input)
        }

        try {
            // eslint-disable-next-line no-new
            new URL(input)
            return true
        } catch {
            // URL 생성자로 파싱할 수 없는 경우, 추가적인 검사를 수행
            // 예: 'example.com' 또는 'example.com/path'와 같은 형식 허용
            return /^[^:/?#]+(\.[^:/?#]+)+(\/[^?#]*(\?[^#]*)?(#.*)?)?$/.test(input)
        }
    }

    get baseUrl(): string {
        return this._baseUrl
    }

    set baseUrl(value: string) {
        this._baseUrl = value
        try {
            const url = new URL(value)
            this._protocol = url.protocol
            this._host = url.host
            this._hostname = url.hostname
            this._port = url.port
            this._origin = url.origin
            this._username = url.username
            this._password = url.password
            if (url.pathname !== '/') {
                this._pathname = url.pathname
            }
            if (url.search) {
                this._search = url.search
                this._searchParams = new URLSearchParams(url.search)
            }
            if (url.hash) {
                this._hash = url.hash
            }
            this.updateHref()
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn(`Invalid baseUrl: ${value}`, error)
        }
    }

    get href(): string {
        return this.pathname.length === 1 ? `${this._href}/` : this._href
    }

    set href(value: string) {
        try {
            const url = new URL(value)
            this._href = url.href
            this._protocol = url.protocol
            this._host = url.host
            this._hostname = url.hostname
            this._port = url.port
            this._pathname = url.pathname
            this._search = url.search
            this._hash = url.hash
            this._origin = url.origin
            this._username = url.username
            this._password = url.password
            this._searchParams = url.searchParams
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn(`Can not parse ${value}`, error)
        }
    }

    get protocol(): string {
        return this._protocol
    }

    set protocol(value: string) {
        this._protocol = value
        this.updateHref()
    }

    get host(): string {
        return this._host
    }

    set host(value: string) {
        const [hostname, port] = value.split(':')

        const encodedHostname = this.encodeHostname(hostname)

        this._host = port ? `${encodedHostname}:${port}` : encodedHostname
        this._hostname = encodedHostname
        this._port = port || ''
        this.updateHref()
    }

    get hostname(): string {
        return this._hostname
    }

    set hostname(value: string) {
        const encodedHostname = this.encodeHostname(value)

        this._hostname = encodedHostname
        this._host = this._port ? `${encodedHostname}:${this._port}` : encodedHostname
        this.updateHref()
    }

    get port(): string {
        return this._port
    }

    set port(value: string) {
        this._port = value
        this._host = `${this._hostname}${value ? ':' + value : ''}`
        this.updateHref()
    }

    get pathname(): string {
        return this._pathname
    }

    set pathname(pathname: string) {
        const encodedPathname = pathname
            .split('/')
            .map((segment) => (isDynamicPath(segment) ? segment : encodeURI(segment)))
            .join('/')

        this._pathname = encodedPathname.startsWith('/') ? encodedPathname : `/${encodedPathname}`
        this.updateHref()
    }

    get search(): string {
        return this._search
    }

    set search(search: string) {
        this._search = search.startsWith('?') ? search : `?${search}`
        this._searchParams = new URLSearchParams(search)
        this.updateHref()
    }

    setSearchParams(_params: Record<string, string>): void {
        const searchParams = new URLSearchParams(_params)

        this._search = searchParams.toString() ? `?${searchParams.toString()}` : ''
        this._searchParams = searchParams
        this.updateHref()
    }

    appendSearchParams(_params: Record<string, string>): void {
        const searchParams = new URLSearchParams(this._searchParams)
        const dynamicRoutes = getDynamicPaths(this._pathname).map(extractPathKey)

        Object.keys(_params).forEach((key) => {
            if (dynamicRoutes.includes(key)) {
                this._pathname = refinePathnameWithQuery(this._pathname, {[key]: _params[key]})
            } else {
                searchParams.append(key, _params[key])
            }
        })

        this._search = searchParams.toString() ? `?${searchParams.toString()}` : ''
        this._searchParams = searchParams
        this.updateHref()
    }

    removeSearchParams(..._keys: string[]): void {
        const searchParams = new URLSearchParams(this._searchParams)

        _keys.forEach((key) => {
            searchParams.delete(key)
        })

        this._search = searchParams.toString() ? `?${searchParams.toString()}` : ''
        this._searchParams = searchParams
        this.updateHref()
    }

    get searchParams(): URLSearchParams {
        return new Proxy(this._searchParams, {
            get: (target, prop, receiver) => {
                const value = Reflect.get(target, prop, receiver)
                if (typeof value === 'function') {
                    return (...args: unknown[]) => {
                        const result = value.apply(target, args)
                        this._search = this._searchParams.toString() ? `?${this._searchParams.toString()}` : ''
                        this.updateHref()
                        return result
                    }
                }
                return value
            },
        })
    }

    get hash(): string {
        return this._hash
    }

    set hash(value: string) {
        this._hash = value.startsWith('#') ? value : `#${value}`
        this.updateHref()
    }

    get origin(): string {
        return this._origin
    }

    get username(): string {
        return this._username
    }

    set username(value: string) {
        this._username = value
        this.updateHref()
    }

    get password(): string {
        return this._password
    }

    set password(value: string) {
        this._password = value
        this.updateHref()
    }

    private updateHref() {
        if (this._baseUrl) {
            const baseUrl = new URL(this._baseUrl)
            baseUrl.pathname = this._pathname
            baseUrl.search = this._search
            baseUrl.hash = this._hash
            this._href = baseUrl.href
            this._origin = baseUrl.origin
        } else {
            this._href = `${this._protocol}${this._protocol && '//'}${this._username}${this._password ? ':' + this._password : ''}${
                this._username || this._password ? '@' : ''
            }${this._hostname}${this._port ? ':' + this._port : ''}${this._pathname === '/' ? '' : this._pathname}${this._search}${this._hash}`

            this._origin = `${this._protocol}//${this._hostname}${this._port ? ':' + this._port : ''}`
        }
    }

    toString(): string {
        return this.href
    }

    toJSON(): string {
        return this.href
    }

    private punycodePrefix = 'xn--'

    private encodeHostname(hostname: string): string {
        return hostname
            .split('.')
            .map((segment) => {
                for (const char of segment) {
                    if (isASCIICodeChar(char)) {
                        return `${this.punycodePrefix}${punycode.encode(segment)}`
                    }
                }
                return segment
            })
            .join('.')
    }

    get decodedIDN(): string {
        let href = this._href

        this._hostname.split('.').forEach((segment) => {
            href = href.replace(segment, punycode.decode(segment.replace(this.punycodePrefix, '')))
        })

        return href
    }

    get decodedHostname(): string {
        return this._hostname
            .split('.')
            .map((segment) => punycode.decode(segment.replace(this.punycodePrefix, '')))
            .join('.')
    }
}
