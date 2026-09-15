<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <!-- Tools Bar -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <el-input
            v-model="userSearch"
            placeholder="搜索用户名/邮箱"
            :prefix-icon="Search"
            clearable
            class="w-72"
          />
          <el-select v-model="roleFilter" placeholder="角色" class="w-40" clearable>
            <el-option label="全部角色" value="" />
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="状态" class="w-40" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="正常" value="active" />
            <el-option label="封禁" value="banned" />
          </el-select>
        </div>
        <el-button type="primary" @click="openEditDialog()">新增用户</el-button>
      </div>

      <!-- User Table -->
      <el-table :data="filteredUsers" style="width: 100%" max-height="600">
        <el-table-column prop="id" label="ID" width="150" sortable show-overflow-tooltip />
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <el-avatar :size="36" :src="row.avatar" class="flex-shrink-0">
                {{ row.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ row.username }}</div>
                <div class="text-xs text-gray-500">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerDate" label="注册时间" width="150" sortable />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button 
              v-if="row.status === 'active'" 
              link type="warning" size="small" 
              @click="toggleUserStatus(row)"
              :disabled="row.username === 'admin'"
            >
              封禁
            </el-button>
            <el-button 
              v-else 
              link type="success" size="small" 
              @click="toggleUserStatus(row)"
            >
              解封
            </el-button>
            <el-button 
              link type="danger" size="small" 
              @click="handleDelete(row)"
              :disabled="row.username === 'admin'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingUser ? '编辑用户' : '新增用户'"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="!!editingUser" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="密码" v-if="!editingUser">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="正常" value="active" />
            <el-option label="封禁" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item label="头像">
          <div class="flex items-center gap-4">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleAvatarChange"
              accept="image/*"
            >
              <div v-if="form.avatar" class="relative group cursor-pointer">
                 <el-avatar :size="80" :src="form.avatar" />
                 <div class="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                   更换
                 </div>
              </div>
              <el-icon v-else class="avatar-uploader-icon border border-dashed border-gray-300 rounded-full w-20 h-20 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer text-2xl text-gray-400">
                <Plus />
              </el-icon>
            </el-upload>
            <div class="text-xs text-gray-500">点击头像可上传新图片</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="savingUser" :disabled="savingUser" @click="saveUser">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type UploadProps } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 注册用户数据由 userStore 统一管理（含种子数据补齐逻辑）
const userStore = useUserStore()
const STORAGE_KEY = 'registered_users'

const users = computed(() => userStore.registeredUsers)

const loadUsers = () => {
  userStore.loadRegisteredUsers(true)
}

const saveUsers = () => {
  userStore.persistRegisteredUsers()
}

// 跨标签页同步仍然需要监听原生 storage 事件（store 无法感知其他标签页的写入）
const onStorage = (e: StorageEvent) => {
  if (e.key === STORAGE_KEY) userStore.loadRegisteredUsers(true)
}

onMounted(() => {
  loadUsers()
  window.addEventListener('storage', onStorage)
})

onUnmounted(() => {
  window.removeEventListener('storage', onStorage)
})

// --- Filtering ---
const userSearch = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const q = userSearch.value.toLowerCase()
    const matchQuery = !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchRole = !roleFilter.value || u.role === roleFilter.value
    const matchStatus = !statusFilter.value || u.status === statusFilter.value
    return matchQuery && matchRole && matchStatus
  })
})

// --- Actions ---
const toggleUserStatus = (row: any) => {
  const action = row.status === 'active' ? '封禁' : '解封'
  ElMessageBox.confirm(`确定要${action}用户 ${row.username} 吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'active' ? 'banned' : 'active'
    saveUsers()
    ElMessage.success({ message: `用户已${action}`, duration: 1500 })
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗？此操作不可恢复。`, '警告', {
    type: 'error'
  }).then(() => {
    userStore.registeredUsers = users.value.filter(u => u.username !== row.username)
    saveUsers()
    ElMessage.success({ message: '用户已删除', duration: 1500 })
  })
}

// --- Edit Dialog ---
const dialogVisible = ref(false)
const editingUser = ref<any>(null)
const form = reactive({
  username: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active',
  avatar: ''
})
const savingUser = ref(false)

const openEditDialog = (row?: any) => {
  if (row) {
    editingUser.value = row
    form.username = row.username
    form.email = row.email
    form.password = row.password // In real app, don't show password
    form.role = row.role
    form.status = row.status
    form.avatar = row.avatar
  } else {
    editingUser.value = null
    form.username = ''
    form.email = ''
    form.password = ''
    form.role = 'user',
    form.status = 'active'
    form.avatar = ''
  }
  dialogVisible.value = true
}

const handleAvatarChange: UploadProps['onChange'] = (uploadFile) => {
  if (uploadFile.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.avatar = e.target?.result as string
    }
    reader.readAsDataURL(uploadFile.raw)
  }
}

const saveUser = () => {
  if (savingUser.value) return
  if (!form.username) {
    ElMessage.error({ message: '用户名不能为空', duration: 1500 })
    return
  }
  savingUser.value = true

  if (editingUser.value) {
    // Update existing
    const idx = users.value.findIndex(u => u.username === editingUser.value.username)
    if (idx !== -1) {
      userStore.registeredUsers[idx] = {
        ...userStore.registeredUsers[idx],
        email: form.email,
        role: form.role,
        status: form.status,
        avatar: form.avatar
      }
      // Note: Username usually immutable, but if we allowed it, we'd check duplicates
    }
  } else {
    // Create new
    if (users.value.find(u => u.username === form.username)) {
      ElMessage.error({ message: '用户名已存在', duration: 1500 })
      savingUser.value = false
      return
    }
    userStore.registeredUsers.unshift({
      id: Date.now(),
      username: form.username,
      email: form.email,
      password: form.password || '123456',
      role: form.role,
      status: form.status,
      registerDate: new Date().toLocaleDateString(),
      avatar: form.avatar
    })
  }

  saveUsers()
  dialogVisible.value = false
  ElMessage.success({ message: editingUser.value ? '更新成功' : '创建成功', duration: 1500 })
  savingUser.value = false
}
</script>
