"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

/* ── Nav items ─────────────────────── */
const NAV = [
  { href: "/dashboard", icon: "🏠", label: "Home", shortLabel: "Home" },
  { href: "/checkin", icon: "📋", label: "Check-in", shortLabel: "Check-in" },
  { href: "/loop", icon: "🌀", label: "Loop", shortLabel: "Loop" },
  { href: "/progress", icon: "📈", label: "Progress", shortLabel: "Progress" },
  { href: "/insights", icon: "🧠", label: "Insights", shortLabel: "Insights" },
  { href: "/coping", icon: "🛠️", label: "Toolkit", shortLabel: "Tools" },
  { href: "/myths", icon: "💨", label: "Myth Cards", shortLabel: "Myths" },
  { href: "/support", icon: "🆘", label: "Support", shortLabel: "Support" },
];

const BOTTOM_NAV = [
  { href: "/dashboard", icon: "🏠", label: "Home" },
  { href: "/checkin", icon: "📋", label: "Check-in" },
  { href: "/progress", icon: "📈", label: "Progress" },
  { href: "/insights", icon: "🧠", label: "Insights" },
  { href: "/support", icon: "⚙️", label: "More" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [guestName, setGuestName] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const gn = localStorage.getItem("loopless_guest_name") ?? "";
    const gi = localStorage.getItem("loopless_guest_id");
    setGuestName(gn);
    setIsGuest(!session?.user && !!gi);
  }, [session]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Sparkle on nav click
  function spawnParticles(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const id = nextId.current++;
    setParticles((p) => [...p, { id, x, y }]);
    setTimeout(() => setParticles((p) => p.filter((pt) => pt.id !== id)), 700);
  }

  const rawName = session?.user?.name ?? guestName ?? "there";
  const firstName = rawName.split(" ")[0];
  const initials = firstName.slice(0, 2).toUpperCase();
  const level = 4;
  const xp = 340;
  const xpMax = 500;
  const streak = 12;

  async function handleSignOut() {
    if (isGuest) {
      localStorage.clear();
      router.push("/");
    } else {
      await signOut({ callbackUrl: "/" });
    }
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{font-family:'Nunito',sans-serif;}
        body{font-family:'Nunito',sans-serif;background:#fef9f0;color:#1a1208;overflow-x:hidden;}
        h1,h2,h3,h4{font-family:'Fredoka',sans-serif;}
        a{color:inherit;text-decoration:none;}

        @keyframes pulseDot{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.8);opacity:.5;}}
        @keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-40px) scale(.4);}}
        @keyframes shimmerBar{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        @keyframes sidebarGlow{0%,100%{box-shadow:4px 0 0 rgba(26,18,8,.06);}50%{box-shadow:4px 0 20px rgba(90,143,106,.12);}}
        @keyframes badgePop{0%{transform:scale(.6);opacity:0;}60%{transform:scale(1.15);}100%{transform:scale(1);opacity:1;}}

        /* LAYOUT */
        .shell{display:flex;min-height:100vh;}

        /* SIDEBAR */
        .sidebar{
          width:220px;flex-shrink:0;
          background:white;
          border-right:2px solid rgba(26,18,8,.08);
          display:flex;flex-direction:column;
          position:fixed;top:0;left:0;height:100vh;
          z-index:150;
          box-shadow:4px 0 0 rgba(26,18,8,.06);
          animation:sidebarGlow 6s ease-in-out infinite;
        }
        .sidebar-logo{
          padding:20px 16px 16px;
          border-bottom:2px dashed rgba(26,18,8,.07);
          margin-bottom:8px;
        }
        .logo-text{font-family:'Fredoka',sans-serif;font-size:24px;font-weight:600;color:#1a1208;}
        .logo-accent{color:#5a8f6a;}
        .logo-tag{font-size:10px;font-weight:800;color:#a8936a;text-transform:uppercase;letter-spacing:.06em;margin-top:1px;}

        /* XP mini bar in sidebar */
        .sidebar-xp{
          margin:0 12px 12px;
          background:linear-gradient(135deg,#1a3d28,#2d5a3d);
          border:2px solid #1a1208;border-radius:16px;padding:12px 14px;
          box-shadow:3px 3px 0 rgba(26,18,8,.15);
        }
        .xp-label{font-size:10px;font-weight:800;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;}
        .xp-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;}
        .xp-val{font-family:'Fredoka',sans-serif;font-size:13px;font-weight:600;color:#5ddba8;}
        .xp-bar-bg{height:6px;background:rgba(255,255,255,.12);border-radius:3px;overflow:hidden;}
        .xp-bar-fill{height:100%;background:linear-gradient(90deg,#5ddba8,#3bc98e);border-radius:3px;transition:width 1s ease;}

        /* NAV ITEMS */
        .nav-section{flex:1;overflow-y:auto;padding:0 10px;}
        .nav-group-label{font-size:9px;font-weight:800;color:#c8b89a;text-transform:uppercase;letter-spacing:.08em;padding:8px 8px 4px;}
        .nav-item{
          display:flex;align-items:center;gap:10px;
          padding:9px 10px;border-radius:12px;
          color:#6b5c3e;font-size:13.5px;font-weight:600;
          cursor:pointer;transition:all .15s;
          border:2px solid transparent;
          position:relative;margin-bottom:2px;
        }
        .nav-item:hover{background:#f0f7f3;color:#1a1208;border-color:rgba(90,143,106,.2);}
        .nav-item.active{
          background:linear-gradient(135deg,#e8f5ec,#d4f0e0);
          color:#1a4a2a;border-color:#5a8f6a55;
          box-shadow:2px 2px 0 rgba(61,107,79,.2);
          font-weight:800;
        }
        .nav-item.active::before{
          content:'';position:absolute;left:-10px;top:25%;bottom:25%;
          width:3px;background:#5a8f6a;border-radius:0 2px 2px 0;
        }
        .nav-icon{font-size:17px;flex-shrink:0;}
        .nav-badge{margin-left:auto;background:#e07b5a;color:white;border:1.5px solid #1a1208;border-radius:20px;padding:1px 7px;font-size:9px;font-weight:800;box-shadow:1px 1px 0 rgba(168,75,42,.4);}

        /* SIDEBAR BOTTOM */
        .sidebar-bottom{border-top:2px dashed rgba(26,18,8,.07);padding:12px;}
        .user-card{
          display:flex;align-items:center;gap:10px;
          padding:10px 12px;border-radius:14px;
          border:2px solid rgba(26,18,8,.1);background:#fef9f0;
          box-shadow:2px 2px 0 rgba(26,18,8,.07);
          cursor:pointer;transition:all .15s;
        }
        .user-card:hover{border-color:#5a8f6a55;background:#f0f7f3;}
        .avatar{
          width:36px;height:36px;border-radius:50%;
          background:linear-gradient(135deg,#5a8f6a,#3d6b4f);
          display:flex;align-items:center;justify-content:center;
          font-size:13px;font-weight:800;color:white;
          border:2px solid #1a1208;flex-shrink:0;
          box-shadow:2px 2px 0 rgba(26,18,8,.15);
        }
        .user-info{flex:1;min-width:0;}
        .user-name{font-size:12.5px;font-weight:800;color:#1a1208;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .user-sub{font-size:10px;font-weight:600;color:#a8936a;}
        .guest-delete-btn{
          width:100%;margin-top:8px;
          background:#fff3f2;border:2px solid #e07b5a;border-radius:12px;
          padding:9px;font-size:12px;font-weight:800;color:#7a2a0a;
          cursor:pointer;font-family:'Nunito',sans-serif;
          box-shadow:2px 2px 0 rgba(168,75,42,.25);
          transition:all .12s;display:flex;align-items:center;justify-content:center;gap:7px;
        }
        .guest-delete-btn:hover{background:#ffe4e0;transform:translate(-1px,-1px);box-shadow:3px 3px 0 rgba(168,75,42,.3);}

        /* MAIN AREA */
        .main-area{
          margin-left:220px;flex:1;
          display:flex;flex-direction:column;
          min-height:100vh;
        }

        /* TOPBAR */
        .topbar{
          height:60px;
          background:rgba(254,249,240,.96);
          backdrop-filter:blur(20px);
          border-bottom:2px solid rgba(26,18,8,.07);
          padding:0 28px;
          display:flex;align-items:center;justify-content:space-between;
          position:sticky;top:0;z-index:100;
          box-shadow:0 2px 0 rgba(26,18,8,.04);
        }
        .topbar-left{display:flex;align-items:center;gap:12px;}
        .topbar-title{font-family:'Fredoka',sans-serif;font-size:20px;font-weight:600;color:#1a1208;}
        .topbar-right{display:flex;align-items:center;gap:10px;}

        /* Streak pill in topbar */
        .streak-pill{
          display:flex;align-items:center;gap:5px;
          background:linear-gradient(135deg,#1a3d28,#2d5a3d);
          border:2px solid #1a1208;border-radius:50px;
          padding:5px 12px;font-size:13px;font-weight:800;color:white;
          box-shadow:2px 2px 0 rgba(26,18,8,.2);
        }

        /* Level badge topbar */
        .level-pill{
          display:flex;align-items:center;gap:6px;
          background:#e8f5ec;border:2px solid #5a8f6a55;border-radius:50px;
          padding:5px 12px;font-size:12px;font-weight:800;color:#1a4a2a;
          box-shadow:2px 2px 0 rgba(61,107,79,.2);
        }

        /* Profile dropdown */
        .profile-btn{
          width:38px;height:38px;border-radius:50%;
          background:linear-gradient(135deg,#5a8f6a,#3d6b4f);
          border:2.5px solid #1a1208;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;font-weight:800;color:white;
          box-shadow:2px 2px 0 rgba(26,18,8,.2);
          transition:transform .12s;position:relative;
        }
        .profile-btn:hover{transform:scale(1.06);}
        .profile-dropdown{
          position:absolute;top:calc(100% + 10px);right:0;
          background:white;border:2.5px solid rgba(26,18,8,.12);
          border-radius:18px;padding:8px;
          box-shadow:6px 6px 0 rgba(26,18,8,.12);
          min-width:200px;z-index:300;
        }
        .dropdown-header{padding:10px 12px 10px;border-bottom:2px dashed rgba(26,18,8,.07);margin-bottom:6px;}
        .dropdown-item{
          display:flex;align-items:center;gap:10px;
          padding:9px 12px;border-radius:12px;
          font-size:13px;font-weight:700;color:#1a1208;
          cursor:pointer;transition:background .12s;
        }
        .dropdown-item:hover{background:#f0f7f3;}
        .dropdown-item.danger{color:#7a2a0a;}
        .dropdown-item.danger:hover{background:#fff3f2;}

        /* CONTENT */
        .page-content{flex:1;overflow-y:auto;}

        /* Particle */
        .particle{
          position:fixed;pointer-events:none;z-index:9999;
          font-size:16px;animation:floatUp .7s ease-out forwards;
        }

        /* MOBILE — hide sidebar, show bottom nav */
        @media(max-width:768px){
          .sidebar{transform:translateX(-100%);}
          .sidebar.mobile-open{transform:translateX(0);}
          .main-area{margin-left:0;}
          .topbar{padding:0 16px;}
          .page-content{padding-bottom:72px;}
        }
        @media(min-width:769px){
          .mobile-overlay{display:none!important;}
          .bottom-nav-bar{display:none!important;}
          .hamburger{display:none!important;}
        }

        /* BOTTOM NAV */
        .bottom-nav-bar{
          display:flex;
          position:fixed;bottom:0;left:0;right:0;z-index:100;
          background:rgba(254,249,240,.97);backdrop-filter:blur(20px);
          border-top:2px solid rgba(26,18,8,.08);
          padding:8px 0 calc(10px + env(safe-area-inset-bottom));
          box-shadow:0 -3px 0 rgba(26,18,8,.04);
        }
        .bnav-item{
          flex:1;display:flex;flex-direction:column;align-items:center;
          gap:3px;padding:4px 0;text-decoration:none;
        }
        .bnav-icon{font-size:20px;line-height:1;}
        .bnav-label{font-size:10px;font-weight:700;}

        /* Mobile overlay */
        .mobile-overlay{
          position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:140;
          backdrop-filter:blur(4px);
        }

        /* Hamburger */
        .hamburger{
          width:36px;height:36px;border-radius:10px;
          background:#e8f5ec;border:2px solid #5a8f6a55;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;font-size:16px;
        }
      `}</style>

      {/* Sparkle particles */}
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.x, top: p.y }}>
          ✨
        </div>
      ))}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="shell">
        {/* ── SIDEBAR ──────────────────────── */}
        <aside className={`sidebar${sidebarOpen ? " mobile-open" : ""}`}>
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-text">
              Loop<span className="logo-accent">less</span>
            </div>
            <div className="logo-tag">Break the cycle 🌱</div>
          </div>

          {/* XP card */}
          <div className="sidebar-xp">
            <div className="xp-label">⚔️ Level {level} Loop Breaker</div>
            <div className="xp-row">
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,.55)",
                }}
              >
                XP Progress
              </span>
              <span className="xp-val">
                {xp}/{xpMax}
              </span>
            </div>
            <div className="xp-bar-bg">
              <div
                className="xp-bar-fill"
                style={{ width: `${(xp / xpMax) * 100}%` }}
              />
            </div>
          </div>

          {/* Nav */}
          <nav className="nav-section">
            <div className="nav-group-label">Main</div>
            {NAV.slice(0, 5).map((item) => (
              <Link key={item.href} href={item.href} onClick={spawnParticles}>
                <div
                  className={`nav-item${isActive(item.href) ? " active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.href === "/checkin" && (
                    <span className="nav-badge">+20 XP</span>
                  )}
                </div>
              </Link>
            ))}
            <div className="nav-group-label" style={{ marginTop: 6 }}>
              Tools
            </div>
            {NAV.slice(5).map((item) => (
              <Link key={item.href} href={item.href} onClick={spawnParticles}>
                <div
                  className={`nav-item${isActive(item.href) ? " active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Bottom user section */}
          <div className="sidebar-bottom">
            <Link href="/profile">
              <div className="user-card">
                <div className="avatar">{initials}</div>
                <div className="user-info">
                  <div className="user-name">{firstName}</div>
                  <div className="user-sub">
                    {isGuest ? "👤 Guest account" : `🔥 ${streak}-day streak`}
                  </div>
                </div>
                <span style={{ fontSize: 14, color: "#a8936a" }}>→</span>
              </div>
            </Link>
            {isGuest && (
              <button className="guest-delete-btn" onClick={handleSignOut}>
                🗑️ Delete guest data
              </button>
            )}
          </div>
        </aside>

        {/* ── MAIN AREA ────────────────────── */}
        <div className="main-area">
          {/* TOPBAR */}
          <header className="topbar">
            <div className="topbar-left">
              {/* Hamburger (mobile only) */}
              <button
                className="hamburger"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                ☰
              </button>
              <div className="topbar-title">
                {NAV.find((n) => isActive(n.href))?.label ?? "Loopless"}
              </div>
            </div>

            <div className="topbar-right">
              {/* Streak pill */}
              <div className="streak-pill">
                <span>🔥</span>
                <span>{streak}</span>
              </div>

              {/* Level pill */}
              <div className="level-pill">
                <span>⚔️</span>
                <span>Lv.{level}</span>
              </div>

              {/* Profile dropdown */}
              <div ref={profileRef} style={{ position: "relative" }}>
                <button
                  className="profile-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  {initials}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#5a8f6a",
                      border: "2px solid white",
                    }}
                  />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="profile-dropdown"
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="dropdown-header">
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: "#1a1208",
                          }}
                        >
                          {rawName}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#a8936a",
                            marginTop: 2,
                          }}
                        >
                          {isGuest
                            ? "Guest account"
                            : (session?.user?.email ?? "")}
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          <span
                            style={{
                              background: "#e8f5ec",
                              border: "1.5px solid #5a8f6a",
                              borderRadius: 50,
                              padding: "3px 10px",
                              fontSize: 10,
                              fontWeight: 800,
                              color: "#3d6b4f",
                            }}
                          >
                            ⚔️ Lv.{level}
                          </span>
                          <span
                            style={{
                              background: "#fdf0ea",
                              border: "1.5px solid #e07b5a",
                              borderRadius: 50,
                              padding: "3px 10px",
                              fontSize: 10,
                              fontWeight: 800,
                              color: "#7a2a0a",
                            }}
                          >
                            🔥 {streak} streak
                          </span>
                        </div>
                      </div>
                      <div
                        className="dropdown-item"
                        onClick={() => {
                          router.push("/profile");
                          setProfileOpen(false);
                        }}
                      >
                        <span>👤</span> Profile
                      </div>
                      <div
                        className="dropdown-item"
                        onClick={() => {
                          router.push("/settings");
                          setProfileOpen(false);
                        }}
                      >
                        <span>⚙️</span> Settings
                      </div>
                      <div
                        className="dropdown-item"
                        onClick={() => {
                          router.push("/progress");
                          setProfileOpen(false);
                        }}
                      >
                        <span>🏅</span> My badges
                      </div>
                      <div
                        style={{
                          height: 1,
                          background: "rgba(26,18,8,.07)",
                          margin: "6px 0",
                        }}
                      />
                      <div
                        className="dropdown-item danger"
                        onClick={handleSignOut}
                      >
                        <span>🚪</span> {isGuest ? "Delete & exit" : "Sign out"}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="page-content">{children}</main>
        </div>
      </div>

      {/* ── BOTTOM NAV (mobile) ─────────── */}
      <nav className="bottom-nav-bar">
        {BOTTOM_NAV.map((item) => {
          const on = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} className="bnav-item">
              <div className="bnav-icon">{item.icon}</div>
              <div
                className="bnav-label"
                style={{ color: on ? "#5a8f6a" : "#a8936a" }}
              >
                {item.label}
              </div>
              {on && (
                <div
                  style={{
                    width: 20,
                    height: 3,
                    borderRadius: 2,
                    background: "#5a8f6a",
                    marginTop: 1,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
