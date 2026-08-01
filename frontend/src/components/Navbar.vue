<template>
  <el-menu
    :default-active="activeIndex"
    mode="horizontal"
    :ellipsis="false"
    router
    class="px-4"
  >
    <el-menu-item index="/">
      <div class="text-xl font-bold text-mountain-green">黄山旅游</div>
    </el-menu-item>
    <div class="flex-grow" />
    <el-menu-item index="/">首页</el-menu-item>
    <el-menu-item index="/attractions">景点推荐</el-menu-item>
    <el-menu-item index="/routes">路线规划</el-menu-item>
    <el-menu-item index="/user" v-if="user.username">
      <div class="flex items-center gap-2">
        <el-avatar :size="28" :src="user.avatar">{{ user.username?.charAt(0).toUpperCase() }}</el-avatar>
        <span class="hidden md:inline">{{ user.username }}</span>
      </div>
    </el-menu-item>
    <el-menu-item index="/login" v-else>登录/注册</el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeIndex = ref(route.path)

const user = ref<any>(JSON.parse(localStorage.getItem('user') || '{}'))
const loadUser = () => {
  user.value = JSON.parse(localStorage.getItem('user') || '{}')
}

onMounted(() => {
  window.addEventListener('storage', (e) => {
    if (e.key === 'user') loadUser()
  })
  window.addEventListener('user-updated', loadUser)
})
</script>
