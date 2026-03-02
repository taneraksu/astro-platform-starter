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
