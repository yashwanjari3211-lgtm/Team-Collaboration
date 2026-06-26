import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ClipboardList, Building2, Lock, Globe, Code2, Sparkles, Palette, Music } from 'lucide-react'
import './LandingPage.css'

const LandingPage = () => {
  const navigate = useNavigate()
  const [memberCount, setMemberCount] = useState(10)
  const [isAnnual, setIsAnnual] = useState(true)
  const [isIN, setIsIN] = useState(false)
  const [currency, setCurrency] = useState('$')
  const observerRef = useRef(null)

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country === 'IN') {
          setIsIN(true)
          setCurrency('₹')
        } else {
          setIsIN(false)
          setCurrency('$')
        }
      })
      .catch(() => {
        setIsIN(false)
        setCurrency('$')
      })
  }, [])

  useEffect(() => {
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
    const handleScroll = () => {
      const nav = document.getElementById('nav')
      nav?.classList.toggle('scrolled', window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const calculatePricing = (members, isINLocation, isAnnualBilling) => {
    let slackPrice, teamsPrice, tcPrice, planLabel
    
    if (isINLocation) {
      slackPrice = members * 605
      teamsPrice = members * 495
      
      if (members <= 5) {
        tcPrice = 0
        planLabel = 'Free forever'
      } else if (members <= 25) {
        tcPrice = Math.round(1499 * (isAnnualBilling ? 0.7 : 1))
        planLabel = 'Starter plan'
      } else {
        tcPrice = Math.round(3999 * (isAnnualBilling ? 0.7 : 1))
        planLabel = 'Pro plan'
      }
    } else {
      slackPrice = members * 8.75
      teamsPrice = members * 4.00
      
      if (members <= 5) {
        tcPrice = 0
        planLabel = 'Free forever'
      } else if (members <= 25) {
        tcPrice = Math.round(19 * (isAnnualBilling ? 0.7 : 1))
        planLabel = 'Starter plan'
      } else {
        tcPrice = Math.round(49 * (isAnnualBilling ? 0.7 : 1))
        planLabel = 'Pro plan'
      }
    }
    
    return { 
      slackPrice: Math.round(slackPrice), 
      teamsPrice: Math.round(teamsPrice), 
      tcPrice, 
      planLabel, 
      saving: Math.round(slackPrice - tcPrice) 
    }
  }

  const pricing = calculatePricing(memberCount, isIN, isAnnual)

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav id="nav">
        <div className="container">
          <div className="nav-inner">
            <a className="nav-logo" href="#home">
              <div className="logo-mark">S</div>
              <span className="logo-text">Studios</span>
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
                <span className="eyebrow-badge"><Sparkles size={10} /></span>
                Creative collaboration — v2.0 now live
              </div>
              <h1 className="hero-h1 fade-up" style={{transitionDelay:'.08s'}}>
                Where creative<br />
                <span className="gradient-text">teams build together</span>
              </h1>
              <p className="hero-sub fade-up" style={{transitionDelay:'.16s'}}>
                Real-time messaging, Kanban tasks, and workspace management — designed for studios, agencies, and creative teams.
                <strong> Free for up to 5 members.</strong>
              </p>
              <div className="hero-actions fade-up" style={{transitionDelay:'.22s'}}>
                <button onClick={() => navigate('/login')} className="btn btn-primary" style={{padding:'14px 28px',fontSize:'15px'}}>
                  Start creating free
                </button>
                <button className="btn btn-ghost" style={{padding:'14px 24px',fontSize:'15px'}}>
                  Watch demo →
                </button>
              </div>
              <div className="hero-stats fade-up" style={{transitionDelay:'.3s'}}>
                <div><div className="stat-num">1200+</div><div className="stat-label">Messages daily</div></div>
                <div><div className="stat-num">340+</div><div className="stat-label">Studios onboarded</div></div>
                <div><div className="stat-num">99%</div><div className="stat-label">Uptime</div></div>
              </div>
            </div>
            
            <div className="hero-demo fade-up" style={{transitionDelay:'.4s'}}><DemoWindow /></div>
          </div>
        </div>
      </section>

      {/* The Math Section */}
      <section className="math-section" id="math">
        <div className="container">
          <div className="math-inner">
            <div className="section-label fade-up"><span className="dot"></span> Pricing reality check</div>
            <h2 className="section-h2 fade-up" style={{transitionDelay:'.1s'}}>The math is<br /><span className="gradient-text">brutally simple</span></h2>
            <p className="section-sub fade-up" style={{transitionDelay:'.18s'}}>
              Slide to your team size. See exactly what you'd pay on Slack vs Studios — every month.
            </p>
            
            <div className="math-calculator fade-up" style={{transitionDelay:'.26s'}}>
              <div className="math-slider-row">
                <span className="math-slider-label">Team members</span>
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
                  <div className="mc-price">{currency}{pricing.slackPrice.toLocaleString(isIN ? 'en-IN' : 'en-US')}</div>
                  <div className="mc-note">per month</div>
                </div>
                <div className="math-card">
                  <div className="mc-name">MS Teams</div>
                  <div className="mc-price">{currency}{pricing.teamsPrice.toLocaleString(isIN ? 'en-IN' : 'en-US')}</div>
                  <div className="mc-note">per month</div>
                </div>
                <div className="math-card winner">
                  <div className="mc-name" style={{color:'var(--gold)'}}>Studios ✓</div>
                  <div className="mc-price">{pricing.tcPrice === 0 ? `${currency}0` : `${currency}${pricing.tcPrice.toLocaleString(isIN ? 'en-IN' : 'en-US')}`}</div>
                  <div className="mc-note" style={{color:'var(--gold)'}}>{pricing.planLabel}</div>
                </div>
              </div>
              <div className="math-saving">
                You save <span className="saving-amt">{currency}{pricing.saving.toLocaleString(isIN ? 'en-IN' : 'en-US')}</span> every single month
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
            <h2 className="section-h2 fade-up" style={{transitionDelay:'.1s'}}>Built for <span className="gradient-text">creative workflows</span></h2>
          </div>
          <div className="bento">
            <div className="bento-card wide fade-up">
              <div className="bento-icon"><Zap size={20} /></div>
              <div className="bento-h">Real-time messaging — under 50ms latency</div>
              <div className="bento-p">Messages appear the instant you send them. No polling, no refresh. WebSocket connections keep your whole team in sync with typing indicators, reactions, and threaded replies.</div>
            </div>
            <div className="bento-card fade-up" style={{transitionDelay:'.08s'}}>
              <div className="bento-icon"><Palette size={20} /></div>
              <div className="bento-h">Kanban Task Board</div>
              <div className="bento-p">Drag cards across To Do → In Progress → Done. Set priorities, assign members, and track due dates — all in the same window as your chat.</div>
            </div>
            <div className="bento-card fade-up" style={{transitionDelay:'.12s'}}>
              <div className="bento-icon"><Building2 size={20} /></div>
              <div className="bento-h">Multi-org Isolation</div>
              <div className="bento-p">Each organisation gets a fully isolated workspace. Invite via email link. Role-based access: owner, admin, member. Data never crosses org boundaries.</div>
            </div>
            <div className="bento-card fade-up" style={{transitionDelay:'.16s'}}>
              <div className="bento-icon"><Lock size={20} /></div>
              <div className="bento-h">JWT Auth + Refresh</div>
              <div className="bento-p">Stateless, secure authentication with automatic token rotation. HTTPS enforced. bcrypt passwords. Rate-limited login endpoints.</div>
            </div>
            <div className="bento-card fade-up" style={{transitionDelay:'.2s'}}>
              <div className="bento-icon"><Globe size={20} /></div>
              <div className="bento-h">Fair Pricing Worldwide</div>
              <div className="bento-p">Pay in your local currency via Razorpay / local payments. No forex conversion fees. Plans designed around fair purchasing power worldwide.</div>
            </div>
            <div className="bento-card fade-up" style={{transitionDelay:'.24s'}}>
              <div className="bento-icon"><Music size={20} /></div>
              <div className="bento-h">FastAPI + React Stack</div>
              <div className="bento-p">Async Python backend, PostgreSQL, Redis. React + Redux Toolkit frontend. Open-source friendly. REST API documented at /docs.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="compare-section" id="compare">
        <div className="container">
          <h2 className="section-h2 fade-up" style={{textAlign: 'center', marginBottom: '40px'}}>Why teams are <span className="gradient-text">making the switch</span></h2>
          <div className="compare-table-wrapper fade-up">
            <table className="compare-table">
              <thead>
                <tr>
                  <th style={{textAlign: 'left'}}>FEATURE</th>
                  <th className="tc-col">STUDIOS</th>
                  <th>SLACK</th>
                  <th>MS TEAMS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Free tier</td>
                  <td className="tc-col"><span className="c-check">✓</span> 5 members free</td>
                  <td className="c-warn">Limited</td>
                  <td className="c-warn">Limited</td>
                </tr>
                <tr>
                  <td>₹ pricing (India)</td>
                  <td className="tc-col"><span className="c-check">✓</span> Razorpay</td>
                  <td className="c-x">✗</td>
                  <td className="c-x">✗</td>
                </tr>
                <tr>
                  <td>Real-time WebSocket</td>
                  <td className="tc-col"><span className="c-check">✓</span> &lt;50ms</td>
                  <td className="c-check">✓</td>
                  <td className="c-check">✓</td>
                </tr>
                <tr>
                  <td>Built-in Kanban board</td>
                  <td className="tc-col"><span className="c-check">✓</span> Built-in</td>
                  <td className="c-x">✗ Plugin only</td>
                  <td className="c-warn">Planner add-on</td>
                </tr>
                <tr>
                  <td>Per-seat pricing</td>
                  <td className="tc-col"><span className="c-check">✓</span> Flat rate</td>
                  <td className="c-x">✗ Per seat</td>
                  <td className="c-x">✗ Per seat</td>
                </tr>
                <tr>
                  <td>No Microsoft account needed</td>
                  <td className="tc-col"><span className="c-check">✓</span></td>
                  <td className="c-check">✓</td>
                  <td className="c-x">✗</td>
                </tr>
                <tr>
                  <td>Open REST API</td>
                  <td className="tc-col"><span className="c-check">✓</span> FastAPI docs</td>
                  <td className="c-check">✓</td>
                  <td className="c-warn">Graph API</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section - Boxed Layout */}
      <section className="pricing-v2" id="pricing">
        <div className="container">
          <div className="pricing-boxes fade-up">
            {/* India Pricing Box */}
            <div className="pricing-mega-box">
              <div className="mega-box-hdr">
                <div className="mega-badge">IN</div>
                <div>
                  <h3 className="mega-title">India Pricing (₹)</h3>
                  <p className="mega-sub">Still 90% cheaper than Slack Pro for 25 people</p>
                </div>
              </div>
              <div className="mega-plans">
                <div className="mega-plan">
                  <div className="mp-left">
                    <div className="mp-name">Free</div>
                    <div className="mp-limit">Up to 5 members</div>
                  </div>
                  <div className="mp-right">
                    <div className="mp-price">₹0</div>
                    <div className="mp-period">forever</div>
                  </div>
                </div>
                
                <div className="mega-plan active">
                  <div className="mp-left">
                    <div className="mp-name">Starter <span className="mp-pop">POPULAR</span></div>
                    <div className="mp-limit">Up to 25 members</div>
                  </div>
                  <div className="mp-right">
                    <div className="mp-price">₹1,499</div>
                    <div className="mp-period">/month</div>
                  </div>
                </div>
                
                <div className="mega-plan">
                  <div className="mp-left">
                    <div className="mp-name">Pro</div>
                    <div className="mp-limit">Up to 100 members</div>
                  </div>
                  <div className="mp-right">
                    <div className="mp-price">₹3,999</div>
                    <div className="mp-period">/month</div>
                  </div>
                </div>
                
                <div className="mega-plan">
                  <div className="mp-left">
                    <div className="mp-name">Enterprise</div>
                    <div className="mp-limit">Unlimited members</div>
                  </div>
                  <div className="mp-right">
                    <div className="mp-price">Custom</div>
                    <div className="mp-period">contact us</div>
                  </div>
                </div>
              </div>
            </div>

            {/* International Pricing Box */}
            <div className="pricing-mega-box intl">
              <div className="mega-box-hdr">
                <div className="mega-badge globe">🌍</div>
                <div>
                  <h3 className="mega-title">International Pricing ($)</h3>
                  <p className="mega-sub">Flat rate beats Slack's $7.25/user for any team over 3</p>
                </div>
              </div>
              <div className="mega-plans">
                <div className="mega-plan">
                  <div className="mp-left">
                    <div className="mp-name">Free</div>
                    <div className="mp-limit">Up to 5 members</div>
                  </div>
                  <div className="mp-right">
                    <div className="mp-price">$0</div>
                    <div className="mp-period">forever</div>
                  </div>
                </div>
                
                <div className="mega-plan active">
                  <div className="mp-left">
                    <div className="mp-name">Starter <span className="mp-pop">POPULAR</span></div>
                    <div className="mp-limit">Up to 25 members</div>
                  </div>
                  <div className="mp-right">
                    <div className="mp-price">$19</div>
                    <div className="mp-period">/month</div>
                  </div>
                </div>
                
                <div className="mega-plan">
                  <div className="mp-left">
                    <div className="mp-name">Pro</div>
                    <div className="mp-limit">Up to 100 members</div>
                  </div>
                  <div className="mp-right">
                    <div className="mp-price">$49</div>
                    <div className="mp-period">/month</div>
                  </div>
                </div>
                
                <div className="mega-plan">
                  <div className="mp-left">
                    <div className="mp-name">Enterprise</div>
                    <div className="mp-limit">Unlimited members</div>
                  </div>
                  <div className="mp-right">
                    <div className="mp-price">$99+</div>
                    <div className="mp-period">/month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="quick-start" id="how">
        <div className="container">
          <div className="qs-hdr fade-up">
            <div className="section-label"><span className="dot"></span> QUICK START</div>
            <h2 className="section-h2">Up in <span className="gradient-text">under 2 minutes</span></h2>
            <p className="section-sub">No credit card. No lengthy onboarding. Sign up and your studio is collaborating immediately.</p>
          </div>
          
          <div className="qs-steps fade-up">
            <div className="qs-step">
              <div className="qs-num">1</div>
              <h4 className="qs-h4">Create your studio</h4>
              <p className="qs-p">Sign up with your email, name your workspace. Your private, isolated studio is ready in 30 seconds — no setup wizard needed.</p>
            </div>
            
            <div className="qs-step">
              <div className="qs-num">2</div>
              <h4 className="qs-h4">Invite your team</h4>
              <p className="qs-p">Share a one-click invite link or send email invitations. Team members join instantly — no account creation friction.</p>
            </div>
            
            <div className="qs-step">
              <div className="qs-num">3</div>
              <h4 className="qs-h4">Start creating</h4>
              <p className="qs-p">Create channels, send real-time messages, assign Kanban tasks. Every change is live for your whole team the instant it happens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box fade-up">
            <h2 className="cta-h">Stop paying per-seat<br /><span className="gradient-text">software invoices every month</span></h2>
            <p className="cta-sub">Your first 5 team members are free. Always. Switch takes 2 minutes.</p>
            <div className="cta-actions">
              <button onClick={() => navigate('/login')} className="btn btn-primary" style={{padding:'16px 36px',fontSize:'16px'}}>
                🚀 Create your studio — it's free
              </button>
            </div>
            <div className="cta-note">No credit card · Free forever for small teams · Built for creative teams worldwide</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="logo-mark" style={{width:'26px',height:'26px',fontSize:'10px'}}>S</div>
              Studios
            </div>
            <div className="footer-links">
              <a href="#" className="fl">Privacy</a>
              <a href="#" className="fl">Terms</a>
              <a href="#" className="fl">Status</a>
              <a href="https://github.com" className="fl">GitHub</a>
            </div>
            <div className="footer-copy">© 2025 Studios · Made for creative teams</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const DemoWindow = () => {
  const [demoStep, setDemoStep] = useState(0);
  const [demoOpacity, setDemoOpacity] = useState(1);
  const [activeChannel, setActiveChannel] = useState('general');
  const [unreadDesign, setUnreadDesign] = useState(true);
  const [isTyping, setIsTyping] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    
    const runSequence = async () => {
      if (!isMounted) return;
      
      setDemoStep(0);
      setUnreadDesign(false);
      setActiveChannel('design');
      await new Promise(r => setTimeout(r, 600));
      if (!isMounted) return;
      setActiveChannel('general');
      setUnreadDesign(true);
      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;

      const step = async (s, typeUser, typeMs) => {
        setIsTyping(typeUser);
        await new Promise(r => setTimeout(r, typeMs));
        if (!isMounted) return;
        setIsTyping(null);
        setDemoStep(s);
        await new Promise(r => setTimeout(r, 600));
      }

      await step(1, { name: 'Alice', color: '#e8912e' }, 1000);
      if (!isMounted) return;
      
      setDemoStep(2);
      await new Promise(r => setTimeout(r, 800));
      if (!isMounted) return;

      await step(3, { name: 'Yash', color: '#7C3AED' }, 1200);
      if (!isMounted) return;

      setDemoStep(4);
      await new Promise(r => setTimeout(r, 1200));
      if (!isMounted) return;

      await step(5, { name: 'Bob', color: '#EC4899' }, 1000);
      if (!isMounted) return;

      setDemoStep(6);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      await step(7, { name: 'Carol', color: '#10B981' }, 1000);
      if (!isMounted) return;

      await step(8, { name: 'Alice', color: '#e8912e' }, 1200);
      if (!isMounted) return;

      await new Promise(r => setTimeout(r, 4000));
      if (!isMounted) return;

      setDemoOpacity(0);
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;
      setDemoStep(0);
      setDemoOpacity(1);
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;
      
      runSequence();
    };

    timeoutId = setTimeout(runSequence, 1100);

    const handleVis = () => {
      if (document.hidden) {
        setDemoStep(0);
        setDemoOpacity(1);
      }
    };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, []);

  const carolOnline = demoStep >= 6;
  const taskInDone = demoStep >= 5;
  const taskExists = demoStep >= 4;

  return (
    <div className="demo-window" style={{ opacity: demoOpacity, transition: 'opacity 0.5s' }}>
      <div className="demo-header">
        <div className="mac-dots"><span></span><span></span><span></span></div>
        <div className="demo-title"># general</div>
      </div>
      <div className="demo-body">
        <div className="demo-sb">
          <div className="ds-section">Channels</div>
          <div className={`ds-item ${activeChannel === 'general' ? 'active' : ''}`}># general</div>
          <div className={`ds-item ${activeChannel === 'design' ? 'active' : ''}`}>
            # design {unreadDesign && <span className="ds-badge">2</span>}
          </div>
          <div className="ds-section mt-4">Direct Messages</div>
          <div className="ds-item"><span className="status-dot green"></span> Alice</div>
          <div className="ds-item"><span className="status-dot amber"></span> Bob</div>
          <div className="ds-item"><span className={`status-dot ${carolOnline ? 'green' : 'grey'}`}></span> Carol</div>
        </div>

        <div className="demo-main">
          <div className="demo-feed">
            {demoStep >= 1 && (
              <div className="demo-msg slide-in">
                <div className="dm-av" style={{ background: '#e8912e' }}>A</div>
                <div className="dm-content">
                  <div className="dm-name">Alice</div>
                  <div className="dm-text">Morning team! Dashboard v2 is live on staging -- please test!</div>
                  {demoStep >= 2 && (
                    <div className="dm-reactions pop-in">
                      <span className="dm-react">+1 x 3</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {demoStep >= 3 && (
              <div className="demo-msg slide-in">
                <div className="dm-av" style={{ background: '#7C3AED' }}>Y</div>
                <div className="dm-content">
                  <div className="dm-name">Yash</div>
                  <div className="dm-text">Tested the auth flow -- looks clean! Found one edge case:</div>
                  <div className="dm-code">POST /api/login -- 307 redirect on trailing slash</div>
                </div>
              </div>
            )}

            {demoStep >= 4 && (
              <div className="demo-task-notif slide-in-right">
                <div className="dtn-icon">Task</div>
                <div className="dtn-text">Task created: Fix trailing slash redirect | Assigned to Yash | Due today</div>
              </div>
            )}

            {demoStep >= 5 && (
              <div className="demo-msg slide-in">
                <div className="dm-av" style={{ background: '#EC4899' }}>B</div>
                <div className="dm-content">
                  <div className="dm-name">Bob</div>
                  <div className="dm-text">On it! Pushed the fix -- restarting uvicorn now.</div>
                </div>
              </div>
            )}

            {demoStep >= 6 && (
              <div className="demo-sys-msg fade-in">
                Carol Singh joined the studio
              </div>
            )}

            {demoStep >= 7 && (
              <div className="demo-msg slide-in">
                <div className="dm-av" style={{ background: '#10B981' }}>C</div>
                <div className="dm-content">
                  <div className="dm-name">Carol</div>
                  <div className="dm-text">Hey team! Just joined -- what are we shipping?</div>
                </div>
              </div>
            )}

            {demoStep >= 8 && (
              <div className="demo-msg slide-in">
                <div className="dm-av" style={{ background: '#e8912e' }}>A</div>
                <div className="dm-content">
                  <div className="dm-name">Alice</div>
                  <div className="dm-text">Welcome Carol! We are fixing a backend bug and shipping dashboard v2 today</div>
                  <div className="dm-reactions pop-in">
                    <span className="dm-react">Party x 2</span>
                    <span className="dm-react">Rocket x 1</span>
                  </div>
                </div>
              </div>
            )}

            {isTyping && (
              <div className="demo-typing-row fade-in-up">
                <div className="dm-av small" style={{ background: isTyping.color }}>{isTyping.name[0]}</div>
                <div className="typing-dots-anim"><span></span><span></span><span></span></div>
                <div className="typing-text">{isTyping.name} is typing a message...</div>
              </div>
            )}
          </div>
        </div>

        <div className="demo-kanban">
          <div className="dk-col">
            <div className="dk-hdr">To Do</div>
            {taskExists && !taskInDone && (
              <div className="dk-card slide-in-down priority-high">Fix trailing slash</div>
            )}
            <div className="dk-card priority-med">Update Readme</div>
            <div className="dk-card priority-low">Design logo</div>
          </div>
          <div className="dk-col">
            <div className="dk-hdr">Done</div>
            {taskInDone && (
              <div className="dk-card slide-in-left priority-high">Fix trailing slash</div>
            )}
            <div className="dk-card priority-low">Setup repo</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
