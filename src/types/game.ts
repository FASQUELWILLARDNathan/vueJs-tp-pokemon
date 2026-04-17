import type { Card } from './index.js'

/**
 * Types pour le système de lobby et de jeu
 */

// Lobby

export interface Room {
  id: string | number
  hostSocketId?: string
  hostId?: number
  hostUsername?: string
  guestId?: number
  guestUsername?: string
  hostDeckId?: number
  guestDeckId?: number
  status?: 'waiting' | 'playing' | 'finished'
  createdAt?: string
}

export interface RoomListResponse {
  rooms: Room[]
}

// Game state

export interface PlayerBoard {
  activeCard: Card | null
  hand: Card[]
  deck: Card[]
  bench?: Card[]
  score: number
}

export interface GamePlayer {
  socketId: string
  knockouts?: number
  board: PlayerBoard
}

export interface GameState {
  roomId: string | number
  gameId?: string
  status: 'waiting' | 'playing' | 'finished'
  currentPlayerSocketId?: string // SocketId du joueur dont c'est le tour
  currentTurnPlayerId?: number // ID du joueur dont c'est le tour (si disponible)
  winner?: number | string
  loser?: number | string
  host: GamePlayer
  guest: GamePlayer
  createdAt?: string
  updatedAt?: string
}

// Game actions

export interface GameAction {
  type: 'drawCards' | 'playCard' | 'attack' | 'endTurn'
  playerId: number
  data?: {
    cardId?: number
    targetCardId?: number
    damage?: number
  }
}

export interface AttackData {
  attackerCardId: number
  defenderCardId: number
  damage: number
}

// Socket events

export interface SocketErrorEvent {
  message: string
  code?: string
}
