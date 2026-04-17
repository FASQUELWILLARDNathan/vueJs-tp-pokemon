<template>
  <NSpace vertical :size="32" style="width: 100%">
    <!-- Header -->
    <NSpace justify="space-between" align="center" style="width: 100%">
      <NButton @click="handleBack">← Changer de deck</NButton>
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; flex: 1">
        Jouer
      </h1>
      <NButton type="error" @click="handleDisconnect"> Déconnecter </NButton>
    </NSpace>

    <!-- Alertes -->
    <NAlert
      v-if="gameStore.errorMessage"
      type="error"
      closable
      @close="gameStore.clearError"
    >
      {{ gameStore.errorMessage }}
    </NAlert>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px">
      <!-- GAUCHE: Créer une partie -->
      <NCard>
        <NSpace vertical :size="16">
          <h2 style="margin: 0; font-size: 18px; font-weight: 700">
            Créer une partie
          </h2>

          <!-- Si une room a été créée, afficher le message d'attente -->
          <template v-if="currentCreatedRoomId">
            <NAlert type="info">
              <div style="text-align: center">
                <div style="font-weight: 600; margin-bottom: 8px">
                  ✅ Partie créée !
                </div>
                <div style="font-size: 12px; color: #666">
                  En attente d'un adversaire...
                </div>
                <div style="font-size: 11px; color: #999; margin-top: 8px">
                  Partie #{{ currentCreatedRoomId }}
                </div>
              </div>
            </NAlert>
          </template>

          <!-- Sinon, afficher le formulaire -->
          <template v-else>
            <div>
              <div
                style="
                  font-size: 12px;
                  color: #999;
                  margin-bottom: 8px;
                  text-transform: uppercase;
                  font-weight: 600;
                "
              >
                Sélectionner un deck
              </div>
              <NSelect
                :value="String(localSelectedDeckId || selectedDeckId || '')"
                :options="deckOptions"
                placeholder="Choisir un deck"
                @update:value="(val) => selectDeckForCreate(parseInt(val))"
              />
            </div>

            <!-- Affiche le deck sélectionné -->
            <div v-if="deckSelected">
              <NCard style="background-color: #f5f5f5">
                <NSpace vertical :size="8">
                  <div style="font-weight: 600">{{ deckSelected.name }}</div>
                  <div style="font-size: 12px; color: #666">
                    {{ deckSelected.cards.length }} / 10 cartes
                  </div>
                </NSpace>
              </NCard>
            </div>

            <NButton
              type="primary"
              :style="{ backgroundColor: '#4caf82', borderColor: '#4caf82' }"
              block
              :disabled="
                !(localSelectedDeckId || selectedDeckId) ||
                !gameStore.isConnected
              "
              :loading="isCreatingRoom"
              @click="handleCreateRoom"
            >
              Créer une Partie
            </NButton>
          </template>

          <!-- Status connexion -->
          <div style="text-align: center; font-size: 12px">
            <NBadge
              :type="gameStore.isConnected ? 'success' : 'error'"
              :value="gameStore.isConnected ? 'Connecté' : 'Déconnecté'"
              processing
            />
          </div>
        </NSpace>
      </NCard>

      <!-- DROITE: Parties disponibles -->
      <NCard>
        <NSpace vertical :size="16">
          <NSpace justify="space-between" align="center" style="width: 100%">
            <h2 style="margin: 0; font-size: 18px; font-weight: 700">
              Parties disponibles
            </h2>
            <NButton
              quaternary
              :loading="isRefreshingRooms"
              @click="handleRefreshRooms"
            >
              🔄
            </NButton>
          </NSpace>

          <!-- Liste des rooms -->
          <NSpin :show="isRefreshingRooms">
            <NSpace vertical :size="12">
              <template v-if="availableRooms.length === 0">
                <NEmpty description="Aucune partie disponible" />
              </template>

              <template v-else>
                <div
                  v-for="room in availableRooms"
                  v-show="room.id !== currentCreatedRoomId"
                  :key="room.id"
                  style="border-bottom: 1px solid #eee; padding-bottom: 12px"
                >
                  <NSpace vertical :size="12">
                    <div>
                      <div style="font-weight: 600">Partie #{{ room.id }}</div>
                      <div style="font-size: 12px; color: #666">
                        Hôte:
                        {{
                          room.hostUsername ||
                          'Joueur ' + room.hostSocketId?.slice(0, 5)
                        }}
                      </div>
                    </div>

                    <!-- Select deck pour rejoindre -->
                    <NSelect
                      :value="
                        roomDeckSelections.get(room.id)
                          ? String(roomDeckSelections.get(room.id))
                          : ''
                      "
                      :options="deckOptions"
                      placeholder="Sélectionner un deck"
                      @update:value="
                        (val) => selectDeckForJoin(room.id, parseInt(val))
                      "
                    />

                    <NButton
                      type="primary"
                      :style="{
                        backgroundColor: '#4caf82',
                        borderColor: '#4caf82',
                      }"
                      block
                      size="small"
                      :disabled="
                        !roomDeckSelections.has(room.id) || isJoiningRoom
                      "
                      :loading="isJoiningRoom && joiningRoomId === room.id"
                      @click="handleJoinRoom(room.id)"
                    >
                      Rejoindre
                    </NButton>
                  </NSpace>
                </div>
              </template>
            </NSpace>
          </NSpin>
        </NSpace>
      </NCard>
    </div>

    <!-- Mes Decks (bas de page) -->
    <NCard>
      <NSpace vertical :size="16">
        <h2 style="margin: 0; font-size: 18px; font-weight: 700">Mes decks</h2>

        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
          "
        >
          <div
            v-for="deck in decks"
            :key="deck.id"
            :style="{
              opacity:
                selectedDeckId === deck.id || localSelectedDeckId === deck.id
                  ? 1
                  : 0.6,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }"
            @click="changeSelectedDeck(deck.id)"
          >
            <NCard
              :style="{
                borderColor:
                  selectedDeckId === deck.id || localSelectedDeckId === deck.id
                    ? '#4caf82'
                    : '#ddd',
                borderWidth:
                  selectedDeckId === deck.id || localSelectedDeckId === deck.id
                    ? '2px'
                    : '1px',
              }"
            >
              <NSpace vertical :size="12">
                <div style="font-weight: 600">{{ deck.name }}</div>
                <div style="font-size: 12px; color: #666">
                  {{ deck.cards.length }} / 10 cartes
                </div>
                <NSpace
                  v-if="
                    selectedDeckId === deck.id ||
                    localSelectedDeckId === deck.id
                  "
                  :size="8"
                >
                  <NBadge type="success" value="Sélectionné" />
                </NSpace>
              </NSpace>
            </NCard>
          </div>
        </div>
      </NSpace>
    </NCard>
  </NSpace>
</template>

<script setup lang="ts">
import {
  NAlert,
  NBadge,
  NButton,
  NCard,
  NEmpty,
  NSelect,
  NSpace,
  NSpin,
} from 'naive-ui'
import { computed, defineOptions, onMounted, onUnmounted, ref } from 'vue'

import { useGameStore } from '@/store/game.store'
import type { Card, Deck } from '@/types'

defineOptions({
  name: 'GameLobby',
})

interface Props {
  decks: Deck[]
  selectedDeck: Deck | undefined
  selectedDeckId: number
  allCards: Map<number, Card>
  onBack: () => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updateSelectedDeck: [deckId: number]
}>()

const gameStore = useGameStore()
const isCreatingRoom = ref(false)
const isRefreshingRooms = ref(false)
const isJoiningRoom = ref(false)
const joiningRoomId = ref<string | null>(null)
const localSelectedDeckId = ref<number | null>(null)
const roomDeckSelections = ref<Map<string, number>>(new Map())
const currentCreatedRoomId = ref<string | null>(null)
let refreshInterval: ReturnType<typeof setInterval> | null = null

const deckOptions = computed(() => {
  return props.decks.map((deck) => ({
    label: deck.name,
    value: String(deck.id),
  }))
})

const deckSelected = computed(() => {
  const deckId = localSelectedDeckId.value || props.selectedDeckId
  return props.decks.find((d) => d.id === deckId)
})

const availableRooms = computed(() => {
  const rooms = gameStore.rooms || []
  return Array.isArray(rooms) ? rooms : []
})

onMounted(async () => {
  await gameStore.connectSocket()
  await gameStore.fetchRooms()
  refreshInterval = setInterval(() => {
    if (gameStore.isConnected) {
      gameStore.fetchRooms()
    }
  }, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

const selectDeckForCreate = (deckId: number) => {
  localSelectedDeckId.value = deckId
}

const selectDeckForJoin = (roomId: string, deckId: number) => {
  roomDeckSelections.value.set(roomId, deckId)
}

const changeSelectedDeck = (deckId: number) => {
  emit('updateSelectedDeck', deckId)
}

const handleCreateRoom = async () => {
  const deckToUse = localSelectedDeckId.value || props.selectedDeckId
  if (!deckToUse) {
    return
  }
  isCreatingRoom.value = true
  try {
    const handler = (data: unknown) => {
      currentCreatedRoomId.value = data.roomId || data.room?.id
      gameStore.state.socket?.off('roomCreated', handler)
    }
    gameStore.state.socket?.on('roomCreated', handler)
    await gameStore.createRoom(deckToUse)
  } finally {
    isCreatingRoom.value = false
  }
}

const handleJoinRoom = async (roomId: string) => {
  const deckId = roomDeckSelections.value.get(roomId)
  if (!deckId) return

  isJoiningRoom.value = true
  joiningRoomId.value = roomId
  try {
    await gameStore.joinRoom(roomId, deckId)
  } finally {
    isJoiningRoom.value = false
    joiningRoomId.value = null
  }
}

const handleRefreshRooms = async () => {
  isRefreshingRooms.value = true
  try {
    await gameStore.fetchRooms()
  } finally {
    isRefreshingRooms.value = false
  }
}

const handleBack = () => {
  props.onBack()
}

const handleDisconnect = () => {
  gameStore.disconnectSocket()
  props.onBack()
}
</script>
