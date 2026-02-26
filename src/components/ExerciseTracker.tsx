import { useState, useEffect } from 'react';

interface Exercise {
    id: string;
    name: string;
    category: string;
    sets: number;
    reps: string;
    hold?: string;
    description: string;
    imageHint: string;
    forSurgery: ('hip' | 'knee' | 'both')[];
    phase: ('early' | 'mid' | 'late')[];
    caution?: string;
}

const EXERCISES: Exercise[] = [
    {
        id: 'ankle-pumps',
        name: 'Ankle Pumps',
        category: 'Circulation',
        sets: 3,
        reps: '20',
        description: 'Lying flat, pump your foot up and down (flex and point). This keeps blood circulating and prevents clots. Do these hourly when resting.',
        imageHint: '↑↓ Flex foot up, then point down',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
    },
    {
        id: 'ankle-circles',
        name: 'Ankle Circles',
        category: 'Circulation',
        sets: 3,
        reps: '10 each direction',
        description: 'Lying flat, circle your foot clockwise then anti-clockwise. Helps circulation and ankle mobility.',
        imageHint: '⟳ Rotate ankle in circles',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
    },
    {
        id: 'quad-sets',
        name: 'Quadriceps Sets (Quad Sets)',
        category: 'Strengthening',
        sets: 3,
        reps: '10',
        hold: '5 seconds',
        description: 'Lying flat with leg straight, tighten your thigh muscle by pressing the back of your knee down into the bed. Hold, then relax. This activates and strengthens the quadriceps muscle.',
        imageHint: '⬇ Press back of knee into bed',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
    },
    {
        id: 'glute-sets',
        name: 'Gluteal Sets',
        category: 'Strengthening',
        sets: 3,
        reps: '10',
        hold: '5 seconds',
        description: 'Lying flat, squeeze your buttock muscles together and hold. Helps activate hip muscles important for stability.',
        imageHint: '◉ Squeeze buttocks together',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
    },
    {
        id: 'heel-slides',
        name: 'Heel Slides',
        category: 'Range of Motion',
        sets: 3,
        reps: '10',
        description: 'Lying on your back, slowly slide your heel toward your bottom by bending your knee and hip. Slide it back out straight. For hip replacement, only bend to 90° unless cleared for more.',
        imageHint: '← Slide heel toward bottom, then back',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
        caution: 'Hip replacement: do not bend hip beyond 90° in early recovery',
    },
    {
        id: 'short-arc-quads',
        name: 'Short Arc Quads (SAQ)',
        category: 'Strengthening',
        sets: 3,
        reps: '10',
        hold: '5 seconds',
        description: 'Place a rolled towel (15cm diameter) under your knee. Straighten your knee fully and hold, then slowly lower. Strengthens the last portion of quad contraction — critical for walking and stairs.',
        imageHint: '↑ Straighten knee with towel support',
        forSurgery: ['knee'],
        phase: ['early', 'mid'],
    },
    {
        id: 'straight-leg-raise',
        name: 'Straight Leg Raise (SLR)',
        category: 'Strengthening',
        sets: 3,
        reps: '10',
        hold: '2 seconds',
        description: 'Lying flat, tighten your quad (flatten knee), then lift your straight leg to 45°. Lower slowly. Strengthens hip flexors and quadriceps. Ensure knee is straight throughout.',
        imageHint: '↑ Lift straight leg to 45°',
        forSurgery: ['both'],
        phase: ['early', 'mid'],
        caution: 'Hip replacement: check with physiotherapist regarding hip precautions',
    },
    {
        id: 'sitting-knee-ext',
        name: 'Seated Knee Extension',
        category: 'Range of Motion',
        sets: 3,
        reps: '10',
        hold: '5 seconds',
        description: 'Sitting in a chair, slowly straighten your knee until your leg is as straight as possible. Hold, then lower. Important for regaining full extension. Achieving full extension (0°) is critical.',
        imageHint: '→ Straighten knee from seated position',
        forSurgery: ['knee'],
        phase: ['early', 'mid'],
    },
    {
        id: 'sitting-knee-flex',
        name: 'Seated Knee Flexion',
        category: 'Range of Motion',
        sets: 3,
        reps: '10',
        description: 'Sitting in a chair, use your good foot to gently push your operated foot further back under the chair, increasing the bend. Hold at end range. Critical for regaining knee bend.',
        imageHint: '← Slide foot back under chair',
        forSurgery: ['knee'],
        phase: ['early', 'mid'],
    },
    {
        id: 'hip-abduction',
        name: 'Hip Abduction',
        category: 'Strengthening',
        sets: 3,
        reps: '10',
        description: 'Lying on your back, slide your operated leg out to the side, keeping toes pointing up. Keep your back flat. Strengthens hip abductors — important for walking without a limp.',
        imageHint: '→ Slide leg out to the side',
        forSurgery: ['hip'],
        phase: ['early', 'mid'],
        caution: 'Stay within comfortable range. Do not cross midline.',
    },
    {
        id: 'standing-hip-abduction',
        name: 'Standing Hip Abduction',
        category: 'Strengthening',
        sets: 3,
        reps: '10',
        description: 'Standing with support, lift your operated leg out to the side (keep toes forward, do not lean). Return slowly. Use a wall or frame for balance.',
        imageHint: '← Stand and lift leg to side',
        forSurgery: ['hip'],
        phase: ['mid', 'late'],
    },
    {
        id: 'standing-knee-flex',
        name: 'Standing Knee Flexion',
        category: 'Strengthening',
        sets: 3,
        reps: '10',
        description: 'Standing with support, bend your operated knee up behind you toward your bottom. Keep thighs level. Strengthens hamstrings.',
        imageHint: '↑ Bend knee up behind',
        forSurgery: ['knee'],
        phase: ['mid', 'late'],
    },
    {
        id: 'mini-squats',
        name: 'Mini Squats / Quarter Squats',
        category: 'Strengthening',
        sets: 3,
        reps: '10',
        description: 'Standing with support, bend both knees slightly (about 30°), keeping your back straight and weight even. Hold briefly, then stand. Progresses to deeper squat as tolerated.',
        imageHint: '↓ Bend knees slightly while standing',
        forSurgery: ['both'],
        phase: ['mid', 'late'],
    },
    {
        id: 'step-ups',
        name: 'Step-Ups',
        category: 'Functional',
        sets: 3,
        reps: '10',
        description: 'Step up onto a low step with your operated leg, then bring the other leg up. Step down with your non-operated leg first. Builds functional strength for stairs.',
        imageHint: '↑ Step up with operated leg first',
        forSurgery: ['both'],
        phase: ['late'],
    },
    {
        id: 'stationary-cycling',
        name: 'Stationary Cycling',
        category: 'Aerobic',
        sets: 1,
        reps: '10–20 minutes',
        description: 'Low resistance cycling on a stationary bike. Start with the seat high (minimal knee bend). Excellent for range of motion and cardiovascular fitness. Gradually lower the seat as flexion improves.',
        imageHint: '🚲 Cycle at comfortable resistance',
        forSurgery: ['both'],
        phase: ['mid', 'late'],
        caution: 'Hip replacement: ensure bike position does not require >90° hip flexion initially',
    },
    {
        id: 'walking-program',
        name: 'Walking Program',
        category: 'Aerobic',
        sets: 1,
        reps: 'As tolerated, building to 30 min',
        description: 'Regular walking is essential for recovery. Start with short distances (5–10 min), gradually increasing as tolerated. Use your walking aid as needed. Walk on flat, even surfaces initially.',
        imageHint: '🚶 Walk on flat, even surfaces',
        forSurgery: ['both'],
        phase: ['early', 'mid', 'late'],
    },
];

const STORAGE_KEY = 'arthrocare-exercise-log';

function getTodayKey() {
    return new Date().toISOString().split('T')[0];
}

function getStoredLog(): Record<string, Record<string, number>> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

export default function ExerciseTracker() {
    const [surgeryType, setSurgeryType] = useState<'hip' | 'knee' | 'both'>('knee');
    const [phase, setPhase] = useState<'early' | 'mid' | 'late'>('early');
    const [log, setLog] = useState<Record<string, Record<string, number>>>({});
    const [expandedEx, setExpandedEx] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setLog(getStoredLog());
    }, []);

    const todayKey = getTodayKey();
    const todayLog = log[todayKey] || {};

    const filteredExercises = EXERCISES.filter(ex =>
        (ex.forSurgery.includes(surgeryType) || ex.forSurgery.includes('both') || surgeryType === 'both') &&
        ex.phase.includes(phase)
    );

    const logSet = (exerciseId: string) => {
        const current = todayLog[exerciseId] || 0;
        const ex = EXERCISES.find(e => e.id === exerciseId);
        const maxSets = ex?.sets || 3;
        if (current >= maxSets) return;

        const updated = {
            ...log,
            [todayKey]: {
                ...todayLog,
                [exerciseId]: current + 1,
            },
        };
        setLog(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
    };

    const resetToday = () => {
        const updated = { ...log };
        delete updated[todayKey];
        setLog(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
    };

    const totalSets = filteredExercises.reduce((acc, ex) => acc + ex.sets, 0);
    const completedSets = filteredExercises.reduce((acc, ex) => acc + Math.min(todayLog[ex.id] || 0, ex.sets), 0);
    const exercisesDone = filteredExercises.filter(ex => (todayLog[ex.id] || 0) >= ex.sets).length;

    const categoryColors: Record<string, string> = {
        'Circulation': 'bg-blue-100 text-blue-700',
        'Strengthening': 'bg-green-100 text-green-700',
        'Range of Motion': 'bg-purple-100 text-purple-700',
        'Aerobic': 'bg-orange-100 text-orange-700',
        'Functional': 'bg-teal-100 text-teal-700',
    };

    return (
        <div>
            {/* Settings */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Surgery Type</label>
                        <div className="flex gap-2">
                            {([['hip', '🦴 Hip'], ['knee', '🦵 Knee'], ['both', '🦴🦵 Both']] as const).map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setSurgeryType(val)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${surgeryType === val ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="label">Recovery Phase</label>
                        <div className="flex gap-2">
                            {([['early', 'Early (0–6wk)'], ['mid', 'Mid (6–12wk)'], ['late', 'Late (3mo+)']] as const).map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setPhase(val)}
                                    className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${phase === val ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Progress */}
            <div className="card mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-slate-900">Today's Session</h3>
                        <p className="text-sm text-slate-500">
                            {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-700">{exercisesDone}/{filteredExercises.length}</div>
                        <div className="text-xs text-slate-500">exercises done</div>
                    </div>
                </div>
                <div className="progress-bar mb-2">
                    <div
                        className={`progress-fill ${exercisesDone === filteredExercises.length && filteredExercises.length > 0 ? 'bg-green-500' : 'bg-blue-600'}`}
                        style={{ width: filteredExercises.length > 0 ? `${Math.round((completedSets / totalSets) * 100)}%` : '0%' }}
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                    <span>{completedSets} of {totalSets} sets completed</span>
                    {Object.keys(todayLog).length > 0 && (
                        <button onClick={resetToday} className="text-red-400 hover:text-red-600 transition-colors">
                            Reset today
                        </button>
                    )}
                </div>
                {exercisesDone === filteredExercises.length && filteredExercises.length > 0 && (
                    <div className="alert alert-success text-sm mt-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Great work! You've completed today's exercise program!
                    </div>
                )}
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
                {filteredExercises.map((ex) => {
                    const setsLogged = todayLog[ex.id] || 0;
                    const isDone = setsLogged >= ex.sets;
                    const isExpanded = expandedEx[ex.id];

                    return (
                        <div
                            key={ex.id}
                            className={`rounded-xl border-2 transition-all ${isDone ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}
                        >
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${isDone ? 'bg-green-100' : 'bg-slate-100'}`}>
                                        {isDone ? '✓' : '○'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className={`font-semibold ${isDone ? 'text-green-800' : 'text-slate-900'}`}>
                                                {ex.name}
                                            </h3>
                                            <span className={`badge text-xs ${categoryColors[ex.category] || 'badge-blue'}`}>
                                                {ex.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            {ex.sets} sets × {ex.reps}{ex.hold ? ` — hold ${ex.hold}` : ''}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{ex.imageHint}</p>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-3 pl-13">
                                        <p className="text-sm text-slate-700 mb-2 leading-relaxed">{ex.description}</p>
                                        {ex.caution && (
                                            <div className="alert alert-warning text-xs">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                                </svg>
                                                <span>{ex.caution}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mt-3">
                                    {/* Set progress dots */}
                                    <div className="flex gap-1.5">
                                        {Array.from({ length: ex.sets }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                                                    i < setsLogged
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-slate-300 text-slate-400'
                                                }`}
                                            >
                                                {i < setsLogged ? '✓' : i + 1}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex-1" />

                                    <button
                                        onClick={() => setExpandedEx(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                                        className="text-xs text-slate-500 hover:text-blue-600 transition-colors"
                                    >
                                        {isExpanded ? 'Less' : 'How to'}
                                    </button>

                                    <button
                                        onClick={() => logSet(ex.id)}
                                        disabled={isDone}
                                        className={`btn btn-sm ${isDone ? 'bg-green-100 text-green-700 cursor-default' : 'btn-primary'}`}
                                    >
                                        {isDone ? 'Done ✓' : `Log Set ${setsLogged + 1}/${ex.sets}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 alert alert-info text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 mt-0.5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <div>
                    <p className="font-semibold">Tips for exercising safely</p>
                    <ul className="mt-1 space-y-0.5 list-disc list-inside">
                        <li>Exercise should cause mild discomfort but not sharp or severe pain</li>
                        <li>Take your pain medication before exercises if prescribed</li>
                        <li>Rest for 1–2 hours after exercising</li>
                        <li>Ice the joint for 15–20 minutes after exercises to reduce swelling</li>
                        <li>Stop and contact your physiotherapist if exercises cause sharp pain</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
