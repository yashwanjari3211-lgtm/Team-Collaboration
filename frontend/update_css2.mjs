import fs from 'fs';

const cssPath = 'c:/Users/Yash/Desktop/Team collaboration/frontend/src/pages/LandingPage.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

const newCss = `
/* ============================================================
   COMPARISON TABLE
   ============================================================ */
.compare-section {
  padding: 96px 0;
  background: var(--bg);
}
.compare-table-wrapper {
  max-width: 900px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}
.compare-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 14px;
}
.compare-table th {
  padding: 24px;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 1px solid var(--border);
}
.compare-table td {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  color: var(--text2);
}
.compare-table tr:last-child td {
  border-bottom: none;
}
.compare-table td:first-child {
  text-align: left;
  font-weight: 600;
  color: var(--text);
}
.tc-col {
  background: rgba(124, 58, 237, 0.04);
  color: #fff !important;
  font-weight: 600;
}
.compare-table th.tc-col {
  color: var(--accent2) !important;
}
.c-check {
  color: var(--green);
  font-weight: 800;
  margin-right: 6px;
}
.c-x {
  color: var(--faint);
  font-weight: 800;
}
.c-warn {
  color: var(--amber);
  font-weight: 600;
}

/* ============================================================
   PRICING V2
   ============================================================ */
.pricing-v2 {
  padding: 96px 0;
  background: var(--bg);
}
.pricing-boxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;
}
@media (max-width: 768px) {
  .pricing-boxes {
    grid-template-columns: 1fr;
  }
}
.pricing-mega-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
}
.pricing-mega-box.intl {
  background: rgba(59, 130, 246, 0.03);
  border-color: rgba(59, 130, 246, 0.2);
}
.mega-box-hdr {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}
.mega-badge {
  font-size: 16px;
  font-weight: 800;
  background: var(--text);
  color: var(--bg);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}
.mega-badge.globe {
  background: #3B82F6;
  color: #fff;
  font-size: 20px;
}
.mega-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
}
.mega-sub {
  font-size: 12px;
  color: var(--muted);
}
.mega-plans {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mega-plan {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  transition: all 0.2s;
}
.mega-plan:hover {
  border-color: var(--border2);
}
.mega-plan.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}
.mp-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mp-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
}
.mp-limit {
  font-size: 12px;
  color: var(--muted);
}
.mp-pop {
  font-size: 9px;
  font-weight: 800;
  background: rgba(124, 58, 237, 0.2);
  color: var(--accent2);
  padding: 2px 8px;
  border-radius: 10px;
  letter-spacing: 0.05em;
}
.mp-right {
  text-align: right;
  display: flex;
  flex-direction: column;
}
.mp-price {
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
  margin-bottom: 4px;
}
.mp-period {
  font-size: 11px;
  color: var(--muted);
}

/* ============================================================
   QUICK START
   ============================================================ */
.quick-start {
  padding: 96px 0;
  background: var(--bg);
  text-align: center;
}
.qs-hdr {
  margin-bottom: 64px;
}
.qs-steps {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 40px;
  position: relative;
}
@media (max-width: 768px) {
  .qs-steps {
    flex-direction: column;
    align-items: center;
    gap: 60px;
  }
}
.qs-steps::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border2) 20%, var(--border2) 80%, transparent);
  z-index: 0;
}
@media (max-width: 768px) {
  .qs-steps::before { display: none; }
}
.qs-step {
  flex: 1;
  max-width: 280px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qs-num {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: var(--accent2);
  margin-bottom: 24px;
  box-shadow: 0 0 0 8px var(--bg);
}
.qs-step:nth-child(2) .qs-num {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  box-shadow: 0 0 24px var(--glow), 0 0 0 8px var(--bg);
}
.qs-h4 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}
.qs-p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
}
`;

cssContent += newCss;
fs.writeFileSync(cssPath, cssContent);
console.log("Appended new CSS styles successfully.");
