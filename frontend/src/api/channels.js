import client from './client'

export const getChannels = (workspace_id) => 
  client.get('/channels/', { params: { workspace_id } })

export const createChannel = (name, workspace_id) => 
  client.post('/channels/', { name, workspace_id })
