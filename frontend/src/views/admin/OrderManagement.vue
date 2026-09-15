<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <el-input v-model="searchQuery" placeholder="搜索订单号/用户/景点" :prefix-icon="Search" clearable class="w-72" />
        <el-select v-model="bookingStatusFilter" placeholder="订单状态" class="w-40" clearable>
          <el-option label="全部状态" value="" />
          <el-option label="已支付" value="paid" />
          <el-option label="待支付" value="pending" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </div>
      <el-button type="primary" @click="openDialog('add')">新增订单</el-button>
    </div>

    <el-table :data="filteredBookings" style="width: 100%" v-loading="loading">
      <el-table-column prop="orderId" label="订单号" width="150" show-overflow-tooltip />
      <el-table-column prop="user" label="预订用户" width="120" />
      <el-table-column prop="spot" label="景点" width="150" />
      <el-table-column label="预订详情" width="200">
        <template #default="{ row }">
          <div>{{ row.date }}</div>
          <div class="text-xs text-gray-500">{{ row.quantity }}张 × ¥{{ row.price }}</div>
        </template>
      </el-table-column>
      <el-table-column label="总金额" width="120">
        <template #default="{ row }">
          <span class="font-bold">¥{{ row.total }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 'pending'" link type="primary" size="small" @click="confirmPay(row)">确认支付</el-button>
          <el-button link type="primary" size="small" @click="openDialog('edit', row)">编辑</el-button>
          <el-button v-if="row.status !== 'cancelled'" link type="warning" size="small" @click="cancelOrder(row)">取消订单</el-button>
          <el-button link type="danger" size="small" @click="deleteOrder(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="flex justify-end mt-6">
      <el-pagination background layout="prev, pager, next" :total="filteredBookings.length" :page-size="10" />
    </div>
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增订单' : '编辑订单'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="订单号">
          <el-input v-model="form.orderId" />
        </el-form-item>
        <el-form-item label="用户">
          <el-input v-model="form.user" />
        </el-form-item>
        <el-form-item label="景点">
          <el-input v-model="form.spot" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="form.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="form.price" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" class="w-full">
            <el-option label="已支付" value="paid" />
            <el-option label="待支付" value="pending" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" :disabled="submitting" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/order'
import type { Order } from '@/stores/types'

// 订单统一由 orderStore 管理：前台下单、后台改状态都落在同一份数据上
const orderStore = useOrderStore()
orderStore.load()

const bookings = computed(() => orderStore.list)
// 模板里的状态提取改为直接复用 store 的映射方法
const getStatusType = (status: string) => orderStore.statusTag(status)
const getStatusText = (status: string) => orderStore.statusText(status)

const bookingStatusFilter = ref('')
const searchQuery = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const form = ref<any>({})

const filteredBookings = computed(() => {
  return bookings.value.filter(b => {
    const matchStatus = !bookingStatusFilter.value || b.status === bookingStatusFilter.value
    const q = searchQuery.value.toLowerCase()
    const matchQuery = !q || b.orderId.toLowerCase().includes(q) || b.user.toLowerCase().includes(q) || b.spot.toLowerCase().includes(q)
    return matchStatus && matchQuery
  })
})

const cancelOrder = (row: any) => {
  ElMessageBox.confirm(`确定要取消订单 ${row.orderId} 吗？`, '警告', {
    type: 'warning'
  }).then(() => {
    orderStore.setStatus(row.orderId, 'cancelled')
    ElMessage.success({ message: '订单已取消', duration: 1500 })
  })
}

const confirmPay = (row: any) => {
  ElMessageBox.confirm(`确认订单 ${row.orderId} 已支付？`, '提示', {
    type: 'success'
  }).then(() => {
    orderStore.setStatus(row.orderId, 'paid')
    ElMessage.success({ message: '订单状态更新为已支付', duration: 1500 })
  })
}

const openDialog = (type: 'add' | 'edit', row?: any) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    form.value = { ...row }
  } else {
    form.value = { orderId: `ORD-${Date.now()}`, user: '', spot: '', date: '', quantity: 1, price: 0, status: 'pending' }
  }
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (submitting.value) return
  submitting.value = true
  if (!form.value.orderId || !form.value.user || !form.value.spot) {
    ElMessage.warning({ message: '请完整填写订单信息', duration: 1500 })
    submitting.value = false
    return
  }
  const payload: Order = {
    ...form.value,
    total: Math.round(form.value.quantity * form.value.price * 100) / 100,
  }
  if (dialogType.value === 'add') {
    orderStore.upsertOrder(payload)
    ElMessage.success({ message: '订单创建成功', duration: 1500 })
  } else {
    orderStore.updateOrder(payload.orderId, payload)
    ElMessage.success({ message: '订单更新成功', duration: 1500 })
  }
  dialogVisible.value = false
  submitting.value = false
}

const deleteOrder = (row: any) => {
  ElMessageBox.confirm(`确定删除订单 ${row.orderId} 吗？`, '警告', { type: 'warning' }).then(() => {
    orderStore.removeOrder(row.orderId)
    ElMessage.success({ message: '订单已删除', duration: 1500 })
  })
}
</script>
