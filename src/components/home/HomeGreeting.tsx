import { useState, useEffect } from 'react';

function getGreeting(hour: number) {
    if (hour >= 5 && hour < 12)  return { text: 'Günaydın',     icon: '☀️',  bg: 'from-amber-500 to-orange-500',  sub: 'Güzel bir sabah sizi bekliyor!' };
    if (hour >= 12 && hour < 17) return { text: 'İyi Günler',   icon: '🌤️', bg: 'from-blue-500 to-cyan-500',     sub: 'Öğleden sonra enerjiniz bol olsun!' };
    if (hour >= 17 && hour < 21) return { text: 'İyi Akşamlar', icon: '🌆', bg: 'from-purple-600 to-indigo-600', sub: 'Huzurlu bir akşam dileriz!' };
    return                               { text: 'İyi Geceler',  icon: '🌙', bg: 'from-slate-700 to-blue-900',   sub: 'Sağlıklı bir uyku dileriz!' };
}

export default function HomeGreeting() {
    const [name, setName] = useState('');
    const [hour, setHour] = useState(new Date().getHours());

    useEffect(() => {
        const stored = localStorage.getItem('yas_ritmi_patient_name') || '';
        setName(stored);
        // Update hour every minute
        const timer = setInterval(() => setHour(new Date().getHours()), 60_000);
        return () => clearInterval(timer);
    }, []);

    const g = getGreeting(hour);

    if (!name) {
        return (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
                <span className="text-4xl">👤</span>
                <div>
                    <p className="text-blue-800 text-lg font-semibold">Profilinizi henüz oluşturmadınız.</p>
                    <a href="/hasta-profili" className="text-blue-700 underline text-base font-medium hover:text-blue-900">
                        Adınızı girmek için Hasta Profili sayfasını ziyaret edin →
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-r ${g.bg} text-white rounded-3xl p-7 mb-6 shadow-lg`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-6xl flex-shrink-0">{g.icon}</span>
                <div>
                    <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                        {g.text}, <span className="drop-shadow-lg">{name}!</span>
                    </h2>
                    <p className="text-white/90 text-xl mt-1">{g.sub}</p>
                    <p className="text-white/70 text-base mt-2">
                        {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>
        </div>
    );
}
