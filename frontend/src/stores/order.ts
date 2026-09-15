import { defineStore } from 'pinia'
import { getStorage, setStorage } from '@/utils/storage'
import type { Order } from './types'

const KEY_ORDERS = 'all_orders'

/** 后台订单管理的兜底种子数据 */
const SEED_ORDERS: Order[] = [
  { orderId: 'ORD-2025070101', user: 'traveler01', spot: '成都大熊猫繁育研究基地', date: '2025-07-05', quantity: 2, price: 55, total: 110, status: 'paid' },
  { orderId: 'ORD-2025070102', user: 'hiker_pro', spot: '都江堰', date: '2025-07-06', quantity: 1, price: 80, total: 80, status: 'pending' },
]

/** 订单状态 → 中文文案 */
export const ORDER_STATUS_TEXT: Record<string, string> = {
  paid: '已支付',
  pending: '待支付',
  cancelled: '已取消',
}

/** 订单状态 → Element Plus tag 类型 */
export const ORDER_STATUS_TAG: Record<string, string> = {
  paid: 'success',
  pending: 'warning',
  cancelled: 'info',
}

export const useOrderStore = defineStore('order', {
  state: () => ({
    list: getStorage<Order[]>(KEY_ORDERS, []),
    loaded: false,
  }),

  getters: {
    /** 按创建时间倒序（新订单在前） */
    sorted: (state): Order[] =>
      [...state.list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),

    /** 某个用户的订单 */
    byUser: (state) => (username: string): Order[] =>
      state.list.filter(o => o.user === username),

    /** 已支付订单的总成交额 */
    totalRevenue: (state): number =>
      state.list.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.total || 0), 0),

    /** 今日新增订单数 */
    todayCount: (state): number => {
      const start = new Date().setHours(0, 0, 0, 0)
      return state.list.filter(o => (o.createdAt || 0) >= start).length
    },
  },

  actions: {
    /** 载入订单；首次为空时写入种子数据，保证后台页面不空白 */
    load(force = false) {
      if (this.loaded && !force) return
      const stored = getStorage<Order[] | null>(KEY_ORDERS, null)
      if (!stored || !Array.isArray(stored) || stored.length === 0) {
        this.list = JSON.parse(JSON.stringify(SEED_ORDERS))
        this.persist()
      } else {
        this.list = stored
      }
      this.loaded = true
    },

    loadRaw() {
      this.list = getStorage<Order[]>(KEY_ORDERS, [])
    },

    persist() {
      setStorage(KEY_ORDERS, this.list)
    },

    /**
     * 下单。统一生成 orderId 并写回存储。
     * 这是此前散落在 AttractionsView 里的逻辑，收拢到 store 后
     * 任何入口下单都会走同一套编号与字段规则。
     */
    createOrder(input: {
      username: string
      spot: string
      date: string
      quantity: number
      price: number
      status?: Order['status']
    }): Order {
      const order: Order = {
        orderId: `ORD-${Date.now()}`,
        user: input.username,
        spot: input.spot,
        date: input.date,
        quantity: input.quantity,
        price: input.price,
        total: Math.round(input.price * input.quantity * 100) / 100,
        status: input.status || 'paid',
        createdAt: Date.now(),
      }
      const list = getStorage<Order[]>(KEY_ORDERS, [])
      list.unshift(order)
      setStorage(KEY_ORDERS, list)
      this.list = list
      return order
    },

    /** 新增/覆盖订单（后台） */
    upsertOrder(order: Order) {
      const idx = this.list.findIndex(o => o.orderId === order.orderId)
      if (idx === -1) {
        this.list.unshift(order)
      } else {
        this.list[idx] = { ...order }
      }
      this.persist()
    },

    /** 修改状态：前台取消、后台确认支付/取消都走这里 */
    setStatus(orderId: string, status: Order['status']) {
      const target = this.list.find(o => o.orderId === orderId)
      if (!target) return
      target.status = status
      this.persist()
    },

    /** 直接改字段（后台编辑弹窗用） */
    updateOrder(orderId: string, payload: Partial<Order>) {
      const idx = this.list.findIndex(o => o.orderId === orderId)
      if (idx === -1) return
      this.list[idx] = {
        ...this.list[idx],
        ...payload,
        total: payload.total ?? Math.round((payload.quantity ?? this.list[idx].quantity) * (payload.price ?? this.list[idx].price) * 100) / 100,
      }
      this.persist()
    },

    removeOrder(orderId: string) {
      this.list = this.list.filter(o => o.orderId !== orderId)
      this.persist()
    },

    /** 状态文案/标签的便捷方法，供模板直接调用 */
    statusText(status: string): string {
      return ORDER_STATUS_TEXT[status] || status
    },
    statusTag(status: string): string {
      return ORDER_STATUS_TAG[status] || 'info'
    },
  },
})
