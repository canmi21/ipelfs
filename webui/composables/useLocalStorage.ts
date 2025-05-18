// composables/useLocalStorage.ts

const IS_CLIENT = typeof window !== 'undefined'

/**
 * Retrieves a value from localStorage.
 * If the key does not exist, sets the key to the defaultValue, stores it, and returns the defaultValue.
 * @param key The key of the item to retrieve.
 * @param defaultValue The default value to return and store if the key is not found.
 * @returns The retrieved value or the default value.
 */
export function getValueFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (IS_CLIENT && window.localStorage) {
    try {
      const serializedValue = window.localStorage.getItem(key)
      if (serializedValue !== null) {
        return JSON.parse(serializedValue) as T
      } else {
        window.localStorage.setItem(key, JSON.stringify(defaultValue))
        return defaultValue
      }
    } catch {
      // Fallback: try to set and return default value in case of parsing error of existing corrupt data
      try {
        window.localStorage.setItem(key, JSON.stringify(defaultValue))
      } catch {}
      return defaultValue
    }
  }
  // Fallback for non-browser environments or if localStorage is unavailable
  return defaultValue
}

/**
 * Stores a value in localStorage.
 * If the value is null or undefined, the item is removed from localStorage.
 * @param key The key under which to store the value.
 * @param value The value to store.
 */
export function setValueInLocalStorage<T>(key: string, value: T): void {
  if (IS_CLIENT && window.localStorage) {
    try {
      if (value === null || value === undefined) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch {}
  }
}
