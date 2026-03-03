// Wagner Wound Classification scoring & colors

export interface WagnerInfo {
    grade: number;
    label: string;
    description: string;
    color: string;         // Tailwind bg class
    textColor: string;
    recommendation: string;
}

export const WAGNER_GRADES: WagnerInfo[] = [
    {
        grade: 0,
        label: 'Grade 0',
        description: 'Yara yok — risk faktörleri mevcut',
        color: 'bg-green-100',
        textColor: 'text-green-800',
        recommendation: 'Günlük ayak bakımına devam edin. Ayakkabı seçimine dikkat edin.'
    },
    {
        grade: 1,
        label: 'Grade 1',
        description: 'Yüzeysel ülser — deri tabakası',
        color: 'bg-green-200',
        textColor: 'text-green-900',
        recommendation: 'Yarayı temiz tutun, pansuman yapın. Klinik kontrol planlayın.'
    },
    {
        grade: 2,
        label: 'Grade 2',
        description: 'Derin ülser — tendon/kapsüle ulaşmış',
        color: 'bg-yellow-200',
        textColor: 'text-yellow-900',
        recommendation: 'Acil klinik başvurusu gerekli. Yük bindirmeyin.'
    },
    {
        grade: 3,
        label: 'Grade 3',
        description: 'Derin ülser + enfeksiyon / apse',
        color: 'bg-orange-200',
        textColor: 'text-orange-900',
        recommendation: '⚠️ ACİL! Hastaneye gidin. Antibiyotik tedavisi gerekebilir.'
    },
    {
        grade: 4,
        label: 'Grade 4',
        description: 'Kısmi gangren (parmak/ön ayak)',
        color: 'bg-red-200',
        textColor: 'text-red-900',
        recommendation: '🚨 ACİL DURUM! Hemen hastaneye gidin. Cerrahi değerlendirme şart.'
    },
    {
        grade: 5,
        label: 'Grade 5',
        description: 'Tüm ayakta gangren',
        color: 'bg-red-400',
        textColor: 'text-red-950',
        recommendation: '🚨 ACİL DURUM! Ambulans çağırın. Ampütasyon değerlendirmesi gerekli.'
    }
];

export function getWagnerInfo(grade: number): WagnerInfo {
    return WAGNER_GRADES[grade] ?? WAGNER_GRADES[0];
}

// ---------- University of Texas (UT) Wound Classification ----------

export interface UTClassification {
    grade: 0 | 1 | 2 | 3;
    stage: 'A' | 'B' | 'C' | 'D';
    gradeLabel: string;
    stageLabel: string;
    description: string;
    riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
    color: string;
}

export const UT_GRADES = [
    { grade: 0, label: 'Grade 0', desc: 'Pre/post-ülser lezyon, epitelizasyon tamamlanmış' },
    { grade: 1, label: 'Grade 1', desc: 'Yüzeysel yara, tendon/kapsül/kemik tutulmamış' },
    { grade: 2, label: 'Grade 2', desc: 'Tendon veya kapsüle ulaşmış yara' },
    { grade: 3, label: 'Grade 3', desc: 'Kemik veya eklem tutulumu' },
] as const;

export const UT_STAGES = [
    { stage: 'A', label: 'Evre A', desc: 'Enfeksiyon yok, iskemi yok' },
    { stage: 'B', label: 'Evre B', desc: 'Enfeksiyon var, iskemi yok' },
    { stage: 'C', label: 'Evre C', desc: 'İskemi var, enfeksiyon yok' },
    { stage: 'D', label: 'Evre D', desc: 'Enfeksiyon + iskemi' },
] as const;

export function getUTDescription(grade: 0|1|2|3, stage: 'A'|'B'|'C'|'D'): UTClassification {
    const gradeInfo = UT_GRADES[grade];
    const stageInfo = UT_STAGES[['A','B','C','D'].indexOf(stage)];
    const riskMatrix: Record<string, 'low'|'moderate'|'high'|'very_high'> = {
        '0A': 'low', '0B': 'moderate', '0C': 'moderate', '0D': 'high',
        '1A': 'low', '1B': 'moderate', '1C': 'high', '1D': 'very_high',
        '2A': 'moderate', '2B': 'high', '2C': 'high', '2D': 'very_high',
        '3A': 'high', '3B': 'very_high', '3C': 'very_high', '3D': 'very_high',
    };
    const colorMap: Record<string, string> = {
        'low': '#16a34a', 'moderate': '#ca8a04', 'high': '#ea580c', 'very_high': '#dc2626'
    };
    const risk = riskMatrix[`${grade}${stage}`] ?? 'moderate';
    return {
        grade, stage,
        gradeLabel: gradeInfo.label,
        stageLabel: stageInfo.label,
        description: `${gradeInfo.desc} / ${stageInfo.desc}`,
        riskLevel: risk,
        color: colorMap[risk]
    };
}

// ---------- IWGDF / IDSA Diabetic Foot Infection (DFI) ----------

export interface IWGDFInfectionInfo {
    grade: 1 | 2 | 3 | 4;
    label: string;
    severity: string;
    criteria: string;
    management: string;
    color: string;
    urgent: boolean;
}

export const IWGDF_INFECTION_GRADES: IWGDFInfectionInfo[] = [
    {
        grade: 1,
        label: 'Grade 1 — Enfeksiyon Yok',
        severity: 'Yok',
        criteria: 'İnfeksiyon bulgusu yok',
        management: 'Standart yara bakımı, offloading',
        color: '#16a34a',
        urgent: false
    },
    {
        grade: 2,
        label: 'Grade 2 — Hafif (Mild)',
        severity: 'Hafif',
        criteria: 'Lokal enfeksiyon: eritem ≤2 cm, ısı artışı, şişlik veya akıntı. Sistemik bulgu yok.',
        management: 'Oral antibiyotik, sıkı takip. Çoğunlukla ayaktan tedavi.',
        color: '#ca8a04',
        urgent: false
    },
    {
        grade: 3,
        label: 'Grade 3 — Orta (Moderate)',
        severity: 'Orta',
        criteria: 'Eritem >2 cm VEYA derin doku tutulumu (fasia, kas, tendon, kemik, eklem). Sistemik bulgu yok.',
        management: 'Parenteral antibiyotik gerekebilir, yatış değerlendir. Osteomyelit dışla.',
        color: '#ea580c',
        urgent: true
    },
    {
        grade: 4,
        label: 'Grade 4 — Ağır (Severe)',
        severity: 'Ağır',
        criteria: 'Sistemik inflamatuvar cevap: ateş/hipotermi, taşikardi, taşipne, lökositoz/lökopeni, hipotansiyon.',
        management: '⚠️ ACİL YATIŞ! IV antibiyotik, cerrahi konsültasyon, yoğun bakım değerlendir.',
        color: '#dc2626',
        urgent: true
    }
];

export function getIWGDFInfectionInfo(grade: 1|2|3|4): IWGDFInfectionInfo {
    return IWGDF_INFECTION_GRADES[grade - 1] ?? IWGDF_INFECTION_GRADES[0];
}

// ---------- SVS WIfI Score ----------

export interface WIFIResult {
    wound: 0|1|2|3;
    ischemia: 0|1|2|3;
    footInfection: 0|1|2|3;
    amputationRisk: 'very_low' | 'low' | 'moderate' | 'high';
    revascBenefit: 'unlikely' | 'possible' | 'likely' | 'highly_likely';
    label: string;
    color: string;
}

export const WIFI_WOUND_LABELS = [
    'W0 — Yara yok / iyileşmiş',
    'W1 — Küçük yüzeysel ülser (parmak/ön ayak)',
    'W2 — Derin ülser ± tendon/kapsül tutulumu veya >5cm²',
    'W3 — Kemik/eklem tutulumu, geniş nekroz, gangrenöz parmak',
];

export const WIFI_ISCHEMIA_LABELS = [
    'I0 — ABI ≥0.80, TBI ≥0.60, TcPO₂ ≥60 mmHg (normal)',
    'I1 — ABI 0.60–0.79, TBI 0.40–0.59, TcPO₂ 40–59 mmHg (hafif)',
    'I2 — ABI 0.40–0.59, TBI 0.25–0.39, TcPO₂ 30–39 mmHg (orta)',
    'I3 — ABI <0.40 veya TBI <0.25, TcPO₂ <30 mmHg (kritik)',
];

export const WIFI_FI_LABELS = [
    'FI0 — Enfeksiyon yok',
    'FI1 — Hafif (IWGDF Grade 2)',
    'FI2 — Orta (IWGDF Grade 3)',
    'FI3 — Ağır (IWGDF Grade 4)',
];

export function computeWIFI(w: 0|1|2|3, i: 0|1|2|3, fi: 0|1|2|3): WIFIResult {
    // Simplified WIfI risk matrix (based on SVS 2014 publication)
    const score = w + i + fi;
    let amputationRisk: WIFIResult['amputationRisk'];
    let revascBenefit: WIFIResult['revascBenefit'];

    if (i === 0 && w <= 1 && fi <= 1) {
        amputationRisk = 'very_low'; revascBenefit = 'unlikely';
    } else if (i <= 1 && w <= 2 && fi <= 2 && score <= 4) {
        amputationRisk = 'low'; revascBenefit = 'possible';
    } else if (i <= 2 && score <= 6) {
        amputationRisk = 'moderate'; revascBenefit = 'likely';
    } else {
        amputationRisk = 'high'; revascBenefit = 'highly_likely';
    }

    const riskLabels = { very_low: 'Çok Düşük', low: 'Düşük', moderate: 'Orta', high: 'Yüksek' };
    const revascLabels = { unlikely: 'Revask. muhtemelen gerekmez', possible: 'Revask. düşünülebilir', likely: 'Revask. büyük olasılıkla gerekli', highly_likely: 'Revask. şiddetle önerilir' };
    const colorMap = { very_low: '#16a34a', low: '#65a30d', moderate: '#ca8a04', high: '#dc2626' };

    return {
        wound: w, ischemia: i, footInfection: fi,
        amputationRisk, revascBenefit,
        label: `Ampütasyon riski: ${riskLabels[amputationRisk]} | ${revascLabels[revascBenefit]}`,
        color: colorMap[amputationRisk]
    };
}

// ---------- IWGDF Risk Classification ----------

export interface IWGDFRisk {
    category: 0 | 1 | 2 | 3;
    label: string;
    criteria: string;
    followupInterval: string;
    color: string;
}

export const IWGDF_RISK_CATEGORIES: IWGDFRisk[] = [
    {
        category: 0,
        label: 'Kategori 0 — Çok Düşük Risk',
        criteria: 'LOPS yok, PAD yok',
        followupInterval: 'Yılda 1 kontrol',
        color: '#16a34a'
    },
    {
        category: 1,
        label: 'Kategori 1 — Düşük Risk',
        criteria: 'LOPS VEYA PAD var (tek başına)',
        followupInterval: '6 ayda 1 kontrol',
        color: '#65a30d'
    },
    {
        category: 2,
        label: 'Kategori 2 — Orta Risk',
        criteria: 'LOPS + PAD veya LOPS + deformite veya PAD + deformite',
        followupInterval: '3 ayda 1 kontrol',
        color: '#ca8a04'
    },
    {
        category: 3,
        label: 'Kategori 3 — Yüksek Risk',
        criteria: 'Önceki ülser/ampütasyon öyküsü VEYA ESRD/diyaliz',
        followupInterval: '1-3 ayda 1 kontrol',
        color: '#dc2626'
    }
];

export function getIWGDFRisk(category: 0|1|2|3): IWGDFRisk {
    return IWGDF_RISK_CATEGORIES[category] ?? IWGDF_RISK_CATEGORIES[0];
}

// Glycemic risk
export type GlycemicRisk = 'green' | 'yellow' | 'red' | 'critical';

export function getGlycemicRisk(avgGlucose: number): {
    risk: GlycemicRisk;
    label: string;
    advice: string;
    color: string;
    textColor: string;
} {
    if (avgGlucose < 140) {
        return {
            risk: 'green',
            label: 'İyi Kontrol',
            advice: 'Kan şekeriniz iyi seviyede. Düzenli ölçüme devam edin.',
            color: 'bg-green-100',
            textColor: 'text-green-800'
        };
    } else if (avgGlucose < 200) {
        return {
            risk: 'yellow',
            label: 'Orta Seviye',
            advice: 'Kan şekeriniz biraz yüksek. Diyetinize dikkat edin ve doktorunuzu bilgilendirin.',
            color: 'bg-yellow-100',
            textColor: 'text-yellow-800'
        };
    } else if (avgGlucose < 300) {
        return {
            risk: 'red',
            label: 'Yüksek',
            advice: 'Kan şekeriniz yüksek. Lütfen doktorunuzu arayın.',
            color: 'bg-red-100',
            textColor: 'text-red-800'
        };
    } else {
        return {
            risk: 'critical',
            label: 'Kritik!',
            advice: '⚠️ Kan şekeriniz çok yüksek! Hemen doktorunuzu arayın veya acile gidin.',
            color: 'bg-red-300',
            textColor: 'text-red-900'
        };
    }
}

// ---------- PEDIS Score ----------

export interface PEDISResult {
    perfusion: 1 | 2 | 3 | 4;
    extent: number; // cm²
    depth: 1 | 2 | 3;
    infection: 1 | 2 | 3 | 4;
    sensation: 1 | 2;
    perfusionLabel: string;
    depthLabel: string;
    infectionLabel: string;
    sensationLabel: string;
    summary: string;
}

export const PEDIS_PERFUSION_OPTIONS = [
    { value: 1, label: 'P1 — Normal periferik dolaşım (ABI >0.9 veya nabız palpe)' },
    { value: 2, label: 'P2 — PAD var, kritik iskemi yok (ABI 0.5–0.9)' },
    { value: 3, label: 'P3 — Kritik iskemi (ABI <0.5 veya toe pressure <30 mmHg)' },
    { value: 4, label: 'P4 — Kritik iskemi + gangren / anjiyografik obstrüksiyon' },
];
export const PEDIS_DEPTH_OPTIONS = [
    { value: 1, label: 'D1 — Yüzeysel: sadece deri ve subkutan doku' },
    { value: 2, label: 'D2 — Derin: kas, tendon veya kapsül tutulumu' },
    { value: 3, label: 'D3 — En derin: kemik veya eklem tutulumu' },
];
export const PEDIS_INFECTION_OPTIONS = [
    { value: 1, label: 'I1 — Enfeksiyon yok' },
    { value: 2, label: 'I2 — Hafif (eritem ≤2 cm, lokal)' },
    { value: 3, label: 'I3 — Orta (eritem >2 cm veya derin doku)' },
    { value: 4, label: 'I4 — Ağır (sistemik inflamatuvar cevap)' },
];
export const PEDIS_SENSATION_OPTIONS = [
    { value: 1, label: 'S1 — Duyum sağlam' },
    { value: 2, label: 'S2 — LOPS mevcut (koruyucu duyu kaybı)' },
];

export function describePEDIS(p: 1|2|3|4, e: number, d: 1|2|3, i: 1|2|3|4, s: 1|2): PEDISResult {
    return {
        perfusion: p, extent: e, depth: d, infection: i, sensation: s,
        perfusionLabel: PEDIS_PERFUSION_OPTIONS[p-1].label,
        depthLabel: PEDIS_DEPTH_OPTIONS[d-1].label,
        infectionLabel: PEDIS_INFECTION_OPTIONS[i-1].label,
        sensationLabel: PEDIS_SENSATION_OPTIONS[s-1].label,
        summary: `PEDIS — P${p} E${e.toFixed(1)}cm² D${d} I${i} S${s}`,
    };
}

// ---------- SINBAD Score ----------

export interface SINBADResult {
    site: 0 | 1;
    ischemia: 0 | 1;
    neuropathy: 0 | 1;
    bacterialInfection: 0 | 1 | 2;
    area: 0 | 1;
    depth: 0 | 1;
    total: number;
    riskLabel: string;
    color: string;
}

export function computeSINBAD(
    site: 0|1,
    ischemia: 0|1,
    neuropathy: 0|1,
    bacterialInfection: 0|1|2,
    area: 0|1,
    depth: 0|1
): SINBADResult {
    const total = site + ischemia + neuropathy + bacterialInfection + area + depth;
    const riskMap: [string, string][] = [
        ['Çok Düşük Risk (0)', '#16a34a'],
        ['Düşük Risk (1)', '#65a30d'],
        ['Düşük-Orta Risk (2)', '#84cc16'],
        ['Orta Risk (3)', '#ca8a04'],
        ['Orta-Yüksek Risk (4)', '#ea580c'],
        ['Yüksek Risk (5)', '#dc2626'],
        ['Çok Yüksek Risk (6)', '#7f1d1d'],
    ];
    const [riskLabel, color] = riskMap[Math.min(total, 6)];
    return { site, ischemia, neuropathy, bacterialInfection, area, depth, total, riskLabel, color };
}

// ---------- Eichenholtz Staging (Charcot) ----------

export interface EichenholtzInfo {
    stage: 0 | 1 | 2 | 3;
    label: string;
    clinical: string;
    radiological: string;
    management: string;
    color: string;
}

export const EICHENHOLTZ_STAGES: EichenholtzInfo[] = [
    {
        stage: 0,
        label: 'Evre 0 — Klinik Aktif Charcot (Prodromal)',
        clinical: 'Belirgin şişlik, ısı artışı, eritem. Ağrı minimal. X-ray normal.',
        radiological: 'Düz grafide değişiklik yok; MRI\'da kemik ödemi olabilir.',
        management: 'Acil tam yük boşaltma (TCC veya kısıtlı yürüme). Ağır aktivite kısıtlaması. Bisfosfonat düşünülebilir.',
        color: '#dc2626',
    },
    {
        stage: 1,
        label: 'Evre 1 — Gelişim / Fragmentasyon',
        clinical: 'Şişlik, ısı artışı devam eder. Eklem instabilitesi.',
        radiological: 'Periartikular osteopeni, kemik fragmentasyonu, subluksasyon, fraktür.',
        management: 'Tam yük boşaltma zorunlu (TCC tercih). 6–12 hafta veya inflamasyon gerileyene dek.',
        color: '#ea580c',
    },
    {
        stage: 2,
        label: 'Evre 2 — Koalisyon / Konsolidasyon',
        clinical: 'Isı farkı azalmaya başlar. Deformite stabilleşiyor.',
        radiological: 'Fragmanlar birleşiyor, kallus formasyonu, skleroz.',
        management: 'Kademeli yük bindirme. Özel tabanlık/ortez planlanır.',
        color: '#ca8a04',
    },
    {
        stage: 3,
        label: 'Evre 3 — Rekonstruksiyon / Remodeling',
        clinical: 'İnflamasyon geçmiş. Deformite sabit (rocker-bottom vb.).',
        radiological: 'Kemik konsolidasyonu tamamlanmış, deformite kalıcı.',
        management: 'Koruyucu ayakkabı/ortez ömür boyu. Ülser riskine karşı yakın izlem.',
        color: '#16a34a',
    },
];

export function getEichenholtzInfo(stage: 0|1|2|3): EichenholtzInfo {
    return EICHENHOLTZ_STAGES[stage];
}

// ---------- IWGDF Risk Auto-Compute ----------

export function computeIWGDFRisk(opts: {
    lopsLeft: boolean;
    lopsRight: boolean;
    padHistory: boolean;
    deformity: boolean;
    ulcerHistory: boolean;
    amputationHistory: boolean;
    dialysis: boolean;
    transplant: boolean;
}): 0 | 1 | 2 | 3 {
    const { lopsLeft, lopsRight, padHistory, deformity, ulcerHistory, amputationHistory, dialysis, transplant } = opts;
    const lops = lopsLeft || lopsRight;
    if (ulcerHistory || amputationHistory || dialysis || transplant) return 3;
    if (lops && padHistory) return 2;
    if (lops && deformity) return 2;
    if (padHistory && deformity) return 2;
    if (lops || padHistory) return 1;
    return 0;
}

// Risk alert flags
export function computeRiskFlags(opts: {
    lastGlucose?: number;
    wagnerGrade?: number;
    canWalk?: string;
    symptoms?: { discharge?: boolean; odor?: boolean };
    daysSinceLastEntry?: number;
}): string[] {
    const flags: string[] = [];
    if ((opts.lastGlucose ?? 0) > 300) flags.push('KAN ŞEKERİ KRİTİK (>300)');
    if ((opts.wagnerGrade ?? 0) >= 3) flags.push(`WAGNER ${opts.wagnerGrade} - ACİL`);
    if (opts.canWalk === 'cannot') flags.push('YÜRÜYEMIYOR');
    if (opts.symptoms?.discharge && opts.symptoms?.odor) flags.push('AKINTI + KOKU');
    if ((opts.daysSinceLastEntry ?? 0) > 3) flags.push('3 GÜN GİRİŞ YOK');
    return flags;
}
