import { defineStore } from 'pinia'
import { getStorage, setStorage } from '@/utils/storage'
import type { Attraction, MapSpot } from './types'

const KEY_ATTRACTIONS = 'attractions_data'

/**
 * 成都 10 个景点。这里是**唯一**的默认数据源：
 * 前台 AttractionsView 与后台 AttractionManagement 都从本 store 读取，
 * 从而消除此前「两处各自硬编码、改一处漏一处」的同步隐患。
 */
export const DEFAULT_ATTRACTIONS: Attraction[] = [
  {
    id: 1,
    name: '宽窄巷子',
    region: '市区经典',
    description: '由宽巷子、窄巷子、井巷子三条平行老街组成，是成都遗留下来的较成规模的清朝古街道。青砖黛瓦、门头匾额保存完好，如今聚合成茶馆、川剧变脸小剧场、手作市集与川味小吃摊，闲坐一下午便是最地道的成都节奏。',
    price: 0,
    openTime: '全天开放',
    rating: 4.8,
    commentCount: 3260,
    mainImage: '/images/chengdu/kuanzhai.jpg',
    images: ['/images/chengdu/lanterns.jpg', '/images/chengdu/city-night.jpg'],
    status: 1,
  },
  {
    id: 2,
    name: '锦里古街',
    region: '市区经典',
    description: '紧邻武侯祠的仿古商业街，以三国文化与成都民俗为主题。夜幕降临时数百盏红灯次第亮起，皮影戏、糖画、三大炮与张飞牛肉的摊子沿街铺开，被称为“成都版清明上河图”。',
    price: 0,
    openTime: '全天开放（夜间灯光最佳）',
    rating: 4.7,
    commentCount: 4100,
    mainImage: '/images/chengdu/jinli.jpg',
    images: ['/images/chengdu/lanterns.jpg', '/images/chengdu/night-market.jpg'],
    status: 1,
  },
  {
    id: 3,
    name: '武侯祠',
    region: '市区经典',
    description: '全国影响最大的三国遗迹博物馆，纪念诸葛亮与蜀汉群臣，由惠陵、汉昭烈庙、武侯祠三部分组成。红墙夹道与翠竹相映，是成都最具人文厚度的一处封地。',
    price: 50,
    openTime: '08:00 - 18:00',
    rating: 4.7,
    commentCount: 2890,
    mainImage: '/images/chengdu/wuhouci.jpg',
    images: ['/images/chengdu/tower.jpg', '/images/chengdu/garden-lush.jpg'],
    status: 1,
  },
  {
    id: 4,
    name: '杜甫草堂',
    region: '市区经典',
    description: '唐代诗人杜甫流寓成都时的故居，在此写下《茅屋为秋风所破歌》等名篇。园内梅竹成林、水榭回廊交错，是闹市中少见的一处清幽园林。',
    price: 50,
    openTime: '08:00 - 18:00',
    rating: 4.8,
    commentCount: 2140,
    mainImage: '/images/chengdu/dufu.jpg',
    images: ['/images/chengdu/bamboo.jpg', '/images/chengdu/garden-lush.jpg'],
    status: 1,
  },
  {
    id: 5,
    name: '成都大熊猫繁育研究基地',
    region: '熊猫生态',
    description: '世界最大的大熊猫迁地保护与繁育基地，园区模拟野生栖息环境，竹林掩映、溪流穿行。清晨是熊猫最活跃的时段，可近距离观察到进食、攀爬与幼崽育幼场景。',
    price: 55,
    openTime: '07:30 - 18:00',
    rating: 5.0,
    commentCount: 6800,
    mainImage: '/images/chengdu/panda-base.jpg',
    images: ['/images/chengdu/panda-cute.jpg', '/images/chengdu/park-green.jpg'],
    status: 1,
  },
  {
    id: 6,
    name: '人民公园',
    region: '市区经典',
    description: '成都最老牌的市民公园，鹤鸣茶社的竹椅盖碗茶已延续百年。掏耳朵的师傅、围坐打牌的老人、湖边划船的家庭，共同构成成都慢生活最生动的切面。',
    price: 0,
    openTime: '06:00 - 22:00',
    rating: 4.6,
    commentCount: 1780,
    mainImage: '/images/chengdu/renmin-park.jpg',
    images: ['/images/chengdu/tea-plantation.jpg', '/images/chengdu/park-green.jpg'],
    status: 1,
  },
  {
    id: 7,
    name: '都江堰',
    region: '世界遗产',
    description: '始建于战国时期、由李冰主持修建的无坝引水工程，两千余年来仍在灌溉成都平原，是世界水利史上的奇迹。鱼嘴分水、飞沙堰泄洪、宝瓶口引水，三处主体至今清晰可辨。',
    price: 80,
    openTime: '08:00 - 18:00',
    rating: 4.9,
    commentCount: 3520,
    mainImage: '/images/chengdu/dujiangyan.jpg',
    images: ['/images/chengdu/ancient-bridge.jpg', '/images/chengdu/river-night.jpg'],
    status: 1,
  },
  {
    id: 8,
    name: '青城山',
    region: '世界遗产',
    description: '中国道教发源地之一，素有“青城天下幽”之称。前山宫观林立、林木蔽日，后山溪瀑纵横、栈道悬空。拾级而上，苔痕石阶与道家清音相伴，是避暑养心的绝佳去处。',
    price: 80,
    openTime: '08:00 - 17:30',
    rating: 4.8,
    commentCount: 2960,
    mainImage: '/images/chengdu/qingcheng.jpg',
    images: ['/images/chengdu/mountain-mist.jpg', '/images/chengdu/bamboo.jpg'],
    status: 1,
  },
  {
    id: 9,
    name: '西岭雪山',
    region: '近郊山水',
    description: '因杜甫“窗含西岭千秋雪”而得名的近郊雪山，海拔 5364 米，是成都市区可见的最高峰。冬季为西南地区规模最大的滑雪场，夏季草甸与云海同样开阔壮丽。',
    price: 120,
    openTime: '09:00 - 17:00',
    rating: 4.7,
    commentCount: 1620,
    mainImage: '/images/chengdu/xiling.jpg',
    images: ['/images/chengdu/mountain-mist.jpg', '/images/chengdu/park-green.jpg'],
    status: 1,
  },
  {
    id: 10,
    name: '川剧艺术中心',
    region: '市区经典',
    description: '集中呈现川剧精髓的专业剧场，以变脸、吐火、滚灯、手影戏为主打。演出前可体验勾脸谱、试戏服，台上锣鼓与锣腔一响，蜀地数百年的声腔记忆扑面而来。',
    price: 180,
    openTime: '14:00 - 21:30',
    rating: 4.9,
    commentCount: 1350,
    mainImage: '/images/chengdu/chuanju.jpg',
    images: ['/images/chengdu/tower.jpg', '/images/chengdu/lanterns.jpg'],
    status: 1,
  },
]

/**
 * 地图打点坐标（人工校准的市区真实经纬度）。
 * 与景点按 id 对应，用于路线规划页的 Leaflet 标点。
 */
const SPOT_COORDS: Record<number, [number, number]> = {
  1: [30.6690, 104.0560],
  2: [30.6470, 104.0470],
  3: [30.6475, 104.0450],
  4: [30.6640, 104.0230],
  5: [30.7330, 104.1450],
  6: [30.6630, 104.0600],
  7: [31.0060, 103.6180],
  8: [30.9020, 103.5700],
  9: [30.8580, 103.2170],
  10: [30.6580, 104.0680],
}

/** 地图上的简短描述（景点描述太长，地图气泡用短文案） */
const SPOT_SHORT_DESC: Record<number, string> = {
  1: '清代古街 · 茶馆市集',
  2: '三国主题夜市',
  3: '三国遗迹博物馆',
  4: '诗圣故居园林',
  5: '大熊猫繁育研究',
  6: '百年鹤鸣茶社',
  7: '世界水利遗产',
  8: '道教名山',
  9: '千年雪峰滑雪场',
  10: '变脸吐火剧场',
}

export const useAttractionStore = defineStore('attraction', {
  state: () => ({
    /** 当前生效的景点列表（后台可增删改） */
    list: [] as Attraction[],
    /** 仅上架的景点，前台展示用 */
    loaded: false,
  }),

  getters: {
    /** 所有区域名，用于筛选下拉 */
    regions: (state): string[] =>
      Array.from(new Set(state.list.map(a => a.region))).filter(Boolean),

    /** 上架景点 */
    published: (state): Attraction[] => state.list.filter(a => a.status !== 0),

    /** id -> 景点 的映射，便于详情/名称回查 */
    byId: (state): Record<number, Attraction> => {
      const map: Record<number, Attraction> = {}
      state.list.forEach(a => { map[a.id] = a })
      return map
    },

    /** 地图打点：由景点数据 + 坐标表合成 */
    mapSpots: (state): MapSpot[] =>
      state.list
        .filter(a => SPOT_COORDS[a.id])
        .map(a => ({
          id: a.id,
          name: a.name,
          desc: SPOT_SHORT_DESC[a.id] || a.region,
          coords: SPOT_COORDS[a.id],
        })),

    /** 地图初始中心（天府广场附近） */
    mapCenter: (): [number, number] => [30.6598, 104.0633],
  },

  actions: {
    /**
     * 从 localStorage 载入景点。
     * 存储里没有记录时写入默认数据；有记录时把后台缺失的展示字段
     *（rating / commentCount / images）用默认值补齐，避免前台卡片渲染空白。
     */
    load(force = false) {
      if (this.loaded && !force) return
      const stored = getStorage<Attraction[] | null>(KEY_ATTRACTIONS, null)

      if (!stored || !Array.isArray(stored)) {
        this.list = JSON.parse(JSON.stringify(DEFAULT_ATTRACTIONS))
        this.persist()
      } else {
        this.list = stored.map(sa => {
          const fallback = DEFAULT_ATTRACTIONS.find(a => a.id === sa.id)
          return {
            ...fallback,
            ...sa,
            rating: sa.rating ?? fallback?.rating ?? 5.0,
            commentCount: sa.commentCount ?? fallback?.commentCount ?? 0,
            images: sa.images ?? (fallback?.images ?? (sa.mainImage ? [sa.mainImage] : [])),
            status: sa.status ?? 1,
          } as Attraction
        })
      }
      this.loaded = true
    },

    persist() {
      setStorage(KEY_ATTRACTIONS, this.list)
    },

    /** 新增景点（后台） */
    addAttraction(payload: Partial<Attraction>) {
      const nextId = this.list.length ? Math.max(...this.list.map(a => a.id)) + 1 : 1
      this.list.push({
        id: nextId,
        name: payload.name || '未命名景点',
        region: payload.region || '市区经典',
        description: payload.description || '',
        price: payload.price ?? 0,
        openTime: payload.openTime || '',
        rating: 5.0,
        commentCount: 0,
        mainImage: payload.mainImage || '',
        images: payload.mainImage ? [payload.mainImage] : [],
        status: payload.status ?? 1,
      })
      this.persist()
    },

    /** 更新景点（后台） */
    updateAttraction(id: number, payload: Partial<Attraction>) {
      const idx = this.list.findIndex(a => a.id === id)
      if (idx === -1) return
      this.list[idx] = { ...this.list[idx], ...payload }
      this.persist()
    },

    /** 删除景点（后台） */
    removeAttraction(id: number) {
      this.list = this.list.filter(a => a.id !== id)
      this.persist()
    },

    /** 上下架（后台） */
    setStatus(id: number, status: number) {
      this.updateAttraction(id, { status })
    },

    /** 重置为初始演示数据（后台） */
    resetToDefaults() {
      this.list = JSON.parse(JSON.stringify(DEFAULT_ATTRACTIONS))
      this.persist()
    },
  },
})
