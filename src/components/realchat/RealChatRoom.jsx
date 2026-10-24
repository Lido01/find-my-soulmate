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
  const [isFollowing, setIsFollowing] = useState(() => (userProfile?.following || []).includes(peer?.id));
  const [isLiked, setIsLiked] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

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
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);

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

  // Load persistent history whenever active peer changes (from localStorage & backend database)
  useEffect(() => {
    if (!peer?.id) return;

    // 1. Initial load from local cache
    const saved = loadChatHistory(peer.id);
    if (saved && saved.length > 0) {
      setMessages(saved);
    } else {
      setMessages([
        {
          id: `sys_${Date.now()}`,
          sender: 'system',
          text: isAm
            ? `⚡ የቀጥታ ግንኙነት ተመስርቷል። ከ @${peer.handle} ጋር ውይይት ጀምረዋል!`
            : `⚡ Secure connection established with ${peer.name} (${peer.handle})! Say hi!`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    // 2. Fetch server database history to sync across devices/refreshes
    if (userProfile?.id) {
      wsService.fetchMessages(userProfile.id, peer.id).then((serverMsgs) => {
        if (serverMsgs && serverMsgs.length > 0) {
          setMessages((prev) => {
            const map = new Map();
            for (const m of prev) map.set(m.id, m);
            for (const sm of serverMsgs) {
              const isMe = sm.senderId === userProfile.id;
              map.set(sm.id, {
                ...sm,
                sender: isMe ? 'player' : 'partner',
              });
            }
            const merged = Array.from(map.values());
            saveChatHistory(peer.id, merged);
            return merged;
          });
        }
      });
    }
  }, [peer?.id, userProfile?.id, isAm]);

  // Persist messages whenever updated
  useEffect(() => {
    if (peer?.id && messages.length > 0) {
      saveChatHistory(peer.id, messages);
    }
  }, [peer?.id, messages]);

  // Send seen notification to partner for unread messages when opening chat
  useEffect(() => {
    if (peer?.id && messages.length > 0) {
      const unreadPartnerMsgs = messages
        .filter((m) => m.sender === 'partner' && m.status !== 'seen')
        .map((m) => m.id);
      if (unreadPartnerMsgs.length > 0) {
        wsService.sendSeen(peer.id, unreadPartnerMsgs);
        setMessages((prev) =>
          prev.map((m) => (m.sender === 'partner' && m.status !== 'seen' ? { ...m, status: 'seen' } : m))
        );
      }
    }
  }, [peer?.id, messages.length]);

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
    // 1. Incoming Message
    const unbindMsg = wsService.on('chat:message', (msg) => {
      soundEngine.playMessageBeep();
      const isMe = msg.senderId === (userProfile?.id || 'me');

      setMessages((prev) => {
        // Prevent duplicate
        if (prev.some((m) => m.id === msg.id)) return prev;

        const newMsg = {
          id: msg.id,
          sender: isMe ? 'player' : 'partner',
          senderName: msg.senderName,
          text: msg.text,
          timestamp: msg.timestamp,
          replyTo: msg.replyTo,
          isAudio: msg.isAudio,
          audioUrl: msg.audioUrl,
          audioDuration: msg.audioDuration,
          isGift: msg.isGift,
          gift: msg.gift,
          isImage: msg.isImage,
          imageUrl: msg.imageUrl,
          isCode: msg.isCode,
          codeLang: msg.codeLang,
          senderAvatarUrl: msg.senderAvatarUrl,
          status: isMe ? (isPeerOnline ? 'delivered' : 'sent') : undefined,
        };

        // If from partner, send immediate seen receipt back to partner
        if (!isMe && peer?.id) {
          wsService.sendSeen(peer.id, [msg.id]);
        }

        return [...prev, newMsg];
      });
    });

    // 2. Real Read Receipt (chat:seen from peer)
    const unbindSeen = wsService.on('chat:seen', (data) => {
      if (data.readerId === peer?.id || data.peerId === userProfile?.id) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.sender === 'player') {
              if (!data.messageIds?.length || data.messageIds.includes(m.id)) {
                return { ...m, status: 'seen' };
              }
            }
            return m;
          })
        );
      }
    });

    // 3. Conversation History Sync from WebSocket
    const unbindHistory = wsService.on('chat:history', (data) => {
      if (data.peerId === peer?.id && Array.isArray(data.messages)) {
        setMessages((prev) => {
          const map = new Map();
          for (const m of prev) map.set(m.id, m);
          for (const sm of data.messages) {
            const isMe = sm.senderId === userProfile?.id;
            map.set(sm.id, {
              ...sm,
              sender: isMe ? 'player' : 'partner',
            });
          }
          const merged = Array.from(map.values());
          saveChatHistory(peer.id, merged);
          return merged;
        });
      }
    });

    // 4. Typing indicator
    const unbindTyping = wsService.on('chat:typing', (data) => {
      setPeerTyping(Boolean(data.isTyping));
    });

    return () => {
      unbindMsg();
      unbindSeen();
      unbindHistory();
      unbindTyping();
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

    const replyPayload = replyingTo ? {
      id: replyingTo.id,
      senderName: replyingTo.sender === 'player' ? (userProfile?.name || 'Me') : peer.name,
      text: replyingTo.text || (replyingTo.isImage ? 'Photo' : 'Attachment'),
    } : null;

    wsService.sendMessage(text, {
      replyTo: replyPayload,
      targetUserId: peer.id,
    });

    setInputText("");
    setReplyingTo(null);
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
        const replyPayload = replyingTo ? {
          id: replyingTo.id,
          senderName: replyingTo.sender === 'player' ? (userProfile?.name || 'Me') : peer.name,
          text: replyingTo.text,
        } : null;

        wsService.sendMessage(inputText.trim() || 'Shared a photo 📷', {
          isImage: true,
          imageUrl: dataUrl,
          targetUserId: peer.id,
          replyTo: replyPayload,
        });

        setInputText("");
        setReplyingTo(null);
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
    const replyPayload = replyingTo ? {
      id: replyingTo.id,
      senderName: replyingTo.sender === 'player' ? (userProfile?.name || 'Me') : peer.name,
      text: replyingTo.text,
    } : null;

    wsService.sendMessage(codeSnippet.trim(), {
      isCode: true,
      codeLang: codeLanguage,
      targetUserId: peer.id,
      replyTo: replyPayload,
    });

    setCodeSnippet("");
    setReplyingTo(null);
    setShowCodeComposer(false);
    setShowAssetMenu(false);
  }

  // Voice recording handlers (True Browser MediaRecorder API)
  function toggleVoiceRecording() {
    if (isRecordingVoice) {
      stopVoiceAndSend();
    } else {
      startVoiceRecording();
    }
  }

  async function startVoiceRecording() {
    soundEngine.playMicTone();
    setIsRecordingVoice(true);
    setRecordSeconds(0);
    audioChunksRef.current = [];

    recordTimerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/ogg')
          ? 'audio/ogg'
          : '';

        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.start(100);
      }
    } catch (err) {
      console.warn('[RealAudio] Microphone access fallback:', err.message);
    }
  }

  function stopVoiceAndSend() {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    const duration = Math.max(1, recordSeconds);
    setIsRecordingVoice(false);
    setRecordSeconds(0);

    const replyPayload = replyingTo ? {
      id: replyingTo.id,
      senderName: replyingTo.sender === 'player' ? (userProfile?.name || 'Me') : peer.name,
      text: replyingTo.text,
    } : null;

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const audioDataUrl = reader.result;
          soundEngine.playRomanticChime();
          wsService.sendMessage(inputText.trim() || (isAm ? 'የድምፅ መልእክት 🎙️' : 'Voice note 🎙️'), {
            isAudio: true,
            audioUrl: audioDataUrl,
            audioDuration: duration,
            targetUserId: peer.id,
            replyTo: replyPayload,
          });
          setInputText("");
          setReplyingTo(null);
        };
        reader.readAsDataURL(blob);

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };
      recorder.stop();
    } else {
      // Fallback
      soundEngine.playRomanticChime();
      wsService.sendMessage(inputText.trim() || (isAm ? 'የድምፅ መልእክት 🎙️' : 'Voice note 🎙️'), {
        isAudio: true,
        audioDuration: duration,
        targetUserId: peer.id,
        replyTo: replyPayload,
      });
      setInputText("");
      setReplyingTo(null);
    }
  }

  function cancelVoiceRecording() {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setIsRecordingVoice(false);
    setRecordSeconds(0);
    audioChunksRef.current = [];
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
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
        ? `ይሄው ትኩስ የኢትዮጵያ ቡና ላኩልሽ/ህ! ለኮዲንግ ጉልበት ይሁን`
        : `Sent you a warm cup of Ethiopian Bunna to power through your code!`
    );
  }

  function handleAddFriendAction() {
    setShowQuickDropdown(false);
    setShowAssetMenu(false);
    soundEngine.playGiftFanfare();
    wsService.sendSocialAction('add_friend', peer.id);
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
        ? (isAm ? `ሰላም ${peer.name}፣ እኛ ሁለታችንም በ ${sharedTech.join(' እና ')} እንሰራለን! በአሁኑ ሰዓት ምን አይነት ፕሮጀክት እየሰራሽ/ህ ነው?` : `Hey ${peer.name}! I noticed we both love ${sharedTech.join(' & ')} What are you building right now?`)
        : (isAm ? `ሰላም ${peer.name}፣ ወደ ኮዲንግ አለም እንዴት ገባሽ/ህ? ማወቅ ደስ ይለኛል` : `Hey ${peer.name}! What got you into software engineering? Would love to hear your story`),
    },
    {
      label: sameIndent ? 'Indentation Match' : 'Dev Vibe',
      text: sameIndent
        ? (isAm ? `እኛ ሁለታችንም ${peer.indentation} እንመርጣለን! ከኮድ በኋላ ቡና እየጠጣን ብናወራ ደስ ይለኛል` : `Great minds think alike! We both use ${peer.indentation} How about a quick coffee break?`)
        : (isAm ? `ከረጅም ሰዓት ኮዲንግ እና ዲበጊንግ በኋላ እንዴት እራስሽን/ህን ታድሳለሽ/ህ? ` : `How do you like to recharge after a long day of debugging code? `),
    },
    {
      label: 'Soulmate Connection',
      text: isAm
        ? `የተመዘገበው ካርድሽ/ህ በጣም ሳበኝ! ዛሬ ቀንሽ/ህ እንዴት እያለፈ ነው?`
        : `Your developer profile caught my attention! How has your day been treating you?`,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-black font-mono overflow-hidden select-text">
      {/* Clean, Space-Efficient Room Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-black/95 backdrop-blur-md gap-2">
        <div
          onClick={() => setShowPartnerProfileModal(true)}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group hover:bg-zinc-900/60 p-1.5 -ml-1 rounded-xl transition-all border border-transparent hover:border-zinc-800"
          title="Click to view full partner profile card & dev info"
        >
          <div className="relative shrink-0">
            <span className="text-xl p-1.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden w-9 h-9 group-hover:border-red-600 transition-all">
              {peer?.avatarUrl ? (
                <img src={peer.avatarUrl} alt={peer.name} className="w-full h-full object-cover" />
              ) : (
                peer?.emoji || (peer?.gender === 'female' ? '👩‍💻' : '👨‍💻')
              )}
            </span>
            {/* Live Indicator: Only shown when peer is active online; otherwise blank */}
            {isPeerOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-black animate-pulse" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-red-400 transition-colors">
                {peer.name}
              </span>
              <span className="text-[11px] text-red-400 font-bold hidden sm:inline">{peer.handle}</span>              
            </div>
            <p className="text-[10px] text-zinc-400 truncate max-w-xs sm:max-w-md">
              {peer.quote ? `"${peer.quote}"` : (peer.bio || `${peer.indentation || 'Tabs'} · ${sharedTech.join(', ') || 'Developer'}`)}
            </p>
          </div>
        </div>

        {/* Action Controls Right: Clean & Uncluttered */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Clear Chat History Button */}
          <button
            type="button"
            onClick={handleClearHistory}
            className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              clearConfirm
                ? 'bg-red-950 border-red-600 text-white animate-pulse'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-800'
            }`}
            title="Clear saved chat history with this partner"
          >
            <span>{clearConfirm ? (isAm ? 'አረጋግጥ?' : 'Confirm?') : '🗑️'}</span>
          </button>

          {/* Mobile Partner Info Button */}
          <button
            type="button"
            onClick={() => setShowMobileStatsDrawer(true)}
            className="md:hidden flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
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
            className="px-2.5 py-1.5 rounded-xl border border-red-900/60 bg-red-950/40 text-red-300 hover:bg-red-950 hover:border-red-600 text-[11px] font-bold transition-all"
            title="Leave Chat Room"
          >
            <span>{isAm ? "ውጣ" : "Leave"}</span>
          </button>
        </div>
      </header>

      {/* Primary Chat Messages Feed: Full Vertical Height */}
      <div
        ref={feedRef}
        className="flex-1 h-full min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-black"
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.map((m) => {
          if (m.sender === 'system') {
            return (
              <div key={m.id} className="text-center my-2 animate-fade-in">
                <span className="font-mono text-[11px] text-zinc-500 bg-zinc-950 border border-zinc-800 px-2.5 py-0.5 rounded-full inline-block max-w-full truncate">
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
              onReply={(msg) => {
                setReplyingTo(msg);
                if (textareaRef.current) textareaRef.current.focus();
              }}
              lang={lang}
            />
          );
        })}

        {/* Real-Time Peer Typing Indicator */}
        {peerTyping && (
          <div className="flex items-center gap-2 px-3 py-1 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-[11px] text-red-400 font-bold">
              {peer.name} is typing...
            </span>
          </div>
        )}
      </div>

      {/* Voice Recording Active Bar */}
      {isRecordingVoice && (
        <div className="p-2.5 bg-red-950/80 border-t border-red-800/80 animate-fade-in flex items-center justify-between shrink-0 font-mono">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>
                REC {Math.floor(recordSeconds / 60)}:{String(recordSeconds % 60).padStart(2, '0')}
              </span>
            </div>
            <p className="text-xs text-white truncate max-w-[180px] sm:max-w-xs">
              {mediaRecorderRef.current ? (isAm ? "እየቀረጽኩ ነው... 🎙️" : "Recording voice... 🎙️") : (isAm ? "የድምጽ መልእክት 🎙️" : "Voice message 🎙️")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelVoiceRecording}
              className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
            >
              ✕ {isAm ? 'ሰርዝ' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={stopVoiceAndSend}
              className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 border border-red-500 text-xs font-bold text-white shadow-sm transition-colors"
            >
              ✓ {isAm ? 'ላክ' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Code Snippet Composer Modal / Drawer */}
      {showCodeComposer && (
        <div className="shrink-0 bg-zinc-950 border-t border-zinc-800 p-3 shadow-2xl animate-slide-up space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <span>Share Code Snippet (Telegram Style)</span>
            </span>
            <div className="flex items-center gap-2">
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="bg-black border border-zinc-700 text-white text-[11px] rounded-lg px-2 py-0.5 focus:outline-none"
              >
                <option value="TypeScript">TypeScript</option>
                <option value="React JSX">React JSX</option>
                <option value="Python">Python</option>
                <option value="Rust">Rust</option>
                <option value="Go">Go</option>
                <option value="CSS / Tailwind">CSS</option>
              </select>
              <button onClick={() => setShowCodeComposer(false)} className="text-zinc-500 hover:text-white text-xs">✕</button>
            </div>
          </div>

          <textarea
            rows={3}
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="// Paste or write code snippet here..."
            className="w-full bg-black border border-zinc-800 rounded-xl p-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCodeComposer(false)}
              className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendCodeSnippet}
              disabled={!codeSnippet.trim()}
              className="px-3 py-1 rounded-xl bg-red-600 border border-red-500 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40"
            >
              Send Snippet
            </button>
          </div>
        </div>
      )}

      {/* Telegram-style Asset Share Menu (Photos, Code, Bunna) */}
      {showAssetMenu && (
        <div className="shrink-0 bg-zinc-950 border-t border-zinc-800 p-2.5 shadow-2xl animate-slide-up flex flex-wrap items-center gap-2">
          {/* 1. Share Photo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black border border-zinc-800 hover:border-red-600 text-xs text-white font-bold transition-colors"
          >
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black border border-zinc-800 hover:border-red-600 text-xs text-white font-bold transition-colors"
          >
            <span>Send Code</span>
          </button>

          {/* 3. Send Bunna */}
          <button
            type="button"
            onClick={handleSendBunna}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black border border-zinc-800 hover:border-amber-600 text-xs text-amber-300 font-bold transition-colors"
          >
            <span>Send Bunna</span>
          </button>

          {/* 4. Send friend request */}
          <button
            type="button"
            onClick={handleAddFriendAction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black border border-zinc-800 hover:border-red-600 text-xs text-white font-bold transition-colors"
          >
            <span>👥</span>
            <span>Request</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAssetMenu(false)}
            className="ml-auto text-zinc-500 hover:text-white text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Space-Saving Quick Prompts Popover (Chevron Collapsible) */}
      {showQuickDropdown && (
        <div className="shrink-0 bg-zinc-950 border-t border-zinc-800 p-2.5 shadow-2xl animate-slide-up space-y-2">
          {/* Tabs: Icebreakers / Quotes / Actions */}
          <div className="flex items-center justify-between gap-1 pb-1 border-b border-zinc-800 text-[11px]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQuickTab('icebreakers')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  quickTab === 'icebreakers' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Icebreakers
              </button>
              <button
                type="button"
                onClick={() => setQuickTab('quotes')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  quickTab === 'quotes' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Quotes
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickDropdown(false)}
              className="text-zinc-500 hover:text-white px-1 text-xs"
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
                  className="text-left p-2 rounded-xl bg-black border border-zinc-800 hover:border-red-600 text-[11px] text-zinc-300 hover:text-white transition-all space-y-0.5"
                >
                  <span className="font-bold text-red-400 block truncate">{ib.label}</span>
                  <span className="text-[10px] text-zinc-400 block truncate">{ib.text}</span>
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
                  className="text-left p-2 rounded-xl bg-black border border-zinc-800 hover:border-red-600 text-[11px] text-zinc-300 hover:text-white transition-all flex items-center justify-between gap-2"
                >
                  <span className="truncate flex-1">{q.text}</span>
                  <span className="text-[10px] text-red-400 shrink-0 font-bold">{q.devTag}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Slim Space-Optimized Toolbar (Above Input Bar) */}
      <div className="shrink-0 px-3 py-1 bg-black border-t border-zinc-800/80 flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2 text-zinc-400 truncate">
          <span className="truncate">
            {sharedTech.length > 0 ? `Shared ${sharedTech.join(', ')}` : `${peer.indentation || 'Tabs'}`}
          </span>
        </div>

        {/* Chevron Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setShowQuickDropdown((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-colors ${
            showQuickDropdown
              ? 'bg-red-950/70 border-red-600 text-white'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
          title="Toggle quick prompts & romantic quotes"
        >
          <span>Quick Prompts</span>
          {showQuickDropdown ? (
            <IconChevronUp className="w-3 h-3" />
          ) : (
            <IconChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Quoted Message Reply Preview Bar */}
      {replyingTo && (
        <div className="shrink-0 flex items-center justify-between px-3.5 py-1.5 bg-zinc-950 border-t border-red-600 text-xs animate-slide-up">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-red-400 font-bold shrink-0">↩️ Replying to {replyingTo.sender === 'player' ? 'yourself' : peer.name}:</span>
            <span className="text-zinc-300 truncate text-[11px]">
              {replyingTo.text || (replyingTo.isImage ? 'Photo 📷' : replyingTo.isAudio ? 'Voice Note 🎙️' : 'Attachment')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="text-zinc-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-zinc-800"
            title="Cancel reply"
          >
            ✕
          </button>
        </div>
      )}

      {/* Real Text Chat Area Console (Telegram / Social Media Look) */}
      <footer className="border-t border-zinc-800 bg-black p-2 sm:p-2.5 shrink-0">
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
            className={`font-mono text-base px-2.5 py-2 rounded-xl border transition-all shrink-0 ${
              showAssetMenu
                ? 'bg-red-950 border-red-600 text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-red-600'
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
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-600 rounded-xl px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors resize-none max-h-24 leading-relaxed"
            />
          </div>

          {/* Voice Note Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`font-mono text-xs font-bold px-2.5 py-2 rounded-xl border flex items-center gap-1 transition-all shrink-0 ${
              isRecordingVoice
                ? 'bg-red-600 border-red-500 text-white animate-pulse'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-red-600'
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
                ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-red-600 border-red-500 text-white hover:bg-red-700 cursor-pointer shadow-sm'
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
          className="fixed inset-0 z-50 md:hidden bg-black/85 backdrop-blur-sm flex justify-start animate-fade-in"
          onClick={() => setShowMobileStatsDrawer(false)}
        >
          <div
            className="w-72 sm:w-80 h-full bg-black shadow-2xl flex flex-col animate-slide-right border-r border-zinc-800"
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
        onFollow={async () => {
          setIsFollowing((prev) => !prev);
          soundEngine.playRomanticChime();
          const action = isFollowing ? 'unfollow' : 'follow';
          await wsService.sendSocialAction(action, peer.id);
        }}
        onLike={() => {
          setIsLiked(true);
          soundEngine.playHeartbeat();
          wsService.sendSocialAction('like', peer.id);
        }}
        onOpenGiftModal={onOpenGiftModal}
        isFriend={isFriend}
        isFollowing={isFollowing}
        isLiked={isLiked}
        lang={lang}
      />
    </div>
  );
}