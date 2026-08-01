<template>
  <div class="min-h-screen flex flex-col font-sans text-gray-800">
    <!-- Transparent/Gradient Navbar -->
    <nav 
      :class="[
        'fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4 flex justify-between items-center',
        (isScrolled || route.path !== '/') ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent text-white'
      ]"
    >
      <div class="flex items-center gap-2">
        <el-icon class="text-2xl" :class="(isScrolled || route.path !== '/') ? 'text-green-600' : 'text-white'"><Promotion /></el-icon>
        <span class="text-2xl font-bold tracking-wide" :class="(isScrolled || route.path !== '/') ? 'text-gray-800' : 'text-white'">黄山旅游</span>
      </div>

      <div class="hidden md:flex items-center space-x-8">
        <router-link 
          v-for="item in navItems" 
          :key="item.path" 
          :to="item.path"
          class="text-base font-medium transition-colors hover:text-green-400 relative group"
          :class="[
            isActive(item.path) ? 'text-green-400' : ((isScrolled || route.path !== '/') ? 'text-gray-600' : 'text-white/90')
          ]"
        >
          {{ item.name }}
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
        </router-link>
      </div>

      <div class="flex items-center gap-4">
        <template v-if="username">
           <el-dropdown trigger="click" @command="handleCommand">
            <span class="flex items-center cursor-pointer" :class="(isScrolled || route.path !== '/') ? 'text-gray-700' : 'text-white'">
              <el-avatar :size="32" :src="user.avatar || undefined" class="mr-2 bg-gradient-to-r from-green-400 to-blue-500 text-white border-2 border-white/50">
                {{ !user.avatar ? username.charAt(0).toUpperCase() : '' }}
              </el-avatar>
              <span class="hidden sm:inline">{{ username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="user">用户中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login">
            <el-button type="primary" round class="bg-gradient-to-r from-green-500 to-blue-500 border-none hover:shadow-lg hover:scale-105 transition-transform">登录 / 注册</el-button>
          </router-link>
        </template>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-xl font-bold mb-4 flex items-center"><el-icon class="mr-2"><Promotion /></el-icon> 黄山旅游</h3>
          <p class="text-gray-400 text-sm">五岳归来不看山，黄山归来不看岳。提供最专业的黄山旅游服务。</p>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-4">快速链接</h4>
          <ul class="space-y-2 text-gray-400">
            <li><router-link to="/" class="hover:text-green-400">首页</router-link></li>
            <li><router-link to="/attractions" class="hover:text-green-400">景点推荐</router-link></li>
            <li><router-link to="/routes" class="hover:text-green-400">路线规划</router-link></li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-4">联系我们</h4>
          <p class="text-gray-400 text-sm mb-2">电话: 400-800-8888</p>
          <p class="text-gray-400 text-sm">邮箱: service@huangshan.com</p>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-4">关注我们</h4>
        </div>
      </div>
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
        &copy; 2026 Huangshan Tourism Platform. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const isScrolled = ref(false)

const user = ref<any>({})
const username = computed(() => user.value.username || '')

const loadUser = () => {
  try {
    user.value = JSON.parse(localStorage.getItem('user') || '{}')
  } catch (e) {
    user.value = {}
  }
}

const navItems = [
  { name: '首页', path: '/' },
  { name: '景点推荐', path: '/attractions' },
  { name: '路线规划', path: '/routes' },
  { name: '用户中心', path: '/user' }, // Will redirect/switch layout
]

const isActive = (path: string) => route.path === path

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    user.value = {}
    ElMessage.success({ message: '已退出登录', duration: 1500 })
    router.push('/login')
  } else if (command === 'user') {
    router.push({ name: 'user' })
  }
}

onMounted(() => {
  loadUser()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('user-updated', loadUser)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('user-updated', loadUser)
})
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
</style>
