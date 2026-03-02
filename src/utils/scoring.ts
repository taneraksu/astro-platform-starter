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
