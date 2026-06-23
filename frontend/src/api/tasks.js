import client from './client'

export const getTasks = (channel_id) => 
  client.get('/tasks/', { params: { channel_id } })

export const createTask = (task) => 
  client.post('/tasks/', task)

export const updateTask = (task_id, updates) => 
  client.patch(`/tasks/${task_id}`, updates)
