import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Send, User, Sparkles, Activity } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  chips?: string[];
  source?: string;
}

interface FitnessContext {
  height?: number; weight?: number; age?: number; gender?: string;
  bmi?: number; bmiCategory?: string; bmr?: number; tdee?: number;
  waterLiters?: number; goal?: string; activityLevel?: string;
}

const FITNESS_GOAL_CHIPS = [
  '⚖️ Weight Loss', '📈 Weight Gain', '🔄 Body Recomposition', '🏋️ Muscle Hypertrophy',
  '💪 Strength Gain', '🏃 Endurance Improvement', '🧘 Better Flexibility', '✍️ Other / Custom Goal',
];

const SYMPTOM_CHIPS = [
  '🤒 Fever & Cough', '🤕 Headache & Fatigue', '🤢 Stomach Ache / Nausea', '💔 Chest Pain / Breathing Difficulty',
];

const METHOD_OPTIONS = [
  { id: 'all', label: '🌟 All Methods' },
  { id: 'exercise', label: '🏋️ Exercise & Sets' },
  { id: 'yoga', label: '🧘 Yoga & Breathing' },
  { id: 'nutrition', label: '🥗 Nutrition & Diet' },
];

const AICompanion = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mode = searchParams.get('mode') || 'triage';
  const fitnessContext: FitnessContext = (location.state as { fitnessContext?: FitnessContext })?.fitnessContext || {};
  const isFitnessMode = mode === 'fitness';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (hasInitialized) return;
    setHasInitialized(true);
    if (isFitnessMode && fitnessContext.bmi) {
      setMessages([{
        id: '1', sender: 'bot',
        text: `Welcome to your MedPal Fitness Consult! 🏋️\n\nBased on your profile:\n• BMI: ${fitnessContext.bmi} (${fitnessContext.bmiCategory})\n• BMR: ${fitnessContext.bmr} kcal\n• TDEE: ${fitnessContext.tdee} kcal\n• Daily Water: ${fitnessContext.waterLiters}L\n\nPlease select or describe your primary health goal:`,
        chips: FITNESS_GOAL_CHIPS,
      }]);
    } else {
      setMessages([{
        id: '1', sender: 'bot',
        text: `Hello! I'm your MedPal AI Health Companion. 🩺\n\nDescribe your symptoms or health concern, and I'll provide a preliminary assessment with risk level and recommended next steps.\n\nOr select a common concern below:`,
        chips: SYMPTOM_CHIPS,
      }]);
    }
  }, [isFitnessMode, fitnessContext, hasInitialized]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: query }]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      let fullMessage = query;
      if (isFitnessMode && selectedMethod !== 'all') {
        const lbl = METHOD_OPTIONS.find(m => m.id === selectedMethod)?.label || '';
        fullMessage = `[Focus on ${lbl}] ${query}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/companion/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullMessage, mode: isFitnessMode ? 'fitness' : 'triage',
          context: isFitnessMode ? fitnessContext : undefined,
          conversationHistory: messages.filter(m => m.id !== '1').slice(-8),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), sender: 'bot',
        text: data.reply || 'I could not process your request. Please try again.',
        source: data.source === 'gemini-ai' ? '✨ Powered by Gemini AI' : '🔧 Local Engine',
      }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Server unreachable. Please ensure the backend is running on port 3001.' }]);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">

      {/* Fitness Context Banner */}
      {isFitnessMode && fitnessContext.bmi && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Activity size={17} className="text-brand-light" />
            <span className="text-sm font-semibold text-txt">Fitness Profile Active</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { k: 'BMI', v: fitnessContext.bmi },
              { k: 'Category', v: fitnessContext.bmiCategory },
              { k: 'BMR', v: `${fitnessContext.bmr} kcal` },
              { k: 'TDEE', v: `${fitnessContext.tdee} kcal` },
              { k: 'Water', v: `${fitnessContext.waterLiters}L` },
            ].map(p => (
              <span key={p.k} className="bg-input border border-border-subtle px-3 py-1 rounded-full text-xs font-semibold text-txt-secondary">
                <strong className="text-brand-light mr-1">{p.k}</strong>{p.v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Method Selector */}
      {isFitnessMode && (
        <div className="bg-card border border-border rounded-2xl p-3 mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-txt-muted mr-2">Focus:</span>
          {METHOD_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => setSelectedMethod(opt.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${selectedMethod === opt.id
                ? 'bg-brand-glow border-brand/30 text-brand-light'
                : 'bg-input border-border text-txt-secondary hover:border-brand hover:text-brand-light'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div key={msg.id}>
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm
                  ${msg.sender === 'bot' ? 'bg-gradient-to-br from-brand to-teal text-white' : 'bg-elevated border border-border text-brand-light'}`}>
                  {msg.sender === 'bot' ? <Sparkles size={14} /> : <User size={14} />}
                </div>
                <div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${msg.sender === 'bot'
                      ? 'bg-slate-100/90 border border-slate-200 text-slate-900 rounded-bl-sm shadow-sm'
                      : 'bg-brand text-white rounded-br-sm'}`}>
                    {msg.sender === 'bot' ? (
                      <div className="prose prose-sm max-w-none text-slate-900 prose-headings:text-slate-900 prose-headings:font-bold prose-strong:text-slate-900 prose-strong:font-semibold prose-p:text-slate-800 prose-p:leading-relaxed prose-li:text-slate-800 prose-li:my-0.5 prose-pre:bg-slate-200/60 prose-pre:text-slate-900">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                    )}
                  </div>
                  {msg.source && <p className="text-xs font-semibold text-slate-500 mt-1 text-right">{msg.source}</p>}
                </div>
              </div>
              {msg.chips && (
                <div className="flex flex-wrap gap-2 mt-2.5 pl-11">
                  {msg.chips.map((chip, i) => (
                    <button key={i} onClick={() => handleSend(chip)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-input border border-border text-txt-secondary hover:bg-brand-glow hover:border-brand/30 hover:text-brand-light transition-all">
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-teal flex items-center justify-center text-white flex-shrink-0"><Sparkles size={14} /></div>
              <div className="bg-elevated border border-border-subtle rounded-2xl rounded-bl-sm px-5 py-3.5 flex gap-1.5 items-center">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-txt-muted" style={{ animation: `typing-bounce 1.2s ${i * 0.15}s infinite ease-in-out` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-3 p-4 border-t border-border bg-surface/60">
          <input
            type="text"
            placeholder={isFitnessMode ? 'Describe your fitness goal or ask MedPal...' : 'Describe your symptoms or health concern...'}
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1 px-5 py-3 bg-input border border-border rounded-full text-sm text-txt placeholder:text-txt-muted outline-none focus:border-brand focus:shadow-[0_0_0_3px_var(--color-brand-glow)] transition-all disabled:opacity-50"
          />
          <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-brand to-teal text-white flex items-center justify-center hover:scale-105 hover:shadow-lg hover:shadow-brand-glow transition-all disabled:opacity-40 disabled:hover:scale-100">
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;
