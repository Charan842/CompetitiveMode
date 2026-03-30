import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendMessage, getMessages } from '../services/chatService';
import { FiMessageCircle, FiSend, FiChevronDown, FiChevronUp } from 'react-icons/fi';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatBox({ matchId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);
  const lastCountRef = useRef(0);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await getMessages(matchId);
      setMessages(data);
      if (!open && data.length > lastCountRef.current) {
        setUnread((u) => u + (data.length - lastCountRef.current));
      }
      lastCountRef.current = data.length;
    } catch {
      // silent
    }
  }, [matchId, open]);

  useEffect(() => {
    if (!matchId) return;
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(intervalRef.current);
  }, [fetchMessages]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [open, messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await sendMessage(matchId, text);
      setInput('');
      await fetchMessages();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer bg-transparent border-none text-left hover:bg-red-500/5 transition-colors"
      >
        <span className="flex items-center gap-2 text-white font-semibold text-sm">
          <FiMessageCircle className="text-red-400" size={16} />
          Match Chat
          {unread > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
              {unread}
            </span>
          )}
        </span>
        {open ? (
          <FiChevronUp className="text-slate-500" size={16} />
        ) : (
          <FiChevronDown className="text-slate-500" size={16} />
        )}
      </button>

      {open && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto px-3 py-2 space-y-2 bg-black/30">
            {messages.length === 0 && (
              <p className="text-slate-600 text-xs text-center mt-8">
                No messages yet. Say something!
              </p>
            )}
            {messages.map((msg) => {
              const isMe = (msg.senderId?._id || msg.senderId) === user._id;
              return (
                <div
                  key={msg._id}
                  className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {!isMe && (
                    <span className="text-[10px] text-slate-600 px-1">
                      {msg.senderId?.username || 'Opponent'}
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed break-words ${
                      isMe
                        ? 'bg-gradient-to-br from-red-600 to-red-700 text-white rounded-tr-sm'
                        : 'bg-slate-800/80 text-slate-200 border border-slate-700/40 rounded-tl-sm'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-slate-700 px-1">{formatTime(msg.createdAt)}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-red-900/20 bg-black/20">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={handleKey}
              placeholder="Type a message…"
              className="flex-1 bg-black/40 border border-red-900/30 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
            />
            <span className="text-[10px] text-slate-700 shrink-0">{input.length}/500</span>
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-none shrink-0"
            >
              {sending ? (
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSend className="text-white" size={13} />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
