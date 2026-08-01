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
                  <el-option label="北海景区" value="北海景区" />
                  <el-option label="西海景区" value="西海景区" />
                  <el-option label="天海景区" value="天海景区" />
                  <el-option label="玉屏景区" value="玉屏景区" />
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

// Real Huangshan Data Simulation
const attractions = ref([
  {
    id: 1,
    name: '迎客松',
    region: '玉屏景区',
    description: '位于玉屏楼左侧，倚青狮石破石而生，高10米，胸径0.64米，树龄至少已有800年，一侧枝桠伸出，如人伸出一只臂膀欢迎远道而来的客人，另一只手优雅地斜插在裤兜里，雍容大度，姿态优美。',
    price: 190,
    openTime: '06:00 - 17:30',
    rating: 5.0,
    commentCount: 1245,
    mainImage: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
    ]
  },
  {
    id: 2,
    name: '西海大峡谷',
    region: '西海景区',
    description: '因谷中有白云溪，又称“白云谷”。此谷是由近旁的石柱峰、石床峰，右前方的薄刀峰、飞来石，对面的排云亭、丹霞峰、松林峰和左前方的九龙峰、云外峰等奇峰怪石所围成的空间。',
    price: 0,
    openTime: '08:00 - 16:30',
    rating: 4.9,
    commentCount: 890,
    mainImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
    ]
  },
  {
    id: 3,
    name: '光明顶',
    region: '天海景区',
    description: '黄山第二高峰，海拔1860米。这里高旷开阔，日光照射久长，故名。顶上平坦而高旷，可观东海奇景、西海群峰，炼丹、天都、莲花、玉屏、鳌鱼诸峰尽收眼底。',
    price: 0,
    openTime: '全天开放',
    rating: 4.8,
    commentCount: 2100,
    mainImage: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
    ]
  },
  {
    id: 4,
    name: '宏村',
    region: '周边景点',
    description: '宏村有“画里乡村”之称，截至2014年，全镇完好保存明清民居140余幢，主要景点有：南湖春晓，书院诵读，月沼风荷，牛肠水圳，双溪映碧，亭前古树，雷岗夕照等。',
    price: 104,
    openTime: '07:30 - 17:30',
    rating: 4.7,
    commentCount: 3400,
    mainImage: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    images: []
  },
  {
    id: 5,
    name: '莲花峰',
    region: '玉屏景区',
    description: '黄山最高峰，海拔1864.8米。峻峭高耸，气势雄伟。因主峰突兀，小峰簇拥，俨若新莲初开，仰天怒放，故名“莲花峰”。',
    price: 0,
    openTime: '07:00 - 16:00',
    rating: 4.9,
    commentCount: 560,
    mainImage: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
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