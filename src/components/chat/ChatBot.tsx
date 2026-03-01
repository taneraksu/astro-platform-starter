import { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const QUICK_QUESTIONS = [
    'Sarkopeni nedir?',
    'Düşme riskimi nasıl azaltabilirim?',
    'Hangi egzersizleri yapmalıyım?',
    'Günde ne kadar protein almalıyım?',
    'D vitamini eksikliği neden önemli?',
    'SARC-F testimi nasıl yorumlamalıyım?',
    'Osteoporoz tedavisi nelerdir?',
    'Doktorla nasıl iletişim kurabilirim?',
];

function formatMessage(text: string) {
    // Simple markdown-lite rendering
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
}

export default function ChatBot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [apiMissing, setApiMissing] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Load conversation from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('yas_ritmi_chat');
        if (saved) {
            try { setMessages(JSON.parse(saved)); } catch { /**/ }
        }
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    function saveMessages(msgs: Message[]) {
        // Keep last 40 messages to avoid localStorage bloat
        const trimmed = msgs.slice(-40);
        localStorage.setItem('yas_ritmi_chat', JSON.stringify(trimmed));
    }

    async function sendMessage(text: string) {
        if (!text.trim() || loading) return;
        setError('');
        const userMsg: Message = { role: 'user', content: text.trim() };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updated.map(m => ({ role: m.role, content: m.content })),
                }),
            });
            const data = await res.json();

            if (data.error === 'API_KEY_MISSING') {
                setApiMissing(true);
                setLoading(false);
                return;
            }
            if (data.error || !data.content) {
                setError(data.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
                setLoading(false);
                return;
            }

            const assistantMsg: Message = { role: 'assistant', content: data.content };
            const final = [...updated, assistantMsg];
            setMessages(final);
            saveMessages(final);
        } catch {
            setError('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    function clearChat() {
        if (confirm('Sohbet geçmişini silmek istiyor musunuz?')) {
            setMessages([]);
            localStorage.removeItem('yas_ritmi_chat');
        }
    }

    if (apiMissing) {
        return (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">⚙️</div>
                <h3 className="text-2xl font-bold text-amber-900 mb-3">Chatbot Yapılandırılmamış</h3>
                <p className="text-amber-800 text-lg leading-relaxed mb-4">
                    Sağlık asistanını kullanmak için <strong>ANTHROPIC_API_KEY</strong> ortam değişkeninin
                    Netlify panelinden ayarlanması gerekiyor.
                </p>
                <div className="bg-white border border-amber-200 rounded-xl p-4 text-left text-sm font-mono text-slate-700 mb-4">
                    Netlify → Site Settings → Environment Variables → ANTHROPIC_API_KEY
                </div>
                <p className="text-amber-700 text-base">
                    Bu sırada doktorunuza ulaşmak için:{' '}
                    <a href="tel:+905424260599" className="font-bold underline text-green-700">0542 426 05 99</a>
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col" style={{ height: '75vh', minHeight: '500px' }}>
            {/* Header */}
            <div className="flex items-center justify-between bg-blue-800 text-white px-5 py-4 rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🤖</div>
                    <div>
                        <div className="font-bold text-lg leading-tight">Yaş Ritmi Sağlık Asistanı</div>
                        <div className="text-blue-200 text-sm">Op Dr Taner Aksu Kliniği</div>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button onClick={clearChat} className="text-blue-200 hover:text-white text-sm underline cursor-pointer bg-transparent border-0">
                        Temizle
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {/* Welcome */}
                {messages.length === 0 && (
                    <div className="text-center py-6">
                        <div className="text-6xl mb-4">🤖</div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-2">Merhaba! Ben Yaş Ritmi Asistanı</h3>
                        <p className="text-slate-500 text-lg mb-6 max-w-md mx-auto">
                            Sarkopeni, osteoporoz, egzersiz ve beslenme konularında sorularınızı yanıtlamak için buradayım.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {QUICK_QUESTIONS.map(q => (
                                <button key={q} onClick={() => sendMessage(q)}
                                    className="bg-white border-2 border-blue-200 text-blue-800 px-4 py-2 rounded-xl text-base font-medium hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message bubbles */}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-9 h-9 bg-blue-800 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mr-2 mt-1">🤖</div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-lg leading-relaxed
                            ${msg.role === 'user'
                                ? 'bg-blue-800 text-white rounded-br-sm'
                                : 'bg-white border-2 border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'}`}
                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                        />
                        {msg.role === 'user' && (
                            <div className="w-9 h-9 bg-slate-300 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ml-2 mt-1">👤</div>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-blue-800 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🤖</div>
                        <div className="bg-white border-2 border-slate-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
                            <div className="flex gap-2 items-center">
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"
                                            style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                                <span className="text-slate-500 text-base">Yanıt hazırlanıyor...</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl px-5 py-3 text-red-800 text-base">
                        ⚠️ {error}
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Quick suggestions (when chat is ongoing) */}
            {messages.length > 0 && messages.length < 10 && !loading && (
                <div className="px-4 py-2 bg-white border-t border-slate-200 flex gap-2 overflow-x-auto">
                    {QUICK_QUESTIONS.slice(0, 4).map(q => (
                        <button key={q} onClick={() => sendMessage(q)}
                            className="flex-shrink-0 bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 hover:text-blue-800 transition-all cursor-pointer whitespace-nowrap border border-slate-200">
                            {q}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="bg-white border-t-2 border-slate-200 p-4 rounded-b-2xl">
                <div className="flex gap-3 items-end">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Sorunuzu yazın... (Enter = gönder, Shift+Enter = yeni satır)"
                        rows={2}
                        disabled={loading}
                        className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 text-lg text-slate-800 focus:outline-none focus:border-blue-600 resize-none disabled:opacity-60"
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || loading}
                        className="bg-blue-800 text-white font-bold px-6 py-4 rounded-xl text-lg hover:bg-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 min-h-[4rem]"
                    >
                        {loading ? '⏳' : '➤'}
                    </button>
                </div>
                <p className="text-slate-400 text-sm mt-2 text-center">
                    ⚕️ Bu asistan bilgilendirme amaçlıdır. Tıbbi karar için doktorunuza danışın.
                </p>
            </div>
        </div>
    );
}
