<template>
  <div
    :style="{
      position: 'relative',
      cursor: selectable && !disabled ? 'pointer' : 'default',
      opacity: disabled ? 0.5 : 1,
    }"
    @click="handleClick"
  >
    <NCard
      :segmented="false"
      :style="{
        width: size === 'sm' ? '140px' : '180px',
        textAlign: 'center',
        borderColor: selected ? '#4caf50' : undefined,
        boxShadow: selected ? '0 0 0 3px rgba(76, 175, 80, 0.25)' : undefined,
      }"
    >
      <template #header>
        <div style="text-align: center; width: 100%">
          <p
            style="margin: 0; font-size: 12px; color: #9e9e9e; font-weight: 500"
          >
            #{{ card.pokedexNumber }}
          </p>
        </div>
      </template>

      <div style="display: flex; justify-content: center; margin-bottom: 8px">
        <img
          :src="card.imgUrl"
          :alt="card.name"
          :style="{
            width: size === 'sm' ? '80px' : '110px',
            height: size === 'sm' ? '80px' : '110px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))',
          }"
        />
      </div>

      <h3
        :style="{
          margin: '4px 0',
          fontSize: size === 'sm' ? '14px' : '17px',
          fontWeight: 700,
        }"
      >
        {{ card.name }}
      </h3>

      <div style="margin: 6px 0; display: flex; justify-content: center">
        <NTag
          :type="getTagType(card.type)"
          :style="{ backgroundColor: typeColor }"
        >
          {{ card.type }}
        </NTag>
      </div>

      <NSpace justify="center" :size="4" style="margin: 6px 0; font-size: 13px">
        <span>❤️ {{ card.hp }}</span>
        <span style="color: #bbb">·</span>
        <span>⚔️ {{ card.attack }}</span>
      </NSpace>

      <div v-if="currentHp !== undefined" style="margin-top: 8px">
        <div
          :style="{
            width: '100%',
            height: '5px',
            backgroundColor: '#e0e0e0',
            borderRadius: '3px',
            overflow: 'hidden',
          }"
        >
          <div
            :style="{
              height: '100%',
              width: `${hpPercent}%`,
              backgroundColor: hpBarColor,
              transition: 'width 0.3s ease',
              borderRadius: '3px',
            }"
          />
        </div>
        <p style="margin: 3px 0 0 0; font-size: 10px; color: #999">
          {{ currentHp }}/{{ card.hp }}
        </p>
      </div>

      <div
        v-if="selectable && selected"
        :style="{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size === 'sm' ? '30px' : '40px',
          height: size === 'sm' ? '30px' : '40px',
          backgroundColor: '#4caf50',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: size === 'sm' ? '16px' : '22px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
        }"
      >
        ✓
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NCard, NSpace, NTag } from 'naive-ui'
import { computed } from 'vue'

import { useColors } from '../../composables/useColors.js'
import type { Card } from '../../types/index.js'

interface Props {
  card: Card
  size?: 'sm' | 'md'
  selected?: boolean
  disabled?: boolean
  selectable?: boolean
  currentHp?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  selected: false,
  disabled: false,
  selectable: false,
  currentHp: undefined,
})

const emit = defineEmits<{
  click: []
}>()

const { getTypeColor, hpColor } = useColors()

const typeColor = computed(() => getTypeColor(props.card.type))

const hpPercent = computed(() => {
  if (props.currentHp === undefined) return 0
  return (props.currentHp / props.card.hp) * 100
})

const hpBarColor = computed(() => {
  if (props.currentHp === undefined) return '#ccc'
  return hpColor((props.currentHp / props.card.hp) * 100)
})

const getTagType = (
  type: string,
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  const typeMap: Record<
    string,
    'success' | 'warning' | 'error' | 'info' | 'default'
  > = {
    fire: 'error',
    water: 'info',
    grass: 'success',
    electric: 'warning',
  }
  return typeMap[type.toLowerCase()] || 'default'
}

const handleClick = () => {
  if (!props.disabled && props.selectable) {
    emit('click')
  }
}
</script>
