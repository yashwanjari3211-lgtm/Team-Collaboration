import client from './client'

export const login = (email, password) => 
  client.post('/auth/login', { email, password })

export const register = (email, password, full_name) => 
  client.post('/auth/register', { email, password, full_name })

export const refreshToken = () => 
  client.post('/auth/refresh')

export const forgotPassword = (email) =>
  client.post('/auth/forgot-password', { email })

export const resetPassword = (token, new_password) =>
  client.post('/auth/reset-password', { token, new_password })

export const googleLogin = (code) =>
  client.post('/auth/google', { code })

export const getGoogleAuthUrl = () =>
  client.get('/auth/google/url')
