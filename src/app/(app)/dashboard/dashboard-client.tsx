"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BadgesSection, Badge } from "./dash-badges";
import { LungProjection } from "./dash-lung";
import { AIInsights } from "./dash-insights";
import { IcoFire, IcoStar, IcoDollar, IcoZap, IcoTrend, IcoAlert, IcoClipboard, IcoMessage, IcoCheck, IcoWind2, IcoArrow } from "./dash-icons";
import { computeXP, computeLevel } from "@/lib/xp";

interface Checkin{id:string;stressLevel:number;mood:string;triggerType:string|null;checkedInAt:string;sleepQuality?:number;energyLevel?:number;}
interface Props{userName:string;userId:string;recentCheckins:Checkin[];checkInStreak:number;checkedInToday:boolean;todayEntry:Checkin|null;earnedBadges:Badge[];userTriggers:{triggerType:string}[];urgesThisWeek:number;copingSessionsThisWeek:number;}

function XPBar({pct}:{pct:number}){
  return<div style={{height:8,background:"rgba(255,255,255,.12)",borderRadius:4,overflow:"hidden"}}>
    <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1.5,ease:"easeOut",delay:0.4}}
      style={{height:"100%",background:"linear-gradient(90deg,#5ddba8,#3bc98e)",borderRadius:4}}/>
  </div>;
}

function WeekChart({checkins}:{checkins:Checkin[]}){
  const [hov,setHov]=useState<number|null>(null);
  const days=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(6-i));d.setHours(0,0,0,0);
    const e=checkins.find(c=>{const cd=new Date(c.checkedInAt);cd.setHours(0,0,0,0);return cd.getTime()===d.getTime();});
    return{day:["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()],stress:e?.stressLevel??0,has:!!e};
  });
  const mx=Math.max(...days.map(d=>d.stress),1);
  const col=(s:number)=>s<=3?"#5a8f6a":s<=6?"#c9982a":"#e07b5a";
  const BAR_MAX=64;
  return<div>
    <div style={{display:"flex",gap:8,height:BAR_MAX+28,alignItems:"flex-end"}}>
      {days.map((g,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",position:"relative",height:"100%"}}
        onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
        <AnimatePresence>{hov===i&&g.has&&<motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
          style={{position:"absolute",bottom:28,left:"50%",transform:"translateX(-50%)",background:"var(--text1)",color:"var(--bg0)",borderRadius:8,padding:"3px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",zIndex:10}}>
          {g.stress}/10
        </motion.div>}</AnimatePresence>
        {g.has
          ?<motion.div initial={{height:0}} animate={{height:`${Math.max((g.stress/mx)*BAR_MAX,5)}px`}}
              transition={{delay:0.1+i*0.07,duration:0.55,ease:"easeOut"}}
              style={{width:"80%",borderRadius:"5px 5px 2px 2px",background:`linear-gradient(180deg,${col(g.stress)}99,${col(g.stress)})`,border:`1.5px solid ${col(g.stress)}`,borderBottom:"none"}}/>
          :<div style={{width:"80%",height:4,borderRadius:"3px 3px 0 0",background:"var(--bg4)"}}/>}
        <div style={{width:"80%",height:2,background:g.has?col(g.stress):"var(--bg4)",borderRadius:"0 0 2px 2px",flexShrink:0}}/>
        <div style={{fontSize:9,fontWeight:800,color:g.has?"var(--text2)":"var(--text4)",marginTop:4,flexShrink:0}}>{g.day}</div>
      </div>)}
    </div>
    <div style={{display:"flex",gap:12,marginTop:8,flexWrap:"wrap"}}>
      {[{c:"#5a8f6a",l:"Low (1–3)"},{c:"#c9982a",l:"Med (4–6)"},{c:"#e07b5a",l:"High (7–10)"}].map(x=>(
          <div key={x.l} style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:10,height:10,borderRadius:3,background:x.c}}/><span style={{fontSize:10,fontWeight:600,color:"var(--text2)"}}>{x.l}</span>
        </div>
      ))}
    </div>
    {!checkins.length&&<p style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginTop:8}}>No check-ins yet — log one below to see your week!</p>}
  </div>;
}

const C="var(--bg2)",B="var(--border2)";
function card(p:object){return{background:C,border:`2px solid ${B}`,borderRadius:22,padding:18,boxShadow:"var(--shadow-card)",...p};}

export default function DashboardClient({userName,userId,recentCheckins,checkInStreak,checkedInToday,todayEntry,earnedBadges,userTriggers,urgesThisWeek,copingSessionsThisWeek}:Props){
  const [tod,setTod]=useState("morning");
  const [guestName,setGuestName]=useState("");
  const [stress,setStress]=useState(5);
  const [mood,setMood]=useState("");
  const [done,setDone]=useState(checkedInToday);
  const [editing,setEditing]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [celebrate,setCelebrate]=useState(false);

  useEffect(()=>{
    const h=new Date().getHours();
    setTod(h<12?"morning":h<17?"afternoon":"evening");
    if(typeof window!=="undefined") setGuestName(localStorage.getItem("loopless_guest_name")??"");
    setDone(checkedInToday);
    if(checkedInToday&&todayEntry){
      setStress(todayEntry.stressLevel);
      setMood(todayEntry.mood);
    }
  },[checkedInToday,todayEntry]);

  const name=(userName||guestName||"there").split(" ")[0];
  const streak=checkInStreak;
  const avgStress=recentCheckins.length?(recentCheckins.reduce((s,c)=>s+c.stressLevel,0)/recentCheckins.length).toFixed(1):"—";
  const money=Math.round(streak*2.5);
  const xp=computeXP(earnedBadges,streak,recentCheckins);
  const {level,xpInLevel:xpInLvl}=computeLevel(xp);

  const quests=[
    {Icon:IcoClipboard,title:"Daily check-in",desc:"Log today's stress & mood",reward:"+20 XP",done:done,href:"/checkin",accent:"#5a8f6a",bg:"var(--mint3)", implemented: true},
    {Icon:IcoWind2,title:"4-7-8 Breathing",desc:"2 min breathing session",reward:"+15 XP",done:copingSessionsThisWeek>0,href:"/coping/breathing",accent:"#5bb8f5",bg:"var(--sky3)", implemented: false},
    {Icon:IcoMessage,title:"Log an urge",desc:"Record & beat a craving",reward:"+25 XP",done:urgesThisWeek>0,href:"/urge",accent:"#c9982a",bg:"var(--amber3)", implemented: true},
    {Icon:IcoStar,title:"Myth card",desc:"Learn a vaping fact",reward:"+10 XP",done:false,href:"/myths",accent:"#7b6fa0",bg:"var(--lilac)", implemented: false},
  ];

  const moods=[{v:"rough",l:"Rough",c:"#e07b5a"},{v:"meh",l:"Meh",c:"#c9982a"},{v:"okay",l:"Okay",c:"#5bb8f5"},{v:"good",l:"Good",c:"#5a8f6a"}];

  // Simple analytics
  let mostCommonMood="—";
  let highestStress="—";
  if(recentCheckins.length>0){
    const counts=recentCheckins.reduce((acc:Record<string,number>,c)=>{acc[c.mood]=(acc[c.mood]||0)+1;return acc;},{});
    const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const topMoodObj=moods.find(m=>m.v===sorted[0][0]);
    mostCommonMood=topMoodObj?.l||sorted[0][0]||"—";

    const highest=recentCheckins.reduce((max,c)=>c.stressLevel>max.stressLevel?c:max,recentCheckins[0]);
    const dayStr=highest.checkedInAt?new Date(highest.checkedInAt).toLocaleDateString("en-US",{weekday:"short"}):"";
    highestStress=highest.stressLevel?`${highest.stressLevel}/10 (${dayStr})`:"—";
  }

  async function submit(){
    if(!mood)return;
    setSubmitting(true);
    try{
      const gid=typeof window!=="undefined"?localStorage.getItem("loopless_guest_id"):null;
      const h:Record<string,string>={"Content-Type":"application/json"};
      if(gid)h["x-guest-id"]=gid;
      // Always use POST — server will upsert (update if already checked in today)
      const r=await fetch("/api/checkin",{method:"POST",headers:h,body:JSON.stringify({stressLevel:stress,mood,timezoneOffset:Intl.DateTimeFormat().resolvedOptions().timeZone})});
      if(r.ok){setDone(true);setEditing(false);if(streak>0)setCelebrate(true);}
    }catch{}
    setSubmitting(false);
  }

  const streakAtRisk=!done&&streak>0;
  const greet={morning:"Good morning",afternoon:"Good afternoon",evening:"Good evening"}[tod];

  return<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      h1,h2,h3,h4{font-family:'Fredoka',sans-serif;}
      a{color:inherit;text-decoration:none;}
      @keyframes pulseDot{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.9);opacity:.4;}}
      @keyframes shimmerPulse{0%,100%{opacity:.4;}50%{opacity:.85;}}
      @keyframes confetti{0%{transform:translateY(-10px) rotate(0);opacity:1;}100%{transform:translateY(100px) rotate(360deg);opacity:0;}}
      @keyframes urgePulse{0%,100%{box-shadow:0 0 0 0 rgba(224,123,90,.5),4px 4px 0 rgba(26,18,8,.25);}70%{box-shadow:0 0 0 12px rgba(224,123,90,0),4px 4px 0 rgba(26,18,8,.25);}}
      .dash{padding:24px;max-width:1200px;padding-bottom:90px;}
      @media(max-width:640px){.dash{padding:12px 12px 110px;}}
      .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}
      @media(max-width:640px){.stat-grid{grid-template-columns:1fr 1fr;}}
      .two-col{display:grid;grid-template-columns:1fr;gap:14px;}
      @media(min-width:900px){.two-col{grid-template-columns:1fr 1fr;}}
      .card{background:var(--bg2);border:2px solid var(--border2);border-radius:22px;padding:18px;box-shadow:var(--shadow-card);}
      .slider{-webkit-appearance:none;width:100%;height:12px;border-radius:6px;outline:none;cursor:pointer;border:2px solid var(--border3);}
      .slider::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:var(--bg2);border:2.5px solid var(--stroke);box-shadow:0 3px 8px rgba(0,0,0,.18);cursor:grab;}
      .mood-btn{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px;border-radius:14px;border:2.5px solid var(--border2);background:var(--bg2);cursor:pointer;transition:all .15s;font-family:'Nunito',sans-serif;color:var(--text1);}
      .mood-btn.sel{transform:translateY(-4px) scale(1.06);}
    `}</style>

    {/* Celebration overlay */}
    <AnimatePresence>{celebrate&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:"fixed",inset:0,zIndex:900,background:"linear-gradient(135deg,#1a3d28,#2d5a3d)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}
      onClick={()=>setCelebrate(false)}>
      <motion.div animate={{scale:[1,1.15,1],rotate:[0,-5,5,0]}} transition={{duration:2.5,repeat:Infinity}}>
        <IcoFire/>
      </motion.div>
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
        style={{fontFamily:"'Fredoka',sans-serif",fontSize:34,fontWeight:600,color:"white",marginTop:16}}>
        Day {streak} streak!
      </motion.div>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}}
        style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.6)",marginTop:8}}>Tap to continue</motion.div>
    </motion.div>}</AnimatePresence>

    <div className="dash">
      {/* HERO */}
      <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
        style={{borderRadius:26,padding:"22px 22px 20px",background:"linear-gradient(135deg,#1a3d28,#2d5a3d)",border:"2.5px solid #1a1208",boxShadow:"6px 6px 0 rgba(26,18,8,.22)",marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{position:"relative",zIndex:2}}>
          <motion.div initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:0.25}}
            style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(255,255,255,.12)",border:"1.5px solid rgba(255,255,255,.2)",borderRadius:50,padding:"5px 14px",fontSize:11,fontWeight:800,color:"rgba(255,255,255,.9)",marginBottom:10}}>
            <IcoStar/> Level {level} Loop Breaker
            <span style={{width:7,height:7,borderRadius:"50%",background:"#5ddba8",display:"inline-block",animation:"pulseDot 2s infinite"}}/>
          </motion.div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)",marginBottom:2}}>{greet}</div>
              <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:32,fontWeight:600,color:"white",lineHeight:1.1}}>{name}!</div>
            </div>
            <div style={{position:"relative"}}>
              <motion.div animate={{scale:[1,1.12,1]}} transition={{duration:2.5,repeat:Infinity}} style={{color:"#f5a623"}}>
                <IcoFire/>
              </motion.div>
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.5,type:"spring",bounce:0.6}}
                style={{position:"absolute",bottom:-6,right:-12,background:"#e07b5a",color:"white",border:"2.5px solid #1a1208",borderRadius:20,padding:"2px 9px",fontSize:13,fontWeight:900,boxShadow:"2px 2px 0 rgba(168,75,42,.45)"}}>
                {streak}
              </motion.div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:".06em"}}>XP to Level {level+1}</span>
            <span style={{fontSize:11,fontWeight:800,color:"#5ddba8"}}>{xpInLvl}/500</span>
          </div>
          <XPBar pct={(xpInLvl/500)*100}/>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.35)",marginTop:5}}>{500-xpInLvl} XP to next level · complete daily quests</div>
        </div>
      </motion.div>

      {/* STAT TILES */}
      <div className="stat-grid">
        {[
          {Icon:IcoFire,val:`${streak}d`,label:"Streak",sub:"days clean",accent:"#e07b5a",bg:"var(--coral3)"},
          {Icon:IcoTrend,val:avgStress,label:"Avg Stress",sub:"this week /10",accent:"#5bb8f5",bg:"var(--sky3)"},
          {Icon:IcoDollar,val:`$${money}`,label:"Saved",sub:"estimated",accent:"#5a8f6a",bg:"var(--mint3)"},
          {Icon:IcoZap,val:`${urgesThisWeek}`,label:"Urges Logged",sub:"this week",accent:"#c9982a",bg:"var(--amber3)"},
        ].map(({Icon,val,label,sub,accent,bg},i)=>(
          <motion.div key={label} initial={{opacity:0,y:18,scale:.9}} animate={{opacity:1,y:0,scale:1}}
            transition={{delay:i*0.08,duration:0.45,type:"spring",bounce:0.3}} whileHover={{y:-4}}
            style={{background:bg,border:`2px solid ${accent}44`,borderRadius:20,padding:"14px 12px",boxShadow:`4px 4px 0 ${accent}33`,cursor:"pointer"}}>
            <div style={{color:accent,marginBottom:6}}><Icon/></div>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:26,fontWeight:600,color:"var(--text1)",lineHeight:1}}>{val}</div>
            <div style={{fontSize:12,fontWeight:800,color:"var(--text1)",marginTop:3}}>{label}</div>
            <div style={{fontSize:10,fontWeight:500,color:"var(--text2)"}}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* STREAK EXPLANATION */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
        style={{background:"var(--amber3)",border:"1.5px solid var(--amber)",borderRadius:16,padding:"12px 16px",marginBottom:14,display:"flex",gap:12,boxShadow:"2px 2px 0 var(--shadow-amber)"}}>
          <div style={{color:"var(--amber2)",flexShrink:0,marginTop:2}}><IcoAlert/></div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"var(--text1)",marginBottom:2}}>Why keep your streak?</div>
            <div style={{fontSize:11,fontWeight:600,color:"var(--text2)",lineHeight:1.4}}>
              Your streak represents your momentum. Missing a daily check-in will <strong style={{color:"var(--coral)"}}>reset your streak to 0</strong> and lower your daily XP bonus. Consistent tracking builds self-awareness.
          </div>
        </div>
      </motion.div>

      {/* STREAK WARNING */}
      {streakAtRisk&&(
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
          style={{background:"var(--coral3)",border:"2px solid var(--coral)",borderRadius:16,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10,boxShadow:"3px 3px 0 var(--shadow-coral)"}}>
          <div style={{color:"var(--coral)",flexShrink:0}}><IcoAlert/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:800,color:"var(--text1)"}}>Your {streak}-day streak is at risk!</div>
            <div style={{fontSize:11,fontWeight:600,color:"var(--text3)"}}>Missing today will reset your streak to 0. You've worked hard — check in now.</div>
          </div>
          <Link href="/checkin" style={{background:"#e07b5a",color:"white",border:"2px solid #1a1208",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:800,whiteSpace:"nowrap",boxShadow:"2px 2px 0 rgba(168,75,42,.35)"}}>
            Check in
          </Link>
        </motion.div>
      )}

      {/* QUICK CHECK-IN */}
      <motion.div initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{delay:0.2,type:"spring",bounce:0.2}}
        className="card" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Fredoka',sans-serif",fontSize:18,fontWeight:600,color:"var(--text1)"}}>
              <IcoClipboard/> Daily Check-in
            </div>
            <div style={{fontSize:11,fontWeight:600,color:"var(--text3)"}}>+20 XP · Under 60 seconds</div>
          </div>
          {done&&!editing?<span style={{background:"var(--mint3)",border:"1.5px solid var(--mint2)",borderRadius:50,padding:"5px 12px",fontSize:11,fontWeight:800,color:"var(--mint2)",display:"flex",alignItems:"center",gap:5}}><IcoCheck/> Done today</span>
          :<Link href="/checkin" style={{fontSize:12,fontWeight:800,color:"var(--mint2)"}}>Full check-in →</Link>}
        </div>
        {done&&!editing?(
          <div style={{background:"var(--mint3)",border:"1.5px solid var(--mint2)",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{color:"var(--mint2)"}}><IcoCheck/></div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:800,color:"var(--text1)"}}>Checked in today</div>
              {todayEntry&&<div style={{fontSize:11,color:"var(--text2)"}}>Stress: {todayEntry.stressLevel}/10 · Mood: {todayEntry.mood}</div>}
            </div>
            <button onClick={()=>setEditing(true)}
              style={{background:"var(--bg2)",border:"1.5px solid var(--mint2)",borderRadius:10,padding:"6px 12px",fontSize:11,fontWeight:800,color:"var(--mint2)",cursor:"pointer",boxShadow:"2px 2px 0 var(--shadow-mint)"}}>
              Edit
            </button>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {editing&&<div style={{fontSize:11,fontWeight:700,color:"var(--amber2)",background:"var(--amber3)",border:"1.5px solid var(--amber)",borderRadius:10,padding:"7px 12px"}}>Updating today's check-in</div>}
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"var(--text2)",marginBottom:6}}>HOW STRESSED ARE YOU? <span style={{color:"var(--amber2)"}}>{stress}/10</span></div>
              <input type="range" min={1} max={10} value={stress} onChange={e=>setStress(+e.target.value)} className="slider"
                style={{background:`linear-gradient(to right,${stress<=3?"#5a8f6a":stress<=6?"#c9982a":"#e07b5a"} ${(stress-1)/9*100}%,#fde8c8 0%)`}}/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"var(--text2)",marginBottom:6}}>HOW'S YOUR MOOD?</div>
              <div style={{display:"flex",gap:8}}>
                {moods.map(m=>(
                  <button key={m.v} className={`mood-btn${mood===m.v?" sel":""}`}
                    style={{flex:1,borderColor:mood===m.v?m.c:"var(--border2)",background:mood===m.v?m.c+"22":"var(--bg2)",boxShadow:mood===m.v?`2px 4px 0 ${m.c}44`:"var(--shadow-card)"}}
                    onClick={()=>setMood(mood===m.v?"":m.v)}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:m.c,border:"1.5px solid rgba(26,18,8,.15)"}}/>
                    <span style={{fontSize:11,fontWeight:800,color:"var(--text1)"}}>{m.l}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              {editing&&<button onClick={()=>setEditing(false)} style={{flex:"0 0 auto",background:"var(--bg2)",border:"2px solid var(--border2)",borderRadius:12,padding:"11px 16px",fontSize:13,fontWeight:700,cursor:"pointer",color:"var(--text2)"}}>Cancel</button>}
              <button onClick={submit} disabled={!mood||submitting}
                style={{flex:1,background:mood?"var(--mint)":"var(--bg4)",color:mood?"var(--bg0)":"var(--text3)",border:"2.5px solid var(--stroke)",borderRadius:14,padding:13,fontSize:15,fontWeight:800,fontFamily:"'Nunito',sans-serif",cursor:mood?"pointer":"not-allowed",boxShadow:mood?"4px 4px 0 var(--shadow-mint)":"none",transition:"all .12s"}}>
                {submitting?"Saving...":(editing?"Update Check-in":"Log Check-in · +20 XP")}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* TODAY'S QUESTS */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}} className="card" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:19,fontWeight:600,color:"var(--text1)"}}>Today's Quests</div>
          <span style={{fontSize:11,fontWeight:700,color:"var(--text3)"}}>{quests.filter(q=>q.done).length}/{quests.length} done</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {quests.map(({Icon,title,desc,reward,done:qd,href,accent,bg,implemented},i)=>{
            if (!implemented) {
              return (
                <div key={title} style={{display:"flex",alignItems:"center",gap:12,background:"var(--bg3)",border:"2px solid var(--border2)",borderRadius:16,padding:"11px 13px",opacity:0.45,filter:"grayscale(100%)",cursor:"not-allowed"}}>
                  <div style={{width:40,height:40,borderRadius:12,flexShrink:0,background:"var(--bg4)",border:"2px solid var(--border3)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text4)"}}>
                    <Icon/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:800,color:"var(--text3)"}}>{title}</div>
                    <div style={{fontSize:11,color:"var(--text4)"}}>{desc}</div>
                  </div>
                  <span style={{background:"var(--bg4)",border:"1.5px solid var(--border3)",borderRadius:50,padding:"3px 10px",fontSize:10,fontWeight:800,color:"var(--text4)",whiteSpace:"nowrap"}}>{reward}</span>
                </div>
              );
            }
            return (
              <motion.div key={title} initial={{opacity:0,x:-14}} animate={{opacity:1,x:0}} transition={{delay:0.32+i*0.07}} whileHover={!qd?{x:3}:{}}>
                <Link href={qd?"#":href} style={{textDecoration:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,background:qd?"var(--mint3)":"var(--bg2)",border:`2px solid ${qd?"var(--mint-glow)":"var(--border2)"}`,borderRadius:16,padding:"11px 13px",boxShadow:qd?"2px 2px 0 rgba(61,107,79,.15)":"var(--shadow-card)",opacity:qd?0.8:1,transition:"all 0.2s"}}>
                    <div style={{width:40,height:40,borderRadius:12,flexShrink:0,background:bg,border:`2px solid ${accent}44`,display:"flex",alignItems:"center",justifyContent:"center",color:qd?"var(--mint)":accent,boxShadow:`2px 2px 0 ${accent}22`}}>
                      {qd?<IcoCheck/>:<Icon/>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:800,color:"var(--text1)",textDecoration:qd?"line-through":"none"}}>{title}</div>
                      <div style={{fontSize:11,color:"var(--text2)"}}>{desc}</div>
                    </div>
                    <span style={{background:qd?"var(--mint3)":"var(--amber3)",border:`1.5px solid ${qd?"var(--mint)":"var(--amber)"}`,borderRadius:50,padding:"3px 10px",fontSize:10,fontWeight:800,color:qd?"var(--mint)":"var(--amber2)",whiteSpace:"nowrap"}}>{reward}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* TWO COLUMN LAYOUT */}
      <div className="two-col">
        {/* Lung projection */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}} className="card">
          <LungProjection daysClean={streak}/>
        </motion.div>

        {/* Stress chart — alignSelf start so it doesn't stretch to match lung card height */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.45}} className="card" style={{alignSelf:"start"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <IcoTrend/>
            <span style={{fontFamily:"'Fredoka',sans-serif",fontSize:19,fontWeight:600,color:"var(--text1)"}}>This Week's Stress</span>
          </div>
          <WeekChart checkins={recentCheckins}/>
          
          <div style={{display:"flex",gap:10,marginTop:16}}>
              <div style={{flex:1,background:"var(--coral3)",borderRadius:12,padding:"10px 12px",border:"1.5px solid var(--coral)"}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--coral2)",marginBottom:2}}>HIGHEST STRESS</div>
                <div style={{fontSize:13,fontWeight:800,color:"var(--text1)"}}>{highestStress}</div>
              </div>
              <div style={{flex:1,background:"var(--mint3)",borderRadius:12,padding:"10px 12px",border:"1.5px solid var(--mint2)"}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--mint2)",marginBottom:2}}>MOST COMMON MOOD</div>
                <div style={{fontSize:13,fontWeight:800,color:"var(--text1)"}}>{mostCommonMood}</div>
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}} className="card">
          <BadgesSection earnedBadges={earnedBadges}/>
        </motion.div>

        {/* Health insights */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.55}} className="card">
          <AIInsights/>
        </motion.div>
      </div>
    </div>

    {/* FLOATING URGE BUTTON */}
    <motion.div
      initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.8,type:"spring",bounce:0.5}}
      style={{position:"fixed",bottom:24,right:24,zIndex:800}}>
      <Link href="/urge">
        <motion.button whileHover={{scale:1.08,y:-3}} whileTap={{scale:0.93}}
          style={{display:"flex",alignItems:"center",gap:10,background:"#e07b5a",color:"white",border:"2.5px solid #1a1208",borderRadius:50,padding:"13px 20px",fontSize:14,fontWeight:800,fontFamily:"'Nunito',sans-serif",cursor:"pointer",animation:"urgePulse 2.5s ease-out 2s 3",boxShadow:"4px 4px 0 rgba(26,18,8,.25)"}}>
          <IcoZap/>
          Log Urge
        </motion.button>
      </Link>
    </motion.div>
  </>;
}
