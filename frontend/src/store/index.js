import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import messageReducer from './messageSlice'
import taskReducer from './taskSlice'
import channelReducer from './channelSlice'
import uiReducer from './uiSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    tasks: taskReducer,
    channels: channelReducer,
    ui: uiReducer,
  }
})

export default store
