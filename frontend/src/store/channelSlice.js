import { createSlice } from '@reduxjs/toolkit'

const channelSlice = createSlice({
  name: 'channels',
  initialState: {
    items: [],
    activeId: null,
    loading: false,
  },
  reducers: {
    setChannels: (state, action) => {
      state.items = action.payload
      if (!state.activeId && action.payload.length > 0) {
        state.activeId = action.payload[0].id
      }
    },
    setActiveChannel: (state, action) => {
      state.activeId = action.payload
    },
    setChannelsLoading: (state, action) => {
      state.loading = action.payload
    },
    addChannel: (state, action) => {
      state.items.push(action.payload)
    },
  }
})

export const { setChannels, setActiveChannel, setChannelsLoading, addChannel } = channelSlice.actions
export default channelSlice.reducer
