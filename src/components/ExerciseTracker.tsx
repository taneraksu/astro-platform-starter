import { useState, useEffect } from 'react';

interface Exercise {
    id: string;
    name: string;
    category: string;
    sets: number;
    reps: string;
    hold?: string;
    description: string;
    imageHint: string;
    forSurgery: ('hip' | 'knee' | 'both')[];
    phase: ('early' | 'mid' | 'late')[];
    caution?: string;
}

const EXERCISES: Exercise[] = [
    {
        id: 'ankle-pumps',
        name: 'Ayak Bileği Pompalama',
        category: 'Dolaşım',
        sets: 3,
        reps: '20',
        description: 'Sırt üstü yatarak ayağınızı yukarı aşağı hareket ettirin (fleksiyon ve plantarfleksiyon). Kan dolaşımını artırır ve pıhtı oluşumunu önler. Dinlenirken saatlik olarak yapın.',
        imageHint: '↑↓ Ayağı yukarı kaldır, sonra aşağı indir',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
    },
    {
        id: 'ankle-circles',
        name: 'Ayak Bileği Çevirmesi',
        category: 'Dolaşım',
        sets: 3,
        reps: 'Her yönde 10',
        description: 'Sırt üstü yatarak ayağınızı saat yönünde sonra saat yönünün tersine çevirin. Dolaşımı ve ayak bileği hareketliliğini artırır.',
        imageHint: '⟳ Ayak bileğini daire çizer gibi döndür',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
    },
    {
        id: 'quad-sets',
        name: 'Quadriseps Kasılması (Quad Set)',
        category: 'Güçlendirme',
        sets: 3,
        reps: '10',
        hold: '5 saniye',
        description: 'Bacak düz uzanmış halde yatarken, diz arkasını yatağa bastırarak uyluğunuzu sıkın. Tutun, sonra gevşetin. Quadriseps kasını aktive eder ve güçlendirir.',
        imageHint: '⬇ Diz arkasını yatağa bastır',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
    },
    {
        id: 'glute-sets',
        name: 'Gluteal Kasılma',
        category: 'Güçlendirme',
        sets: 3,
        reps: '10',
        hold: '5 saniye',
        description: 'Sırt üstü yatarken kalça kaslarınızı sıkın ve tutun. Stabilite için önemli olan kalça kaslarını aktive eder.',
        imageHint: '◉ Kalça kaslarını sık',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
    },
    {
        id: 'heel-slides',
        name: 'Topuk Kaydırma',
        category: 'Hareket Açıklığı',
        sets: 3,
        reps: '10',
        description: 'Sırt üstü yatarken, diz ve kalçayı bükerek topuğunuzu yavaşça kalçanıza doğru kaydırın. Geri düzleştirin. Kalça protezi için 90° ile sınırlı tutun.',
        imageHint: '← Topuğu kalçaya doğru kaydır',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
        caution: 'Kalça protezi: Erken iyileşmede kalça 90°\'den fazla bükülmemeli',
    },
    {
        id: 'short-arc-quads',
        name: 'Kısa Ark Quadriseps (SAQ)',
        category: 'Güçlendirme',
        sets: 3,
        reps: '10',
        hold: '5 saniye',
        description: 'Diz altına rulo havlu koyun (15 cm çap). Dizi tam olarak düzeltin ve tutun, sonra yavaşça indirin. Yürüme ve merdivenler için kritik olan son quadriseps kasılmasını güçlendirir.',
        imageHint: '↑ Havlu desteğiyle dizi düzelt',
        forSurgery: ['knee'],
        phase: ['early', 'mid'],
    },
    {
        id: 'straight-leg-raise',
        name: 'Düz Bacak Kaldırma (SLR)',
        category: 'Güçlendirme',
        sets: 3,
        reps: '10',
        hold: '2 saniye',
        description: 'Sırt üstü yatarken quadrisepsi kasın (dizi düzelt), sonra düz bacağı 45° kaldırın. Yavaşça indirin. Kalça fleksörlerini ve quadrisepsi güçlendirir.',
        imageHint: '↑ Düz bacağı 45° kaldır',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
        caution: 'Kalça protezi: Kalça kısıtlamaları konusunda fizyoterapistinize danışın',
    },
    {
        id: 'sitting-knee-ext',
        name: 'Oturarak Diz Ekstansiyonu',
        category: 'Hareket Açıklığı',
        sets: 3,
        reps: '10',
        hold: '5 saniye',
        description: 'Sandalyede oturarak ameliyatlı dizi mümkün olduğunca düzeltin. Tutun, sonra indirin. Tam ekstansiyonu (0°) geri kazanmak kritik önemdedir.',
        imageHint: '→ Oturur pozisyonda dizi düzelt',
        forSurgery: ['knee'],
        phase: ['early', 'mid'],
    },
    {
        id: 'sitting-knee-flex',
        name: 'Oturarak Diz Fleksiyonu',
        category: 'Hareket Açıklığı',
        sets: 3,
        reps: '10',
        description: 'Sandalyede otururken, sağlam ayağınızla ameliyatlı ayağınızı sandalye altına nazikçe itin. Son noktada tutun. Diz bükülmesini yeniden kazanmak için kritiktir.',
        imageHint: '← Ayağı sandalye altına kaydır',
        forSurgery: ['knee'],
        phase: ['early', 'mid'],
    },
    {
        id: 'hip-abduction',
        name: 'Kalça Abdüksiyonu (Yatarak)',
        category: 'Güçlendirme',
        sets: 3,
        reps: '10',
        description: 'Sırt üstü yatarken, ameliyatlı bacağı yana doğru kaydırın (parmaklarınız yukarı bakmalı). Sırtınızı düz tutun. Topalsız yürüyüş için önemli olan kalça abdüktörlerini güçlendirir.',
        imageHint: '→ Bacağı yana kaydır',
        forSurgery: ['hip'],
        phase: ['early', 'mid'],
        caution: 'Rahat açı sınırında kalın. Orta hattı geçmeyin.',
    },
    {
        id: 'standing-hip-abduction',
        name: 'Ayakta Kalça Abdüksiyonu',
        category: 'Güçlendirme',
        sets: 3,
        reps: '10',
        description: 'Destekle ayakta durarak ameliyatlı bacağı yana kaldırın (parmaklar öne bakmalı, öne eğilme). Yavaşça indirin. Denge için duvar veya yürüteç kullanın.',
        imageHint: '← Ayakta bacağı yana kaldır',
        forSurgery: ['hip'],
        phase: ['mid', 'late'],
    },
    {
        id: 'standing-knee-flex',
        name: 'Ayakta Diz Fleksiyonu',
        category: 'Güçlendirme',
        sets: 3,
        reps: '10',
        description: 'Destekle ayakta durarak, ameliyatlı dizi geriye doğru kaldırın. Uyluğu dik tutun. Hamstringleri güçlendirir.',
        imageHint: '↑ Dizi geriye doğru kaldır',
        forSurgery: ['knee'],
        phase: ['mid', 'late'],
    },
    {
        id: 'mini-squats',
        name: 'Mini Squat / Çeyrek Squat',
        category: 'Güçlendirme',
        sets: 3,
        reps: '10',
        description: 'Destekle ayakta durarak her iki dizi hafifçe bükün (~30°), sırtı düz tutun, ağırlığı eşit dağıtın. Kısa süre tutun, sonra dikelin. Zamanla daha derin squat\'a ilerleyin.',
        imageHint: '↓ Ayakta dizleri hafifçe bük',
        forSurgery: ['both'],
        phase: ['mid', 'late'],
    },
    {
        id: 'step-ups',
        name: 'Basamak Çıkma',
        category: 'Fonksiyonel',
        sets: 3,
        reps: '10',
        description: 'Ameliyatlı bacakla alçak bir basamağa çıkın, diğer bacağı yanına getirin. İnişte önce ameliyatsız bacak. Merdiven için fonksiyonel güç kazandırır.',
        imageHint: '↑ Ameliyatlı bacakla önce çık',
        forSurgery: ['both'],
        phase: ['late'],
    },
    {
        id: 'stationary-cycling',
        name: 'Sabit Bisiklet',
        category: 'Aerobik',
        sets: 1,
        reps: '10–20 dakika',
        description: 'Sabit bisiklette düşük dirençte pedal çevirin. Başlangıçta oturağı yüksek tutun (az diz bükülmesi). Hareket açıklığı ve kardiyovasküler kondisyon için mükemmeldir. Fleksiyon iyileştikçe oturağı alçaltın.',
        imageHint: '🚲 Rahat bir dirençle pedal çevir',
        forSurgery: ['both'],
        phase: ['mid', 'late'],
        caution: 'Kalça protezi: Bisiklet pozisyonunun kalça 90°\'yi aşmasına neden olmadığından emin olun',
    },
    {
        id: 'walking-program',
        name: 'Yürüyüş Programı',
        category: 'Aerobik',
        sets: 1,
        reps: 'Tolere edildiği kadar, 30 dk\'ya kadar artırın',
        description: 'Düzenli yürüyüş iyileşme için zorunludur. Kısa mesafelerle (5–10 dk) başlayın, kademeli artırın. Gerekirse yürüyüş yardımcısı kullanın. Başlangıçta düz ve düzgün yüzeylerde yürüyün.',
        imageHint: '🚶 Düz, düzgün yüzeylerde yürü',
        forSurgery: ['both'],
        phase: ['early', 'mid', 'late'],
    },
];

const STORAGE_KEY = 'arthrocare-exercise-log';

function getTodayKey() {
    return new Date().toISOString().split('T')[0];
}

function getStoredLog(): Record<string, Record<string, number>> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

export default function ExerciseTracker() {
    const [surgeryType, setSurgeryType] = useState<'hip' | 'knee' | 'both'>('knee');
    const [phase, setPhase] = useState<'early' | 'mid' | 'late'>('early');
    const [log, setLog] = useState<Record<string, Record<string, number>>>({});
    const [expandedEx, setExpandedEx] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setLog(getStoredLog());
    }, []);

    const todayKey = getTodayKey();
    const todayLog = log[todayKey] || {};

    const filteredExercises = EXERCISES.filter(ex =>
        (ex.forSurgery.includes(surgeryType) || ex.forSurgery.includes('both') || surgeryType === 'both') &&
        ex.phase.includes(phase)
    );

    const logSet = (exerciseId: string) => {
        const current = todayLog[exerciseId] || 0;
        const ex = EXERCISES.find(e => e.id === exerciseId);
        if (current >= (ex?.sets || 3)) return;
        const updated = { ...log, [todayKey]: { ...todayLog, [exerciseId]: current + 1 } };
        setLog(updated);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
    };

    const resetToday = () => {
        const updated = { ...log };
        delete updated[todayKey];
        setLog(updated);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
    };

    const totalSets = filteredExercises.reduce((acc, ex) => acc + ex.sets, 0);
    const completedSets = filteredExercises.reduce((acc, ex) => acc + Math.min(todayLog[ex.id] || 0, ex.sets), 0);
    const exercisesDone = filteredExercises.filter(ex => (todayLog[ex.id] || 0) >= ex.sets).length;

    const categoryColors: Record<string, string> = {
        'Dolaşım': 'bg-blue-100 text-blue-700',
        'Güçlendirme': 'bg-green-100 text-green-700',
        'Hareket Açıklığı': 'bg-purple-100 text-purple-700',
        'Aerobik': 'bg-orange-100 text-orange-700',
        'Fonksiyonel': 'bg-teal-100 text-teal-700',
    };

    return (
        <div>
            {/* Settings */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Ameliyat Tipi</label>
                        <div className="flex gap-2">
                            {([['hip', '🦴 Kalça'], ['knee', '🦵 Diz'], ['both', 'Her İkisi']] as const).map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setSurgeryType(val)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${surgeryType === val ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="label">İyileşme Fazı</label>
                        <div className="flex gap-2">
                            {([['early', 'Erken (0–6h)'], ['mid', 'Orta (6–12h)'], ['late', 'Geç (3ay+)']] as const).map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setPhase(val)}
                                    className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${phase === val ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Progress */}
            <div className="card mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-slate-900">Bugünkü Seans</h3>
                        <p className="text-sm text-slate-500">
                            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-700">{exercisesDone}/{filteredExercises.length}</div>
                        <div className="text-xs text-slate-500">egzersiz tamamlandı</div>
                    </div>
                </div>
                <div className="progress-bar mb-2">
                    <div
                        className={`progress-fill ${exercisesDone === filteredExercises.length && filteredExercises.length > 0 ? 'bg-green-500' : 'bg-blue-600'}`}
                        style={{ width: filteredExercises.length > 0 ? `${Math.round((completedSets / totalSets) * 100)}%` : '0%' }}
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                    <span>{completedSets} / {totalSets} set tamamlandı</span>
                    {Object.keys(todayLog).length > 0 && (
                        <button onClick={resetToday} className="text-red-400 hover:text-red-600 transition-colors">
                            Bugünü sıfırla
                        </button>
                    )}
                </div>
                {exercisesDone === filteredExercises.length && filteredExercises.length > 0 && (
                    <div className="alert alert-success text-sm mt-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Harika iş! Bugünkü egzersiz programını tamamladınız!
                    </div>
                )}
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
                {filteredExercises.map((ex) => {
                    const setsLogged = todayLog[ex.id] || 0;
                    const isDone = setsLogged >= ex.sets;
                    const isExpanded = expandedEx[ex.id];

                    return (
                        <div key={ex.id} className={`rounded-xl border-2 transition-all ${isDone ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}>
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${isDone ? 'bg-green-100' : 'bg-slate-100'}`}>
                                        {isDone ? '✓' : '○'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className={`font-semibold ${isDone ? 'text-green-800' : 'text-slate-900'}`}>{ex.name}</h3>
                                            <span className={`badge text-xs ${categoryColors[ex.category] || 'badge-blue'}`}>{ex.category}</span>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            {ex.sets} set × {ex.reps}{ex.hold ? ` — ${ex.hold} tut` : ''}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{ex.imageHint}</p>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-3">
                                        <p className="text-sm text-slate-700 mb-2 leading-relaxed">{ex.description}</p>
                                        {ex.caution && (
                                            <div className="alert alert-warning text-xs">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                                </svg>
                                                <span>{ex.caution}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mt-3">
                                    <div className="flex gap-1.5">
                                        {Array.from({ length: ex.sets }).map((_, i) => (
                                            <div key={i} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${i < setsLogged ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-slate-400'}`}>
                                                {i < setsLogged ? '✓' : i + 1}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1" />
                                    <button onClick={() => setExpandedEx(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))} className="text-xs text-slate-500 hover:text-blue-600 transition-colors">
                                        {isExpanded ? 'Gizle' : 'Nasıl yapılır?'}
                                    </button>
                                    <button
                                        onClick={() => logSet(ex.id)}
                                        disabled={isDone}
                                        className={`btn btn-sm ${isDone ? 'bg-green-100 text-green-700 cursor-default' : 'btn-primary'}`}
                                    >
                                        {isDone ? 'Tamam ✓' : `Set ${setsLogged + 1}/${ex.sets} Kaydet`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 alert alert-info text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 mt-0.5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <div>
                    <p className="font-semibold">Güvenli egzersiz ipuçları</p>
                    <ul className="mt-1 space-y-0.5 list-disc list-inside">
                        <li>Egzersiz hafif rahatsızlık verebilir ama keskin veya şiddetli ağrı olmamalı</li>
                        <li>Reçete edildiyse ağrı kesicileri egzersizden önce alın</li>
                        <li>Egzersiz sonrası 1–2 saat dinlenin</li>
                        <li>Şişliği azaltmak için egzersiz sonrası 15–20 dk buz uygulayın</li>
                        <li>Keskin ağrı durumunda durun ve fizyoterapistinize başvurun</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
