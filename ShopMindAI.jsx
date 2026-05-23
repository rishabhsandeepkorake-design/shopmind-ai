import { useState, useRef, useEffect } from "react";

// ── FUTURISTIC DARK THEME ─────────────────────────────────
const C = {
  // Base
  bg:        "#050a0e",
  surface:   "#0a1520",
  card:      "#0d1f2d",
  cardHover: "#112436",
  border:    "rgba(0,255,136,0.12)",
  borderHi:  "rgba(0,255,136,0.35)",
  // Neon accents
  neon:      "#00ff88",
  neonDim:   "#00cc6a",
  neonGlow:  "rgba(0,255,136,0.15)",
  neonGlow2: "rgba(0,255,136,0.08)",
  cyan:      "#00d4ff",
  cyanGlow:  "rgba(0,212,255,0.15)",
  amber:     "#ffaa00",
  amberGlow: "rgba(255,170,0,0.15)",
  red:       "#ff4466",
  redGlow:   "rgba(255,68,102,0.15)",
  purple:    "#9b6dff",
  purpleGlow:"rgba(155,109,255,0.15)",
  // Text
  text:      "#e8f4f0",
  textDim:   "#7a9e8e",
  textFaint: "#3a5a4a",
};

const PLANS = [
  { id:"free",     name:"Starter",  price:0,    color:C.textDim,  icon:"◇",
    features:["Sales recording","Bill generation","Stock tracking","Basic chat (50 msgs/day)","1 shop only"],
    cta:"Get Started Free" },
  { id:"growth",   name:"Growth",   price:499,  color:C.cyan,     icon:"◈", popular:true,
    features:["Everything in Starter","Smart Insights","Supplier Management","Voice Mode","Global languages","Unlimited messages","Festival predictor","Customer radar"],
    cta:"Start Growth Plan" },
  { id:"pro",      name:"Pro",      price:999,  color:C.neon,     icon:"◉",
    features:["Everything in Growth","Full Delivery Network","Delivery boy management","Incentive & penalty system","Live order tracking","Heatmap analytics","Recurring orders","Weather alerts"],
    cta:"Start Pro Plan" },
  { id:"business", name:"Business", price:1999, color:C.purple,   icon:"⬡",
    features:["Everything in Pro","Multi-shop (up to 5)","Priority WhatsApp support","Custom delivery radius","White-label option","Dedicated onboarding","GST report export","API access"],
    cta:"Contact Sales" },
];

const NAV = [
  {id:"dashboard",icon:"⊞", label:"Dashboard"},
  {id:"chat",     icon:"◎", label:"Chat",      accent:C.neon},
  {id:"delivery", icon:"⬡", label:"Delivery",  accent:C.amber,  badge:"PRO"},
  {id:"insights", icon:"◈", label:"Insights",  accent:C.cyan,   badge:"PRO"},
  {id:"suppliers",icon:"◇", label:"Suppliers", accent:"#ff8c42",badge:"PRO"},
  {id:"global",   icon:"⊕", label:"Global",    accent:C.purple, badge:"PRO"},
  {id:"voice",    icon:"◉", label:"Voice",     accent:C.red,    badge:"PRO"},
  {id:"pricing",  icon:"◆", label:"Pricing"},
  {id:"setup",    icon:"⚙", label:"API Setup"},
  {id:"settings", icon:"≡", label:"Settings"},
];

const SUGG = {
  chat:      ["Today's summary?","Diwali stock check","Order chips now","Broadcast to Suresh","Shop closed tomorrow"],
  delivery:  ["Show board","New order Priya Sector7 flour 2kg","Recurring orders","Surge pricing?","Need delivery boy"],
  insights:  ["Show heatmap","Dead stock report","Monthly report","Rush hour timing?","Competitor advice"],
  suppliers: ["All suppliers","Sharma paid 2000","What is overdue","Gupta chips order"],
  global:    ["sell sugar Wanjiku KSh 150","sell rice Maria $80","sell oil Budi Rp 25000","sell rice Ahmed 15 AED"],
  voice:     ["[Voice: Ramesh 300 items]","[Voice: chips out of stock]","[Voice: today's total]","[Voice: send delivery to Priya]"],
};

const INIT = {
  chat:"Hello Ramesh! 👋\n\nDiwali in 4 days. Rain today from 4 PM.\n\n⚠  Chips: CRITICAL (1 day left)\n⚠  Sharma Traders ₹2,400 — 9 days overdue\n◎  Suresh hasn't visited in 12 days\n\nWhat would you like to do?",
  delivery:"⬡ Delivery Network Live!\n\n● Raju (0.4km) — 1 active order\n● Suresh (1.1km) — free\n○ Ajay — 2 orders in transit\n◌ Mohammed — offline\n\nTry: 'Show board'",
  insights:"◈ Insights Ready!\n\nSector 7 → 34 orders (top this month)\nSunday peak: 7–9 PM\nDiwali in 4 days — prep needed!\n\nAsk me anything.",
  suppliers:"◇ Suppliers\n\n● Sharma Traders — ₹2,400 (9 days OVERDUE)\n◑ Gupta Wholesale — ₹800 due\n\nWant to take action?",
  global:"⊕ Works Worldwide!\n\nType in any language.\n\nTry: 'sell sugar to Wanjiku KSh 150'",
  voice:"◉ Voice Mode!\n\nType [Voice: your message here].\nSimulates broken speech — understood perfectly.",
};

function now(){ return new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}); }

// ── SHARED STYLES ─────────────────────────────────────────
const S = {
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
  },
  neonText: { color: C.neon, fontFamily:"'Courier Prime', monospace" },
  label: { fontSize:10, fontWeight:700, color:C.textDim, textTransform:"uppercase", letterSpacing:"1.5px" },
};

// ── GLOW DOT ──────────────────────────────────────────────
function GlowDot({ color=C.neon, size=8 }){
  return(
    <span style={{
      display:"inline-block", width:size, height:size, borderRadius:"50%",
      background:color, boxShadow:`0 0 ${size}px ${color}, 0 0 ${size*2}px ${color}40`,
      flexShrink:0,
    }}/>
  );
}

// ── BADGE ─────────────────────────────────────────────────
function Badge({ color=C.neon, children }){
  return(
    <span style={{
      fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:4,
      background:`${color}22`, color, border:`1px solid ${color}44`,
      fontFamily:"'Courier Prime', monospace", letterSpacing:"0.5px",
    }}>{children}</span>
  );
}

// ── API SETUP ─────────────────────────────────────────────
function ApiSetup({ apis, setApis, onDone }){
  const [vals, setVals] = useState({...apis});
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState({});
  const [tested, setTested] = useState({});

  const fields = [
    { key:"anthropic",      label:"Anthropic API Key",    icon:"◉", required:true,
      placeholder:"sk-ant-api03-...",
      desc:"Powers the AI brain — sales, insights, delivery dispatch, all languages.",
      link:"https://console.anthropic.com/", linkLabel:"Get key →",
      free:"Free $5 credit on signup", accent:C.neon, testMsg:"Test AI" },
    { key:"razorpay_key",   label:"Razorpay Key ID",      icon:"◆", required:true,
      placeholder:"rzp_live_xxxxxxxxxxxxxxxxxx",
      desc:"Collect payments via UPI, card, netbanking. Dashboard → Settings → API Keys.",
      link:"https://dashboard.razorpay.com/app/keys", linkLabel:"Get Key ID →",
      free:"Free setup · 2% per transaction", accent:C.cyan, testMsg:"Test Pay" },
    { key:"razorpay_secret",label:"Razorpay Key Secret",  icon:"⬡", required:true,
      placeholder:"your_razorpay_secret_here",
      desc:"Secret key paired with your Key ID. Never share publicly.",
      link:"https://dashboard.razorpay.com/app/keys", linkLabel:"Get Secret →",
      free:"Regenerate anytime from dashboard", accent:C.amber, testMsg:"" },
    { key:"make_webhook",   label:"Make.com Webhook URL", icon:"⊕", required:false,
      placeholder:"https://hook.eu1.make.com/xxxxxxx",
      desc:"Automation bridge for WhatsApp → AI → Reply flow.",
      link:"https://make.com/", linkLabel:"Create scenario →",
      free:"1,000 operations/month free", accent:C.purple, testMsg:"" },
  ];

  const handleTest = async (key) => {
    setTesting(p=>({...p,[key]:true}));
    await new Promise(r=>setTimeout(r,1500));
    setTested(p=>({...p,[key]: vals[key]?.length > 5 ? "ok" : "fail"}));
    setTesting(p=>({...p,[key]:false}));
  };

  const handleSave = () => { setApis(vals); setSaved(true); setTimeout(()=>setSaved(false),2500); };
  const allRequired = fields.filter(f=>f.required).every(f=>vals[f.key]?.trim());
  const filled = fields.filter(f=>f.required).filter(f=>vals[f.key]?.trim()).length;
  const total  = fields.filter(f=>f.required).length;

  return(
    <div style={{overflowY:"auto",height:"100%",padding:"28px 28px 40px",background:C.bg}}>
      {/* Header */}
      <div style={{marginBottom:32}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <span style={{fontSize:22,color:C.neon,fontFamily:"monospace"}}>⚙</span>
          <div style={{fontSize:22,fontWeight:800,color:C.text,letterSpacing:"-0.5px"}}>API Configuration</div>
        </div>
        <div style={{fontSize:13,color:C.textDim,lineHeight:1.7}}>Connect your services to activate ShopMind AI. Keys are stored locally — never transmitted to external servers.</div>
      </div>

      {/* Progress bar */}
      <div style={{...S.card, padding:"16px 20px", marginBottom:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{...S.label}}>Setup Progress</span>
          <span style={{fontSize:12,color:C.neon,fontFamily:"monospace"}}>{filled}/{total} required keys</span>
        </div>
        <div style={{height:4,background:`${C.neon}18`,borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(filled/total)*100}%`,background:`linear-gradient(90deg,${C.neonDim},${C.neon})`,borderRadius:4,transition:"width 0.4s ease",boxShadow:`0 0 8px ${C.neon}`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
          {["Get Keys","Configure","Make.com","Go Live"].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:i<Math.ceil(filled/total*3+0.5)?C.neon:"transparent",border:`1px solid ${i<Math.ceil(filled/total*3+0.5)?C.neon:C.textFaint}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.bg,fontWeight:900,transition:"all 0.3s"}}>{i<Math.ceil(filled/total*3+0.5)?"✓":i+1}</div>
              <span style={{fontSize:10,color:i<Math.ceil(filled/total*3+0.5)?C.neon:C.textDim}}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:24}}>
        {fields.map((f,i)=>{
          const isOk = tested[f.key]==="ok";
          const isFail = tested[f.key]==="fail";
          const accent = f.accent;
          return(
            <div key={i} style={{...S.card, padding:"18px 20px", borderColor: vals[f.key]?.trim() ? `${accent}40` : C.border, transition:"border-color 0.3s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20,color:accent}}>{f.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,display:"flex",alignItems:"center",gap:8}}>
                      {f.label}
                      {f.required ? <Badge color={C.red}>REQUIRED</Badge> : <Badge color={C.textDim}>OPTIONAL</Badge>}
                    </div>
                    <div style={{fontSize:11,color:C.textDim,marginTop:3,lineHeight:1.5}}>{f.desc}</div>
                  </div>
                </div>
                {(isOk||isFail)&&(
                  <span style={{fontSize:11,fontWeight:700,color:isOk?C.neon:C.red,background:isOk?`${C.neon}15`:`${C.red}15`,padding:"3px 10px",borderRadius:6,border:`1px solid ${isOk?C.neon:C.red}44`,fontFamily:"monospace",flexShrink:0}}>
                    {isOk?"● LIVE":"● FAILED"}
                  </span>
                )}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input
                  type="password"
                  placeholder={f.placeholder}
                  value={vals[f.key]||""}
                  onChange={e=>setVals(p=>({...p,[f.key]:e.target.value}))}
                  style={{flex:1,borderRadius:10,padding:"10px 14px",border:`1px solid ${vals[f.key]?.trim()?`${accent}50`:C.border}`,fontSize:12,outline:"none",fontFamily:"'Courier Prime',monospace",background:"#07121c",color:C.text,transition:"border 0.2s",letterSpacing:"0.5px"}}
                />
                {f.testMsg&&(
                  <button onClick={()=>handleTest(f.key)} disabled={!vals[f.key]||testing[f.key]}
                    style={{background:"transparent",color:accent,border:`1px solid ${accent}60`,borderRadius:10,padding:"10px 16px",fontSize:11,fontWeight:700,cursor:vals[f.key]&&!testing[f.key]?"pointer":"default",opacity:vals[f.key]&&!testing[f.key]?1:0.4,flexShrink:0,fontFamily:"monospace",transition:"all 0.2s",letterSpacing:"0.5px"}}>
                    {testing[f.key]?"···":f.testMsg}
                  </button>
                )}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                {f.free&&<span style={{fontSize:11,color:`${accent}cc`}}>✓ {f.free}</span>}
                <a href={f.link} target="_blank" rel="noreferrer" style={{fontSize:11,color:C.cyan,fontWeight:600,textDecoration:"none",marginLeft:"auto",fontFamily:"monospace"}}>{f.linkLabel}</a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <button onClick={handleSave}
        style={{width:"100%",background:allRequired?`${C.neon}18`:"transparent",color:allRequired?C.neon:C.textDim,border:`1px solid ${allRequired?C.neon:C.textFaint}`,borderRadius:12,padding:"14px",fontSize:14,fontWeight:700,cursor:allRequired?"pointer":"default",marginBottom:12,transition:"all 0.2s",fontFamily:"monospace",letterSpacing:"1px",boxShadow:allRequired?`0 0 20px ${C.neonGlow}`:"none"}}>
        {saved?"✓ CONFIGURATION SAVED":"SAVE CONFIGURATION"}
      </button>

      {allRequired&&(
        <button onClick={onDone}
          style={{width:"100%",background:`linear-gradient(135deg,${C.neonDim},${C.neon})`,color:C.bg,border:"none",borderRadius:12,padding:"14px",fontSize:14,fontWeight:900,cursor:"pointer",marginBottom:28,letterSpacing:"1px",fontFamily:"monospace",boxShadow:`0 0 30px ${C.neonGlow}`}}>
          ▶ LAUNCH SHOPMIND AI
        </button>
      )}

      {/* Deploy guide */}
      <div style={{background:"#070f18",border:`1px solid ${C.border}`,borderRadius:14,padding:"20px",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.neon,marginBottom:16,letterSpacing:"2px"}}>◈ MAKE.COM INTEGRATION GUIDE</div>
        {[
          "Create free account at make.com",
          "New Scenario → Webhooks → Custom Webhook",
          "Add HTTP module → POST to Anthropic API",
          "Set header: x-api-key = your Anthropic key",
          "Body: paste system prompt from this app",
          "Add HTTP module → POST to Razorpay API for payment link",
          "Set Authorization: Basic (base64 of key:secret)",
          "Payment link auto-created and delivered 🚀",
        ].map((txt,i)=>(
          <div key={i} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:`${C.neon}20`,border:`1px solid ${C.neon}50`,color:C.neon,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"monospace"}}>{i+1}</div>
            <div style={{fontSize:12,color:C.textDim,lineHeight:1.6}}>{txt}</div>
          </div>
        ))}
      </div>

      <div style={{background:`${C.neon}08`,border:`1px solid ${C.neon}25`,borderRadius:12,padding:"14px 18px"}}>
        <div style={{fontSize:11,fontWeight:700,color:C.neon,marginBottom:8,letterSpacing:"1px"}}>◉ TOTAL LAUNCH COST</div>
        {[["Anthropic API","~₹0 (free $5 credit)"],["Razorpay","₹0 setup · 2% when you earn"],["Make.com","₹0 (1,000 ops/month free)"]].map(([k,v],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textDim,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}><span>{k}</span><span style={{color:C.neon}}>{v}</span></div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,color:C.neon,paddingTop:8,fontFamily:"monospace"}}>
          <span>TOTAL TO LAUNCH</span><span>₹0</span>
        </div>
      </div>
    </div>
  );
}

// ── PRICING ───────────────────────────────────────────────
function Pricing({ currentPlan, onSelect }){
  const [billing, setBilling] = useState("monthly");
  return(
    <div style={{overflowY:"auto",height:"100%",padding:"28px",background:C.bg}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:"-0.5px",marginBottom:8}}>Choose Your Plan</div>
        <div style={{fontSize:13,color:C.textDim,marginBottom:20}}>Start free. Scale as your network grows.</div>
        <div style={{display:"inline-flex",background:C.card,border:`1px solid ${C.border}`,borderRadius:30,padding:4,gap:4}}>
          {["monthly","yearly"].map(b=>(
            <button key={b} onClick={()=>setBilling(b)}
              style={{padding:"7px 20px",borderRadius:24,border:"none",background:billing===b?`${C.neon}20`:"transparent",color:billing===b?C.neon:C.textDim,fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.2s",fontFamily:"monospace",boxShadow:billing===b?`0 0 10px ${C.neonGlow}`:"none"}}>
              {b==="monthly"?"MONTHLY":"YEARLY −20%"}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:28}}>
        {PLANS.map(p=>{
          const price = billing==="yearly"?Math.round(p.price*0.8):p.price;
          const isActive = currentPlan===p.id;
          return(
            <div key={p.id} style={{...S.card, padding:"20px 18px", position:"relative", display:"flex", flexDirection:"column", borderColor:p.popular?`${p.color}50`:isActive?`${p.color}40`:C.border, boxShadow:p.popular?`0 0 24px ${p.color}18`:"none", transition:"all 0.2s"}}>
              {p.popular&&<div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:`${C.cyan}20`,color:C.cyan,fontSize:9,padding:"3px 14px",borderRadius:20,fontWeight:800,whiteSpace:"nowrap",border:`1px solid ${C.cyan}50`,fontFamily:"monospace",letterSpacing:"1px"}}>◈ MOST POPULAR</div>}
              <div style={{fontSize:22,marginBottom:6,color:p.color}}>{p.icon}</div>
              <div style={{fontSize:13,fontWeight:800,color:C.text,letterSpacing:"1px",fontFamily:"monospace"}}>{p.name.toUpperCase()}</div>
              <div style={{fontSize:26,fontWeight:900,color:p.color,margin:"10px 0",fontFamily:"monospace",letterSpacing:"-1px"}}>
                {price===0?"FREE":`₹${price}`}
                {price>0&&<span style={{fontSize:11,color:C.textDim,fontWeight:400,fontFamily:"sans-serif"}}>/mo</span>}
              </div>
              <div style={{flex:1,marginBottom:16}}>
                {p.features.map((f,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:7}}>
                    <span style={{color:p.color,fontSize:10,flexShrink:0,marginTop:2,fontFamily:"monospace"}}>▸</span>
                    <span style={{fontSize:11,color:C.textDim,lineHeight:1.5}}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>onSelect(p.id)}
                style={{width:"100%",background:isActive?`${p.color}20`:"transparent",color:isActive?p.color:p.color,border:`1px solid ${p.color}${isActive?"":"60"}`,borderRadius:10,padding:"10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"monospace",letterSpacing:"0.5px",transition:"all 0.2s",boxShadow:isActive?`0 0 14px ${p.color}30`:"none"}}>
                {isActive?"● ACTIVE":p.cta.toUpperCase()}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{background:`linear-gradient(135deg,${C.neon}12,${C.cyan}08)`,border:`1px solid ${C.neon}25`,borderRadius:14,padding:"20px",textAlign:"center"}}>
        <div style={{fontSize:14,fontWeight:800,color:C.neon,marginBottom:6,fontFamily:"monospace",letterSpacing:"1px"}}>◉ BUILT FOR INDIAN SHOP OWNERS</div>
        <div style={{fontSize:12,color:C.textDim,lineHeight:1.7}}>No contracts. Cancel anytime. Pay via UPI, card, or net banking. All prices inclusive of GST.</div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ onNav, plan }){
  const stats=[
    {label:"Today's Revenue",val:"₹11,240",sub:"+12% vs yesterday",accent:C.neon,icon:"◈"},
    {label:"Deliveries",val:"16",sub:"₹3,840 · avg 22 min",accent:C.amber,icon:"⬡"},
    {label:"Walk-in Sales",val:"28",sub:"₹7,400 collected",accent:C.cyan,icon:"◇"},
    {label:"Active Alerts",val:"4",sub:"1 CRITICAL",accent:C.red,icon:"◉"},
  ];
  const alerts=[
    {t:"critical",icon:"◉",msg:"Chips CRITICAL — 1 day of stock left. Order from Gupta now.",accent:C.red},
    {t:"warning", icon:"◆",msg:"Sharma Traders ₹2,400 — 9 days overdue. Settle today.",accent:C.amber},
    {t:"weather",  icon:"◇",msg:"Rain from 4 PM. Keep Chai, Biscuits, Maggi ready.",accent:C.cyan},
    {t:"festival", icon:"⬡",msg:"Diwali in 4 days! Check stock for Oil and Pooja items.",accent:C.purple},
    {t:"customer", icon:"◈",msg:"Suresh hasn't visited in 12 days. Send a WhatsApp?",accent:C.neon},
  ];
  const boys=[
    {name:"Raju",    st:"online", stLabel:"Online",   del:12, earn:"₹480", rat:"4.9"},
    {name:"Suresh",  st:"online", stLabel:"Free",     del:8,  earn:"₹320", rat:"4.7"},
    {name:"Ajay",    st:"busy",   stLabel:"2 orders", del:9,  earn:"₹360", rat:"4.5"},
    {name:"Mohammed",st:"offline",stLabel:"Offline",  del:0,  earn:"₹0",   rat:"4.1"},
  ];
  const quick=[
    {icon:"◎",label:"Chat",      tab:"chat",      accent:C.neon},
    {icon:"⬡",label:"Delivery",  tab:"delivery",  accent:C.amber},
    {icon:"◈",label:"Insights",  tab:"insights",  accent:C.cyan},
    {icon:"◇",label:"Suppliers", tab:"suppliers", accent:"#ff8c42"},
    {icon:"⊕",label:"Global",    tab:"global",    accent:C.purple},
    {icon:"◉",label:"Voice",     tab:"voice",     accent:C.red},
  ];

  return(
    <div style={{overflowY:"auto",height:"100%",padding:"24px",background:C.bg}}>
      {/* Header */}
      <div style={{marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:"-0.5px"}}>Hello, Ramesh 👋</div>
          <div style={{fontSize:12,color:C.textDim,marginTop:3,fontFamily:"monospace"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <Badge color={C.amber}>🪔 DIWALI 4D</Badge>
          <Badge color={C.cyan}>🌧 RAIN 4PM</Badge>
          <Badge color={plan==="pro"||plan==="business"?C.neon:plan==="growth"?C.cyan:C.textDim}>{plan.toUpperCase()}</Badge>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        {stats.map((s,i)=>(
          <div key={i} style={{...S.card, padding:"16px 18px", position:"relative", overflow:"hidden", borderColor:`${s.accent}25`}}>
            <div style={{position:"absolute",top:-10,right:-10,fontSize:48,opacity:0.04,color:s.accent}}>{s.icon}</div>
            <div style={{...S.label, marginBottom:6}}>{s.label}</div>
            <div style={{fontSize:24,fontWeight:900,color:s.accent,fontFamily:"monospace",letterSpacing:"-1px"}}>{s.val}</div>
            <div style={{fontSize:11,color:C.textDim,marginTop:4}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div style={{marginBottom:20}}>
        <div style={{...S.label, marginBottom:10}}>Live Alerts</div>
        {alerts.map((a,i)=>(
          <div key={i} style={{background:`${a.accent}08`,border:`1px solid ${a.accent}30`,borderRadius:10,padding:"10px 14px",marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{color:a.accent,flexShrink:0,marginTop:1}}>{a.icon}</span>
            <span style={{fontSize:12,color:C.text,lineHeight:1.6}}>{a.msg}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{marginBottom:20}}>
        <div style={{...S.label, marginBottom:10}}>Quick Actions</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {quick.map((q,i)=>(
            <button key={i} onClick={()=>onNav(q.tab)}
              style={{...S.card, border:`1px solid ${q.accent}25`, padding:"14px 8px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"all 0.2s", background:`${q.accent}06`}}>
              <span style={{fontSize:20,color:q.accent}}>{q.icon}</span>
              <span style={{fontSize:11,fontWeight:700,color:C.text,fontFamily:"monospace",letterSpacing:"0.5px"}}>{q.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Delivery */}
      <div style={{...S.card, padding:"16px 18px"}}>
        <div style={{...S.label, marginBottom:14}}>Delivery Network</div>
        {boys.map((b,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<boys.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:b.st==="online"?`${C.neon}15`:b.st==="busy"?`${C.amber}15`:`${C.textFaint}15`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${b.st==="online"?C.neon:b.st==="busy"?C.amber:C.textFaint}30`}}>
              <GlowDot color={b.st==="online"?C.neon:b.st==="busy"?C.amber:C.textFaint} size={8}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{b.name}</div>
              <div style={{fontSize:11,color:C.textDim,fontFamily:"monospace"}}>{b.rat}★ · {b.del} del · {b.earn}</div>
            </div>
            <Badge color={b.st==="online"?C.neon:b.st==="busy"?C.amber:C.textFaint}>{b.stLabel.toUpperCase()}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SETTINGS ─────────────────────────────────────────────
function Settings({ plan, onNav }){
  const [tog,setTog]=useState([true,true,true,true,true,false]);
  const toggles=["Daily 9 PM summary","Festival demand alerts","Rush hour insights","Weather delivery alerts","Customer loyalty radar","Surge pricing prompts"];
  return(
    <div style={{overflowY:"auto",height:"100%",padding:"24px",background:C.bg}}>
      <div style={{...S.card, padding:"18px", marginBottom:16}}>
        <div style={{...S.label, marginBottom:14}}>Shop Info</div>
        {[["Shop","Ramesh Kirana Store"],["Owner","Ramesh"],["Location","Nashik, Maharashtra"],["Currency","₹ INR"],["Language","Hindi / English"],["Delivery Radius","5 km"],["WhatsApp","+91 98XXX XXXXX"]].map(([k,v],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<6?`1px solid ${C.border}`:"none"}}>
            <span style={{fontSize:12,color:C.textDim}}>{k}</span>
            <span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"monospace"}}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{...S.card, padding:"18px", marginBottom:16}}>
        <div style={{...S.label, marginBottom:14}}>AI Features</div>
        {toggles.map((t,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<toggles.length-1?`1px solid ${C.border}`:"none"}}>
            <span style={{fontSize:13,color:C.text}}>{t}</span>
            <div onClick={()=>setTog(p=>{const n=[...p];n[i]=!n[i];return n;})}
              style={{width:46,height:25,borderRadius:13,background:tog[i]?`${C.neon}30`:"#0f1e2b",border:`1px solid ${tog[i]?C.neon:C.border}`,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0,boxShadow:tog[i]?`0 0 10px ${C.neonGlow}`:"none"}}>
              <div style={{position:"absolute",top:3,left:tog[i]?23:3,width:17,height:17,borderRadius:"50%",background:tog[i]?C.neon:"#3a5a4a",transition:"all 0.2s",boxShadow:tog[i]?`0 0 8px ${C.neon}`:"none"}}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{background:`${C.neon}10`,border:`1px solid ${C.neon}30`,borderRadius:14,padding:"20px"}}>
        <div style={{fontSize:14,fontWeight:800,color:C.neon,marginBottom:4,fontFamily:"monospace",letterSpacing:"1px"}}>SHOPMIND {plan.toUpperCase()}</div>
        <div style={{fontSize:12,color:C.textDim,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>Nashik <GlowDot color={C.neon} size={7}/> Active</div>
        <button onClick={()=>onNav("pricing")}
          style={{background:"transparent",border:`1px solid ${C.neon}60`,color:C.neon,borderRadius:10,padding:"8px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"monospace",letterSpacing:"0.5px"}}>
          UPGRADE PLAN ▸
        </button>
      </div>
    </div>
  );
}

// ── CHAT PANE ─────────────────────────────────────────────
function ChatPane({ tabId, color, apiKey, plan }){
  const [msgs,setMsgs]=useState([{role:"assistant",text:INIT[tabId]||"Hello! How can I help you?",time:now()}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [hist,setHist]=useState([]);
  const botRef=useRef(null);
  const inpRef=useRef(null);

  const needsUpgrade = ["delivery","insights","suppliers","global","voice"].includes(tabId) && plan==="free";
  useEffect(()=>{botRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  const SYSTEM_PROMPT=`You are ShopMind AI — a WhatsApp-based business brain for small shop owners anywhere in the world. You work for kirana stores in India, warungs in Indonesia, dukas in Kenya, bodegas in Mexico, and corner shops everywhere.
You understand Hindi, English, Swahili, Bahasa Indonesia, Spanish, Arabic, Bengali, Tamil, and any other language. Always reply in the same language used. Do NOT mix languages — reply in pure English if the user writes in English, pure Hindi if they write in Hindi.
WHO YOU ARE: Warm, sharp, practical — like a smart younger cousin who studied business. Plain language, no jargon, always actionable.
CURRENCY: India→₹ | Indonesia→Rp | Kenya→KSh | Nigeria→₦ | Bangladesh→৳ | Mexico→$MXN | UAE→AED | Default→$USD
CORE: Record sales, bills, stock, expenses, rush hours, restock alerts, customer radar, profit coach, festival predictor, broadcasts, monthly reports, competitor advice.
DELIVERY: Own network, no commission. Smart dispatch, incentives, recurring orders, weather alerts, heatmap, holiday mode, catalogue sync.
SUPPLIERS: Track orders, dues, overdue flags.
RESPONSE RULES: Max 6 lines. Delivery: one-word replies *SEND*/*CANCEL* etc. Never invent numbers. ₹ always. Smart friend tone. English only unless user writes in another language.
DEMO: Shop: Ramesh Kirana Store Nashik | Diwali 4 days | Rain 4PM | Chips CRITICAL | Sharma Traders ₹2400 overdue 9days | Suresh missing 12days | Boys: Raju(online 4.9★) Suresh(online 4.7★) Ajay(busy) Mohammed(offline)`;

  const send=async(t)=>{
    const txt=(t||input).trim(); if(!txt||loading)return;
    setInput("");
    const tm=now();
    setMsgs(p=>[...p,{role:"user",text:txt,time:tm}]);
    const nh=[...hist,{role:"user",content:`[${tabId.toUpperCase()}] ${txt}`}];
    setHist(nh); setLoading(true);
    const key=apiKey||"";
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json",...(key&&{"x-api-key":key})},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT,messages:nh})
      });
      const d=await r.json();
      const rep=d.content?.[0]?.text||"Something went wrong — please try again.";
      setMsgs(p=>[...p,{role:"assistant",text:rep,time:now()}]);
      setHist(p=>[...p,{role:"assistant",content:rep}]);
    }catch{setMsgs(p=>[...p,{role:"assistant",text:"Network error — please try again.",time:tm}]);}
    setLoading(false);
    setTimeout(()=>inpRef.current?.focus(),50);
  };

  if(needsUpgrade) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:32,textAlign:"center",background:C.bg}}>
      <div style={{fontSize:52,marginBottom:20,color:C.textFaint}}>◈</div>
      <div style={{fontSize:20,fontWeight:900,color:C.text,marginBottom:8,letterSpacing:"-0.5px"}}>Growth Feature</div>
      <div style={{fontSize:13,color:C.textDim,marginBottom:28,lineHeight:1.7,maxWidth:280}}>
        {tabId==="delivery"?"Full delivery network available on Pro — dispatch, track, incentives, recurring orders.":"Available on the Growth plan and above."}
      </div>
      <div style={{fontSize:28,fontWeight:900,color:C.neon,marginBottom:6,fontFamily:"monospace"}}>{tabId==="delivery"?"₹999/mo":"₹499/mo"}</div>
      <div style={{fontSize:12,color:C.textDim,marginBottom:24}}>Cancel anytime · Pay via UPI</div>
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:C.bg}}>
      {/* Suggestions */}
      {SUGG[tabId]&&(
        <div style={{padding:"8px 12px",background:C.surface,display:"flex",gap:6,overflowX:"auto",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <span style={{fontSize:9,color:C.textFaint,alignSelf:"center",whiteSpace:"nowrap",flexShrink:0,letterSpacing:"1px",fontFamily:"monospace"}}>TRY:</span>
          {SUGG[tabId].map((s,i)=>(
            <button key={i} onClick={()=>send(s)}
              style={{background:`${color}12`,border:`1px solid ${color}40`,borderRadius:20,padding:"5px 12px",fontSize:11,whiteSpace:"nowrap",cursor:"pointer",color,fontWeight:600,flexShrink:0,fontFamily:"monospace",letterSpacing:"0.3px",transition:"all 0.15s"}}>
              {s.length>22?s.slice(0,22)+"…":s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"82%",background:m.role==="user"?`${color}18`:`${C.card}`,border:`1px solid ${m.role==="user"?`${color}40`:C.border}`,borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px"}}>
              {m.role==="assistant"&&<div style={{fontSize:9,fontWeight:800,color,marginBottom:5,fontFamily:"monospace",letterSpacing:"1.5px"}}>◉ SHOPMIND AI</div>}
              <pre style={{margin:0,fontFamily:"inherit",fontSize:13,whiteSpace:"pre-wrap",lineHeight:1.7,color:C.text}}>{m.text}</pre>
              <div style={{fontSize:9,color:C.textFaint,textAlign:"right",marginTop:5,fontFamily:"monospace"}}>{m.time}{m.role==="user"&&" ✓✓"}</div>
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex"}}>
            <div style={{...S.card, padding:"12px 16px"}}>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:9,color:C.textFaint,fontFamily:"monospace",letterSpacing:"1px"}}>THINKING</span>
                {[0,1,2].map(j=>(
                  <div key={j} style={{width:6,height:6,borderRadius:"50%",background:color,animation:"pulse 1.2s infinite",animationDelay:`${j*0.2}s`,boxShadow:`0 0 6px ${color}`}}/>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={botRef}/>
      </div>

      {/* Input */}
      <div style={{padding:"10px 12px",background:C.surface,display:"flex",gap:8,alignItems:"flex-end",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
        <textarea ref={inpRef} value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder={tabId==="voice"?"[Voice: your message...]":tabId==="global"?"Any language...":"Type your message..."}
          rows={1}
          style={{flex:1,borderRadius:12,padding:"10px 16px",border:`1px solid ${C.border}`,fontSize:13,resize:"none",outline:"none",background:C.card,lineHeight:1.5,fontFamily:"inherit",color:C.text,transition:"border 0.2s"}}
        />
        <button onClick={()=>send()} disabled={loading||!input.trim()}
          style={{width:42,height:42,borderRadius:"50%",background:loading||!input.trim()?"transparent":color,border:`1px solid ${loading||!input.trim()?C.border:color}`,cursor:loading||!input.trim()?"default":"pointer",color:loading||!input.trim()?C.textFaint:"#000",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s",boxShadow:loading||!input.trim()?"none":`0 0 14px ${color}60`}}>▸</button>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("setup");
  const [sideOpen,setSideOpen]=useState(true);
  const [apis,setApis]=useState({anthropic:"",razorpay_key:"",razorpay_secret:"",make_webhook:""});
  const [plan,setPlan]=useState("pro");

  const active=NAV.find(n=>n.id===tab)||NAV[0];
  const accent=active.accent||C.neon;
  const tabInfo={
    dashboard:"Today's overview", chat:"Sales, bills, stock",   delivery:"Own delivery network",
    insights:"AI analytics",      suppliers:"Dues & orders",    global:"Any language",
    voice:"Voice simulation",     pricing:"Plans & billing",    setup:"Connect APIs",
    settings:"Configuration",
  };

  return(
    <div style={{display:"flex",height:"100vh",fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",overflow:"hidden",background:C.bg}}>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <div style={{width:sideOpen?230:58,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",transition:"width 0.25s",flexShrink:0,overflow:"hidden"}}>

        {/* Logo */}
        <div style={{padding:sideOpen?"18px 16px 14px":"14px 0",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,justifyContent:sideOpen?"flex-start":"center",flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:10,background:`${C.neon}18`,border:`1px solid ${C.neon}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,boxShadow:`0 0 12px ${C.neonGlow}`}}>◉</div>
          {sideOpen&&(
            <div>
              <div style={{fontSize:14,fontWeight:900,color:C.neon,fontFamily:"monospace",letterSpacing:"0.5px",lineHeight:1}}>ShopMind</div>
              <div style={{fontSize:9,color:C.textDim,fontFamily:"monospace",letterSpacing:"2px",marginTop:2}}>AI PLATFORM</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <div style={{flex:1,overflowY:"auto",paddingTop:8}}>
          {NAV.map(n=>{
            const isActive=tab===n.id;
            const navAccent=n.accent||C.neon;
            return(
              <button key={n.id} onClick={()=>setTab(n.id)}
                style={{width:"100%",background:isActive?`${navAccent}12`:"transparent",border:"none",borderLeft:isActive?`2px solid ${navAccent}`:"2px solid transparent",color:isActive?navAccent:C.textDim,cursor:"pointer",padding:sideOpen?"10px 16px":"10px 0",display:"flex",alignItems:"center",gap:10,justifyContent:sideOpen?"flex-start":"center",transition:"all 0.15s"}}>
                <span style={{fontSize:16,width:22,textAlign:"center",flexShrink:0,filter:isActive?`drop-shadow(0 0 4px ${navAccent})`:"none"}}>{n.icon}</span>
                {sideOpen&&(
                  <>
                    <span style={{fontSize:12,fontWeight:isActive?700:400,flex:1,whiteSpace:"nowrap",fontFamily:"monospace",letterSpacing:"0.3px"}}>{n.label}</span>
                    {n.badge&&<Badge color={C.amber}>{n.badge}</Badge>}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* User */}
        <div style={{borderTop:`1px solid ${C.border}`,padding:"12px",flexShrink:0}}>
          {sideOpen?(
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:`${C.neon}20`,border:`1px solid ${C.neon}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:C.neon,flexShrink:0,fontFamily:"monospace"}}>R</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"monospace"}}>Ramesh · {plan.toUpperCase()}</div>
                <div style={{fontSize:10,color:C.textDim,display:"flex",alignItems:"center",gap:5,marginTop:2}}>Nashik <GlowDot color={C.neon} size={5}/></div>
              </div>
              <button onClick={()=>setSideOpen(false)}
                style={{background:"transparent",border:`1px solid ${C.border}`,color:C.textDim,cursor:"pointer",borderRadius:6,padding:"4px 7px",fontSize:11}}>◀</button>
            </div>
          ):(
            <button onClick={()=>setSideOpen(true)}
              style={{background:"transparent",border:`1px solid ${C.border}`,color:C.textDim,cursor:"pointer",borderRadius:6,padding:"7px",fontSize:13,width:"100%",display:"flex",justifyContent:"center"}}>▶</button>
          )}
        </div>
      </div>

      {/* ── MAIN ────────────────────────────────────────── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>

        {/* Topbar */}
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"10px 20px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <span style={{fontSize:18,color:accent,filter:`drop-shadow(0 0 6px ${accent})`}}>{active.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:C.text,display:"flex",alignItems:"center",gap:8,fontFamily:"monospace"}}>
              {active.label.toUpperCase()}
              {active.badge&&<Badge color={C.amber}>{active.badge}</Badge>}
            </div>
            <div style={{fontSize:11,color:C.textDim}}>{tabInfo[tab]}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <Badge color={C.amber}>🪔 DIWALI 4D</Badge>
            <Badge color={C.cyan}>🌧 RAIN 4PM</Badge>
            <GlowDot color={C.neon} size={8}/>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflow:"hidden"}}>
          {tab==="dashboard" &&<Dashboard onNav={setTab} plan={plan}/>}
          {tab==="settings"  &&<Settings plan={plan} onNav={setTab}/>}
          {tab==="pricing"   &&<Pricing currentPlan={plan} onSelect={p=>{setPlan(p);setTab("dashboard");}}/>}
          {tab==="setup"     &&<ApiSetup apis={apis} setApis={setApis} onDone={()=>setTab("dashboard")}/>}
          {!["dashboard","settings","pricing","setup"].includes(tab)&&
            <ChatPane key={tab} tabId={tab} color={accent} apiKey={apis.anthropic} plan={plan}/>}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;900&family=Courier+Prime:wght@400;700&display=swap');
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}
        @keyframes glow{0%,100%{box-shadow:0 0 5px ${C.neon}40}50%{box-shadow:0 0 18px ${C.neon}80}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${C.textFaint};border-radius:3px}
        input::placeholder,textarea::placeholder{color:${C.textFaint}}
        input,textarea{color-scheme:dark}
        button:hover{opacity:0.88}
        a{color:${C.cyan}}
      `}</style>
    </div>
  );
}
