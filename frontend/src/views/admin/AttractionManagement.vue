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

// Initial Mock Data
const initialAttractions = [
  {
    id: 1,
    name: '宽窄巷子',
    region: '市区经典',
    description: '由宽巷子、窄巷子、井巷子三条平行老街组成，是成都遗留下来的较成规模的清朝古街道。青砖黛瓦、门头匾额保存完好，如今聚合成茶馆、川剧变脸小剧场、手作市集与川味小吃摊，闲坐一下午便是最地道的成都节奏。',
    price: 0,
    openTime: '全天开放',
    status: 1,
    mainImage: '/images/chengdu/kuanzhai.jpg',
  },
  {
    id: 2,
    name: '锦里古街',
    region: '市区经典',
    description: '紧邻武侯祠的仿古商业街，以三国文化与成都民俗为主题。夜幕降临时数百盏红灯次第亮起，皮影戏、糖画、三大炮与张飞牛肉的摊子沿街铺开，被称为“成都版清明上河图”。',
    price: 0,
    openTime: '全天开放（夜间灯光最佳）',
    status: 1,
    mainImage: '/images/chengdu/jinli.jpg',
  },
  {
    id: 3,
    name: '武侯祠',
    region: '市区经典',
    description: '全国影响最大的三国遗迹博物馆，纪念诸葛亮与蜀汉群臣，由惠陵、汉昭烈庙、武侯祠三部分组成。红墙夹道与翠竹相映，是成都最具人文厚度的一处封地。',
    price: 50,
    openTime: '08:00 - 18:00',
    status: 1,
    mainImage: '/images/chengdu/wuhouci.jpg',
  },
  {
    id: 4,
    name: '杜甫草堂',
    region: '市区经典',
    description: '唐代诗人杜甫流寓成都时的故居，在此写下《茅屋为秋风所破歌》等名篇。园内梅竹成林、水榭回廊交错，是闹市中少见的一处清幽园林。',
    price: 50,
    openTime: '08:00 - 18:00',
    status: 1,
    mainImage: '/images/chengdu/dufu.jpg',
  },
  {
    id: 5,
    name: '成都大熊猫繁育研究基地',
    region: '熊猫生态',
    description: '世界最大的大熊猫迁地保护与繁育基地，园区模拟野生栖息环境，竹林掩映、溪流穿行。清晨是熊猫最活跃的时段，可近距离观察到进食、攀爬与幼崽育幼场景。',
    price: 55,
    openTime: '07:30 - 18:00',
    status: 1,
    mainImage: '/images/chengdu/panda-base.jpg',
  },
  {
    id: 6,
    name: '人民公园',
    region: '市区经典',
    description: '成都最老牌的市民公园，鹤鸣茶社的竹椅盖碗茶已延续百年。掏耳朵的师傅、围坐打牌的老人、湖边划船的家庭，共同构成成都慢生活最生动的切面。',
    price: 0,
    openTime: '06:00 - 22:00',
    status: 1,
    mainImage: '/images/chengdu/renmin-park.jpg',
  },
  {
    id: 7,
    name: '都江堰',
    region: '世界遗产',
    description: '始建于战国时期、由李冰主持修建的无坝引水工程，两千余年来仍在灌溉成都平原，是世界水利史上的奇迹。鱼嘴分水、飞沙堰泄洪、宝瓶口引水，三处主体至今清晰可辨。',
    price: 80,
    openTime: '08:00 - 18:00',
    status: 1,
    mainImage: '/images/chengdu/dujiangyan.jpg',
  },
  {
    id: 8,
    name: '青城山',
    region: '世界遗产',
    description: '中国道教发源地之一，素有“青城天下幽”之称。前山宫观林立、林木蔽日，后山溪瀑纵横、栈道悬空。拾级而上，苔痕石阶与道家清音相伴，是避暑养心的绝佳去处。',
    price: 80,
    openTime: '08:00 - 17:30',
    status: 1,
    mainImage: '/images/chengdu/qingcheng.jpg',
  },
  {
    id: 9,
    name: '西岭雪山',
    region: '近郊山水',
    description: '因杜甫“窗含西岭千秋雪”而得名的近郊雪山，海拔 5364 米，是成都市区可见的最高峰。冬季为西南地区规模最大的滑雪场，夏季草甸与云海同样开阔壮丽。',
    price: 120,
    openTime: '09:00 - 17:00',
    status: 1,
    mainImage: '/images/chengdu/xiling.jpg',
  },
  {
    id: 10,
    name: '川剧艺术中心',
    region: '市区经典',
    description: '集中呈现川剧精髓的专业剧场，以变脸、吐火、滚灯、手影戏为主打。演出前可体验勾脸谱、试戏服，台上锣鼓与锣腔一响，蜀地数百年的声腔记忆扑面而来。',
    price: 180,
    openTime: '14:00 - 21:30',
    status: 1,
    mainImage: '/images/chengdu/chuanju.jpg',
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
