import client from './client'

export const login = (email, password) => 
  client.post('/auth/login', { email, password })

export const register = (email, password, full_name) => 
  client.post('/auth/register', { email, password, full_name })

export const refreshToken = () => 
  client.post('/auth/refresh')
