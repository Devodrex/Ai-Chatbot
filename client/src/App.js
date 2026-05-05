import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// ─── BACKEND CONFIG ───────────────────────────────────────────────────────────
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  Logo: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" stroke="url(#lg)" strokeWidth="2" />
      <path d="M8 14 Q14 6 20 14 Q14 22 8 14Z" fill="url(#lg)" opacity="0.8" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28">
          <stop offset="0%" stopColor="#00f5ff" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Chat: ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#00f5ff" : "#94a3b8"} strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Bot: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f5ff" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="3" />
      <circle cx="9" cy="13" r="2" fill="#00f5ff" stroke="none" />
      <circle cx="15" cy="13" r="2" fill="#00f5ff" stroke="none" />
      <path d="M12 3v4M9 3h6" />
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  Star: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Zap: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#00f5ff" stroke="none">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Mic: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  ),
  Attach: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  ),
  Info: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Wifi: ({ ok }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ok ? "#4ade80" : "#ef4444"} strokeWidth="2">
      <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
    </svg>
  ),
};

const QUICK_PROMPTS = ["Explain my code", "Fix the bug", "Add a feature", "Optimize this"];

// ─── TYPING DOTS ─────────────────────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "linear-gradient(135deg,#00f5ff,#7c3aed)",
          display: "block",
        }}
        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.9, delay: i * 0.18, repeat: Infinity }}
      />
    ))}
  </div>
);

// ─── GLITCH TEXT ──────────────────────────────────────────────────────────────
const GlitchText = ({ children }) => {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      {glitch && (
        <>
          <span style={{ position: "absolute", top: 0, left: 2, color: "#00f5ff", opacity: 0.7, clipPath: "inset(30% 0 40% 0)" }}>{children}</span>
          <span style={{ position: "absolute", top: 0, left: -2, color: "#7c3aed", opacity: 0.7, clipPath: "inset(60% 0 10% 0)" }}>{children}</span>
        </>
      )}
    </span>
  );
};

// ─── PARTICLE FIELD ───────────────────────────────────────────────────────────
const ParticleField = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    dur: Math.random() * 12 + 8,
    delay: Math.random() * 6,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: "50%",
            background: p.id % 3 === 0 ? "#00f5ff" : p.id % 3 === 1 ? "#7c3aed" : "#a78bfa",
          }}
          animate={{ y: [-20, 20, -20], opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.025 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00f5ff" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

// ─── SCAN LINE ────────────────────────────────────────────────────────────────
const ScanLine = () => (
  <motion.div
    style={{
      position: "fixed", left: 0, right: 0, height: 1,
      background: "linear-gradient(90deg,transparent,#00f5ff33,#00f5ff66,#00f5ff33,transparent)",
      zIndex: 1, pointerEvents: "none",
    }}
    animate={{ top: ["-2%", "102%"] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
  />
);

// ─── MARKDOWN RENDERER ────────────────────────────────────────────────────────
const MdRenderer = ({ content }) => (
  <ReactMarkdown
    components={{
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
          <SyntaxHighlighter
            style={atomDark} language={match[1]} PreTag="div"
            customStyle={{ borderRadius: 10, fontSize: 13, margin: "8px 0", border: "1px solid #00f5ff22" }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code style={{ background: "#00f5ff15", color: "#00f5ff", padding: "2px 6px", borderRadius: 4, fontSize: "0.88em" }} {...props}>
            {children}
          </code>
        );
      },
      p:      ({ children }) => <p style={{ margin: "4px 0", lineHeight: 1.7 }}>{children}</p>,
      strong: ({ children }) => <strong style={{ color: "#e2e8f0", fontWeight: 700 }}>{children}</strong>,
      ul:     ({ children }) => <ul style={{ margin: "6px 0", paddingLeft: 18 }}>{children}</ul>,
      li:     ({ children }) => <li style={{ margin: "3px 0" }}>{children}</li>,
      h1:     ({ children }) => <h1 style={{ fontSize: "1.1em", color: "#00f5ff", marginBottom: 6 }}>{children}</h1>,
      h2:     ({ children }) => <h2 style={{ fontSize: "1em", color: "#a78bfa", marginBottom: 4 }}>{children}</h2>,
      h3:     ({ children }) => <h3 style={{ fontSize: "0.95em", color: "#94a3b8", marginBottom: 4 }}>{children}</h3>,
    }}
  >
    {content}
  </ReactMarkdown>
);

// ─── STATUS DOT ───────────────────────────────────────────────────────────────
const StatusDot = ({ color }) => {
  const hex = color === "green" ? "#4ade80" : color === "amber" ? "#f59e0b" : "#ef4444";
  return (
    <motion.div
      style={{ width: 8, height: 8, borderRadius: "50%", background: hex, boxShadow: `0 0 6px ${hex}`, flexShrink: 0 }}
      animate={color === "green" ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Format a Date to "HH:MM" string.
 */
function fmtTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [message, setMessage]             = useState("");
  const [chat, setChat]                   = useState([]);           // active chat messages
  const [sessionId, setSessionId]         = useState(null);         // active backend session id
  const [isStreaming, setIsStreaming]      = useState(false);
  const [backendStatus, setBackendStatus] = useState("connecting"); // "connecting"|"online"|"offline"
  const [searchQuery, setSearchQuery]     = useState("");
  const [showInfo, setShowInfo]           = useState(true);

  /**
   * sessions: Array<{
   *   id: string,          // backend sessionId
   *   title: string,
   *   preview: string,
   *   time: string,        // "HH:MM"
   *   messages: Message[], // full chat history for this session
   * }>
   */
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null); // id of active session

  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  // ── Shared: fetch all sessions from backend and update sidebar ───────────
  const loadSessions = async () => {
    try {
      const all = await axios.get(`${BASE_URL}/sessions`);
      setSessions((prev) =>
        all.data.map((s) => ({
          id: s.id,
          title: s.title,
          preview: s.preview,
          time: fmtTime(new Date()),
          messages: prev.find((p) => p.id === s.id)?.messages ?? [],
        }))
      );
    } catch (err) {
      console.error("❌ Failed to load sessions:", err.message);
    }
  };

  // ── 1. Create initial session + load all existing sessions from backend ─
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Create a fresh session for this visit
        const res = await axios.post(`${BASE_URL}/session`);
        const newId = res.data.sessionId;

        setSessionId(newId);
        setActiveSession(newId);
        setBackendStatus("online");

        // 2. Load all existing sessions; prepend new one if not already present
        const all = await axios.get(`${BASE_URL}/sessions`);
        const formatted = all.data.map((s) => ({
          id: s.id,
          title: s.title,
          preview: s.preview,
          time: fmtTime(new Date()),
          messages: [],
        }));

        if (!formatted.some((s) => s.id === newId)) {
          formatted.unshift({
            id: newId,
            title: "New chat",
            preview: "No messages yet",
            time: fmtTime(new Date()),
            messages: [],
          });
        }

        setSessions(formatted);
      } catch (err) {
        console.error("❌ Backend unreachable:", err.message);
        setBackendStatus("offline");
      }
    };
    init();
  }, []);

  // ── 2. Auto scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);



  // ── 4. Send message (non-streaming — backend returns { reply }) ──────────
  const sendMessage = async (overrideMsg) => {
    const text = (overrideMsg ?? message).trim();
    if (!text || isStreaming || backendStatus === "offline") return;

    setMessage("");
    setIsStreaming(true);

    const ts = fmtTime(new Date());

    // Optimistically add user message + loading bot placeholder
    setChat((prev) => [
      ...prev,
      { role: "user", text, ts },
      { role: "assistant", text: "", streaming: true, ts },
    ]);

    try {
      const res = await axios.post(`${BASE_URL}/chat-stream`, {
        message: text,
        sessionId,
      });

      // Replace bot placeholder with real reply
      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: res.data.reply,
          streaming: false,
          ts,
        };
        return updated;
      });

      // Update session message cache so revisiting is instant
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [
                  ...(s.messages || []),
                  { role: "user", text, ts },
                  { role: "assistant", text: res.data.reply, ts },
                ],
              }
            : s
        )
      );

    } catch (err) {
      console.error("❌ Chat error:", err.message);

      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: "⚠️ **Connection error.** Make sure your server is running.",
          streaming: false,
          isError: true,
          ts,
        };
        return updated;
      });
    }

    setIsStreaming(false);

    // Refresh sidebar — active session floats to top, cached messages preserved
    try {
      const all = await axios.get(`${BASE_URL}/sessions`);
      setSessions((prev) => {
        const updated = all.data.map((s) => ({
          id: s.id,
          title: s.title,
          preview: s.preview,
          time: fmtTime(new Date()),
          messages: prev.find((p) => p.id === s.id)?.messages ?? [],
        }));
        const active = updated.find((s) => s.id === sessionId);
        const rest   = updated.filter((s) => s.id !== sessionId);
        return active ? [active, ...rest] : updated;
      });
    } catch (_) {}

    setTimeout(() => inputRef.current?.focus(), 80);
  };

  // ── 5. Keys: Enter sends, Shift+Enter = newline ─────────────────────────
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── 6. Click a session in the sidebar → fetch history from backend ──────
  const loadSession = async (sess) => {
    if (sess.id === activeSession) return;

    // If already cached, skip the network call
    if (sess.messages && sess.messages.length > 0) {
      setActiveSession(sess.id);
      setSessionId(sess.id);
      setChat(sess.messages);
      setTimeout(() => inputRef.current?.focus(), 80);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/sessions/${sess.id}`);

      const formatted = res.data.map((m) => ({
        role: m.role,
        text: m.content,
        ts: m.createdAt ? fmtTime(new Date(m.createdAt)) : fmtTime(new Date()),
      }));

      setActiveSession(sess.id);
      setSessionId(sess.id);
      setChat(formatted);

      // Cache into session list so repeat clicks are instant
      setSessions((prev) =>
        prev.map((s) => s.id === sess.id ? { ...s, messages: formatted } : s)
      );
    } catch (err) {
      console.error("Failed to load session:", err.message);
    }

    setTimeout(() => inputRef.current?.focus(), 80);
  };

  // ── 7. New chat → fresh backend session ────────────────────────────────
  const newChat = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/session`);
      const newId = res.data.sessionId;

      const newSess = {
        id: newId,
        title: "New chat",
        preview: "No messages yet",
        time: fmtTime(new Date()),
        messages: [],
      };

      // Prepend to session list so it appears at the top
      setSessions((prev) => [newSess, ...prev]);
      setActiveSession(newId);
      setSessionId(newId);
      setChat([]);
      setBackendStatus("online");
    } catch {
      setBackendStatus("offline");
    }
  };

  // ── 8. Delete session ───────────────────────────────────────────────────
  const deleteSession = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/sessions/${id}`);
    } catch (err) {
      console.error("Failed to delete session:", err.message);
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (id === sessionId) {
      setChat([]);
      setSessionId(null);
      setActiveSession(null);
    }
  };

  // ── 9. Rename session ───────────────────────────────────────────────────
  const renameSession = async (id) => {
    const newTitle = prompt("Enter new name:");
    if (!newTitle) return;
    try {
      await axios.put(`${BASE_URL}/sessions/${id}`, { title: newTitle });
    } catch (err) {
      console.error("Failed to rename session:", err.message);
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  // ── Derived ─────────────────────────────────────────────────────────────
  const msgCount      = chat.filter((m) => m.role === "user").length;
  const tokenEstimate = Math.round(chat.reduce((a, m) => a + (m.text?.length || 0), 0) / 4);
  const statusColor   = backendStatus === "online" ? "green" : backendStatus === "connecting" ? "amber" : "red";
  const statusLabel   = backendStatus === "online"
    ? `Connected · ${sessionId?.slice(0, 6)}…`
    : backendStatus === "connecting" ? "Connecting…"
    : "Backend offline";

  // ─── STYLES ──────────────────────────────────────────────────────────────
  const S = {
    root: {
      display: "flex", height: "100vh", overflow: "hidden",
      background: "#060b14",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      color: "#e2e8f0", position: "relative",
    },
    leftNav: {
      width: 72, flexShrink: 0, display: "flex", flexDirection: "column",
      alignItems: "center", padding: "20px 0", gap: 8, zIndex: 10,
      background: "rgba(6,11,20,0.9)", borderRight: "1px solid rgba(0,245,255,0.08)",
    },
    navBtn: (active) => ({
      width: 44, height: 44, borderRadius: 14,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: active ? "rgba(0,245,255,0.12)" : "transparent",
      border: active ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent",
      cursor: "pointer", transition: "all 0.2s",
    }),
    sessionPanel: {
      width: 280, flexShrink: 0, display: "flex", flexDirection: "column",
      borderRight: "1px solid rgba(0,245,255,0.07)",
      background: "rgba(8,14,26,0.85)", backdropFilter: "blur(20px)", zIndex: 9,
    },
    sessHead: {
      padding: "20px 16px 12px",
      borderBottom: "1px solid rgba(0,245,255,0.06)",
    },
    searchBox: {
      display: "flex", alignItems: "center", gap: 8,
      background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.1)",
      borderRadius: 12, padding: "8px 12px", marginTop: 12,
    },
    searchInput: {
      flex: 1, background: "none", border: "none", outline: "none",
      color: "#94a3b8", fontSize: 13,
    },
    sessItem: (active) => ({
      padding: "12px 16px", cursor: "pointer", transition: "all 0.2s",
      background: active ? "rgba(0,245,255,0.06)" : "transparent",
      borderLeft: `2px solid ${active ? "#00f5ff" : "transparent"}`,
      display: "flex", flexDirection: "column", gap: 4,
    }),
    mainArea: {
      flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
      background: "rgba(6,11,20,0.6)", backdropFilter: "blur(10px)",
      position: "relative", zIndex: 8,
    },
    chatHeader: {
      padding: "0 24px", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid rgba(0,245,255,0.07)",
      background: "rgba(8,14,26,0.7)", backdropFilter: "blur(20px)", flexShrink: 0,
    },
    chatScroll: {
      flex: 1, overflowY: "auto", padding: "24px",
      scrollbarWidth: "thin", scrollbarColor: "#1e2a3a transparent",
    },
    userBubble: {
      maxWidth: "68%", marginLeft: "auto", marginBottom: 20,
      background: "linear-gradient(135deg,rgba(124,58,237,0.4),rgba(0,245,255,0.2))",
      border: "1px solid rgba(0,245,255,0.2)",
      borderRadius: "18px 4px 18px 18px", padding: "12px 16px",
      fontSize: 14, lineHeight: 1.65, backdropFilter: "blur(10px)",
      boxShadow: "0 4px 24px rgba(0,245,255,0.1)",
    },
    botBubble: (isError) => ({
      maxWidth: "78%", marginRight: "auto", marginBottom: 20,
      background: isError ? "rgba(239,68,68,0.08)" : "rgba(0,245,255,0.04)",
      border: `1px solid ${isError ? "rgba(239,68,68,0.25)" : "rgba(0,245,255,0.1)"}`,
      borderRadius: "4px 18px 18px 18px", padding: "12px 16px",
      fontSize: 14, lineHeight: 1.65, backdropFilter: "blur(10px)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
    }),
    inputArea: {
      padding: "16px 24px", borderTop: "1px solid rgba(0,245,255,0.07)",
      background: "rgba(8,14,26,0.8)", backdropFilter: "blur(20px)", flexShrink: 0,
    },
    quickChips: { display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" },
    chip: {
      padding: "5px 12px", borderRadius: 20, fontSize: 12,
      background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)",
      color: "#64748b", cursor: "pointer", transition: "all 0.2s",
    },
    inputRow: {
      display: "flex", gap: 10, alignItems: "flex-end",
      background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.12)",
      borderRadius: 16, padding: "10px 12px",
    },
    textarea: {
      flex: 1, background: "none", border: "none", outline: "none",
      resize: "none", color: "#e2e8f0", fontSize: 14, lineHeight: 1.6,
      maxHeight: 120, fontFamily: "inherit",
    },
    sendBtn: (ready) => ({
      width: 38, height: 38, borderRadius: 12, border: "none",
      cursor: ready ? "pointer" : "not-allowed",
      background: ready ? "linear-gradient(135deg,#00f5ff,#7c3aed)" : "rgba(0,245,255,0.08)",
      color: ready ? "#060b14" : "#334155",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, transition: "all 0.2s",
      boxShadow: ready ? "0 0 20px rgba(0,245,255,0.3)" : "none",
    }),
    infoPanel: {
      width: 280, flexShrink: 0, overflowY: "auto",
      background: "rgba(8,14,26,0.85)", backdropFilter: "blur(20px)",
      borderLeft: "1px solid rgba(0,245,255,0.07)",
      padding: "20px 16px", zIndex: 9, scrollbarWidth: "thin",
    },
    infoSection: {
      marginBottom: 20,
      background: "rgba(0,245,255,0.03)",
      border: "1px solid rgba(0,245,255,0.08)",
      borderRadius: 14, padding: 14,
    },
    infoLabel: { fontSize: 11, color: "#334155", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 },
    statRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>
      <ParticleField />
      <ScanLine />

      {/* ── LEFT NAV ──────────────────────────────────────────────── */}
      <motion.div style={S.leftNav} initial={{ x: -80 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
        <motion.div style={{ marginBottom: 16 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Icon.Logo />
        </motion.div>

        <StatusDot color={statusColor} />

        {["Chat", "Star", "Zap", "Info"].map((name, i) => (
          <motion.div key={name} style={S.navBtn(i === 0)}
            whileHover={{ scale: 1.05, background: "rgba(0,245,255,0.08)" }}
            whileTap={{ scale: 0.95 }}>
            {name === "Chat" ? <Icon.Chat active /> :
             name === "Star" ? <Icon.Star /> :
             name === "Zap"  ? <Icon.Zap />  : <Icon.Info />}
          </motion.div>
        ))}

        <div style={{ marginTop: "auto" }}>
          <motion.div style={{
            width: 38, height: 38, borderRadius: 12,
            background: "linear-gradient(135deg,#7c3aed,#00f5ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
            border: "2px solid rgba(0,245,255,0.3)",
          }} whileHover={{ scale: 1.05 }}>Y</motion.div>
        </div>
      </motion.div>

      {/* ── SESSION LIST ───────────────────────────────────────────── */}
      <motion.div style={S.sessionPanel} initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}>

        <div style={S.sessHead}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px" }}>
              <GlitchText>Neural AI</GlitchText>
            </span>

            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 10,
              background: backendStatus === "online" ? "rgba(74,222,128,0.1)" : backendStatus === "connecting" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
              color: backendStatus === "online" ? "#4ade80" : backendStatus === "connecting" ? "#f59e0b" : "#ef4444",
              border: `1px solid ${backendStatus === "online" ? "rgba(74,222,128,0.25)" : backendStatus === "connecting" ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`,
              letterSpacing: 0.5,
            }}>
              {backendStatus === "online" ? "ONLINE" : backendStatus === "connecting" ? "CONNECTING" : "OFFLINE"}
            </span>
          </div>

          <p style={{ fontSize: 12, color: "#334155", margin: "0 0 0 0", display: "flex", alignItems: "center", gap: 5 }}>
            <Icon.Wifi ok={backendStatus === "online"} /> {statusLabel}
          </p>

          <div style={S.searchBox}>
            <Icon.Search />
            <input placeholder="Search chats…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} style={S.searchInput} />
          </div>
        </div>

        {/* New chat */}
        <div style={{ padding: "10px 16px" }}>
          <motion.button onClick={newChat}
            style={{
              width: "100%", padding: "9px 0", borderRadius: 10,
              border: "1px solid rgba(0,245,255,0.2)",
              background: "rgba(0,245,255,0.06)", color: "#00f5ff",
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
            whileHover={{ background: "rgba(0,245,255,0.12)", boxShadow: "0 0 16px rgba(0,245,255,0.15)" }}
            whileTap={{ scale: 0.97 }}
          >+ New Chat</motion.button>
        </div>

        <div style={{ padding: "6px 16px 4px", fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: 1 }}>
          Recent
        </div>

        {/* ── REAL SESSION LIST ── */}
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
          <AnimatePresence>
            {sessions
              .filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((s, i) => (
                <motion.div
                  key={s.id}
                  style={S.sessItem(activeSession === s.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => loadSession(s)}
                  whileHover={{ background: "rgba(0,245,255,0.04)" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: activeSession === s.id ? "#e2e8f0" : "#94a3b8",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      maxWidth: 130,
                    }}>
                      {s.title}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); renameSession(s.id); }}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          padding: "2px 4px", borderRadius: 6, fontSize: 12,
                          color: "#334155", lineHeight: 1,
                        }}
                        whileHover={{ color: "#94a3b8", background: "rgba(0,245,255,0.08)" }}
                        title="Rename"
                      >✏️</motion.button>
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          padding: "2px 4px", borderRadius: 6, fontSize: 12,
                          color: "#334155", lineHeight: 1,
                        }}
                        whileHover={{ color: "#ef4444", background: "rgba(239,68,68,0.08)" }}
                        title="Delete"
                      >🗑</motion.button>
                      <span style={{ fontSize: 10, color: "#334155", marginLeft: 2 }}>{s.time}</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, color: "#334155",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {s.preview}
                  </span>
                </motion.div>
              ))}
          </AnimatePresence>

          {/* Empty state for session list */}
          {sessions.length === 0 && (
            <div style={{ padding: "20px 16px", fontSize: 12, color: "#334155", textAlign: "center" }}>
              No sessions yet
            </div>
          )}
        </div>

        {/* Pro card */}
        <motion.div style={{
          margin: 12, padding: 14, borderRadius: 14,
          background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(0,245,255,0.1))",
          border: "1px solid rgba(124,58,237,0.3)",
        }} whileHover={{ scale: 1.01 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Icon.Zap />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>Neural Pro</span>
          </div>
          <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 8px" }}>Unlock extended context & priority inference</p>
          <motion.button style={{
            width: "100%", padding: "7px 0", borderRadius: 8, border: "none",
            background: "linear-gradient(135deg,#7c3aed,#00f5ff)",
            color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }} whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.97 }}>Upgrade ↗</motion.button>
        </motion.div>
      </motion.div>

      {/* ── MAIN CHAT ──────────────────────────────────────────────── */}
      <div style={S.mainArea}>

        {/* Chat header */}
        <motion.div style={S.chatHeader} initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg,#060b14,#0d1b2e)",
                border: "2px solid rgba(0,245,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><Icon.Bot /></div>
              <motion.div style={{
                position: "absolute", bottom: -1, right: -1,
                width: 10, height: 10, borderRadius: "50%",
                background: backendStatus === "online" ? "#4ade80" : "#ef4444",
                border: "2px solid #060b14",
              }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>AI Assistant</div>
              <div style={{ fontSize: 11, color: backendStatus === "online" ? "#4ade80" : "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
                <span>●</span>
                <span>
                  {isStreaming
                    ? "Generating…"
                    : backendStatus === "online"
                    ? "LLaMA 3 · Groq API"
                    : "Backend offline — run server.js"}
                </span>
              </div>
            </div>
          </div>
          <motion.button onClick={() => setShowInfo((v) => !v)}
            style={{
              background: showInfo ? "rgba(0,245,255,0.1)" : "none",
              border: "1px solid rgba(0,245,255,0.15)", borderRadius: 8,
              padding: "6px 10px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 12,
            }}
            whileHover={{ background: "rgba(0,245,255,0.08)" }}>
            <Icon.Info /> Info
          </motion.button>
        </motion.div>

        {/* Offline error banner */}
        <AnimatePresence>
          {backendStatus === "offline" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                background: "rgba(239,68,68,0.08)", borderBottom: "1px solid rgba(239,68,68,0.2)",
                padding: "10px 24px", fontSize: 13, color: "#fca5a5", flexShrink: 0,
              }}
            >
              ⚠️ Cannot reach <code style={{ color: "#f87171" }}>localhost:5000</code> — run{" "}
              <code style={{ color: "#f87171" }}>node server/server.js</code> then{" "}
              <code style={{ color: "#f87171" }}>node server.js</code>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat scroll */}
        <div style={S.chatScroll}>

          {/* Empty state */}
          {chat.length === 0 && (
            <motion.div style={{ textAlign: "center", padding: "60px 20px" }}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <motion.div style={{ fontSize: 56, marginBottom: 16 }}
                animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>⚡</motion.div>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 8, color: "#e2e8f0" }}>
                <GlitchText>Ready to think together</GlitchText>
              </h2>
              <p style={{ color: "#334155", fontSize: 14, maxWidth: 380, margin: "0 auto 24px" }}>
                {backendStatus === "offline"
                  ? "⚠️ Backend is offline. Start your server first."
                  : "Your local AI with streaming memory. Ask anything — code, ideas, debug, explain."}
              </p>
              {backendStatus === "online" && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  {["Explain async/await in React", "How does session memory work?", "Write a glassmorphism CSS snippet", "Debug my streaming code"].map((q) => (
                    <motion.button key={q} onClick={() => sendMessage(q)}
                      style={{
                        padding: "9px 14px", borderRadius: 12,
                        border: "1px solid rgba(0,245,255,0.15)",
                        background: "rgba(0,245,255,0.04)", color: "#64748b",
                        fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                      }}
                      whileHover={{ borderColor: "rgba(0,245,255,0.35)", color: "#94a3b8", background: "rgba(0,245,255,0.08)" }}
                      whileTap={{ scale: 0.97 }}>
                      {q}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {chat.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 4 }}>

                <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginBottom: 5,
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 8,
                    background: msg.role === "user" ? "rgba(124,58,237,0.3)" : "rgba(0,245,255,0.1)",
                    border: `1px solid ${msg.role === "user" ? "rgba(124,58,237,0.4)" : "rgba(0,245,255,0.2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {msg.role === "user" ? <Icon.User /> : <Icon.Bot />}
                  </div>
                  <span style={{ fontSize: 11, color: "#334155" }}>
                    {msg.role === "user" ? "You" : "Neural AI"} · {msg.ts}
                  </span>
                </div>

                <div style={msg.role === "user" ? S.userBubble : S.botBubble(msg.isError)}>
                  {msg.streaming && msg.text === "" ? (
                    <TypingDots />
                  ) : msg.role === "assistant" ? (
                    <MdRenderer content={msg.text} />
                  ) : (
                    <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
                  )}

                  {msg.streaming && msg.text !== "" && (
                    <motion.span
                      style={{ display: "inline-block", width: 2, height: 14, background: "#00f5ff", borderRadius: 1, marginLeft: 3, verticalAlign: "middle" }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div style={S.inputArea}>
          {chat.length > 0 && (
            <div style={S.quickChips}>
              {QUICK_PROMPTS.map((q) => (
                <motion.button key={q}
                  onClick={() => { setMessage(q); inputRef.current?.focus(); }}
                  style={S.chip}
                  whileHover={{ borderColor: "rgba(0,245,255,0.35)", color: "#94a3b8" }}>
                  {q}
                </motion.button>
              ))}
            </div>
          )}
          <div style={S.inputRow}>
            <motion.button whileHover={{ scale: 1.1 }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
              <Icon.Attach />
            </motion.button>
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={
                backendStatus === "offline"   ? "Backend offline — start server.js first…" :
                isStreaming                   ? "Generating response…" :
                                               "Message Neural AI…  (Enter ↵ to send)"
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKey}
              disabled={backendStatus === "offline" || isStreaming}
              style={{
                ...S.textarea,
                opacity: backendStatus === "offline" || isStreaming ? 0.45 : 1,
                cursor: backendStatus === "offline" || isStreaming ? "not-allowed" : "text",
              }}
            />
            <motion.button whileHover={{ scale: 1.1 }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
              <Icon.Mic />
            </motion.button>
            <motion.button
              onClick={() => sendMessage()}
              disabled={!message.trim() || isStreaming || backendStatus !== "online"}
              style={S.sendBtn(!!message.trim() && !isStreaming && backendStatus === "online")}
              whileHover={message.trim() && !isStreaming && backendStatus === "online"
                ? { scale: 1.06, boxShadow: "0 0 28px rgba(0,245,255,0.5)" } : {}}
              whileTap={message.trim() && !isStreaming && backendStatus === "online" ? { scale: 0.94 } : {}}>
              {isStreaming ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ display: "inline-block", fontSize: 16 }}>⟳</motion.span>
              ) : (
                <Icon.Send />
              )}
            </motion.button>
          </div>
          <p style={{ fontSize: 11, color: "#1e2a3a", textAlign: "center", margin: "8px 0 0" }}>
            Enter to send · Shift+Enter for new line · Powered by Groq (LLaMA 3)
          </p>
        </div>
      </div>

      {/* ── INFO PANEL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showInfo && (
          <motion.div style={S.infoPanel}
            initial={{ x: 280, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: 280, opacity: 0 }} transition={{ duration: 0.3 }}>

            <div style={S.infoSection}>
              <div style={S.infoLabel}>Connection</div>
              <div style={S.statRow}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Backend</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <StatusDot color={statusColor} />
                  <span style={{ fontSize: 12, color: backendStatus === "online" ? "#4ade80" : "#ef4444", fontWeight: 600 }}>
                    {backendStatus === "online" ? "Online" : backendStatus === "connecting" ? "Connecting" : "Offline"}
                  </span>
                </div>
              </div>
              <div style={S.statRow}>
                <span style={{ fontSize: 12, color: "#64748b" }}>URL</span>
                <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>:5000</span>
              </div>
              <div style={S.statRow}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Session</span>
                <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>
                  {sessionId ? `${sessionId.slice(0, 8)}…` : "—"}
                </span>
              </div>
            </div>

            <div style={S.infoSection}>
              <div style={S.infoLabel}>Model Info</div>
              <div style={S.statRow}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Model</span>
                <span style={{ fontSize: 12, color: "#00f5ff", fontWeight: 600 }}>LLaMA 3</span>
              </div>
              <div style={S.statRow}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Backend</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Groq API</span>
              </div>
              <div style={S.statRow}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Streaming</span>
                <span style={{ fontSize: 12, color: isStreaming ? "#f59e0b" : "#4ade80" }}>
                  {isStreaming ? "Active ●" : "Ready ●"}
                </span>
              </div>
              <div style={S.statRow}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Memory</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Last 10 msgs</span>
              </div>
            </div>

            <div style={S.infoSection}>
              <div style={S.infoLabel}>Session Stats</div>
              <div style={S.statRow}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Messages</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{msgCount} sent</span>
              </div>
              <div style={S.statRow}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Est. tokens</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>~{tokenEstimate}</span>
              </div>
              <div style={S.statRow}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Total sessions</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{sessions.length}</span>
              </div>
            </div>

            <div style={S.infoSection}>
              <div style={S.infoLabel}>Activity</div>
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 40 }}>
                {Array.from({ length: 14 }, (_, i) => {
                  const h = Math.random() * 100;
                  return (
                    <motion.div key={i}
                      style={{ flex: 1, borderRadius: 3, background: i === 13 ? "rgba(0,245,255,0.6)" : "rgba(0,245,255,0.12)" }}
                      initial={{ height: 4 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.04, duration: 0.5 }}
                    />
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "#1e2a3a" }}>14 days ago</span>
                <span style={{ fontSize: 10, color: "#1e2a3a" }}>Today</span>
              </div>
            </div>

            <div style={S.infoSection}>
              <div style={S.infoLabel}>Stack</div>
              {["React + Framer", "Node / Express", "Groq LLaMA 3", "Session Memory", "Groq API"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00f5ff", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#64748b" }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={S.infoSection}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={S.infoLabel}>Notes</div>
                <Icon.ChevronDown />
              </div>
              <p style={{ fontSize: 12, color: "#334155", lineHeight: 1.6, margin: 0 }}>
                Local inference. No data leaves your machine. Session memory resets on new chat.
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}