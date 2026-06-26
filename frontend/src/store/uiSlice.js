import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    taskPanelOpen: true,
    commandPaletteOpen: false,
    darkMode: true,
    convertingMessage: null, // message content to pre-fill task
    replyingTo: null, // message object we are replying to
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    toggleTaskPanel: (state) => {
      state.taskPanelOpen = !state.taskPanelOpen
    },
    toggleCommandPalette: (state) => {
      state.commandPaletteOpen = !state.commandPaletteOpen
    },
    setCommandPaletteOpen: (state, action) => {
      state.commandPaletteOpen = action.payload
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
      if (state.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setConvertingMessage: (state, action) => {
      state.convertingMessage = action.payload
      if (action.payload) {
        state.taskPanelOpen = true
      }
    },
    setReplyingTo: (state, action) => {
      state.replyingTo = action.payload
    },
  }
})

export const {
  toggleSidebar,
  toggleTaskPanel,
  toggleCommandPalette,
  setCommandPaletteOpen,
  toggleDarkMode,
  setConvertingMessage,
  setReplyingTo,
} = uiSlice.actions
export default uiSlice.reducer
