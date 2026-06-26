import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const LandingPage = () => {
  const navigate = useNavigate()
  const [memberCount, setMemberCount] = useState(10)
  const [isAnnual, setIsAnnual] = useState(true)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const observerRef = useRef(null)

  useEffect(() => {
    // Scroll fade-in observer
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.fade-up').forEach(el => {
      observerRef.current.observe(el)
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('visible')
      }
    })

    return () => observerRef.current?.disconnect()
  }, [])

  useEffect(() => {
    // Nav scroll effect
    const handleScroll = () => {
      const nav = document.getElementById('nav')
      nav?.classList.toggle('scrolled', window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Pricing calculations with updated values
  const calculatePricing = (members) => {
    const slackPrice = members * 605
    const teamsPrice = members * 495
    let tcPrice, planLabel
    
    if (members <= 5) {
      tcPrice = 0
      planLabel = 'Free forever!'
    } else if (members <= 25) {
      tcPrice = 1499
      planLabel = 'Starter plan'
    } else {
      tcPrice = 3999
      planLabel = 'Pro plan'
    }
    
    return { slackPrice, teamsPrice, tcPrice, planLabel, saving: slackPrice - tcPrice }
  }

  const pricing = calculatePricing(memberCount)

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav id="nav">
        <div className="container">
          <div className="nav-inner">
            <a className="nav-logo" href="#home">
              <div className="logo-mark">TC</div>
              <span className="logo-text">TeamCollab</span>
            </a>
            <div className="nav-links">
              <a className="nav-link" href="#features">Features</a>
              <a className="nav-link" href="#pricing">Pricing</a>
              <a className="nav-link" href="#compare">Compare</a>
              <a className="nav-link" href="#how">How it works</a>
            </div>
            <div className="nav-actions">
              <button onClick={() => navigate('/login')} className="btn btn-ghost" style={{padding:'7px 16px',fontSize:'13px'}}>Sign in</button>
              <button onClick={() => navigate('/login')} className="btn btn-primary" style={{padding:'7px 16px',fontSize:'13px'}}>Start free →</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="hero-grid"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div>
              <div className="hero-eyebrow fade-up">
                <span className="eyebrow-badge">NEW</span>
                Multi-tenant SaaS — v1.0 now live
              </div>
              <h1 className="hero-h1 fade-up" style={{transitionDelay:'.08s'}}>
                The team workspace<br />
                <span className="gradient-text">India actually uses</span>
              </h1>
              <p className="hero-sub fade-up" style={{transitionDelay:'.16s'}}>
                Real-time messaging, Kanban tasks, and org management — all in one place.
                <strong> Free for up to 5 members.</strong> No USD pricing. No per-seat surprise bills.
              </p>
              <div className="hero-actions fade-up" style={{transitionDelay:'.22s'}}>
                <button onClick={() => navigate('/login')} className="btn btn-primary" style={{padding:'14px 28px',fontSize:'15px'}}>🚀 Start for free</button>
                <button className="btn btn-ghost" style={{padding:'14px 24px',fontSize:'15px'}}>Watch demo →</button>
              </div>
              <div className="hero-stats fade-up" style={{transitionDelay:'.3s'}}>
                <div><div className="stat-num">1200+</div><div className="stat-label">Messages daily</div></div>
                <div><div className="stat-num">340+</div><div className="stat-label">Teams onboarded</div></div>
                <div><div className="stat-num">99%</div><div className="stat-label">Uptime</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="trust-bar">
        <div className="container">
          <div className="trust-row">
            <span className="trust-lbl">Trusted by</span>
            <div style={{overflow:'hidden',flex:1}}>
              <div className="trust-scroll">
                {[...Array(2)].map((_, i) => (
                  <div key={i} style={{display:'flex',gap:'40px'}}>
                    <div className="trust-logo"><div className="tl-icon" style={{background:'linear-gradient(135deg,#6366F1,#4F46E5)'}}>Z</div>Zepto</div>
                    <div className="trust-logo"><div className="tl-icon" style={{background:'linear-gradient(135deg,#3B82F6,#2563EB)'}}>R</div>Razorpay</div>
                    <div className="trust-logo"><div className="tl-icon" style={{background:'linear-gradient(135deg,#10B981,#059669)'}}>G</div>Groww</div>
                    <div className="trust-logo"><div className="tl-icon" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>M</div>Meesho</div>
                    <div className="trust-logo"><div className="tl-icon" style={{background:'linear-gradient(135deg,#EC4899,#DB2777)'}}>S</div>Slice</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Math Section */}
      <section className="math-section" id="math">
        <div className="container">
          <div className="math-inner">
            <div className="section-label fade-up"><span className="dot"></span> Pricing reality check</div>
            <h2 className="section-h2 fade-up" style={{transitionDelay:'.1s'}}>The math is<br /><span className="gradient-text">brutally simple</span></h2>
            <p className="section-sub fade-up" style={{transitionDelay:'.18s'}}>
              Slide to your team size. See exactly what you'd pay on Slack vs TeamCollab — every month, in rupees.
            </p>
            <div className="math-calculator fade-up" style={{transitionDelay:'.26s'}}>
              <div className="math-slider-row">
                <span className="math-slider-label">👥 Team members</span>
                <span className="math-count">{memberCount}</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="100" 
                value={memberCount} 
                onChange={(e) => setMemberCount(parseInt(e.target.value))}
              />
              <div className="math-grid">
                <div className="math-card">
                  <div className="mc-name">Slack Pro</div>
                  <div className="mc-price">₹{pricing.slackPrice.toLocaleString('en-IN')}</div>
                  <div className="mc-note">per month</div>
                </div>
                <div className="math-card">
                  <div className="mc-name">MS Teams</div>
                  <div className="mc-price">₹{pricing.teamsPrice.toLocaleString('en-IN')}</div>
                  <div className="mc-note">per month</div>
                </div>
                <div className="math-card winner">
                  <div className="mc-name" style={{color:'var(--accent2)'}}>TeamCollab ✓</div>
                  <div className="mc-price">{pricing.tcPrice === 0 ? '₹0' : `₹${pricing.tcPrice.toLocaleString('en-IN')}`}</div>
                  <div className="mc-note" style={{color:'var(--accent2)'}}>{pricing.planLabel}</div>
                </div>
              </div>
              <div className="math-saving">
                🎉 You save <span className="saving-amt">₹{pricing.saving.toLocaleString('en-IN')}</span> every single month
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="features-hdr">
            <div className="section-label fade-up"><span className="dot"></span> Everything you need</div>
            <h2 className="section-h2 fade-up" style={{transitionDelay:'.1s'}}>Built for how <span className="gradient-text">teams actually work</span></h2>
          </div>
          <div className="bento">
            <div className="bento-card wide fade-up">
              <div className="bento-icon">⚡</div>
              <div className="bento-h">Real-time messaging — under 50ms latency</div>
              <div className="bento-p">Messages appear the instant you send them. No polling, no refresh. WebSocket connections keep your whole team in sync with typing indicators, reactions, and threaded replies.</div>
            </div>
            <div className="bento-card fade-up" style={{transitionDelay:'.08s'}}>
              <div className="bento-icon">📋</div>
              <div className="bento-h">Kanban Task Board</div>
              <div className="bento-p">Drag cards across To Do → In Progress → Done. Set priorities, assign members, and track due dates — all in the same window as your chat.</div>
            </div>
            <div className="bento-card fade-up" style={{transitionDelay:'.12s'}}>
              <div className="bento-icon">🏢</div>
              <div className="bento-h">Multi-org Isolation</div>
              <div className="bento-p">Each organisation gets a fully isolated workspace. Invite via email link. Role-based access: owner, admin, member. Data never crosses org boundaries.</div>
            </div>
            <div className="bento-card fade-up" style={{transitionDelay:'.16s'}}>
              <div className="bento-icon">🔒</div>
              <div className="bento-h">JWT Auth + Refresh</div>
              <div className="bento-p">Stateless, secure authentication with automatic token rotation. HTTPS enforced. bcrypt passwords. Rate-limited login endpoints.</div>
            </div>
            <div className="bento-card fade-up" style={{transitionDelay:'.2s'}}>
              <div className="bento-icon">🇮🇳</div>
              <div className="bento-h">India-first Pricing</div>
              <div className="bento-p">Pay in ₹ via Razorpay. No forex conversion, no USD invoice surprises. Plans designed around Indian startup budgets — not Silicon Valley ones.</div>
            </div>
            <div className="bento-card fade-up" style={{transitionDelay:'.24s'}}>
              <div className="bento-icon">🛠</div>
              <div className="bento-h">FastAPI + React Stack</div>
              <div className="bento-p">Async Python backend, PostgreSQL, Redis. React + Redux Toolkit frontend. Open-source friendly. REST API documented at /docs.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="pricing-hdr">
            <div className="section-label fade-up"><span className="dot"></span> Simple pricing</div>
            <h2 className="section-h2 fade-up" style={{transitionDelay:'.1s'}}>Pay in <span className="gradient-text">rupees, not dollars</span></h2>
            <p className="section-sub fade-up" style={{transitionDelay:'.18s'}}>Flat rates. No per-seat surprises. No USD conversion. Cancel anytime.</p>
          </div>
          <div className="pricing-grid fade-up" style={{transitionDelay:'.34s'}}>
            <div className="pc">
              <div className="plan-name">Free</div>
              <div className="plan-price">₹0<sub>/mo</sub></div>
              <div className="plan-desc">Perfect for small teams. No credit card, no time limit.</div>
              <div className="plan-div"></div>
              <ul className="plan-feats">
                <li className="pf"><span className="pf-icon">✅</span> Up to 5 members</li>
                <li className="pf"><span className="pf-icon">✅</span> 3 channels</li>
                <li className="pf"><span className="pf-icon">✅</span> 10,000 messages</li>
                <li className="pf"><span className="pf-icon">✅</span> Basic Kanban board</li>
                <li className="pf off"><span className="pf-icon">✗</span> File uploads</li>
                <li className="pf off"><span className="pf-icon">✗</span> Admin controls</li>
              </ul>
              <button onClick={() => navigate('/login')} className="plan-btn pb-ghost">Get started free</button>
            </div>
            <div className="pc popular">
              <div className="popular-chip">Most Popular</div>
              <div className="plan-name">Starter</div>
              <div className="plan-price">₹1,499<sub>/mo</sub></div>
              <div className="plan-desc">For growing teams that outgrew free but can't justify Slack's bill.</div>
              <div className="plan-div"></div>
              <ul className="plan-feats">
                <li className="pf"><span className="pf-icon">✅</span> Up to 25 members</li>
                <li className="pf"><span className="pf-icon">✅</span> Unlimited channels</li>
                <li className="pf"><span className="pf-icon">✅</span> Unlimited messages</li>
                <li className="pf"><span className="pf-icon">✅</span> Full Kanban board</li>
                <li className="pf"><span className="pf-icon">✅</span> 5 GB file storage</li>
                <li className="pf off"><span className="pf-icon">✗</span> Custom subdomain</li>
              </ul>
              <button onClick={() => navigate('/login')} className="plan-btn pb-primary">Start Starter plan →</button>
            </div>
            <div className="pc">
              <div className="plan-name">Pro</div>
              <div className="plan-price">₹3,999<sub>/mo</sub></div>
              <div className="plan-desc">For teams that want complete control, analytics, and priority support.</div>
              <div className="plan-div"></div>
              <ul className="plan-feats">
                <li className="pf"><span className="pf-icon">✅</span> Up to 100 members</li>
                <li className="pf"><span className="pf-icon">✅</span> Unlimited everything</li>
                <li className="pf"><span className="pf-icon">✅</span> 50 GB file storage</li>
                <li className="pf"><span className="pf-icon">✅</span> Custom subdomain</li>
                <li className="pf"><span className="pf-icon">✅</span> Usage analytics</li>
                <li className="pf"><span className="pf-icon">✅</span> Priority support</li>
              </ul>
              <button onClick={() => navigate('/login')} className="plan-btn pb-ghost">Upgrade to Pro</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box fade-up">
            <h2 className="cta-h">Stop paying Slack's<br /><span className="gradient-text">USD invoice every month</span></h2>
            <p className="cta-sub">Your first 5 team members are free. Always. Switch takes 2 minutes.</p>
            <div className="cta-actions">
              <button onClick={() => navigate('/login')} className="btn btn-primary" style={{padding:'16px 36px',fontSize:'16px'}}>🚀 Create your workspace — it's free</button>
            </div>
            <div className="cta-note">No credit card · Free forever for small teams · Built in India 🇮🇳</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="logo-mark" style={{width:'26px',height:'26px',fontSize:'10px'}}>TC</div>
              TeamCollab
            </div>
            <div className="footer-links">
              <a href="#" className="fl">Privacy</a>
              <a href="#" className="fl">Terms</a>
              <a href="#" className="fl">Status</a>
              <a href="https://github.com" className="fl">GitHub</a>
            </div>
            <div className="footer-copy">© 2025 TeamCollab · Made in India 🇮🇳</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
