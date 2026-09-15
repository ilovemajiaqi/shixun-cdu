<template>
  <el-container class="h-screen bg-gray-100">
    <el-aside width="240px" class="bg-gray-900 text-white flex flex-col transition-all duration-300">
      <div class="h-16 flex items-center justify-center border-b border-gray-800 bg-gray-900">
        <span class="text-white text-lg font-bold tracking-wider flex items-center">
          <el-icon class="mr-2 text-blue-500"><Management /></el-icon> 成都·管理后台
        </span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="border-r-0 flex-grow py-4"
        router
        text-color="#9ca3af"
        active-text-color="#ffffff"
        background-color="#111827"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/attractions">
          <el-icon><Location /></el-icon>
          <span>景点管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/routes">
          <el-icon><Guide /></el-icon>
          <span>路线管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/bookings">
          <el-icon><List /></el-icon>
          <span>预订/订单</span>
        </el-menu-item>

        <div class="my-4 border-t border-gray-800"></div>

        <el-menu-item index="/" target="_blank">
          <el-icon><Monitor /></el-icon>
          <span>前台首页</span>
        </el-menu-item>
      </el-menu>
      
      <div class="p-4 border-t border-gray-800">
        <div class="flex items-center gap-3 mb-4 px-2">
          <el-avatar :size="32" class="bg-blue-600">A</el-avatar>
          <div>
            <div class="text-sm font-medium text-white">Administrator</div>
            <div class="text-xs text-gray-500">Super Admin</div>
          </div>
        </div>
        <el-button type="danger" plain size="small" class="w-full" @click="handleLogout">
          退出登录
        </el-button>
      </div>
    </el-aside>
    
    <el-container class="flex-col h-screen overflow-hidden">
      <el-header class="bg-white h-16 shadow-sm flex items-center justify-between px-6 z-10">
        <h2 class="text-lg font-semibold text-gray-800">{{ pageTitle }}</h2>
        <div class="flex items-center gap-4">
          <el-badge is-dot class="item">
            <el-button circle size="small"><el-icon><Bell /></el-icon></el-button>
          </el-badge>
        </div>
      </el-header>
      
      <el-main class="bg-gray-100 p-6 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataBoard, Location, User, List, Monitor, Management, Bell, Guide } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/admin/dashboard': '系统概览',
    '/admin/attractions': '景点信息管理',
    '/admin/routes': '游览路线管理',
    '/admin/users': '注册用户管理',
    '/admin/bookings': '预订订单管理'
  }
  return map[route.path] || '管理后台'
})

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出管理后台吗？', '提示', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.adminLogout()
    ElMessage.success({ message: '已安全退出', duration: 1500 })
    router.push('/admin/login')
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.el-menu-item.is-active) {
  background-color: #2563eb !important; /* blue-600 */
}

:deep(.el-menu-item:hover) {
  background-color: #1f2937 !important; /* gray-800 */
}
</style>
