<template>
  <el-menu
    :default-active="activeIndex"
    mode="horizontal"
    :ellipsis="false"
    router
    class="px-4"
  >
    <el-menu-item index="/">
      <div class="text-xl font-bold text-mountain-green">成都旅游</div>
    </el-menu-item>
    <div class="flex-grow" />
    <el-menu-item index="/">首页</el-menu-item>
    <el-menu-item index="/attractions">景点推荐</el-menu-item>
    <el-menu-item index="/routes">路线规划</el-menu-item>
    <el-menu-item index="/user" v-if="userStore.isLoggedIn">
      <div class="flex items-center gap-2">
        <el-avatar :size="28" :src="userStore.profile.avatar">{{ userStore.username.charAt(0).toUpperCase() }}</el-avatar>
        <span class="hidden md:inline">{{ userStore.username }}</span>
      </div>
    </el-menu-item>
    <el-menu-item index="/login" v-else>登录/注册</el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const activeIndex = ref(route.path)

// 直接读 store：登录/登出/改资料后自动重渲染，不再需要 user-updated 事件桥接。
const userStore = useUserStore()
</script>
