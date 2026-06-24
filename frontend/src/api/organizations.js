import client from './client'

export const getOrganizations = () => client.get('/organizations/')
export const createOrganization = (name, description) => client.post('/organizations/', { name, description })
