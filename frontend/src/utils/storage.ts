
/**
 * Safely parses a JSON string.
 * @param value The string to parse
 * @param fallback The fallback value if parsing fails
 * @returns The parsed object or the fallback value
 */
export const safeJSONParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch (e) {
    console.warn('JSON parse error, using fallback:', e)
    return fallback
  }
}

/**
 * Safely gets and parses an item from localStorage
 */
export const getStorage = <T>(key: string, fallback: T): T => {
  const item = localStorage.getItem(key)
  return safeJSONParse(item, fallback)
}
