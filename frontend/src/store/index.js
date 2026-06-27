import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import messageReducer from './messageSlice'
import taskReducer from './taskSlice'
import channelReducer from './channelSlice'
import uiReducer from './uiSlice'

import boardReducer from './boardSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    tasks: taskReducer,
    channels: channelReducer,
    boards: boardReducer,
    ui: uiReducer,
  }
})

export default store
