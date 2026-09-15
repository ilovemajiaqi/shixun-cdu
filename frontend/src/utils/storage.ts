/**
 * localStorage 读写工具。
 *
 * 该模块只负责「序列化 + 容错」，不承载业务语义。
 * 业务数据统一由 src/stores 下的 Pinia store 管理，store 内部调用这里的函数做持久化。
 */

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

/**
 * Serializes and writes a value to localStorage.
 * Returns false when storage is unavailable (Safari private mode / quota exceeded).
 */
export const setStorage = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.warn(`Failed to write "${key}" to localStorage:`, e)
    return false
  }
}

/**
 * Removes a key from localStorage.
 */
export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.warn(`Failed to remove "${key}" from localStorage:`, e)
  }
}
