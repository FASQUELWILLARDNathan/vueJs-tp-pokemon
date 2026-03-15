<template>
  <NForm @submit.prevent="handleSignUp">
    <NFormItem label="Username" required>
      <NInput v-model:value="username" type="text" placeholder="NeyZnn" />
    </NFormItem>
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
    <NButton type="primary" attr-type="submit">S'inscrire</NButton>
    <div class="footer">
      <p>Déjà un compte ?</p>
      <RouterLink to="/login">Se connecter</RouterLink>
    </div>
  </NForm>
</template>

<script setup lang="ts">
import { NButton, NFormItem } from 'naive-ui'
import { ref } from 'vue'

import { useAuthStore } from '@/store/auth.store'
// import { SignUpPayload } from '@/types';
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')

const handleSignUp = async () => {
  authStore.signUp({
    username: username.value,
    email: email.value,
    password: password.value,
  })
}
</script>
