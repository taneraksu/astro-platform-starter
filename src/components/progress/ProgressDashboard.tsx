import { useState, useEffect } from 'react';

interface AssessmentResult {
    type: string;
    date: string;
    score: number;
    maxScore: number;
    interpretation: 'low' | 'moderate' | 'high';
    label: string;
}

interface ExerciseLog {
    date: string;
    exerciseId: string;
    exerciseName: string;
    completed: boolean;
}

function loadData<T>(key: string): T[] {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
    return items.reduce((acc, item) => {
        const d = item.date;
        if (!acc[d]) acc[d] = [];
        acc[d].push(item);
        return acc;
    }, {} as Record<string, T[]>);
}

// ─── Motivation Logic ─────────────────────────────────────────────────────────
function getMotivation(totalExercises: number, totalAssessments: number): { msg: string; badge?: string } {
    if (totalExercises === 0 && totalAssessments === 0)
        return { msg: 'Henüz başlamadınız — bugün bir ilk adım atın! 🌟' };
    if (totalExercises >= 50)
        return { msg: '🏆 Mükemmel! 50 egzersiz tamamladınız. Gerçek bir şampiyon!', badge: '🏆 Şampiyon' };
    if (totalExercises >= 20)
        return { msg: '🥇 Harika ilerleme! 20 egzersiz tamamladınız.', badge: '🥇 Altın' };
    if (totalExercises >= 10)
        return { msg: '🥈 Güzel! 10 egzersiz tamamladınız.', badge: '🥈 Gümüş' };
    if (totalExercises >= 5)
        return { msg: '🥉 Başlangıç için harika! 5 egzersiz tamamladınız.', badge: '🥉 Bronz' };
    if (totalExercises >= 1)
        return { msg: '✨ İlk egzersizinizi yaptınız! Her büyük yolculuk tek adımla başlar.' };
    return { msg: '💪 İlk egzersizinizi yapmak için egzersiz bölümünü ziyaret edin!' };
}

// ─── Mini Chart (text-based) ──────────────────────────────────────────────────
function MiniBarChart({ data, label }: { data: { date: string; count: number }[]; label: string }) {
    if (data.length === 0) return (
        <div className="text-center py-8 text-slate-400 text-base">Henüz veri yok</div>
    );
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div>
            <div className="flex items-end gap-2 h-24">
                {data.slice(-14).map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className="w-full bg-blue-500 rounded-t-sm transition-all"
                            style={{ height: `${(d.count / max) * 80}px`, minHeight: d.count > 0 ? '4px' : '0' }}
                        />
                        {d.count > 0 && <span className="text-xs text-blue-700 font-bold">{d.count}</span>}
                    </div>
                ))}
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">{label} (son 14 gün)</p>
        </div>
    );
}

// ─── Assessment History Table ─────────────────────────────────────────────────
function AssessmentTable({ assessments }: { assessments: AssessmentResult[] }) {
    const bgMap = { low: 'bg-green-50 text-green-800', moderate: 'bg-yellow-50 text-yellow-800', high: 'bg-red-50 text-red-800' };
    const iconMap = { low: '✅', moderate: '⚠️', high: '🚨' };

    const grouped: Record<string, AssessmentResult[]> = {};
    assessments.forEach(a => {
        if (!grouped[a.type]) grouped[a.type] = [];
        grouped[a.type].push(a);
    });

    return (
        <div className="space-y-4">
            {Object.entries(grouped).map(([type, results]) => (
                <div key={type} className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                        <h4 className="font-bold text-lg text-slate-800">{type}</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[...results].reverse().map((r, i) => (
                            <div key={i} className="flex flex-wrap items-center justify-between px-5 py-3 gap-2">
                                <span className="text-slate-600 text-base">{r.date}</span>
                                <span className="font-bold text-lg text-slate-800">{r.score}/{r.maxScore}</span>
                                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${bgMap[r.interpretation]}`}>
                                    {iconMap[r.interpretation]} {r.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Progress Dashboard ──────────────────────────────────────────────────
export default function ProgressDashboard() {
    const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
    const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'exercises'>('overview');

    useEffect(() => {
        setAssessments(loadData<AssessmentResult>('yas_ritmi_assessments'));
        setExerciseLogs(loadData<ExerciseLog>('yas_ritmi_exercise_logs'));
    }, []);

    const today = new Date().toLocaleDateString('tr-TR');
    const todayExercises = exerciseLogs.filter(l => l.date === today).length;
    const totalExercises = exerciseLogs.length;
    const totalAssessments = assessments.length;

    // Exercise by date (last 14 days)
    const exerciseByDate = (() => {
        const map = groupByDate(exerciseLogs);
        const days: { date: string; count: number }[] = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('tr-TR');
            days.push({ date: dateStr, count: map[dateStr]?.length || 0 });
        }
        return days;
    })();

    // Unique exercise days
    const uniqueDays = new Set(exerciseLogs.map(l => l.date)).size;
    const lastAssessmentDate = assessments.length > 0 ? assessments[assessments.length - 1].date : null;
    const motivation = getMotivation(totalExercises, totalAssessments);

    // Recent assessments by type - get latest per type
    const latestByType: Record<string, AssessmentResult> = {};
    assessments.forEach(a => { latestByType[a.type] = a; });

    const tabs = [
        { key: 'overview', label: 'Genel Bakış', icon: '📊' },
        { key: 'assessments', label: 'Değerlendirmeler', icon: '🔬' },
        { key: 'exercises', label: 'Egzersiz Günlüğü', icon: '💪' },
    ] as const;

    return (
        <div>
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-lg border-2 transition-all cursor-pointer
                            ${activeTab === tab.key ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-purple-700 border-purple-200 hover:border-purple-400'}`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Overview Tab ─────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
                <div>
                    {/* Motivation Card */}
                    <div className="bg-gradient-to-r from-purple-800 to-blue-700 text-white rounded-2xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <span className="text-4xl">🌟</span>
                            <div>
                                <h3 className="text-xl font-bold mb-1">Motivasyon Mesajınız</h3>
                                <p className="text-purple-100 text-lg">{motivation.msg}</p>
                                {motivation.badge && (
                                    <span className="mt-3 inline-block bg-white/20 border border-white/30 px-4 py-2 rounded-xl text-lg font-bold">
                                        {motivation.badge}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Bugünkü Egzersiz', value: todayExercises, icon: '🏃', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
                            { label: 'Toplam Egzersiz', value: totalExercises, icon: '💪', color: 'bg-blue-50 border-blue-200 text-blue-900' },
                            { label: 'Aktif Gün', value: uniqueDays, icon: '📅', color: 'bg-orange-50 border-orange-200 text-orange-900' },
                            { label: 'Değerlendirme', value: totalAssessments, icon: '📊', color: 'bg-purple-50 border-purple-200 text-purple-900' },
                        ].map((stat, i) => (
                            <div key={i} className={`rounded-2xl border-2 p-4 text-center ${stat.color}`}>
                                <div className="text-3xl mb-1">{stat.icon}</div>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <div className="text-sm font-medium mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Exercise Chart */}
                    <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 mb-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">📅 Egzersiz Aktivitesi</h3>
                        <MiniBarChart data={exerciseByDate} label="Egzersiz sayısı" />
                    </div>

                    {/* Latest Assessment Results */}
                    {Object.keys(latestByType).length > 0 && (
                        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 mb-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">🔬 Son Değerlendirmeler</h3>
                            <div className="space-y-3">
                                {Object.entries(latestByType).map(([type, r]) => {
                                    const bgMap = { low: 'bg-green-50 border-green-300', moderate: 'bg-yellow-50 border-yellow-300', high: 'bg-red-50 border-red-300' };
                                    const iconMap = { low: '✅', moderate: '⚠️', high: '🚨' };
                                    return (
                                        <div key={type} className={`rounded-xl border-2 p-4 ${bgMap[r.interpretation]}`}>
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <span className="font-bold text-lg text-slate-800">{type}</span>
                                                    <span className="text-slate-500 text-sm ml-2">{r.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xl text-slate-700">{r.score}/{r.maxScore}</span>
                                                    <span className="text-lg">{iconMap[r.interpretation]}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-600 mt-1">{r.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Goals Section */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-6">
                        <h3 className="text-xl font-bold mb-4">🎯 SMART Hedefleriniz</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                            {[
                                { icon: '💪', title: 'Bu Hafta', goal: 'En az 3 gün direnç egzersizi yap', done: uniqueDays >= 3 },
                                { icon: '🚶', title: 'Günlük', goal: '30 dakika yürüyüş yap', done: todayExercises > 0 },
                                { icon: '📊', title: 'Aylık', goal: 'SARC-F ve TUG testini tamamla', done: totalAssessments >= 2 },
                                { icon: '🥗', title: 'Beslenme', goal: 'Günde 3 öğün yeterli protein al', done: false },
                            ].map((goal, i) => (
                                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${goal.done ? 'bg-green-900/50 border border-green-500' : 'bg-white/10 border border-white/20'}`}>
                                    <span className="text-2xl">{goal.done ? '✅' : goal.icon}</span>
                                    <div>
                                        <div className="font-bold text-base">{goal.title}</div>
                                        <div className="text-slate-300 text-sm">{goal.goal}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Assessments Tab ───────────────────────────────────────────── */}
            {activeTab === 'assessments' && (
                <div>
                    {assessments.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-2">Henüz değerlendirme yok</h3>
                            <p className="text-slate-500 text-lg mb-6">İlk değerlendirmenizi yapmak için değerlendirme bölümünü ziyaret edin.</p>
                            <a href="/degerlendirme" className="bg-blue-800 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-900 transition-all no-underline inline-block">
                                📊 Değerlendirmeye Git
                            </a>
                        </div>
                    ) : (
                        <AssessmentTable assessments={assessments} />
                    )}
                </div>
            )}

            {/* ── Exercise Log Tab ──────────────────────────────────────────── */}
            {activeTab === 'exercises' && (
                <div>
                    {exerciseLogs.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">💪</div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-2">Henüz egzersiz kaydı yok</h3>
                            <p className="text-slate-500 text-lg mb-6">İlk egzersizinizi yapmak için egzersiz bölümünü ziyaret edin.</p>
                            <a href="/egzersiz" className="bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-emerald-800 transition-all no-underline inline-block">
                                💪 Egzersize Git
                            </a>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 mb-5">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">📅 Günlük Egzersiz Aktivitesi</h3>
                                <MiniBarChart data={exerciseByDate} label="Egzersiz sayısı" />
                            </div>
                            <div className="space-y-3">
                                {Object.entries(groupByDate(exerciseLogs))
                                    .sort(([a], [b]) => b.localeCompare(a))
                                    .slice(0, 30)
                                    .map(([date, logs]) => (
                                        <div key={date} className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                                            <div className="bg-emerald-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                                                <h4 className="font-bold text-lg text-emerald-900">{date}</h4>
                                                <span className="bg-emerald-200 text-emerald-900 text-sm font-bold px-3 py-1 rounded-full">
                                                    {logs.length} egzersiz
                                                </span>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {logs.map((log, i) => (
                                                        <span key={i} className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-base font-medium">
                                                            ✅ {log.exerciseName}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
