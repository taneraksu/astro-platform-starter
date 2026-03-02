// OrthoSolve - Interactive SVG Foot Diagram (dorsal + plantar view)
// Clickable zones for wound location marking
import React, { useState } from 'react';
import type { WoundLocation } from '../types';

interface FootZone {
  id: string;
  label: string;
  side: 'dorsal' | 'plantar';
  // SVG path or simple rect
  type: 'path' | 'ellipse' | 'rect';
  props: Record<string, string | number>;
}

// Foot zones for dorsal and plantar views
const DORSAL_ZONES: FootZone[] = [
  { id: 'd_hallux', label: 'Baş Parmak (Dorsal)', side: 'dorsal', type: 'ellipse', props: { cx: 100, cy: 38, rx: 16, ry: 20 } },
  { id: 'd_toe2', label: '2. Parmak (Dorsal)', side: 'dorsal', type: 'ellipse', props: { cx: 130, cy: 42, rx: 12, ry: 16 } },
  { id: 'd_toe3', label: '3. Parmak (Dorsal)', side: 'dorsal', type: 'ellipse', props: { cx: 152, cy: 48, rx: 11, ry: 15 } },
  { id: 'd_toe4', label: '4. Parmak (Dorsal)', side: 'dorsal', type: 'ellipse', props: { cx: 172, cy: 54, rx: 10, ry: 14 } },
  { id: 'd_toe5', label: '5. Parmak (Dorsal)', side: 'dorsal', type: 'ellipse', props: { cx: 190, cy: 62, rx: 9, ry: 13 } },
  { id: 'd_meta1', label: '1. Metatarsal (Dorsal)', side: 'dorsal', type: 'ellipse', props: { cx: 100, cy: 88, rx: 18, ry: 24 } },
  { id: 'd_meta25', label: '2-5. Metatarsal (Dorsal)', side: 'dorsal', type: 'ellipse', props: { cx: 160, cy: 96, rx: 38, ry: 22 } },
  { id: 'd_midfoot', label: 'Orta Ayak (Dorsal)', side: 'dorsal', type: 'ellipse', props: { cx: 140, cy: 148, rx: 52, ry: 30 } },
  { id: 'd_hindfoot', label: 'Arka Ayak / Topuk (Dorsal)', side: 'dorsal', type: 'ellipse', props: { cx: 140, cy: 210, rx: 52, ry: 36 } },
];

const PLANTAR_ZONES: FootZone[] = [
  { id: 'p_hallux', label: 'Baş Parmak (Plantar)', side: 'plantar', type: 'ellipse', props: { cx: 100, cy: 38, rx: 16, ry: 20 } },
  { id: 'p_toe2', label: '2. Parmak (Plantar)', side: 'plantar', type: 'ellipse', props: { cx: 130, cy: 42, rx: 12, ry: 16 } },
  { id: 'p_toe3', label: '3. Parmak (Plantar)', side: 'plantar', type: 'ellipse', props: { cx: 152, cy: 48, rx: 11, ry: 15 } },
  { id: 'p_toe4', label: '4. Parmak (Plantar)', side: 'plantar', type: 'ellipse', props: { cx: 172, cy: 54, rx: 10, ry: 14 } },
  { id: 'p_toe5', label: '5. Parmak (Plantar)', side: 'plantar', type: 'ellipse', props: { cx: 190, cy: 62, rx: 9, ry: 13 } },
  { id: 'p_metatarsal1', label: '1. Metatarsal Başı (Plantar)', side: 'plantar', type: 'ellipse', props: { cx: 100, cy: 88, rx: 18, ry: 24 } },
  { id: 'p_meta25', label: '2-5. Metatarsal Başları (Plantar)', side: 'plantar', type: 'ellipse', props: { cx: 160, cy: 96, rx: 38, ry: 22 } },
  { id: 'p_arch', label: 'Plantar Ark', side: 'plantar', type: 'ellipse', props: { cx: 130, cy: 150, rx: 40, ry: 26 } },
  { id: 'p_heel', label: 'Topuk (Plantar)', side: 'plantar', type: 'ellipse', props: { cx: 140, cy: 215, rx: 50, ry: 32 } },
];

// Foot outline SVG path (simplified anatomical shape)
const FOOT_OUTLINE = "M100,18 C88,18 75,22 70,35 L68,55 C65,60 60,70 60,80 C60,95 65,105 70,115 C72,120 74,128 74,136 C74,155 76,172 78,188 C78,202 82,220 88,234 C94,246 100,252 110,253 C120,254 130,250 140,248 C150,246 160,244 170,238 C180,232 188,222 192,210 C196,198 196,184 196,170 C196,156 194,140 190,126 C188,120 186,114 186,105 C186,95 188,84 190,74 C192,65 194,55 190,45 C186,36 178,28 168,24 C158,20 146,18 135,18 C126,18 112,18 100,18Z";

interface FootDiagramProps {
  selected: WoundLocation[];
  onToggle: (loc: WoundLocation) => void;
  readonly?: boolean;
}

export default function FootDiagram({ selected, onToggle, readonly = false }: FootDiagramProps) {
  const [view, setView] = useState<'dorsal' | 'plantar'>('plantar');

  const zones = view === 'dorsal' ? DORSAL_ZONES : PLANTAR_ZONES;

  const isSelected = (zone: FootZone) =>
    selected.some(s => s.zone === zone.id && s.side === zone.side);

  const handleZoneClick = (zone: FootZone) => {
    if (readonly) return;
    onToggle({ side: zone.side, zone: zone.id, label: zone.label });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* View toggle */}
      {!readonly && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView('plantar')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === 'plantar'
                ? 'bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Plantar (Alt)
          </button>
          <button
            type="button"
            onClick={() => setView('dorsal')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === 'dorsal'
                ? 'bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dorsal (Üst)
          </button>
        </div>
      )}

      <div className="flex gap-8 flex-wrap justify-center">
        {/* SVG Foot */}
        <div>
          <p className="text-center text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            {view === 'plantar' ? '⬇ Plantar Görünüm' : '⬆ Dorsal Görünüm'}
          </p>
          <svg
            width="260"
            height="280"
            viewBox="0 0 260 280"
            className="border-2 border-gray-200 rounded-2xl bg-white"
          >
            {/* Foot outline */}
            <path
              d={FOOT_OUTLINE}
              fill="#fef3e2"
              stroke="#d97706"
              strokeWidth="2"
            />

            {/* Clickable zones */}
            {zones.map(zone => {
              const sel = isSelected(zone);
              const commonProps = {
                key: zone.id,
                onClick: () => handleZoneClick(zone),
                style: { cursor: readonly ? 'default' : 'pointer' },
                fill: sel ? '#dc2626' : 'rgba(13,148,136,0.2)',
                stroke: sel ? '#dc2626' : '#0d9488',
                strokeWidth: sel ? 2.5 : 1.5,
                opacity: 0.85,
              };
              if (zone.type === 'ellipse') {
                return (
                  <ellipse
                    {...commonProps}
                    cx={zone.props.cx as number}
                    cy={zone.props.cy as number}
                    rx={zone.props.rx as number}
                    ry={zone.props.ry as number}
                  >
                    <title>{zone.label}</title>
                  </ellipse>
                );
              }
              return null;
            })}

            {/* Labels for selected zones */}
            {zones.filter(z => isSelected(z)).map(zone => (
              <text
                key={`label_${zone.id}`}
                x={zone.props.cx as number}
                y={(zone.props.cy as number) + 4}
                textAnchor="middle"
                fontSize="9"
                fill="white"
                fontWeight="bold"
              >
                ✓
              </text>
            ))}

            {/* Orientation labels */}
            <text x="10" y="274" fontSize="9" fill="#9ca3af">
              {view === 'plantar' ? 'Topuk ↓' : 'Topuk ↓'}
            </text>
            <text x="10" y="16" fontSize="9" fill="#9ca3af">
              {view === 'plantar' ? '↑ Parmaklar' : '↑ Parmaklar'}
            </text>
          </svg>
        </div>

        {/* Selected locations list */}
        <div className="flex flex-col gap-2 min-w-40">
          <p className="text-sm font-semibold text-gray-700">
            {readonly ? 'Lokalizasyon' : 'Seçilen Bölgeler'}
          </p>
          {selected.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              {readonly ? 'Belirtilmemiş' : 'Bölge seçmek için haritaya tıklayın'}
            </p>
          ) : (
            selected.map((loc, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-sm"
              >
                <span className="text-red-600">📍</span>
                <span className="text-gray-700 flex-1">{loc.label}</span>
                {!readonly && (
                  <button
                    type="button"
                    onClick={() => onToggle(loc)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
