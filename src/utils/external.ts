import NURL from '../nurl'
import {extractPathKey, getPathPriority, isDynamicPath, refinePathnameWithQuery} from './internal'

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
