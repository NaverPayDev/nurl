import NURL from '../nurl'

const DYNAMIC_PATH_COLON_REGEXP = /^:/
const DYNAMIC_PATH_BRACKETS_REGEXP = /^\[.*\]$/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Query = Record<string, any>

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

        const queryValue = acc[pathKey]
        if (typeof queryValue !== 'string') {
            return acc
        }

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

/**
 * Get path priority representation, dynamic paths are represented as '1' and static paths as '2'.
 * Used for matching the most specific route.
 *
 * @param {string} pathname
 * @returns {string} path priority representation
 *
 * @example getPathPriority('/user/:id/profile') -> '212'
 * @example getPathPriority('/user/admin/:tab') -> '221'
 */
export function getPathPriority(pathname: string): string {
    const segments = pathname.split('/').filter(Boolean)

    return segments.map((segment) => (isDynamicPath(segment) ? '1' : '2')).join('')
}

export const match = (url: string, pattern: string): Record<string, string> | null => {
    if (!NURL.canParse(url) || !NURL.canParse(pattern)) {
        return null
    }

    const urlSegments = url.split(/[?#]/)[0]?.split('/').filter(Boolean) || []
    const patternSegments = pattern.split(/[?#]/)[0]?.split('/').filter(Boolean) || []

    if (urlSegments.length !== patternSegments.length) {
        return null
    }

    const params: Record<string, string> = {}

    for (let i = 0; i < patternSegments.length; i++) {
        const patternSegment = patternSegments[i]
        const urlSegment = urlSegments[i]

        if (isDynamicPath(patternSegment)) {
            const pathKey = extractPathKey(patternSegment)
            params[pathKey] = urlSegment
        } else if (patternSegment !== urlSegment) {
            return null
        }
    }

    return params
}

export interface MaskOptions {
    patterns: string[]
    sensitiveParams: string[]
    maskChar?: string
    maskLength?: number
    preserveLength?: boolean
}

export const mask = (
    url: string,
    {patterns, sensitiveParams, maskChar = '*', maskLength = 4, preserveLength = false}: MaskOptions,
) => {
    const sortedPatterns = [...patterns].sort((a, b) => (getPathPriority(b) > getPathPriority(a) ? 1 : -1))
    for (const pattern of sortedPatterns) {
        const urlObj = NURL.create(url)
        const matchedParams = match(urlObj.pathname, pattern)
        if (!matchedParams) {
            continue
        }
        sensitiveParams.forEach((sensitiveParam) => {
            if (sensitiveParam in matchedParams) {
                const originalValue = matchedParams[sensitiveParam]
                const lengthToMask = preserveLength ? originalValue.length : maskLength
                matchedParams[sensitiveParam] = maskChar.repeat(lengthToMask)
            }
        })

        urlObj.pathname = refinePathnameWithQuery(pattern, matchedParams)
        return urlObj.toString()
    }

    return url
}
