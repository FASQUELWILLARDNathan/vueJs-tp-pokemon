<template>
  <NCard style="background-color: #f9f9f9">
    <NSpace vertical :size="16">
      <!-- Ligne 1: Indicateur du tour + Message -->
      <div
        style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: center;
        "
      >
        <!-- Indicateur du tour -->
        <div
          :style="{
            background: isPlayerTurn
              ? 'linear-gradient(135deg, #4caf82 0%, #45a049 100%)'
              : 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: '600',
            transition: 'all 0.3s ease',
          }"
        >
          {{ isPlayerTurn ? '✓ Votre tour' : '⏳ Tour adversaire' }}
        </div>

        <!-- Message d'événement -->
        <div
          v-if="lastEvent"
          :style="eventMessageStyle"
          style="
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 14px;
            position: relative;
            border-left: 4px solid;
          "
        >
          {{ lastEvent }}
          <NButton
            text
            type="primary"
            size="small"
            style="float: right; margin-top: -2px"
            @click="$emit('clearEvent')"
          >
            ✕
          </NButton>
        </div>
      </div>

      <!-- Ligne 2: Boutons d'action -->
      <NSpace :size="12">
        <NButton
          type="primary"
          :style="buttonStyle(canDraw)"
          :disabled="!canDraw"
          @click="$emit('drawCards')"
        >
          🎴 Piocher
        </NButton>

        <NButton
          type="primary"
          :style="buttonStyle(canAttack)"
          :disabled="!canAttack"
          @click="showAttackModal = true"
        >
          ⚔️ Attaquer
        </NButton>

        <NButton
          type="primary"
          :style="buttonStyle(isPlayerTurn)"
          :disabled="!isPlayerTurn"
          @click="$emit('endTurn')"
        >
          ✓ Fin de tour
        </NButton>
      </NSpace>

      <!-- Modal d'attaque -->
      <NModal
        v-model:show="showAttackModal"
        preset="dialog"
        title="Attaquer l'adversaire"
        positive-text="Attaquer"
        negative-text="Annuler"
        @positive-click="handleAttack"
      >
        <div style="padding: 16px 0">
          <div style="margin-bottom: 12px">
            <span style="font-weight: 600">Attaquant:</span>
            {{ currentPlayerCardName }}
          </div>
          <div style="margin-bottom: 12px">
            <span style="font-weight: 600">Défenseur:</span>
            {{ opponentCardName }}
          </div>
          <p style="color: #666; font-size: 14px">
            Êtes-vous sûr de vouloir attaquer l'adversaire?
          </p>
        </div>
      </NModal>
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
import { NButton, NCard, NModal, NSpace } from 'naive-ui'
import { computed, ref } from 'vue'

import type { PlayerState } from '@/types'

interface Props {
  isPlayerTurn: boolean
  currentPlayerState: PlayerState | null | undefined
  opponentPlayerState: PlayerState | null | undefined
  lastEvent: string | null
  canDrawCards: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  drawCards: []
  attack: [opponentCardId: number]
  endTurn: []
  clearEvent: []
}>()

const showAttackModal = ref(false)

const canDraw = computed(() => {
  return (
    props.isPlayerTurn &&
    props.currentPlayerState &&
    props.currentPlayerState.hand.length < 5 &&
    props.currentPlayerState.deck.length > 0
  )
})

const canAttack = computed(() => {
  return (
    props.isPlayerTurn &&
    props.currentPlayerState?.activeCard &&
    props.opponentPlayerState?.activeCard
  )
})

const currentPlayerCardName = computed(() => {
  return props.currentPlayerState?.activeCard?.name ?? 'N/A'
})

const opponentCardName = computed(() => {
  return props.opponentPlayerState?.activeCard?.name ?? 'N/A'
})

const buttonStyle = (enabled: boolean) => ({
  backgroundColor: enabled ? '#4caf82' : '#ccc',
  borderColor: enabled ? '#4caf82' : '#ccc',
})

const eventMessageStyle = computed(() => {
  const message = props.lastEvent || ''

  if (message.includes('Attaque') || message.includes('dégâts')) {
    return {
      backgroundColor: '#ffebee',
      color: '#d32f2f',
      borderLeftColor: '#d32f2f',
    }
  } else if (message.includes('KO')) {
    return {
      backgroundColor: '#fff3e0',
      color: '#f57c00',
      borderLeftColor: '#f57c00',
    }
  } else if (message.includes('gagné') || message.includes('Vous avez gagné')) {
    return {
      backgroundColor: '#e8f5e9',
      color: '#388e3c',
      borderLeftColor: '#388e3c',
    }
  } else {
    return {
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      borderLeftColor: '#1976d2',
    }
  }
})

const handleAttack = () => {
  if (props.opponentPlayerState?.activeCard?.id) {
    emit('attack', props.opponentPlayerState.activeCard.id)
    showAttackModal.value = false
  }
}
</script>
