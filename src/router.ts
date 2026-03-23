import { createRouter, createWebHistory } from 'vue-router'

import CreateDeckPage from './pages/CreateDeckPage.vue'
import DeckDetailPage from './pages/DeckDetailPage.vue'
import HomePage from './pages/HomePage.vue'
import LoginPage from './pages/LoginPage.vue'
import RegisterPage from './pages/RegisterPage.vue'
import { useAuthStore } from './store/auth.store'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CREATE_DECK: '/decks/create',
} as const

const routes = [
  { path: ROUTES.HOME, component: HomePage, meta: { requiresAuth: true } },
  { path: ROUTES.LOGIN, component: LoginPage, meta: { requiresAuth: false } },
  {
    path: ROUTES.REGISTER,
    component: RegisterPage,
    meta: { requiresAuth: false },
  },
  {
    path: ROUTES.CREATE_DECK,
    component: CreateDeckPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/decks/:id',
    name: 'DeckDetail',
    component: DeckDetailPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/decks/:id/edit',
    name: 'EditDeck',
    component: CreateDeckPage,
    meta: { requiresAuth: true },
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
