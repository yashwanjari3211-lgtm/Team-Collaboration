import client from './client'

export const getChannels = () => client.get('/channels/')

export const createChannel = (name) => client.post('/channels/', { name })
