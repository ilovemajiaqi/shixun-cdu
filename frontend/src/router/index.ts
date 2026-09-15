import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/PublicLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue')
        },
        {
          path: 'attractions',
          name: 'attractions',
          component: () => import('../views/AttractionsView.vue')
        },
        {
          path: 'routes',
          name: 'routes',
          component: () => import('../views/RoutesView.vue')
        }
      ]
    },
    {
      path: '/user',
      component: () => import('../layouts/PublicLayout.vue'),
      children: [
        {
          path: '',
          name: 'user',
          component: () => import('../views/UserView.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/AdminLoginView.vue')
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue')
        },
        {
          path: 'attractions',
          name: 'admin-attractions',
          component: () => import('../views/admin/AttractionManagement.vue')
        },
        {
          path: 'routes',
          name: 'admin-routes',
          component: () => import('../views/admin/RouteManagement.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/UserManagement.vue')
        },
        {
          path: 'bookings',
          name: 'admin-bookings',
          component: () => import('../views/admin/OrderManagement.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  // 守卫里必须显式调用 useUserStore()：pinia 实例在 main.ts 才安装，
  // 此处是运行时求值，可以拿到已激活的实例。
  const userStore = useUserStore()

  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!userStore.isAdmin) {
      next('/admin/login')
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
