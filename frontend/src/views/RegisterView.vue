<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <!-- Background Image -->
    <div 
      class="absolute inset-0 z-0 bg-cover bg-center"
      style="background-image: url('https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'); filter: brightness(0.7);"
    ></div>
    
    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-md px-6 py-12 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl transform transition-all duration-500 hover:scale-[1.01]">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-extrabold text-white mb-2 tracking-wide font-montserrat drop-shadow-md">加入我们</h1>
        <p class="text-gray-200 text-sm">注册黄山旅游服务平台，开启您的奇妙之旅</p>
      </div>

      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        class="space-y-5"
        size="large"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="用户名" 
            :prefix-icon="User"
            class="custom-input"
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input 
            v-model="form.email" 
            placeholder="邮箱地址" 
            :prefix-icon="Message"
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

        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="确认密码" 
            :prefix-icon="Lock"
            show-password
            class="custom-input"
          />
        </el-form-item>

        <el-button 
          type="primary" 
          class="w-full bg-gradient-to-r from-green-500 to-teal-500 border-none h-12 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300" 
          @click="handleRegister(formRef)" 
          :loading="loading"
        >
          立即注册
        </el-button>
      </el-form>

      <div class="mt-8 text-center">
        <p class="text-gray-200 text-sm mb-4">已有账号？</p>
        <router-link to="/login">
          <el-button plain round class="bg-transparent text-white border-white hover:bg-white hover:text-orange-500 transition-colors w-32">
            去登录
          </el-button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import api from '@/utils/api'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validatePass2 = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
})

const handleRegister = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        await api.post('/users/register', {
          username: form.username,
          password: form.password,
          email: form.email,
          role: 'USER'
        })

        ElMessage.success({ message: '注册成功，请登录', duration: 1500 })
        router.push('/login')
      } catch (error: any) {
        console.error('Register error:', error)
        if (error.response && error.response.data && error.response.data.message) {
           ElMessage.error({ message: error.response.data.message, duration: 1500 })
        } else {
           ElMessage.error({ message: '注册失败，用户名可能已存在', duration: 1500 })
        }
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
