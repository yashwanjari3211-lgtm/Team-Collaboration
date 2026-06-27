import client from './client'

export const getTasks = (board_id) => 
  client.get('/tasks/', { params: { board_id } })

export const createTask = (task) => 
  client.post('/tasks/', task)

export const updateTask = (task_id, updates) => 
  client.patch(`/tasks/${task_id}`, updates)
