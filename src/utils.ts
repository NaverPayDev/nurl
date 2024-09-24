const DYNAMIC_PATH_COLON_REGEXP = /^:/
const DYNAMIC_PATH_BRACKETS_REGEXP = /^\[.*\]$/

function getDynamicPaths(pathname: string): string[] {
    return pathname
        .split('/')
        .map((path) => (DYNAMIC_PATH_COLON_REGEXP.test(path) || DYNAMIC_PATH_BRACKETS_REGEXP.test(path) ? path : null))
        .filter((x) => x !== null)
}

function extractPathKey(path: string): string {
    return path.slice(1, DYNAMIC_PATH_COLON_REGEXP.test(path) ? undefined : -1)
}

/**
 * Replaces dynamic paths in the pathname with values from the query
 * @param {string} pathname
 * @param {Record<string, string>} query
 * @returns {string} refined pathname
 */
export function refinePathnameWithQuery(pathname: string, query: Record<string, string>): string {
    return getDynamicPaths(pathname).reduce((acc, path) => {
        const pathKey = extractPathKey(path)
        return query[pathKey] ? acc.replace(path, query[pathKey]) : acc
    }, pathname)
}

/**
 * Removes queries that have already been used in the pathname.
 * @param {string} pathname
 * @param {Record<string, string>} query
 * @returns {Record<string, string>} refined query
 */
export function refineQueryWithPathname(pathname: string, query: Record<string, string>): Record<string, string> {
    return getDynamicPaths(pathname).reduce((acc, path) => {
        const pathKey = extractPathKey(path)
        const {[pathKey]: _, ...remainingQuery} = acc
        return remainingQuery
    }, query)
}
