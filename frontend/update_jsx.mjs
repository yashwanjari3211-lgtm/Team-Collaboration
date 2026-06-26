import fs from 'fs';

const jsxPath = 'c:/Users/Yash/Desktop/Team collaboration/frontend/src/pages/LandingPage.jsx';
let content = fs.readFileSync(jsxPath, 'utf8');

// Replace Pricing Section
const pricingStart = content.indexOf('{/* Pricing Section */}');
const ctaStart = content.indexOf('{/* CTA Section */}');

if (pricingStart !== -1 && ctaStart !== -1) {
  const newSections = `
      {/* Comparison Table */}
      <section className="compare-section" id="compare">
        <div className="container">
          <h2 className="section-h2 fade-up" style={{textAlign: 'center', marginBottom: '40px'}}>Why teams are <span className="gradient-text">making the switch</span></h2>
          <div className="compare-table-wrapper fade-up">
            <table className="compare-table">
              <thead>
                <tr>
                  <th style={{textAlign: 'left'}}>FEATURE</th>
                  <th className="tc-col">TEAMCOLLAB</th>
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
                  <td className="c-x">X</td>
                  <td className="c-x">X</td>
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
                  <td className="c-x">X Plugin only</td>
                  <td className="c-warn">Planner add-on</td>
                </tr>
                <tr>
                  <td>Per-seat pricing</td>
                  <td className="tc-col"><span className="c-check">✓</span> Flat rate</td>
                  <td className="c-x">X Per seat</td>
                  <td className="c-x">X Per seat</td>
                </tr>
                <tr>
                  <td>No Microsoft account needed</td>
                  <td className="tc-col"><span className="c-check">✓</span></td>
                  <td className="c-check">✓</td>
                  <td className="c-x">X</td>
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
            <p className="section-sub">No credit card. No lengthy onboarding. Sign up and your team is collaborating immediately.</p>
          </div>
          
          <div className="qs-steps fade-up">
            <div className="qs-step">
              <div className="qs-num">1</div>
              <h4 className="qs-h4">Create your workspace</h4>
              <p className="qs-p">Sign up with your email, name your organisation. Your private, isolated workspace is ready in 30 seconds — no setup wizard, no IT department needed.</p>
            </div>
            
            <div className="qs-step">
              <div className="qs-num">2</div>
              <h4 className="qs-h4">Invite your team</h4>
              <p className="qs-p">Share a one-click invite link or send email invitations. Team members join with one click — no account creation friction, no approval queues.</p>
            </div>
            
            <div className="qs-step">
              <div className="qs-num">3</div>
              <h4 className="qs-h4">Start collaborating</h4>
              <p className="qs-p">Create channels, send real-time messages, assign Kanban tasks. Every change is live for your whole team the instant it happens.</p>
            </div>
          </div>
        </div>
      </section>

`;

  content = content.substring(0, pricingStart) + newSections + content.substring(ctaStart);
  fs.writeFileSync(jsxPath, content);
  console.log("Updated LandingPage.jsx successfully.");
} else {
  console.log("Could not find insertion points.");
}
