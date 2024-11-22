import {QueryValue} from './types'

const DYNAMIC_PATH_COLON_REGEXP = /^:/
const DYNAMIC_PATH_BRACKETS_REGEXP = /^\[.*\]$/

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
 * @param {Record<string, string>} query
 * @returns {string} refined pathname
 */
export function refinePathnameWithQuery(pathname: string, query: Record<string, QueryValue>): string {
    return getDynamicPaths(pathname).reduce((acc, path) => {
        const pathKey = extractPathKey(path)
        return query[pathKey] && typeof query[pathKey] === 'string' ? acc.replace(path, query[pathKey]) : acc
    }, pathname)
}

/**
 * Removes queries that have already been used in the pathname.
 * @param {string} pathname
 * @param {Record<string, string>} query
 * @returns {Record<string, string>} refined query
 */
export function refineQueryWithPathname(
    pathname: string,
    query: Record<string, QueryValue>,
): Record<string, QueryValue> {
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
