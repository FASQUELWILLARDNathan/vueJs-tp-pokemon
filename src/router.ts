import { createRouter, createWebHistory } from 'vue-router'

import HomePage from './pages/HomePage.vue'
import LoginPage from './pages/LoginPage.vue'
import RegisterPage from './pages/RegisterPage.vue'
import { useAuthStore } from './store/auth.store'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
} as const

const routes = [
  { path: ROUTES.HOME, component: HomePage, meta: { requiresAuth: true } },
  { path: ROUTES.LOGIN, component: LoginPage, meta: { requiresAuth: false } },
  {
    path: ROUTES.REGISTER,
    component: RegisterPage,
    meta: { requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (
    authStore.isAuth &&
    (to.path === ROUTES.LOGIN || to.path === ROUTES.REGISTER)
  ) {
    return ROUTES.HOME
  }

  if (to.meta.requiresAuth && !authStore.isAuth) {
    return ROUTES.LOGIN
  }

  return true
})

export default router
