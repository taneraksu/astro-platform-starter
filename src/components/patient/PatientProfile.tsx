import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PatientData {
    // Kişisel
    name: string;
    gender: 'Kadın' | 'Erkek' | '';
    age: string;
    bloodType: string;
    // Vücut
    height: string;  // cm
    weight: string;  // kg
    // Kas gücü
    dominantHand: 'Sağ' | 'Sol' | '';
    dominantGrip: string;    // kg
    nonDominantGrip: string; // kg
    // Hastalıklar
    diseases: string[];
    otherDiseases: string;
    // İlaçlar
    medications: string;
    // Lab değerleri
    vitaminD: string;    // ng/mL
    vitaminB12: string;  // pg/mL
    calcium: string;     // mg/dL
    hba1c: string;       // %
    hemoglobin: string;  // g/dL
    creatinine: string;  // mg/dL
    dexaLumbar: string;  // T-skoru
    dexaFemur: string;   // T-skoru
    // Notlar
    notes: string;
    // Meta
    updatedAt: string;
}

const EMPTY_PROFILE: PatientData = {
    name: '', gender: '', age: '', bloodType: '',
    height: '', weight: '',
    dominantHand: '', dominantGrip: '', nonDominantGrip: '',
    diseases: [], otherDiseases: '', medications: '',
    vitaminD: '', vitaminB12: '', calcium: '', hba1c: '',
    hemoglobin: '', creatinine: '', dexaLumbar: '', dexaFemur: '',
    notes: '', updatedAt: '',
};

const DISEASE_LIST = [
    'Tip 2 Diyabet', 'Tip 1 Diyabet', 'Hipertansiyon', 'Koroner Arter Hastalığı',
    'Kalp Yetersizliği', 'İnme / TİA', 'Periferik Damar Hastalığı',
    'KOAH (Kronik Akciğer)', 'Astım', 'Romatoid Artrit', 'Osteoartrit',
    'Osteoporoz', 'Sarkopeni', 'Demans / Alzheimer', 'Parkinson',
    'Depresyon / Anksiyete', 'Kronik Böbrek Hastalığı', 'Karaciğer Hastalığı',
    'Tiroid Hastalığı', 'Gut / Ürik Asit', 'Kanser (remisyon)', 'Epilepsi',
];

const BLOOD_TYPES = ['A Rh+', 'A Rh−', 'B Rh+', 'B Rh−', 'AB Rh+', 'AB Rh−', '0 Rh+', '0 Rh−'];

function loadProfile(): PatientData {
    try {
        const raw = localStorage.getItem('yas_ritmi_patient');
        return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : EMPTY_PROFILE;
    } catch { return EMPTY_PROFILE; }
}
function saveProfile(p: PatientData) {
    localStorage.setItem('yas_ritmi_patient', JSON.stringify(p));
    localStorage.setItem('yas_ritmi_patient_name', p.name);
}

// ─── Interpretation helpers ───────────────────────────────────────────────────
function bmi(h: string, w: string) {
    const hm = parseFloat(h) / 100, wkg = parseFloat(w);
    if (!hm || !wkg) return null;
    const b = wkg / (hm * hm);
    return { val: b.toFixed(1), label: b < 18.5 ? 'Düşük' : b < 25 ? 'Normal' : b < 30 ? 'Fazla Kilolu' : 'Obez', color: b < 18.5 ? 'text-blue-700' : b < 25 ? 'text-green-700' : b < 30 ? 'text-yellow-700' : 'text-red-700' };
}
function gripInterpret(val: string, gender: string) {
    const g = parseFloat(val);
    if (!g || !gender) return null;
    const low = gender === 'Erkek' ? 27 : 16;
    return g < low ? { color: 'text-red-700', label: '⚠️ Düşük (sarkopeni riski)' } : { color: 'text-green-700', label: '✅ Normal' };
}
function labInterpret(key: string, val: string) {
    const v = parseFloat(val);
    if (!v) return null;
    const ranges: Record<string, { low: number; high: number; unit: string }> = {
        vitaminD: { low: 30, high: 100, unit: 'ng/mL' },
        vitaminB12: { low: 200, high: 900, unit: 'pg/mL' },
        calcium: { low: 8.5, high: 10.5, unit: 'mg/dL' },
        hba1c: { low: 0, high: 5.7, unit: '%' },
        hemoglobin: { low: 12, high: 17, unit: 'g/dL' },
        creatinine: { low: 0.5, high: 1.2, unit: 'mg/dL' },
    };
    const r = ranges[key];
    if (!r) return null;
    if (v < r.low) return { color: 'text-red-700 font-bold', label: '↓ Düşük' };
    if (v > r.high) return { color: 'text-red-700 font-bold', label: '↑ Yüksek' };
    return { color: 'text-green-700 font-bold', label: '✓ Normal' };
}
function dexaInterpret(val: string) {
    const v = parseFloat(val);
    if (isNaN(v)) return null;
    if (v >= -1) return { color: 'text-green-700', label: 'Normal' };
    if (v >= -2.5) return { color: 'text-yellow-700', label: 'Osteopeni' };
    return { color: 'text-red-700', label: 'Osteoporoz' };
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden mb-6">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <span className="text-3xl">{icon}</span>
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-lg font-semibold text-slate-700 mb-1">{label}</label>
            {hint && <p className="text-sm text-slate-500 mb-2">{hint}</p>}
            {children}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PatientProfile() {
    const [profile, setProfile] = useState<PatientData>(EMPTY_PROFILE);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'labs' | 'summary'>('profile');

    useEffect(() => { setProfile(loadProfile()); }, []);

    function update(field: keyof PatientData, value: string | string[]) {
        setProfile(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    }
    function toggleDisease(d: string) {
        setProfile(prev => {
            const arr = prev.diseases.includes(d) ? prev.diseases.filter(x => x !== d) : [...prev.diseases, d];
            return { ...prev, diseases: arr };
        });
        setSaved(false);
    }
    function handleSave() {
        const updated = { ...profile, updatedAt: new Date().toLocaleString('tr-TR') };
        saveProfile(updated);
        setProfile(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    const bmiData = bmi(profile.height, profile.weight);
    const domGripInterp = gripInterpret(profile.dominantGrip, profile.gender);
    const nonDomGripInterp = gripInterpret(profile.nonDominantGrip, profile.gender);

    const tabs = [
        { key: 'profile', label: 'Kişisel Bilgiler', icon: '👤' },
        { key: 'labs', label: 'Tetkik Değerleri', icon: '🔬' },
        { key: 'summary', label: 'Profil Özeti', icon: '📋' },
    ] as const;

    return (
        <div>
            {/* Tab Nav */}
            <div className="flex flex-wrap gap-3 mb-8">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-lg border-2 transition-all cursor-pointer
                            ${activeTab === t.key ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-blue-800 border-blue-200 hover:border-blue-500'}`}>
                        <span>{t.icon}</span><span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
                <div>
                    {/* Name — most prominent */}
                    <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white rounded-2xl p-6 mb-6">
                        <label className="block text-xl font-bold text-blue-100 mb-3">👤 Ad Soyad (Karşılama mesajı için gerekli)</label>
                        <input
                            type="text"
                            placeholder="Adınızı ve soyadınızı girin..."
                            value={profile.name}
                            onChange={e => update('name', e.target.value)}
                            className="w-full bg-white text-slate-800 font-bold text-2xl px-5 py-4 rounded-xl border-0 focus:outline-none focus:ring-4 focus:ring-white/30"
                        />
                        {profile.name && (
                            <p className="mt-3 text-blue-200 text-lg">✨ Merhaba, <strong className="text-white">{profile.name}</strong>! Ana sayfada kişisel karşılama mesajınız görünecek.</p>
                        )}
                    </div>

                    <Section title="Kişisel Bilgiler" icon="👤">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <Field label="Cinsiyet">
                                <div className="flex gap-3">
                                    {(['Kadın', 'Erkek'] as const).map(g => (
                                        <label key={g} className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer font-bold text-lg transition-all
                                            ${profile.gender === g ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 hover:border-blue-400'}`}>
                                            <input type="radio" name="gender" value={g} checked={profile.gender === g}
                                                onChange={() => update('gender', g)} className="sr-only" />
                                            {g === 'Kadın' ? '👩' : '👨'} {g}
                                        </label>
                                    ))}
                                </div>
                            </Field>
                            <Field label="Yaş">
                                <input type="number" min="40" max="110" placeholder="Örn: 68"
                                    value={profile.age} onChange={e => update('age', e.target.value)}
                                    className="border-2 border-gray-300 rounded-xl px-4 py-3 text-xl w-full focus:outline-none focus:border-blue-600" />
                            </Field>
                            <Field label="Kan Grubu">
                                <select value={profile.bloodType} onChange={e => update('bloodType', e.target.value)}
                                    className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg w-full focus:outline-none focus:border-blue-600">
                                    <option value="">Seçiniz</option>
                                    {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </Field>
                        </div>
                    </Section>

                    <Section title="Vücut Ölçüleri" icon="📏">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-4">
                            <Field label="Boy (cm)">
                                <input type="number" min="120" max="220" placeholder="Örn: 165"
                                    value={profile.height} onChange={e => update('height', e.target.value)}
                                    className="border-2 border-gray-300 rounded-xl px-4 py-3 text-xl w-full focus:outline-none focus:border-blue-600" />
                            </Field>
                            <Field label="Kilo (kg)">
                                <input type="number" min="30" max="200" placeholder="Örn: 72"
                                    value={profile.weight} onChange={e => update('weight', e.target.value)}
                                    className="border-2 border-gray-300 rounded-xl px-4 py-3 text-xl w-full focus:outline-none focus:border-blue-600" />
                            </Field>
                            {bmiData && (
                                <Field label="VKİ (Otomatik)">
                                    <div className="border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
                                        <span className={`text-3xl font-bold ${bmiData.color}`}>{bmiData.val}</span>
                                        <span className="text-slate-500 text-base"> kg/m²</span>
                                        <div className={`text-base font-semibold mt-1 ${bmiData.color}`}>{bmiData.label}</div>
                                    </div>
                                </Field>
                            )}
                        </div>
                    </Section>

                    <Section title="El Sıkma Kuvveti (Dinamometre)" icon="🤝">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-base text-blue-800">
                            <strong>Neden önemli?</strong> El sıkma kuvveti sarkopeni için en önemli tarama kriterlerinden biridir.
                            Kadınlarda &lt;16 kg, erkeklerde &lt;27 kg düşük kabul edilir (EWGSOP2).
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <Field label="Dominant El">
                                <div className="flex gap-3 mb-3">
                                    {(['Sağ', 'Sol'] as const).map(h => (
                                        <label key={h} className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer font-semibold transition-all
                                            ${profile.dominantHand === h ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 hover:border-blue-400'}`}>
                                            <input type="radio" name="dominantHand" value={h} checked={profile.dominantHand === h}
                                                onChange={() => update('dominantHand', h)} className="sr-only" />
                                            {h}
                                        </label>
                                    ))}
                                </div>
                            </Field>
                            <Field label="Dominant El Kuvveti (kg)" hint={profile.gender ? `Eşik: ${profile.gender === 'Erkek' ? '27' : '16'} kg` : ''}>
                                <input type="number" min="0" max="100" step="0.1" placeholder="Örn: 22.5"
                                    value={profile.dominantGrip} onChange={e => update('dominantGrip', e.target.value)}
                                    className="border-2 border-gray-300 rounded-xl px-4 py-3 text-xl w-full focus:outline-none focus:border-blue-600" />
                                {domGripInterp && <div className={`mt-2 text-base font-semibold ${domGripInterp.color}`}>{domGripInterp.label}</div>}
                            </Field>
                            <Field label="Non-dominant El Kuvveti (kg)">
                                <input type="number" min="0" max="100" step="0.1" placeholder="Örn: 19.0"
                                    value={profile.nonDominantGrip} onChange={e => update('nonDominantGrip', e.target.value)}
                                    className="border-2 border-gray-300 rounded-xl px-4 py-3 text-xl w-full focus:outline-none focus:border-blue-600" />
                                {nonDomGripInterp && <div className={`mt-2 text-base font-semibold ${nonDomGripInterp.color}`}>{nonDomGripInterp.label}</div>}
                            </Field>
                        </div>
                    </Section>

                    <Section title="Hastalıklar" icon="🏥">
                        <p className="text-slate-600 text-base mb-4">Mevcut tanılarınızı işaretleyin:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                            {DISEASE_LIST.map(d => (
                                <label key={d} className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all
                                    ${profile.diseases.includes(d) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                    <input type="checkbox" checked={profile.diseases.includes(d)} onChange={() => toggleDisease(d)}
                                        className="w-5 h-5 accent-blue-700 flex-shrink-0" />
                                    <span className="text-base text-slate-800">{d}</span>
                                </label>
                            ))}
                        </div>
                        <Field label="Diğer Hastalıklar">
                            <input type="text" placeholder="Listede olmayan hastalıklarınızı yazın..."
                                value={profile.otherDiseases} onChange={e => update('otherDiseases', e.target.value)}
                                className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg w-full focus:outline-none focus:border-blue-600" />
                        </Field>
                    </Section>

                    <Section title="Kullanılan İlaçlar" icon="💊">
                        <Field label="İlaçlar ve Dozları" hint="Her ilacı ayrı satıra yazabilirsiniz">
                            <textarea rows={4} placeholder="Örn: Kalsiyum + D3 1200mg/gün&#10;Alendronat 70mg/hafta&#10;Metformin 1000mg 2x1"
                                value={profile.medications} onChange={e => update('medications', e.target.value)}
                                className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg w-full focus:outline-none focus:border-blue-600 resize-none" />
                        </Field>
                    </Section>

                    <Section title="Notlar" icon="📝">
                        <textarea rows={3} placeholder="Doktorunuzun özel notları, anamnez bilgileri..."
                            value={profile.notes} onChange={e => update('notes', e.target.value)}
                            className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg w-full focus:outline-none focus:border-blue-600 resize-none" />
                    </Section>
                </div>
            )}

            {/* ── Labs Tab ── */}
            {activeTab === 'labs' && (
                <div>
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-6">
                        <p className="text-amber-800 text-base">
                            💡 Tetkik sonuçlarınızı buraya girin. Normal aralık dışında olanlar otomatik vurgulanır.
                            Bu bilgiler sarkopeni ve osteoporoz yönetiminde kritik öneme sahiptir.
                        </p>
                    </div>

                    <Section title="Vitamin & Mineral Değerleri" icon="🧪">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { key: 'vitaminD', label: 'D Vitamini (25-OH-D3)', unit: 'ng/mL', normal: '30–100', placeholder: 'Örn: 24.5' },
                                { key: 'vitaminB12', label: 'B12 Vitamini', unit: 'pg/mL', normal: '200–900', placeholder: 'Örn: 340' },
                                { key: 'calcium', label: 'Kalsiyum', unit: 'mg/dL', normal: '8.5–10.5', placeholder: 'Örn: 9.2' },
                            ].map(lab => {
                                const interp = labInterpret(lab.key, profile[lab.key as keyof PatientData] as string);
                                return (
                                    <Field key={lab.key} label={lab.label} hint={`Normal: ${lab.normal} ${lab.unit}`}>
                                        <div className="flex gap-2 items-center">
                                            <input type="number" step="0.1" placeholder={lab.placeholder}
                                                value={profile[lab.key as keyof PatientData] as string}
                                                onChange={e => update(lab.key as keyof PatientData, e.target.value)}
                                                className="border-2 border-gray-300 rounded-xl px-4 py-3 text-xl flex-1 focus:outline-none focus:border-blue-600" />
                                            <span className="text-slate-500 text-sm font-medium flex-shrink-0">{lab.unit}</span>
                                        </div>
                                        {interp && <div className={`mt-1 text-base ${interp.color}`}>{interp.label}</div>}
                                    </Field>
                                );
                            })}
                        </div>
                    </Section>

                    <Section title="Kan Tetkikleri" icon="🩸">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[
                                { key: 'hba1c', label: 'HbA1c (Şeker)', unit: '%', normal: '<5.7', placeholder: 'Örn: 6.2' },
                                { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', normal: 'K:12–16, E:13.5–17.5', placeholder: 'Örn: 13.2' },
                                { key: 'creatinine', label: 'Kreatinin', unit: 'mg/dL', normal: '0.5–1.2', placeholder: 'Örn: 0.9' },
                            ].map(lab => {
                                const interp = labInterpret(lab.key, profile[lab.key as keyof PatientData] as string);
                                return (
                                    <Field key={lab.key} label={lab.label} hint={`Normal: ${lab.normal} ${lab.unit}`}>
                                        <div className="flex gap-2 items-center">
                                            <input type="number" step="0.01" placeholder={lab.placeholder}
                                                value={profile[lab.key as keyof PatientData] as string}
                                                onChange={e => update(lab.key as keyof PatientData, e.target.value)}
                                                className="border-2 border-gray-300 rounded-xl px-4 py-3 text-xl flex-1 focus:outline-none focus:border-blue-600" />
                                            <span className="text-slate-500 text-sm font-medium flex-shrink-0">{lab.unit}</span>
                                        </div>
                                        {interp && <div className={`mt-1 text-base ${interp.color}`}>{interp.label}</div>}
                                    </Field>
                                );
                            })}
                        </div>
                    </Section>

                    <Section title="Kemik Yoğunluğu (DEXA — T-Skoru)" icon="🦴">
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4 text-base text-purple-800">
                            T-skoru: ≥ −1.0 = Normal | −1.0 ile −2.5 = Osteopeni | ≤ −2.5 = Osteoporoz
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {[
                                { key: 'dexaLumbar', label: 'Lomber Omurga (L1-L4)' },
                                { key: 'dexaFemur', label: 'Femur Boynu (Kalça)' },
                            ].map(dexa => {
                                const interp = dexaInterpret(profile[dexa.key as keyof PatientData] as string);
                                return (
                                    <Field key={dexa.key} label={`DEXA T-Skoru — ${dexa.label}`} hint="Örn: -1.8 veya -2.7">
                                        <input type="number" step="0.1" min="-5" max="3" placeholder="Örn: -1.8"
                                            value={profile[dexa.key as keyof PatientData] as string}
                                            onChange={e => update(dexa.key as keyof PatientData, e.target.value)}
                                            className="border-2 border-gray-300 rounded-xl px-4 py-3 text-xl w-full focus:outline-none focus:border-blue-600" />
                                        {interp && <div className={`mt-2 text-base font-bold ${interp.color}`}>{interp.label}</div>}
                                    </Field>
                                );
                            })}
                        </div>
                    </Section>
                </div>
            )}

            {/* ── Summary Tab ── */}
            {activeTab === 'summary' && (
                <div>
                    {!profile.name ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">👤</div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-2">Profil henüz doldurulmadı</h3>
                            <p className="text-slate-500 text-lg mb-5">Kişisel Bilgiler sekmesinden profilinizi oluşturun.</p>
                            <button onClick={() => setActiveTab('profile')}
                                className="bg-blue-800 text-white font-bold px-8 py-4 rounded-xl text-lg cursor-pointer hover:bg-blue-900 transition-all">
                                Profili Doldur
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Identity Card */}
                            <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white rounded-2xl p-6">
                                <div className="flex items-start gap-5">
                                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
                                        {profile.gender === 'Kadın' ? '👩' : profile.gender === 'Erkek' ? '👨' : '👤'}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
                                        <div className="flex flex-wrap gap-3 mt-2">
                                            {profile.gender && <span className="bg-white/20 px-3 py-1 rounded-lg text-base">{profile.gender}</span>}
                                            {profile.age && <span className="bg-white/20 px-3 py-1 rounded-lg text-base">{profile.age} yaş</span>}
                                            {profile.bloodType && <span className="bg-white/20 px-3 py-1 rounded-lg text-base">Kan: {profile.bloodType}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Boy', val: profile.height ? `${profile.height} cm` : '—', icon: '📏' },
                                    { label: 'Kilo', val: profile.weight ? `${profile.weight} kg` : '—', icon: '⚖️' },
                                    { label: 'VKİ', val: bmiData ? `${bmiData.val} (${bmiData.label})` : '—', icon: '📊' },
                                    { label: 'El Kuvveti', val: profile.dominantGrip ? `${profile.dominantGrip} kg` : '—', icon: '🤝' },
                                ].map((m, i) => (
                                    <div key={i} className="bg-white rounded-xl border-2 border-slate-200 p-4 text-center">
                                        <div className="text-3xl mb-1">{m.icon}</div>
                                        <div className="font-bold text-slate-800 text-lg">{m.val}</div>
                                        <div className="text-slate-500 text-sm">{m.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Diseases */}
                            {(profile.diseases.length > 0 || profile.otherDiseases) && (
                                <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
                                    <h3 className="text-xl font-bold text-slate-800 mb-3">🏥 Hastalıklar</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.diseases.map(d => (
                                            <span key={d} className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full text-base font-medium">{d}</span>
                                        ))}
                                        {profile.otherDiseases && (
                                            <span className="bg-orange-100 text-orange-800 border border-orange-300 px-3 py-1 rounded-full text-base">{profile.otherDiseases}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Medications */}
                            {profile.medications && (
                                <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
                                    <h3 className="text-xl font-bold text-slate-800 mb-3">💊 İlaçlar</h3>
                                    <pre className="text-base text-slate-700 whitespace-pre-wrap font-sans">{profile.medications}</pre>
                                </div>
                            )}

                            {/* Lab Summary */}
                            {(profile.vitaminD || profile.vitaminB12 || profile.dexaLumbar || profile.dexaFemur) && (
                                <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
                                    <h3 className="text-xl font-bold text-slate-800 mb-3">🔬 Tetkik Özeti</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {[
                                            { label: 'D Vitamini', val: profile.vitaminD, unit: 'ng/mL', key: 'vitaminD' },
                                            { label: 'B12', val: profile.vitaminB12, unit: 'pg/mL', key: 'vitaminB12' },
                                            { label: 'Kalsiyum', val: profile.calcium, unit: 'mg/dL', key: 'calcium' },
                                            { label: 'HbA1c', val: profile.hba1c, unit: '%', key: 'hba1c' },
                                            { label: 'DEXA Lomber', val: profile.dexaLumbar, unit: 'T-skoru', key: 'dexa' },
                                            { label: 'DEXA Femur', val: profile.dexaFemur, unit: 'T-skoru', key: 'dexa' },
                                        ].filter(l => l.val).map((l, i) => {
                                            const interp = l.key === 'dexa' ? dexaInterpret(l.val) : labInterpret(l.key, l.val);
                                            return (
                                                <div key={i} className="bg-slate-50 rounded-xl p-3">
                                                    <div className="text-sm text-slate-500 font-medium">{l.label}</div>
                                                    <div className="text-xl font-bold text-slate-800">{l.val} <span className="text-sm text-slate-400">{l.unit}</span></div>
                                                    {interp && <div className={`text-sm font-semibold ${interp.color}`}>{interp.label}</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {profile.updatedAt && (
                                <p className="text-slate-400 text-sm text-center">Son güncelleme: {profile.updatedAt}</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Save Button */}
            <div className="sticky bottom-4 mt-6">
                <button onClick={handleSave}
                    className={`w-full py-5 rounded-2xl font-bold text-xl cursor-pointer transition-all shadow-xl
                        ${saved ? 'bg-green-600 text-white' : 'bg-blue-800 hover:bg-blue-900 text-white'}`}>
                    {saved ? '✅ Profil Kaydedildi!' : '💾 Profili Kaydet'}
                </button>
            </div>
        </div>
    );
}
