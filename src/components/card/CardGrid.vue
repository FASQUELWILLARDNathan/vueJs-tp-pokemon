<template>
  <div>
    <!-- Size Toggle Buttons -->
    <div style="margin-bottom: 16px">
      <NButtonGroup>
        <NButton
          :type="currentSize === 'md' ? 'primary' : 'default'"
          :style="
            currentSize === 'md'
              ? { backgroundColor: '#4caf82', borderColor: '#4caf82' }
              : {}
          "
          @click="currentSize = 'md'"
        >
          Medium
        </NButton>
        <NButton
          :type="currentSize === 'sm' ? 'primary' : 'default'"
          :style="
            currentSize === 'sm'
              ? { backgroundColor: '#4caf82', borderColor: '#4caf82' }
              : {}
          "
          @click="currentSize = 'sm'"
        >
          Small
        </NButton>
      </NButtonGroup>
    </div>

    <!-- Card Grid -->
    <div class="card-grid" :class="{ 'card-grid-sm': currentSize === 'sm' }">
      <PokemonCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :size="currentSize"
        :selectable="selectableMode"
        :selected="selectedCardIds.has(card.id)"
        :disabled="isCardDisabled(card.id)"
        @click="handleCardClick(card.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NButtonGroup } from 'naive-ui'
import { computed, ref, watch } from 'vue'

import type { Card } from '../../types/index.js'
import PokemonCard from './PokemonCard.vue'

interface Props {
  cards: Card[]
  selectableMode?: boolean
  maxSelectable?: number
  size?: 'sm' | 'md'
  preSelectedIds?: number[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectionChange: [selectedIds: number[]]
}>()

const selectedCardIds = ref(new Set<number>(props.preSelectedIds ?? []))
const currentSize = ref<'sm' | 'md'>(props.size ?? 'md')

watch(
  () => props.preSelectedIds,
  (newIds) => {
    if (newIds) {
      selectedCardIds.value = new Set(newIds)
    }
  },
  { deep: true },
)

const isCardDisabled = (cardId: number): boolean => {
  if (selectedCardIds.value.size >= (props.maxSelectable ?? Infinity)) {
    return !selectedCardIds.value.has(cardId)
  }
  return false
}

const handleCardClick = (cardId: number) => {
  if (selectedCardIds.value.has(cardId)) {
    selectedCardIds.value.delete(cardId)
  } else {
    selectedCardIds.value.add(cardId)
  }

  emit('selectionChange', Array.from(selectedCardIds.value))
}

const selectableMode = computed(() => props.selectableMode ?? false)
</script>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
}

.card-grid-sm {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  padding: 12px;
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
    padding: 12px;
  }

  .card-grid-sm {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    padding: 8px;
  }

  .card-grid-sm {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 6px;
    padding: 6px;
  }
}
</style>
