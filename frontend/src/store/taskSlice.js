import { createSlice } from '@reduxjs/toolkit'

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    todo: [],
    inProgress: [],
    done: []
  },
  reducers: {
    setTasks: (state, action) => {
      const tasks = action.payload
      state.todo = tasks.filter(t => t.status === 'todo')
      state.inProgress = tasks.filter(t => t.status === 'in_progress')
      state.done = tasks.filter(t => t.status === 'done')
    },
    addTask: (state, action) => {
      const task = action.payload
      if (task.status === 'todo') state.todo.push(task)
      else if (task.status === 'in_progress') state.inProgress.push(task)
      else if (task.status === 'done') state.done.push(task)
    }
  }
})

export const { setTasks, addTask } = taskSlice.actions
export default taskSlice.reducer
