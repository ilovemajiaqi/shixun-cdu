<template>
  <div class="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
    <div class="container mx-auto">
      <!-- Header & Filters -->
      <div class="mb-12">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div class="flex items-center gap-4 flex-1 w-full flex-wrap">
              <div class="flex items-center gap-2 w-full md:w-auto">
                <span class="text-gray-500 font-medium whitespace-nowrap">区域：</span>
                <el-select v-model="filters.region" placeholder="全部区域" class="w-full md:w-40" size="large">
                  <el-option label="全部区域" value="" />
                  <el-option label="市区经典" value="市区经典" />
                  <el-option label="熊猫生态" value="熊猫生态" />
                  <el-option label="世界遗产" value="世界遗产" />
                  <el-option label="近郊山水" value="近郊山水" />
                </el-select>
              </div>
              
              <div class="flex items-center gap-2 w-full md:w-auto">
                <span class="text-gray-500 font-medium whitespace-nowrap">排序：</span>
                <el-select v-model="filters.sort" placeholder="默认排序" class="w-full md:w-40" size="large">
                  <el-option label="综合排序" value="default" />
                  <el-option label="评分最高" value="rating" />
                  <el-option label="热度最高" value="hot" />
                  <el-option label="价格最低" value="price_asc" />
                </el-select>
              </div>
            </div>
            
            <el-button type="primary" size="large" class="w-full md:w-auto px-8 bg-gradient-to-r from-green-500 to-teal-500 border-none shadow-md hover:shadow-lg transition-all" @click="applyFilters" round>
              <el-icon class="mr-2"><Filter /></el-icon> 立即筛选
            </el-button>
          </div>
        </div>
      </div>

      <!-- Attractions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="spot in filteredAttractions" 
          :key="spot.id"
          class="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col"
        >
          <!-- Main Image with Zoom Effect -->
          <div class="relative h-64 overflow-hidden">
            <img 
              :src="spot.mainImage" 
              :alt="spot.name" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            >
            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-orange-500 shadow-sm">
              ¥{{ spot.price }}起
            </div>
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
              <h3 class="text-2xl font-bold text-white mb-1">{{ spot.name }}</h3>
              <div class="flex items-center text-white/90 text-sm">
                <el-icon class="mr-1"><Location /></el-icon> {{ spot.region }}
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 flex-grow flex flex-col">
            <p class="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
              {{ spot.description }}
            </p>
            
            <div class="mt-auto">
              <div class="flex items-center justify-between mb-4 text-sm text-gray-500">
                <div class="flex items-center">
                  <el-icon class="mr-1"><Timer /></el-icon> {{ spot.openTime }}
                </div>
                <div class="flex items-center cursor-pointer hover:scale-110 transition-transform" @click.stop="toggleFavorite(spot)">
                  <el-icon :size="24" :class="isFavorite(spot.id) ? 'text-red-500' : 'text-gray-300'">
                    <component :is="isFavorite(spot.id) ? StarFilled : Star" />
                  </el-icon>
                  <span class="ml-1" :class="isFavorite(spot.id) ? 'text-red-500' : 'text-gray-400'">
                    {{ isFavorite(spot.id) ? '已收藏' : '收藏' }}
                  </span>
                </div>
              </div>

              <!-- Secondary Images (Mini Gallery) -->
              <div class="grid grid-cols-3 gap-2 mb-4" v-if="spot.images && spot.images.length > 0">
                <div 
                  v-for="(img, idx) in spot.images.slice(0, 3)" 
                  :key="idx" 
                  class="h-16 rounded-lg overflow-hidden relative cursor-pointer"
                >
                  <img :src="img" class="w-full h-full object-cover hover:opacity-80 transition-opacity">
                  <div class="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors"></div>
                </div>
              </div>

              <el-button class="w-full bg-green-50 text-green-600 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors py-5 font-semibold rounded-xl" @click="openBooking(spot)">
                查看详情 & 预订
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Dialog -->
      <el-dialog v-model="bookingDialogVisible" title="预订门票" width="90%" :max-width="500" center destroy-on-close class="rounded-2xl">
        <div v-if="currentSpot" class="text-center mb-6">
          <h3 class="text-xl font-bold text-gray-800 mb-2">{{ currentSpot.name }}</h3>
          <p class="text-gray-500 text-sm flex justify-center items-center gap-2">
            <el-icon><Timer /></el-icon> {{ currentSpot.openTime }} 
            <span class="w-px h-3 bg-gray-300"></span>
            <span class="text-orange-500 font-bold">¥{{ currentSpot.price }}/人</span>
          </p>
        </div>
        
        <el-form :model="bookingForm" label-width="80px" size="large" class="px-2">
          <el-form-item label="预订日期">
            <el-date-picker 
              v-model="bookingForm.date" 
              type="date" 
              placeholder="选择游玩日期" 
              class="w-full" 
              :disabled-date="(time: Date) => time.getTime() < Date.now() - 8.64e7" 
            />
          </el-form-item>
          <el-form-item label="购票数量">
            <el-input-number v-model="bookingForm.count" :min="1" :max="10" class="w-full" />
          </el-form-item>
          <el-form-item label="联系人">
            <el-input v-model="bookingForm.name" placeholder="请输入取票人姓名" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="bookingForm.phone" placeholder="请输入接收短信手机号" />
          </el-form-item>
          
          <div class="bg-gray-50 p-4 rounded-xl mt-6 flex justify-between items-center border border-gray-100">
            <span class="text-gray-600">支付总额</span>
            <span class="text-3xl font-bold text-orange-500">¥{{ (currentSpot?.price || 0) * bookingForm.count }}</span>
          </div>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer flex gap-4 justify-center mt-4">
            <el-button size="large" @click="bookingDialogVisible = false" class="px-8">取消</el-button>
            <el-button type="primary" size="large" @click="submitBooking" :loading="submitting" class="px-8 bg-gradient-to-r from-orange-500 to-red-500 border-none">确认支付</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Filter, Location, Timer, Star, StarFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const bookingDialogVisible = ref(false)
const currentSpot = ref<any>(null)
const bookingForm = ref({
  date: '',
  count: 1,
  name: '',
  phone: ''
})
const submitting = ref(false)
const userFavorites = ref<number[]>([])

// Load favorites from localStorage
const loadFavorites = () => {
  const stored = localStorage.getItem('user_favorites')
  if (stored) {
    userFavorites.value = JSON.parse(stored).map((f: any) => f.id)
  }
}
loadFavorites()

const isFavorite = (id: number) => userFavorites.value.includes(id)

const toggleFavorite = (spot: any) => {
  const user = localStorage.getItem('user')
  if (!user) {
    ElMessage.warning({ message: '请先登录后收藏', duration: 1500 })
    router.push('/login')
    return
  }

  const stored = JSON.parse(localStorage.getItem('user_favorites') || '[]')
  const index = stored.findIndex((f: any) => f.id === spot.id)

  if (index > -1) {
    // Remove
    stored.splice(index, 1)
    ElMessage.success({ message: '已取消收藏', duration: 1500 })
  } else {
    // Add
    stored.push({
      id: spot.id,
      name: spot.name,
      desc: spot.description,
      image: spot.mainImage
    })
    ElMessage.success({ message: '收藏成功', duration: 1500 })
  }

  localStorage.setItem('user_favorites', JSON.stringify(stored))
  loadFavorites() // Refresh local state
}

const filters = ref({
  region: '',
  sort: 'default'
})

// Chengdu Tourism Data
const attractions = ref([
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
    images: [
      '/images/chengdu/lanterns.jpg',
      '/images/chengdu/city-night.jpg'
    ]
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
    images: [
      '/images/chengdu/lanterns.jpg',
      '/images/chengdu/night-market.jpg'
    ]
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
    images: [
      '/images/chengdu/tower.jpg',
      '/images/chengdu/garden-lush.jpg'
    ]
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
    images: [
      '/images/chengdu/bamboo.jpg',
      '/images/chengdu/garden-lush.jpg'
    ]
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
    images: [
      '/images/chengdu/panda-cute.jpg',
      '/images/chengdu/park-green.jpg'
    ]
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
    images: [
      '/images/chengdu/tea-plantation.jpg',
      '/images/chengdu/park-green.jpg'
    ]
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
    images: [
      '/images/chengdu/ancient-bridge.jpg',
      '/images/chengdu/river-night.jpg'
    ]
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
    images: [
      '/images/chengdu/mountain-mist.jpg',
      '/images/chengdu/bamboo.jpg'
    ]
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
    images: [
      '/images/chengdu/mountain-mist.jpg',
      '/images/chengdu/park-green.jpg'
    ]
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
    images: [
      '/images/chengdu/tower.jpg',
      '/images/chengdu/lanterns.jpg'
    ]
  },
])

// Load attractions from localStorage if available (sync with admin)
const loadAttractions = () => {
  const stored = localStorage.getItem('attractions_data')
  if (stored) {
    // Merge or replace? For simplicity, we use the stored data if it exists,
    // assuming admin manages the "truth".
    // However, the admin data might lack 'rating', 'commentCount', 'images' array (admin only has mainImage).
    // So we need to be careful.
    
    const storedAttractions = JSON.parse(stored)
    
    // Map stored attractions to preserve missing fields from default mocks if ID matches, 
    // or provide defaults for new ones.
    const merged = storedAttractions.map((sa: any) => {
      const existing = attractions.value.find(a => a.id === sa.id)
      return {
        ...sa,
        rating: existing?.rating || 5.0,
        commentCount: existing?.commentCount || 0,
        images: existing?.images || (sa.mainImage ? [sa.mainImage] : [])
      }
    })
    
    attractions.value = merged
  }
}
loadAttractions()

const filteredAttractions = computed(() => {
  let result = attractions.value
  if (filters.value.region) {
    result = result.filter(spot => spot.region.includes(filters.value.region))
  }
  // Sort logic (simplified)
  if (filters.value.sort === 'rating') {
    result = [...result].sort((a, b) => b.rating - a.rating)
  } else if (filters.value.sort === 'hot') {
    result = [...result].sort((a, b) => b.commentCount - a.commentCount)
  } else if (filters.value.sort === 'price_asc') {
    result = [...result].sort((a, b) => a.price - b.price)
  }
  return result
})

const applyFilters = () => {
  ElMessage.success({ message: '筛选已更新', duration: 1500 })
}

const openBooking = (spot: any) => {
  const user = localStorage.getItem('user')
  if (!user) {
    ElMessage.warning({ message: '请先登录后预订', duration: 1500 })
    router.push('/login')
    return
  }
  currentSpot.value = spot
  bookingForm.value = {
    date: '',
    count: 1,
    name: JSON.parse(user).username || '',
    phone: ''
  }
  bookingDialogVisible.value = true
}

const submitBooking = () => {
  if (!bookingForm.value.date || !bookingForm.value.name || !bookingForm.value.phone) {
    ElMessage.warning({ message: '请填写完整预订信息', duration: 1500 })
    return
  }
  
  submitting.value = true
  setTimeout(() => {
    // Save to localStorage (Unified 'all_orders')
    const userObj = JSON.parse(localStorage.getItem('user') || '{}')
    const username = userObj.username || bookingForm.value.name || '游客'
    
    const newOrder = {
      orderId: `ORD-${Date.now()}`,
      user: username,
      spot: currentSpot.value.name,
      date: new Date(bookingForm.value.date).toLocaleDateString(),
      quantity: bookingForm.value.count,
      price: currentSpot.value.price || 0,
      total: (currentSpot.value.price || 0) * bookingForm.value.count,
      status: 'paid', // Default to paid for demo
      createdAt: Date.now()
    }

    const allOrders = JSON.parse(localStorage.getItem('all_orders') || '[]')
    allOrders.unshift(newOrder)
    localStorage.setItem('all_orders', JSON.stringify(allOrders))

    // Legacy support (optional, can remove if UserView is updated)
    // const existingBookings = JSON.parse(localStorage.getItem('user_bookings') || '[]')
    // existingBookings.unshift({ ...newOrder, id: Date.now(), spotName: newOrder.spot, count: newOrder.quantity, status: '已支付' })
    // localStorage.setItem('user_bookings', JSON.stringify(existingBookings))

    submitting.value = false
    bookingDialogVisible.value = false
    ElMessage.success({ message: '预订成功！凭短信入园', duration: 1500 })
    // Reset
    bookingForm.value.date = ''
  }, 1500)
}
</script>

<style scoped>
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>