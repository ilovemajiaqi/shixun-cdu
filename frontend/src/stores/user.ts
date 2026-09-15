import { defineStore } from 'pinia'
import { getStorage, setStorage, removeStorage } from '@/utils/storage'
import type { UserProfile, RegisteredUser } from './types'

const KEY_USER = 'user'
const KEY_TOKEN = 'token'
const KEY_ADMIN_TOKEN = 'admin_token'
const KEY_ADMIN_USER = 'admin_user'
const KEY_REGISTERED = 'registered_users'
const KEY_FAVORITES = 'user_favorites'

/** 后台用户管理页的兜底种子数据 */
const SEED_USERS: RegisteredUser[] = [
  { id: 1001, username: 'traveler01', email: 'user1@example.com', role: 'user', status: 'active', registerDate: '2025-05-12', avatar: '', password: 'password' },
  { id: 1002, username: 'hiker_pro', email: 'hiker@example.com', role: 'user', status: 'banned', registerDate: '2025-06-01', avatar: '', password: 'password' },
  { id: 1003, username: 'admin', email: 'admin@chengdu.com', role: 'admin', status: 'active', registerDate: '2025-01-01', avatar: '', password: 'admin' },
]

export const useUserStore = defineStore('user', {
  state: () => ({
    /** 当前登录用户，未登录时为空对象 */
    profile: getStorage<UserProfile>(KEY_USER, {} as UserProfile),
    /** 后台管理员 token */
    adminToken: getStorage<string>(KEY_ADMIN_TOKEN, ''),
    /** 后台管理员信息 */
    adminUser: getStorage<UserProfile | null>(KEY_ADMIN_USER, null),
    /** 注册用户列表（后台用户管理的数据源） */
    registeredUsers: [] as RegisteredUser[],
    /** 收藏的景点 */
    favorites: getStorage<any[]>(KEY_FAVORITES, []),
    /** 用户保存的自定义路线 ID 列表仅用于计数展示 */
    _loadedRegistered: false,
  }),

  getters: {
    /** 是否已登录（判断依据与路由守卫保持一致：存在 user 记录） */
    isLoggedIn: (state): boolean => !!state.profile.username,
    /** 是否已登录后台 */
    isAdmin: (state): boolean => !!state.adminToken,
    username: (state): string => state.profile.username || '',
    /** 收藏的景点 id 集合，供列表页快速判断 */
    favoriteIds: (state): number[] => state.favorites.map((f: any) => f.id),
  },

  actions: {
    /** 登录成功后写入用户信息 */
    setProfile(profile: UserProfile) {
      this.profile = { ...this.profile, ...profile }
      setStorage(KEY_USER, this.profile)
    },

    /** 退出登录 */
    logout() {
      this.profile = {} as UserProfile
      removeStorage(KEY_USER)
      removeStorage(KEY_TOKEN)
    },

    /** 更新昵称/邮箱/头像，并同步到注册用户表 */
    updateProfile(patch: Partial<UserProfile>) {
      this.profile = { ...this.profile, ...patch }
      setStorage(KEY_USER, this.profile)
      this.syncToRegistered()
    },

    /** 后台登录 */
    setAdminLogin(token: string, admin: UserProfile) {
      this.adminToken = token
      this.adminUser = admin
      setStorage(KEY_ADMIN_TOKEN, token)
      setStorage(KEY_ADMIN_USER, admin)
    },

    /** 后台退出 */
    adminLogout() {
      this.adminToken = ''
      this.adminUser = null
      removeStorage(KEY_ADMIN_TOKEN)
      removeStorage(KEY_ADMIN_USER)
    },

    /** ---------- 注册用户管理 ---------- */

    /** 加载注册用户；首次加载会补齐种子数据与缺失字段 */
    loadRegisteredUsers(force = false) {
      if (this._loadedRegistered && !force) return
      let data = getStorage<RegisteredUser[]>(KEY_REGISTERED, [])

      SEED_USERS.forEach(seed => {
        if (!data.find(u => u.username === seed.username)) {
          data.push({ ...seed })
        }
      })

      data = data.map(u => ({
        ...u,
        id: u.id || Date.now() + Math.random(),
        role: u.role || 'user',
        status: u.status || 'active',
        registerDate: u.registerDate || new Date().toLocaleDateString(),
        avatar: u.avatar || '',
      }))

      this.registeredUsers = data
      this._loadedRegistered = true
      this.persistRegisteredUsers()
    },

    persistRegisteredUsers() {
      setStorage(KEY_REGISTERED, this.registeredUsers)
    },

    /** 把当前登录用户的信息同步回注册用户表（改昵称/邮箱/头像时调用） */
    syncToRegistered() {
      if (!this.profile.username) return
      const list = getStorage<RegisteredUser[]>(KEY_REGISTERED, [])
      const idx = list.findIndex(u => u.username === this.profile.username)
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          username: this.profile.username,
          email: this.profile.email ?? list[idx].email,
          avatar: this.profile.avatar || list[idx].avatar || '',
        }
        setStorage(KEY_REGISTERED, list)
        if (this._loadedRegistered) {
          this.registeredUsers = list
        }
      }
    },

    /** ---------- 收藏 ---------- */

    loadFavorites() {
      this.favorites = getStorage<any[]>(KEY_FAVORITES, [])
    },

    isFavorite(id: number): boolean {
      return this.favoriteIds.includes(id)
    },

    /** 切换收藏；返回 true 表示「已收藏」，false 表示「已取消」 */
    toggleFavorite(spot: { id: number; name: string; description?: string; desc?: string; mainImage?: string; image?: string }): boolean {
      const list = getStorage<any[]>(KEY_FAVORITES, [])
      const idx = list.findIndex((f: any) => f.id === spot.id)
      let added: boolean
      if (idx > -1) {
        list.splice(idx, 1)
        added = false
      } else {
        list.push({
          id: spot.id,
          name: spot.name,
          desc: spot.description || spot.desc || '',
          image: spot.mainImage || spot.image || '',
        })
        added = true
      }
      setStorage(KEY_FAVORITES, list)
      this.favorites = list
      return added
    },

    removeFavorite(id: number) {
      const list = getStorage<any[]>(KEY_FAVORITES, []).filter((f: any) => f.id !== id)
      setStorage(KEY_FAVORITES, list)
      this.favorites = list
    },
  },
})
