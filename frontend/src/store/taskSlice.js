import { createSlice } from '@reduxjs/toolkit'

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    todo: [],
    inProgress: [],
    done: [],
    loading: false,
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
    },
    moveTask: (state, action) => {
      const { taskId, newStatus } = action.payload
      // Remove from all columns
      let task = null
      for (const col of ['todo', 'inProgress', 'done']) {
        const idx = state[col].findIndex(t => t.id === taskId)
        if (idx !== -1) {
          task = { ...state[col][idx], status: newStatus }
          state[col].splice(idx, 1)
          break
        }
      }
      // Add to new column
      if (task) {
        if (newStatus === 'todo') state.todo.push(task)
        else if (newStatus === 'in_progress') state.inProgress.push(task)
        else if (newStatus === 'done') state.done.push(task)
      }
    },
    setTasksLoading: (state, action) => {
      state.loading = action.payload
    },
  }
})

export const { setTasks, addTask, moveTask, setTasksLoading } = taskSlice.actions
export default taskSlice.reducer
