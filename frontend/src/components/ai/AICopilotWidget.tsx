import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  Stethoscope,
  Milk,
  Heart,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionUrl?: string;
  actionLabel?: string;
  suggestedFollowups?: string[];
  timestamp: string;
}

export const AICopilotWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Which cattle require medical attention today?',
    'How can I boost herd milk yield by 20%?',
    'Recommend optimal feed ration for Jersey cows',
    'Show calving delivery countdowns'
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Hello Farm Manager! I am your FarmEase AI Copilot.**\n\nI have real-time clinical access to your herd records, vitals, milk harvests, and breeding lifecycles. Ask me anything about cattle health, feed optimization, or disease prevention!`,
      suggestedFollowups: [
        'Analyze high-risk cattle',
        'How to boost milk yield?',
        'Calculate feed ration',
        'Check upcoming calving dates'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Load suggestions & farm context on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await apiClient.get('/ai/copilot/suggestions');
        if (res.data?.suggestions && res.data.suggestions.length > 0) {
          setSuggestions(res.data.suggestions);
        }
      } catch (err) {
        // Fallback default suggestions already set
      }
    };
    fetchSuggestions();
  }, []);

  // Keyboard shortcut Ctrl+J or Cmd+J to toggle Copilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    const handleOpenEvent = (e: any) => {
      setIsOpen(true);
      if (e.detail?.query) {
        handleSendMessage(e.detail.query);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-ai-copilot', handleOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-ai-copilot', handleOpenEvent);
    };
  }, []);

  // Voice Recognition (Speech-to-text) via Web Speech API
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.start();
  };

  // Text-to-speech response readout
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !speechEnabled) return;
    window.speechSynthesis.cancel();
    // Strip markdown formatting for voice
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (queryText?: string) => {
    const query = (queryText || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/copilot/chat', {
        query,
        history: messages.slice(-4).map(m => ({ role: m.role, content: m.content }))
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.data.reply,
        actionUrl: res.data.actionUrl,
        actionLabel: res.data.actionLabel,
        suggestedFollowups: res.data.suggestedFollowups,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      if (speechEnabled) speakText(res.data.reply);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ I encountered an error connecting to the farm knowledge server. Please retry your question.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 border border-emerald-400/30 transition-all cursor-pointer"
          title="Open FarmEase AI Copilot (Ctrl+J)"
        >
          {/* Glowing pulse ring */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60 blur-xs group-hover:opacity-100 transition animate-pulse pointer-events-none" />
          
          <div className="relative flex items-center gap-2 font-bold text-xs">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="tracking-wide">AI Copilot</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black/20 rounded text-emerald-200">
              Ctrl+J
            </span>
          </div>
        </motion.button>
      </div>

      {/* Main Copilot Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col bg-slate-900/95 text-slate-100 rounded-3xl border border-emerald-500/30 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'w-[95vw] sm:w-[680px] h-[85vh] max-h-[850px]'
                : 'w-[92vw] sm:w-[440px] h-[600px] max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    FarmEase AI Copilot
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                      Live
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Farm-Aware Veterinary & Agritech Intelligence
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  onClick={() => setSpeechEnabled(prev => !prev)}
                  className={`p-1.5 rounded-lg hover:bg-slate-800 transition ${
                    speechEnabled ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                  }`}
                  title={speechEnabled ? 'Voice readout enabled' : 'Mute voice readout'}
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsExpanded(prev => !prev)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition hidden sm:inline-flex"
                  title={isExpanded ? 'Collapse' : 'Expand window'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
              <span className="text-emerald-400 font-semibold shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Quick:
              </span>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 transition-colors whitespace-nowrap shrink-0 border border-slate-700/60 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed space-y-2.5 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs shadow-md'
                        : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Action link if provided */}
                    {msg.actionUrl && (
                      <div className="pt-2 border-t border-slate-700/60">
                        <button
                          onClick={() => {
                            navigate(msg.actionUrl!);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs transition border border-emerald-500/30 cursor-pointer"
                        >
                          {msg.actionLabel || 'View in Farm'}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Followup suggestions */}
                    {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {msg.suggestedFollowups.map((f, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(f)}
                            className="text-[10px] px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition cursor-pointer"
                          >
                            &rarr; {f}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-right opacity-60 font-mono">
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-3 items-center text-slate-400">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-semibold text-slate-300">
                      Analyzing farm herd records & formulating clinical answer...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
            >
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2.5 rounded-xl border transition ${
                  isListening
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Click to speak question'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about cattle health, milk yield, feed..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
