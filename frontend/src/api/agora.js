import client from './client'

export const getAgoraToken = (channelName) => client.get(`/agora/token?channelName=${channelName}`)
