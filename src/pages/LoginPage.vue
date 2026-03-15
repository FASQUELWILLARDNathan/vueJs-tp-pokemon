<template>
  <NForm @submit.prevent="handleSignIn">
    <NFormItem label="Email" required>
      <NInput v-model:value="email" type="text" placeholder="votre@email.com" />
    </NFormItem>
    <NFormItem label="Mot de passe" required>
      <NInput
        v-model:value="password"
        type="password"
        show-password-on="mousedown"
        placeholder="Password"
      />
    </NFormItem>
    <NButton type="primary" attr-type="submit">Se connecter</NButton>
    <div class="footer">
      <p>Jamais enregistrer ?</p>
      <RouterLink to="/register">S'enregistrer</RouterLink>
    </div>
  </NForm>
</template>

<script setup lang="ts">
import { NButton, NFormItem } from 'naive-ui'
import { ref } from 'vue'

import { useApi } from '@/composables/useApi'
import { useStorage } from '@/composables/useStorage'
const useAPI = useApi()
const { set } = useStorage()

const email = ref('')
const password = ref('')

const handleSignIn = async () => {
  const response = await useAPI.signIn({
    email: email.value,
    password: password.value,
  })
  set('token', response.token)
  set('user', response.user)
}
</script>
