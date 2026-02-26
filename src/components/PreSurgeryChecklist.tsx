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
        title: 'Medical Clearances (4–6 weeks before)',
        icon: '🩺',
        items: [
            { id: 'cardiac', text: 'Obtain cardiac clearance if indicated', detail: 'Your surgeon may require an ECG or cardiology review depending on your age and medical history.', important: true },
            { id: 'dental', text: 'Complete any outstanding dental work', detail: 'Dental bacteria can travel to your new joint. Have any fillings, extractions, or cleanings done before surgery.', important: true },
            { id: 'bloodwork', text: 'Complete pre-operative blood tests', detail: 'FBC, coagulation studies, group & hold, metabolic panel as requested.' },
            { id: 'xray', text: 'Attend all required imaging appointments', detail: 'X-rays and possibly CT or MRI scans for surgical planning.' },
            { id: 'anaesthesia', text: 'Attend pre-anaesthetic consultation', detail: 'Discuss anaesthesia options (general vs. spinal) and any relevant allergies or history.' },
            { id: 'diabetes', text: 'Optimise blood sugar if diabetic', detail: 'Target HbA1c < 8% if possible. Poorly controlled diabetes increases infection risk.', important: true },
            { id: 'smoking', text: 'Stop smoking (ideally ≥6 weeks before)', detail: 'Smoking significantly increases risk of complications, wound healing problems, and infection.', important: true },
            { id: 'weight', text: 'Discuss weight management with your team', detail: 'BMI >40 is associated with higher complication rates. Even a small reduction helps.' },
        ],
    },
    {
        title: 'Medications (1–2 weeks before)',
        icon: '💊',
        items: [
            { id: 'nsaids', text: 'Stop NSAIDs (ibuprofen, naproxen, etc.)', detail: 'Stop at least 7 days before surgery as they increase bleeding risk.', important: true },
            { id: 'anticoag', text: 'Discuss stopping anticoagulants with your team', detail: 'Warfarin, rivaroxaban, apixaban, clopidogrel — your team will advise timing.', important: true },
            { id: 'herbals', text: 'Stop herbal supplements and fish oil', detail: 'Many supplements affect bleeding. Stop garlic, ginseng, ginkgo, vitamin E, fish oil 1–2 weeks prior.' },
            { id: 'meds-list', text: 'Prepare a complete medications list', detail: 'Include all prescription, OTC, and herbal medications with doses and frequency.' },
            { id: 'iron', text: 'Start iron supplementation if anaemic', detail: 'If your pre-op blood tests show anaemia, your surgeon may prescribe iron tablets.' },
            { id: 'medications-morning', text: 'Clarify which regular meds to take on morning of surgery', detail: 'Most blood pressure and heart medications are continued; diabetes medications often held.' },
        ],
    },
    {
        title: 'Home Preparation (1–2 weeks before)',
        icon: '🏠',
        items: [
            { id: 'grab-bars', text: 'Install grab bars in bathroom and shower' },
            { id: 'raised-toilet', text: 'Arrange raised toilet seat (hip replacement)', detail: 'Essential for hip replacement patients to avoid hip flexion >90°.' },
            { id: 'shower-seat', text: 'Arrange shower chair or bath board' },
            { id: 'bed-height', text: 'Adjust bed height to be easy to get in and out of', detail: 'Knee height is ideal. Use a firm mattress.' },
            { id: 'remove-rugs', text: 'Remove trip hazards (loose rugs, cords)', detail: 'Falls are a serious risk post-surgery. Clear pathways throughout the home.' },
            { id: 'essential-items', text: 'Place everyday items within easy reach', detail: 'Avoid bending and reaching. Place items at waist height for the first few weeks.' },
            { id: 'walker', text: 'Arrange walker or crutches (pre-arrange with physio)' },
            { id: 'recliner', text: 'Arrange recliner chair if possible', detail: 'A recliner helps with comfort and getting up/down safely in early recovery.' },
            { id: 'pet', text: 'Arrange pet care if needed', detail: 'Dogs in particular pose a fall risk in early recovery.' },
            { id: 'freezer-meals', text: 'Prepare frozen meals and easy food', detail: 'Stock up on easy-to-prepare nutritious meals for the first 2 weeks.' },
            { id: 'transport', text: 'Arrange transport to/from hospital', detail: 'You will not be able to drive for several weeks. Arrange a reliable driver.' },
            { id: 'help', text: 'Arrange carer or support person for first 1–2 weeks' },
        ],
    },
    {
        title: 'The Night Before',
        icon: '🌙',
        items: [
            { id: 'fasting', text: 'Nothing to eat after midnight (or as instructed)', detail: 'Typically: no solid food from midnight. Clear fluids usually permitted until 2–4 hours before. Check exact times with your surgical team.', important: true },
            { id: 'shower', text: 'Shower with antiseptic soap (chlorhexidine) if provided', detail: 'Reduces skin bacteria to lower infection risk. Wash entire body, focus on the surgical area.' },
            { id: 'nail-polish', text: 'Remove nail polish and nail extensions' },
            { id: 'jewellery', text: 'Remove all jewellery, piercings, body modifications' },
            { id: 'pack-bag', text: 'Pack your hospital bag', detail: 'Include: loose comfortable clothing, non-slip footwear, toiletries, charger, book/tablet, health insurance card, medications list, Medicare card.' },
            { id: 'sleep', text: 'Get a good night\'s rest' },
        ],
    },
    {
        title: 'Day of Surgery',
        icon: '🏥',
        items: [
            { id: 'morning-shower', text: 'Morning antiseptic shower if instructed' },
            { id: 'morning-meds', text: 'Take specified morning medications with small sip of water only' },
            { id: 'no-makeup', text: 'No make-up, perfume, deodorant, or lotion on surgical site' },
            { id: 'loose-clothing', text: 'Wear loose, comfortable clothing', detail: 'Shorts or loose trackpants are ideal for knee replacement. Loose clothing to fit over bandages.' },
            { id: 'arrive-time', text: 'Arrive at hospital at designated time', detail: 'Usually 1–2 hours before your scheduled surgery time for admission and prep.' },
            { id: 'id-docs', text: 'Bring all admission documents, consent forms, ID' },
            { id: 'support-person', text: 'Have support person with you for waiting and transport home' },
            { id: 'leave-valuables', text: 'Leave valuables at home' },
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
                        <h3 className="font-semibold text-slate-900">Your Progress</h3>
                        <p className="text-sm text-slate-500">{completedItems} of {totalItems} items completed</p>
                    </div>
                    <div className="text-right">
                        <span className={`text-2xl font-bold ${progress === 100 ? 'text-green-600' : 'text-blue-700'}`}>
                            {progress}%
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
                        You've completed all pre-surgery preparation items!
                    </div>
                )}
                <div className="flex justify-end mt-2">
                    <button
                        onClick={resetAll}
                        className="text-xs text-slate-400 hover:text-red-600 transition-colors"
                    >
                        Reset all
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
                                                aria-label={`Mark "${item.text}" as ${checked[item.id] ? 'incomplete' : 'complete'}`}
                                            >
                                                {checked[item.id] && (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                                    </svg>
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-2">
                                                    <p className={`text-sm font-medium ${checked[item.id] ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                                        {item.text}
                                                        {item.important && !checked[item.id] && (
                                                            <span className="ml-2 badge badge-red text-xs">Important</span>
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
                                                    aria-label="Show more details"
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
