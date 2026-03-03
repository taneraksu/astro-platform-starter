import { useState } from 'react';
import {
    WAGNER_GRADES, getWagnerInfo,
    getUTDescription, UT_GRADES, UT_STAGES,
    IWGDF_INFECTION_GRADES, getIWGDFInfectionInfo,
    WIFI_WOUND_LABELS, WIFI_ISCHEMIA_LABELS, WIFI_FI_LABELS, computeWIFI,
    IWGDF_RISK_CATEGORIES, getIWGDFRisk,
    PEDIS_PERFUSION_OPTIONS, PEDIS_DEPTH_OPTIONS, PEDIS_INFECTION_OPTIONS, PEDIS_SENSATION_OPTIONS,
    computeSINBAD, EICHENHOLTZ_STAGES, getEichenholtzInfo,
} from '../../utils/scoring';

interface Props { patientId?: string; }

const s = {
    card: { background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' } as React.CSSProperties,
    sTitle: { fontSize: '1rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' } as React.CSSProperties,
    label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.3rem', fontSize: '0.88rem' } as React.CSSProperties,
    result: (color: string) => ({ background: `${color}12`, border: `2px solid ${color}40`, borderRadius: '0.75rem', padding: '1rem', marginTop: '0.875rem' }) as React.CSSProperties,
    badge: (color: string) => ({ display: 'inline-block', background: `${color}18`, color, border: `1.5px solid ${color}50`, borderRadius: '999px', padding: '0.25rem 0.875rem', fontSize: '0.88rem', fontWeight: 700 }) as React.CSSProperties,
    optBtn: (on: boolean, color = '#1d4ed8') => ({ padding: '0.45rem 0.75rem', border: `2px solid ${on ? color : '#e2e8f0'}`, background: on ? `${color}12` : 'white', color: on ? color : '#64748b', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: on ? 700 : 400, fontSize: '0.82rem', textAlign: 'left' as const, lineHeight: 1.3 }) as React.CSSProperties,
};

const URGENCY_COLOR: Record<string,string> = { very_low:'#16a34a', low:'#65a30d', moderate:'#ca8a04', high:'#dc2626', unlikely:'#16a34a', possible:'#ca8a04', likely:'#ea580c', highly_likely:'#dc2626' };

export default function ClassificationTab(_props: Props) {
    // IWGDF Risk
    const [iwgdfCat, setIwgdfCat] = useState<0|1|2|3>(0);

    // Wagner
    const [wagnerGrade, setWagnerGrade] = useState<0|1|2|3|4|5>(0);

    // University of Texas
    const [utGrade, setUtGrade] = useState<0|1|2|3>(0);
    const [utStage, setUtStage] = useState<'A'|'B'|'C'|'D'>('A');

    // IWGDF/IDSA Infection
    const [infGrade, setInfGrade] = useState<1|2|3|4>(1);

    // WIfI
    const [wifiW, setWifiW] = useState<0|1|2|3>(0);
    const [wifiI, setWifiI] = useState<0|1|2|3>(0);
    const [wifiFI, setWifiFI] = useState<0|1|2|3>(0);

    // PEDIS
    const [pedisP, setPedisP] = useState<1|2|3|4>(1);
    const [pedisE, setPedisE] = useState('');
    const [pedisD, setPedisD] = useState<1|2|3>(1);
    const [pedisI, setPedisI] = useState<1|2|3|4>(1);
    const [pedisS, setPedisS] = useState<1|2>(1);

    // SINBAD
    const [sinSite, setSinSite] = useState<0|1>(0);
    const [sinIsch, setSinIsch] = useState<0|1>(0);
    const [sinNeuro, setSinNeuro] = useState<0|1>(0);
    const [sinBact, setSinBact] = useState<0|1|2>(0);
    const [sinArea, setSinArea] = useState<0|1>(0);
    const [sinDepth, setSinDepth] = useState<0|1>(0);

    // Eichenholtz
    const [eichStage, setEichStage] = useState<0|1|2|3>(0);

    const wagnerInfo = getWagnerInfo(wagnerGrade);
    const utInfo = getUTDescription(utGrade, utStage);
    const infInfo = getIWGDFInfectionInfo(infGrade);
    const wifiResult = computeWIFI(wifiW, wifiI, wifiFI);
    const iwgdfRisk = getIWGDFRisk(iwgdfCat);
    const sinbadResult = computeSINBAD(sinSite, sinIsch, sinNeuro, sinBact, sinArea, sinDepth);
    const eichInfo = getEichenholtzInfo(eichStage);

    return (
        <div>
            {/* ===== IWGDF Risk ===== */}
            <div style={s.card}>
                <p style={s.sTitle}>📊 IWGDF Risk Sınıflaması (Ülser Önleme)</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                    {IWGDF_RISK_CATEGORIES.map(cat => (
                        <button key={cat.category} type="button" style={s.optBtn(iwgdfCat === cat.category, cat.color)} onClick={() => setIwgdfCat(cat.category)}>
                            <span style={{ fontWeight: 800 }}>Kategori {cat.category}</span><br />
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{cat.followupInterval}</span>
                        </button>
                    ))}
                </div>
                <div style={s.result(iwgdfRisk.color)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '0.5rem' }}>
                        <span style={s.badge(iwgdfRisk.color)}>{iwgdfRisk.label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: iwgdfRisk.color }}>{iwgdfRisk.followupInterval}</span>
                    </div>
                    <p style={{ color: '#374151', fontSize: '0.88rem', marginTop: '0.5rem' }}>📋 Kriter: {iwgdfRisk.criteria}</p>
                </div>
            </div>

            {/* ===== Wagner ===== */}
            <div style={s.card}>
                <p style={s.sTitle}>📊 Wagner Sınıflaması</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                    {WAGNER_GRADES.map(g => (
                        <button key={g.grade} type="button" style={s.optBtn(wagnerGrade === g.grade)} onClick={() => setWagnerGrade(g.grade as any)}>
                            <span style={{ fontWeight: 800 }}>Grade {g.grade}</span>
                        </button>
                    ))}
                </div>
                <div style={s.result('#64748b')}>
                    <span style={{ ...s.badge('#475569') }}>Grade {wagnerGrade}</span>
                    <p style={{ color: '#374151', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600 }}>{wagnerInfo.description}</p>
                    <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.375rem' }}>💡 {wagnerInfo.recommendation}</p>
                </div>
            </div>

            {/* ===== University of Texas ===== */}
            <div style={s.card}>
                <p style={s.sTitle}>📊 University of Texas (UT) Sınıflaması</p>
                <div style={{ marginBottom: '0.875rem' }}>
                    <p style={s.label}>Derinlik (Grade)</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                        {UT_GRADES.map(g => (
                            <button key={g.grade} type="button" style={{ ...s.optBtn(utGrade === g.grade), maxWidth: '200px' }} onClick={() => setUtGrade(g.grade)}>
                                <span style={{ fontWeight: 800 }}>{g.label}</span><br />
                                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{g.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <p style={s.label}>Enfeksiyon / İskemi (Evre)</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                        {UT_STAGES.map(st => (
                            <button key={st.stage} type="button" style={{ ...s.optBtn(utStage === st.stage), maxWidth: '200px' }} onClick={() => setUtStage(st.stage)}>
                                <span style={{ fontWeight: 800 }}>{st.label}</span><br />
                                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{st.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div style={s.result(utInfo.color)}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
                        <span style={{ ...s.badge(utInfo.color), fontSize: '1.1rem' }}>{utGrade}{utStage}</span>
                        <span style={s.badge(utInfo.color)}>{{ low:'Düşük', moderate:'Orta', high:'Yüksek', very_high:'Çok Yüksek' }[utInfo.riskLevel]} Risk</span>
                    </div>
                    <p style={{ color: '#374151', fontSize: '0.88rem', marginTop: '0.5rem' }}>{utInfo.description}</p>
                </div>
            </div>

            {/* ===== PEDIS ===== */}
            <div style={s.card}>
                <p style={s.sTitle}>📊 PEDIS Skoru</p>
                <div style={{ marginBottom: '0.875rem' }}>
                    <p style={s.label}>P — Perfüzyon</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' }}>
                        {PEDIS_PERFUSION_OPTIONS.map(o => (
                            <button key={o.value} type="button" style={s.optBtn(pedisP === o.value as any)} onClick={() => setPedisP(o.value as any)}>{o.label}</button>
                        ))}
                    </div>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                    <label style={s.label}>E — Extent (Alan, cm²)</label>
                    <input style={{ border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.95rem', width: '120px' }} type="number" step="0.1" min="0" value={pedisE} onChange={e => setPedisE(e.target.value)} placeholder="cm²" />
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                    <p style={s.label}>D — Depth (Derinlik)</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' }}>
                        {PEDIS_DEPTH_OPTIONS.map(o => (
                            <button key={o.value} type="button" style={s.optBtn(pedisD === o.value as any)} onClick={() => setPedisD(o.value as any)}>{o.label}</button>
                        ))}
                    </div>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                    <p style={s.label}>I — Infection (Enfeksiyon)</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' }}>
                        {PEDIS_INFECTION_OPTIONS.map(o => (
                            <button key={o.value} type="button" style={s.optBtn(pedisI === o.value as any)} onClick={() => setPedisI(o.value as any)}>{o.label}</button>
                        ))}
                    </div>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                    <p style={s.label}>S — Sensation (Duyu)</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' }}>
                        {PEDIS_SENSATION_OPTIONS.map(o => (
                            <button key={o.value} type="button" style={s.optBtn(pedisS === o.value as any)} onClick={() => setPedisS(o.value as any)}>{o.label}</button>
                        ))}
                    </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '0.625rem', padding: '0.875rem', marginTop: '0.5rem' }}>
                    <p style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.95rem' }}>
                        PEDIS — P{pedisP} E{pedisE || '?'} D{pedisD} I{pedisI} S{pedisS}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.25rem' }}>Perfüzyon {pedisP} | Alan {pedisE || '—'} cm² | Derinlik {pedisD} | Enfeksiyon {pedisI} | Duyu {pedisS}</p>
                </div>
            </div>

            {/* ===== SINBAD ===== */}
            <div style={s.card}>
                <p style={s.sTitle}>📊 SINBAD Skoru (0–6)</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginBottom: '0.875rem' }}>
                    <div>
                        <p style={s.label}>S — Bölge</p>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button type="button" style={s.optBtn(sinSite === 0)} onClick={() => setSinSite(0)}>Ön ayak (0)</button>
                            <button type="button" style={s.optBtn(sinSite === 1, '#ea580c')} onClick={() => setSinSite(1)}>Orta/arka ayak (1)</button>
                        </div>
                    </div>
                    <div>
                        <p style={s.label}>I — İskemi</p>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button type="button" style={s.optBtn(sinIsch === 0)} onClick={() => setSinIsch(0)}>ABI ≥0.9 (0)</button>
                            <button type="button" style={s.optBtn(sinIsch === 1, '#ea580c')} onClick={() => setSinIsch(1)}>ABI &lt;0.9 (1)</button>
                        </div>
                    </div>
                    <div>
                        <p style={s.label}>N — Nöropati</p>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button type="button" style={s.optBtn(sinNeuro === 0)} onClick={() => setSinNeuro(0)}>LOPS yok (0)</button>
                            <button type="button" style={s.optBtn(sinNeuro === 1, '#ea580c')} onClick={() => setSinNeuro(1)}>LOPS var (1)</button>
                        </div>
                    </div>
                    <div>
                        <p style={s.label}>B — Enfeksiyon</p>
                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const }}>
                            <button type="button" style={s.optBtn(sinBact === 0)} onClick={() => setSinBact(0)}>Yok (0)</button>
                            <button type="button" style={s.optBtn(sinBact === 1, '#ca8a04')} onClick={() => setSinBact(1)}>Var (1)</button>
                            <button type="button" style={s.optBtn(sinBact === 2, '#dc2626')} onClick={() => setSinBact(2)}>Osteomyelit (2)</button>
                        </div>
                    </div>
                    <div>
                        <p style={s.label}>A — Alan</p>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button type="button" style={s.optBtn(sinArea === 0)} onClick={() => setSinArea(0)}>&lt;1 cm² (0)</button>
                            <button type="button" style={s.optBtn(sinArea === 1, '#ea580c')} onClick={() => setSinArea(1)}>≥1 cm² (1)</button>
                        </div>
                    </div>
                    <div>
                        <p style={s.label}>D — Derinlik</p>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button type="button" style={s.optBtn(sinDepth === 0)} onClick={() => setSinDepth(0)}>Yüzeysel (0)</button>
                            <button type="button" style={s.optBtn(sinDepth === 1, '#ea580c')} onClick={() => setSinDepth(1)}>Derin (1)</button>
                        </div>
                    </div>
                </div>
                <div style={s.result(sinbadResult.color)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' as const }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: sinbadResult.color }}>{sinbadResult.total}</span>
                        <span style={s.badge(sinbadResult.color)}>{sinbadResult.riskLabel}</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.375rem' }}>S{sinbadResult.site} I{sinbadResult.ischemia} N{sinbadResult.neuropathy} B{sinbadResult.bacterialInfection} A{sinbadResult.area} D{sinbadResult.depth} = {sinbadResult.total}/6</p>
                </div>
            </div>

            {/* ===== IWGDF/IDSA Infection ===== */}
            <div style={s.card}>
                <p style={s.sTitle}>📊 IWGDF/IDSA Enfeksiyon Şiddeti</p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.375rem', marginBottom: '0.875rem' }}>
                    {IWGDF_INFECTION_GRADES.map(g => (
                        <button key={g.grade} type="button" style={{ ...s.optBtn(infGrade === g.grade, g.color), padding: '0.625rem 0.875rem' }} onClick={() => setInfGrade(g.grade)}>
                            <span style={{ fontWeight: 800 }}>{g.label}</span><br />
                            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{g.criteria}</span>
                        </button>
                    ))}
                </div>
                <div style={s.result(infInfo.color)}>
                    <span style={s.badge(infInfo.color)}>Grade {infInfo.grade} — {infInfo.severity}</span>
                    <p style={{ color: '#374151', fontSize: '0.88rem', marginTop: '0.5rem' }}>💊 {infInfo.management}</p>
                    {infInfo.urgent && (
                        <div style={{ marginTop: '0.5rem', background: '#fef2f2', borderRadius: '0.5rem', padding: '0.625rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <span>🚨</span>
                            <div style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600 }}>
                                ACİL — Yatış / IV antibiyotik değerlendirmesi gerekli
                                {infGrade === 4 && <><br />• Yoğun bakım ihtiyacı değerlendir<br />• Cerrahi konsültasyon<br />• Sepsis protokolü</>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== SVS WIfI ===== */}
            <div style={s.card}>
                <p style={s.sTitle}>📊 SVS WIfI Skoru (Ampütasyon Riski / Revaskülarizasyon)</p>
                <div style={{ marginBottom: '0.875rem' }}>
                    <p style={s.label}>W — Wound (Yara)</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' }}>
                        {WIFI_WOUND_LABELS.map((l, i) => (
                            <button key={i} type="button" style={s.optBtn(wifiW === i as any)} onClick={() => setWifiW(i as any)}>{l}</button>
                        ))}
                    </div>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                    <p style={s.label}>I — Ischemia (İskemi)</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' }}>
                        {WIFI_ISCHEMIA_LABELS.map((l, i) => (
                            <button key={i} type="button" style={s.optBtn(wifiI === i as any, i === 0 ? '#16a34a' : i === 1 ? '#ca8a04' : i === 2 ? '#ea580c' : '#dc2626')} onClick={() => setWifiI(i as any)}>{l}</button>
                        ))}
                    </div>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                    <p style={s.label}>fI — foot Infection (Ayak Enfeksiyonu)</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.375rem' }}>
                        {WIFI_FI_LABELS.map((l, i) => (
                            <button key={i} type="button" style={s.optBtn(wifiFI === i as any)} onClick={() => setWifiFI(i as any)}>{l}</button>
                        ))}
                    </div>
                </div>
                <div style={s.result(wifiResult.color)}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const, alignItems: 'center' }}>
                        <span style={{ ...s.badge(wifiResult.color), fontSize: '1rem' }}>W{wifiW} I{wifiI} fI{wifiFI}</span>
                        <span style={s.badge(URGENCY_COLOR[wifiResult.amputationRisk])}>Amputasyon: {{'very_low':'Çok Düşük','low':'Düşük','moderate':'Orta','high':'Yüksek'}[wifiResult.amputationRisk]}</span>
                    </div>
                    <p style={{ color: '#374151', fontSize: '0.88rem', marginTop: '0.5rem', fontWeight: 600 }}>🩺 {wifiResult.label}</p>
                </div>
            </div>

            {/* ===== Eichenholtz ===== */}
            <div style={s.card}>
                <p style={s.sTitle}>📊 Eichenholtz Evrelemesi (Charcot)</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const, marginBottom: '0.875rem' }}>
                    {EICHENHOLTZ_STAGES.map(st => (
                        <button key={st.stage} type="button" style={{ ...s.optBtn(eichStage === st.stage, st.color), minWidth: '120px' }} onClick={() => setEichStage(st.stage)}>
                            <span style={{ fontWeight: 800 }}>Evre {st.stage}</span>
                        </button>
                    ))}
                </div>
                <div style={s.result(eichInfo.color)}>
                    <span style={s.badge(eichInfo.color)}>{eichInfo.label}</span>
                    <p style={{ color: '#374151', fontSize: '0.88rem', marginTop: '0.5rem' }}><strong>Klinik:</strong> {eichInfo.clinical}</p>
                    <p style={{ color: '#374151', fontSize: '0.88rem', marginTop: '0.25rem' }}><strong>Radyoloji:</strong> {eichInfo.radiological}</p>
                    <div style={{ marginTop: '0.5rem', background: '#f8fafc', borderRadius: '0.5rem', padding: '0.625rem', fontSize: '0.88rem', color: '#1e3a8a', fontWeight: 600 }}>
                        💡 {eichInfo.management}
                    </div>
                </div>
            </div>
        </div>
    );
}
