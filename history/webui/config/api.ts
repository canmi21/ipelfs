// Default base URL for the backend
const DEFAULT_BACKEND_BASE_URL = 'http://localhost:33330/'

/**
 * Gets the current configured backend base URL.
 * This can be extended in the future to read from localStorage or other config sources.
 * @returns {string} The backend base URL.
 */
export function getBackendBaseUrl(): string {
  // Currently returns the default value directly
  // TODO: Future enhancement could allow user configuration or read from other sources
  return DEFAULT_BACKEND_BASE_URL
}

/**
 * Builds a full API endpoint URL.
 * @param {string} path - The path of the API endpoint (e.g., '/v1/ipelfs/ua' or 'v1/ipelfs/ua').
 * @returns {string} The full API URL.
 */
export function buildApiUrl(path: string): string {
  const base = getBackendBaseUrl()

  // Ensure the base URL ends with a single slash
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base

  // Ensure the path starts with a single slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  // Corrected return statement using proper JavaScript template literal syntax
  return `${cleanBase}${cleanPath}`
}
