import { useState, useEffect } from 'react';

interface Props { patientId: string; doctorId: string; }

const s = {
    card: { background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' } as React.CSSProperties,
    sTitle: { fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.875rem', paddingBottom: '0.4rem', borderBottom: '2px solid #e2e8f0' } as React.CSSProperties,
    label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.9rem' } as React.CSSProperties,
    inp: { width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.95rem', boxSizing: 'border-box' as const, marginBottom: '0.625rem' },
    toggle: (on: boolean, color = '#1d4ed8') => ({ padding: '0.45rem 0.85rem', border: `2px solid ${on ? color : '#e2e8f0'}`, background: on ? `${color}15` : 'white', color: on ? color : '#64748b', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: on ? 700 : 400, fontSize: '0.85rem' }) as React.CSSProperties,
    addBtn: { background: '#f0f9ff', color: '#0369a1', border: '1.5px dashed #7dd3fc', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 } as React.CSSProperties,
    rmBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem 0.5rem', fontWeight: 700 } as React.CSSProperties,
    saveBtn: { width: '100%', padding: '0.875rem', background: '#ea580c', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' } as React.CSSProperties,
    row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem' } as React.CSSProperties,
};

const EMPTY = {
    planDate: new Date().toISOString().split('T')[0],
    debridements: [] as any[],
    dressingType: '', npwt: false, biologicalProducts: '', dressingChangeFrequency: '',
    offloadingTCC: false, offloadingWalker: false, offloadingInsole: false,
    offloadingRest: false, offloadingCrutches: false, offloadingOther: '',
    revascularizationPlanned: false, revascularizationType: '', revascularizationPlannedDate: '',
    revascularizationCompletedDate: '', revascularizationResult: '',
    pressureReliefSurgeryPlanned: false, pressureReliefType: '', pressureReliefPlannedDate: '',
    nextAppointmentDate: '', appointmentIntervalWeeks: '',
    patientCompliance: 'good', educationProvided: false, educationTopics: [] as string[], notes: '',
};

const EDU_TOPICS = ['Günlük ayak bakımı','Ayakkabı seçimi','Glisemi takibi','Yara erken belirtiler','Diyet/beslenme','Sigara bırakma','Fizik aktivite'];

function Tog({ label, value, onChange, color }: { label: string; value: boolean; onChange: (v: boolean) => void; color?: string }) {
    return <button type="button" style={s.toggle(value, color ?? '#1d4ed8')} onClick={() => onChange(!value)}>{value ? '✓' : '○'} {label}</button>;
}

export default function TreatmentPlanTab({ patientId, doctorId }: Props) {
    const [form, setForm] = useState<any>(EMPTY);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetch(`/api/tedavi-plani?patientId=${patientId}`)
            .then(r => r.json())
            .then(d => setHistory(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    }, [patientId]);

    function set(key: string, value: any) {
        setForm((p: any) => ({ ...p, [key]: value }));
    }

    function addDebridement() {
        set('debridements', [...form.debridements, { date: new Date().toISOString().split('T')[0], operator: '', type: 'sharp', notes: '' }]);
    }
    function updateDebridement(i: number, key: string, val: string) {
        const arr = [...form.debridements];
        arr[i] = { ...arr[i], [key]: val };
        set('debridements', arr);
    }
    function removeDebridement(i: number) {
        set('debridements', form.debridements.filter((_: any, idx: number) => idx !== i));
    }

    function toggleEduTopic(topic: string) {
        const topics = form.educationTopics ?? [];
        if (topics.includes(topic)) set('educationTopics', topics.filter((t: string) => t !== topic));
        else set('educationTopics', [...topics, topic]);
    }

    async function handleSave() {
        setSaving(true); setError(''); setSaved(false);
        try {
            const payload = {
                ...form, patientId, doctorId,
                appointmentIntervalWeeks: form.appointmentIntervalWeeks ? +form.appointmentIntervalWeeks : undefined,
            };
            const res = await fetch('/api/tedavi-plani', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { const d = await res.json(); setError(d.error); return; }
            const saved_rec = await res.json();
            setHistory([saved_rec, ...history]);
            setSaved(true);
            setShowForm(false);
            setTimeout(() => setSaved(false), 2500);
        } catch { setError('Sunucu hatası.'); }
        finally { setSaving(false); }
    }

    const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
    const complianceColors: Record<string, string> = { good: '#16a34a', moderate: '#ca8a04', poor: '#dc2626' };
    const complianceLabels: Record<string, string> = { good: 'İyi', moderate: 'Orta', poor: 'Yetersiz' };
    const debridTypeLabels: Record<string, string> = { sharp: 'Keskin', enzymatic: 'Enzimatik', autolytic: 'Otolitik', biological: 'Biyolojik', hydrosurgical: 'Hidrocerrahı' };

    if (loading) return <p style={{ color: '#94a3b8', padding: '1rem' }}>Yükleniyor...</p>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Tedavi Planları ({history.length})</h2>
                <button style={{ background: '#ea580c', color: 'white', border: 'none', borderRadius: '0.625rem', padding: '0.625rem 1rem', cursor: 'pointer', fontWeight: 700 }} onClick={() => { setShowForm(true); setForm({ ...EMPTY, planDate: new Date().toISOString().split('T')[0] }); setSaved(false); setError(''); }}>+ Yeni Plan</button>
            </div>

            {saved && <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '0.5rem', padding: '0.75rem', color: '#15803d', marginBottom: '1rem' }}>✓ Tedavi planı kaydedildi</div>}

            {/* History */}
            {!showForm && history.map((rec: any) => (
                <div key={rec.id} style={s.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <p style={{ fontWeight: 800, color: '#ea580c', fontSize: '1rem' }}>📋 Plan — {fmtDate(rec.planDate)}</p>
                        <span style={{ background: `${complianceColors[rec.patientCompliance]}15`, color: complianceColors[rec.patientCompliance], borderRadius: '999px', padding: '0.2rem 0.625rem', fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${complianceColors[rec.patientCompliance]}40` }}>
                            Uyum: {complianceLabels[rec.patientCompliance]}
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
                        {rec.dressingType && <div><p style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>PANSUMAN</p><p style={{ fontWeight: 600 }}>{rec.dressingType}</p></div>}
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>OFFLOADING</p>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' as const }}>
                                {rec.offloadingTCC && <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.78rem' }}>TCC</span>}
                                {rec.offloadingWalker && <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.78rem' }}>Walker</span>}
                                {rec.offloadingInsole && <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.78rem' }}>Tabanlık</span>}
                                {rec.offloadingRest && <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.78rem' }}>İstirahat</span>}
                                {rec.offloadingCrutches && <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.78rem' }}>Koltuk değneği</span>}
                            </div>
                        </div>
                        {rec.nextAppointmentDate && <div><p style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.15rem' }}>SONRAKİ RANDEVU</p><p style={{ fontWeight: 700, color: '#1d4ed8' }}>{fmtDate(rec.nextAppointmentDate)}</p></div>}
                    </div>
                    {rec.debridements?.length > 0 && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>DEBRİDMANLAR ({rec.debridements.length})</p>
                            {rec.debridements.map((d: any, i: number) => (
                                <span key={i} style={{ fontSize: '0.82rem', background: '#fef3c7', color: '#92400e', borderRadius: '4px', padding: '0.1rem 0.5rem', marginRight: '0.25rem' }}>
                                    {fmtDate(d.date)} {debridTypeLabels[d.type] ?? d.type}
                                </span>
                            ))}
                        </div>
                    )}
                    {rec.revascularizationPlanned && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.88rem', color: '#1d4ed8' }}>
                            🩺 Revaskülarizasyon planlandı ({rec.revascularizationType ?? '—'}) — {fmtDate(rec.revascularizationPlannedDate)}
                        </p>
                    )}
                    {rec.notes && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>📝 {rec.notes}</p>}
                </div>
            ))}

            {history.length === 0 && !showForm && (
                <div style={{ ...s.card, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    <p>Henüz tedavi planı kaydı yok.</p>
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: 800, color: '#ea580c', margin: 0 }}>Yeni Tedavi Planı</h3>
                        <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowForm(false)}>✕</button>
                    </div>

                    <div style={s.card}>
                        <label style={s.label}>Plan Tarihi *</label>
                        <input style={{ ...s.inp, maxWidth: '200px' }} type="date" value={form.planDate} onChange={e => set('planDate', e.target.value)} />
                    </div>

                    {/* Debridements */}
                    <div style={s.card}>
                        <p style={s.sTitle}>Debridman Kayıtları</p>
                        {form.debridements.map((d: any, i: number) => (
                            <div key={i} style={{ background: '#fef9f0', borderRadius: '0.625rem', padding: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
                                    <input style={{ ...s.inp, marginBottom: 0, width: '140px' }} type="date" value={d.date} onChange={e => updateDebridement(i, 'date', e.target.value)} />
                                    <select style={{ ...s.inp, marginBottom: 0, width: '150px' }} value={d.type} onChange={e => updateDebridement(i, 'type', e.target.value)}>
                                        {[['sharp','Keskin'],['enzymatic','Enzimatik'],['autolytic','Otolitik'],['biological','Biyolojik'],['hydrosurgical','Hidrocerrahı']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                    <input style={{ ...s.inp, marginBottom: 0, flex: '1' }} value={d.operator} onChange={e => updateDebridement(i, 'operator', e.target.value)} placeholder="Yapan hekim" />
                                    <button type="button" style={s.rmBtn} onClick={() => removeDebridement(i)}>✕</button>
                                </div>
                                <input style={{ ...s.inp, marginBottom: 0, marginTop: '0.5rem' }} value={d.notes ?? ''} onChange={e => updateDebridement(i, 'notes', e.target.value)} placeholder="Debridman notu" />
                            </div>
                        ))}
                        <button type="button" style={s.addBtn} onClick={addDebridement}>+ Debridman ekle</button>
                    </div>

                    {/* Dressing */}
                    <div style={s.card}>
                        <p style={s.sTitle}>Pansuman</p>
                        <label style={s.label}>Pansuman Tipi</label>
                        <input style={s.inp} value={form.dressingType} onChange={e => set('dressingType', e.target.value)} placeholder="örn. Hidrokoloid, köpük, gümüşlü, alginat..." />
                        <div style={s.row}>
                            <div>
                                <label style={s.label}>Değişim Sıklığı</label>
                                <input style={s.inp} value={form.dressingChangeFrequency} onChange={e => set('dressingChangeFrequency', e.target.value)} placeholder="örn. Günlük, 2 günde 1..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginBottom: '0.5rem' }}>
                            <Tog label="NPWT (Vakumlu pansuman)" value={form.npwt} onChange={v => set('npwt', v)} color="#7c3aed" />
                        </div>
                        <input style={s.inp} value={form.biologicalProducts} onChange={e => set('biologicalProducts', e.target.value)} placeholder="Biyolojik ürünler (kollajen, büyüme faktörü, deri eşdeğeri...)" />
                    </div>

                    {/* Offloading */}
                    <div style={s.card}>
                        <p style={s.sTitle}>Yük Boşaltma (Offloading)</p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                            <Tog label="TCC (Total Contact Cast)" value={form.offloadingTCC} onChange={v => set('offloadingTCC', v)} />
                            <Tog label="Çıkarılabilir walker" value={form.offloadingWalker} onChange={v => set('offloadingWalker', v)} />
                            <Tog label="Özel tabanlık" value={form.offloadingInsole} onChange={v => set('offloadingInsole', v)} />
                            <Tog label="İstirahat" value={form.offloadingRest} onChange={v => set('offloadingRest', v)} />
                            <Tog label="Koltuk değneği" value={form.offloadingCrutches} onChange={v => set('offloadingCrutches', v)} />
                        </div>
                        <input style={s.inp} value={form.offloadingOther} onChange={e => set('offloadingOther', e.target.value)} placeholder="Diğer offloading yöntemi" />
                    </div>

                    {/* Revascularization */}
                    <div style={s.card}>
                        <p style={s.sTitle}>Revaskülarizasyon</p>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <Tog label="Revaskülarizasyon planlandı" value={form.revascularizationPlanned} onChange={v => set('revascularizationPlanned', v)} color="#dc2626" />
                        </div>
                        {form.revascularizationPlanned && (
                            <div style={s.row}>
                                <div>
                                    <label style={s.label}>Tip</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                                        {[['endovascular','Endovasküler'],['surgical','Cerrahi']].map(([v,l]) => (
                                            <button key={v} type="button" style={s.toggle(form.revascularizationType === v)} onClick={() => set('revascularizationType', v)}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={s.label}>Planlanan Tarih</label>
                                    <input style={s.inp} type="date" value={form.revascularizationPlannedDate} onChange={e => set('revascularizationPlannedDate', e.target.value)} />
                                </div>
                                <div>
                                    <label style={s.label}>Yapıldı Tarihi</label>
                                    <input style={s.inp} type="date" value={form.revascularizationCompletedDate} onChange={e => set('revascularizationCompletedDate', e.target.value)} />
                                </div>
                                <div>
                                    <label style={s.label}>Sonuç</label>
                                    <input style={s.inp} value={form.revascularizationResult} onChange={e => set('revascularizationResult', e.target.value)} placeholder="Revaskülarizasyon sonucu" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pressure relief surgery */}
                    <div style={s.card}>
                        <p style={s.sTitle}>Basınç Azaltma Cerrahisi</p>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <Tog label="Basınç azaltma cerrahisi planlandı" value={form.pressureReliefSurgeryPlanned} onChange={v => set('pressureReliefSurgeryPlanned', v)} color="#ea580c" />
                        </div>
                        {form.pressureReliefSurgeryPlanned && (
                            <div style={s.row}>
                                <div>
                                    <label style={s.label}>Tip (örn. Aşil tendon uzatma)</label>
                                    <input style={s.inp} value={form.pressureReliefType} onChange={e => set('pressureReliefType', e.target.value)} placeholder="Cerrahi tipi" />
                                </div>
                                <div>
                                    <label style={s.label}>Planlanan Tarih</label>
                                    <input style={s.inp} type="date" value={form.pressureReliefPlannedDate} onChange={e => set('pressureReliefPlannedDate', e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Follow-up */}
                    <div style={s.card}>
                        <p style={s.sTitle}>Takip ve Uyum</p>
                        <div style={s.row}>
                            <div>
                                <label style={s.label}>Sonraki Randevu</label>
                                <input style={s.inp} type="date" value={form.nextAppointmentDate} onChange={e => set('nextAppointmentDate', e.target.value)} />
                            </div>
                            <div>
                                <label style={s.label}>Kontrol Sıklığı (hafta)</label>
                                <input style={s.inp} type="number" min="1" max="52" value={form.appointmentIntervalWeeks} onChange={e => set('appointmentIntervalWeeks', e.target.value)} placeholder="örn. 2" />
                            </div>
                        </div>
                        <label style={s.label}>Hasta Uyumu</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            {[['good','İyi','#16a34a'],['moderate','Orta','#ca8a04'],['poor','Yetersiz','#dc2626']].map(([v,l,c]) => (
                                <button key={v} type="button" style={s.toggle(form.patientCompliance === v, c)} onClick={() => set('patientCompliance', v)}>{l}</button>
                            ))}
                        </div>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <Tog label="Hasta eğitimi verildi" value={form.educationProvided} onChange={v => set('educationProvided', v)} color="#16a34a" />
                        </div>
                        {form.educationProvided && (
                            <div>
                                <label style={s.label}>Eğitim Konuları</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                                    {EDU_TOPICS.map(topic => (
                                        <button key={topic} type="button"
                                            style={{ padding: '0.4rem 0.75rem', border: `2px solid ${(form.educationTopics ?? []).includes(topic) ? '#16a34a' : '#e2e8f0'}`, background: (form.educationTopics ?? []).includes(topic) ? '#f0fdf4' : 'white', color: (form.educationTopics ?? []).includes(topic) ? '#15803d' : '#64748b', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: (form.educationTopics ?? []).includes(topic) ? 700 : 400, fontSize: '0.82rem' }}
                                            onClick={() => toggleEduTopic(topic)}>{topic}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={s.card}>
                        <label style={s.label}>Notlar</label>
                        <textarea style={{ ...s.inp, minHeight: '70px', resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Tedavi planı ile ilgili ek notlar..." />
                    </div>

                    {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#b91c1c', marginBottom: '1rem' }}>{error}</div>}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button style={{ flex: 1, padding: '0.875rem', background: '#f1f5f9', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600 }} onClick={() => setShowForm(false)}>İptal</button>
                        <button style={{ flex: 3, ...s.saveBtn }} onClick={handleSave} disabled={saving}>{saving ? 'Kaydediliyor...' : '💊 Tedavi Planını Kaydet'}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
