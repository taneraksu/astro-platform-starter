import { useState, useRef, useEffect } from 'react';

interface Message {
    id: number;
    role: 'user' | 'bot';
    text: string;
    buttons?: string[];
}

const FAQ: Record<string, { answer: string; buttons?: string[] }> = {
    'randevu': {
        answer: '📅 Randevu almak için doğrudan arayabilirsiniz:\n\n📞 0542 426 05 99\n\nAyrıca e-posta ile de ulaşabilirsiniz:\n✉️ taneraksu@gmail.com\n\nWeb sitemiz: taneraksu.com',
        buttons: ['Telefon numarası', 'E-posta'],
    },
    'telefon': {
        answer: '📞 Op. Dr. Taner Aksu\'yu aramak için:\n\n**0542 426 05 99**\n\nDokunarak arayabilirsiniz.',
        buttons: ['Adres nerede?', 'E-posta nedir?'],
    },
    'e-posta': {
        answer: '✉️ E-posta adresi:\n\n**taneraksu@gmail.com**\n\nWeb sitesi: taneraksu.com',
        buttons: ['Randevu al', 'Adres nerede?'],
    },
    'adres': {
        answer: '📍 Muayenehane adresi:\n\nZuhuratbaba Mah. Vankulu Sok.\nUğurlu Konakları B Blok No:6\nBakırköy / İstanbul\n\nGoogle Maps\'te görmek için aşağıdaki bağlantıyı kullanabilirsiniz.',
        buttons: ['Haritada göster', 'Telefon numarası'],
    },
    'harita': {
        answer: '🗺️ Google Maps bağlantısı:\nhttps://maps.google.com/?q=40.986004,28.871471\n\nYukarıdaki linke tıklayarak yol tarifi alabilirsiniz.',
        buttons: ['Randevu al', 'Telefon numarası'],
    },
    'kalça': {
        answer: '🦴 Total Kalça Protezi (TKP):\n\n• Hasar görmüş kalça eklemi, metal ve plastik implantlarla değiştirilir.\n• Ameliyat süresi: 1–2 saat\n• Hastanede kalış: 2–4 gün\n• Tam iyileşme: 3–6 ay\n\nZimmer Biomet ve Smith & Nephew implantları kullanılmaktadır.',
        buttons: ['İyileşme süreci', 'Egzersizler', 'Randevu al'],
    },
    'diz': {
        answer: '🦵 Total Diz Protezi (TDP):\n\n• Hasar görmüş diz eklemi, metal ve plastik implantlarla değiştirilir.\n• Ameliyat süresi: 1–2 saat\n• Hastanede kalış: 2–4 gün\n• Tam iyileşme: 6–12 ay\n\nPersona ve JOURNEY II sistemleri kullanılmaktadır.',
        buttons: ['İyileşme süreci', 'Egzersizler', 'Randevu al'],
    },
    'iyileşme': {
        answer: '📅 İyileşme süreci:\n\n• **1-2. Haftalar:** Ev içi kısa yürüyüşler, ağrı kontrolü\n• **3-6. Haftalar:** Fizyoterapi egzersizleri\n• **6-12. Haftalar:** Normal aktivitelere dönüş\n• **3-6. Aylar:** Spor ve yoğun aktivite\n\nDetaylı bilgi için uygulamadaki İyileşme Takvimi bölümüne bakın.',
        buttons: ['Egzersizler', 'Randevu al'],
    },
    'egzersiz': {
        answer: '🏃 Ameliyat sonrası egzersizler çok önemlidir!\n\nUygulamamızdaki Egzersiz Programı bölümünde:\n• Adım adım görsel egzersizler\n• Kalça ve diz için ayrı programlar\n• Günlük tamamlama takibi\n\nbulabilirsiniz.',
        buttons: ['İyileşme süreci', 'Randevu al'],
    },
    'ağrı': {
        answer: '💊 Ameliyat sonrası ağrı yönetimi:\n\n• İlk 1-2 hafta ağrı normal\n• Doktorunuzun önerdiği ağrı kesicileri kullanın\n• Uygulamadaki Ağrı Takibi bölümünde günlük ağrınızı kaydedin\n\n⚠️ Şiddetli, ani artan ağrıda: 0542 426 05 99\'u arayın veya acile gidin.',
        buttons: ['Uyarı işaretleri', 'Randevu al'],
    },
    'uyarı': {
        answer: '🚨 Acil belirtiler — hemen arayın:\n\n• Yüksek ateş (38.5°C üzeri)\n• Yara yerinde akıntı veya kızarıklık\n• Bacakta şiddetli şişlik\n• Nefes darlığı veya göğüs ağrısı\n• Ani, şiddetli ağrı\n\n🆘 Acil: 112\n📞 Dr. Taner Aksu: 0542 426 05 99',
        buttons: ['Telefon numarası'],
    },
    'implant': {
        answer: '🦾 Kullanılan implant markaları:\n\n**Zimmer Biomet:**\n• Taperloc Complete (kalça)\n• Persona (diz)\n• ROSA Robotik Sistem\n\n**Smith & Nephew:**\n• Anthology (kalça)\n• JOURNEY II BCS (diz)\n• OXINIUM teknolojisi\n\nDetaylı bilgi için İmplant Markaları sayfasına bakın.',
        buttons: ['Randevu al', 'Kalça protezi', 'Diz protezi'],
    },
    'fiyat': {
        answer: '💰 Fiyat bilgisi için lütfen doğrudan iletişime geçin:\n\n📞 0542 426 05 99\n✉️ taneraksu@gmail.com\n\nFiyatlar; ameliyat türü, implant seçimi ve hastane koşullarına göre değişmektedir.',
        buttons: ['Randevu al', 'Telefon numarası'],
    },
    'merhaba': {
        answer: '👋 Merhaba! Op. Dr. Taner Aksu Protez Takip asistanıyım.\n\nSize nasıl yardımcı olabilirim?',
        buttons: ['Randevu al', 'Kalça protezi', 'Diz protezi', 'Adres nerede?'],
    },
};

const QUICK_BUTTONS = [
    'Randevu al',
    'Kalça protezi',
    'Diz protezi',
    'Adres nerede?',
    'Telefon numarası',
    'İyileşme süreci',
];

function findAnswer(input: string): { answer: string; buttons?: string[] } | null {
    const lower = input.toLowerCase().trim();
    if (/merhaba|selam|hey|hi|hello|iyi günler/.test(lower)) return FAQ['merhaba'];
    if (/randev/.test(lower)) return FAQ['randevu'];
    if (/telefon|numara|ara|call/.test(lower)) return FAQ['telefon'];
    if (/e.?posta|mail|email/.test(lower)) return FAQ['e-posta'];
    if (/adres|konum|nerede|muayenehane/.test(lower)) return FAQ['adres'];
    if (/harita|maps|yol/.test(lower)) return FAQ['harita'];
    if (/kalça|hip/.test(lower)) return FAQ['kalça'];
    if (/diz|knee/.test(lower)) return FAQ['diz'];
    if (/iyileş|recover/.test(lower)) return FAQ['iyileşme'];
    if (/egzersiz|exercise|fizyo/.test(lower)) return FAQ['egzersiz'];
    if (/ağrı|aci|pain/.test(lower)) return FAQ['ağrı'];
    if (/uyarı|acil|tehlike|danger/.test(lower)) return FAQ['uyarı'];
    if (/implant|zimmer|smith|persona|journey|oxinium|rosa/.test(lower)) return FAQ['implant'];
    if (/fiyat|ücret|para|maliyet|price|cost/.test(lower)) return FAQ['fiyat'];
    return null;
}

function mapButtonToKey(btn: string): string {
    const map: Record<string, string> = {
        'Randevu al': 'randevu',
        'Telefon numarası': 'telefon',
        'E-posta': 'e-posta',
        'E-posta nedir?': 'e-posta',
        'Adres nerede?': 'adres',
        'Haritada göster': 'harita',
        'Kalça protezi': 'kalça',
        'Diz protezi': 'diz',
        'İyileşme süreci': 'iyileşme',
        'Egzersizler': 'egzersiz',
        'Uyarı işaretleri': 'uyarı',
    };
    return map[btn] || '';
}

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            role: 'bot',
            text: '👋 Merhaba! Op. Dr. Taner Aksu Protez Takip asistanıyım.\n\nSize nasıl yardımcı olabilirim?',
            buttons: QUICK_BUTTONS,
        },
    ]);
    const [input, setInput] = useState('');
    const [unread, setUnread] = useState(1);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            setUnread(0);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [open, messages]);

    function sendMessage(text: string) {
        if (!text.trim()) return;
        const userMsg: Message = { id: Date.now(), role: 'user', text };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');

        setTimeout(() => {
            const found = findAnswer(text);
            const botMsg: Message = {
                id: Date.now() + 1,
                role: 'bot',
                text: found
                    ? found.answer
                    : 'Üzgünüm, bu konuda bilgim yok. Lütfen doğrudan ulaşın:\n📞 0542 426 05 99\n✉️ taneraksu@gmail.com',
                buttons: found?.buttons,
            };
            setMessages((prev) => [...prev, botMsg]);
            if (!open) setUnread((u) => u + 1);
        }, 400);
    }

    function handleButton(btn: string) {
        sendMessage(btn);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        sendMessage(input);
    }

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Asistan ile konuş"
                class={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 ${open ? 'bg-slate-700 rotate-90' : 'bg-blue-700 hover:bg-blue-800'}`}
                style={{ boxShadow: '0 4px 24px rgba(29,78,216,0.35)' }}
            >
                {open ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                )}
                {!open && unread > 0 && (
                    <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unread}
                    </span>
                )}
            </button>

            {/* Chat window */}
            {open && (
                <div
                    class="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
                    style={{ maxHeight: '70vh', minHeight: '400px' }}
                >
                    {/* Header */}
                    <div class="bg-blue-700 px-4 py-3 flex items-center gap-3">
                        <div class="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-white font-semibold text-sm leading-tight">Op. Dr. Taner Aksu</p>
                            <p class="text-blue-200 text-xs leading-tight">Asistan · Genellikle anında yanıt verir</p>
                        </div>
                        <a
                            href="tel:05424260599"
                            class="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg px-2.5 py-1.5 no-underline transition-colors font-semibold"
                            title="Hemen ara"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                            Ara
                        </a>
                    </div>

                    {/* Messages */}
                    <div class="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
                        {messages.map((msg) => (
                            <div key={msg.id} class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div class={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
                                    <div
                                        class={`rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                                            msg.role === 'user'
                                                ? 'bg-blue-700 text-white rounded-br-sm'
                                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    {msg.buttons && msg.role === 'bot' && (
                                        <div class="mt-2 flex flex-wrap gap-1.5">
                                            {msg.buttons.map((btn) => (
                                                <button
                                                    key={btn}
                                                    onClick={() => handleButton(btn)}
                                                    class="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-100 transition-colors font-medium"
                                                >
                                                    {btn}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} class="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onInput={(e) => setInput((e.target as HTMLInputElement).value)}
                            placeholder="Sorunuzu yazın..."
                            class="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 bg-slate-50"
                            maxLength={200}
                        />
                        <button
                            type="submit"
                            class="w-9 h-9 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                            aria-label="Gönder"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
