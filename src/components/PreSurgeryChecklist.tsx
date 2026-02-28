import { useState, useEffect } from 'react';

interface ChecklistItem {
    id: string;
    text: string;
    detail?: string;
    important?: boolean;
}

interface ChecklistSection {
    title: string;
    icon: string;
    items: ChecklistItem[];
}

const CHECKLIST_SECTIONS: ChecklistSection[] = [
    {
        title: 'Tıbbi Onaylar (Ameliyattan 4–6 Hafta Önce)',
        icon: '🩺',
        items: [
            { id: 'cardiac', text: 'Gerekiyorsa kardiyak onay alın', detail: 'Yaşınıza ve tıbbi geçmişinize bağlı olarak cerrahınız EKG veya kardiyoloji değerlendirmesi isteyebilir.', important: true },
            { id: 'dental', text: 'Bekleyen diş tedavilerini tamamlayın', detail: 'Diş bakterileri yeni eklemınıza yayılabilir. Ameliyat öncesinde dolgu, çekim veya temizlik yapılmalıdır.', important: true },
            { id: 'bloodwork', text: 'Ameliyat öncesi kan testlerini yaptırın', detail: 'Tam kan sayımı, pıhtılaşma testleri, kan grubu ve biyokimyasal testler.' },
            { id: 'xray', text: 'Gerekli görüntüleme randevularına gidin', detail: 'Cerrahi planlama için röntgen ve gerekirse bilgisayarlı tomografi veya MRI.' },
            { id: 'anaesthesia', text: 'Anestezi konsültasyonuna katılın', detail: 'Anestezi seçeneklerini (genel veya spinal), alerjilerinizi ve tıbbi geçmişinizi görüşün.' },
            { id: 'diabetes', text: 'Diyabetiniz varsa kan şekerini optimize edin', detail: 'Mümkünse HbA1c < %8 hedefleyin. Kötü kontrollü diyabet enfeksiyon riskini artırır.', important: true },
            { id: 'smoking', text: 'Sigarayı bırakın (ideal olarak ameliyattan ≥6 hafta önce)', detail: 'Sigara, komplikasyon, yara iyileşme sorunu ve enfeksiyon riskini önemli ölçüde artırır.', important: true },
            { id: 'weight', text: 'Kilo yönetimini sağlık ekibinizle görüşün', detail: 'Vücut kitle indeksi >40 olan hastalarda komplikasyon oranı daha yüksektir. Küçük bir azalma bile yardımcı olur.' },
        ],
    },
    {
        title: 'İlaçlar (Ameliyattan 1–2 Hafta Önce)',
        icon: '💊',
        items: [
            { id: 'nsaids', text: 'NSAİİ\'leri kesin (ibuprofen, naproksen vb.)', detail: 'Kanama riskini artırdığından ameliyattan en az 7 gün önce kesilmelidir.', important: true },
            { id: 'anticoag', text: 'Antikoagülanları kesmek için ekibinizle görüşün', detail: 'Varfarin, rivaroksaban, apiksaban, klopidogrel — ekibiniz zamanlama konusunda bilgi verecektir.', important: true },
            { id: 'herbals', text: 'Bitkisel takviyeler ve balık yağını kesin', detail: 'Pek çok takviye kanamayı etkiler. Sarımsak, ginseng, ginkgo, E vitamini, balık yağını 1–2 hafta önce kesin.' },
            { id: 'meds-list', text: 'Tam ilaç listesi hazırlayın', detail: 'Reçeteli, reçetesiz ve bitkisel tüm ilaçları doz ve kullanım sıklığıyla listeleyin.' },
            { id: 'iron', text: 'Kansemik iseniz demir takviyesi başlayın', detail: 'Ameliyat öncesi testlerde anemi tespit edilirse cerrahınız demir hapı reçete edebilir.' },
            { id: 'medications-morning', text: 'Ameliyat sabahı hangi ilaçları almanız gerektiğini öğrenin', detail: 'Genellikle tansiyon ve kalp ilaçları devam eder; diyabet ilaçları çoğunlukla tutulur.' },
        ],
    },
    {
        title: 'Ev Hazırlığı (Ameliyattan 1–2 Hafta Önce)',
        icon: '🏠',
        items: [
            { id: 'grab-bars', text: 'Banyo ve duşa tutunma barları takın' },
            { id: 'raised-toilet', text: 'Yükseltilmiş tuvalet oturağı temin edin (kalça protezi için)', detail: 'Kalça protezi hastaları için 90°\'nin üzerinde kalça fleksiyonunu önlemek adına zorunludur.' },
            { id: 'shower-seat', text: 'Duş sandalyesi veya küvet tahtası temin edin' },
            { id: 'bed-height', text: 'Yatağın yüksekliğini kolayca inip kalkabilecek şekilde ayarlayın', detail: 'Diz yüksekliği idealdir. Sert bir şilte kullanın.' },
            { id: 'remove-rugs', text: 'Düşme tehlikesi olan nesneleri kaldırın (gevşek halılar, kablolar)', detail: 'Ameliyat sonrasında düşmeler ciddi risk oluşturur. Tüm geçiş yollarını temizleyin.' },
            { id: 'essential-items', text: 'Günlük eşyaları kolay ulaşılabilir bir yere koyun', detail: 'İlk birkaç hafta eğilmekten ve uzanmaktan kaçının. Eşyaları bel hizasına yerleştirin.' },
            { id: 'walker', text: 'Yürüteç veya koltuk değneği temin edin (fizyoterapistinizle görüşün)' },
            { id: 'recliner', text: 'Mümkünse recliner koltuk (şezlong) temin edin', detail: 'Erken iyileşmede rahat oturup kalkmak için yardımcı olur.' },
            { id: 'pet', text: 'Gerekirse evcil hayvan bakımını düzenleyin', detail: 'Özellikle köpekler, erken iyileşmede düşme riski yaratabilir.' },
            { id: 'freezer-meals', text: 'Dondurulmuş yemekler ve kolay hazırlanan yiyecekler stoklanın', detail: 'İlk 2 hafta için besleyici ve kolay hazırlanabilir yiyecekler hazırlayın.' },
            { id: 'transport', text: 'Hastaneye gidip gelme için ulaşım ayarlayın', detail: 'Birkaç hafta araç kullanamayacaksınız. Güvenilir bir sürücü ayarlayın.' },
            { id: 'help', text: 'İlk 1–2 hafta için bakıcı veya destek kişisi ayarlayın' },
        ],
    },
    {
        title: 'Ameliyattan Bir Gece Önce',
        icon: '🌙',
        items: [
            { id: 'fasting', text: 'Gece yarısından sonra yemek yemeyin (veya söylendiği şekilde)', detail: 'Genellikle: gece yarısından itibaren katı gıda yok. Ameliyattan 2–4 saat öncesine kadar şeffaf sıvılara genellikle izin verilir. Tam zamanları sağlık ekibinizle teyit edin.', important: true },
            { id: 'shower', text: 'Antiseptik sabunla (klorheksidin) duş alın', detail: 'Enfeksiyon riskini azaltmak için cilt bakterilerini azaltır. Tüm vücudu, özellikle ameliyat bölgesini yıkayın.' },
            { id: 'nail-polish', text: 'Oje ve yapay tırnakları çıkarın' },
            { id: 'jewellery', text: 'Tüm mücevherleri, piercinglari çıkarın' },
            { id: 'pack-bag', text: 'Hastane çantanızı hazırlayın', detail: 'Şunları dahil edin: bol rahat kıyafetler, kaymaz ayakkabı, tuvalet malzemeleri, şarj cihazı, kitap/tablet, sağlık sigortası kartı, ilaç listesi, kimlik belgesi.' },
            { id: 'sleep', text: 'İyi bir gece uykusu alın' },
        ],
    },
    {
        title: 'Ameliyat Günü',
        icon: '🏥',
        items: [
            { id: 'morning-shower', text: 'Talimat verildiyse sabah antiseptik duşu alın' },
            { id: 'morning-meds', text: 'Belirtilen sabah ilaçlarını yalnızca küçük bir yudum suyla alın' },
            { id: 'no-makeup', text: 'Ameliyat bölgesine makyaj, parfüm, deodorant veya losyon sürmeyin' },
            { id: 'loose-clothing', text: 'Bol, rahat kıyafetler giyin', detail: 'Diz protezi için şort veya bol eşofman altı idealdir. Bandajların üzerine geçecek kıyafetler tercih edin.' },
            { id: 'arrive-time', text: 'Belirlenen saatte hastanede olun', detail: 'Genellikle ameliyat saatinizden 1–2 saat önce kabul ve hazırlık için.' },
            { id: 'id-docs', text: 'Tüm kabul belgelerini, onay formlarını ve kimliğinizi yanınıza alın' },
            { id: 'support-person', text: 'Bekleme ve eve dönüş için yanınızda destek kişisi bulunsun' },
            { id: 'leave-valuables', text: 'Değerli eşyalarınızı evde bırakın' },
        ],
    },
];

const STORAGE_KEY = 'arthrocare-pre-surgery-checklist';

export default function PreSurgeryChecklist() {
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setChecked(JSON.parse(saved));
        } catch {}
    }, []);

    const toggleItem = (id: string) => {
        const updated = { ...checked, [id]: !checked[id] };
        setChecked(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
    };

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const totalItems = CHECKLIST_SECTIONS.reduce((acc, s) => acc + s.items.length, 0);
    const completedItems = Object.values(checked).filter(Boolean).length;
    const progress = Math.round((completedItems / totalItems) * 100);

    const resetAll = () => {
        setChecked({});
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
    };

    return (
        <div>
            {/* Progress Summary */}
            <div className="card mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-slate-900">İlerlemeniz</h3>
                        <p className="text-sm text-slate-500">{completedItems} / {totalItems} madde tamamlandı</p>
                    </div>
                    <div className="text-right">
                        <span className={`text-2xl font-bold ${progress === 100 ? 'text-green-600' : 'text-blue-700'}`}>
                            %{progress}
                        </span>
                    </div>
                </div>
                <div className="progress-bar mb-3">
                    <div
                        className={`progress-fill ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {progress === 100 && (
                    <div className="alert alert-success text-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Tüm ameliyat öncesi hazırlık maddelerini tamamladınız!
                    </div>
                )}
                <div className="flex justify-end mt-2">
                    <button
                        onClick={resetAll}
                        className="text-xs text-slate-400 hover:text-red-600 transition-colors"
                    >
                        Sıfırla
                    </button>
                </div>
            </div>

            {/* Checklist Sections */}
            <div className="space-y-6">
                {CHECKLIST_SECTIONS.map((section) => {
                    const sectionCompleted = section.items.filter(i => checked[i.id]).length;
                    return (
                        <div key={section.title} className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <span>{section.icon}</span>
                                    {section.title}
                                </h3>
                                <span className={`badge ${sectionCompleted === section.items.length ? 'badge-green' : 'badge-blue'}`}>
                                    {sectionCompleted}/{section.items.length}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {section.items.map((item) => (
                                    <div key={item.id} className={`rounded-lg border transition-colors ${checked[item.id] ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50'}`}>
                                        <div className="flex items-start gap-3 p-3">
                                            <button
                                                onClick={() => toggleItem(item.id)}
                                                className={`flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center transition-colors ${checked[item.id] ? 'bg-green-500 border-green-500' : 'border-slate-300 bg-white hover:border-blue-400'}`}
                                                aria-label={`"${item.text}" maddesini ${checked[item.id] ? 'tamamlanmadı' : 'tamamlandı'} olarak işaretle`}
                                            >
                                                {checked[item.id] && (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                                    </svg>
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-2 flex-wrap">
                                                    <p className={`text-sm font-medium ${checked[item.id] ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                                        {item.text}
                                                        {item.important && !checked[item.id] && (
                                                            <span className="ml-2 badge badge-red text-xs">Önemli</span>
                                                        )}
                                                    </p>
                                                </div>
                                                {item.detail && expandedItems[item.id] && (
                                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.detail}</p>
                                                )}
                                            </div>
                                            {item.detail && (
                                                <button
                                                    onClick={() => toggleExpand(item.id)}
                                                    className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors text-slate-600"
                                                    aria-label="Detayları göster"
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                        {expandedItems[item.id]
                                                            ? <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                                                            : <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
                                                        }
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
