<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <!-- Toolbar -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-4">
        <el-input v-model="searchQuery" placeholder="搜索景点名称" :prefix-icon="Search" class="w-64" />
        <el-select v-model="filterRegion" placeholder="所有区域" class="w-40" clearable>
          <el-option label="所有区域" value="" />
          <el-option label="市区经典" value="市区经典" />
          <el-option label="熊猫生态" value="熊猫生态" />
          <el-option label="世界遗产" value="世界遗产" />
          <el-option label="近郊山水" value="近郊山水" />
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
            <el-option label="市区经典" value="市区经典" />
            <el-option label="熊猫生态" value="熊猫生态" />
            <el-option label="世界遗产" value="世界遗产" />
            <el-option label="近郊山水" value="近郊山水" />
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
import { useAttractionStore } from '@/stores/attraction'

/**
 * 景点数据统一由 attractionStore 管理。
 * 此前这里和前台 AttractionsView 各硬编码了一份 10 条数据，
 * 改一处漏一处；现在两处共用同一份数据源。
 */
const attractionStore = useAttractionStore()
attractionStore.load()

const attractions = computed(() => attractionStore.list)

// Reset Data
const resetData = () => {
  ElMessageBox.confirm('确定要重置为初始演示数据吗？这将覆盖当前所有更改。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    attractionStore.resetToDefaults()
    ElMessage.success({ message: '数据已重置', duration: 1500 })
  })
}

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
  attractionStore.setStatus(row.id, row.status)
  ElMessage.success({ message: `状态更新: ${row.name} 已${row.status === 1 ? '上架' : '下架'}`, duration: 1500 })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除景点 "${row.name}" 吗？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    attractionStore.removeAttraction(row.id)
    ElMessage.success({ message: '删除成功', duration: 1500 })
  })
}

const openDialog = (type: 'add' | 'edit', row?: any) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    form.value = { ...row }
  } else {
    form.value = { status: 1, price: 0, region: '市区经典' }
  }
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (!form.value.name) {
    ElMessage.warning({ message: '请输入景点名称', duration: 1500 })
    return
  }

  if (dialogType.value === 'add') {
    attractionStore.addAttraction(form.value)
    ElMessage.success({ message: '添加成功', duration: 1500 })
  } else {
    attractionStore.updateAttraction(form.value.id, form.value)
    ElMessage.success({ message: '更新成功', duration: 1500 })
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
