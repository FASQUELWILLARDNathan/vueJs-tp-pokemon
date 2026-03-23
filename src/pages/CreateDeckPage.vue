<template>
  <NConfigProvider :theme="null">
    <NLayout>
      <NLayoutContent>
        <NSpace vertical :size="32">
          <NBreadcrumb>
            <NBreadcrumbItem :clickable="true" @click="handleCancel">
              Accueil
            </NBreadcrumbItem>
            <NBreadcrumbItem>
              {{ isEditMode ? 'Modifier' : 'Créer' }} un deck
            </NBreadcrumbItem>
          </NBreadcrumb>

          <NSpace justify="space-between" align="center">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700">
              {{ isEditMode ? 'Modifier' : 'Créer' }} un deck
            </h1>
            <NButton @click="handleCancel">⭠ Retour</NButton>
          </NSpace>

          <!-- Form -->
          <NCard>
            <NSpace vertical :size="24">
              <!-- Deck Name Input -->
              <div>
                <label
                  style="display: block; margin-bottom: 8px; font-weight: 600"
                  >Nom du deck</label
                >
                <NInput
                  v-model:value="deckName"
                  placeholder="Mon super deck"
                  :status="
                    deckName.trim() === '' && attempted ? 'error' : undefined
                  "
                />
                <NText
                  v-if="deckName.trim() === '' && attempted"
                  type="error"
                  style="font-size: 12px"
                >
                  Le nom du deck est requis
                </NText>
              </div>

              <NDivider />

              <!-- Cards Selection -->
              <div>
                <NSpace
                  justify="space-between"
                  align="center"
                  style="margin-bottom: 16px"
                >
                  <label style="font-weight: 600"
                    >Sélectionner 10 cartes *</label
                  >
                  <NTag
                    :type="
                      selectedCardIds.size === 10
                        ? 'success'
                        : selectedCardIds.size > 0
                          ? 'warning'
                          : 'default'
                    "
                    round
                  >
                    {{ selectedCardIds.size }} / 10
                  </NTag>
                </NSpace>

                <NButton
                  type="primary"
                  size="large"
                  block
                  :disabled="!isFormValid"
                  :style="{
                    backgroundColor: isFormValid ? '#4caf82' : '#ccc',
                    borderColor: isFormValid ? '#4caf82' : '#ccc',
                  }"
                  @click="handleSubmit"
                >
                  {{ isEditMode ? 'Modifier' : 'Créer le deck' }}
                </NButton>

                <NSpin :show="cardsLoading">
                  <CardGrid
                    :cards="allCards"
                    :selectable-mode="true"
                    :max-selectable="10"
                    :pre-selected-ids="Array.from(selectedCardIds)"
                    size="sm"
                    @selection-change="handleCardSelection"
                  />
                </NSpin>
              </div>

              <NDivider />
            </NSpace>
          </NCard>
        </NSpace>
      </NLayoutContent>
    </NLayout>
  </NConfigProvider>
</template>

<script setup lang="ts">
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NCard,
  NConfigProvider,
  NDivider,
  NInput,
  NLayout,
  NLayoutContent,
  NSpace,
  NSpin,
  NTag,
  NText,
  useMessage,
} from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardGrid from '../components/card/CardGrid.vue'
import { useApi } from '../composables/useApi'
import { ROUTES } from '../router'
import type { Card } from '../types/index'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const api = useApi()

const deckName = ref('')
const selectedCardIds = ref(new Set<number>())
const allCards = ref<Card[]>([])
const cardsLoading = ref(false)
const attempted = ref(false)

const isEditMode = computed(() => !!route.params.id)

const isFormValid = computed(
  () => deckName.value.trim() !== '' && selectedCardIds.value.size === 10,
)

const loadCards = async () => {
  cardsLoading.value = true
  try {
    const cards = await api.getCards()
    allCards.value = cards
  } catch (_error) {
    message.error('Erreur lors du chargement des cartes')
  } finally {
    cardsLoading.value = false
  }
}

const loadDeck = async (deckId: number) => {
  try {
    const deck = await api.getDeck(deckId)
    deckName.value = deck.name
    selectedCardIds.value = new Set(deck.cards.map((c) => c.cardId))
  } catch (_error) {
    message.error('Erreur lors du chargement du deck')
    router.push(ROUTES.HOME)
  }
}

onMounted(async () => {
  await loadCards()
  if (isEditMode.value) {
    await loadDeck(Number(route.params.id))
  }
})

const handleCardSelection = (cardIds: number[]) => {
  selectedCardIds.value = new Set(cardIds)
}

const handleCancel = () => {
  router.push(ROUTES.HOME)
}

const handleSubmit = async () => {
  attempted.value = true

  if (!isFormValid.value) {
    message.warning('Veuillez remplir tous les champs correctement')
    return
  }

  try {
    const payload = {
      name: deckName.value.trim(),
      cards: Array.from(selectedCardIds.value),
    }

    if (isEditMode.value) {
      await api.updateDeck(Number(route.params.id), payload)
      message.success('Deck mis à jour!')
      router.push(ROUTES.HOME)
    } else {
      await api.createDeck(payload)
      message.success('Deck créé!')
      router.push(ROUTES.HOME)
    }
  } catch (_error) {
    message.error(
      isEditMode.value
        ? 'Erreur lors de la mise à jour du deck'
        : 'Erreur lors de la création du deck',
    )
  }
}
</script>
