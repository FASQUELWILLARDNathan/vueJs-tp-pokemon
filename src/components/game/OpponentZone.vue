<template>
  <NCard style="background-color: #f0f0f0">
    <NSpace vertical :size="16">
      <!-- Info joueur -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
        <!-- Nom et infos -->
        <div style="text-align: left">
          <div style="font-weight: 600; margin-bottom: 4px">
            {{ opponentState?.username ?? 'Adversaire' }}
          </div>
          <div style="font-size: 12px; color: #666">
            Main: {{ opponentState?.hand.length ?? 0 }}/5 | Deck:
            {{ opponentState?.deck.length ?? 0 }}
          </div>
        </div>

        <!-- Score KOs -->
        <div style="text-align: right">
          <div
            style="
              font-size: 12px;
              color: #999;
              text-transform: uppercase;
              margin-bottom: 4px;
            "
          >
            KOs
          </div>
          <div
            style="
              font-size: 24px;
              font-weight: 700;
              color: #d32f2f;
              display: flex;
              justify-content: flex-end;
              align-items: center;
            "
          >
            {{ opponentState?.knockouts ?? 0 }}
            <span style="font-size: 16px; margin-left: 4px; color: #999">
              / 3
            </span>
          </div>
        </div>
      </div>

      <!-- Carte active avec HP -->
      <div v-if="opponentState?.activeCard" style="text-align: center">
        <div
          style="
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 8px;
            padding: 16px;
            color: white;
            margin-bottom: 12px;
          "
        >
          <!-- Image de la carte (si disponible) ou placeholder -->
          <div
            v-if="opponentState.activeCard.imgUrl"
            style="margin-bottom: 12px"
          >
            <img
              :src="opponentState.activeCard.imgUrl"
              :alt="opponentState.activeCard.name"
              style="
                max-width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 4px;
              "
            />
          </div>

          <!-- Nom et type -->
          <div style="font-weight: 600; margin-bottom: 8px; font-size: 16px">
            #{{ opponentState.activeCard.pokedexNumber }}<br />
            {{ opponentState.activeCard.name }}
          </div>
          <div
            style="
              font-size: 12px;
              color: rgba(255, 255, 255, 0.9);
              margin-bottom: 12px;
            "
          >
            {{ opponentState.activeCard.type }}
          </div>

          <!-- Stats -->
          <div
            style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              margin-bottom: 12px;
            "
          >
            <div
              style="
                background: rgba(0, 0, 0, 0.2);
                padding: 8px;
                border-radius: 4px;
              "
            >
              <div style="font-size: 11px; opacity: 0.9">ATK</div>
              <div style="font-size: 16px; font-weight: 600">
                {{ opponentState.activeCard.attack }}
              </div>
            </div>
            <div
              style="
                background: rgba(0, 0, 0, 0.2);
                padding: 8px;
                border-radius: 4px;
              "
            >
              <div style="font-size: 11px; opacity: 0.9">HP</div>
              <div style="font-size: 16px; font-weight: 600">
                {{ opponentState.activeCard.hp }}
              </div>
            </div>
          </div>

          <!-- Barre de HP -->
          <div
            style="
              background-color: rgba(255, 255, 255, 0.3);
              border-radius: 4px;
              height: 12px;
              overflow: hidden;
            "
          >
            <div
              :style="{
                width: `${Math.max(0, Math.min(100, (opponentState.activeCardHp / opponentState.activeCard.hp) * 100))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4caf82, #45a049)',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }"
            />
          </div>
          <div style="font-size: 12px; margin-top: 8px; opacity: 0.9">
            {{ opponentState.activeCardHp }} /
            {{ opponentState.activeCard.hp }} HP
          </div>
        </div>
      </div>

      <!-- Placeholder si pas de carte active -->
      <div
        v-else
        style="
          text-align: center;
          padding: 32px;
          color: #ff6b6b;
          font-style: italic;
          background-color: #ffe0e0;
          border-radius: 8px;
        "
      >
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px">
          💀 Carte KO!
        </div>
        <div style="font-size: 12px">
          Aucune carte active - En attente de changement...
        </div>
      </div>
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
import { NCard, NSpace } from 'naive-ui'

import type { PlayerState } from '@/types'

interface Props {
  opponentState: PlayerState | null | undefined
}

defineProps<Props>()
</script>
