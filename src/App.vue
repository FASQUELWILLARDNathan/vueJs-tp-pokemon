<template>
  <NConfigProvider>
    <NMessageProvider>
      <NLayout>
        <HeaderBar v-if="authStore.isAuth" />
        <NLayoutContent>
          <RouterView />
        </NLayoutContent>
      </NLayout>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import HeaderBar from './components/layout/HeaderBar.vue'
import { useAuthStore } from './store/auth.store'

const authStore = useAuthStore()
</script>

<style>
body {
  padding: 0 20px;
}
</style>
