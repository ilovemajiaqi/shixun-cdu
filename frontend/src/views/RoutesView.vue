<template>
  <div class="h-screen pt-[72px] flex flex-col md:flex-row overflow-hidden bg-gray-50">
    <!-- Map Section -->
    <div class="w-full md:w-2/3 h-[50vh] md:h-full relative z-0 shadow-inner">
      <l-map ref="map" v-model:zoom="zoom" :center="center" :use-global-leaflet="false">
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>
        
        <!-- Markers for Spots -->
        <l-marker 
          v-for="spot in spots" 
          :key="spot.id" 
          :lat-lng="spot.coords"
          @click="addToCustomRoute(spot)"
        >
          <l-popup>
            <div class="text-center">
              <h3 class="font-bold text-lg mb-1">{{ spot.name }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ spot.desc }}</p>
              <el-button size="small" type="primary" @click="addToCustomRoute(spot)">加入路线</el-button>
            </div>
          </l-popup>
        </l-marker>
        
        <!-- Polyline for Selected Route -->
        <l-polyline
          v-if="customRoute.length > 1"
          :lat-lngs="customRouteCoords"
          color="#10b981"
          :weight="4"
          dash-array="10, 10" 
        />
      </l-map>
      
      <!-- Map Controls Overlay -->
      <div class="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-md">
        <el-tooltip content="重置地图" placement="left">
           <el-button circle size="small" @click="resetMap"><el-icon><Refresh /></el-icon></el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- Sidebar Panel -->
    <div class="w-full md:w-1/3 h-[50vh] md:h-full bg-white shadow-2xl flex flex-col z-10 relative">
      <div class="p-6 flex-grow overflow-y-auto custom-scrollbar">
        <h2 class="text-2xl font-bold mb-6 flex items-center text-gray-800">
          <el-icon class="mr-2 text-green-600"><Guide /></el-icon> 路线规划
        </h2>

        <!-- Tabs -->
        <el-tabs v-model="activeTab" class="demo-tabs">
          <el-tab-pane label="推荐路线" name="recommended">
            <div class="space-y-4 mt-2">
              <div 
                v-for="route in recommendedRoutes" 
                :key="route.id"
                class="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl border border-green-100 cursor-pointer hover:shadow-md transition-shadow"
                @click="loadRoute(route)"
              >
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-bold text-gray-800">{{ route.name }}</h3>
                  <span class="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">{{ route.tag }}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ route.desc }}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span class="flex items-center"><el-icon class="mr-1"><Timer /></el-icon> {{ route.duration }}</span>
                  <span class="flex items-center"><el-icon class="mr-1"><Position /></el-icon> {{ route.distance }}km</span>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="自定义路线" name="custom">
            <div class="mt-2">
              <div v-if="customRoute.length === 0" class="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <el-icon class="text-4xl mb-2"><Pointer /></el-icon>
                <p>点击地图上的景点<br>开始规划您的专属路线</p>
              </div>
              
              <div v-else class="space-y-3">
                <transition-group name="list">
                  <div 
                    v-for="(spot, index) in customRoute" 
                    :key="spot.id"
                    class="flex items-center bg-white border border-gray-200 p-3 rounded-lg shadow-sm group"
                  >
                    <div class="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                      {{ index + 1 }}
                    </div>
                    <span class="flex-grow font-medium text-gray-700">{{ spot.name }}</span>
                    <el-button 
                      circle 
                      size="small" 
                      type="danger" 
                      plain 
                      class="opacity-0 group-hover:opacity-100 transition-opacity"
                      @click="removeFromCustomRoute(index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </transition-group>

                <div class="pt-4 border-t border-gray-100 mt-6">
                  <div class="flex justify-between text-sm text-gray-600 mb-4">
                    <span>景点数量: {{ customRoute.length }}</span>
                    <span>预计耗时: ~{{ customRoute.length * 1.5 }}小时</span>
                  </div>
                  <div class="flex gap-2">
                    <el-button class="flex-1" @click="customRoute = []">清空</el-button>
                    <el-button type="primary" class="flex-1 bg-gradient-to-r from-orange-500 to-red-500 border-none" :disabled="saving || customRoute.length < 2" :loading="saving" @click="saveRoute">保存路线</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup, LPolyline } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import { Guide, Timer, Position, Refresh, Delete, Pointer } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const currentRoute = useRoute()

const zoom = ref(13)
const center = ref<[number, number]>([30.1317, 118.1633])
const activeTab = ref('recommended')
const saving = ref(false)

// Mock Data
interface Spot {
  id: number;
  name: string;
  desc: string;
  coords: [number, number];
}

const spots = ref<Spot[]>([
  { id: 1, name: '迎客松', desc: '黄山标志性景观', coords: [30.1245, 118.1732] },
  { id: 2, name: '光明顶', desc: '黄山第二高峰', coords: [30.1360, 118.1690] },
  { id: 3, name: '飞来石', desc: '红楼梦取景地', coords: [30.1400, 118.1620] },
  { id: 4, name: '西海大峡谷', desc: '梦幻景区', coords: [30.1450, 118.1550] },
  { id: 5, name: '北海宾馆', desc: '核心住宿区', coords: [30.1420, 118.1750] },
  { id: 6, name: '慈光阁', desc: '登山口', coords: [30.1050, 118.1700] },
])

const loadSpots = () => {
  const stored = localStorage.getItem('attractions_data')
  if (stored) {
    const attractions = JSON.parse(stored)
    // Merge logic: Update names/descs of existing spots, keep coords.
    // Ideally we would have coords in attractions_data, but for now we only map what matches.
    // New attractions without coords won't appear on map but could be listed? 
    // Map only shows markers with coords.
    
    // For this demo, we just update the metadata of hardcoded spots if they exist in DB
    // or if we want to support dynamic spots, we need to assign random coords nearby (Risky but fun?)
    
    // Let's just update existing spots data if IDs match
    spots.value = spots.value.map(s => {
      const match = attractions.find((a: any) => a.id === s.id)
      if (match) {
        return { ...s, name: match.name, desc: match.description || s.desc } // Use description from DB
      }
      return s
    })
  }
}
loadSpots()

const recommendedRoutes = ref([
  { 
    id: 1, 
    name: '经典一日游', 
    tag: '热门',
    desc: '包含迎客松、光明顶、飞来石等核心景点，适合时间紧凑的游客。',
    duration: '6-8小时',
    distance: '8.5',
    path: [1, 2, 3, 5]
  },
  { 
    id: 2, 
    name: '西海大峡谷深度游', 
    tag: '风景',
    desc: '深入西海大峡谷，体验网红小火车，感受黄山的险峻与秀美。',
    duration: '5-7小时',
    distance: '6.2',
    path: [5, 3, 4]
  }
])

const loadRoutes = () => {
  const stored = localStorage.getItem('routes_data')
  if (stored) {
    recommendedRoutes.value = JSON.parse(stored)
  }
}
loadRoutes()

const customRoute = ref<any[]>([])

const customRouteCoords = computed(() => {
  return customRoute.value.map(spot => spot.coords)
})

const addToCustomRoute = (spot: any) => {
  if (customRoute.value.find(s => s.id === spot.id)) {
    ElMessage.warning({ message: '该景点已在路线中', duration: 1500 })
    return
  }
  customRoute.value.push(spot)
  activeTab.value = 'custom'
  ElMessage.success({ message: `已添加: ${spot.name}`, duration: 1500 })
}

const removeFromCustomRoute = (index: number) => {
  customRoute.value.splice(index, 1)
}

const loadRoute = (route: any) => {
  customRoute.value = route.path.map((id: number) => spots.value.find((s: Spot) => s.id === id)).filter(Boolean)
  activeTab.value = 'custom'
  ElMessage.success({ message: `已加载: ${route.name}`, duration: 1500 })
  // Adjust map view roughly (mock)
  if(customRoute.value.length > 0) {
    center.value = customRoute.value[0].coords
  }
}

const saveRoute = () => {
  if (saving.value) return
  const user = localStorage.getItem('user')
  if (!user) {
    ElMessage.warning({ message: '请先登录后保存路线', duration: 1500 })
    router.push('/login')
    return
  }
  
  if (customRoute.value.length < 2) {
    ElMessage.warning({ message: '请至少选择两个景点', duration: 1500 })
    return
  }
  saving.value = true
  setTimeout(() => {
    const list = JSON.parse(localStorage.getItem('user_routes') || '[]')
    const item = {
      id: Date.now(),
      name: '我的自定义路线',
      date: new Date().toLocaleString(),
      path: customRoute.value.map(s => s.id)
    }
    list.unshift(item)
    localStorage.setItem('user_routes', JSON.stringify(list))
    saving.value = false
    ElMessage.success({ message: '路线保存成功！可在个人中心查看', duration: 1500 })
  }, 800)
}

const resetMap = () => {
  zoom.value = 13
  center.value = [30.1317, 118.1633]
}
onMounted(() => {
  const loadId = Number(currentRoute.query.load || 0)
  if (loadId) {
    const list = JSON.parse(localStorage.getItem('user_routes') || '[]')
    const r = list.find((x: any) => x.id === loadId)
    if (r) {
      loadRoute(r)
    }
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
