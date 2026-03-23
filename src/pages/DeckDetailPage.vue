<template>
  <NConfigProvider :theme="null">
    <NLayout>
      <NLayoutContent>
        <NSpace vertical :size="32">
          <NSpace justify="space-between" align="center" style="width: 100%">
            <NButton @click="handleBack">← Retour</NButton>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; flex: 1">
              {{ deck?.name }}
            </h1>
            <NButton
              type="primary"
              :style="{ backgroundColor: '#4caf82', borderColor: '#4caf82' }"
              @click="handleEdit"
            >
              Modifier
            </NButton>
          </NSpace>

          <NSpin :show="loading">
            <div v-if="!loading && deck">
              <NSpace vertical :size="32" style="width: 100%">
                <div>
                  <NCard>
                    <NSpace vertical :size="8">
                      <span
                        style="
                          font-size: 12px;
                          color: #999;
                          text-transform: uppercase;
                          font-weight: 600;
                        "
                      >
                        Nombre de cartes
                      </span>
                      <span
                        style="
                          font-size: 24px;
                          font-weight: 700;
                          color: #4caf82;
                        "
                      >
                        {{ deck.cards.length }} / 10
                      </span>
                    </NSpace>
                  </NCard>
                </div>

                <div>
                  <h2
                    style="
                      font-size: 18px;
                      font-weight: 700;
                      color: #222;
                      margin: 0 0 16px 0;
                    "
                  >
                    Cartes du deck
                  </h2>
                  <CardGrid :cards="deckCards" size="sm" />
                </div>
              </NSpace>
            </div>
          </NSpin>
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
  NLayout,
  NLayoutContent,
  NSpace,
  NSpin,
  useMessage,
} from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardGrid from '../components/card/CardGrid.vue'
import { useApi } from '../composables/useApi'
import { ROUTES } from '../router'
import type { Card, Deck } from '../types/index'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const api = useApi()

const deck = ref<Deck | null>(null)
const loading = ref(false)
const allCards = ref<Map<number, Card>>(new Map())

const deckCards = computed(() => {
  if (!deck.value) return []
  return deck.value.cards
    .map((dc) => allCards.value.get(dc.cardId))
    .filter((card): card is Card => !!card)
})

const loadDeck = async () => {
  loading.value = true
  try {
    const deckData = await api.getDeck(Number(route.params.id))
    deck.value = deckData
  } catch (_error) {
    message.error('Erreur lors du chargement du deck')
    router.push(ROUTES.HOME)
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
  await loadDeck()
  await loadAllCards()
})

const handleBack = () => {
  router.push(ROUTES.HOME)
}

const handleEdit = () => {
  router.push({
    name: 'EditDeck',
    params: { id: route.params.id },
  })
}
</script>
