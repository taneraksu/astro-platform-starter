import { useState, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Exercise {
    id: string;
    name: string;
    category: string;
    target: string;
    level: 'başlangıç' | 'orta' | 'ileri';
    duration: string;
    reps?: string;
    sets?: string;
    description: string;
    steps: string[];
    benefits: string[];
    cautions?: string[];
    icon: string;
}

interface ExerciseLog {
    date: string;
    exerciseId: string;
    exerciseName: string;
    completed: boolean;
    notes?: string;
}

// ─── Exercise Data ────────────────────────────────────────────────────────────
const exercises: Exercise[] = [
    // Sarcopenia - Resistance
    {
        id: 'sit_to_stand',
        name: 'Sandalyeden Kalkma (Sit-to-Stand)',
        category: 'sarkopeni',
        target: 'Bacak kasları, kalça',
        level: 'başlangıç',
        duration: '5-10 dakika',
        reps: '10',
        sets: '3',
        description: 'En temel ve en faydalı direnç egzersizlerinden biri. Günlük yaşamı doğrudan destekler.',
        steps: [
            'Sırtı dik, kolları göğsün önünde çaprazlayarak sandalyede oturun.',
            'Ayaklarınızı kalça genişliğinde açın.',
            'Yavaşça öne eğilin ve bacaklarınızı kullanarak ayağa kalkın.',
            'Tam dikey konuma gelene kadar devam edin.',
            'Yavaşça geri oturun — önemli olan iniş hızıdır!',
            'Kalkış ve iniş toplamda 3-4 saniye sürsün.',
        ],
        benefits: ['Bacak kaslarını güçlendirir', 'Düşme riskini azaltır', 'Günlük bağımsızlığı artırır', 'Kemik yoğunluğunu destekler'],
        cautions: ['Diz ağrısı varsa hekim onayı alın', 'İlk seferinde sandalye arkasını tutarak yapın'],
        icon: '🪑',
    },
    {
        id: 'wall_squat',
        name: 'Duvara Yaslanarak Squat',
        category: 'sarkopeni',
        target: 'Kuadriseps, kalça, arka bacak',
        level: 'başlangıç',
        duration: '5-8 dakika',
        reps: '10-12',
        sets: '2-3',
        description: 'Diz eklemini daha az zorlayan, güvenli bir kuvvet egzersizi.',
        steps: [
            'Duvara sırtınızı dayayın, ayaklarınız duvardan 50-60 cm uzakta olsun.',
            'Yavaşça bacaklarınızı bükerek aşağı inin (sanki sandalyeye oturacakmış gibi).',
            '90° açıya ulaşmaya çalışın (90° zorsa 45° de kabul edilebilir).',
            'Bu pozisyonda 5-10 saniye bekleyin.',
            'Yavaşça geri kalkın.',
        ],
        benefits: ['Uyluğu güçlendirir', 'Dizi daha az zorlar', 'Denge geliştirir'],
        icon: '🧱',
    },
    {
        id: 'calf_raises',
        name: 'Parmak Ucu Yükseltme (Calf Raises)',
        category: 'sarkopeni',
        target: 'Baldır kasları, ayak bileği stabilitesi',
        level: 'başlangıç',
        duration: '5 dakika',
        reps: '15',
        sets: '3',
        description: 'Baldır kaslarını güçlendirir ve düşme önlemede kritik öneme sahiptir.',
        steps: [
            'Sandalye arkasına ya da duvara hafifçe tutunun.',
            'Ayak topuklarınızı yavaşça yerden kaldırın.',
            'En yüksek noktada 2 saniye bekleyin.',
            'Yavaşça indirin.',
            'Tek ayakla yapılırsa daha zorlayıcıdır.',
        ],
        benefits: ['Denge geliştirir', 'Bacak kaslarını güçlendirir', 'Venöz dönüşü iyileştirir'],
        icon: '👟',
    },
    {
        id: 'hip_abduction',
        name: 'Yandan Bacak Kaldırma (Oturarak)',
        category: 'sarkopeni',
        target: 'Kalça abduktörleri, dış bacak',
        level: 'başlangıç',
        duration: '5-8 dakika',
        reps: '12',
        sets: '3',
        description: 'Oturarak yapılan bu egzersiz, kalça çevresindeki kasları güçlendirir ve denge sağlar.',
        steps: [
            'Sandalyede dik oturun, sırtınız sandalyeye yaslanmasın.',
            'Sol bacağınızı düzgün uzatın.',
            'Yavaşça sola doğru açın (abduksiyon hareketi).',
            '2 saniye tutun, geri getirin.',
            'Diğer tarafı tekrar edin.',
        ],
        benefits: ['Kalça stabilitesini artırır', 'Düşme riskini azaltır', 'Günlük aktiviteleri kolaylaştırır'],
        icon: '🦵',
    },
    {
        id: 'seated_row',
        name: 'Oturarak Direnç Bandı Çekiş',
        category: 'sarkopeni',
        target: 'Sırt, omuz, kol kasları',
        level: 'orta',
        duration: '8 dakika',
        reps: '12',
        sets: '3',
        description: 'Üst vücut kas kütlesini artırmak için direnç bandı kullanılan egzersiz.',
        steps: [
            'Direnç bandını ayağınızın altına veya bir paya takın.',
            'Sandalyede dik oturun.',
            'Bandı iki elinizle tutun, dirseklerinizi geriye doğru çekin.',
            'Kürek kemiklerinizi birbirine yaklaştırın.',
            '2 saniye tutun, yavaşça bırakın.',
        ],
        benefits: ['Postürü düzeltir', 'Sırt ağrısını azaltır', 'Üst vücut gücünü artırır'],
        cautions: ['Omuz ağrısı varsa hekim onayı alın'],
        icon: '💪',
    },
    // Balance - Fall Prevention
    {
        id: 'single_leg_stand',
        name: 'Tek Ayak Üzerinde Durma',
        category: 'denge',
        target: 'Denge, propriyosepsiyon, ayak bileği',
        level: 'başlangıç',
        duration: '5 dakika',
        description: 'En etkili denge egzersizlerinden biri. Düşme riskini %20-25 azaltabilir.',
        steps: [
            'Sandalye veya duvara yakın durun.',
            'Yavaşça bir ayağınızı yerden 5-10 cm kaldırın.',
            '10-30 saniye bu pozisyonda tutun.',
            'Düşme hissedince tutunun — bu normaldir.',
            'Her bacak için 3-5 tekrar yapın.',
        ],
        benefits: ['Düşme riskini belirgin azaltır', 'Denge koordinasyonunu geliştirir', 'Ayak bileğini güçlendirir'],
        cautions: ['Her zaman tutunabileceğiniz bir yüzeyin yanında yapın'],
        icon: '🦩',
    },
    {
        id: 'tandem_walk',
        name: 'Tandem Yürüyüş (Çizgi Yürüyüşü)',
        category: 'denge',
        target: 'Denge, koordinasyon, propriyosepsiyon',
        level: 'orta',
        duration: '5-10 dakika',
        description: 'Bir ayağı diğerinin hemen önüne koyarak yürüme. Tai Chi ilkelerini içerir.',
        steps: [
            'Duvara paralel durun, gerekirse parmaklarınızı duvara değdirin.',
            'Sol ayağı sağ ayağın tam önüne koyun (topuk-parmak).',
            'Bakışlarınızı sabit bir noktaya odaklayın.',
            'Bu şekilde 5-10 adım yürüyün.',
            'Geri dönüp tekrarlayın.',
        ],
        benefits: ['Dinamik dengeyi geliştirir', 'Yürüyüş kalitesini artırır', 'Konsantrasyon geliştirir'],
        icon: '👣',
    },
    {
        id: 'tai_chi_weight_shift',
        name: 'Tai Chi: Ağırlık Kaydırma',
        category: 'denge',
        target: 'Denge, koordinasyon, güç aktarımı',
        level: 'başlangıç',
        duration: '10 dakika',
        description: 'Tai Chi\'nin temel hareketi. Düşme önlemede en güçlü kanıta sahip egzersizdir (RCT kanıtı).',
        steps: [
            'Ayaklar omuz genişliğinde açık, dizler hafif bükülü durun.',
            'Ağırlığınızı yavaşça sol ayağa kaydırın.',
            'Sol bacağı tam yükleyin (3-4 saniye).',
            'Yavaşça sağa kaydırın.',
            'Her geçiş 4-5 saniye sürsün.',
            'Nefes alırken bir yana, nefes verirken diğer yana geçin.',
        ],
        benefits: ['Klinik olarak kanıtlanmış düşme önleme', 'Stres azaltır', 'Koordinasyon geliştirir', 'Kalp sağlığını destekler'],
        icon: '☯️',
    },
    // Osteoporosis
    {
        id: 'walking',
        name: 'Düzenli Yürüyüş Programı',
        category: 'osteoporoz',
        target: 'Kemik yoğunluğu, kalp-damar sağlığı',
        level: 'başlangıç',
        duration: '30 dakika',
        description: 'Kemik yoğunluğu için en temel ağırlık taşıyan egzersiz. Haftada 5 gün önerilir.',
        steps: [
            'İlk haftalar: 10-15 dakika, düz zeminde başlayın.',
            'Her hafta 5 dakika artırın.',
            'Hedef: 30 dakika, haftada 5 gün.',
            'Tempolu yürüyüş (nefes hafif zorlanıyor ama konuşulabiliyor).',
            'Gerekirse baston kullanın — bu zayıflık değil, akıllılıktır!',
        ],
        benefits: ['Kemik yoğunluğunu artırır/korur', 'Kas kuvvetini geliştirir', 'Kardiyovasküler sağlık', 'Ruh halini iyileştirir'],
        cautions: ['Kaygan zeminden kaçının', 'Uygun, destekli ayakkabı kullanın'],
        icon: '🚶',
    },
    {
        id: 'back_extension',
        name: 'Sırt Güçlendirme Egzersizleri',
        category: 'osteoporoz',
        target: 'Paraspinal kaslar, vertebral stabilite',
        level: 'başlangıç',
        duration: '8 dakika',
        reps: '10',
        sets: '3',
        description: 'Omurga kırıklarını önlemek için kritik. Sırt kaslarını güçlendirir.',
        steps: [
            'Yerde yüzüstü yatın (veya destekli sandalyede oturun).',
            'Kolları yanlara açın, başı nötr pozisyonda tutun.',
            'Yavaşça başı ve göğsü yerden kaldırın (5-10 cm).',
            '2-3 saniye tutun.',
            'Yavaşça indirin.',
        ],
        benefits: ['Vertebral fraktür riskini azaltır', 'Postürü düzeltir', 'Sırt ağrısını azaltır'],
        cautions: ['Kompresyon kırığı varsa hekim onayı şarttır', 'Ağrıda durun'],
        icon: '🧘',
    },
    {
        id: 'hip_strengthening',
        name: 'Kalça Güçlendirme (Kalça Köprüsü)',
        category: 'osteoporoz',
        target: 'Kalça kemikleri, gluteus kasları',
        level: 'başlangıç',
        duration: '8 dakika',
        reps: '12',
        sets: '3',
        description: 'Kalça kırığı riskini azaltmak için en önemli egzersizlerden biri.',
        steps: [
            'Sırtüstü yatın, dizler bükülü, ayaklar yerde.',
            'Pelvik taban kaslarını sıkın.',
            'Kalçanızı yerden kaldırın, omuzdan dize düz çizgi oluşturun.',
            '3-5 saniye tutun.',
            'Yavaşça indirin.',
        ],
        benefits: ['Kalça bölgesi kemik yoğunluğunu artırır', 'Kalça düşmelerde direnci artırır', 'Sırt ağrısını azaltır'],
        icon: '🌉',
    },
    // Light/Everyday Activities
    {
        id: 'chair_yoga',
        name: 'Sandalye Yoga & Esneme',
        category: 'hafif',
        target: 'Esneklik, rahatlama, gevşeme',
        level: 'başlangıç',
        duration: '15-20 dakika',
        description: 'Her yaş ve kondisyon için güvenli. Sabah kalktıktan sonra idealdir.',
        steps: [
            'Sandalyede oturun, sırtınızı dik tutun.',
            'Boyun: Yavaşça sağa-sola eğin (10 sn tutun).',
            'Omuz: Geriye doğru yavaş çevirme hareketleri (10 tekrar).',
            'Bel: Sandalyede oturarak sağa-sola hafif dönüş.',
            'Kalça fleksiyon: Dizleri göğse yaklaştırma (10 sn tutun).',
            'Her hareketi yavaş ve kontrollü yapın, nefes almayı unutmayın.',
        ],
        benefits: ['Sabah tutukluğunu giderir', 'Eklem esnekliğini artırır', 'Günlük aktiviteleri kolaylaştırır', 'Stresi azaltır'],
        icon: '🧘‍♀️',
    },
    {
        id: 'deep_breathing',
        name: 'Nefes Egzersizleri & Meditasyon',
        category: 'hafif',
        target: 'Akciğer kapasitesi, stres, ağrı yönetimi',
        level: 'başlangıç',
        duration: '10 dakika',
        description: 'Kronik ağrı yönetiminde ve motivasyonun korunmasında bilimsel kanıtı güçlü bir yöntem.',
        steps: [
            'Sandalyede rahatça oturun veya yatın.',
            '4 saniye burnunuzdan yavaş nefes alın.',
            '4 saniye nefes tutun.',
            '6-8 saniye ağzınızdan yavaş verin.',
            'Bu döngüyü 5-10 dakika tekrarlayın.',
        ],
        benefits: ['Stres ve ağrıyı azaltır', 'Kan basıncını düzenler', 'Uyku kalitesini artırır', 'Egzersiz motivasyonunu destekler'],
        icon: '🌬️',
    },
    {
        id: 'water_exercises',
        name: 'Su İçi Egzersizler (Hidroterapi)',
        category: 'hafif',
        target: 'Eklemler, ağrısız hareket açıklığı',
        level: 'başlangıç',
        duration: '30-45 dakika',
        description: 'Eklem ağrısı olanlar için ideal. Suyun kaldırma kuvveti eklem yükünü %50-80 azaltır.',
        steps: [
            'Göğüs derinliğinde havuza girin.',
            'Yerinde yürüyüş: 5 dakika.',
            'Yanlara bacak açıp kapama: 10 tekrar.',
            'Kolları yanda tutarak öne-arkaya salınım: 10 tekrar.',
            'Su içinde dans veya tempolu yürüyüş.',
            'Havuz kenari tutunarak tek ayak dengesi.',
        ],
        benefits: ['Ağrısız egzersiz', 'Eklem hareket açıklığını artırır', 'Kasları güçlendirir', 'Keyifli ve sürdürülebilir'],
        cautions: ['Cilt problemleri varsa hekim onayı alın', 'Mutlaka cankurtaranın olduğu havuzda yapın'],
        icon: '🏊',
    },
];

// ─── Storage ──────────────────────────────────────────────────────────────────
function loadLogs(): ExerciseLog[] {
    try {
        const raw = localStorage.getItem('yas_ritmi_exercise_logs');
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}
function saveLogs(logs: ExerciseLog[]) {
    localStorage.setItem('yas_ritmi_exercise_logs', JSON.stringify(logs));
}

// ─── Exercise Card ────────────────────────────────────────────────────────────
function ExerciseCard({ ex, onComplete }: { ex: Exercise; onComplete: (id: string) => void }) {
    const [open, setOpen] = useState(false);
    const [done, setDone] = useState(false);
    const levelColor = ex.level === 'başlangıç' ? 'bg-green-100 text-green-800' : ex.level === 'orta' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
    const catColor = ex.category === 'sarkopeni' ? 'bg-blue-100 text-blue-800' : ex.category === 'osteoporoz' ? 'bg-purple-100 text-purple-800' : ex.category === 'denge' ? 'bg-orange-100 text-orange-800' : 'bg-teal-100 text-teal-800';

    function handleComplete() {
        setDone(true);
        onComplete(ex.id);
    }

    return (
        <div className={`bg-white rounded-2xl border-2 transition-all ${done ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
            <button
                className="w-full text-left p-5 cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0">{ex.icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-slate-800">{ex.name}</h3>
                            {done && <span className="bg-green-500 text-white text-sm px-2 py-0.5 rounded-full font-bold">✓ Tamamlandı</span>}
                        </div>
                        <p className="text-slate-600 text-base mb-3">{ex.description}</p>
                        <div className="flex flex-wrap gap-2">
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${levelColor}`}>{ex.level}</span>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${catColor}`}>{ex.category}</span>
                            <span className="bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full">⏱ {ex.duration}</span>
                            {ex.reps && <span className="bg-slate-100 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full">{ex.sets} × {ex.reps} tekrar</span>}
                        </div>
                    </div>
                    <div className="text-slate-400 text-2xl flex-shrink-0">{open ? '▲' : '▼'}</div>
                </div>
            </button>

            {open && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Steps */}
                        <div>
                            <h4 className="font-bold text-lg text-slate-700 mb-3">📋 Nasıl Yapılır?</h4>
                            <ol className="space-y-2">
                                {ex.steps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-3 text-base text-slate-700">
                                        <span className="bg-blue-800 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0">{i + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div>
                            {/* Benefits */}
                            <div className="mb-4">
                                <h4 className="font-bold text-lg text-slate-700 mb-2">✅ Faydaları</h4>
                                <ul className="space-y-1">
                                    {ex.benefits.map((b, i) => (
                                        <li key={i} className="flex items-start gap-2 text-base text-emerald-800">
                                            <span className="text-emerald-500 font-bold flex-shrink-0">•</span>
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Cautions */}
                            {ex.cautions && ex.cautions.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                                    <h4 className="font-bold text-base text-amber-800 mb-1">⚠️ Dikkat Edilecekler</h4>
                                    <ul className="space-y-1">
                                        {ex.cautions.map((c, i) => (
                                            <li key={i} className="text-base text-amber-800">• {c}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Target */}
                            <div className="bg-blue-50 rounded-xl p-3">
                                <span className="text-blue-800 text-base font-medium">🎯 Hedef Kas/Bölge: <strong>{ex.target}</strong></span>
                            </div>
                        </div>
                    </div>

                    {!done && (
                        <button
                            onClick={handleComplete}
                            className="mt-5 w-full sm:w-auto bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-emerald-800 transition-all cursor-pointer"
                        >
                            ✅ Bu Egzersizi Tamamladım!
                        </button>
                    )}
                    {done && (
                        <div className="mt-5 bg-green-100 border-2 border-green-400 rounded-xl p-4 text-green-800 font-bold text-lg">
                            🎉 Harika! Bu egzersizi tamamladınız. Devam edin!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExerciseProgram() {
    const categories = [
        { key: 'all', label: 'Tümü', icon: '🏋️', desc: 'Tüm egzersizler' },
        { key: 'sarkopeni', label: 'Sarkopeni', icon: '💪', desc: 'Direnç & Kas Gücü' },
        { key: 'osteoporoz', label: 'Osteoporoz', icon: '🦴', desc: 'Kemik Sağlığı' },
        { key: 'denge', label: 'Denge & Düşme Önleme', icon: '⚖️', desc: 'Denge & Koordinasyon' },
        { key: 'hafif', label: 'Hafif Aktiviteler', icon: '🌸', desc: 'Herkes için uygun' },
    ];

    const [activeCategory, setActiveCategory] = useState('all');
    const [logs, setLogs] = useState<ExerciseLog[]>([]);
    const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());

    useEffect(() => {
        const stored = loadLogs();
        setLogs(stored);
        const today = new Date().toLocaleDateString('tr-TR');
        const todayIds = new Set(stored.filter(l => l.date === today).map(l => l.exerciseId));
        setCompletedToday(todayIds);
    }, []);

    function handleComplete(exId: string) {
        const ex = exercises.find(e => e.id === exId);
        if (!ex) return;
        const today = new Date().toLocaleDateString('tr-TR');
        const newLog: ExerciseLog = { date: today, exerciseId: exId, exerciseName: ex.name, completed: true };
        const updated = [...logs, newLog];
        setLogs(updated);
        saveLogs(updated);
        setCompletedToday(prev => new Set([...prev, exId]));
    }

    const filtered = activeCategory === 'all' ? exercises : exercises.filter(e => e.category === activeCategory);
    const today = new Date().toLocaleDateString('tr-TR');
    const todayCount = logs.filter(l => l.date === today).length;
    const totalCount = logs.length;

    // Motivation based on progress
    const motivations = [
        '🌟 Her egzersiz, daha güçlü bir yarına yatırımdır!',
        '💪 Düzenlilik, doğanın en güçlü ilacıdır. Bravo!',
        '🏆 Bugün yaşınızı değil, enerjinizi hissedin!',
        '🦋 Küçük adımlar, büyük değişimler yaratır!',
        '❤️ Kendinize en iyi yatırım sağlığınızdır!',
    ];

    return (
        <div>
            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-700">{todayCount}</div>
                    <div className="text-emerald-800 text-base font-medium">Bugünkü Egzersiz</div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-700">{totalCount}</div>
                    <div className="text-blue-800 text-base font-medium">Toplam Egzersiz</div>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
                    <div className="text-xl font-bold text-amber-700">
                        {motivations[Math.floor(Math.random() * motivations.length)]}
                    </div>
                </div>
            </div>

            {/* Weekly Program Recommendation */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-2xl p-6 mb-8">
                <h3 className="text-2xl font-bold mb-4">📅 Önerilen Haftalık Program</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base">
                    {[
                        { days: 'Pazartesi, Çarşamba, Cuma', type: '💪 Direnç Egzersizleri', detail: '30-45 dk (Sarkopeni programı)' },
                        { days: 'Salı, Perşembe', type: '⚖️ Denge & Denge Egzersizleri', detail: '20-30 dk (Düşme önleme)' },
                        { days: 'Her gün', type: '🚶 Yürüyüş', detail: '30 dk tempolu yürüyüş' },
                        { days: 'Cumartesi', type: '🌊 Su Egzersizleri / Hafif Aktivite', detail: '30-45 dk' },
                        { days: 'Pazar', type: '🧘 Esneme & Dinlenme', detail: 'Sandalye yoga, nefes egzersizleri' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/15 rounded-xl p-3">
                            <div className="font-bold text-blue-100 text-sm mb-1">{item.days}</div>
                            <div className="font-bold text-base">{item.type}</div>
                            <div className="text-blue-200 text-sm">{item.detail}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 mb-6">
                {categories.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-base border-2 transition-all cursor-pointer
                            ${activeCategory === cat.key ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-emerald-700 border-emerald-200 hover:border-emerald-500'}`}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Exercise List */}
            <div className="space-y-4">
                {filtered.map(ex => (
                    <ExerciseCard key={ex.id} ex={ex} onComplete={handleComplete} />
                ))}
            </div>

            {/* Science Note */}
            <div className="mt-8 bg-slate-50 border-2 border-slate-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-3">🔬 Bilimsel Temel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base text-slate-700">
                    <div>
                        <p><strong>Sarkopeni için:</strong> Haftada ≥2 gün direnç egzersizi kas kütlesini artırır (EWGSOP2 kılavuzu).</p>
                    </div>
                    <div>
                        <p><strong>Osteoporoz için:</strong> Ağırlık taşıyan egzersizler osteoblastik aktiviteyi artırarak kemik yoğunluğunu destekler.</p>
                    </div>
                    <div>
                        <p><strong>Düşme önleme:</strong> Tai Chi ve denge egzersizleri düşme riskini %29-37 azaltır (Cochrane meta-analizi).</p>
                    </div>
                    <div>
                        <p><strong>Motivasyon:</strong> SMART hedefler ve sosyal destek egzersiz uyumunu %40-60 artırır (Bandura, 1986).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
