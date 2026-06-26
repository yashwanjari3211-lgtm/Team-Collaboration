import client from './client'

export const sendInvite = (email, role) => client.post('/invites/', { email, role })
export const getInvites = () => client.get('/invites/')
export const getGenericInvite = () => client.get('/invites/generic')
export const acceptInvite = (token) => client.post('/invites/accept', { token })
