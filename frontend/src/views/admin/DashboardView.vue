<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">总用户数</p>
          <h3 class="text-2xl font-bold text-gray-800">1,245</h3>
          <p class="text-xs text-green-500 mt-1 flex items-center"><el-icon><Top /></el-icon> +12% 较上月</p>
        </div>
        <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
          <el-icon class="text-xl"><User /></el-icon>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">今日预订</p>
          <h3 class="text-2xl font-bold text-gray-800">86</h3>
          <p class="text-xs text-green-500 mt-1 flex items-center"><el-icon><Top /></el-icon> +5% 较昨日</p>
        </div>
        <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-500">
          <el-icon class="text-xl"><Ticket /></el-icon>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">景点总数</p>
          <h3 class="text-2xl font-bold text-gray-800">18</h3>
          <p class="text-xs text-gray-400 mt-1">覆盖4大景区</p>
        </div>
        <div class="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
          <el-icon class="text-xl"><Location /></el-icon>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 mb-1">总收入 (模拟)</p>
          <h3 class="text-2xl font-bold text-gray-800">¥128,400</h3>
          <p class="text-xs text-green-500 mt-1 flex items-center"><el-icon><Top /></el-icon> +8% 较上月</p>
        </div>
        <div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
          <el-icon class="text-xl"><Money /></el-icon>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4">近7日预订趋势</h3>
        <div ref="chartRef" class="h-64 w-full bg-gray-50 rounded flex items-center justify-center text-gray-400">
          [ECharts 图表区域 - 预订量]
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4">热门景点分布</h3>
        <div class="space-y-4">
          <div v-for="item in hotSpots" :key="item.name" class="flex items-center">
            <span class="w-24 text-sm text-gray-600 truncate">{{ item.name }}</span>
            <div class="flex-grow mx-3 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" :style="{ width: item.percent + '%' }"></div>
            </div>
            <span class="text-xs text-gray-400 w-8 text-right">{{ item.percent }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, Ticket, Location, Money, Top } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)

const hotSpots = [
  { name: '迎客松', percent: 85 },
  { name: '西海大峡谷', percent: 72 },
  { name: '光明顶', percent: 64 },
  { name: '莲花峰', percent: 58 },
  { name: '宏村', percent: 45 },
]

onMounted(() => {
  if (chartRef.value) {
    const myChart = echarts.init(chartRef.value)
    myChart.setOption({
      grid: { top: 20, right: 20, bottom: 20, left: 40, containLabel: true },
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      yAxis: { type: 'value' },
      series: [{ 
        data: [120, 132, 101, 134, 90, 230, 210], 
        type: 'line', 
        smooth: true,
        areaStyle: { opacity: 0.2, color: '#3b82f6' },
        itemStyle: { color: '#3b82f6' }
      }]
    })
    window.addEventListener('resize', () => myChart.resize())
  }
})
</script>