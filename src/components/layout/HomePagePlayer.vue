<template>
  <NConfigProvider :theme="null">
    <NLayout>
      <NLayoutContent>
        <NSpace vertical :size="32">
          <!-- Vue Liste des Decks -->
          <template v-if="!selectedDeckId">
            <div>
              <h1 style="font-size: 28px; font-weight: 700; margin: 0">
                Mes Decks
              </h1>
            </div>

            <NSpin :show="loading">
              <template v-if="decks.length === 0">
                <NEmpty description="Vous n'avez pas encore de deck." />
              </template>
              <template v-else>
                <NSpace vertical :size="32">
                  <div v-for="deck in decks" :key="deck.id">
                    <NCard>
                      <template #header>
                        <NSpace justify="space-between" style="width: 100%">
                          <h2
                            style="margin: 0; font-size: 20px; font-weight: 700"
                          >
                            {{ deck.name }}
                          </h2>
                          <NSpace>
                            <NButton size="small" @click="handleViewDeck(deck)"
                              >Détails</NButton
                            >
                            <NButton size="small" @click="handleEdit(deck)"
                              >Modifier</NButton
                            >
                            <NButton
                              size="small"
                              type="error"
                              @click="handleDelete(deck)"
                            >
                              Supprimer
                            </NButton>
                          </NSpace>
                        </NSpace>
                      </template>
                      <CardGrid :cards="getDeckCards(deck)" size="sm" />
                    </NCard>
                  </div>
                </NSpace>
              </template>
            </NSpin>

            <NDivider />

            <NButton
              type="primary"
              size="large"
              :style="{ backgroundColor: '#4caf82', borderColor: '#4caf82' }"
              block
              @click="handleNewDeck"
            >
              + Nouveau deck
            </NButton>
          </template>

          <!-- Vue Lobby -->
          <template v-else>
            <Lobby
              :decks="decks"
              :selected-deck="selectedDeck"
              :selected-deck-id="selectedDeckId || 0"
              :all-cards="allCards"
              @back="handleBack"
              @update-selected-deck="updateSelectedDeck"
            />
          </template>
        </NSpace>
      </NLayoutContent>
    </NLayout>
  </NConfigProvider>
</template>

<script setup lang="ts">
import {
  NButton,
  NCard,
  NConfigProvider,
  NDivider,
  NEmpty,
  NLayout,
  NLayoutContent,
  NSpace,
  NSpin,
  useMessage,
} from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '../../composables/useApi'
import { ROUTES } from '../../router'
import type { Card, Deck } from '../../types/index'
import CardGrid from '../card/CardGrid.vue'
import Lobby from './Lobby.vue'

const router = useRouter()
const message = useMessage()
const api = useApi()

const decks = ref<Deck[]>([])
const allCards = ref<Map<number, Card>>(new Map())
const loading = ref(false)
const selectedDeckId = ref<number | null>(null)

const selectedDeck = computed(() => {
  if (!selectedDeckId.value) return undefined
  return decks.value.find((d) => d.id === selectedDeckId.value)
})

const loadDecks = async () => {
  loading.value = true
  try {
    const myDecks = await api.getMyDecks()
    decks.value = myDecks
  } catch (_error) {
    message.error('Erreur lors du chargement des decks')
  } finally {
    loading.value = false
  }
}

const loadAllCards = async () => {
  try {
    const cards = await api.getCards()
    cards.forEach((card) => {
      allCards.value.set(card.id, card)
    })
  } catch (_error) {
    message.error('Erreur lors du chargement des cartes')
  }
}

onMounted(async () => {
  await loadDecks()
  await loadAllCards()
})

const getDeckCards = (deck: Deck): Card[] => {
  return deck.cards
    .map((dc) => allCards.value.get(dc.cardId))
    .filter((card): card is Card => !!card)
}

function handleNewDeck() {
  router.push(ROUTES.CREATE_DECK)
}

function handleViewDeck(deck: Deck) {
  selectedDeckId.value = deck.id
}

function handleBack() {
  selectedDeckId.value = null
}

function handleEdit(deck: Deck) {
  router.push({
    name: 'EditDeck',
    params: { id: deck.id },
  })
}

async function handleDelete(deck: Deck) {
  try {
    await api.deleteDeck(deck.id)
    decks.value = decks.value.filter((d) => d.id !== deck.id)
    message.success(`${deck.name} supprimé.`)
  } catch (_error) {
    message.error('Erreur lors de la suppression du deck')
  }
}

function updateSelectedDeck(deckId: number) {
  selectedDeckId.value = deckId
}
</script>
