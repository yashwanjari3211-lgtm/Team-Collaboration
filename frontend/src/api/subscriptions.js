import client from './client'

export const getSubscriptionPlans = (country_code) =>
  client.get('/subscriptions/plans', {
    params: country_code ? { country_code } : undefined,
  })

export const getRazorpayKey = () => client.get('/subscriptions/key')

export const getCurrentSubscription = () => client.get('/subscriptions/current')

export const createSubscription = (plan_id) =>
  client.post('/subscriptions/create', { plan_id })

export const verifySubscription = (payload) =>
  client.post('/subscriptions/verify', payload)
