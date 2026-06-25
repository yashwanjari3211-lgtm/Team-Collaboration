import client from './client'

export const getCurrentUser = () => client.get('/users/me')

export const updateProfile = (data) => client.patch('/users/me', data)

export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return client.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
