<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <!-- Toolbar -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-4">
        <el-input v-model="searchQuery" placeholder="搜索路线名称" :prefix-icon="Search" class="w-64" />
      </div>
      <el-button type="primary" @click="openDialog('add')">
        <el-icon class="mr-1"><Plus /></el-icon> 新增路线
      </el-button>
    </div>

    <!-- Table -->
    <el-table :data="filteredRoutes" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="路线名称" width="150" font-weight="bold" />
      <el-table-column prop="tag" label="标签" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="row.tag === '热门' ? 'danger' : 'success'">{{ row.tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="desc" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="duration" label="预计耗时" width="120" />
      <el-table-column prop="distance" label="距离(km)" width="100" />
      <el-table-column label="包含景点" min-width="200">
        <template #default="{ row }">
          <div class="flex flex-wrap gap-1">
            <el-tag 
              v-for="spotId in row.path" 
              :key="spotId" 
              size="small" 
              effect="plain" 
              type="info"
            >
              {{ getSpotName(spotId) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDialog('edit', row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="flex justify-end mt-6">
      <el-pagination background layout="prev, pager, next" :total="filteredRoutes.length" :page-size="10" />
    </div>

    <!-- Edit/Add Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增路线' : '编辑路线'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="路线名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="form.tag" class="w-full">
            <el-option label="热门" value="热门" />
            <el-option label="亲子" value="亲子" />
            <el-option label="风光" value="风光" />
            <el-option label="休闲" value="休闲" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计耗时">
          <el-input v-model="form.duration" placeholder="如: 6-8小时" />
        </el-form-item>
        <el-form-item label="距离(km)">
          <el-input v-model="form.distance" placeholder="如: 8.5" />
        </el-form-item>
        <el-form-item label="途径景点">
          <el-select 
            v-model="form.path" 
            multiple 
            placeholder="请选择途径景点(按顺序)" 
            class="w-full"
          >
            <el-option
              v-for="spot in availableSpots"
              :key="spot.id"
              :label="spot.name"
              :value="spot.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="路线描述">
          <el-input v-model="form.desc" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Define Spot Interface
interface Spot {
  id: number;
  name: string;
}

// Available Spots (Synced with Attractions Data)
const availableSpots = ref<Spot[]>([])

const loadAvailableSpots = () => {
  const stored = localStorage.getItem('attractions_data')
  if (stored) {
    const attractions = JSON.parse(stored)
    availableSpots.value = attractions.map((a: any) => ({
      id: a.id,
      name: a.name
    }))
  } else {
    // Fallback defaults if no attraction data exists
    availableSpots.value = [
      { id: 1, name: '宽窄巷子' },
      { id: 2, name: '锦里古街' },
      { id: 3, name: '武侯祠' },
      { id: 4, name: '杜甫草堂' },
      { id: 5, name: '熊猫基地' },
      { id: 6, name: '人民公园' },
      { id: 7, name: '都江堰' },
      { id: 8, name: '青城山' },
      { id: 9, name: '西岭雪山' },
      { id: 10, name: '川剧艺术中心' },
    ]
  }
}

const getSpotName = (id: number) => {
  const spot = availableSpots.value.find(s => s.id === id)
  return spot ? spot.name : `未知景点(${id})`
}

// Mock Data (Initial Sync with Frontend)
const initialRoutes = [
  { 
    id: 1, 
    name: '天府经典一日游', 
    tag: '热门',
    desc: '一线串联宽窄巷子、人民公园与锦里古街，上午喝茶掏耳朵、傍晚看红灯夜市，半天读懂成都的生活底色。',
    duration: '6-8小时',
    distance: '9.2',
    path: [1, 6, 2]
  },
  { 
    id: 2, 
    name: '熊猫与古迹深度线', 
    tag: '亲子',
    desc: '清晨赶在熊猫最活跃的时段进基地，午后转入武侯祠与杜甫草堂，一天之内看完自然与人文两条脉络。',
    duration: '7-9小时',
    distance: '12.6',
    path: [5, 3, 4]
  },
  { 
    id: 3, 
    name: '世界遗产双遗游', 
    tag: '风光',
    desc: '都江堰看两千年水利智慧，青城山登道家幽静山林，两处世界遗产同日打卡，适合体力较好的游客。',
    duration: '全天',
    distance: '58.0',
    path: [7, 8]
  },
  { 
    id: 4, 
    name: '夜色与川剧之旅', 
    tag: '休闲',
    desc: '傍晚从人民公园出发，锦里看灯、川剧中心看变脸吐火，以一场两小时的演出收尾，夜间动线不赶路。',
    duration: '4-5小时',
    distance: '6.4',
    path: [6, 2, 10]
  }
]

const routes = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const form = ref<any>({})

// Load from localStorage
const loadRoutes = () => {
  const stored = localStorage.getItem('routes_data')
  if (stored) {
    routes.value = JSON.parse(stored)
  } else {
    routes.value = JSON.parse(JSON.stringify(initialRoutes))
    saveRoutes()
  }
}

// Save to localStorage
const saveRoutes = () => {
  localStorage.setItem('routes_data', JSON.stringify(routes.value))
}

loadRoutes()
loadAvailableSpots()

const filteredRoutes = computed(() => {
  if (!searchQuery.value) return routes.value
  return routes.value.filter(route => 
    route.name.includes(searchQuery.value) || 
    route.desc.includes(searchQuery.value)
  )
})

const openDialog = (type: 'add' | 'edit', row?: any) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    form.value = JSON.parse(JSON.stringify(row))
  } else {
    form.value = {
      name: '',
      tag: '热门',
      desc: '',
      duration: '',
      distance: '',
      path: []
    }
  }
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (!form.value.name || !form.value.path.length) {
    ElMessage.warning({ message: '请填写完整信息', duration: 1500 })
    return
  }

  if (dialogType.value === 'add') {
    const newId = routes.value.length > 0 ? Math.max(...routes.value.map(r => r.id)) + 1 : 1
    routes.value.push({
      ...form.value,
      id: newId
    })
    ElMessage.success({ message: '添加成功', duration: 1500 })
  } else {
    const index = routes.value.findIndex(r => r.id === form.value.id)
    if (index !== -1) {
      routes.value[index] = { ...form.value }
      ElMessage.success({ message: '更新成功', duration: 1500 })
    }
  }
  
  saveRoutes()
  dialogVisible.value = false
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除路线 "${row.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    routes.value = routes.value.filter(r => r.id !== row.id)
    saveRoutes()
    ElMessage.success({ message: '删除成功', duration: 1500 })
  })
}
</script>