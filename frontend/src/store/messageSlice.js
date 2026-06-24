import { createSlice } from '@reduxjs/toolkit'

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    items: [],
    loading: false,
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
  }
})

export const { setMessages, addMessage, setMessagesLoading } = messageSlice.actions
export default messageSlice.reducer
