<template>
  <NConfigProvider :theme="null">
    <NLayout>
      <NLayoutContent style="padding: 32px">
        <NSpin :show="!gameStore.isGameActive && !showGameEnd">
          <div v-if="gameStore.isGameActive || showGameEnd" style="width: 100%">
            <NSpace vertical :size="24" style="width: 100%">
              <div>
                <h3
                  style="
                    margin: 0 0 12px 0;
                    font-size: 12px;
                    color: #999;
                    text-transform: uppercase;
                    font-weight: 600;
                  "
                >
                  Adversaire
                </h3>
                <OpponentZone
                  v-if="gameStore.opponentPlayerState"
                  :opponent-state="gameStore.opponentPlayerState"
                />
                <NEmpty v-else description="En attente de l'adversaire..." />
              </div>

              <ActionBar
                v-if="
                  gameStore.currentPlayerState && gameStore.opponentPlayerState
                "
                :is-player-turn="gameStore.isCurrentPlayerTurn"
                :current-player-state="gameStore.currentPlayerState"
                :opponent-player-state="gameStore.opponentPlayerState"
                :last-event="gameStore.lastEvent"
                :can-draw-cards="canDraw"
                @draw-cards="gameStore.drawCards()"
                @attack="handleAttack"
                @end-turn="gameStore.endTurn()"
                @clear-event="gameStore.clearEvent()"
              />

              <div>
                <h3
                  style="
                    margin: 0 0 12px 0;
                    font-size: 12px;
                    color: #999;
                    text-transform: uppercase;
                    font-weight: 600;
                  "
                >
                  Vous
                </h3>
                <PlayerZone
                  v-if="gameStore.currentPlayerState"
                  :player-state="gameStore.currentPlayerState"
                />
                <NEmpty v-else description="Chargement..." />
              </div>

              <div>
                <PlayerHand
                  v-if="gameStore.currentPlayerState"
                  :hand="gameStore.currentPlayerState?.hand ?? []"
                  :is-player-turn="gameStore.isCurrentPlayerTurn"
                  :player-state="gameStore.currentPlayerState"
                  @play-card="gameStore.playCard"
                />
              </div>
            </NSpace>

            <GameEndModal
              v-if="
                gameStore.gameState &&
                gameStore.currentPlayerState &&
                gameStore.opponentPlayerState
              "
              :is-visible="showGameEnd"
              :game-state="gameStore.gameState"
              :current-player-id="authStore.user?.id"
              :current-player-state="gameStore.currentPlayerState"
              :opponent-player-state="gameStore.opponentPlayerState"
              @back-to-lobby="handleBackToLobby"
            />
          </div>

          <template v-else>
            <NCard style="text-align: center; padding: 40px">
              <NSpace vertical :size="16" style="justify-content: center">
                <div style="font-size: 16px; font-weight: 600">
                  ⏳ En attente du démarrage de la partie...
                </div>
                <div style="font-size: 12px; color: #999">
                  Votre adversaire arrive...
                </div>
              </NSpace>
            </NCard>
          </template>
        </NSpin>
      </NLayoutContent>
    </NLayout>
  </NConfigProvider>
</template>

<script setup lang="ts">
import {
  NCard,
  NConfigProvider,
  NEmpty,
  NLayout,
  NLayoutContent,
  NSpace,
  NSpin,
  useMessage,
} from 'naive-ui'
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

import ActionBar from '@/components/game/ActionBar.vue'
import GameEndModal from '@/components/game/GameEndModal.vue'
import OpponentZone from '@/components/game/OpponentZone.vue'
import PlayerHand from '@/components/game/PlayerHand.vue'
import PlayerZone from '@/components/game/PlayerZone.vue'
import { useAuthStore } from '@/store/auth.store'
import { useGameStore } from '@/store/game.store'

const router = useRouter()
const message = useMessage()
const gameStore = useGameStore()
const authStore = useAuthStore()

const canDraw = computed(() => {
  return (
    gameStore.isCurrentPlayerTurn &&
    gameStore.currentPlayerState &&
    gameStore.currentPlayerState.hand.length < 5 &&
    gameStore.currentPlayerState.deck.length > 0
  )
})

const showGameEnd = computed(() => {
  return gameStore.gameState?.status === 'finished'
})

onMounted(async () => {
  if (!gameStore.gameState) {
    router.push('/')
    message.warning('Aucune partie en cours')
    return
  }

  if (!gameStore.isConnected) {
    await gameStore.connectSocket()
  }
})

watch(
  () => gameStore.gameState?.status,
  (status) => {
    if (status === 'finished') {
      // Redirection automatique après 3 secondes (pour voir la modal)
      setTimeout(() => {
        gameStore.resetGame()
        router.push('/')
      }, 3000)
    }
  },
)

const handleAttack = () => {
  if (gameStore.opponentPlayerState?.activeCard?.id) {
    gameStore.attack(gameStore.opponentPlayerState.activeCard.id)
  }
}

const handleBackToLobby = async () => {
  gameStore.resetGame()
  await router.push('/')
}
</script>

<style scoped>
:deep(.n-layout-content) {
  max-width: 100%;
}
</style>
