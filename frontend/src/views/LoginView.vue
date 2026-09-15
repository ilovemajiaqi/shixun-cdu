<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <!-- Background Image -->
    <div 
      class="absolute inset-0 z-0 bg-cover bg-center"
      style="background-image: url('/images/chengdu/hero-panda.jpg'); filter: brightness(0.7);"
    ></div>
    
    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-md px-6 py-12 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl transform transition-all duration-500 hover:scale-[1.01]">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-white mb-2 tracking-wide font-montserrat drop-shadow-md">欢迎回来</h1>
        <p class="text-gray-200 text-sm">登录成都旅游服务平台，开启您的蓉城之旅</p>
      </div>

      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        class="space-y-6"
        size="large"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="用户名 / 手机号" 
            :prefix-icon="User"
            class="custom-input"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="密码" 
            :prefix-icon="Lock"
            show-password
            class="custom-input"
          />
        </el-form-item>

        <el-button 
          type="primary" 
          class="w-full bg-gradient-to-r from-orange-500 to-red-500 border-none h-12 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300" 
          @click="handleLogin(formRef)" 
          :loading="loading"
        >
          立即登录
        </el-button>
      </el-form>

      <div class="mt-8 text-center flex flex-col gap-3 items-center">
        <div>
          <p class="text-gray-200 text-sm mb-2">还没有账号？</p>
          <router-link to="/register">
            <el-button plain round class="bg-transparent text-white border-white hover:bg-white hover:text-green-600 transition-colors w-32">
              注册账号
            </el-button>
          </router-link>
        </div>
        
        <router-link to="/admin/login" class="text-gray-300 text-xs hover:text-white underline transition-colors mt-2">
          管理员登录入口
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await api.post('/users/login', {
          username: form.username,
          password: form.password
        })
        
        const user = response.data
        
        localStorage.setItem('user', JSON.stringify({
          username: user.username,
          email: user.email,
          role: user.role,
          token: 'mock-token',
          avatar: ''
        }))
        
        ElMessage.success({ message: '登录成功，欢迎回来！', duration: 1500 })
        router.push('/')
      } catch (error: any) {
        console.error('Login error:', error)
        ElMessage.error({ message: '登录失败：账号或密码错误', duration: 1500 })
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

/* Custom Input Styling to match transparent theme */
:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 8px 15px;
  transition: all 0.3s;
}

:deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border-color: #fff !important;
  box-shadow: 0 0 0 1px #fff inset !important;
}

:deep(.el-input__inner) {
  color: #fff !important;
  font-weight: 500;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.el-input__icon) {
  color: #fff;
}
</style>
