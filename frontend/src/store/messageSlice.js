import { createSlice } from '@reduxjs/toolkit'

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    items: [],
    loading: false,
    filter: 'all', // 'all' | 'mentions' | 'saved' | 'dms'
    typingUsers: {}, // key: channelId, value: { userId: userName }
    savedIds: [], // Track bookmarked message IDs
  },
  reducers: {
    setMessages: (state, action) => {
      state.items = action.payload
    },
    addMessage: (state, action) => {
      const exists = state.items.find(m => m.id === action.payload.id)
      if (!exists) {
        state.items.push(action.payload)
      }
    },
    setMessagesLoading: (state, action) => {
      state.loading = action.payload
    },
    setFilter: (state, action) => {
      state.filter = action.payload
    },
    setTyping: (state, action) => {
      const { channelId, userId, userName, isTyping } = action.payload
      if (!state.typingUsers) state.typingUsers = {}
      if (!state.typingUsers[channelId]) state.typingUsers[channelId] = {}
      if (isTyping) {
        state.typingUsers[channelId][userId] = userName
      } else {
        delete state.typingUsers[channelId][userId]
      }
    },
    setSavedIds: (state, action) => {
      state.savedIds = action.payload
    },
    saveMessageInState: (state, action) => {
      if (!state.savedIds) state.savedIds = []
      if (!state.savedIds.includes(action.payload)) {
        state.savedIds.push(action.payload)
      }
    },
    unsaveMessageInState: (state, action) => {
      if (state.savedIds) {
        state.savedIds = state.savedIds.filter(id => id !== action.payload)
      }
    }
  }
})

export const { setMessages, addMessage, setMessagesLoading, setFilter, setTyping, setSavedIds, saveMessageInState, unsaveMessageInState } = messageSlice.actions
export default messageSlice.reducer
