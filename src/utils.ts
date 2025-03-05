const DYNAMIC_PATH_COLON_REGEXP = /^:/
const DYNAMIC_PATH_BRACKETS_REGEXP = /^\[.*\]$/

export type Query = Record<string, string | number | boolean | (string | number | boolean)[]>

export function isDynamicPath(path: string) {
    return DYNAMIC_PATH_COLON_REGEXP.test(path) || DYNAMIC_PATH_BRACKETS_REGEXP.test(path)
}

export function getDynamicPaths(pathname: string): string[] {
    return pathname.split('/').filter(isDynamicPath)
}

export function extractPathKey(path: string): string {
    return path.slice(1, DYNAMIC_PATH_COLON_REGEXP.test(path) ? undefined : -1)
}

/**
 * Replaces dynamic paths in the pathname with values from the query
 * @param {string} pathname
 * @param {Query} query
 * @returns {string} refined pathname
 */
export function refinePathnameWithQuery(pathname: string, query: Query): string {
    return getDynamicPaths(pathname).reduce((acc, path) => {
        const pathKey = extractPathKey(path)

        const queryValue = query[pathKey]
        return queryValue && typeof queryValue === 'string' ? acc.replace(path, queryValue) : acc
    }, pathname)
}

/**
 * Removes queries that have already been used in the pathname.
 * @param {string} pathname
 * @param {Query} query
 * @returns {Query} refined query
 */
export function refineQueryWithPathname(pathname: string, query: Query): Query {
    return getDynamicPaths(pathname).reduce((acc, path) => {
        const pathKey = extractPathKey(path)
        const {[pathKey]: _, ...remainingQuery} = acc
        return remainingQuery
    }, query)
}

const MAX_ASCII_CODE = 127
export function isASCIICodeChar(char: string) {
    return char.charCodeAt(0) > MAX_ASCII_CODE
}

function isValidPrimitive(value: unknown): boolean {
    return ['string', 'number', 'boolean'].includes(typeof value)
}

/**
 * Convert queries to array, if they are not of the defined primitive types, they will not be included in the array.
 * @param {string} pathname
 * @param {Query} query
 * @returns {string[][]} refined query
 */
export function convertQueryToArray(query: Query): string[][] {
    return Object.entries(query).flatMap(([key, value]) => {
        if (isValidPrimitive(value)) {
            return [[key, String(value)]]
        }

        if (Array.isArray(value) && value.every(isValidPrimitive)) {
            return value.map((v) => [key, String(v)])
        }

        return []
    })
}
