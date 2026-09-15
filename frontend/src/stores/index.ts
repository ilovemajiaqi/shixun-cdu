/**
 * 全局 store 入口。
 * 视图统一从 '@/stores' 引入，避免散落的相对路径。
 */
export { useUserStore } from './user'
export { useAttractionStore, DEFAULT_ATTRACTIONS } from './attraction'
export { useRouteStore, DEFAULT_ROUTES } from './route'
export { useOrderStore, ORDER_STATUS_TEXT, ORDER_STATUS_TAG } from './order'
export * from './types'
