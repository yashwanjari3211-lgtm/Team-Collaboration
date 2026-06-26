import fs from 'fs';

const jsxPath = 'c:/Users/Yash/Desktop/Team collaboration/frontend/src/pages/LandingPage.jsx';
let jsxContent = fs.readFileSync(jsxPath, 'utf8');

// Find the hero-demo div and replace it with <DemoWindow />
const demoRegex = /<div className="hero-demo[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
jsxContent = jsxContent.replace(demoRegex, '<div className="hero-demo fade-up" style={{transitionDelay:\'.4s\'}}><DemoWindow /></div>');

// Inject the DemoWindow component definition right before `export default LandingPage`
const componentCode = `
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

      await step(1, { name: 'Alice', color: '#6366F1' }, 1000);
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

      await step(8, { name: 'Alice', color: '#6366F1' }, 1200);
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
          <div className={\`ds-item \${activeChannel === 'general' ? 'active' : ''}\`}># general</div>
          <div className={\`ds-item \${activeChannel === 'design' ? 'active' : ''}\`}>
            # design {unreadDesign && <span className="ds-badge">2</span>}
          </div>
          <div className="ds-section mt-4">Direct Messages</div>
          <div className="ds-item"><span className="status-dot green"></span> Alice</div>
          <div className="ds-item"><span className="status-dot amber"></span> Bob</div>
          <div className="ds-item"><span className={\`status-dot \${carolOnline ? 'green' : 'grey'}\`}></span> Carol</div>
        </div>

        <div className="demo-main">
          <div className="demo-feed">
            {demoStep >= 1 && (
              <div className="demo-msg slide-in">
                <div className="dm-av" style={{ background: '#6366F1' }}>A</div>
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
                Carol Singh joined the workspace
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
                <div className="dm-av" style={{ background: '#6366F1' }}>A</div>
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
`;

jsxContent = jsxContent.replace('export default LandingPage', componentCode);
fs.writeFileSync(jsxPath, jsxContent);
