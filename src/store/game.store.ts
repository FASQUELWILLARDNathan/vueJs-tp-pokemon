import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useStorage } from '@/composables/useStorage'
import type { GameState, Room, SocketErrorEvent } from '@/types'

interface GameStoreState {
  socket: Socket | null
  isConnected: boolean
  rooms: Room[]
  currentRoom: Room | null
  gameState: GameState | null
  selectedDeckId: number | null
  errorMessage: string | null
  lastEvent: string | null
  lastAttackDamage: number | null
  lastOpponentKnockouts: number | null
  knockoutCounts: { host: number; guest: number }
}

export const useGameStore = defineStore('game', () => {
  // State

  const state = ref<GameStoreState>({
    socket: null,
    isConnected: false,
    rooms: [],
    currentRoom: null,
    gameState: null,
    selectedDeckId: null,
    errorMessage: null,
    lastEvent: null,
    lastAttackDamage: null,
    lastOpponentKnockouts: null,
    knockoutCounts: { host: 0, guest: 0 },
  })

  const router = useRouter()
  const { get } = useStorage()

  // Computed

  const isGameActive = computed(
    () => state.value.gameState?.status === 'playing',
  )

  const isCurrentPlayerTurn = computed(() => {
    if (!state.value.gameState) return false

    const socket = state.value.socket
    if (!socket || !socket.id) return false
    const currentPlayerSocketId = state.value.gameState.currentPlayerSocketId
    if (!currentPlayerSocketId) return false
    return socket.id === currentPlayerSocketId
  })

  const currentPlayerRole = computed(() => {
    if (!state.value.gameState) return null
    const socket = state.value.socket
    if (!socket) return null

    if (state.value.gameState.host?.socketId === socket.id) {
      return 'host'
    } else if (state.value.gameState.guest?.socketId === socket.id) {
      return 'guest'
    }
    return null
  })

  const currentPlayerState = computed(() => {
    if (!state.value.gameState) return null
    const role = currentPlayerRole.value
    if (!role) return null

    const player =
      role === 'host' ? state.value.gameState.host : state.value.gameState.guest
    if (!player) return null

    const serverKos = player.knockouts ?? 0
    const localKos = state.value.knockoutCounts[role]

    return {
      id: 0,
      username: '',
      deckId: 0,
      hand: player.board.hand ?? [],
      deck: player.board.deck ?? [],
      bench: player.board.bench ?? [],
      activeCard: player.board.activeCard ?? undefined,
      activeCardHp:
        player.board.activeCard?.currentHp ?? player.board.activeCard?.hp ?? 0,
      knockouts: serverKos > 0 ? serverKos : localKos,
    }
  })

  const opponentPlayerState = computed(() => {
    if (!state.value.gameState) return null
    const role = currentPlayerRole.value
    if (!role) return null

    const opponent =
      role === 'host' ? state.value.gameState.guest : state.value.gameState.host
    if (!opponent) return null

    const opponentRole = role === 'host' ? 'guest' : 'host'
    const serverKos = opponent.knockouts ?? 0
    const localKos = state.value.knockoutCounts[opponentRole]

    return {
      id: 0,
      username: '',
      deckId: 0,
      hand: opponent.board.hand ?? [],
      deck: opponent.board.deck ?? [],
      bench: opponent.board.bench ?? [],
      activeCard: opponent.board.activeCard ?? undefined,
      activeCardHp:
        opponent.board.activeCard?.currentHp ??
        opponent.board.activeCard?.hp ??
        0,
      knockouts: serverKos > 0 ? serverKos : localKos,
    }
  })

  // Socket connection

  const setupSocketListeners = () => {
    const socket = state.value.socket
    if (!socket) return

    // Lobby events

    socket.on('roomsList', (data: unknown) => {
      let rooms: Room[] = []
      if (Array.isArray(data)) {
        rooms = data
      } else if (typeof data === 'object' && data !== null && 'rooms' in data) {
        const typedData = data as Record<string, unknown>
        if (Array.isArray(typedData.rooms)) {
          rooms = typedData.rooms as Room[]
        }
      }
      state.value.rooms = rooms
      state.value.lastEvent = 'Liste des rooms mise à jour'
    })

    socket.on('roomsListUpdated', (data: unknown) => {
      let rooms: Room[] = []
      if (Array.isArray(data)) {
        rooms = data
      } else if (typeof data === 'object' && data !== null && 'rooms' in data) {
        const typedData = data as Record<string, unknown>
        if (Array.isArray(typedData.rooms)) {
          rooms = typedData.rooms as Room[]
        }
      }
      state.value.rooms = rooms
      state.value.lastEvent = 'Rooms mises à jour en temps réel'
    })

    socket.on(
      'roomCreated',
      (data: { room: Room } | { roomId: string | number; message: string }) => {
        const room = 'room' in data ? data.room : { id: data.roomId }
        state.value.currentRoom = room as Room
        state.value.lastEvent = 'Room créée avec succès'
      },
    )

    socket.on('roomJoined', (data: { room: Room }) => {
      state.value.currentRoom = data.room
      state.value.lastEvent = 'Vous avez rejoint la room'
    })

    // Game events

    socket.on('gameStarted', (data: { gameState: GameState }) => {
      state.value.gameState = data.gameState
      state.value.lastEvent = 'La partie a commencé'
      router.push('/game')
    })

    socket.on('gameStateUpdated', (data: { gameState: GameState }) => {
      const oldGameState = state.value.gameState
      const newGameState = data.gameState

      if (oldGameState && newGameState) {
        const role = currentPlayerRole.value
        if (!role) return

        const oldOpponent =
          role === 'host' ? oldGameState.guest : oldGameState.host
        const newOpponent =
          role === 'host' ? newGameState.guest : newGameState.host
        const oldPlayer =
          role === 'host' ? oldGameState.host : oldGameState.guest
        const newPlayer =
          role === 'host' ? newGameState.host : newGameState.guest

        if (oldOpponent && newOpponent) {
          const oldHp =
            oldOpponent.board.activeCard?.currentHp ??
            oldOpponent.board.activeCard?.hp ??
            0
          const newHp =
            newOpponent.board.activeCard?.currentHp ??
            newOpponent.board.activeCard?.hp ??
            0
          const maxHp = newOpponent.board.activeCard?.hp ?? 0
          const damage = Math.max(0, oldHp - newHp)

          if (oldOpponent.board.activeCard && !newOpponent.board.activeCard) {
            const cardName = oldOpponent.board.activeCard.name
            state.value.knockoutCounts[role]++
            state.value.lastEvent = `💀 ${cardName} a été mis KO! (${state.value.knockoutCounts[role]}/3)`
          }

          if (oldPlayer.board.activeCard && !newPlayer.board.activeCard) {
            const opponentRole = role === 'host' ? 'guest' : 'host'
            state.value.knockoutCounts[opponentRole]++
          }

          if (damage > 0) {
            state.value.lastAttackDamage = damage
            state.value.lastEvent = `⚔️ Attaque infligée: ${damage} dégâts! (${newHp}/${maxHp} HP restants)`
          } else if (state.value.lastEvent === 'État de la partie mis à jour') {
            state.value.lastEvent = 'État de la partie mis à jour'
          }
        }
      }

      state.value.gameState = newGameState
    })

    socket.on(
      'knockoutDetected',
      (data: { role: string; knockoutCount: number; cardName: string }) => {
        state.value.knockoutCounts[
          data.role as keyof typeof state.value.knockoutCounts
        ] = data.knockoutCount
      },
    )

    socket.on(
      'gameEnded',
      (data: { gameState: GameState; result: 'win' | 'loss' | 'draw' }) => {
        state.value.gameState = data.gameState
        state.value.lastEvent =
          data.result === 'win'
            ? 'Vous avez gagné !'
            : data.result === 'loss'
              ? 'Vous avez perdu'
              : 'Match nul'
      },
    )

    socket.on('opponentDisconnected', () => {
      state.value.lastEvent = "L'adversaire s'est déconnecté"
      if (state.value.gameState) {
        state.value.gameState = {
          ...state.value.gameState,
          status: 'finished',
        }
      }
    })

    socket.on('error', (data: SocketErrorEvent) => {
      state.value.errorMessage = data.message
    })
  }

  const connectSocket = async () => {
    if (state.value.isConnected || state.value.socket) {
      return
    }

    const token = get<string>('token')
    if (!token) {
      state.value.errorMessage = "Token d'authentification non trouvé"
      return
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL

    state.value.socket = io(socketUrl, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    setupSocketListeners()

    state.value.socket.on('connect', () => {
      state.value.isConnected = true
    })

    state.value.socket.on('disconnect', () => {
      state.value.isConnected = false
    })
  }

  const disconnectSocket = () => {
    if (state.value.socket) {
      state.value.socket.disconnect()
      state.value.socket = null
      state.value.isConnected = false
    }
  }

  // Lobby actions

  const fetchRooms = async () => {
    if (!state.value.isConnected) {
      await connectSocket()
    }
    if (state.value.socket) {
      state.value.socket.emit('getRoomsList')
    }
  }

  const createRoom = async (deckId: number) => {
    if (!state.value.socket || !state.value.isConnected) {
      state.value.errorMessage = 'Socket non connecté'
      return
    }
    state.value.selectedDeckId = deckId
    state.value.socket.emit('createRoom', { deckId })
  }

  const joinRoom = async (roomId: string | number, deckId: number) => {
    if (!state.value.socket || !state.value.isConnected) {
      state.value.errorMessage = 'Socket non connecté'
      return
    }
    state.value.selectedDeckId = deckId
    state.value.socket.emit('joinRoom', { roomId, deckId })
  }

  // Game actions

  const drawCards = () => {
    if (!state.value.socket || !isCurrentPlayerTurn.value) return
    state.value.socket.emit('drawCards', {
      roomId: state.value.gameState?.roomId,
    })
  }

  const playCard = (cardId: number) => {
    if (!state.value.socket || !isCurrentPlayerTurn.value) return
    state.value.socket.emit('playCard', {
      roomId: state.value.gameState?.roomId,
      cardId,
    })
  }

  const attack = (opponentCardId: number) => {
    if (!state.value.socket || !isCurrentPlayerTurn.value) return
    state.value.socket.emit('attack', {
      roomId: state.value.gameState?.roomId,
      opponentCardId,
    })
  }

  const endTurn = () => {
    if (!state.value.socket) return
    state.value.socket.emit('endTurn', {
      roomId: state.value.gameState?.roomId,
    })
  }

  // Reset

  const resetGame = () => {
    state.value = {
      socket: state.value.socket,
      isConnected: state.value.isConnected,
      rooms: [],
      currentRoom: null,
      gameState: null,
      selectedDeckId: null,
      errorMessage: null,
      lastEvent: null,
      lastAttackDamage: null,
      lastOpponentKnockouts: null,
      knockoutCounts: { host: 0, guest: 0 },
    }
  }

  const clearError = () => {
    state.value.errorMessage = null
  }

  const clearEvent = () => {
    state.value.lastEvent = null
  }

  return {
    // State
    state: computed(() => state.value),
    rooms: computed(() => state.value.rooms || []),
    currentRoom: computed(() => state.value.currentRoom),
    gameState: computed(() => state.value.gameState),
    selectedDeckId: computed(() => state.value.selectedDeckId),
    errorMessage: computed(() => state.value.errorMessage),
    lastEvent: computed(() => state.value.lastEvent),
    isConnected: computed(() => state.value.isConnected),

    // Computed
    isGameActive,
    isCurrentPlayerTurn,
    currentPlayerRole,
    currentPlayerState,
    opponentPlayerState,

    // Socket
    connectSocket,
    disconnectSocket,

    // Lobby
    fetchRooms,
    createRoom,
    joinRoom,

    // Game
    drawCards,
    playCard,
    attack,
    endTurn,
    resetGame,
    clearError,
    clearEvent,
  }
})
