/**
 * 全局共享的领域类型。
 * 单一数据源：store 与视图组件都从这里取类型，避免各处重复声明。
 */

/** 景点（前台展示 + 后台管理共用同一份结构） */
export interface Attraction {
  id: number
  name: string
  region: string
  description: string
  price: number
  openTime: string
  rating: number
  commentCount: number
  mainImage: string
  images: string[]
  /** 上下架状态：1 上架 / 0 下架，仅后台使用 */
  status?: number
}

/** 地图打卡点位（含经纬度） */
export interface MapSpot {
  id: number
  name: string
  desc: string
  coords: [number, number]
}

/** 推荐路线 */
export interface RecommendedRoute {
  id: number
  name: string
  tag: string
  desc: string
  duration: string
  distance: string
  /** 途经景点的 id 序列，顺序即游览顺序 */
  path: number[]
}

/** 用户保存的自定义路线 */
export interface UserRoute {
  id: number
  name: string
  date: string
  path: number[]
}

/** 订单 */
export interface Order {
  orderId: string
  user: string
  spot: string
  date: string
  quantity: number
  price: number
  total: number
  status: 'paid' | 'pending' | 'cancelled'
  createdAt?: number
}

/** 当前登录用户 */
export interface UserProfile {
  username: string
  email?: string
  role?: string
  token?: string
  avatar?: string
}

/** 注册用户（后台用户管理） */
export interface RegisteredUser {
  id: number
  username: string
  email: string
  password?: string
  role: string
  status: string
  registerDate: string
  avatar: string
}

/** 收藏条目（前台卡片展示用的精简结构） */
export interface FavoriteItem {
  id: number
  name: string
  desc: string
  image: string
}
