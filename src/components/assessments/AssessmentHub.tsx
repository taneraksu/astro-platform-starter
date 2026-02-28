import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AssessmentResult {
    type: string;
    date: string;
    score: number;
    maxScore: number;
    interpretation: 'low' | 'moderate' | 'high';
    label: string;
    details?: Record<string, number>;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────
function loadHistory(): AssessmentResult[] {
    try {
        const raw = localStorage.getItem('yas_ritmi_assessments');
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}
function saveHistory(list: AssessmentResult[]) {
    localStorage.setItem('yas_ritmi_assessments', JSON.stringify(list));
}

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ level, label }: { level: 'low' | 'moderate' | 'high'; label: string }) {
    const styles = {
        low: 'bg-green-100 text-green-900 border-2 border-green-400',
        moderate: 'bg-yellow-100 text-yellow-900 border-2 border-yellow-400',
        high: 'bg-red-100 text-red-900 border-2 border-red-400',
    };
    const icons = { low: '✅', moderate: '⚠️', high: '🚨' };
    return (
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${styles[level]}`}>
            {icons[level]} {label}
        </span>
    );
}

// ─── Score Display ────────────────────────────────────────────────────────────
function ScoreDisplay({ score, maxScore, interpretation, label, onSave }: {
    score: number; maxScore: number;
    interpretation: 'low' | 'moderate' | 'high'; label: string;
    onSave: () => void;
}) {
    const pct = Math.round((score / maxScore) * 100);
    const barColor = interpretation === 'low' ? 'bg-green-500' : interpretation === 'moderate' ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="bg-slate-50 rounded-2xl p-6 mt-6 border-2 border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                    <div className="text-3xl font-bold text-slate-800">{score} / {maxScore}</div>
                    <div className="text-slate-600 text-lg">Toplam Puan</div>
                </div>
                <RiskBadge level={interpretation} label={label} />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div className={`${barColor} h-4 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
            <button
                onClick={onSave}
                className="w-full sm:w-auto bg-blue-800 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-900 transition-all cursor-pointer"
            >
                💾 Sonucu Kaydet
            </button>
        </div>
    );
}

// ─── SARC-F Assessment ────────────────────────────────────────────────────────
function SarcFAssessment({ onComplete }: { onComplete: (r: AssessmentResult) => void }) {
    const questions = [
        {
            id: 'strength', title: '💪 GÜÇ (Strength)',
            question: '5 kg ağırlık taşımak (örn: dolu bir alışveriş torbası) ne kadar güç geliyor?',
            options: ['Hiç güçlük yok', 'Biraz güçlük var', 'Çok güçlük var veya yapamıyorum'],
        },
        {
            id: 'assistance', title: '🚶 YÜRÜYÜŞTE YARDIM (Assistance)',
            question: 'Odada yürümek ne kadar güç geliyor?',
            options: ['Hiç güçlük yok', 'Biraz güçlük var', 'Çok güçlük var, yardım gerekiyor veya yapamıyorum'],
        },
        {
            id: 'rise', title: '🪑 KALMA (Rise from Chair)',
            question: 'Sandalyeden veya yataktan kalkmak ne kadar güç geliyor?',
            options: ['Hiç güçlük yok', 'Biraz güçlük var', 'Çok güçlük var, yardım gerekiyor veya yapamıyorum'],
        },
        {
            id: 'climb', title: '🪜 MERDİVEN ÇIKMA (Climb Stairs)',
            question: '10 merdiven basamağı çıkmak ne kadar güç geliyor?',
            options: ['Hiç güçlük yok', 'Biraz güçlük var', 'Çok güçlük var veya yapamıyorum'],
        },
        {
            id: 'falls', title: '🩹 DÜŞMELER (Falls)',
            question: 'Son bir yıl içinde kaç kez düştünüz?',
            options: ['Hiç düşmedim', '1–3 kez düştüm', '4 kez veya daha fazla düştüm'],
        },
    ];

    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);

    const total = Object.values(answers).reduce((s, v) => s + v, 0);
    const interpretation: 'low' | 'moderate' | 'high' = total <= 3 ? 'low' : total <= 6 ? 'moderate' : 'high';
    const label = total <= 3 ? 'Normal — Risk Düşük' : total <= 6 ? 'Dikkat — Orta Risk' : 'Yüksek Risk — Sarkopeni Şüphesi';

    const allAnswered = Object.keys(answers).length === questions.length;

    function handleSave() {
        onComplete({
            type: 'SARC-F', date: new Date().toLocaleDateString('tr-TR'),
            score: total, maxScore: 10, interpretation, label, details: answers,
        });
        alert('✅ Sonuç kaydedildi! İlerleme sayfasından görüntüleyebilirsiniz.');
    }

    return (
        <div>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">📋 SARC-F Hakkında</h3>
                <p className="text-blue-800 text-base leading-relaxed">
                    SARC-F, sarkopeni (kas kaybı) riskini belirlemek için kullanılan 5 soruluk bir tarama aracıdır.
                    Her soru 0–2 puan alır. Toplam 4 veya üzeri puan sarkopeni açısından değerlendirme gerektirir.
                </p>
            </div>

            <div className="space-y-5">
                {questions.map((q, qi) => (
                    <div key={q.id} className="bg-white rounded-2xl border-2 border-slate-200 p-5">
                        <div className="text-base font-bold text-slate-500 mb-1">Soru {qi + 1}/5 — {q.title}</div>
                        <p className="text-xl font-semibold text-slate-800 mb-4">{q.question}</p>
                        <div className="space-y-3">
                            {q.options.map((opt, oi) => (
                                <label key={oi} className={`elder-radio-option flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                                    ${answers[q.id] === oi ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                                    <input
                                        type="radio" name={q.id} value={oi}
                                        checked={answers[q.id] === oi}
                                        onChange={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                                        className="w-5 h-5 accent-blue-700"
                                    />
                                    <span className="text-lg text-slate-800">
                                        <span className="font-bold text-slate-500">{oi} puan</span> — {opt}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {allAnswered && (
                <ScoreDisplay
                    score={total} maxScore={10}
                    interpretation={interpretation} label={label}
                    onSave={handleSave}
                />
            )}

            {allAnswered && (
                <div className={`mt-4 rounded-2xl p-5 border-2 ${interpretation === 'low' ? 'bg-green-50 border-green-300' : interpretation === 'moderate' ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-300'}`}>
                    <h4 className="font-bold text-lg mb-2">📌 Ne Anlama Geliyor?</h4>
                    {interpretation === 'low' && <p className="text-base">Puanınız normal sınırlar içinde. Düzenli egzersiz ve beslenmeyi sürdürün. Yılda bir tekrar değerlendirin.</p>}
                    {interpretation === 'moderate' && <p className="text-base">Orta düzeyde risk. Direnç egzersizleri ve yeterli protein alımına dikkat edin. Doktorunuzla değerlendirin.</p>}
                    {interpretation === 'high' && <p className="text-base text-red-900">Yüksek risk! Sarkopeni açısından detaylı değerlendirme için Op Dr Taner Aksu'ya başvurun. Direnç egzersizi programı ve beslenme danışmanlığı önerilir.</p>}
                </div>
            )}
        </div>
    );
}

// ─── TUG Test ─────────────────────────────────────────────────────────────────
function TUGAssessment({ onComplete }: { onComplete: (r: AssessmentResult) => void }) {
    const [seconds, setSeconds] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const sec = parseFloat(seconds);
    const valid = !isNaN(sec) && sec > 0;
    const interpretation: 'low' | 'moderate' | 'high' = sec < 10 ? 'low' : sec < 20 ? 'moderate' : 'high';
    const label = sec < 10 ? 'Normal — Düşme Riski Düşük' : sec < 20 ? 'Dikkat — Orta Düşme Riski' : 'Yüksek Düşme Riski!';

    function handleSave() {
        if (!valid) return;
        onComplete({
            type: 'TUG Testi', date: new Date().toLocaleDateString('tr-TR'),
            score: Math.round(sec), maxScore: 30, interpretation, label,
        });
        alert('✅ TUG sonucu kaydedildi!');
    }

    return (
        <div>
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6">
                <h3 className="text-xl font-bold text-red-900 mb-2">🏃 TUG Testi Hakkında</h3>
                <p className="text-red-800 text-base leading-relaxed">
                    Timed Up and Go (TUG) Testi, düşme riskini ve hareket kabiliyetini ölçer. Sandalyeden kalkıp 3 metre yürüyüp, dönerek geri gelip oturma süresi ölçülür.
                </p>
            </div>

            {/* Test Instructions */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6">
                <h4 className="text-xl font-bold text-slate-800 mb-4">📋 Test Nasıl Yapılır?</h4>
                <ol className="space-y-3 text-lg text-slate-700">
                    {[
                        'Kolsuz standart bir sandalyeye oturun.',
                        'Hazır olduğunuzda "başla" komutunu verin.',
                        'Sandalyeden kalkın, 3 metre yürüyün.',
                        'Geri dönün ve sandalyeye oturun.',
                        'Geçen süreyi saniye cinsinden kaydedin.',
                    ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className="bg-red-100 text-red-800 font-bold w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0">{i + 1}</span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-800 text-base font-medium">⚠️ Gerekirse güvenli olduğu bilinen yürüme yardımcısını (baston, yürüteç) kullanabilirsiniz.</p>
                </div>
            </div>

            {/* Time Input */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6">
                <label className="block text-xl font-bold text-slate-800 mb-3">
                    ⏱️ Test Süresi (saniye cinsinden giriniz)
                </label>
                <input
                    type="number" min="1" max="120" step="0.1"
                    value={seconds}
                    onChange={e => { setSeconds(e.target.value); setSubmitted(false); }}
                    placeholder="Örn: 12.5"
                    className="border-2 border-gray-300 rounded-xl px-5 py-4 text-2xl font-bold text-center w-48 focus:outline-none focus:border-red-500"
                />
                <div className="text-slate-500 text-base mt-2">saniye</div>
            </div>

            {/* Interpretation Table */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6">
                <h4 className="font-bold text-lg text-slate-800 mb-4">📊 Yorum Tablosu</h4>
                <div className="space-y-3">
                    {[
                        { range: '< 10 saniye', text: 'Normal hareket kabiliyeti, düşme riski düşük', color: 'bg-green-50 border-green-300 text-green-900' },
                        { range: '10 – 19 saniye', text: 'Orta düzeyde, düşük düşme riski', color: 'bg-yellow-50 border-yellow-300 text-yellow-900' },
                        { range: '20+ saniye', text: 'Yüksek düşme riski, bağımsız dışarı çıkamayabilir', color: 'bg-red-50 border-red-300 text-red-900' },
                    ].map((row, i) => (
                        <div key={i} className={`flex flex-wrap items-center gap-4 border-2 rounded-xl px-5 py-3 ${row.color}`}>
                            <span className="font-bold text-lg">{row.range}</span>
                            <span className="text-base">→ {row.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {valid && (
                <ScoreDisplay
                    score={Math.round(sec)} maxScore={30}
                    interpretation={interpretation} label={label}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

// ─── FES-I Assessment ─────────────────────────────────────────────────────────
function FESIAssessment({ onComplete }: { onComplete: (r: AssessmentResult) => void }) {
    const activities = [
        'Ev içinde temizlik yapmak (süpürmek, silmek)',
        'Giyinmek veya soyunmak',
        'Basit yemek hazırlamak',
        'Banyo veya duş yapmak',
        'Market alışverişi yapmak',
        'Düz olmayan veya eğimli bir zemine basarak yürümek',
        'Sosyal bir etkinlik için dışarı çıkmak',
        'Bahçe işleriyle uğraşmak',
        'Kalabalık alanda yürümek',
        'Kaygan veya ıslak zemine basmak',
        'Birini ziyarete gitmek',
        'Merdivenlerden inip çıkmak',
        'Toplu taşıma araçlarına (otobüs, taksi) binip inmek',
        'İnişli çıkışlı yerlerde yürümek',
        'Korkuluksuz merdivenlerden çıkmak',
        'Eğimli yüzeyde yürümek',
    ];

    const [answers, setAnswers] = useState<Record<number, number>>({});

    const answeredCount = Object.keys(answers).length;
    const total = Object.values(answers).reduce((s, v) => s + v, 0);
    const allAnswered = answeredCount === activities.length;
    const interpretation: 'low' | 'moderate' | 'high' = total <= 19 ? 'low' : total <= 27 ? 'moderate' : 'high';
    const label = total <= 19 ? 'Düşük Endişe Düzeyi' : total <= 27 ? 'Orta Endişe Düzeyi' : 'Yüksek Endişe — Düşme Korkusu!';

    function handleSave() {
        onComplete({
            type: 'FES-I', date: new Date().toLocaleDateString('tr-TR'),
            score: total, maxScore: 64, interpretation, label,
        });
        alert('✅ FES-I sonucu kaydedildi!');
    }

    const levelLabels = ['Hiç endişelenmiyorum', 'Biraz endişeleniyorum', 'Oldukça endişeleniyorum', 'Çok fazla endişeleniyorum'];

    return (
        <div>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-6">
                <h3 className="text-xl font-bold text-amber-900 mb-2">😰 FES-I Hakkında</h3>
                <p className="text-amber-800 text-base leading-relaxed">
                    Falls Efficacy Scale International (FES-I), günlük aktiviteler sırasında düşme konusundaki endişe düzeyini ölçer.
                    Her soru 1–4 puan alır. Toplam 64 puan üzerinden değerlendirilir.
                </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-5">
                <div className="flex flex-wrap gap-3 text-sm font-semibold">
                    {[1, 2, 3, 4].map(v => (
                        <span key={v} className={`px-3 py-1 rounded-lg ${v === 1 ? 'bg-green-200 text-green-900' : v === 2 ? 'bg-yellow-200 text-yellow-900' : v === 3 ? 'bg-orange-200 text-orange-900' : 'bg-red-200 text-red-900'}`}>
                            {v} = {levelLabels[v - 1]}
                        </span>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {activities.map((act, i) => (
                    <div key={i} className="bg-white rounded-2xl border-2 border-slate-200 p-5">
                        <p className="text-lg font-semibold text-slate-800 mb-3">
                            <span className="text-slate-400 text-base font-normal">{i + 1}. </span>
                            {act} sırasında düşme konusunda ne kadar endişelenirsiniz?
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map(v => (
                                <label key={v}
                                    className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all text-center
                                        ${answers[i] === v
                                            ? v === 1 ? 'border-green-500 bg-green-50' : v === 2 ? 'border-yellow-500 bg-yellow-50' : v === 3 ? 'border-orange-500 bg-orange-50' : 'border-red-500 bg-red-50'
                                            : 'border-gray-200 hover:border-gray-400'}`}>
                                    <input type="radio" name={`fesi_${i}`} value={v}
                                        checked={answers[i] === v}
                                        onChange={() => setAnswers(prev => ({ ...prev, [i]: v }))}
                                        className="sr-only"
                                    />
                                    <span className={`text-2xl font-bold ${v === 1 ? 'text-green-700' : v === 2 ? 'text-yellow-700' : v === 3 ? 'text-orange-700' : 'text-red-700'}`}>{v}</span>
                                    <span className="text-xs text-slate-600 leading-tight">{levelLabels[v - 1]}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 bg-slate-100 rounded-xl p-4">
                <div className="text-lg font-semibold text-slate-700">
                    {answeredCount}/{activities.length} soru yanıtlandı
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${(answeredCount / activities.length) * 100}%` }} />
                </div>
            </div>

            {allAnswered && (
                <>
                    <ScoreDisplay score={total} maxScore={64} interpretation={interpretation} label={label} onSave={handleSave} />
                    <div className={`mt-4 rounded-2xl p-5 border-2 ${interpretation === 'low' ? 'bg-green-50 border-green-300' : interpretation === 'moderate' ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-300'}`}>
                        <h4 className="font-bold text-lg mb-2">📌 Ne Anlama Geliyor?</h4>
                        {interpretation === 'low' && <p className="text-base">Düşme korkusu düşük seviyede. Aktif yaşamınızı sürdürün, denge egzersizlerini ihmal etmeyin.</p>}
                        {interpretation === 'moderate' && <p className="text-base">Orta düzeyde düşme kaygısı var. Denge egzersizleri ve ev güvenliği düzenlemeleri önerilir.</p>}
                        {interpretation === 'high' && <p className="text-base text-red-900">Yüksek düşme korkusu! Bu durum aktiviteden kaçınmaya ve kas zayıflığına yol açabilir. Psikososyal destek ve Tai Chi gibi denge programlarını değerlendirin.</p>}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Charlson Comorbidity Index ───────────────────────────────────────────────
function CharlsonAssessment({ onComplete }: { onComplete: (r: AssessmentResult) => void }) {
    const conditions = [
        { id: 'mi', label: 'Miyokart Enfarktüsü (Kalp Krizi)', weight: 1, category: 'Kalp-Damar' },
        { id: 'chf', label: 'Konjestif Kalp Yetersizliği', weight: 1, category: 'Kalp-Damar' },
        { id: 'pvd', label: 'Periferik Damar Hastalığı', weight: 1, category: 'Kalp-Damar' },
        { id: 'cvd', label: 'Serebrovasküler Hastalık (İnme/TİA)', weight: 1, category: 'Nörolojik' },
        { id: 'dementia', label: 'Demans (Bunama)', weight: 1, category: 'Nörolojik' },
        { id: 'cpd', label: 'Kronik Akciğer Hastalığı (KOAH)', weight: 1, category: 'Solunum' },
        { id: 'ctd', label: 'Bağ Doku Hastalığı / Romatizmal Hastalık', weight: 1, category: 'Romatizmal' },
        { id: 'pud', label: 'Peptik Ülser Hastalığı', weight: 1, category: 'Sindirim' },
        { id: 'mild_liver', label: 'Hafif Karaciğer Hastalığı', weight: 1, category: 'Sindirim' },
        { id: 'dm', label: 'Diyabet (komplikasyonsuz)', weight: 1, category: 'Metabolik' },
        { id: 'hemiplegia', label: 'Hemipleji / Parapleji', weight: 2, category: 'Nörolojik' },
        { id: 'renal', label: 'Orta/Ağır Böbrek Hastalığı', weight: 2, category: 'Böbrek' },
        { id: 'dm_end', label: 'Diyabet (organ hasarı ile)', weight: 2, category: 'Metabolik' },
        { id: 'tumor', label: 'Solid Tümör (metastazsız)', weight: 2, category: 'Kanser' },
        { id: 'leukemia', label: 'Lösemi', weight: 2, category: 'Kanser' },
        { id: 'lymphoma', label: 'Lenfoma', weight: 2, category: 'Kanser' },
        { id: 'mod_liver', label: 'Orta/Ağır Karaciğer Hastalığı', weight: 3, category: 'Sindirim' },
        { id: 'meta_tumor', label: 'Metastatik Solid Tümör', weight: 6, category: 'Kanser' },
        { id: 'aids', label: 'AIDS', weight: 6, category: 'Enfeksiyon' },
    ];

    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [age, setAge] = useState('');

    const conditionScore = conditions.filter(c => checked[c.id]).reduce((s, c) => s + c.weight, 0);
    const ageNum = parseInt(age) || 0;
    const ageScore = ageNum < 50 ? 0 : ageNum < 60 ? 1 : ageNum < 70 ? 2 : ageNum < 80 ? 3 : 4;
    const total = conditionScore + ageScore;
    const interpretation: 'low' | 'moderate' | 'high' = total <= 2 ? 'low' : total <= 4 ? 'moderate' : 'high';
    const label = total <= 2 ? 'Düşük Hastalık Yükü' : total <= 4 ? 'Orta Hastalık Yükü' : 'Ağır Hastalık Yükü';

    function handleSave() {
        onComplete({
            type: 'Charlson CCI', date: new Date().toLocaleDateString('tr-TR'),
            score: total, maxScore: 33, interpretation, label,
        });
        alert('✅ Charlson CCI kaydedildi!');
    }

    const categories = [...new Set(conditions.map(c => c.category))];

    return (
        <div>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 mb-6">
                <h3 className="text-xl font-bold text-purple-900 mb-2">🏥 Charlson CCI Hakkında</h3>
                <p className="text-purple-800 text-base leading-relaxed">
                    Charlson Komorbiditeler İndeksi (CCI), eşlik eden hastalıkların toplam yükünü ve 10 yıllık sağ kalım tahminini verir.
                    Sarkopeni ve osteoporoz yönetiminde komorbiditeleri değerlendirmek kritik öneme sahiptir.
                </p>
            </div>

            {/* Age */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 mb-5">
                <label className="block text-xl font-bold text-slate-800 mb-3">👤 Yaşınız</label>
                <input
                    type="number" min="18" max="100"
                    value={age} onChange={e => setAge(e.target.value)}
                    placeholder="Yaşınızı girin (örn: 72)"
                    className="border-2 border-gray-300 rounded-xl px-5 py-3 text-xl w-48 focus:outline-none focus:border-purple-500"
                />
                {ageNum > 0 && <p className="text-purple-700 mt-2 text-base font-medium">Yaş puanı: +{ageScore}</p>}
            </div>

            {/* Conditions */}
            {categories.map(cat => (
                <div key={cat} className="bg-white rounded-2xl border-2 border-slate-200 p-5 mb-4">
                    <h4 className="text-lg font-bold text-slate-700 mb-3">🏷️ {cat}</h4>
                    <div className="space-y-2">
                        {conditions.filter(c => c.category === cat).map(c => (
                            <label key={c.id} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all
                                ${checked[c.id] ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'}`}>
                                <input
                                    type="checkbox" checked={!!checked[c.id]}
                                    onChange={e => setChecked(prev => ({ ...prev, [c.id]: e.target.checked }))}
                                    className="w-5 h-5 accent-purple-700 flex-shrink-0"
                                />
                                <span className="text-lg text-slate-800 flex-1">{c.label}</span>
                                <span className={`px-2 py-1 rounded-lg text-sm font-bold flex-shrink-0
                                    ${c.weight === 1 ? 'bg-blue-100 text-blue-800' : c.weight === 2 ? 'bg-orange-100 text-orange-800' : c.weight >= 3 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                    +{c.weight}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            {/* Score Summary */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 mb-5">
                <h4 className="font-bold text-xl text-slate-800 mb-3">📊 Puan Özeti</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-50 rounded-xl p-3">
                        <div className="text-2xl font-bold text-purple-700">{conditionScore}</div>
                        <div className="text-sm text-slate-600">Hastalık Puanı</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                        <div className="text-2xl font-bold text-blue-700">+{ageScore}</div>
                        <div className="text-sm text-slate-600">Yaş Puanı</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 border-2 border-purple-300">
                        <div className="text-2xl font-bold text-purple-900">{total}</div>
                        <div className="text-sm text-slate-600">Toplam CCI</div>
                    </div>
                </div>
            </div>

            {ageNum > 0 && (
                <ScoreDisplay score={total} maxScore={15} interpretation={interpretation} label={label} onSave={handleSave} />
            )}
        </div>
    );
}

// ─── FRAX Simplified ──────────────────────────────────────────────────────────
function FRAXAssessment({ onComplete }: { onComplete: (r: AssessmentResult) => void }) {
    const [form, setForm] = useState<Record<string, string | number>>({});

    const riskFactors = [
        { id: 'prev_fx', label: 'Daha önce kırık geçirdiniz mi? (50 yaş sonrası)', },
        { id: 'parent_hip', label: 'Anne veya babanızın kalça kırığı var mı?', },
        { id: 'smoking', label: 'Halen sigara kullanıyor musunuz?', },
        { id: 'glucocorticoids', label: 'Kortikosteroid (prednizon, kortizon) kullanıyor/kullandınız mı?', },
        { id: 'ra', label: 'Romatoid artritten mustaripsiniz mi?', },
        { id: 'secondary_op', label: 'Tip 1 diyabet, hipertiroid gibi ikincil osteoporoz var mı?', },
        { id: 'alcohol', label: 'Günde 3 veya daha fazla alkol tüketiyor musunuz?', },
    ];

    const age = parseInt(form.age as string) || 0;
    const bmi = parseFloat(form.bmi as string) || 0;
    const answeredRF = riskFactors.filter(r => form[r.id] !== undefined).length;
    const yesCount = riskFactors.filter(r => form[r.id] === 'yes').length;

    let riskScore = 0;
    if (age >= 65) riskScore += 2;
    else if (age >= 55) riskScore += 1;
    if (bmi < 19) riskScore += 2;
    else if (bmi < 23) riskScore += 1;
    riskScore += yesCount;

    const canSubmit = age > 0 && bmi > 0 && answeredRF === riskFactors.length;
    const interpretation: 'low' | 'moderate' | 'high' = riskScore <= 2 ? 'low' : riskScore <= 4 ? 'moderate' : 'high';
    const label = riskScore <= 2 ? 'Düşük Kırık Riski' : riskScore <= 4 ? 'Orta Kırık Riski' : 'Yüksek Kırık Riski!';

    function handleSave() {
        onComplete({
            type: 'FRAX Tarama', date: new Date().toLocaleDateString('tr-TR'),
            score: riskScore, maxScore: 11, interpretation, label,
        });
        alert('✅ FRAX tarama sonucu kaydedildi!');
    }

    return (
        <div>
            <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 mb-6">
                <h3 className="text-xl font-bold text-rose-900 mb-2">🔬 FRAX Hakkında</h3>
                <p className="text-rose-800 text-base leading-relaxed">
                    Bu, FRAX®'in basitleştirilmiş bir tarama versiyonudur. Kesin risk hesabı için
                    <strong> frax.shef.ac.uk</strong> adresini veya doktorunuzu ziyaret edin.
                    Bu araç yüksek riskli hastaları belirlemek için kullanılır.
                </p>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-5">
                <h4 className="text-xl font-bold text-slate-800 mb-4">👤 Kişisel Bilgiler</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-lg font-semibold text-slate-700 mb-2">Cinsiyet</label>
                        <select
                            value={form.gender as string || ''}
                            onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                            className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg w-full focus:outline-none focus:border-rose-500"
                        >
                            <option value="">Seçiniz</option>
                            <option value="female">Kadın</option>
                            <option value="male">Erkek</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-lg font-semibold text-slate-700 mb-2">Yaş</label>
                        <input type="number" min="40" max="90" placeholder="Örn: 67"
                            value={form.age as string || ''}
                            onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                            className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg w-full focus:outline-none focus:border-rose-500"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-semibold text-slate-700 mb-2">Boy (cm)</label>
                        <input type="number" min="120" max="220" placeholder="Örn: 165"
                            value={form.height as string || ''}
                            onChange={e => {
                                const h = parseFloat(e.target.value);
                                const w = parseFloat(form.weight as string);
                                const newBmi = h && w ? parseFloat(((w / ((h / 100) ** 2)).toFixed(1))) : 0;
                                setForm(p => ({ ...p, height: e.target.value, bmi: newBmi || '' }));
                            }}
                            className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg w-full focus:outline-none focus:border-rose-500"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-semibold text-slate-700 mb-2">Kilo (kg)</label>
                        <input type="number" min="30" max="200" placeholder="Örn: 72"
                            value={form.weight as string || ''}
                            onChange={e => {
                                const w = parseFloat(e.target.value);
                                const h = parseFloat(form.height as string);
                                const newBmi = h && w ? parseFloat(((w / ((h / 100) ** 2)).toFixed(1))) : 0;
                                setForm(p => ({ ...p, weight: e.target.value, bmi: newBmi || '' }));
                            }}
                            className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg w-full focus:outline-none focus:border-rose-500"
                        />
                    </div>
                </div>
                {bmi > 0 && (
                    <div className="mt-3 bg-rose-50 rounded-xl p-3">
                        <span className="text-rose-800 font-semibold text-base">
                            VKİ (BMI): {bmi} kg/m²
                            {bmi < 19 ? ' ⚠️ Düşük (osteoporoz riski artar)' : bmi < 25 ? ' ✅ Normal' : bmi < 30 ? ' Normal üstü' : ' ⚠️ Obez'}
                        </span>
                    </div>
                )}
            </div>

            {/* Risk Factors */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-5">
                <h4 className="text-xl font-bold text-slate-800 mb-4">⚠️ Risk Faktörleri</h4>
                <div className="space-y-4">
                    {riskFactors.map(rf => (
                        <div key={rf.id} className={`p-4 border-2 rounded-xl ${form[rf.id] ? (form[rf.id] === 'yes' ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50') : 'border-gray-200'}`}>
                            <p className="text-lg font-semibold text-slate-800 mb-3">{rf.label}</p>
                            <div className="flex gap-3">
                                {['yes', 'no'].map(val => (
                                    <label key={val} className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 cursor-pointer font-bold text-base transition-all
                                        ${form[rf.id] === val ? (val === 'yes' ? 'border-red-500 bg-red-500 text-white' : 'border-green-500 bg-green-500 text-white') : 'border-gray-300 hover:border-gray-400'}`}>
                                        <input type="radio" name={rf.id} value={val}
                                            checked={form[rf.id] === val}
                                            onChange={() => setForm(p => ({ ...p, [rf.id]: val }))}
                                            className="sr-only"
                                        />
                                        {val === 'yes' ? '✓ Evet' : '✗ Hayır'}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {canSubmit && (
                <>
                    <ScoreDisplay score={riskScore} maxScore={11} interpretation={interpretation} label={label} onSave={handleSave} />
                    <div className="mt-4 bg-rose-50 border-2 border-rose-200 rounded-2xl p-5">
                        <h4 className="font-bold text-lg text-rose-900 mb-2">📌 Sonraki Adımlar</h4>
                        {interpretation === 'low' && <p className="text-base">Kırık riski düşük görünüyor. Kemik sağlığını korumak için kalsiyum, D vitamini ve düzenli egzersiz önerilir.</p>}
                        {interpretation === 'moderate' && <p className="text-base">Orta risk. Kemik yoğunluğu ölçümü (DEXA) ve doktor değerlendirmesi önerilir.</p>}
                        {interpretation === 'high' && <p className="text-base text-red-900 font-medium">Yüksek risk! Kemik yoğunluğu ölçümü (DEXA), resmi FRAX hesabı ve tedavi seçenekleri için Op Dr Taner Aksu'ya başvurun.</p>}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel({ history }: { history: AssessmentResult[] }) {
    if (history.length === 0) return (
        <div className="text-center py-12 text-slate-500">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-lg">Henüz kaydedilmiş değerlendirme bulunmuyor.</p>
            <p className="text-base mt-2">Değerlendirme yaptıktan sonra sonuçlarınız burada görünecek.</p>
        </div>
    );

    const bgMap = { low: 'bg-green-50 border-green-300', moderate: 'bg-yellow-50 border-yellow-300', high: 'bg-red-50 border-red-300' };
    const textMap = { low: 'text-green-800', moderate: 'text-yellow-800', high: 'text-red-800' };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Son Değerlendirmeler</h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">{history.length} kayıt</span>
            </div>
            <div className="space-y-3">
                {[...history].reverse().slice(0, 20).map((r, i) => (
                    <div key={i} className={`rounded-2xl border-2 p-4 ${bgMap[r.interpretation]}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <span className="font-bold text-lg text-slate-800">{r.type}</span>
                                <span className="text-slate-500 text-base ml-3">{r.date}</span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-xl text-slate-800">{r.score}/{r.maxScore}</div>
                                <div className={`text-sm font-semibold ${textMap[r.interpretation]}`}>{r.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Assessment Hub ──────────────────────────────────────────────────────
export default function AssessmentHub() {
    const tabs = [
        { key: 'sarcf', label: 'SARC-F', icon: '💪', sub: 'Sarkopeni Taraması' },
        { key: 'tug', label: 'TUG Testi', icon: '🏃', sub: 'Düşme Riski' },
        { key: 'fesi', label: 'FES-I', icon: '😰', sub: 'Düşme Korkusu' },
        { key: 'charlson', label: 'Charlson CCI', icon: '🏥', sub: 'Komorbiditeler' },
        { key: 'frax', label: 'FRAX', icon: '🔬', sub: 'Kırık Riski' },
        { key: 'history', label: 'Geçmiş', icon: '📋', sub: 'Sonuçlarım' },
    ];

    const [activeTab, setActiveTab] = useState('sarcf');
    const [history, setHistory] = useState<AssessmentResult[]>([]);

    useEffect(() => { setHistory(loadHistory()); }, []);

    function handleComplete(result: AssessmentResult) {
        const updated = [...history, result];
        setHistory(updated);
        saveHistory(updated);
    }

    return (
        <div>
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-base border-2 transition-all cursor-pointer
                            ${activeTab === tab.key ? 'bg-blue-800 text-white border-blue-800 shadow-md' : 'bg-white text-blue-800 border-blue-200 hover:border-blue-500 hover:bg-blue-50'}`}
                    >
                        <span className="text-xl">{tab.icon}</span>
                        <span>
                            <div className="font-bold leading-tight">{tab.label}</div>
                            <div className={`text-xs leading-tight ${activeTab === tab.key ? 'text-blue-200' : 'text-slate-500'}`}>{tab.sub}</div>
                        </span>
                        {tab.key === 'history' && history.length > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">{history.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'sarcf' && <SarcFAssessment onComplete={handleComplete} />}
                {activeTab === 'tug' && <TUGAssessment onComplete={handleComplete} />}
                {activeTab === 'fesi' && <FESIAssessment onComplete={handleComplete} />}
                {activeTab === 'charlson' && <CharlsonAssessment onComplete={handleComplete} />}
                {activeTab === 'frax' && <FRAXAssessment onComplete={handleComplete} />}
                {activeTab === 'history' && <HistoryPanel history={history} />}
            </div>
        </div>
    );
}
