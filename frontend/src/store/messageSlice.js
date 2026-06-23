import { createSlice } from '@reduxjs/toolkit'

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    items: []
  },
  reducers: {
    setMessages: (state, action) => {
      state.items = action.payload
    },
    addMessage: (state, action) => {
      state.items.push(action.payload)
    }
  }
})

export const { setMessages, addMessage } = messageSlice.actions
export default messageSlice.reducer
