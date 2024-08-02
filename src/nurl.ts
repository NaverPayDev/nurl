export default class NURL implements URL {
    private _url: URL

    constructor(url: string | URL) {
        this._url = new URL(url)
    }

    get href(): string {
        return this._url.href
    }

    set href(value: string) {
        this._url.href = value
    }

    get protocol(): string {
        return this._url.protocol
    }

    set protocol(value: string) {
        this._url.protocol = value
    }

    get host(): string {
        return this._url.host
    }

    set host(value: string) {
        this._url.host = value
    }

    get hostname(): string {
        return this._url.hostname
    }

    set hostname(value: string) {
        this._url.hostname = value
    }

    get port(): string {
        return this._url.port
    }

    set port(value: string) {
        this._url.port = value
    }

    get pathname(): string {
        return this._url.pathname
    }

    set pathname(value: string) {
        this._url.pathname = value
    }

    get search(): string {
        return this._url.search
    }

    set search(value: string) {
        this._url.search = value
    }

    get searchParams(): URLSearchParams {
        return this._url.searchParams
    }

    get hash(): string {
        return this._url.hash
    }

    set hash(value: string) {
        this._url.hash = value
    }

    get origin(): string {
        return this._url.origin
    }

    get username(): string {
        return this._url.username
    }

    set username(value: string) {
        this._url.username = value
    }

    get password(): string {
        return this._url.password
    }

    set password(value: string) {
        this._url.password = value
    }

    toString(): string {
        return this._url.toString()
    }

    toJSON(): string {
        return this._url.toJSON()
    }
}
