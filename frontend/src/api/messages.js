import client from './client'

export const getMessages = (channel_id) => 
  client.get('/messages/', { params: { channel_id } })

export const sendMessage = (content, channel_id) => 
  client.post('/messages/', { content, channel_id })
