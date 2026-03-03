import { useState, useEffect } from 'react';
import type { ClinicalProfile, HbA1cRecord, UlcerEpisode, AmputationRecord, AntibioticRecord, AllergyRecord } from '../../utils/storage';

interface Props { patientId: string; doctorId: string; }

const s = {
    card: { background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' } as React.CSSProperties,
    sectionTitle: { fontSize: '1rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' } as React.CSSProperties,
    label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.9rem' } as React.CSSProperties,
    inp: { width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.95rem', boxSizing: 'border-box' as const, marginBottom: '0.75rem' },
    row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem' } as React.CSSProperties,
    toggle: (on: boolean) => ({ padding: '0.5rem 1rem', border: `2px solid ${on ? '#1d4ed8' : '#e2e8f0'}`, background: on ? '#eff6ff' : 'white', color: on ? '#1d4ed8' : '#64748b', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: on ? 700 : 400, fontSize: '0.88rem' }) as React.CSSProperties,
    badge: (c: string) => ({ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: `${c}15`, color: c, border: `1px solid ${c}40`, borderRadius: '999px', padding: '0.25rem 0.625rem', fontSize: '0.8rem', fontWeight: 600 }) as React.CSSProperties,
    addBtn: { background: '#f0f9ff', color: '#0369a1', border: '1.5px dashed #7dd3fc', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 } as React.CSSProperties,
    rmBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem 0.5rem', fontWeight: 700 } as React.CSSProperties,
    saveBtn: { width: '100%', padding: '0.875rem', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' } as React.CSSProperties,
};

const empty: Omit<ClinicalProfile, 'id' | 'updatedAt'> = {
    patientId: '', doctorId: '',
    gender: 'male', smokingStatus: 'never', alcoholStatus: 'never',
    mobilityLevel: 'independent', homeCareSupport: false,
    diabetesType: 'T2', treatmentInsulin: false, treatmentOral: false,
    treatmentGLP1: false, treatmentSGLT2: false,
    hba1cRecords: [], hypoglycemiaHistory: false,
    ulcerHistory: false, ulcerEpisodes: [],
    amputationHistory: false, amputations: [],
    charcotStatus: 'none', padHistory: false, revascularizationHistory: false,
    ckd: false, dialysis: false, transplant: false,
    coronaryArteryDisease: false, heartFailure: false, stroke: false,
    atrialFibrillation: false, retinopathy: false, depression: false,
    cognitiveImpairment: false,
    antiplatelet: false, anticoagulant: false, statin: false,
    immunosuppression: false, steroids: false,
    currentAntibiotics: [], allergies: [],
};

function Chk({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button type="button" style={s.toggle(value)} onClick={() => onChange(!value)}>
            {value ? '✓' : '○'} {label}
        </button>
    );
}

function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <div>
            <label style={s.label}>{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)} style={{ ...s.inp, marginBottom: 0 }}>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

export default function ClinicalProfileTab({ patientId, doctorId }: Props) {
    const [profile, setProfile] = useState<any>({ ...empty, patientId, doctorId });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/klinik-profil?patientId=${patientId}`)
            .then(r => r.json())
            .then(d => {
                if (d) setProfile({ ...empty, ...d, patientId, doctorId });
            })
            .finally(() => setLoading(false));
    }, [patientId]);

    function set(key: string, value: any) {
        setProfile((p: any) => ({ ...p, [key]: value }));
    }

    // HbA1c records
    function addHba1c() {
        set('hba1cRecords', [...(profile.hba1cRecords ?? []), { date: '', value: '', lab: '' }]);
    }
    function updateHba1c(i: number, key: string, val: string) {
        const arr = [...(profile.hba1cRecords ?? [])];
        arr[i] = { ...arr[i], [key]: val };
        set('hba1cRecords', arr);
    }
    function removeHba1c(i: number) {
        set('hba1cRecords', profile.hba1cRecords.filter((_: any, idx: number) => idx !== i));
    }

    // Ulcer episodes
    function addUlcer() {
        set('ulcerEpisodes', [...(profile.ulcerEpisodes ?? []), { date: '', location: '', outcome: '' }]);
    }
    function updateUlcer(i: number, key: string, val: string) {
        const arr = [...(profile.ulcerEpisodes ?? [])];
        arr[i] = { ...arr[i], [key]: val };
        set('ulcerEpisodes', arr);
    }
    function removeUlcer(i: number) {
        set('ulcerEpisodes', profile.ulcerEpisodes.filter((_: any, idx: number) => idx !== i));
    }

    // Amputations
    function addAmputation() {
        set('amputations', [...(profile.amputations ?? []), { date: '', level: 'toe', side: 'left', digit: '' }]);
    }
    function updateAmputation(i: number, key: string, val: string) {
        const arr = [...(profile.amputations ?? [])];
        arr[i] = { ...arr[i], [key]: val };
        set('amputations', arr);
    }
    function removeAmputation(i: number) {
        set('amputations', profile.amputations.filter((_: any, idx: number) => idx !== i));
    }

    // Antibiotics
    function addAntibiotic() {
        set('currentAntibiotics', [...(profile.currentAntibiotics ?? []), { name: '', startDate: '', endDate: '', changedByCulture: false, cultureResult: '' }]);
    }
    function updateAntibiotic(i: number, key: string, val: any) {
        const arr = [...(profile.currentAntibiotics ?? [])];
        arr[i] = { ...arr[i], [key]: val };
        set('currentAntibiotics', arr);
    }
    function removeAntibiotic(i: number) {
        set('currentAntibiotics', profile.currentAntibiotics.filter((_: any, idx: number) => idx !== i));
    }

    // Allergies
    function addAllergy() {
        set('allergies', [...(profile.allergies ?? []), { allergen: '', type: 'drug', reaction: '' }]);
    }
    function updateAllergy(i: number, key: string, val: string) {
        const arr = [...(profile.allergies ?? [])];
        arr[i] = { ...arr[i], [key]: val };
        set('allergies', arr);
    }
    function removeAllergy(i: number) {
        set('allergies', profile.allergies.filter((_: any, idx: number) => idx !== i));
    }

    async function handleSave() {
        setSaving(true); setError(''); setSaved(false);
        try {
            const bmi = profile.heightCm && profile.weightKg
                ? parseFloat((profile.weightKg / ((profile.heightCm / 100) ** 2)).toFixed(1))
                : undefined;
            const res = await fetch('/api/klinik-profil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...profile, bmi }),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error); return; }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch { setError('Sunucu hatası.'); }
        finally { setSaving(false); }
    }

    if (loading) return <p style={{ color: '#94a3b8', padding: '1rem' }}>Yükleniyor...</p>;

    const bmi = profile.heightCm && profile.weightKg
        ? (profile.weightKg / ((profile.heightCm / 100) ** 2)).toFixed(1)
        : null;

    return (
        <div>
            {/* A - Kimlik ve Sosyal */}
            <div style={s.card}>
                <p style={s.sectionTitle}>A — Kimlik ve Sosyal Bilgiler</p>
                <div style={s.row}>
                    <Sel label="Cinsiyet" value={profile.gender} onChange={v => set('gender', v)} options={[{ value: 'male', label: 'Erkek' }, { value: 'female', label: 'Kadın' }, { value: 'other', label: 'Diğer' }]} />
                </div>
                <div style={s.row}>
                    <div>
                        <label style={s.label}>Acil İletişim Kişisi</label>
                        <input style={s.inp} value={profile.emergencyContactName ?? ''} onChange={e => set('emergencyContactName', e.target.value)} placeholder="Ad Soyad" />
                    </div>
                    <div>
                        <label style={s.label}>Acil Telefon</label>
                        <input style={s.inp} value={profile.emergencyContactPhone ?? ''} onChange={e => set('emergencyContactPhone', e.target.value)} placeholder="0555 000 0000" />
                    </div>
                </div>
                <div style={s.row}>
                    <div>
                        <label style={s.label}>Boy (cm)</label>
                        <input style={s.inp} type="number" min="100" max="220" value={profile.heightCm ?? ''} onChange={e => set('heightCm', +e.target.value || undefined)} />
                    </div>
                    <div>
                        <label style={s.label}>Kilo (kg)</label>
                        <input style={s.inp} type="number" min="20" max="300" value={profile.weightKg ?? ''} onChange={e => set('weightKg', +e.target.value || undefined)} />
                    </div>
                    <div>
                        <label style={s.label}>BMI (otomatik)</label>
                        <div style={{ padding: '0.625rem 0.75rem', background: '#f8fafc', borderRadius: '0.5rem', fontWeight: 700, color: bmi && +bmi >= 30 ? '#dc2626' : bmi && +bmi >= 25 ? '#ca8a04' : '#16a34a', marginBottom: '0.75rem' }}>
                            {bmi ?? '—'}
                        </div>
                    </div>
                </div>
                <div style={{ ...s.row, marginBottom: '0.75rem' }}>
                    <Sel label="Sigara" value={profile.smokingStatus} onChange={v => set('smokingStatus', v)} options={[{ value: 'never', label: 'Hiç içmedi' }, { value: 'former', label: 'Bıraktı' }, { value: 'active', label: 'İçiyor' }]} />
                    <Sel label="Alkol" value={profile.alcoholStatus} onChange={v => set('alcoholStatus', v)} options={[{ value: 'never', label: 'Yok' }, { value: 'occasional', label: 'Ara sıra' }, { value: 'regular', label: 'Düzenli' }]} />
                    <Sel label="Mobilite" value={profile.mobilityLevel} onChange={v => set('mobilityLevel', v)} options={[{ value: 'independent', label: 'Bağımsız' }, { value: 'with_aid', label: 'Yardımcıyla' }, { value: 'wheelchair', label: 'Tekerlekli sandalye' }, { value: 'bed_bound', label: 'Yatağa bağımlı' }]} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
                    <Chk label="Evde bakım desteği var" value={profile.homeCareSupport} onChange={v => set('homeCareSupport', v)} />
                </div>
                {profile.homeCareSupport && (
                    <input style={{ ...s.inp, marginTop: '0.5rem' }} value={profile.homeCareType ?? ''} onChange={e => set('homeCareType', e.target.value)} placeholder="Bakım tipi (aile, profesyonel hemşire, vb.)" />
                )}
            </div>

            {/* B - Diyabet ve Metabolik */}
            <div style={s.card}>
                <p style={s.sectionTitle}>B — Diyabet ve Metabolik Durum</p>
                <div style={s.row}>
                    <Sel label="Diyabet Tipi" value={profile.diabetesType} onChange={v => set('diabetesType', v)} options={[{ value: 'T1', label: 'Tip 1' }, { value: 'T2', label: 'Tip 2' }, { value: 'LADA', label: 'LADA' }, { value: 'MODY', label: 'MODY' }, { value: 'other', label: 'Diğer' }]} />
                    <div>
                        <label style={s.label}>Tanı Yılı</label>
                        <input style={s.inp} type="number" min="1950" max={new Date().getFullYear()} value={profile.diagnosisYear ?? ''} onChange={e => set('diagnosisYear', +e.target.value || undefined)} placeholder="örn. 2010" />
                    </div>
                </div>
                <p style={{ ...s.label, marginBottom: '0.5rem' }}>Tedavi</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                    <Chk label="İnsülin" value={profile.treatmentInsulin} onChange={v => set('treatmentInsulin', v)} />
                    <Chk label="Oral Ajan" value={profile.treatmentOral} onChange={v => set('treatmentOral', v)} />
                    <Chk label="GLP-1" value={profile.treatmentGLP1} onChange={v => set('treatmentGLP1', v)} />
                    <Chk label="SGLT2" value={profile.treatmentSGLT2} onChange={v => set('treatmentSGLT2', v)} />
                </div>
                {profile.treatmentInsulin && <input style={s.inp} value={profile.insulinType ?? ''} onChange={e => set('insulinType', e.target.value)} placeholder="İnsülin tipi / dozu (örn. glargine 20 ü)" />}
                {profile.treatmentOral && <input style={s.inp} value={profile.oralAgentNames ?? ''} onChange={e => set('oralAgentNames', e.target.value)} placeholder="Oral ajan adları (örn. metformin 1000 mg)" />}
                {profile.treatmentGLP1 && <input style={s.inp} value={profile.treatmentOther ?? ''} onChange={e => set('treatmentOther', e.target.value)} placeholder="GLP-1/SGLT2 / diğer ilaç adı" />}

                <p style={{ ...s.label, marginBottom: '0.5rem', marginTop: '0.5rem' }}>HbA1c Kayıtları</p>
                {(profile.hba1cRecords ?? []).map((r: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <input style={{ ...s.inp, marginBottom: 0, flex: '1' }} type="date" value={r.date} onChange={e => updateHba1c(i, 'date', e.target.value)} />
                        <input style={{ ...s.inp, marginBottom: 0, width: '70px' }} type="number" step="0.1" min="4" max="20" value={r.value} onChange={e => updateHba1c(i, 'value', e.target.value)} placeholder="%" />
                        <input style={{ ...s.inp, marginBottom: 0, flex: '1' }} value={r.lab ?? ''} onChange={e => updateHba1c(i, 'lab', e.target.value)} placeholder="Lab" />
                        <button type="button" style={s.rmBtn} onClick={() => removeHba1c(i)}>✕</button>
                    </div>
                ))}
                <button type="button" style={s.addBtn} onClick={addHba1c}>+ HbA1c ekle</button>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginTop: '0.75rem' }}>
                    <Chk label="Hipoglisemi öyküsü" value={profile.hypoglycemiaHistory} onChange={v => set('hypoglycemiaHistory', v)} />
                </div>
                {profile.hypoglycemiaHistory && (
                    <input style={{ ...s.inp, marginTop: '0.5rem' }} value={profile.glycemicVariabilityNotes ?? ''} onChange={e => set('glycemicVariabilityNotes', e.target.value)} placeholder="Glisemik değişkenlik notu" />
                )}
            </div>

            {/* C - Eşlik Eden Hastalıklar */}
            <div style={s.card}>
                <p style={s.sectionTitle}>C — Eşlik Eden Hastalıklar ve Ayak Riski</p>

                {/* Ulcer history */}
                <div style={{ marginBottom: '0.75rem' }}>
                    <Chk label="Önceki ülser öyküsü" value={profile.ulcerHistory} onChange={v => set('ulcerHistory', v)} />
                    {profile.ulcerHistory && (
                        <div style={{ marginTop: '0.5rem' }}>
                            {(profile.ulcerEpisodes ?? []).map((ep: any, i: number) => (
                                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                    <input style={{ ...s.inp, marginBottom: 0, width: '130px' }} type="date" value={ep.date} onChange={e => updateUlcer(i, 'date', e.target.value)} />
                                    <input style={{ ...s.inp, marginBottom: 0, flex: '1' }} value={ep.location} onChange={e => updateUlcer(i, 'location', e.target.value)} placeholder="Lokalizasyon (örn. plantar 1. met)" />
                                    <input style={{ ...s.inp, marginBottom: 0, flex: '1' }} value={ep.outcome ?? ''} onChange={e => updateUlcer(i, 'outcome', e.target.value)} placeholder="Sonuç" />
                                    <button type="button" style={s.rmBtn} onClick={() => removeUlcer(i)}>✕</button>
                                </div>
                            ))}
                            <button type="button" style={s.addBtn} onClick={addUlcer}>+ Ülser atağı ekle</button>
                        </div>
                    )}
                </div>

                {/* Amputation history */}
                <div style={{ marginBottom: '0.75rem' }}>
                    <Chk label="Önceki amputasyon öyküsü" value={profile.amputationHistory} onChange={v => set('amputationHistory', v)} />
                    {profile.amputationHistory && (
                        <div style={{ marginTop: '0.5rem' }}>
                            {(profile.amputations ?? []).map((a: any, i: number) => (
                                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
                                    <input style={{ ...s.inp, marginBottom: 0, width: '130px' }} type="date" value={a.date} onChange={e => updateAmputation(i, 'date', e.target.value)} />
                                    <select style={{ ...s.inp, marginBottom: 0, width: '150px' }} value={a.level} onChange={e => updateAmputation(i, 'level', e.target.value)}>
                                        {[['toe','Parmak'],['ray','Işın (Ray)'],['transmetatarsal','Transmetatarsal'],['BKA','BKA (diz altı)'],['AKA','AKA (diz üstü)']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                    <select style={{ ...s.inp, marginBottom: 0, width: '90px' }} value={a.side} onChange={e => updateAmputation(i, 'side', e.target.value)}>
                                        <option value="left">Sol</option><option value="right">Sağ</option>
                                    </select>
                                    <input style={{ ...s.inp, marginBottom: 0, width: '80px' }} value={a.digit ?? ''} onChange={e => updateAmputation(i, 'digit', e.target.value)} placeholder="Parmak" />
                                    <button type="button" style={s.rmBtn} onClick={() => removeAmputation(i)}>✕</button>
                                </div>
                            ))}
                            <button type="button" style={s.addBtn} onClick={addAmputation}>+ Amputasyon ekle</button>
                        </div>
                    )}
                </div>

                {/* Charcot */}
                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={s.label}>Charcot Nöro-osteoartropati</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                        {[['none','Yok'],['active','Aktif'],['old','Eski/İyileşmiş']].map(([v,l]) => (
                            <button key={v} type="button" style={s.toggle(profile.charcotStatus === v)} onClick={() => set('charcotStatus', v)}>{l}</button>
                        ))}
                    </div>
                    {profile.charcotStatus !== 'none' && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const, marginTop: '0.5rem' }}>
                            {[['left','Sol'],['right','Sağ'],['both','Her ikisi']].map(([v,l]) => (
                                <button key={v} type="button" style={s.toggle(profile.charcotFoot === v)} onClick={() => set('charcotFoot', v)}>{l}</button>
                            ))}
                        </div>
                    )}
                    {profile.charcotStatus === 'active' && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <label style={s.label}>Eichenholtz Evresi</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                                {[0,1,2,3].map(st => (
                                    <button key={st} type="button" style={s.toggle(profile.eichenholtzStage === st)} onClick={() => set('eichenholtzStage', st)}>Evre {st}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* PAD */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                    <Chk label="PAD öyküsü" value={profile.padHistory} onChange={v => set('padHistory', v)} />
                    <Chk label="Revaskülarizasyon öyküsü" value={profile.revascularizationHistory} onChange={v => set('revascularizationHistory', v)} />
                </div>
                {profile.revascularizationHistory && (
                    <input style={{ ...s.inp, marginBottom: '0.75rem' }} value={profile.revascularizationDetails ?? ''} onChange={e => set('revascularizationDetails', e.target.value)} placeholder="Revaskülarizasyon detayı (tip, tarih, sonuç)" />
                )}

                {/* Kidney */}
                <p style={{ ...s.label, marginBottom: '0.5rem' }}>Böbrek / Renal</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginBottom: '0.5rem' }}>
                    <Chk label="KBH" value={profile.ckd} onChange={v => set('ckd', v)} />
                    <Chk label="Diyaliz" value={profile.dialysis} onChange={v => set('dialysis', v)} />
                    <Chk label="Transplant" value={profile.transplant} onChange={v => set('transplant', v)} />
                </div>
                {profile.ckd && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                        {[1,2,3,4,5].map(st => (
                            <button key={st} type="button" style={s.toggle(profile.ckdStage === st)} onClick={() => set('ckdStage', st)}>Evre {st}</button>
                        ))}
                    </div>
                )}

                {/* Cardiovascular */}
                <p style={{ ...s.label, marginBottom: '0.5rem' }}>Kardiyovasküler</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                    <Chk label="KAH" value={profile.coronaryArteryDisease} onChange={v => set('coronaryArteryDisease', v)} />
                    <Chk label="Kalp yetmezliği" value={profile.heartFailure} onChange={v => set('heartFailure', v)} />
                    <Chk label="İnme" value={profile.stroke} onChange={v => set('stroke', v)} />
                    <Chk label="AF" value={profile.atrialFibrillation} onChange={v => set('atrialFibrillation', v)} />
                </div>

                {/* Other */}
                <p style={{ ...s.label, marginBottom: '0.5rem' }}>Diğer Komorbiditeler</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                    <Chk label="Retinopati" value={profile.retinopathy} onChange={v => set('retinopathy', v)} />
                    <Chk label="Depresyon" value={profile.depression} onChange={v => set('depression', v)} />
                    <Chk label="Kognitif bozukluk" value={profile.cognitiveImpairment} onChange={v => set('cognitiveImpairment', v)} />
                </div>
                <input style={s.inp} value={profile.otherComorbidities ?? ''} onChange={e => set('otherComorbidities', e.target.value)} placeholder="Diğer komorbiditeler (serbest metin)" />
            </div>

            {/* D - İlaçlar ve Alerjiler */}
            <div style={s.card}>
                <p style={s.sectionTitle}>D — İlaçlar ve Alerjiler</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                    <Chk label="Antiplatelet" value={profile.antiplatelet} onChange={v => set('antiplatelet', v)} />
                    <Chk label="Antikoagülan" value={profile.anticoagulant} onChange={v => set('anticoagulant', v)} />
                    <Chk label="Statin" value={profile.statin} onChange={v => set('statin', v)} />
                    <Chk label="İmmünsüpresyon" value={profile.immunosuppression} onChange={v => set('immunosuppression', v)} />
                    <Chk label="Steroid" value={profile.steroids} onChange={v => set('steroids', v)} />
                </div>
                {profile.antiplatelet && <input style={s.inp} value={profile.antiplateletNames ?? ''} onChange={e => set('antiplateletNames', e.target.value)} placeholder="Antiplatelet isimleri (ASA 100 mg, klopidogrel vb.)" />}
                {profile.anticoagulant && <input style={s.inp} value={profile.anticoagulantNames ?? ''} onChange={e => set('anticoagulantNames', e.target.value)} placeholder="Antikoagülan isimleri (warfarin, DMAH vb.)" />}
                {profile.statin && <input style={s.inp} value={profile.statinName ?? ''} onChange={e => set('statinName', e.target.value)} placeholder="Statin adı / dozu" />}
                {profile.immunosuppression && <input style={s.inp} value={profile.immunosuppressionDetails ?? ''} onChange={e => set('immunosuppressionDetails', e.target.value)} placeholder="İmmünsüpresyon detayı" />}
                {profile.steroids && <input style={s.inp} value={profile.steroidDetails ?? ''} onChange={e => set('steroidDetails', e.target.value)} placeholder="Steroid adı / dozu / süresi" />}
                <div>
                    <label style={s.label}>Antihipertansifler</label>
                    <input style={s.inp} value={profile.antihypertensives ?? ''} onChange={e => set('antihypertensives', e.target.value)} placeholder="Antihipertansif ilaçlar" />
                </div>

                <p style={{ ...s.label, marginBottom: '0.5rem', marginTop: '0.25rem' }}>Antibiyotikler (Aktif / Son Kullanılan)</p>
                {(profile.currentAntibiotics ?? []).map((ab: any, i: number) => (
                    <div key={i} style={{ background: '#f8fafc', borderRadius: '0.625rem', padding: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <input style={{ ...s.inp, marginBottom: 0, flex: '2' }} value={ab.name} onChange={e => updateAntibiotic(i, 'name', e.target.value)} placeholder="Antibiyotik adı / dozu" />
                            <input style={{ ...s.inp, marginBottom: 0, flex: '1' }} type="date" value={ab.startDate} onChange={e => updateAntibiotic(i, 'startDate', e.target.value)} />
                            <input style={{ ...s.inp, marginBottom: 0, flex: '1' }} type="date" value={ab.endDate ?? ''} onChange={e => updateAntibiotic(i, 'endDate', e.target.value)} />
                            <button type="button" style={s.rmBtn} onClick={() => removeAntibiotic(i)}>✕</button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <Chk label="Kültüre göre değiştirildi" value={ab.changedByCulture} onChange={v => updateAntibiotic(i, 'changedByCulture', v)} />
                            {ab.changedByCulture && <input style={{ ...s.inp, marginBottom: 0, flex: '1' }} value={ab.cultureResult ?? ''} onChange={e => updateAntibiotic(i, 'cultureResult', e.target.value)} placeholder="Kültür sonucu" />}
                        </div>
                    </div>
                ))}
                <button type="button" style={s.addBtn} onClick={addAntibiotic}>+ Antibiyotik ekle</button>

                <p style={{ ...s.label, marginTop: '1rem', marginBottom: '0.5rem' }}>Alerjiler</p>
                {(profile.allergies ?? []).map((al: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <input style={{ ...s.inp, marginBottom: 0, flex: '2' }} value={al.allergen} onChange={e => updateAllergy(i, 'allergen', e.target.value)} placeholder="Alerjen (ilaç adı, lateks vb.)" />
                        <select style={{ ...s.inp, marginBottom: 0, width: '110px' }} value={al.type} onChange={e => updateAllergy(i, 'type', e.target.value)}>
                            <option value="drug">İlaç</option>
                            <option value="latex">Lateks</option>
                            <option value="food">Besin</option>
                            <option value="other">Diğer</option>
                        </select>
                        <input style={{ ...s.inp, marginBottom: 0, flex: '1' }} value={al.reaction ?? ''} onChange={e => updateAllergy(i, 'reaction', e.target.value)} placeholder="Reaksiyon" />
                        <button type="button" style={s.rmBtn} onClick={() => removeAllergy(i)}>✕</button>
                    </div>
                ))}
                <button type="button" style={s.addBtn} onClick={addAllergy}>+ Alerji ekle</button>
            </div>

            {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#b91c1c', marginBottom: '1rem' }}>{error}</div>}
            {saved && <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '0.5rem', padding: '0.75rem', color: '#15803d', marginBottom: '1rem' }}>✓ Kaydedildi</div>}
            <button style={s.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Kaydediliyor...' : '💾 Klinik Profili Kaydet'}</button>
        </div>
    );
}
