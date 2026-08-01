<template>
  <div class="min-h-screen bg-gray-50 pt-24 px-4 md:px-8 pb-12">
    <div class="container mx-auto max-w-5xl">
      <!-- Tab Navigation -->
      <div class="bg-white rounded-xl shadow-sm p-2 mb-8 flex gap-2 overflow-x-auto">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="switchTab(tab.value)"
          :class="['px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap', 
            currentTab === tab.value 
              ? 'bg-green-500 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-green-600']"
        >
          <el-icon><component :is="tab.icon" /></el-icon>
          {{ tab.label }}
        </button>
      </div>

      <!-- Personal Info Section -->
      <div v-if="currentTab === 'info'" class="animate-fade-in-up">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-green-500 pl-4">个人信息</h2>
      <div class="bg-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div class="relative group">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleAvatarChange"
            accept="image/*"
          >
            <div class="relative cursor-pointer">
              <el-avatar :size="120" :src="userAvatar" class="border-4 border-green-100 shadow-lg group-hover:scale-105 transition-transform" />
              <div class="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full shadow-md hover:bg-green-600 transition-colors">
                <el-icon><Edit /></el-icon>
              </div>
            </div>
          </el-upload>
        </div>
        
        <div class="flex-grow space-y-6 w-full md:w-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm text-gray-500">昵称</label>
              <div v-if="!isEditing" class="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">{{ user?.username || '未设置' }}</div>
              <el-input v-else v-model="editForm.username" placeholder="请输入昵称" size="large" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-gray-500">邮箱</label>
              <div v-if="!isEditing" class="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">{{ user?.email || '未绑定' }}</div>
              <el-input v-else v-model="editForm.email" placeholder="请输入邮箱" size="large" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-gray-500">注册时间</label>
              <div class="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">2026-01-01</div>
            </div>
            <div class="space-y-2">
              <label class="text-sm text-gray-500">会员等级</label>
              <div class="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">黄金会员</div>
            </div>
          </div>
          
          <div class="flex gap-4 pt-4">
            <el-button v-if="!isEditing" type="primary" class="px-8 bg-green-500 border-none hover:bg-green-600" @click="startEdit">
              <el-icon class="mr-2"><Edit /></el-icon> 编辑资料
            </el-button>
            <template v-else>
              <el-button class="px-6" @click="isEditing = false">取消</el-button>
              <el-button type="primary" class="px-6 bg-green-500 border-none hover:bg-green-600" :loading="saving" :disabled="saving" @click="saveProfile">保存修改</el-button>
            </template>
          </div>
        </div>
      </div>

      <!-- Statistics Chart (Kept as extra value) -->
      <div class="mt-8 bg-white rounded-2xl shadow-sm p-6">
        <h3 class="text-lg font-bold mb-4 text-gray-700">近期活跃度</h3>
        <div ref="chartRef" style="width: 100%; height: 300px;"></div>
      </div>
    </div>

    <!-- Bookings Section -->
    <div v-else-if="currentTab === 'bookings'" class="animate-fade-in-up">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-blue-500 pl-4">预订记录</h2>
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <el-table 
          :data="bookings" 
          style="width: 100%" 
          :header-cell-style="{ background: 'linear-gradient(to right, #f0fdf4, #eff6ff)', color: '#374151', fontWeight: 'bold' }"
          highlight-current-row
          @row-click="handleRowClick"
          empty-text="暂无订单，您可以前往“景点推荐”下单"
        >
          <el-table-column prop="id" label="订单号" width="150" show-overflow-tooltip />
          <el-table-column prop="date" label="预订日期" width="180">
            <template #default="{ row }">
              <div class="flex items-center text-gray-600">
                <el-icon class="mr-2"><Calendar /></el-icon> {{ row.date }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="spotName" label="景点名称">
            <template #default="{ row }">
              <span class="font-medium text-gray-800">{{ row.spotName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="count" label="门票数量" width="120" align="center">
             <template #default="{ row }">
               <el-tag effect="plain" type="info">{{ row.count }} 张</el-tag>
             </template>
          </el-table-column>
          <el-table-column prop="price" label="总价" width="150" align="right">
            <template #default="{ row }">
              <span class="text-orange-500 font-bold">¥{{ row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getUserStatusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === '已支付' || row.status === '待支付'" 
                link 
                type="danger" 
                size="small" 
                @click.stop="cancelBooking(row)"
              >
                取消订单
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="bookings.length === 0" class="p-4 text-center">
        <router-link to="/attractions">
          <el-button plain type="primary">去景点下单</el-button>
        </router-link>
      </div>
    </div>

    <!-- Favorites Section -->
    <div v-else-if="currentTab === 'favorites'" class="animate-fade-in-up">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-yellow-500 pl-4">收藏景点</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in favorites" :key="item.id" class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
          <div class="h-48 overflow-hidden relative">
            <img :src="item.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            <div class="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 cursor-pointer hover:bg-red-50" @click="removeFavorite(item.id)">
              <el-icon><Delete /></el-icon>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-lg mb-2">{{ item.name }}</h3>
            <p class="text-gray-500 text-sm line-clamp-2 mb-4">{{ item.desc }}</p>
            <el-button class="w-full" plain type="primary" size="small">查看详情</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- User Routes Section -->
    <div v-else-if="currentTab === 'routes'" class="animate-fade-in-up">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-green-500 pl-4">自定义路线</h2>
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <el-table 
          :data="userRoutes" 
          style="width: 100%" 
          :header-cell-style="{ background: 'linear-gradient(to right, #f0fdf4, #f0f9ff)', color: '#374151', fontWeight: 'bold' }"
          highlight-current-row
          empty-text="暂无自定义路线，您可以在“路线规划”页面保存路线"
        >
          <el-table-column prop="name" label="路线名称">
            <template #default="{ row }">
              <span class="font-medium text-gray-800">{{ row.name || '我的路线' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="保存时间" width="200" />
          <el-table-column label="景点数量" width="120" align="center">
            <template #default="{ row }">
              <el-tag effect="plain" type="info">{{ row.path?.length || 0 }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="openRoute(row)">查看</el-button>
              <el-button link type="danger" size="small" @click="removeRoute(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onActivated, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Edit, Calendar, Delete, User, List, Star, Guide } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type UploadProps } from 'element-plus'
import { getStorage, safeJSONParse } from '@/utils/storage'

const route = useRoute()
const router = useRouter()

const tabs = [
  { label: '个人信息', value: 'info', icon: User },
  { label: '预订记录', value: 'bookings', icon: List },
  { label: '收藏景点', value: 'favorites', icon: Star },
  { label: '自定义路线', value: 'routes', icon: Guide }
]

const switchTab = (tab: string) => {
  router.push({ query: { ...route.query, tab } })
}

const user = ref<any>(getStorage('user', {}))
const chartRef = ref<HTMLElement | null>(null)
const isEditing = ref(false)
const editForm = ref({
  username: '',
  email: ''
})

const userAvatar = ref(user.value.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')
const saving = ref(false)

const handleAvatarChange: UploadProps['onChange'] = (uploadFile) => {
  if (uploadFile.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      userAvatar.value = e.target?.result as string
      // Save to user object and localStorage
      user.value.avatar = userAvatar.value
      localStorage.setItem('user', JSON.stringify(user.value))
      // Sync avatar to registered_users if the user exists
      const registered = getStorage<any[]>('registered_users', [])
      const idx = registered.findIndex((u: any) => u.username === user.value.username)
      if (idx !== -1) {
        registered[idx].avatar = userAvatar.value
        localStorage.setItem('registered_users', JSON.stringify(registered))
      }
      window.dispatchEvent(new Event('user-updated'))
      ElMessage.success({ message: '头像上传成功', duration: 1500 })
    }
    reader.readAsDataURL(uploadFile.raw)
  }
}

const startEdit = () => {
  editForm.value = { ...user.value }
  isEditing.value = true
}

const saveProfile = () => {
  if (saving.value) return
  saving.value = true
  if (!editForm.value.username) {
    ElMessage.warning({ message: '昵称不能为空', duration: 1500 })
    saving.value = false
    return
  }
  user.value = { ...user.value, ...editForm.value }
  localStorage.setItem('user', JSON.stringify(user.value))
  // Sync profile changes to registered_users when present
  const registered = getStorage<any[]>('registered_users', [])
  const idx = registered.findIndex((u: any) => u.username === user.value.username)
  if (idx !== -1) {
    registered[idx] = { 
      ...registered[idx], 
      username: user.value.username, 
      email: user.value.email, 
      avatar: user.value.avatar || registered[idx].avatar || '' 
    }
    localStorage.setItem('registered_users', JSON.stringify(registered))
  }
  window.dispatchEvent(new Event('user-updated'))
  isEditing.value = false
  ElMessage.success({ message: '个人信息更新成功', duration: 1500 })
  saving.value = false
}

const cancelBooking = (row: any) => {
  ElMessageBox.confirm(
    `确定要取消 ${row.spotName} 的订单吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // Update local UI
      row.status = '已取消'
      
      // Update localStorage (Unified 'all_orders')
      const allOrders = getStorage<any[]>('all_orders', [])
      const targetOrder = allOrders.find((o: any) => o.orderId === row.id)
      if (targetOrder) {
        targetOrder.status = 'cancelled'
        localStorage.setItem('all_orders', JSON.stringify(allOrders))
      }

      ElMessage.success({ message: '订单已取消', duration: 1500 })
    })
    .catch(() => {})
}

const currentTab = computed(() => (route.query.tab as string) || 'info')

// Bookings Data
const bookings = ref([
  { id: 101, date: '2026-05-01', spotName: '黄山风景区门票 (含索道)', count: 2, price: 380, status: '已支付' },
  { id: 102, date: '2026-04-15', spotName: '宏村一日游', count: 1, price: 104, status: '已完成' },
  { id: 103, date: '2026-06-10', spotName: '翡翠谷', count: 3, price: 270, status: '待支付' },
])

const loadBookings = () => {
  const allOrders = getStorage<any[]>('all_orders', [])
  const myOrders = allOrders.filter((o: any) => o.user === user.value.username)
  
  if (myOrders.length > 0) {
    bookings.value = myOrders.map((o: any) => ({
      id: o.orderId,
      date: o.date,
      spotName: o.spot,
      count: o.quantity,
      price: o.total,
      status: o.status === 'paid' ? '已支付' : (o.status === 'pending' ? '待支付' : '已取消')
    }))
  } else {
    bookings.value = []
  }
}

onMounted(async () => {
    loadBookings()
    loadFavorites()
    if (currentTab.value === 'routes') {
      loadUserRoutes()
    }
    if (currentTab.value === 'info') {
      await nextTick()
      initChart()
    }
  })

  const favorites = ref([
    { id: 1, name: '迎客松', desc: '黄山标志性景观，姿态优美。', image: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' },
    { id: 2, name: '西海大峡谷', desc: '梦幻般的峡谷风光，云雾缭绕。', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' },
  ])

  const loadFavorites = () => {
    const stored = localStorage.getItem('user_favorites')
    if (stored) {
      const userFavs = safeJSONParse<any[]>(stored, [])
      if (userFavs.length > 0) {
        favorites.value = userFavs
      }
    }
  }

  const handleRowClick = (row: any) => {
    ElMessage.info({ message: `查看订单详情: ${row.id}`, duration: 1500 })
  }

  const removeFavorite = (id: number) => {
    const stored = getStorage<any[]>('user_favorites', [])
    const newStored = stored.filter((f: any) => f.id !== id)
    localStorage.setItem('user_favorites', JSON.stringify(newStored))
    favorites.value = favorites.value.filter(f => f.id !== id)
    ElMessage.success({ message: '已取消收藏', duration: 1500 })
  }

  // User Routes
  const userRoutes = ref<any[]>([])
  const loadUserRoutes = () => {
    const stored = getStorage<any[]>('user_routes', [])
    userRoutes.value = Array.isArray(stored) ? stored : []
  }
  const openRoute = (r: any) => {
    router.push({ path: '/routes', query: { load: r.id } })
  }
  const removeRoute = (id: number) => {
    const list = getStorage<any[]>('user_routes', []).filter((x: any) => x.id !== id)
    localStorage.setItem('user_routes', JSON.stringify(list))
    loadUserRoutes()
    ElMessage.success({ message: '已删除路线', duration: 1500 })
  }

  // Chart Logic
  let chartInstance: any = null
  const initChart = async () => {
    if (!chartRef.value || currentTab.value !== 'info') return
    const echarts = await import('echarts')
    chartInstance = echarts.init(chartRef.value)
    const option = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
      yAxis: { type: 'value' },
      series: [
        {
          name: '浏览热度',
          type: 'line',
          smooth: true,
          lineStyle: { color: '#10B981', width: 3 },
          areaStyle: {
            color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.5)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }
            ])
          },
          data: [15, 30, 45, 32, 60, 85]
        }
      ]
    }
    chartInstance.setOption(option)
  }

  watch(currentTab, async (newVal) => {
    if (newVal === 'info') {
      await nextTick()
      await initChart()
    } else if (newVal === 'routes') {
      loadUserRoutes()
    } else if (newVal === 'bookings') {
      loadBookings()
    } else {
      if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
      }
    }
  })

  const onOrdersUpdated = () => {
    if (currentTab.value === 'bookings') {
      loadBookings()
    }
  }
  window.addEventListener('orders-updated', onOrdersUpdated)
  
  const getUserStatusType = (status: string) => {
    const map: Record<string, string> = { '已支付': 'success', '待支付': 'warning', '已取消': 'info', '已完成': 'success' }
    return map[status] || 'info'
  }

onActivated(() => {
  if (currentTab.value === 'bookings') {
    loadBookings()
  }
})

onUnmounted(() => {
  window.removeEventListener('orders-updated', onOrdersUpdated)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>