import { useState, useEffect } from 'react';

interface PainEntry {
    id: string;
    date: string;
    time: string;
    painScore: number;
    location: string;
    character: string[];
    swelling: 'none' | 'mild' | 'moderate' | 'severe';
    warmth: boolean;
    medications: string;
    activities: string;
    notes: string;
}

const PAIN_COLORS = [
    '#22c55e', // 0
    '#4ade80', // 1
    '#a3e635', // 2
    '#d9f99d', // 3
    '#fef08a', // 4
    '#fde047', // 5
    '#fb923c', // 6
    '#f97316', // 7
    '#ef4444', // 8
    '#dc2626', // 9
    '#991b1b', // 10
];

const PAIN_LABELS = [
    'No pain', 'Very mild', 'Mild', 'Moderate', 'Moderate', 'Moderate',
    'Moderately severe', 'Severe', 'Very severe', 'Worst possible', 'Unbearable',
];

const PAIN_CHARACTERS = [
    'Aching', 'Sharp', 'Burning', 'Throbbing', 'Stabbing',
    'Stiffness', 'Soreness', 'Cramping', 'Pressure', 'Numbness/tingling',
];

const STORAGE_KEY = 'arthrocare-pain-log';

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getEntries(): PainEntry[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveEntries(entries: PainEntry[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {}
}

export default function PainTracker() {
    const [entries, setEntries] = useState<PainEntry[]>([]);
    const [view, setView] = useState<'log' | 'history' | 'report'>('log');
    const [form, setForm] = useState<Omit<PainEntry, 'id'>>({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        painScore: 3,
        location: 'knee',
        character: [],
        swelling: 'none',
        warmth: false,
        medications: '',
        activities: '',
        notes: '',
    });
    const [saved, setSaved] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        setEntries(getEntries());
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newEntry: PainEntry = { ...form, id: generateId() };
        const updated = [newEntry, ...entries];
        setEntries(updated);
        saveEntries(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Reset form to current time
        setForm(prev => ({
            ...prev,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            notes: '',
            medications: '',
            activities: '',
        }));
    };

    const deleteEntry = (id: string) => {
        const updated = entries.filter(e => e.id !== id);
        setEntries(updated);
        saveEntries(updated);
        setDeleteConfirm(null);
    };

    const toggleCharacter = (char: string) => {
        setForm(prev => ({
            ...prev,
            character: prev.character.includes(char)
                ? prev.character.filter(c => c !== char)
                : [...prev.character, char],
        }));
    };

    // Report data
    const last7Days = entries.filter(e => {
        const entryDate = new Date(e.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
    });

    const avgPain = last7Days.length > 0
        ? (last7Days.reduce((a, b) => a + b.painScore, 0) / last7Days.length).toFixed(1)
        : 'N/A';
    const maxPain = last7Days.length > 0
        ? Math.max(...last7Days.map(e => e.painScore))
        : 'N/A';
    const minPain = last7Days.length > 0
        ? Math.min(...last7Days.map(e => e.painScore))
        : 'N/A';

    const formatDate = (dateStr: string) => {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
            weekday: 'short', day: 'numeric', month: 'short',
        });
    };

    return (
        <div>
            {/* View Toggle */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                {([['log', '+ Log Pain'], ['history', 'History'], ['report', 'Report']] as const).map(([v, label]) => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors bg-transparent cursor-pointer ${
                            view === v
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* LOG VIEW */}
            {view === 'log' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {saved && (
                        <div className="alert alert-success">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            Pain entry saved successfully!
                        </div>
                    )}

                    {/* Date/Time */}
                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-4">Date & Time</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={form.date}
                                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Time</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={form.time}
                                    onChange={e => setForm(prev => ({ ...prev, time: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pain Score */}
                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-4">
                            Pain Score: <span style={{ color: PAIN_COLORS[form.painScore] }} className="text-2xl font-bold">{form.painScore}/10</span>
                            <span className="ml-2 text-base font-normal text-slate-500">— {PAIN_LABELS[form.painScore]}</span>
                        </h3>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={form.painScore}
                            onChange={e => setForm(prev => ({ ...prev, painScore: Number(e.target.value) }))}
                            className="w-full h-3 rounded-full cursor-pointer mb-3"
                            style={{
                                accentColor: PAIN_COLORS[form.painScore],
                            }}
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>0 — No pain</span>
                            <span>5 — Moderate</span>
                            <span>10 — Unbearable</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            {Array.from({ length: 11 }, (_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, painScore: i }))}
                                    className={`w-7 h-7 rounded-full text-xs font-bold border-2 transition-all ${form.painScore === i ? 'scale-125 border-slate-400' : 'border-slate-200 hover:scale-110'}`}
                                    style={{ backgroundColor: PAIN_COLORS[i], color: i > 7 ? 'white' : '#1e293b' }}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location & Character */}
                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-4">Pain Details</h3>
                        <div className="mb-4">
                            <label className="label">Location</label>
                            <select
                                className="input"
                                value={form.location}
                                onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                            >
                                <option value="left-hip">Left Hip</option>
                                <option value="right-hip">Right Hip</option>
                                <option value="left-knee">Left Knee</option>
                                <option value="right-knee">Right Knee</option>
                                <option value="both-hips">Both Hips</option>
                                <option value="both-knees">Both Knees</option>
                                <option value="lower-back">Lower Back</option>
                                <option value="thigh">Thigh</option>
                                <option value="calf">Calf (important — may indicate DVT)</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Pain Character (select all that apply)</label>
                            <div className="flex flex-wrap gap-2">
                                {PAIN_CHARACTERS.map(char => (
                                    <button
                                        key={char}
                                        type="button"
                                        onClick={() => toggleCharacter(char)}
                                        className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
                                            form.character.includes(char)
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'border-slate-200 text-slate-600 hover:border-blue-300'
                                        }`}
                                    >
                                        {char}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Swelling & Warmth */}
                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-4">Swelling & Warmth</h3>
                        <div className="mb-4">
                            <label className="label">Swelling Level</label>
                            <div className="flex gap-2">
                                {(['none', 'mild', 'moderate', 'severe'] as const).map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, swelling: level }))}
                                        className={`flex-1 py-2 px-2 rounded-lg text-sm border-2 transition-colors capitalize ${
                                            form.swelling === level
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.warmth}
                                    onChange={e => setForm(prev => ({ ...prev, warmth: e.target.checked }))}
                                    className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                                />
                                <div>
                                    <span className="font-medium text-slate-800">Joint feels warm or hot to touch</span>
                                    {form.warmth && (
                                        <p className="text-xs text-amber-600 mt-0.5">
                                            ⚠ Warmth + pain + fever may indicate infection — contact your surgeon
                                        </p>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Activities & Medications */}
                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-4">Context</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Medications taken today</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g. Paracetamol 1g, Oxycodone 5mg"
                                    value={form.medications}
                                    onChange={e => setForm(prev => ({ ...prev, medications: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="label">Activities done today</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g. Exercises, short walk, physio appointment"
                                    value={form.activities}
                                    onChange={e => setForm(prev => ({ ...prev, activities: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="label">Additional Notes</label>
                                <textarea
                                    className="input min-h-20 resize-none"
                                    placeholder="Any other observations, concerns, or questions for your doctor..."
                                    value={form.notes}
                                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full">
                        Save Pain Entry
                    </button>
                </form>
            )}

            {/* HISTORY VIEW */}
            {view === 'history' && (
                <div>
                    {entries.length === 0 ? (
                        <div className="card text-center py-12">
                            <div className="text-4xl mb-3">📊</div>
                            <p className="text-slate-500">No entries yet. Start tracking your pain using the Log tab.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {entries.map(entry => (
                                <div key={entry.id} className="card">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                                            style={{
                                                backgroundColor: PAIN_COLORS[entry.painScore] + '33',
                                                color: PAIN_COLORS[entry.painScore],
                                            }}
                                        >
                                            {entry.painScore}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-semibold text-slate-900">
                                                    {formatDate(entry.date)} at {entry.time}
                                                </span>
                                                <span className="badge badge-blue capitalize">
                                                    {entry.location.replace(/-/g, ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                {PAIN_LABELS[entry.painScore]}
                                                {entry.character.length > 0 && ` — ${entry.character.join(', ')}`}
                                            </p>
                                            {entry.swelling !== 'none' && (
                                                <p className="text-xs text-amber-600 mt-0.5">
                                                    Swelling: {entry.swelling}
                                                    {entry.warmth ? ' · Joint warm' : ''}
                                                </p>
                                            )}
                                            {entry.medications && (
                                                <p className="text-xs text-slate-500 mt-0.5">💊 {entry.medications}</p>
                                            )}
                                            {entry.notes && (
                                                <p className="text-xs text-slate-500 mt-1 italic">&ldquo;{entry.notes}&rdquo;</p>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0">
                                            {deleteConfirm === entry.id ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => deleteEntry(entry.id)} className="btn btn-danger btn-sm">Delete</button>
                                                    <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost btn-sm">Cancel</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(entry.id)}
                                                    className="text-slate-300 hover:text-red-400 transition-colors"
                                                    aria-label="Delete entry"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* REPORT VIEW */}
            {view === 'report' && (
                <div>
                    <div className="card mb-6">
                        <h3 className="font-semibold text-slate-900 mb-4">Last 7 Days Summary</h3>
                        {last7Days.length === 0 ? (
                            <p className="text-slate-500 text-sm">No entries in the last 7 days.</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-700">{avgPain}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Average Pain</div>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">{maxPain}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Highest Pain</div>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{minPain}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Lowest Pain</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Pain Score Trend</p>
                                    {last7Days.slice(0, 10).map(entry => (
                                        <div key={entry.id} className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 w-24 flex-shrink-0">
                                                {formatDate(entry.date)}
                                            </span>
                                            <div className="flex-1 bg-slate-100 rounded-full h-5 relative">
                                                <div
                                                    className="h-5 rounded-full flex items-center justify-end pr-2 transition-all"
                                                    style={{
                                                        width: `${(entry.painScore / 10) * 100}%`,
                                                        backgroundColor: PAIN_COLORS[entry.painScore],
                                                        minWidth: '2rem',
                                                    }}
                                                >
                                                    <span className="text-xs font-bold" style={{ color: entry.painScore > 7 ? 'white' : '#1e293b' }}>
                                                        {entry.painScore}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="card">
                        <h3 className="font-semibold text-slate-900 mb-3">For Your Doctor</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            You can show this report to your surgeon or GP at your next appointment. It provides a summary of your pain levels, medications, and any concerns.
                        </p>
                        {last7Days.length > 0 ? (
                            <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs text-slate-700 space-y-1">
                                <p className="font-bold text-slate-900">ArthroCare Pain Report — Last 7 Days</p>
                                <p>Generated: {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p>Total entries: {last7Days.length}</p>
                                <p>Average pain: {avgPain}/10 | Max: {maxPain}/10 | Min: {minPain}/10</p>
                                <p className="pt-2 font-bold">Entries:</p>
                                {last7Days.slice(0, 10).map(e => (
                                    <p key={e.id}>
                                        {e.date} {e.time} — Score: {e.painScore}/10 ({e.location.replace(/-/g, ' ')})
                                        {e.character.length > 0 ? ` [${e.character.join(', ')}]` : ''}
                                        {e.medications ? ` Meds: ${e.medications}` : ''}
                                        {e.notes ? ` Note: ${e.notes}` : ''}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm">No recent entries to report.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
