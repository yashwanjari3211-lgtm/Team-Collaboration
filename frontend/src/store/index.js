import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import messageReducer from './messageSlice'
import taskReducer from './taskSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    tasks: taskReducer
  }
})

export default store
