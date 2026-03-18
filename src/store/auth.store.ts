// src/store/auth.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useApi } from '@/composables/useApi'
import { useStorage } from '@/composables/useStorage'
import type { SignUpPayload, User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const { get, set } = useStorage()
  const token = ref(get<string>('token'))
  const user = ref(get<User>('user'))

  const isAuth = computed((): boolean => {
    return token.value && user.value ? true : false
  })

  const signIn = async (payload: { email: string; password: string }) => {
    const { email, password } = payload
    const useAPI = useApi()
    const response = await useAPI.signIn({
      email: email,
      password: password,
    })
    set('token', response.token)
    set('user', response.user)
    token.value = response.token
    user.value = response.user
  }

  const signUp = async (payload: SignUpPayload) => {
    const { username, email, password } = payload
    const useAPI = useApi()
    const response = await useAPI.signUp({
      username: username,
      email: email,
      password: password,
    })
    set('token', response.token)
    set('user', response.user)
    token.value = response.token
    user.value = response.user
  }

  const logout = () => {
    set('token', null)
    set('user', null)
    token.value = null
    user.value = null
  }

  return { token, user, isAuth, signIn, signUp, logout }
})

// POUR LA SUITE DU TP POUR REDIRECTION SI PAS CONNECTER UTILISER BEFOREEACH DANS Router.TS SI IL Y A UN META REQUIRED A VRAI ET QUE ISAUTH EST FAUX ALORS PAS CONNECTER ALORS ON PART VERS LOGIN ET SI UNE PAGE NA PAS BESOIN DETRE AUTHENTIFIER PAS BESOIN DE L Y EMMENER

// RG4 V - IF isAuth
// RG5 AU LIEU DE V IF DANS LE STORE ON RECUP USER QUI CONTIENT USERNAME  BOUTON DECONNEXION QUI EST PRET JUSTE MEME LOGIQUE QUE HANDLE SIGN UP MAIS POUR LOGOUT ET ON MET A NULL TOKEN ET USER

// PAGE CONNEXION
// COPIER COLLER DE SIGN UP DANS SIGN IN
