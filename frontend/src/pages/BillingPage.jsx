import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  createSubscription,
  getCurrentSubscription,
  getRazorpayKey,
  getSubscriptionPlans,
  verifySubscription,
} from '../api/subscriptions'

export default function BillingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = useSelector((state) => state.auth.user)
  const [pricingCatalog, setPricingCatalog] = useState(null)
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [razorpayKey, setRazorpayKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [subscribingPlanId, setSubscribingPlanId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        setLoading(true)
        setError('')
        const countryCodeOverride = searchParams.get('country_code') || undefined

        const [plansResponse, subscriptionResponse, keyResponse] = await Promise.all([
          getSubscriptionPlans(countryCodeOverride),
          getCurrentSubscription(),
          getRazorpayKey().catch(() => ({ data: { key_id: '' } })),
        ])

        setPricingCatalog(plansResponse.data)
        setCurrentSubscription(subscriptionResponse.data)
        setRazorpayKey(keyResponse.data.key_id || '')
      } catch (loadError) {
        setError(loadError.response?.data?.detail || 'Failed to load billing details')
      } finally {
        setLoading(false)
      }
    }

    loadBillingData()
  }, [searchParams])

  const activePlanId = useMemo(() => {
    if (currentSubscription?.razorpay_plan_id) {
      return currentSubscription.razorpay_plan_id
    }

    return null
  }, [currentSubscription])

  const recommendedMarket = pricingCatalog?.recommended_market
  const detectedCountry = pricingCatalog?.detected_country

  const handleSubscription = async (plan, market) => {
    if (plan.cta_type === 'contact_sales') {
      window.location.href = 'mailto:sales@teamcollab.local?subject=Enterprise%20Plan%20Inquiry'
      return
    }

    if (market.market !== recommendedMarket) {
      setError(`This pricing is not available for your detected region (${detectedCountry}).`)
      return
    }

    try {
      setSubscribingPlanId(plan.id)
      setError('')
      setSuccess('')

      const createResponse = await createSubscription(plan.id)
      const { subscription_id, free_plan, message } = createResponse.data

      if (free_plan) {
        setSuccess(message || 'Free plan activated successfully')
        setCurrentSubscription(null)
        return
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout failed to load')
      }

      if (!subscription_id || !razorpayKey) {
        throw new Error('Razorpay configuration is incomplete')
      }

      const options = {
        key: razorpayKey,
        subscription_id,
        name: 'Team Collab',
        description: `${plan.name} subscription`,
        handler: async (response) => {
          try {
            await verifySubscription({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            })

            setSuccess('Subscription activated successfully')
            const subscriptionResponse = await getCurrentSubscription()
            setCurrentSubscription(subscriptionResponse.data)
          } catch (verifyError) {
            setError(verifyError.response?.data?.detail || 'Payment verification failed')
          } finally {
            setSubscribingPlanId(null)
          }
        },
        prefill: {
          name: user?.full_name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#e8912e',
        },
        modal: {
          ondismiss: () => {
            setSubscribingPlanId(null)
            setError('Checkout closed before payment authorization completed')
          },
        },
      }

      const razorpayCheckout = new window.Razorpay(options)
      razorpayCheckout.on('payment.failed', () => {
        setSubscribingPlanId(null)
        setError('Payment failed. Please try another test card or retry.')
      })
      razorpayCheckout.open()
    } catch (subscriptionError) {
      setError(subscriptionError.response?.data?.detail || subscriptionError.message || 'Subscription failed')
      setSubscribingPlanId(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-400">Billing</p>
            <h1 className="mt-2 text-3xl font-bold">Choose the right plan for your workspace</h1>
            <p className="mt-2 text-sm text-surface-300">
              Pricing is selected by detected region. India sees INR pricing and everyone else sees USD pricing.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-lg border border-surface-700 px-4 py-2 text-sm font-medium text-surface-200 transition hover:border-surface-500"
          >
            Back to Dashboard
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}

        <div className="mb-8 rounded-2xl border border-surface-800 bg-surface-900/70 p-5">
          <h2 className="text-lg font-semibold">Current subscription</h2>
          <p className="mt-2 text-sm text-surface-300">
            {currentSubscription
              ? `Active plan: ${currentSubscription.razorpay_plan_id} (${currentSubscription.status})`
              : 'No paid subscription is active right now. You can still choose the free plan.'}
          </p>
          {recommendedMarket ? (
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-surface-400">
              Detected country: {detectedCountry} | Recommended market: {recommendedMarket}
            </p>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-surface-800 bg-surface-900/70 p-6 text-sm text-surface-300">
            Loading plans...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {pricingCatalog?.markets?.map((market) => {
              const isRecommended = market.market === recommendedMarket

              return (
                <div
                  key={market.market}
                  className={`overflow-hidden rounded-[28px] border shadow-2xl ${
                    isRecommended
                      ? 'border-amber-500/50 bg-surface-900'
                      : 'border-surface-800 bg-surface-900/80'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between px-7 py-5 ${
                      market.market === 'india'
                        ? 'bg-gradient-to-r from-amber-700/30 to-brand-700/20'
                        : 'bg-gradient-to-r from-studio-700/20 to-brand-700/20'
                    }`}
                  >
                    <div>
                      <h2 className="text-2xl font-bold">{market.title}</h2>
                      <p className="mt-1 max-w-md text-sm text-surface-300">{market.subtitle}</p>
                    </div>
                    <div className="text-3xl font-bold text-surface-200">{market.badge}</div>
                  </div>

                  <div className="space-y-4 p-5">
                    {market.plans.map((plan) => {
                      const isActive = activePlanId === plan.id
                      const isBusy = subscribingPlanId === plan.id
                      const isUnavailable = !isRecommended && plan.cta_type !== 'contact_sales'

                      return (
                        <div
                          key={`${market.market}-${plan.code}`}
                          className={`rounded-2xl border p-5 ${
                            plan.is_popular
                              ? 'border-amber-500/40 bg-amber-500/8'
                              : 'border-surface-700 bg-surface-950/65'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                                {plan.is_popular ? (
                                  <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-200">
                                    Popular
                                  </span>
                                ) : null}
                                {isActive ? (
                                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                                    Active
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-lg text-surface-300">{plan.description}</p>
                            </div>

                            <div className="text-right">
                              <p className="text-4xl font-bold">{plan.display_price}</p>
                              <p className="text-lg text-surface-300">/{plan.interval}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSubscription(plan, market)}
                            disabled={isBusy || isActive || isUnavailable}
                            className="mt-6 w-full rounded-xl bg-gradient-to-r from-brand-500 to-amber-600 hover:from-brand-600 hover:to-amber-700 px-4 py-3 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:bg-surface-700 disabled:from-surface-700 disabled:to-surface-700 disabled:text-surface-500"
                          >
                            {isActive
                              ? 'Current Plan'
                              : isBusy
                                ? 'Processing...'
                                : isUnavailable
                                  ? 'Unavailable In Your Region'
                                  : plan.cta_label}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
