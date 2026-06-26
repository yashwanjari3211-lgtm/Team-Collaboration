import fs from 'fs';

const cssPath = 'c:/Users/Yash/Desktop/Team collaboration/frontend/src/pages/LandingPage.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Find the old Demo Animation block I added
const oldDemoBlockStart = '/* Hero Demo Animation */';
const startIndex = cssContent.indexOf(oldDemoBlockStart);

if (startIndex !== -1) {
  // Replace from start index to the end or up to '/* Hero left */'
  const endIndex = cssContent.indexOf('/* Hero left */', startIndex);
  if (endIndex !== -1) {
    cssContent = cssContent.substring(0, startIndex) + cssContent.substring(endIndex);
  } else {
    cssContent = cssContent.substring(0, startIndex);
  }
}

const newCss = `
/* DEMO UPGRADE STYLES */
.demo-window {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
  transform: rotateY(-8deg) rotateX(4deg) scale(0.95);
  transform-origin: center right;
  transition: transform 0.5s ease;
  width: 100%;
}
.demo-window:hover {
  transform: rotateY(0deg) rotateX(0deg) scale(1);
}
.demo-header {
  height: 40px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
}
.mac-dots { display: flex; gap: 6px; }
.mac-dots span { width: 10px; height: 10px; border-radius: 50%; background: #ED6A5E; }
.mac-dots span:nth-child(2) { background: #F4BF4F; }
.mac-dots span:nth-child(3) { background: #61C554; }
.demo-title { font-size: 11px; font-weight: 600; color: var(--muted); flex-grow: 1; text-align: center; margin-right: 44px; }
.demo-body { display: flex; height: 360px; overflow: hidden; }

/* SIDEBAR */
.demo-sb {
  width: 130px;
  border-right: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.01);
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}
.ds-section {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--faint);
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: 0.05em;
  padding-left: 6px;
}
.mt-4 { margin-top: 16px; }
.ds-item {
  font-size: 11px;
  color: var(--text2);
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.ds-item.active {
  background: rgba(124, 58, 237, 0.25);
  color: #fff;
  font-weight: 500;
}
.ds-badge {
  background: #EF4444;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 10px;
  margin-left: auto;
  animation: pop-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: background 0.5s ease;
}
.status-dot.green { background: #10B981; }
.status-dot.amber { background: #F59E0B; }
.status-dot.grey { background: var(--faint); }

/* MAIN FEED */
.demo-main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  position: relative;
}
.demo-feed {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-grow: 1;
  overflow: hidden;
}

/* MESSAGES */
.demo-msg {
  display: flex;
  gap: 10px;
}
.dm-av {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.dm-av.small {
  width: 18px;
  height: 18px;
  font-size: 9px;
  border-radius: 4px;
}
.dm-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dm-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text);
  line-height: 1;
}
.dm-text {
  font-size: 12px;
  color: var(--text2);
  line-height: 1.4;
}
.dm-code {
  font-family: monospace;
  font-size: 10px;
  background: var(--bg2);
  border: 1px solid var(--border);
  padding: 6px 8px;
  border-radius: 4px;
  color: var(--accent2);
  width: fit-content;
  margin-top: 4px;
}

/* TASK NOTIF */
.demo-task-notif {
  background: rgba(124, 58, 237, 0.1);
  border-left: 3px solid #7C3AED;
  padding: 10px 12px;
  border-radius: 0 6px 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 36px;
}
.dtn-icon {
  font-size: 9px;
  font-weight: 700;
  background: #7C3AED;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}
.dtn-text {
  font-size: 11px;
  color: var(--text);
}

/* SYSTEM MSG */
.demo-sys-msg {
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  position: relative;
  margin: 8px 0;
}
.demo-sys-msg::before, .demo-sys-msg::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 100px);
  height: 1px;
  background: var(--border);
}
.demo-sys-msg::before { left: 0; }
.demo-sys-msg::after { right: 0; }

/* REACTIONS */
.dm-reactions {
  display: flex;
  gap: 6px;
  margin-top: 2px;
}
.dm-react {
  font-size: 10px;
  background: var(--surface2);
  border: 1px solid var(--border);
  padding: 2px 6px;
  border-radius: 10px;
  color: var(--text2);
  font-weight: 500;
}

/* TYPING */
.demo-typing-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  transform: translateY(-2px);
}
.typing-dots-anim {
  display: flex;
  gap: 3px;
  background: var(--surface2);
  padding: 5px 8px;
  border-radius: 10px;
  border-bottom-left-radius: 2px;
}
.typing-dots-anim span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--muted);
  animation: typing-bounce 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}
.typing-dots-anim span:nth-child(2) { animation-delay: 0.15s; }
.typing-dots-anim span:nth-child(3) { animation-delay: 0.3s; }
.typing-text {
  font-size: 10px;
  color: var(--muted);
}

/* KANBAN MINIBOARD */
.demo-kanban {
  width: 120px;
  border-left: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.01);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 10px;
  gap: 12px;
}
.dk-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.dk-hdr {
  font-size: 10px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  margin-bottom: 2px;
}
.dk-card {
  font-size: 10px;
  background: var(--surface2);
  border: 1px solid var(--border);
  padding: 5px 8px;
  border-radius: 6px;
  color: var(--text2);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  line-height: 1.2;
}
.dk-card.priority-high { border-left: 3px solid #EF4444; }
.dk-card.priority-med { border-left: 3px solid #F59E0B; }
.dk-card.priority-low { border-left: 3px solid #10B981; }

/* ANIMATIONS */
.slide-in { animation: slide-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
.slide-in-right { animation: slide-in-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
.slide-in-down { animation: slide-in-down 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
.slide-in-left { animation: slide-in-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
.fade-in { animation: fade-in 0.4s ease both; }
.fade-in-up { animation: fade-in-up 0.3s ease both; }
.pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }

@keyframes slide-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slide-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(-2px); }
}
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes typing-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
`;

cssContent += newCss;
fs.writeFileSync(cssPath, cssContent);
