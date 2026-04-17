<template>
  <NCard style="background-color: #f9f9f9">
    <NSpace vertical :size="16">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <div style="font-weight: 600; font-size: 14px">
          Votre Main ({{ hand.length }}/5)
        </div>
        <div
          v-if="!isPlayerTurn || playerState?.activeCard"
          style="font-size: 12px; color: #999"
        >
          {{
            isPlayerTurn
              ? '⚠️ Vous avez une carte active'
              : '⏳ En attente de votre tour'
          }}
        </div>
      </div>

      <!-- Cartes en main (grille) -->
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        "
      >
        <div
          v-for="card in hand"
          :key="card.id"
          :style="{
            cursor: canPlayCard ? 'pointer' : 'default',
            opacity: canPlayCard ? 1 : 0.5,
            position: 'relative',
            transition: 'all 0.3s ease',
          }"
          style="
            border-radius: 8px;
            overflow: hidden;
            background: white;
            border: 2px solid #ddd;
          "
          @mouseenter="hoveredCardId = card.id"
          @mouseleave="hoveredCardId = null"
          @click="canPlayCard && handlePlayCard(card.id, card.name)"
        >
          <!-- Image de la carte -->
          <div
            :style="{
              borderColor: hoveredCardId === card.id ? '#4caf82' : '#ddd',
            }"
            style="border: 2px solid; transition: border-color 0.3s ease"
          >
            <img
              v-if="card.imgUrl"
              :src="card.imgUrl"
              :alt="card.name"
              style="
                width: 100%;
                height: 160px;
                object-fit: cover;
                display: block;
              "
            />
            <div
              v-else
              style="
                width: 100%;
                height: 160px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-weight: 600;
                text-align: center;
                padding: 8px;
                font-size: 12px;
              "
            >
              {{ card.name }}
            </div>
          </div>

          <!-- Infos de la carte -->
          <div style="padding: 8px; background: white">
            <div
              style="
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 4px;
              "
            >
              #{{ card.pokedexNumber }}
            </div>
            <div
              style="
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 2px;
              "
            >
              {{ card.name }}
            </div>
            <div style="font-size: 10px; color: #666; margin-bottom: 4px">
              {{ card.type }}
            </div>
            <div
              style="
                display: flex;
                justify-content: space-around;
                gap: 4px;
                font-size: 10px;
              "
            >
              <span style="color: #d32f2f; font-weight: 600"
                >⚔️ {{ card.attack }}</span
              >
              <span style="color: #1976d2; font-weight: 600"
                >❤️ {{ card.hp }}</span
              >
            </div>
          </div>

          <!-- Overlay au survol -->
          <div
            v-if="hoveredCardId === card.id && canPlayCard"
            style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(76, 175, 130, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: white;
              font-weight: 600;
              border-radius: 8px;
            "
          >
            Jouer
          </div>
        </div>
      </div>

      <!-- Message si main vide -->
      <div
        v-if="hand.length === 0"
        style="
          text-align: center;
          color: #999;
          font-style: italic;
          padding: 16px;
        "
      >
        Votre main est vide - piochez des cartes!
      </div>

      <!-- Messages d'état -->
      <div
        v-if="hand.length >= 5"
        style="
          text-align: center;
          color: #f5576c;
          font-size: 12px;
          padding: 8px;
          background-color: #ffe0e0;
          border-radius: 4px;
        "
      >
        ⚠️ Votre main est pleine (5/5)
      </div>
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
import { NCard, NSpace } from 'naive-ui'
import { computed, ref } from 'vue'

import type { Card, PlayerState } from '@/types'

interface Props {
  hand: Card[]
  isPlayerTurn: boolean
  playerState: PlayerState | null | undefined
}

const props = defineProps<Props>()
const emit = defineEmits<{
  playCard: [cardId: number]
}>()

const hoveredCardId = ref<number | null>(null)

const canPlayCard = computed(() => {
  return (
    props.isPlayerTurn &&
    !props.playerState?.activeCard &&
    props.hand.length > 0
  )
})

const handlePlayCard = (cardId: number) => {
  emit('playCard', cardId)
}
</script>
