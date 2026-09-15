import { defineStore } from 'pinia'
import { getStorage, setStorage } from '@/utils/storage'
import type { RecommendedRoute, UserRoute } from './types'

const KEY_ROUTES = 'routes_data'
const KEY_USER_ROUTES = 'user_routes'

export const DEFAULT_ROUTES: RecommendedRoute[] = [
  {
    id: 1,
    name: '天府经典一日游',
    tag: '热门',
    desc: '一线串联宽窄巷子、人民公园与锦里古街，上午喝茶掏耳朵、傍晚看红灯夜市，半天读懂成都的生活底色。',
    duration: '6-8小时',
    distance: '9.2',
    path: [1, 6, 2],
  },
  {
    id: 2,
    name: '熊猫与古迹深度线',
    tag: '亲子',
    desc: '清晨赶在熊猫最活跃的时段进基地，午后转入武侯祠与杜甫草堂，一天之内看完自然与人文两条脉络。',
    duration: '7-9小时',
    distance: '12.6',
    path: [5, 3, 4],
  },
  {
    id: 3,
    name: '世界遗产双遗游',
    tag: '风光',
    desc: '都江堰看两千年水利智慧，青城山登道家幽静山林，两处世界遗产同日打卡，适合体力较好的游客。',
    duration: '全天',
    distance: '58.0',
    path: [7, 8],
  },
  {
    id: 4,
    name: '夜色与川剧之旅',
    tag: '休闲',
    desc: '傍晚从人民公园出发，锦里看灯、川剧中心看变脸吐火，以一场两小时的演出收尾，夜间动线不赶路。',
    duration: '4-5小时',
    distance: '6.4',
    path: [6, 2, 10],
  },
]

export const useRouteStore = defineStore('route', {
  state: () => ({
    /** 运营配置的推荐路线（后台可维护） */
    recommended: [] as RecommendedRoute[],
    /** 当前正在编辑的自定义路线（地图上点选的景点顺序） */
    customRoute: [] as { id: number; name: string; coords: [number, number] }[],
    /** 用户保存过的自定义路线 */
    saved: getStorage<UserRoute[]>(KEY_USER_ROUTES, []),
    loaded: false,
  }),

  getters: {
    /** 自定义路线在地图上连线的坐标序列 */
    customRouteCoords: (state): [number, number][] => state.customRoute.map(s => s.coords),

    /** 自定义路线预估耗时（小时），按每站 1.5h 估算 */
    estimatedHours: (state): number => state.customRoute.length * 1.5,

    /** 是否满足保存条件（至少两站） */
    canSave: (state): boolean => state.customRoute.length >= 2,

    /** 按 id 查已保存路线 */
    savedById: (state) => (id: number): UserRoute | undefined =>
      state.saved.find(r => r.id === id),
  },

  actions: {
    /** 载入推荐路线；无记录时写入默认数据 */
    load(force = false) {
      if (this.loaded && !force) return
      const stored = getStorage<RecommendedRoute[] | null>(KEY_ROUTES, null)
      if (!stored || !Array.isArray(stored)) {
        this.recommended = JSON.parse(JSON.stringify(DEFAULT_ROUTES))
        this.persist()
      } else {
        this.recommended = stored
      }
      this.loaded = true
    },

    persist() {
      setStorage(KEY_ROUTES, this.recommended)
    },

    /** ---------- 后台路线维护 ---------- */

    addRoute(payload: Partial<RecommendedRoute>) {
      const nextId = this.recommended.length ? Math.max(...this.recommended.map(r => r.id)) + 1 : 1
      this.recommended.push({
        id: nextId,
        name: payload.name || '未命名路线',
        tag: payload.tag || '热门',
        desc: payload.desc || '',
        duration: payload.duration || '',
        distance: payload.distance || '0',
        path: payload.path || [],
      })
      this.persist()
    },

    updateRoute(id: number, payload: Partial<RecommendedRoute>) {
      const idx = this.recommended.findIndex(r => r.id === id)
      if (idx === -1) return
      this.recommended[idx] = { ...this.recommended[idx], ...payload }
      this.persist()
    },

    removeRoute(id: number) {
      this.recommended = this.recommended.filter(r => r.id !== id)
      this.persist()
    },

    /** ---------- 自定义路线 ---------- */

    /** 追加一个景点；已存在时返回 false */
    addSpot(spot: { id: number; name: string; coords: [number, number] }): boolean {
      if (this.customRoute.find(s => s.id === spot.id)) return false
      this.customRoute.push(spot)
      return true
    },

    removeSpotAt(index: number) {
      this.customRoute.splice(index, 1)
    },

    clearCustomRoute() {
      this.customRoute = []
    },

    /** 把推荐路线展开为自定义路线（按 path 顺序还原景点） */
    loadRecommendedToCustom(route: RecommendedRoute, allSpots: { id: number; name: string; coords: [number, number] }[]) {
      this.customRoute = route.path
        .map(id => allSpots.find(s => s.id === id))
        .filter(Boolean) as { id: number; name: string; coords: [number, number] }[]
    },

    /** 保存当前自定义路线到用户路线列表，返回新路线 id */
    saveCustomRoute(): number {
      const id = Date.now()
      const item: UserRoute = {
        id,
        name: '我的自定义路线',
        date: new Date().toLocaleString(),
        path: this.customRoute.map(s => s.id),
      }
      const list = getStorage<UserRoute[]>(KEY_USER_ROUTES, [])
      list.unshift(item)
      setStorage(KEY_USER_ROUTES, list)
      this.saved = list
      return id
    },

    /** 重新从存储读取用户路线（跨页面/标签页同步） */
    loadSaved() {
      this.saved = getStorage<UserRoute[]>(KEY_USER_ROUTES, [])
    },

    removeSaved(id: number) {
      const list = getStorage<UserRoute[]>(KEY_USER_ROUTES, []).filter(r => r.id !== id)
      setStorage(KEY_USER_ROUTES, list)
      this.saved = list
    },
  },
})
