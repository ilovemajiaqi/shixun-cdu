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
                    <span>景点数量: {{ routeStore.customRoute.length }}</span>
                    <span>预计耗时: ~{{ routeStore.estimatedHours }}小时</span>
                  </div>
                  <div class="flex gap-2">
                    <el-button class="flex-1" @click="routeStore.clearCustomRoute()">清空</el-button>
                    <el-button type="primary" class="flex-1 bg-gradient-to-r from-orange-500 to-red-500 border-none" :disabled="saving || !routeStore.canSave" :loading="saving" @click="saveRoute">保存路线</el-button>
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
import { useAttractionStore } from '@/stores/attraction'
import { useRouteStore } from '@/stores/route'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const currentRoute = useRoute()

// 景点坐标、推荐路线、自定义路线、已保存路线全部来自 store
const attractionStore = useAttractionStore()
const routeStore = useRouteStore()
const userStore = useUserStore()

attractionStore.load()
routeStore.load()

const zoom = ref(13)
// 地图中心由 store 提供（天府广场），重置时也回到这里
const center = ref<[number, number]>(attractionStore.mapCenter)
const activeTab = ref('recommended')
const saving = ref(false)

// 地图打点：景点数据 + 坐标表在 store 里合成
const spots = computed(() => attractionStore.mapSpots)
const recommendedRoutes = computed(() => routeStore.recommended)

// 自定义路线的读写都代理到 store，页面本身不再持有副本
const customRoute = computed({
  get: () => routeStore.customRoute,
  set: (val) => { routeStore.customRoute = val },
})

const customRouteCoords = computed(() => routeStore.customRouteCoords)

const addToCustomRoute = (spot: any) => {
  if (!routeStore.addSpot({ id: spot.id, name: spot.name, coords: spot.coords })) {
    ElMessage.warning({ message: '该景点已在路线中', duration: 1500 })
    return
  }
  activeTab.value = 'custom'
  ElMessage.success({ message: `已添加: ${spot.name}`, duration: 1500 })
}

const removeFromCustomRoute = (index: number) => {
  routeStore.removeSpotAt(index)
}

const loadRoute = (route: any) => {
  routeStore.loadRecommendedToCustom(route, spots.value)
  activeTab.value = 'custom'
  ElMessage.success({ message: `已加载: ${route.name}`, duration: 1500 })
  if (routeStore.customRoute.length > 0) {
    center.value = routeStore.customRoute[0].coords
  }
}

const saveRoute = () => {
  if (saving.value) return
  if (!userStore.isLoggedIn) {
    ElMessage.warning({ message: '请先登录后保存路线', duration: 1500 })
    router.push('/login')
    return
  }

  if (!routeStore.canSave) {
    ElMessage.warning({ message: '请至少选择两个景点', duration: 1500 })
    return
  }
  saving.value = true
  setTimeout(() => {
    routeStore.saveCustomRoute()
    saving.value = false
    ElMessage.success({ message: '路线保存成功！可在个人中心查看', duration: 1500 })
  }, 800)
}

const resetMap = () => {
  zoom.value = 13
  center.value = [...attractionStore.mapCenter] as [number, number]
}

onMounted(() => {
  // 支持从个人中心跳转过来直接加载某条已保存路线
  const loadId = Number(currentRoute.query.load || 0)
  if (loadId) {
    routeStore.loadSaved()
    const r = routeStore.savedById(loadId)
    if (r) {
      routeStore.customRoute = r.path
        .map(id => spots.value.find(s => s.id === id))
        .filter(Boolean) as { id: number; name: string; coords: [number, number] }[]
      activeTab.value = 'custom'
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
