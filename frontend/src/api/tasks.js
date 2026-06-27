import client from './client'

export const getTasks = (board_id) => 
  client.get('/tasks/', { params: { board_id } })

export const createTask = (task) => 
  client.post('/tasks/', task)

export const updateTask = (task_id, updates) => 
  client.patch(`/tasks/${task_id}`, updates)

export const deleteTask = (task_id) =>
  client.delete(`/tasks/${task_id}`)

export const reorderTasks = (updates) => 
  client.post('/tasks/reorder', updates)

export const getTaskComments = (task_id) =>
  client.get(`/tasks/${task_id}/comments`)

export const createTaskComment = (task_id, content) =>
  client.post(`/tasks/${task_id}/comments`, { content })
