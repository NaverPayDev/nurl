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
    private _searchParams: URLSearchParams = new URLSearchParams()

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

    constructor(url?: string | URL) {
        this._searchParams = new URLSearchParams()
        if (url) {
            this.href = url.toString()
        }
    }

    get href(): string {
        return this._href
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
        this._host = value
        const [hostname, port] = value.split(':')
        this._hostname = hostname
        this._port = port || ''
        this.updateHref()
    }

    get hostname(): string {
        return this._hostname
    }

    set hostname(value: string) {
        this._hostname = value
        this._host = this._port ? `${value}:${this._port}` : value
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

    set pathname(value: string) {
        this._pathname = value.startsWith('/') ? value : `/${value}`
        this.updateHref()
    }

    get search(): string {
        return this._search
    }

    set search(value: string) {
        this._search = value.startsWith('?') ? value : `?${value}`
        this._searchParams = new URLSearchParams(value)
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
        this._href = `${this._protocol}//${this._username}${this._password ? ':' + this._password : ''}${
            this._username || this._password ? '@' : ''
        }${this._hostname}${this._port ? ':' + this._port : ''}${this._pathname}${this._search}${this._hash}`
        this._origin = `${this._protocol}//${this._hostname}${this._port ? ':' + this._port : ''}`
    }

    toString(): string {
        return this._href
    }

    toJSON(): string {
        return this._href
    }
}
