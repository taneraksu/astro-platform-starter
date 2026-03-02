import { useState } from 'react';

// Anatomical regions for the plantar (sole) view
// Coordinates for viewBox="0 0 130 255"
// Layout: toes at top (y≈0-45), MTH (y≈45-75), midfoot (y≈75-190), heel (y≈190-255)
// Medial (big toe) side = LEFT, Lateral (little toe) = RIGHT

export interface FootRegion {
    id: string;
    label: string;       // Full anatomical label
    short: string;       // Short label for SVG text
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    view: 'plantar' | 'dorsal' | 'both';
}

const FOOT_REGIONS: FootRegion[] = [
    // ---- TOES ----
    { id: 'hallux',  label: '1. Parmak (Hallux)', short: 'P1', cx: 28,  cy: 22, rx: 15, ry: 20, view: 'both' },
    { id: 'toe2',    label: '2. Parmak',           short: 'P2', cx: 52,  cy: 16, rx: 10, ry: 16, view: 'both' },
    { id: 'toe3',    label: '3. Parmak',           short: 'P3', cx: 68,  cy: 17, rx: 9,  ry: 14, view: 'both' },
    { id: 'toe4',    label: '4. Parmak',           short: 'P4', cx: 83,  cy: 20, rx: 8,  ry: 13, view: 'both' },
    { id: 'toe5',    label: '5. Parmak (Küçük)',   short: 'P5', cx: 97,  cy: 26, rx: 7,  ry: 11, view: 'both' },

    // ---- METATARSAL HEADS (plantar only) ----
    { id: 'mth1',    label: '1. Metatarsal Baş',  short: 'MTH1',   cx: 28,  cy: 54, rx: 18, ry: 12, view: 'plantar' },
    { id: 'mth23',   label: '2-3. Metatarsal Baş',short: 'MTH2-3', cx: 62,  cy: 51, rx: 16, ry: 12, view: 'plantar' },
    { id: 'mth45',   label: '4-5. Metatarsal Baş',short: 'MTH4-5', cx: 95,  cy: 54, rx: 14, ry: 11, view: 'plantar' },

    // ---- MIDFOOT ----
    { id: 'arch',        label: 'Medial Ark',             short: 'Ark',      cx: 22,  cy: 125, rx: 17, ry: 48, view: 'plantar' },
    { id: 'lat_midfoot', label: 'Lateral Orta Ayak',      short: 'Lat-OA',   cx: 107, cy: 115, rx: 14, ry: 40, view: 'plantar' },
    { id: 'dorsum',      label: 'Ayak Sırtı (Dorsum)',    short: 'Dorsum',   cx: 65,  cy: 120, rx: 48, ry: 70, view: 'dorsal' },

    // ---- HEEL ----
    { id: 'heel_med',    label: 'Topuk (Medial)',          short: 'Topuk-M',  cx: 48,  cy: 224, rx: 33, ry: 26, view: 'plantar' },
    { id: 'heel_lat',    label: 'Topuk (Lateral)',         short: 'Topuk-L',  cx: 88,  cy: 224, rx: 30, ry: 26, view: 'plantar' },
    { id: 'heel_d',      label: 'Topuk / Ayak Bileği',    short: 'Topuk',    cx: 65,  cy: 218, rx: 45, ry: 30, view: 'dorsal' },
];

// SVG foot silhouette paths
const PLANTAR_PATH = `
M 18,215
C 10,188 10,158 14,128
C 13,100 13,78  17,60
C 17,44  19,30  24,12
C 27,2   38,-2  46,6
C 52,12  52,30  50,40
C 54,14  63,8   68,16
C 71,24  70,36  68,42
C 72,16  80,10  84,18
C 87,26  86,38  84,44
C 87,20  95,14  99,23
C 102,31 101,42 99,48
C 102,28 109,22 112,33
C 115,44 113,58 110,64
C 114,80 117,105 116,140
C 116,172 113,202 108,228
C 98,250  35,250  22,228
Z
`.trim();

const DORSAL_PATH = `
M 18,215
C 10,188 10,158 14,128
C 13,100 13,78  17,60
C 17,44  19,30  24,12
C 27,2   38,-2  46,6
C 52,12  52,30  50,40
C 54,14  63,8   68,16
C 71,24  70,36  68,42
C 72,16  80,10  84,18
C 87,26  86,38  84,44
C 87,20  95,14  99,23
C 102,31 101,42 99,48
C 102,28 109,22 112,33
C 115,44 113,58 110,64
C 114,80 117,105 116,140
C 116,172 113,202 108,228
C 98,250  35,250  22,228
Z
`.trim();

interface Props {
    footSide: 'left' | 'right' | 'both';
    selectedRegions: string[];
    onChange: (regions: string[]) => void;
    compact?: boolean; // smaller display mode for read-only
    readOnly?: boolean;
}

export default function FootMap({ footSide, selectedRegions, onChange, compact = false, readOnly = false }: Props) {
    const [view, setView] = useState<'plantar' | 'dorsal'>('plantar');
    const [activeFoot, setActiveFoot] = useState<'left' | 'right'>(footSide === 'left' ? 'left' : 'right');

    const regions = FOOT_REGIONS.filter(r => r.view === view || r.view === 'both');

    function toggle(id: string) {
        if (readOnly) return;
        if (selectedRegions.includes(id)) {
            onChange(selectedRegions.filter(r => r !== id));
        } else {
            onChange([...selectedRegions, id]);
        }
    }

    const TEAL = '#0f766e';
    const svgW = compact ? 100 : 130;
    const svgH = compact ? 200 : 255;
    const scale = compact ? 100 / 130 : 1;

    const svgContent = (mirrorX: boolean) => (
        <svg
            viewBox="0 0 130 255"
            width={svgW}
            height={svgH}
            style={{
                transform: mirrorX ? 'scaleX(-1)' : undefined,
                display: 'block',
                cursor: readOnly ? 'default' : 'pointer',
            }}
        >
            {/* Foot silhouette */}
            <path
                d={view === 'plantar' ? PLANTAR_PATH : DORSAL_PATH}
                fill="#f3f4f6"
                stroke="#d1d5db"
                strokeWidth="1.5"
            />

            {/* Anatomical regions */}
            {regions.map(r => {
                const selected = selectedRegions.includes(r.id);
                return (
                    <g key={r.id} onClick={() => toggle(r.id)} style={{ cursor: readOnly ? 'default' : 'pointer' }}>
                        <ellipse
                            cx={r.cx}
                            cy={r.cy}
                            rx={r.rx}
                            ry={r.ry}
                            fill={selected ? TEAL : 'rgba(255,255,255,0.7)'}
                            stroke={selected ? TEAL : '#9ca3af'}
                            strokeWidth={selected ? 2 : 1}
                            opacity={readOnly && !selected ? 0.3 : 1}
                        />
                        {(!compact || selected) && (
                            <text
                                x={r.cx}
                                y={r.cy + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={compact ? 7 : 8}
                                fontWeight={selected ? '700' : '500'}
                                fill={selected ? 'white' : '#374151'}
                                style={{ userSelect: 'none', pointerEvents: 'none' }}
                            >
                                {r.short}
                            </text>
                        )}
                        {/* Marker dot for selected regions in compact mode */}
                        {compact && selected && (
                            <circle cx={r.cx} cy={r.cy} r={5} fill="white" opacity={0.4} style={{ pointerEvents: 'none' }} />
                        )}
                    </g>
                );
            })}
        </svg>
    );

    const containerStyle: React.CSSProperties = {
        background: 'white',
        borderRadius: '1rem',
        padding: compact ? '0.75rem' : '1.25rem',
        border: '2px solid #e2e8f0',
    };

    return (
        <div style={containerStyle}>
            {/* View toggle */}
            {!readOnly && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
                    {(['plantar', 'dorsal'] as const).map(v => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => setView(v)}
                            style={{
                                padding: '0.35rem 0.875rem',
                                border: `2px solid ${view === v ? TEAL : '#e2e8f0'}`,
                                background: view === v ? TEAL : 'white',
                                color: view === v ? 'white' : '#64748b',
                                borderRadius: '999px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                            }}
                        >
                            {v === 'plantar' ? '👣 Taban (Plantar)' : '👟 Sırt (Dorsal)'}
                        </button>
                    ))}
                    {footSide === 'both' && (
                        <>
                            {(['left', 'right'] as const).map(f => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setActiveFoot(f)}
                                    style={{
                                        padding: '0.35rem 0.875rem',
                                        border: `2px solid ${activeFoot === f ? '#1d4ed8' : '#e2e8f0'}`,
                                        background: activeFoot === f ? '#1d4ed8' : 'white',
                                        color: activeFoot === f ? 'white' : '#64748b',
                                        borderRadius: '999px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {f === 'left' ? 'Sol Ayak' : 'Sağ Ayak'}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* View label */}
            {readOnly && selectedRegions.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Bölge işaretlenmemiş</p>
            )}

            {/* SVG foot diagrams */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {footSide === 'both' ? (
                    readOnly ? (
                        <>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>Sol Ayak</p>
                                {svgContent(true)}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>Sağ Ayak</p>
                                {svgContent(false)}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>
                                {activeFoot === 'left' ? 'Sol Ayak' : 'Sağ Ayak'} — {view === 'plantar' ? 'Taban Görünümü' : 'Sırt Görünümü'}
                            </p>
                            {svgContent(activeFoot === 'left')}
                        </div>
                    )
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        {!readOnly && (
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>
                                {footSide === 'left' ? 'Sol Ayak' : 'Sağ Ayak'} — {view === 'plantar' ? 'Taban (Plantar)' : 'Sırt (Dorsal)'}
                            </p>
                        )}
                        {svgContent(footSide === 'left')}
                    </div>
                )}

                {/* Selected region list */}
                {!compact && (
                    <div style={{ flex: 1, minWidth: '140px' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {readOnly ? 'İşaretlenen Bölgeler' : 'Seçilen Bölgeler'}
                        </p>
                        {selectedRegions.length === 0 ? (
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                {readOnly ? 'Kayıt yok' : 'Yara yerini işaretlemek için SVG üzerine tıklayın'}
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                {selectedRegions.map(id => {
                                    const region = FOOT_REGIONS.find(r => r.id === id);
                                    return region ? (
                                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: TEAL, flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>{region.label}</span>
                                            {!readOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggle(id)}
                                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', padding: '0 0.25rem' }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        )}

                        {!readOnly && (
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                                💡 Birden fazla bölge seçilebilir
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
