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
import { useRouteStore } from '@/stores/route'
import { useAttractionStore } from '@/stores/attraction'

// 路线与可选景点都来自 store，不再各自读 localStorage
const routeStore = useRouteStore()
const attractionStore = useAttractionStore()
routeStore.load()
attractionStore.load()

const routes = computed(() => routeStore.recommended)

// 可选景点 = 景点列表（id + name 即可满足下拉需要）
const availableSpots = computed(() =>
  attractionStore.list.map(a => ({ id: a.id, name: a.name }))
)

const getSpotName = (id: number) => {
  const spot = availableSpots.value.find(s => s.id === id)
  return spot ? spot.name : `未知景点(${id})`
}

const loading = ref(false)
const searchQuery = ref('')
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const form = ref<any>({})

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
    routeStore.addRoute(form.value)
    ElMessage.success({ message: '添加成功', duration: 1500 })
  } else {
    routeStore.updateRoute(form.value.id, form.value)
    ElMessage.success({ message: '更新成功', duration: 1500 })
  }

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
    routeStore.removeRoute(row.id)
    ElMessage.success({ message: '删除成功', duration: 1500 })
  })
}
</script>