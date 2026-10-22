// ─────────────────────────────────────────────────────────────────────────────
// RealChatRoom.jsx — 1-on-1 Real-Time WebSocket Developer Dating Chat Room
// Telegram / Social Media Chat UX with Live status, Asset & Photo Sharing, and Text Area
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { wsService } from '../../services/websocket.js';
import { soundEngine, createSpeechRecognizer } from '../../utils/audio.js';
import { getRomanticQuotes } from '../../data/romanticLove.js';
import { loadChatHistory, saveChatHistory, clearChatHistory } from '../../utils/storage.js';
import MessageBubble from '../chat/MessageBubble.jsx';
import { IconSend, IconChevronDown, IconChevronUp, IconZap, IconGift } from '../ui/Icons.jsx';
import RealPeerSidebar from './RealPeerSidebar.jsx';
import PartnerProfileModal from './PartnerProfileModal.jsx';

export default function RealChatRoom({
  peer,
  userProfile,
  allOnlinePeers = [],
  onSwitchPeer,
  onLeave,
  onOpenGiftModal,
  lang = 'en',
}) {
  const isAm = lang === 'am';

  // Initialize messages from persistent local storage for this peer
  const [messages, setMessages] = useState(() => {
    if (!peer?.id) return [];
    const saved = loadChatHistory(peer.id);
    if (saved && saved.length > 0) return saved;
    return [
      {
        id: `sys_${Date.now()}`,
        sender: 'system',
        text: isAm
          ? `⚡ የቀጥታ ግንኙነት ተመስርቷል። ከ @${peer.handle} ጋር ውይይት ጀምረዋል!`
          : `⚡ Secure connection established with ${peer.name} (${peer.handle})! Say hi!`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [inputText, setInputText] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceText, setVoiceText] = useState("");
  const [showQuickDropdown, setShowQuickDropdown] = useState(false);
  const [quickTab, setQuickTab] = useState('icebreakers'); // 'icebreakers' | 'quotes' | 'actions'
  const [showMobileStatsDrawer, setShowMobileStatsDrawer] = useState(false);
  const [showPartnerProfileModal, setShowPartnerProfileModal] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [isFriend, setIsFriend] = useState(() => (userProfile?.friends || []).includes(peer?.id));
  const [isLiked, setIsLiked] = useState(false);

  // Asset & Code snippet composer state
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showCodeComposer, setShowCodeComposer] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("TypeScript");

  const feedRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordTimerRef = useRef(null);
  const recognizerRef = useRef(null);

  // Live status: check if peer is currently connected and active
  const isPeerOnline = Boolean(
    peer && (
      peer.status === 'online' ||
      allOnlinePeers.some((p) => p.id === peer.id)
    )
  );

  // Auto-scroll on new message
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, peerTyping]);

  // Load persistent history whenever active peer changes
  useEffect(() => {
    if (peer?.id) {
      const saved = loadChatHistory(peer.id);
      if (saved && saved.length > 0) {
        setMessages(saved);
      } else {
        setMessages([
          {
            id: `sys_${Date.now()}`,
            sender: 'system',
            text: isAm
              ? `⚡ የቀጥታ WebSocket ግንኙነት ተመስርቷል። ከ @${peer.handle} ጋር ውይይት ጀምረዋል!`
              : `⚡ Secure WebSocket connection established with ${peer.name} (${peer.handle})! Say hi!`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    }
  }, [peer?.id, isAm]);

  // Persist messages whenever updated
  useEffect(() => {
    if (peer?.id && messages.length > 0) {
      saveChatHistory(peer.id, messages);
    }
  }, [peer?.id, messages]);

  function handleClearHistory() {
    if (clearConfirm) {
      soundEngine.playHeartbeat();
      clearChatHistory(peer.id);
      setMessages([
        {
          id: `sys_${Date.now()}`,
          sender: 'system',
          text: isAm ? '🗑️ የውይይት ታሪክ ፀድቷል።' : '🗑️ Chat history cleared.',
          timestamp: new Date().toISOString(),
        },
      ]);
      setClearConfirm(false);
    } else {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
    }
  }

  useEffect(() => {
    const unbindMsg = wsService.on('chat:message', (msg) => {
      soundEngine.playMessageBeep();
      const isMe = msg.senderId === (userProfile?.id || 'me');

      setMessages((prev) => {
        // If partner just replied, mark all earlier player messages as seen
        const updatedPrev = !isMe
          ? prev.map((m) => (m.sender === 'player' ? { ...m, status: 'seen' } : m))
          : prev;

        return [
          ...updatedPrev,
          {
            id: msg.id,
            sender: isMe ? 'player' : 'partner',
            text: msg.text,
            timestamp: msg.timestamp,
            isAudio: msg.isAudio,
            audioDuration: msg.audioDuration,
            isGift: msg.isGift,
            gift: msg.gift,
            isImage: msg.isImage,
            imageUrl: msg.imageUrl,
            isCode: msg.isCode,
            codeLang: msg.codeLang,
            senderAvatarUrl: msg.senderAvatarUrl,
            status: isMe ? 'sent' : undefined,
          },
        ];
      });

      // Realistic social media read receipt transitions: sent -> delivered -> seen
      if (isMe) {
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id && m.status === 'sent' ? { ...m, status: 'delivered' } : m))
          );
        }, 500);

        if (isPeerOnline) {
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((m) => (m.id === msg.id ? { ...m, status: 'seen' } : m))
            );
          }, 1400);
        } else {
          // If peer is currently offline, acknowledge delivery and simulate friendly inbox reply
          setTimeout(() => {
            setMessages((prev) => [
              ...prev.map((m) => (m.id === msg.id ? { ...m, status: 'delivered' } : m)),
              {
                id: `offline_ack_${Date.now()}`,
                sender: 'partner',
                text: isAm
                  ? `ሰላም @${userProfile?.handle || 'dev'}! መልእክትዎ ደርሶኛል ✨ አሁን ኮድ ላይ ስለሆንኩ ቆይቼ እመልስልሃለሁ/ሻለሁ!`
                  : `Hey @${userProfile?.handle || 'dev'}! I received your message in my inbox ✨ Deep in a coding session right now, will reply soon!`,
                timestamp: new Date().toISOString(),
                senderAvatarUrl: peer?.avatarUrl || null,
                senderEmoji: peer?.emoji || '👩‍💻',
              },
            ]);
            soundEngine.playRomanticChime();
          }, 2400);
        }
      }
    });

    const unbindTyping = wsService.on('chat:typing', (data) => {
      setPeerTyping(Boolean(data.isTyping));
    });

    // When peer leaves or disconnects: PRESERVE full chat history
    const unbindLeave = wsService.on('room:peer_left', () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys_left_${Date.now()}`,
          sender: 'system',
          text: isAm
            ? `👋 @${peer.handle} ውይይቱን ለቋል/ከመስመር ወጥቷል። የውይይት ታሪክዎ እንደተጠበቀ ይቆያል!`
            : `👋 ${peer.name} has left the session. Your chat history is preserved!`,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    return () => {
      unbindMsg();
      unbindTyping();
      unbindLeave();
    };
  }, [peer, userProfile, isAm, isPeerOnline]);

  // Handle typing debounce
  function handleTextareaChange(e) {
    setInputText(e.target.value);
    wsService.sendTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      wsService.sendTyping(false);
    }, 1200);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  }

  function handleSendText() {
    const text = inputText.trim();
    if (!text) return;

    soundEngine.playHeartbeat();
    wsService.sendTyping(false);
    wsService.sendMessage(text);
    setInputText("");
    setShowQuickDropdown(false);
    setShowAssetMenu(false);
  }

  // Handle Photo / Image Upload Attachment (Telegram style)
  function handleImageSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        soundEngine.playRomanticChime();
        wsService.sendMessage(inputText.trim() || 'Shared a photo 📷', {
          isImage: true,
          imageUrl: dataUrl,
        });
        setInputText("");
        setShowAssetMenu(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // Handle Code Snippet Send
  function handleSendCodeSnippet(e) {
    e?.preventDefault();
    if (!codeSnippet.trim()) return;

    soundEngine.playRomanticChime();
    wsService.sendMessage(codeSnippet.trim(), {
      isCode: true,
      codeLang: codeLanguage,
    });
    setCodeSnippet("");
    setShowCodeComposer(false);
    setShowAssetMenu(false);
  }

  // Voice recording handlers
  function toggleVoiceRecording() {
    if (isRecordingVoice) {
      stopVoiceAndSend();
    } else {
      startVoiceRecording();
    }
  }

  function startVoiceRecording() {
    soundEngine.playMicTone();
    setIsRecordingVoice(true);
    setRecordSeconds(0);
    setVoiceText("");

    recordTimerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);

    const speechLang = lang === 'am' ? 'am-ET' : 'en-US';
    const rec = createSpeechRecognizer({
      lang: speechLang,
      onResult: (t) => setVoiceText(t),
      onError: () => {
        if (!voiceText) {
          setVoiceText(peer?.gender === 'female' ? "Hey beautiful! Sending you a voice note 💖" : "Hey handsome! Sending you a voice note 💖");
        }
      },
    });

    if (rec) {
      try {
        rec.start();
        recognizerRef.current = rec;
      } catch {}
    } else {
      setVoiceText(peer?.gender === 'female' ? "Hey beautiful, thinking of you! ☕💖" : "Hey handsome, thinking of you! ☕💖");
    }
  }

  function stopVoiceAndSend() {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch {}
    }
    setIsRecordingVoice(false);

    const finalVoice = voiceText.trim() || (isAm ? "የኔ ፍቅር፣ የድምፅ መልእክት ልኬልሃለሁ/ሻለሁ 🎙️💖" : "Hey, sending you a warm voice note! 🎙️💖");
    soundEngine.playRomanticChime();
    wsService.sendMessage(finalVoice, { isAudio: true, audioDuration: Math.max(2, recordSeconds) });
    setVoiceText("");
    setRecordSeconds(0);
  }

  function handleSendRomanticQuote(quote) {
    setShowQuickDropdown(false);
    soundEngine.playRomanticChime();
    wsService.sendMessage(`${quote.text} ${quote.devTag}`);
  }

  function handleSendBunna() {
    setShowQuickDropdown(false);
    setShowAssetMenu(false);
    soundEngine.playRomanticChime();
    wsService.sendMessage(
      isAm
        ? `☕ ይሄው ትኩስ የኢትዮጵያ ቡና ላኩልሽ/ህ! ለኮዲንግ ጉልበት ይሁንሽ/ህ ✨`
        : `☕ Sent you a warm cup of Ethiopian Bunna to power through your code! ✨`
    );
  }

  function handleAddFriendAction() {
    setShowQuickDropdown(false);
    setShowAssetMenu(false);
    soundEngine.playGiftFanfare();
    wsService.sendSocialAction('add_friend', peer.id);
    wsService.sendMessage(
      isAm
        ? `👥 በገንቢ ጓደኝነት ዝርዝሬ ውስጥ አካትቼሻለሁ/ሃለሁ! ጓደኛሞች ሆነናል 💖`
        : `👥 I added you to my developer friends list! Let's stay connected and build together 💖`
    );
  }

  function handleSendIcebreaker(text) {
    setShowQuickDropdown(false);
    soundEngine.playRomanticChime();
    wsService.sendMessage(text);
  }

  const quotes = getRomanticQuotes(peer?.gender || 'female', lang);

  // Criteria calculations
  const sharedTech = (peer?.techStack || []).filter((t) =>
    (userProfile?.techStack || ['React', 'TypeScript']).includes(t)
  );
  const sameIndent = peer?.indentation && userProfile?.indentation && peer.indentation === userProfile.indentation;
  const matchScore = Math.min(99, 65 + sharedTech.length * 12 + (sameIndent ? 10 : 0));

  const icebreakers = [
    {
      label: sharedTech.length > 0 ? `Shared ${sharedTech[0]}` : 'Tech Stack',
      text: sharedTech.length > 0
        ? (isAm ? `ሰላም ${peer.name}፣ እኛ ሁለታችንም በ ${sharedTech.join(' እና ')} እንሰራለን! በአሁኑ ሰዓት ምን አይነት ፕሮጀክት እየሰራሽ/ህ ነው? 🚀` : `Hey ${peer.name}! I noticed we both love ${sharedTech.join(' & ')} 🚀 What are you building right now?`)
        : (isAm ? `ሰላም ${peer.name}፣ ወደ ኮዲንግ አለም እንዴት ገባሽ/ህ? ማወቅ ደስ ይለኛል 💻` : `Hey ${peer.name}! What got you into software engineering? Would love to hear your story 💻`),
    },
    {
      label: sameIndent ? 'Indentation Match' : 'Dev Vibe',
      text: sameIndent
        ? (isAm ? `እኛ ሁለታችንም ${peer.indentation} እንመርጣለን! ከኮድ በኋላ ቡና እየጠጣን ብናወራ ደስ ይለኛል ☕✨` : `Great minds think alike! We both use ${peer.indentation} 💻 How about a quick coffee break? ☕`)
        : (isAm ? `ከረጅም ሰዓት ኮዲንግ እና ዲበጊንግ በኋላ እንዴት እራስሽን/ህን ታድሳለሽ/ህ? ☕` : `How do you like to recharge after a long day of debugging code? ☕✨`),
    },
    {
      label: 'Soulmate Connection',
      text: isAm
        ? `የተመዘገበው ካርድሽ/ህ በጣም ሳበኝ! ዛሬ ቀንሽ/ህ እንዴት እያለፈ ነው? 🌸`
        : `Your developer profile caught my attention! How has your day been treating you? 🌸`,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-950 font-mono overflow-hidden select-text">
      {/* Clean, Space-Efficient Room Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md gap-2">
        <div
          onClick={() => setShowPartnerProfileModal(true)}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group hover:bg-slate-900/60 p-1.5 -ml-1 rounded-2xl transition-all border border-transparent hover:border-slate-800"
          title="Click to view full partner profile card & dev info"
        >
          <div className="relative shrink-0">
            <span className="text-xl p-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden w-9 h-9 group-hover:border-cyan-500 transition-all">
              {peer?.avatarUrl ? (
                <img src={peer.avatarUrl} alt={peer.name} className="w-full h-full object-cover" />
              ) : (
                peer?.emoji || (peer?.gender === 'female' ? '👩‍💻' : '👨‍💻')
              )}
            </span>
            {/* Live Indicator: Only shown when peer is active online; otherwise blank */}
            {isPeerOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                {peer.name}
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">{peer.handle}</span>
              
              {/* Live Icon / Badge (Shows if peer is in live, otherwise displays offline inbox info) */}
              {isPeerOnline ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                  Offline · Inbox Active
                </span>
              )}

              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-bold hidden sm:inline">
                {matchScore}% Match
              </span>

              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-600 transition-all flex items-center gap-0.5">
                <span>Profile 👤</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-xs sm:max-w-md">
              {peer.quote ? `"${peer.quote}"` : (peer.bio || `${peer.indentation || 'Tabs'} · ${sharedTech.join(', ') || 'Developer'}`)}
            </p>
          </div>
        </div>

        {/* Action Controls Right: Clean & Uncluttered */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* View Profile Button (Accessible button) */}
          <button
            type="button"
            onClick={() => setShowPartnerProfileModal(true)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-700 transition-colors shadow-sm"
            title="Inspect partner profile and tech details"
          >
            <span>👤</span>
            <span className="hidden sm:inline">Profile</span>
          </button>

          {/* Clear Chat History Button */}
          <button
            type="button"
            onClick={handleClearHistory}
            className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
              clearConfirm
                ? 'bg-red-950 border-red-600 text-red-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-800'
            }`}
            title="Clear saved chat history with this partner"
          >
            <span>{clearConfirm ? (isAm ? 'አረጋግጥ?' : 'Confirm?') : '🗑️'}</span>
          </button>

          {/* Mobile Partner Info Button */}
          <button
            type="button"
            onClick={() => setShowMobileStatsDrawer(true)}
            className="md:hidden flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title="View partner stats & dev details"
          >
            <span>Stats</span>
          </button>

          {/* Leave Button */}
          <button
            type="button"
            onClick={() => {
              wsService.leaveRoom();
              onLeave?.();
            }}
            className="px-2.5 py-1.5 rounded-lg border border-red-900/60 bg-red-950/30 text-red-300 hover:bg-red-950 hover:border-red-700 text-[11px] font-bold transition-all"
            title="Leave Chat Room"
          >
            <span>{isAm ? "ውጣ" : "Leave"}</span>
          </button>
        </div>
      </header>

      {/* Primary Chat Messages Feed: Full Vertical Height */}
      <div
        ref={feedRef}
        className="flex-1 h-full min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2.5"
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.map((m) => {
          if (m.sender === 'system') {
            return (
              <div key={m.id} className="text-center my-2 animate-fade-in">
                <span className="font-mono text-[11px] text-slate-500 bg-slate-900/80 border border-slate-800/80 px-2.5 py-0.5 rounded-full inline-block max-w-full truncate">
                  {m.text}
                </span>
              </div>
            );
          }

          return (
            <MessageBubble
              key={m.id}
              message={m}
              character={peer}
              userProfile={userProfile}
              lang={lang}
            />
          );
        })}

        {/* Real-Time Peer Typing Indicator */}
        {peerTyping && (
          <div className="flex items-center gap-2 px-3 py-1 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-[11px] text-cyan-400">
              {peer.name} is typing...
            </span>
          </div>
        )}
      </div>

      {/* Voice Recording Active Bar */}
      {isRecordingVoice && (
        <div className="p-2.5 bg-red-950/50 border-t border-red-800/60 animate-fade-in flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>REC 0:0{recordSeconds}</span>
            </div>
            <p className="text-xs text-slate-200 truncate max-w-xs">
              {voiceText || (isAm ? "እየሰማሁ ነው..." : "Listening...")}
            </p>
          </div>
          <button
            type="button"
            onClick={stopVoiceAndSend}
            className="px-3 py-1 rounded-lg bg-red-900 border border-red-600 text-xs font-bold text-red-200"
          >
            Send 🎙️
          </button>
        </div>
      )}

      {/* Code Snippet Composer Modal / Drawer */}
      {showCodeComposer && (
        <div className="shrink-0 bg-slate-900 border-t border-slate-800 p-3 shadow-2xl animate-slide-up space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <span>💻</span>
              <span>Share Code Snippet (Telegram Style)</span>
            </span>
            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-cyan-300 text-[11px] rounded px-2 py-0.5 focus:outline-none"
              >
                <option value="TypeScript">TypeScript</option>
                <option value="React JSX">React JSX</option>
                <option value="Python">Python</option>
                <option value="Rust">Rust</option>
                <option value="Go">Go</option>
                <option value="CSS / Tailwind">CSS</option>
              </select>
              <button onClick={() => setShowCodeComposer(false)} className="text-slate-500 hover:text-white text-xs">✕</button>
            </div>
          </div>

          <textarea
            rows={3}
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="// Paste or write code snippet here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-cyan-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCodeComposer(false)}
              className="px-3 py-1 rounded bg-slate-800 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendCodeSnippet}
              disabled={!codeSnippet.trim()}
              className="px-3 py-1 rounded bg-cyan-950 border border-cyan-600 text-xs font-bold text-cyan-300 hover:bg-cyan-900 disabled:opacity-40"
            >
              Send Snippet 🚀
            </button>
          </div>
        </div>
      )}

      {/* Telegram-style Asset Share Menu (Photos, Code, Bunna) */}
      {showAssetMenu && (
        <div className="shrink-0 bg-slate-900 border-t border-slate-800 p-2.5 shadow-2xl animate-slide-up flex flex-wrap items-center gap-2">
          {/* 1. Share Photo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 text-xs text-cyan-300 font-bold transition-colors"
          >
            <span>📷</span>
            <span>Share Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelected}
            className="hidden"
          />

          {/* 2. Share Code Snippet */}
          <button
            type="button"
            onClick={() => {
              setShowCodeComposer(true);
              setShowAssetMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 text-xs text-cyan-300 font-bold transition-colors"
          >
            <span>💻</span>
            <span>Send Code</span>
          </button>

          {/* 3. Send Bunna */}
          <button
            type="button"
            onClick={handleSendBunna}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-600 text-xs text-amber-300 font-bold transition-colors"
          >
            <span>☕</span>
            <span>Send Bunna</span>
          </button>

          {/* 4. Add Friend */}
          <button
            type="button"
            onClick={handleAddFriendAction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-600 text-xs text-indigo-300 font-bold transition-colors"
          >
            <span>👥</span>
            <span>+Friend</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAssetMenu(false)}
            className="ml-auto text-slate-500 hover:text-white text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Space-Saving Quick Prompts Popover (Chevron Collapsible) */}
      {showQuickDropdown && (
        <div className="shrink-0 bg-slate-900 border-t border-slate-800 p-2.5 shadow-2xl animate-slide-up space-y-2">
          {/* Tabs: Icebreakers / Quotes / Actions */}
          <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-800 text-[11px]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQuickTab('icebreakers')}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  quickTab === 'icebreakers' ? 'bg-cyan-950 border border-cyan-700 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Icebreakers
              </button>
              <button
                type="button"
                onClick={() => setQuickTab('quotes')}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  quickTab === 'quotes' ? 'bg-cyan-950 border border-cyan-700 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Quotes
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickDropdown(false)}
              className="text-slate-500 hover:text-white px-1 text-xs"
            >
              ✕
            </button>
          </div>

          {/* Icebreaker List */}
          {quickTab === 'icebreakers' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
              {icebreakers.map((ib, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendIcebreaker(ib.text)}
                  className="text-left p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-600 text-[11px] text-slate-300 hover:text-white transition-all space-y-0.5"
                >
                  <span className="font-bold text-cyan-400 block truncate">{ib.label}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{ib.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quotes List */}
          {quickTab === 'quotes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
              {quotes.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendRomanticQuote(q)}
                  className="text-left p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-600 text-[11px] text-slate-300 hover:text-white transition-all flex items-center justify-between gap-2"
                >
                  <span className="truncate flex-1">{q.text}</span>
                  <span className="text-[10px] text-cyan-400 shrink-0 font-bold">{q.devTag}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Slim Space-Optimized Toolbar (Above Input Bar) */}
      <div className="shrink-0 px-3 py-1 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2 text-slate-400 truncate">
          <span className="text-cyan-400 font-bold">✨</span>
          <span className="truncate">
            {sharedTech.length > 0 ? `Shared ${sharedTech.join(', ')}` : `${peer.indentation || 'Tabs'}`}
          </span>
        </div>

        {/* Chevron Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setShowQuickDropdown((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
            showQuickDropdown
              ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
          title="Toggle quick prompts & romantic quotes"
        >
          <IconZap className="w-3 h-3 text-cyan-400" />
          <span>Quick Prompts</span>
          {showQuickDropdown ? (
            <IconChevronUp className="w-3 h-3" />
          ) : (
            <IconChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Real Text Chat Area Console (Telegram / Social Media Look) */}
      <footer className="border-t border-slate-800 bg-slate-950 p-2 sm:p-2.5 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendText();
          }}
          className="flex items-end gap-1.5 sm:gap-2"
        >
          {/* Telegram-style Attachment Paperclip Button */}
          <button
            type="button"
            onClick={() => setShowAssetMenu((prev) => !prev)}
            className={`font-mono text-base px-2.5 py-2 rounded-lg border transition-all shrink-0 ${
              showAssetMenu
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            title="Attach photo, code snippet, or gift"
          >
            📎
          </button>

          {/* Comfortable Real Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={isAm ? "መልእክት ይተይቡ (Enter ለመላክ)..." : `Message ${peer.name} (Enter to send)...`}
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors resize-none max-h-24 leading-relaxed"
            />
          </div>

          {/* Voice Note Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`font-mono text-xs font-bold px-2.5 py-2 rounded-xl border flex items-center gap-1 transition-all shrink-0 ${
              isRecordingVoice
                ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Send audio voice note"
          >
            <span>🎙️</span>
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`font-mono text-xs font-bold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all shrink-0 ${
              !inputText.trim()
                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-cyan-950 border-cyan-700 text-cyan-300 hover:bg-cyan-900 cursor-pointer shadow-sm'
            }`}
          >
            <IconSend className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </footer>

      {/* Mobile Peer Stats Drawer Overlay */}
      {showMobileStatsDrawer && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm flex justify-start animate-fade-in"
          onClick={() => setShowMobileStatsDrawer(false)}
        >
          <div
            className="w-72 sm:w-80 h-full bg-slate-950 shadow-2xl flex flex-col animate-slide-right border-r border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <RealPeerSidebar
              peer={peer}
              userProfile={userProfile}
              allOnlinePeers={allOnlinePeers}
              onSwitchPeer={(newPeer) => {
                onSwitchPeer?.(newPeer);
                setShowMobileStatsDrawer(false);
              }}
              onWave={(p) => wsService.sendSocialAction('wave', p.id)}
              onLike={(p) => wsService.sendSocialAction('like', p.id)}
              onAddFriend={(p) => wsService.sendSocialAction('add_friend', p.id)}
              onCloseMobile={() => setShowMobileStatsDrawer(false)}
              lang={lang}
            />
          </div>
        </div>
      )}
      {/* In-Depth Partner Profile Modal (Inspect who you're chatting with) */}
      <PartnerProfileModal
        isOpen={showPartnerProfileModal}
        onClose={() => setShowPartnerProfileModal(false)}
        peer={peer}
        userProfile={userProfile}
        isOnline={isPeerOnline}
        onSendBunna={handleSendBunna}
        onAddFriend={() => {
          setIsFriend((prev) => !prev);
          handleAddFriendAction();
        }}
        onLike={() => {
          setIsLiked(true);
          soundEngine.playHeartbeat();
          wsService.sendSocialAction('like', peer.id);
        }}
        onOpenGiftModal={onOpenGiftModal}
        isFriend={isFriend}
        isLiked={isLiked}
        lang={lang}
      />
    </div>
  );
}