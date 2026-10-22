// ─────────────────────────────────────────────────────────────────────────────
// RealChatRoom.jsx — 1-on-1 Real-Time WebSocket Developer Dating Chat Room
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { wsService } from '../../services/websocket.js';
import { soundEngine, createSpeechRecognizer } from '../../utils/audio.js';
import { getRomanticQuotes } from '../../data/romanticLove.js';
import MessageBubble from '../chat/MessageBubble.jsx';
import { IconSend, IconTerminal, IconGift } from '../ui/Icons.jsx';
import RealPeerSidebar from './RealPeerSidebar.jsx';

export default function RealChatRoom({
  peer,
  userProfile,
  allOnlinePeers = [],
  onSwitchPeer,
  onLeave,
  onOpenGiftModal,
  lang = 'en',
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceText, setVoiceText] = useState("");
  const [showLoveQuickBar, setShowLoveQuickBar] = useState(false);
  const [showMobileStatsDrawer, setShowMobileStatsDrawer] = useState(false);

  const feedRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordTimerRef = useRef(null);
  const recognizerRef = useRef(null);

  const isAm = lang === 'am';

  // Auto-scroll on new message
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, peerTyping]);

  useEffect(() => {
    // Initial welcome message from room
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

    const unbindMsg = wsService.on('chat:message', (msg) => {
      soundEngine.playMessageBeep();
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          sender: msg.senderId === (userProfile?.id || 'me') ? 'player' : 'partner',
          text: msg.text,
          timestamp: msg.timestamp,
          isAudio: msg.isAudio,
          audioDuration: msg.audioDuration,
          isGift: msg.isGift,
          gift: msg.gift,
        },
      ]);
    });

    const unbindTyping = wsService.on('chat:typing', (data) => {
      setPeerTyping(Boolean(data.isTyping));
    });

    const unbindLeave = wsService.on('room:peer_left', () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys_left_${Date.now()}`,
          sender: 'system',
          text: isAm ? `👋 @${peer.handle} ውይይቱን ለቋል።` : `👋 ${peer.name} has left the chat.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    return () => {
      unbindMsg();
      unbindTyping();
      unbindLeave();
    };
  }, [peer, userProfile, isAm]);

  // Handle typing debounce
  function handleInputChange(e) {
    setInputText(e.target.value);
    wsService.sendTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      wsService.sendTyping(false);
    }, 1200);
  }

  function handleSendText(e) {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    soundEngine.playHeartbeat();
    wsService.sendTyping(false);
    wsService.sendMessage(text);
    setInputText("");
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
    setShowLoveQuickBar(false);
    soundEngine.playRomanticChime();
    wsService.sendMessage(`${quote.text} ${quote.devTag}`);
  }

  function handleSendBunna() {
    soundEngine.playRomanticChime();
    wsService.sendMessage(
      isAm
        ? `☕ ይሄው ትኩስ የኢትዮጵያ ቡና ላኩልሽ/ህ! ለኮዲንግ ጉልበት ይሁንሽ/ህ ✨`
        : `☕ Sent you a warm cup of Ethiopian Bunna to power through your code! ✨`
    );
  }

  function handleAddFriendAction() {
    soundEngine.playGiftFanfare();
    wsService.sendSocialAction('add_friend', peer.id);
    wsService.sendMessage(
      isAm
        ? `👥 በገንቢ ጓደኝነት ዝርዝሬ ውስጥ አካትቼሻለሁ/ሃለሁ! ጓደኛሞች ሆነናል 💖`
        : `👥 I added you to my developer friends list! Let's stay connected and build together 💖`
    );
  }

  function handleSendIcebreaker(text) {
    soundEngine.playRomanticChime();
    wsService.sendMessage(text);
  }

  const quotes = getRomanticQuotes(peer?.gender || 'female', lang);

  // Criteria calculations
  const sharedTech = (peer?.techStack || []).filter((t) =>
    (userProfile?.techStack || ['React', 'TypeScript']).includes(t)
  );
  const sameIndent = peer?.indentation && userProfile?.indentation && peer.indentation === userProfile.indentation;

  const icebreakers = [
    {
      icon: '🚀',
      label: sharedTech.length > 0 ? `Shared ${sharedTech[0]}` : 'Tech Stack',
      text: sharedTech.length > 0
        ? (isAm ? `ሰላም ${peer.name}፣ እኛ ሁለታችንም በ ${sharedTech.join(' እና ')} እንሰራለን! በአሁኑ ሰዓት ምን አይነት ፕሮጀክት እየሰራሽ/ህ ነው? 🚀` : `Hey ${peer.name}! I noticed we both love ${sharedTech.join(' & ')} 🚀 What are you building right now?`)
        : (isAm ? `ሰላም ${peer.name}፣ ወደ ኮዲንግ አለም እንዴት ገባሽ/ህ? ማወቅ ደስ ይለኛል 💻` : `Hey ${peer.name}! What got you into software engineering? Would love to hear your story 💻`),
    },
    {
      icon: '☕',
      label: sameIndent ? 'Indentation Match' : 'Dev Vibe',
      text: sameIndent
        ? (isAm ? `እኛ ሁለታችንም ${peer.indentation} እንመርጣለን! ከኮድ በኋላ ቡና እየጠጣን ብናወራ ደስ ይለኛል ☕✨` : `Great minds think alike! We both use ${peer.indentation} 💻 How about a quick coffee break? ☕`)
        : (isAm ? `ከረጅም ሰዓት ኮዲንግ እና ዲበጊንግ በኋላ እንዴት እራስሽን/ህን ታድሳለሽ/ህ? ☕` : `How do you like to recharge after a long day of debugging code? ☕✨`),
    },
    {
      icon: '💖',
      label: 'Soulmate Connection',
      text: isAm
        ? `የተመዘገበው ካርድሽ/ህ በጣም ሳበኝ! ዛሬ ቀንሽ/ህ እንዴት እያለፈ ነው? 🌸`
        : `Your developer profile caught my attention! How has your day been treating you? 🌸`,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 font-mono overflow-hidden select-text">
      {/* Room Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-2 sm:px-4 py-2 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <span className="text-2xl sm:text-3xl p-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow shrink-0">
            {peer?.emoji || (peer?.gender === 'female' ? '👩‍💻' : '👨‍💻')}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[120px] sm:max-w-none">{peer.name}</span>
              <span className="text-[10px] sm:text-xs text-slate-500 hidden sm:inline">{peer.handle}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[160px] sm:max-w-md">
              {peer.bio}
            </p>
          </div>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Mobile Stats Toggle Button (Visible on screens < md) */}
          <button
            type="button"
            onClick={() => setShowMobileStatsDrawer(true)}
            className="md:hidden flex items-center gap-1 font-mono text-[11px] px-2 py-1.5 rounded-xl bg-slate-900 border border-cyan-800 text-cyan-300 hover:bg-slate-800 shadow-sm"
            title="Open partner stats and switcher"
          >
            <span>Stats</span>
          </button>

          {/* Send Bunna / Coffee */}
          <button
            type="button"
            onClick={handleSendBunna}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-[11px] font-bold hover:bg-amber-900 transition-all shadow-sm"
            title="Send fresh Ethiopian Bunna"
          >
            <span>☕</span>
            <span className="hidden sm:inline">Bunna</span>
          </button>

          {/* Add Friend */}
          <button
            type="button"
            onClick={handleAddFriendAction}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-[11px] font-bold hover:bg-indigo-900 transition-all shadow-sm"
            title="Add peer as friend"
          >
            <span>👥</span>
            <span>+Friend</span>
          </button>

          {/* Quick Love bar trigger */}
          <button
            type="button"
            onClick={() => setShowLoveQuickBar((prev) => !prev)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-fuchsia-950/60 border border-fuchsia-800 text-fuchsia-300 text-[11px] font-bold hover:bg-fuchsia-900 transition-all shadow-sm"
            title="Send love quotes"
          >
            <span>💖</span>
            <span className="hidden sm:inline">Quotes</span>
          </button>

          {/* Leave Button */}
          <button
            type="button"
            onClick={() => {
              wsService.leaveRoom();
              onLeave?.();
            }}
            className="px-2.5 py-1.5 rounded-xl border border-red-800/80 bg-red-950/40 text-red-300 hover:bg-red-900/60 text-[11px] font-bold transition-all"
            title="Leave Chat Room"
          >
            <span className="sm:hidden">✕</span>
            <span className="hidden sm:inline">{isAm ? "ውይይት ጨርስ" : "Leave"}</span>
          </button>
        </div>
      </div>

      {/* Romantic Quick Quotes Bar */}
      {showLoveQuickBar && (
        <div className="p-3 bg-slate-900 border-b border-slate-800 animate-slide-up space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-fuchsia-300">
            <span>💌 {isAm ? "የፍቅር ጥቅስ ምረጥና ላክ" : "Send a Developer Love Quote Over WebSocket"}</span>
            <button onClick={() => setShowLoveQuickBar(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
            {quotes.slice(0, 6).map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendRomanticQuote(q)}
                className="text-left p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-fuchsia-500 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span className="truncate pr-2">{q.text}</span>
                <span className="text-[10px] text-fuchsia-400 font-bold shrink-0">{q.devTag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Registered Criteria Ribbon */}
      <div className="flex-shrink-0 px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-mono">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-cyan-400 font-bold flex items-center gap-1">
            <span>✨</span>
            <span>Match:</span>
          </span>
          {sharedTech.length > 0 ? (
            <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
              Shared {sharedTech.join(', ')}
            </span>
          ) : (
            <span className="text-slate-500">Tech Enthusiast</span>
          )}

          <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-emerald-400">
            ⌨️ {peer.indentation || 'Tabs'}
          </span>

          {peer.location && (
            <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hidden sm:inline">
              📍 {peer.location}
            </span>
          )}

          {peer.drink && (
            <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-amber-400 hidden sm:inline">
              {peer.drink}
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-500 shrink-0">
          {peer.gender === 'female' ? '👩‍💻 Girlfriend' : '👨‍💻 Boyfriend'}
        </span>
      </div>

      {/* Chat Messages Feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Icebreaker Starter Chips (Shown when messages are low) */}
        {messages.length <= 3 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-900/40 my-2 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>⚡</span>
                <span>{isAm ? "በተመዘገቡ መስፈርቶች ላይ ተመስርተው ውይይት ይጀምሩ:" : "Break the ice with matching criteria:"}</span>
              </span>
              <span className="text-[10px] text-cyan-400">1-Tap Send</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {icebreakers.map((ib, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendIcebreaker(ib.text)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-600 hover:bg-slate-900 text-left transition-all group flex flex-col justify-between space-y-1 shadow-sm"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <span>{ib.icon}</span>
                    <span className="truncate">{ib.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 group-hover:text-slate-200 line-clamp-2">
                    "{ib.text}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          if (m.sender === 'system') {
            return (
              <div key={m.id} className="text-center my-2 animate-fade-in">
                <span className="font-mono text-xs text-slate-500 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
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
          <div className="flex items-center gap-2 px-4 py-1 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-xs text-cyan-400 font-bold">
              {peer.name} is typing...
            </span>
          </div>
        )}
      </div>

      {/* Voice Recording Active Bar */}
      {isRecordingVoice && (
        <div className="p-3 bg-red-950/40 border-t border-red-800/60 animate-fade-in flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span>REC 0:0{recordSeconds}</span>
            </div>
            <p className="text-xs text-slate-200 truncate max-w-xs">
              {voiceText || (isAm ? "እየሰማሁ ነው... ተናገሩ" : "Recording voice note...")}
            </p>
          </div>
          <button
            type="button"
            onClick={stopVoiceAndSend}
            className="px-3 py-1 rounded-lg bg-red-900 border border-red-600 text-xs font-bold text-red-200"
          >
            Send Voice Note 🎙️
          </button>
        </div>
      )}

      {/* Footer Console Input */}
      <footer className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md p-3 shrink-0">
        <form onSubmit={handleSendText} className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-emerald-400 select-none">
              &gt;
            </span>
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={isAm ? "ለቀጥታ ውይይት መልእክት ይተይቡ..." : `Message ${peer.name} in real-time...`}
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl pl-7 pr-3 py-2.5 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Voice Note Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`font-mono text-xs font-bold px-3 py-2.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              isRecordingVoice
                ? 'bg-red-950 border-red-500 text-red-300 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500'
            }`}
            title="Send audio voice note"
          >
            <span>🎙️</span>
            <span className="hidden sm:inline">Voice</span>
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`font-mono text-xs font-bold px-4 py-2.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              !inputText.trim()
                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-cyan-950 border-cyan-700 text-cyan-300 hover:bg-cyan-900 cursor-pointer shadow-md'
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
    </div>
  );
}
