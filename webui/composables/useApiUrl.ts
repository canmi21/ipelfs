// composables/useApiUrl.ts

const API_BASE_URL = 'http://localhost:33330'

/**
 * RelativeURL -> AbsoluteURL
 * @param relativeUrl e.g, '/v1/ipelfs/socket'
 * @returns full url
 */
export function getAbsoluteApiUrl(relativeUrl: string): string {
  try {
    const absoluteUrl = new URL(relativeUrl, API_BASE_URL)
    return absoluteUrl.href
  } catch (error) {
    console.error(
      `Error constructing absolute API URL for relative path "${relativeUrl}" with base "${API_BASE_URL}":`,
      error,
    )
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
    const endpoint = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`
    return `${baseUrl}${endpoint}`
  }
}
