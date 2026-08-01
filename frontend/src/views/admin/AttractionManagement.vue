<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <!-- Toolbar -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-4">
        <el-input v-model="searchQuery" placeholder="搜索景点名称" :prefix-icon="Search" class="w-64" />
        <el-select v-model="filterRegion" placeholder="所有区域" class="w-40" clearable>
          <el-option label="所有区域" value="" />
          <el-option label="玉屏景区" value="玉屏景区" />
          <el-option label="北海景区" value="北海景区" />
          <el-option label="西海景区" value="西海景区" />
          <el-option label="天海景区" value="天海景区" />
        </el-select>
        <el-button type="warning" plain @click="resetData">
          <el-icon class="mr-1"><Refresh /></el-icon> 重置数据
        </el-button>
      </div>
      <el-button type="primary" @click="openDialog('add')">
        <el-icon class="mr-1"><Plus /></el-icon> 新增景点
      </el-button>
    </div>

    <!-- Table -->
    <el-table :data="filteredAttractions" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="图片" width="100">
        <template #default="{ row }">
          <el-image :src="row.mainImage" class="w-16 h-12 rounded object-cover" :preview-src-list="[row.mainImage]" preview-teleported />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="景点名称" width="120" font-weight="bold" />
      <el-table-column prop="region" label="所属区域" width="120">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.region }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }">
          <span class="text-orange-500 font-medium">¥{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDialog('edit', row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="flex justify-end mt-6">
      <el-pagination background layout="prev, pager, next" :total="filteredAttractions.length" :page-size="10" />
    </div>

    <!-- Edit/Add Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增景点' : '编辑景点'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="景点名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="所属区域">
          <el-select v-model="form.region" class="w-full">
            <el-option label="玉屏景区" value="玉屏景区" />
            <el-option label="北海景区" value="北海景区" />
            <el-option label="西海景区" value="西海景区" />
            <el-option label="天海景区" value="天海景区" />
            <el-option label="周边景点" value="周边景点" />
          </el-select>
        </el-form-item>
        <el-form-item label="门票价格">
          <el-input-number v-model="form.price" :min="0" />
        </el-form-item>
        <el-form-item label="开放时间">
          <el-input v-model="form.openTime" placeholder="如: 08:00 - 17:00" />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleImageChange"
          >
            <img v-if="form.mainImage" :src="form.mainImage" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="景点描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Initial Mock Data
const initialAttractions = [
  {
    id: 1,
    name: '迎客松',
    region: '玉屏景区',
    description: '位于玉屏楼左侧，倚青狮石破石而生，高10米，胸径0.64米，树龄至少已有800年，一侧枝桠伸出，如人伸出一只臂膀欢迎远道而来的客人，另一只手优雅地斜插在裤兜里，雍容大度，姿态优美。',
    price: 190,
    openTime: '06:00 - 17:30',
    status: 1,
    mainImage: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: '西海大峡谷',
    region: '西海景区',
    description: '因谷中有白云溪，又称“白云谷”。此谷是由近旁的石柱峰、石床峰，右前方的薄刀峰、飞来石，对面的排云亭、丹霞峰、松林峰和左前方的九龙峰、云外峰等奇峰怪石所围成的空间。',
    price: 0,
    openTime: '08:00 - 16:30',
    status: 1,
    mainImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: '光明顶',
    region: '天海景区',
    description: '黄山第二高峰，海拔1860米。这里高旷开阔，日光照射久长，故名。顶上平坦而高旷，可观东海奇景、西海群峰，炼丹、天都、莲花、玉屏、鳌鱼诸峰尽收眼底。',
    price: 0,
    openTime: '全天开放',
    status: 1,
    mainImage: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: '宏村',
    region: '周边景点',
    description: '宏村有“画里乡村”之称，截至2014年，全镇完好保存明清民居140余幢，主要景点有：南湖春晓，书院诵读，月沼风荷，牛肠水圳，双溪映碧，亭前古树，雷岗夕照等。',
    price: 104,
    openTime: '07:30 - 17:30',
    status: 1,
    mainImage: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    name: '莲花峰',
    region: '玉屏景区',
    description: '黄山最高峰，海拔1864.8米。峻峭高耸，气势雄伟。因主峰突兀，小峰簇拥，俨若新莲初开，仰天怒放，故名“莲花峰”。',
    price: 0,
    openTime: '07:00 - 16:00',
    status: 1,
    mainImage: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
]

const attractions = ref<any[]>([...initialAttractions])

// Save to localStorage
const saveAttractions = () => {
  localStorage.setItem('attractions_data', JSON.stringify(attractions.value))
}

// Load from localStorage if available
const loadAttractions = () => {
  const stored = localStorage.getItem('attractions_data')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        attractions.value = parsed
      } else {
        // Only reset if empty array, but we also want to ensure we have data if user wants
        // For now, if empty array in storage, we trust it (user deleted all)
        // BUT user said "no display", so maybe they want the default back.
        // Let's NOT override empty array automatically if it was intentional,
        // but since this is a demo, let's assume empty = bad state for now.
        // OR better: trust the Reset button I just added.
        // Let's stick to: if stored is valid array, use it.
        attractions.value = parsed
      }
    } catch {
      console.error('Failed to parse attractions_data')
    }
  }
  // If nothing in storage, save defaults
  if (!localStorage.getItem('attractions_data')) {
    saveAttractions()
  }
}

// Reset Data
const resetData = () => {
  ElMessageBox.confirm('确定要重置为初始演示数据吗？这将覆盖当前所有更改。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    attractions.value = JSON.parse(JSON.stringify(initialAttractions))
    saveAttractions()
    ElMessage.success({ message: '数据已重置', duration: 1500 })
  })
}
loadAttractions()

const searchQuery = ref('')
const filterRegion = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const form = ref<any>({})

const filteredAttractions = computed(() => {
  return attractions.value.filter(item => {
    const matchQuery = (item.name || '').includes(searchQuery.value)
    const matchRegion = !filterRegion.value || item.region === filterRegion.value
    return matchQuery && matchRegion
  })
})

const handleStatusChange = (row: any) => {
  saveAttractions()
  ElMessage.success({ message: `状态更新: ${row.name} 已${row.status === 1 ? '上架' : '下架'}`, duration: 1500 })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除景点 "${row.name}" 吗？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    attractions.value = attractions.value.filter(item => item.id !== row.id)
    saveAttractions()
    ElMessage.success({ message: '删除成功', duration: 1500 })
  })
}

const openDialog = (type: 'add' | 'edit', row?: any) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    form.value = { ...row }
  } else {
    form.value = { status: 1, price: 0, region: '玉屏景区' }
  }
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (!form.value.name) {
    ElMessage.warning({ message: '请输入景点名称', duration: 1500 })
    return
  }
  
  if (dialogType.value === 'add') {
    const newId = Math.max(...attractions.value.map(i => i.id)) + 1
    attractions.value.push({ ...form.value, id: newId })
    saveAttractions()
    ElMessage.success({ message: '添加成功', duration: 1500 })
  } else {
    const index = attractions.value.findIndex(i => i.id === form.value.id)
    if (index !== -1) {
      attractions.value[index] = { ...form.value }
      saveAttractions()
      ElMessage.success({ message: '更新成功', duration: 1500 })
    }
  }
  dialogVisible.value = false
}

const handleImageChange = (uploadFile: any) => {
  if (uploadFile.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.mainImage = e.target?.result as string
    }
    reader.readAsDataURL(uploadFile.raw)
  }
}
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}
</style>
