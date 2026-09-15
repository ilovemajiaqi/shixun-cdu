<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
      <div class="p-8">
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 text-blue-500 mb-4">
            <el-icon class="text-3xl"><Management /></el-icon>
          </div>
          <h2 class="text-2xl font-bold text-white tracking-wide">管理后台登录</h2>
          <p class="text-gray-400 mt-2 text-sm">成都旅游服务平台 · 管理员端</p>
        </div>

        <el-form :model="form" class="space-y-6" @submit.prevent="handleLogin">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">管理员账号</label>
            <el-input 
              v-model="form.username" 
              placeholder="请输入管理员账号" 
              prefix-icon="User"
              size="large"
              class="custom-input"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">密码</label>
            <el-input 
              v-model="form.password" 
              type="password" 
              placeholder="请输入密码" 
              prefix-icon="Lock"
              show-password
              size="large"
              class="custom-input"
            />
          </div>
          
          <div class="text-xs text-gray-400">默认账号/密码：admin / admin</div>

          <el-button 
            type="primary" 
            class="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 border-none hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-900/50" 
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form>
      </div>
      
      <div class="bg-gray-900/50 p-4 text-center border-t border-gray-700">
        <router-link to="/" class="text-sm text-gray-500 hover:text-white transition-colors">
          返回前台首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Management } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

const router = useRouter()
const loading = ref(false)
const form = ref({
  username: 'admin',
  password: '' // Clear default password for security, or keep 'admin' if requested, but README says 123456
})
// Set default values matching README for convenience
form.value.password = '123456' 

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning({ message: '请输入账号和密码', duration: 1500 })
    return
  }

  loading.value = true
  try {
    const response = await api.post('/users/login', {
      username: form.value.username,
      password: form.value.password
    })
    
    const user = response.data
    
    if (user.role === 'ADMIN') {
      localStorage.setItem('admin_token', 'mock_admin_token')
      localStorage.setItem('admin_user', JSON.stringify({
        username: user.username,
        role: user.role
      }))
      ElMessage.success({ message: '登录成功', duration: 1500 })
      router.push('/admin/dashboard')
    } else {
      ElMessage.error({ message: '无管理员权限', duration: 1500 })
    }
  } catch (error) {
    ElMessage.error({ message: '账号或密码错误', duration: 1500 })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.custom-input :deep(.el-input__wrapper) {
  background-color: #1f2937;
  box-shadow: 0 0 0 1px #374151 inset;
  transition: all 0.3s;
}

.custom-input :deep(.el-input__wrapper:hover),
.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3b82f6 inset;
  background-color: #1f2937;
}

.custom-input :deep(.el-input__inner) {
  color: white;
  height: 48px;
}
</style>
