import type { Measurement } from '../../../types/patient';

interface Props {
    measurements: Measurement[];
    targetMm: number;
}

export default function ProgressChart({ measurements, targetMm }: Props) {
    if (measurements.length === 0) {
        return (
            <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
                <div className="text-4xl mb-3">📈</div>
                <p className="text-gray-400">Grafik için ölçüm verisi bulunamadı</p>
            </div>
        );
    }

    const width = 600;
    const height = 280;
    const paddingLeft = 55;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 50;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxMm = Math.max(targetMm * 1.05, ...measurements.map((m) => m.lengtheningMm));
    const minMm = 0;
    const range = maxMm - minMm;

    const sorted = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDate = new Date(sorted[0].date).getTime();
    const lastDate = new Date(sorted[sorted.length - 1].date).getTime();
    const timeRange = Math.max(lastDate - firstDate, 1);

    const toX = (date: string) => paddingLeft + ((new Date(date).getTime() - firstDate) / timeRange) * chartWidth;
    const toY = (mm: number) => paddingTop + chartHeight - ((mm - minMm) / range) * chartHeight;

    const targetY = toY(targetMm);
    const points = sorted.map((m) => `${toX(m.date)},${toY(m.lengtheningMm)}`).join(' ');

    // Area fill path
    const areaPath = sorted.length > 1
        ? `M ${toX(sorted[0].date)},${paddingTop + chartHeight} L ${sorted.map((m) => `${toX(m.date)},${toY(m.lengtheningMm)}`).join(' L ')} L ${toX(sorted[sorted.length - 1].date)},${paddingTop + chartHeight} Z`
        : '';

    // Y-axis ticks
    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => (range / yTicks) * i + minMm);

    // X-axis labels
    const xLabels: { x: number; label: string }[] = [];
    if (sorted.length >= 2) {
        const step = Math.max(1, Math.floor(sorted.length / 5));
        for (let i = 0; i < sorted.length; i += step) {
            const m = sorted[i];
            const date = new Date(m.date);
            xLabels.push({
                x: toX(m.date),
                label: `${date.getDate()}/${date.getMonth() + 1}`,
            });
        }
    }

    // Pain level bars
    const latest = sorted[sorted.length - 1];

    return (
        <div className="space-y-4">
            {/* Main progress chart */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h3 className="text-base font-semibold text-white mb-4">Uzama Progresyonu (mm)</h3>
                <div className="overflow-x-auto">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: '300px', maxHeight: '280px' }}>
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f67280" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#f67280" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        {yTickValues.map((val) => (
                            <g key={val}>
                                <line
                                    x1={paddingLeft}
                                    y1={toY(val)}
                                    x2={width - paddingRight}
                                    y2={toY(val)}
                                    stroke="#374151"
                                    strokeWidth="1"
                                    strokeDasharray="4,4"
                                />
                                <text x={paddingLeft - 8} y={toY(val) + 4} textAnchor="end" fill="#9ca3af" fontSize="11">
                                    {Math.round(val)}
                                </text>
                            </g>
                        ))}

                        {/* Target line */}
                        <line
                            x1={paddingLeft}
                            y1={targetY}
                            x2={width - paddingRight}
                            y2={targetY}
                            stroke="#22c55e"
                            strokeWidth="1.5"
                            strokeDasharray="8,4"
                        />
                        <text x={width - paddingRight + 2} y={targetY + 4} fill="#22c55e" fontSize="10">
                            Hedef
                        </text>

                        {/* Area fill */}
                        {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}

                        {/* Line */}
                        {sorted.length > 1 && (
                            <polyline points={points} fill="none" stroke="#f67280" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                        )}

                        {/* Data points */}
                        {sorted.map((m) => (
                            <g key={m.id}>
                                <circle cx={toX(m.date)} cy={toY(m.lengtheningMm)} r="5" fill="#f67280" stroke="#1f2937" strokeWidth="2" />
                            </g>
                        ))}

                        {/* X-axis labels */}
                        {xLabels.map(({ x, label }) => (
                            <text key={label} x={x} y={height - 8} textAnchor="middle" fill="#9ca3af" fontSize="11">
                                {label}
                            </text>
                        ))}

                        {/* Axes */}
                        <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={paddingTop + chartHeight} stroke="#4b5563" strokeWidth="1" />
                        <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="#4b5563" strokeWidth="1" />
                    </svg>
                </div>
            </div>

            {/* Pain & Mobility chart */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <h3 className="text-base font-semibold text-white mb-4">Ağrı Takibi (Son 10 Ölçüm)</h3>
                    <div className="space-y-2">
                        {sorted.slice(-10).map((m) => (
                            <div key={m.id} className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 w-14 shrink-0">
                                    {new Date(m.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                                </span>
                                <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${m.painLevel * 10}%`,
                                            backgroundColor: m.painLevel >= 7 ? '#ef4444' : m.painLevel >= 4 ? '#f97316' : '#22c55e',
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-white w-6 text-right">{m.painLevel}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <h3 className="text-base font-semibold text-white mb-4">Hareket Puanı (Son 10 Ölçüm)</h3>
                    <div className="space-y-2">
                        {sorted.slice(-10).map((m) => (
                            <div key={m.id} className="flex items-center gap-3">
                                <span className="text-xs text-gray-400 w-14 shrink-0">
                                    {new Date(m.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                                </span>
                                <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-blue-500 transition-all"
                                        style={{ width: `${m.mobilityScore * 10}%` }}
                                    />
                                </div>
                                <span className="text-xs text-white w-6 text-right">{m.mobilityScore}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary table */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h3 className="text-base font-semibold text-white mb-4">Son Ölçümler</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 text-left">
                                <th className="pb-2 font-medium">Tarih</th>
                                <th className="pb-2 font-medium">Boy (cm)</th>
                                <th className="pb-2 font-medium">Uzama (mm)</th>
                                <th className="pb-2 font-medium">Ağrı</th>
                                <th className="pb-2 font-medium">Hareket</th>
                                <th className="pb-2 font-medium">Kalus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {sorted.slice(-8).reverse().map((m) => (
                                <tr key={m.id} className="text-gray-300">
                                    <td className="py-2">{new Date(m.date).toLocaleDateString('tr-TR')}</td>
                                    <td className="py-2">{m.heightCm}</td>
                                    <td className="py-2">{m.lengtheningMm.toFixed(1)}</td>
                                    <td className="py-2">
                                        <span className={`px-1.5 py-0.5 rounded text-xs ${m.painLevel >= 7 ? 'bg-red-900 text-red-200' : m.painLevel >= 4 ? 'bg-orange-900 text-orange-200' : 'bg-green-900 text-green-200'}`}>
                                            {m.painLevel}/10
                                        </span>
                                    </td>
                                    <td className="py-2">{m.mobilityScore}/10</td>
                                    <td className="py-2 text-gray-400">{m.callus || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
