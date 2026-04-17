<template>
  <NModal
    :show="isVisible"
    preset="dialog"
    :closable="false"
    :mask-closable="false"
    :close-on-esc="false"
    title="Partie Terminée"
    positive-text="Retour au Lobby"
    @positive-click="$emit('backToLobby')"
  >
    <div style="text-align: center; padding: 24px 0">
      <!-- Résultat -->
      <div
        :style="{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '16px',
          color: isWin ? '#4caf82' : '#d32f2f',
        }"
      >
        {{ isWin ? '🎉 VICTOIRE!' : '😢 DÉFAITE' }}
      </div>

      <!-- Message -->
      <div
        :style="{
          fontSize: '16px',
          marginBottom: '24px',
          color: '#666',
        }"
      >
        {{
          isWin
            ? 'Vous avez remporté la victoire!'
            : 'Vous avez perdu cette partie.'
        }}
      </div>

      <!-- Stats -->
      <NSpace vertical :size="12" style="margin-bottom: 24px">
        <div>
          <span style="color: #999">Votre Score: </span>
          <span style="font-weight: 600">{{ currentPlayerScore }}/3 KOs</span>
        </div>
        <div>
          <span style="color: #999">Score Adversaire: </span>
          <span style="font-weight: 600">{{ opponentScore }}/3 KOs</span>
        </div>
      </NSpace>

      <!-- Bouton de retour -->
      <div style="text-align: center; color: #666; font-size: 12px">
        Cliquez sur "Retour au Lobby" pour jouer une nouvelle partie
      </div>
    </div>
  </NModal>
</template>

<script setup lang="ts">
import { NModal, NSpace } from 'naive-ui'
import { computed } from 'vue'

import type { GameState, PlayerState } from '@/types'

interface Props {
  isVisible: boolean
  gameState: GameState | null
  currentPlayerId?: number
  currentPlayerState: PlayerState | null | undefined
  opponentPlayerState: PlayerState | null | undefined
}

const props = defineProps<Props>()
defineEmits<{
  backToLobby: []
}>()

const isWin = computed(() => {
  if (!props.gameState || !props.currentPlayerId) return false
  return props.gameState.winner === props.currentPlayerId
})

const currentPlayerScore = computed(() => {
  return props.currentPlayerState?.knockouts ?? 0
})

const opponentScore = computed(() => {
  return props.opponentPlayerState?.knockouts ?? 0
})
</script>
