import { createSlice } from '@reduxjs/toolkit'

const channelSlice = createSlice({
  name: 'channels',
  initialState: {
    items: [],
    activeId: null,
    activeDmUserId: null, // Track when we are in a DM instead of a channel
    activeDmUser: null, // Store the DM user info
    loading: false,
    memberStatuses: {}, // Track presence: user_id -> status
  },
  reducers: {
    setChannels: (state, action) => {
      state.items = action.payload
      state.items = action.payload
      if (!state.activeId && !state.activeDmUserId && action.payload.length > 0) {
        state.activeId = action.payload[0].id
      }
    },
    setActiveChannel: (state, action) => {
      state.activeId = action.payload
      state.activeDmUserId = null
      state.activeDmUser = null
    },
    setActiveDm: (state, action) => {
      state.activeDmUserId = action.payload.userId
      state.activeDmUser = action.payload.user
      state.activeId = null // clear channel id initially
    },
    setActiveDmChannelId: (state, action) => {
      state.activeId = action.payload // Set the channel ID without clearing DM state
    },
    setChannelsLoading: (state, action) => {
      state.loading = action.payload
    },
    addChannel: (state, action) => {
      state.items.push(action.payload)
    },
    setMemberStatus: (state, action) => {
      const { userId, status } = action.payload
      if (!state.memberStatuses) state.memberStatuses = {}
      state.memberStatuses[userId] = status
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase('boards/setActiveBoard', (state) => {
        state.activeId = null;
        state.activeDmUserId = null;
        state.activeDmUser = null;
      });
  }
})

export const { setChannels, setActiveChannel, setActiveDm, setActiveDmChannelId, setChannelsLoading, addChannel, setMemberStatus } = channelSlice.actions
export default channelSlice.reducer
