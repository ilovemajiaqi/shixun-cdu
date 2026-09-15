<template>
  <el-container class="h-screen bg-gray-50">
    <el-aside width="240px" class="bg-white shadow-md flex flex-col transition-all duration-300">
      <div class="h-16 flex items-center justify-center border-b border-gray-100 bg-gradient-to-r from-green-500 to-teal-500">
        <span class="text-white text-xl font-bold tracking-wider flex items-center">
          <el-icon class="mr-2"><Promotion /></el-icon> 成都旅游
        </span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="border-r-0 flex-grow py-4"
        router
        text-color="#4b5563"
        active-text-color="#10b981"
        background-color="#ffffff"
      >
        <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
        
        <el-menu-item index="/user?tab=bookings">
          <el-icon><List /></el-icon>
          <span>预订记录</span>
        </el-menu-item>
        
        <el-menu-item index="/user?tab=favorites">
          <el-icon><Star /></el-icon>
          <span>收藏景点</span>
        </el-menu-item>

        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>返回首页</span>
        </el-menu-item>
      </el-menu>
      
      <div class="p-4 border-t border-gray-100 text-center text-xs text-gray-400">
        &copy; 2026 Chengdu Tourism
      </div>
    </el-aside>
    
    <el-container>
      <el-header class="bg-white h-16 shadow-sm flex items-center justify-between px-6 z-10">
        <div class="flex items-center text-gray-500">
          <el-icon class="mr-2 text-lg cursor-pointer hover:text-green-600"><Expand /></el-icon>
          <span class="text-sm">欢迎来到成都旅游服务平台</span>
        </div>
        
        <div class="flex items-center space-x-4">
          <el-tooltip content="通知" placement="bottom">
             <el-badge is-dot class="cursor-pointer">
               <el-icon class="text-gray-600 text-lg hover:text-green-600"><Bell /></el-icon>
             </el-badge>
          </el-tooltip>
          
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="flex items-center cursor-pointer text-gray-700 hover:text-green-600">
              <el-avatar :size="32" class="mr-2 bg-green-100 text-green-600">User</el-avatar>
              {{ username }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="bg-gray-50 p-6 overflow-y-auto">
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
import { HomeFilled, User, Promotion, Expand, Bell, ArrowDown, List, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.fullPath)

const user = JSON.parse(localStorage.getItem('user') || '{}')
const username = computed(() => user.username || '游客')

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('user')
    ElMessage.success({ message: '已退出登录', duration: 1500 })
    router.push('/login')
  } else if (command === 'profile') {
    router.push({ name: 'user' })
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.el-menu-item.is-active) {
  background-color: #ecfdf5 !important; /* green-50 */
  border-right: 3px solid #10b981; /* green-500 */
}

:deep(.el-menu-item:hover) {
  background-color: #f9fafb !important; /* gray-50 */
}
</style>
