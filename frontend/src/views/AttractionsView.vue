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
import { ref, computed, onMounted } from 'vue'
import { Filter, Location, Timer, Star, StarFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAttractionStore } from '@/stores/attraction'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const router = useRouter()

// 数据全部来自 store：景点列表、收藏、用户、订单都各由唯一数据源维护。
const attractionStore = useAttractionStore()
const userStore = useUserStore()
const orderStore = useOrderStore()

// 触发一次加载（store 内部有 loaded 标记，重复调用不会重复读盘）
attractionStore.load()

const bookingDialogVisible = ref(false)
const currentSpot = ref<any>(null)
const bookingForm = ref({
  date: '',
  count: 1,
  name: '',
  phone: ''
})
const submitting = ref(false)

const isFavorite = (id: number) => userStore.isFavorite(id)

const toggleFavorite = (spot: any) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning({ message: '请先登录后收藏', duration: 1500 })
    router.push('/login')
    return
  }

  const added = userStore.toggleFavorite(spot)
  ElMessage.success({ message: added ? '收藏成功' : '已取消收藏', duration: 1500 })
}

const filters = ref({
  region: '',
  sort: 'default'
})

const filteredAttractions = computed(() => {
  // published 过滤掉后台下架的景点
  let result = attractionStore.published
  if (filters.value.region) {
    result = result.filter(spot => spot.region.includes(filters.value.region))
  }
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
  if (!userStore.isLoggedIn) {
    ElMessage.warning({ message: '请先登录后预订', duration: 1500 })
    router.push('/login')
    return
  }
  currentSpot.value = spot
  bookingForm.value = {
    date: '',
    count: 1,
    name: userStore.username || '',
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
    // 下单逻辑收拢在 orderStore.createOrder，编号规则与字段统一
    orderStore.createOrder({
      username: userStore.username || bookingForm.value.name || '游客',
      spot: currentSpot.value.name,
      date: new Date(bookingForm.value.date).toLocaleDateString(),
      quantity: bookingForm.value.count,
      price: currentSpot.value.price || 0,
      status: 'paid'
    })

    submitting.value = false
    bookingDialogVisible.value = false
    ElMessage.success({ message: '预订成功！凭短信入园', duration: 1500 })
    bookingForm.value.date = ''
  }, 1500)
}

onMounted(() => {
  // 收藏与景点列表都以最新存储为准（例如后台改过数据后返回本页）
  userStore.loadFavorites()
  attractionStore.load(true)
})
</script>

<style scoped>
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>