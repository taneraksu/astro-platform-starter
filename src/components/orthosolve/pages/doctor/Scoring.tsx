// OrthoSolve - All Scoring Tools for a Patient
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DoctorNavbar from '../../components/DoctorNavbar';
import FootDiagram from '../../components/FootDiagram';
import {
  patientStorage, wagnerStorage, pedisStorage, utStorage,
  sinbadStorage, abiStorage, vasStorage, neuropathyStorage, woundStorage
} from '../../storage';
import type {
  Patient, WagnerGrade, WoundLocation, WoundRecord
} from '../../types';

function formatDate(iso: string) {
  try { const d = new Date(iso); return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; }
  catch { return iso; }
}

// ===== WAGNER SCORING TOOL =====
function WagnerTool({ patientId }: { patientId: string }) {
  const [grade, setGrade] = useState<WagnerGrade>(0);
  const [notlar, setNotlar] = useState('');
  const [saved, setSaved] = useState(false);
  const history = wagnerStorage.getByPatient(patientId).slice(0, 5);

  const grades = [
    { g: 0, label: 'Grade 0', desc: 'Yara yok, risk faktörü var', color: 'bg-green-50 border-green-400' },
    { g: 1, label: 'Grade 1', desc: 'Yüzeyel ülser', color: 'bg-yellow-50 border-yellow-400' },
    { g: 2, label: 'Grade 2', desc: 'Derin ülser (tendon/kapsül)', color: 'bg-orange-50 border-orange-400' },
    { g: 3, label: 'Grade 3', desc: 'Derin ülser + apse/osteomyelit', color: 'bg-red-50 border-red-400' },
    { g: 4, label: 'Grade 4', desc: 'Ön/Arka ayak gangreni', color: 'bg-red-100 border-red-600' },
    { g: 5, label: 'Grade 5', desc: 'Tüm ayak gangreni', color: 'bg-purple-100 border-purple-600' },
  ];

  const handleSave = () => {
    wagnerStorage.save({ hastaId: patientId, tarih: new Date().toISOString(), grade, notlar });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">📊 Wagner Sınıflaması</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {grades.map(({ g, label, desc, color }) => (
          <label key={g} className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors ${grade === g ? color : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="radio" name="wagner" checked={grade === g} onChange={() => setGrade(g as WagnerGrade)} className="mt-0.5" />
            <div>
              <span className="font-semibold text-sm">{label}</span>
              <p className="text-xs text-gray-600">{desc}</p>
            </div>
          </label>
        ))}
      </div>
      <textarea value={notlar} onChange={e => setNotlar(e.target.value)} placeholder="Ek notlar..." rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-3" />
      <button onClick={handleSave} className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${saved ? 'bg-green-600' : 'bg-blue-700 hover:bg-blue-800'}`}>
        {saved ? '✓ Kaydedildi' : 'Wagner Kaydet'}
      </button>
      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">Son Kayıtlar</p>
          <div className="flex gap-2 flex-wrap">
            {history.map(h => (
              <span key={h.id} className="text-xs bg-gray-100 px-2 py-1 rounded-lg">
                {formatDate(h.tarih)}: <strong>Grade {h.grade}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== PEDIS SCORING TOOL =====
function PEDISTool({ patientId }: { patientId: string }) {
  const [perfusion, setPerfusion] = useState(1);
  const [extent, setExtent] = useState(1);
  const [depth, setDepth] = useState(1);
  const [infection, setInfection] = useState(1);
  const [sensation, setSensation] = useState(1);
  const [saved, setSaved] = useState(false);
  const toplam = perfusion + depth + infection + sensation;

  const handleSave = () => {
    pedisStorage.save({ hastaId: patientId, tarih: new Date().toISOString(), perfusion, extent, depth, infection, sensation, toplam });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const riskLevel = toplam <= 4 ? { label: 'Düşük Risk', color: 'text-green-700 bg-green-50' }
    : toplam <= 8 ? { label: 'Orta Risk', color: 'text-yellow-700 bg-yellow-50' }
    : { label: 'Yüksek Risk', color: 'text-red-700 bg-red-50' };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">📊 PEDIS Skoru</h3>
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">P — Perfüzyon (1-4)</label>
          <div className="flex gap-2">
            {[1,2,3,4].map(v => (
              <button key={v} type="button" onClick={() => setPerfusion(v)} className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${perfusion===v?'bg-blue-700 text-white border-blue-700':'border-gray-200 text-gray-600 hover:border-blue-400'}`}>{v}</button>
            ))}
          </div>
          <div className="flex gap-2 text-xs text-gray-400 mt-0.5 justify-between">
            <span>Normal</span><span>PAH hafif</span><span>PAH kritik</span><span>İskemi</span>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">E — Boyut / Alan (cm²)</label>
          <input type="number" value={extent} onChange={e => setExtent(Number(e.target.value))} min={0} step={0.5} className="w-32 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          <span className="text-xs text-gray-400 ml-2">cm²</span>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">D — Derinlik (1-3)</label>
          <div className="flex gap-2">
            {[[1,'Yüzeyel'],[2,'Derin (kas/tendon)'],[3,'Kemik/eklem']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setDepth(Number(v))} className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-colors ${depth===v?'bg-blue-700 text-white border-blue-700':'border-gray-200 text-gray-600 hover:border-blue-400'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">I — Enfeksiyon (1-4)</label>
          <div className="flex gap-2">
            {[[1,'Yok'],[2,'Hafif'],[3,'Orta'],[4,'Ağır/SIRS']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setInfection(Number(v))} className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-colors ${infection===v?'bg-blue-700 text-white border-blue-700':'border-gray-200 text-gray-600 hover:border-blue-400'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">S — Duyu (1-2)</label>
          <div className="flex gap-2">
            {[[1,'Normal'],[2,'Azalmış/Yok']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setSensation(Number(v))} className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${sensation===v?'bg-blue-700 text-white border-blue-700':'border-gray-200 text-gray-600 hover:border-blue-400'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-3">
        <span className="text-sm font-semibold text-gray-700">Toplam PEDIS: <strong className="text-xl">{toplam}</strong>/13</span>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${riskLevel.color}`}>{riskLevel.label}</span>
      </div>
      <button onClick={handleSave} className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${saved?'bg-green-600':'bg-blue-700 hover:bg-blue-800'}`}>
        {saved ? '✓ Kaydedildi' : 'PEDIS Kaydet'}
      </button>
    </div>
  );
}

// ===== UT SCORING TOOL =====
function UTTool({ patientId }: { patientId: string }) {
  const [stage, setStage] = useState<'A'|'B'|'C'|'D'>('A');
  const [gradeUT, setGradeUT] = useState<0|1|2|3>(0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    utStorage.save({ hastaId: patientId, tarih: new Date().toISOString(), stage, grade: gradeUT });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const stages = { A: 'Enfeksiyon/İskemi yok', B: 'İskemi var', C: 'Enfeksiyon var', D: 'İskemi + Enfeksiyon' };
  const grades = { 0: 'Yara öncesi veya iyileşmiş', 1: 'Yüzeyel yara', 2: 'Tendon/kapsüle ulaşan', 3: 'Kemik/eklem tutulumu' };

  const riskMatrix: Record<string, string> = {
    'A0':'%0','A1':'%0-10','A2':'%0','A3':'%0',
    'B0':'%25','B1':'%33','B2':'%13','B3':'%14',
    'C0':'%0','C1':'%16','C2':'%50','C3':'%33',
    'D0':'%50','D1':'%50','D2':'%100','D3':'%100',
  };

  const currentRisk = riskMatrix[`${stage}${gradeUT}`] || '—';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">📊 University of Texas (UT) Sınıflaması</h3>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-200 p-2 bg-gray-50"></th>
              {(['A','B','C','D'] as const).map(s => (
                <th key={s} className={`border border-gray-200 p-2 cursor-pointer ${stage===s?'bg-blue-700 text-white':'bg-gray-50 hover:bg-blue-50'}`} onClick={() => setStage(s)}>
                  <div className="font-bold">Evre {s}</div>
                  <div className="font-normal text-xs leading-tight">{stages[s]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([0,1,2,3] as const).map(g => (
              <tr key={g}>
                <td className={`border border-gray-200 p-2 cursor-pointer font-semibold ${gradeUT===g?'bg-blue-700 text-white':'bg-gray-50 hover:bg-blue-50'}`} onClick={() => setGradeUT(g)}>
                  Grade {g}<div className="font-normal text-xs">{grades[g]}</div>
                </td>
                {(['A','B','C','D'] as const).map(s => (
                  <td
                    key={s}
                    className={`border border-gray-200 p-2 text-center cursor-pointer transition-colors ${stage===s&&gradeUT===g?'bg-blue-700 text-white font-bold':'hover:bg-blue-50'}`}
                    onClick={() => { setStage(s); setGradeUT(g); }}
                  >
                    {riskMatrix[`${s}${g}`]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-3">
        <span className="font-semibold text-sm">Seçili: <strong>Grade {gradeUT} — Evre {stage}</strong></span>
        <span className="text-orange-700 font-bold bg-orange-100 px-3 py-1 rounded-full text-sm">Amp. riski: {currentRisk}</span>
      </div>
      <button onClick={handleSave} className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${saved?'bg-green-600':'bg-blue-700 hover:bg-blue-800'}`}>
        {saved ? '✓ Kaydedildi' : 'UT Kaydet'}
      </button>
    </div>
  );
}

// ===== SINBAD SCORING =====
function SINBADTool({ patientId }: { patientId: string }) {
  const [scores, setScores] = useState({ site: 0, ischemia: 0, neuropathy: 0, bacterialInfection: 0, area: 0, depth: 0 });
  const [saved, setSaved] = useState(false);
  const toplam = Object.values(scores).reduce((a, b) => a + b, 0);
  const set = (k: keyof typeof scores, v: number) => setScores(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    sinbadStorage.save({ hastaId: patientId, tarih: new Date().toISOString(), ...scores, toplam });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const risk = toplam <= 2 ? 'Düşük' : toplam <= 4 ? 'Orta' : 'Yüksek';
  const riskColor = toplam <= 2 ? 'text-green-700 bg-green-50' : toplam <= 4 ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50';

  const items = [
    { key: 'site', label: 'S — Lokalizasyon', opts: [[0,'Ön ayak'],[1,'Orta/arka ayak']] },
    { key: 'ischemia', label: 'I — İskemi', opts: [[0,'Yok'],[1,'Var']] },
    { key: 'neuropathy', label: 'N — Nöropati', opts: [[0,'Yok'],[1,'Var']] },
    { key: 'bacterialInfection', label: 'B — Bakteriyel Enfeksiyon', opts: [[0,'Yok'],[1,'Lokal'],[2,'Sistemik']] },
    { key: 'area', label: 'A — Alan', opts: [[0,'<1 cm²'],[1,'≥1 cm²']] },
    { key: 'depth', label: 'D — Derinlik', opts: [[0,'Yüzeyel'],[1,'Derin']] },
  ] as const;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">📊 SINBAD Skoru</h3>
      <div className="space-y-3 mb-4">
        {items.map(({ key, label, opts }) => (
          <div key={key}>
            <label className="text-sm font-semibold text-gray-700 block mb-1">{label}</label>
            <div className="flex gap-2">
              {opts.map(([v, l]) => (
                <button key={v} type="button" onClick={() => set(key as keyof typeof scores, v as number)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border-2 transition-colors ${scores[key as keyof typeof scores]===v?'bg-blue-700 text-white border-blue-700':'border-gray-200 text-gray-600 hover:border-blue-400'}`}>{l}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-3">
        <span className="text-sm font-semibold text-gray-700">Toplam SINBAD: <strong className="text-xl">{toplam}</strong>/6</span>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${riskColor}`}>{risk} Risk</span>
      </div>
      <button onClick={handleSave} className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${saved?'bg-green-600':'bg-blue-700 hover:bg-blue-800'}`}>
        {saved ? '✓ Kaydedildi' : 'SINBAD Kaydet'}
      </button>
    </div>
  );
}

// ===== ABI CALCULATOR =====
function ABITool({ patientId }: { patientId: string }) {
  const [sagAyak, setSagAyak] = useState('');
  const [solAyak, setSolAyak] = useState('');
  const [sagKol, setSagKol] = useState('');
  const [solKol, setSolKol] = useState('');
  const [saved, setSaved] = useState(false);

  const sagABI = sagKol ? Math.round((Number(sagAyak) / Number(sagKol)) * 100) / 100 : null;
  const solABI = solKol ? Math.round((Number(solAyak) / Number(solKol)) * 100) / 100 : null;

  const abiColor = (abi: number | null) => {
    if (!abi) return 'text-gray-400';
    if (abi < 0.5) return 'text-red-600 font-bold';
    if (abi < 0.9) return 'text-yellow-600 font-bold';
    return 'text-green-600 font-bold';
  };

  const abiLabel = (abi: number | null) => {
    if (!abi) return '';
    if (abi < 0.5) return '⚠️ KRİTİK — Acil vasküler değerlendirme!';
    if (abi < 0.9) return '⚠ Periferik Arter Hastalığı';
    if (abi < 1.3) return '✓ Normal';
    return '⚠ Mediyal kalsifikasyon düşün';
  };

  const handleSave = () => {
    if (!sagABI || !solABI) return;
    abiStorage.save({
      hastaId: patientId, tarih: new Date().toISOString(),
      sagAyakSistolik: Number(sagAyak), solAyakSistolik: Number(solAyak),
      sagKolSistolik: Number(sagKol), solKolSistolik: Number(solKol),
      sagABI, solABI,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">📊 ABI (Ankle Brachial Index)</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Sağ Taraf</h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500">Ayak Bileği Sistolik (mmHg)</label>
              <input type="number" value={sagAyak} onChange={e => setSagAyak(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="120" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Kol Sistolik (mmHg)</label>
              <input type="number" value={sagKol} onChange={e => setSagKol(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="130" />
            </div>
            {sagABI !== null && (
              <div className={`text-lg ${abiColor(sagABI)}`}>
                ABI = {sagABI.toFixed(2)}
                <p className="text-xs mt-0.5">{abiLabel(sagABI)}</p>
              </div>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Sol Taraf</h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500">Ayak Bileği Sistolik (mmHg)</label>
              <input type="number" value={solAyak} onChange={e => setSolAyak(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="118" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Kol Sistolik (mmHg)</label>
              <input type="number" value={solKol} onChange={e => setSolKol(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="128" />
            </div>
            {solABI !== null && (
              <div className={`text-lg ${abiColor(solABI)}`}>
                ABI = {solABI.toFixed(2)}
                <p className="text-xs mt-0.5">{abiLabel(solABI)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={!sagABI || !solABI}
        className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${saved?'bg-green-600':!sagABI||!solABI?'bg-gray-300 cursor-not-allowed':'bg-blue-700 hover:bg-blue-800'}`}
      >
        {saved ? '✓ Kaydedildi' : 'ABI Kaydet'}
      </button>
    </div>
  );
}

// ===== VAS SCALE =====
function VASTool({ patientId }: { patientId: string }) {
  const [skor, setSkor] = useState(5);
  const [notlar, setNotlar] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    vasStorage.save({ hastaId: patientId, tarih: new Date().toISOString(), skor, notlar });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const vasColor = skor <= 3 ? 'text-green-600' : skor <= 6 ? 'text-yellow-600' : 'text-red-600';
  const vasLabel = skor === 0 ? 'Ağrı Yok' : skor <= 3 ? 'Hafif' : skor <= 6 ? 'Orta' : skor <= 8 ? 'Şiddetli' : 'Çok Şiddetli / Dayanılmaz';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">📊 VAS Ağrı Skalası</h3>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>0 — Ağrı Yok</span>
          <span>10 — En Şiddetli Ağrı</span>
        </div>
        <input
          type="range" min={0} max={10} value={skor}
          onChange={e => setSkor(Number(e.target.value))}
          className="w-full h-4 cursor-pointer accent-blue-700"
        />
        <div className="flex justify-between mt-1">
          {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
            <span key={n} className={`text-xs cursor-pointer ${skor===n?'font-bold text-blue-700':' text-gray-400'}`} onClick={() => setSkor(n)}>{n}</span>
          ))}
        </div>
      </div>
      <div className={`text-center text-3xl font-bold ${vasColor} mb-2`}>
        {skor} / 10
        <p className="text-base font-normal">{vasLabel}</p>
      </div>
      <div className="flex gap-3 mb-3">
        {['😊','🙂','😐','😟','😣','😭'].map((emoji, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSkor(Math.round(i * 2))}
            className={`flex-1 text-2xl py-1 rounded-xl border-2 transition-colors ${skor >= i*2 && skor < (i+1)*2 ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}
            title={['0','2','4','6','8','10'][i]}
          >
            {emoji}
          </button>
        ))}
      </div>
      <textarea value={notlar} onChange={e => setNotlar(e.target.value)} placeholder="Ağrı karakteri, lokalizasyon..." rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-3" />
      <button onClick={handleSave} className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${saved?'bg-green-600':'bg-blue-700 hover:bg-blue-800'}`}>
        {saved ? '✓ Kaydedildi' : 'VAS Kaydet'}
      </button>
    </div>
  );
}

// ===== NEUROPATHY SCREENING =====
function NeuropathyTool({ patientId }: { patientId: string }) {
  const [nss, setNss] = useState(0);
  const [nds, setNds] = useState(0);
  const [mono, setMono] = useState<boolean | null>(null);
  const [notlar, setNotlar] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (mono === null) return;
    neuropathyStorage.save({ hastaId: patientId, tarih: new Date().toISOString(), nss, nds, monofilament10g: mono, notlar });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">📊 Nöropati Taraması</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700">NSS — Nöropati Semptom Skoru (0-9)</label>
          <p className="text-xs text-gray-400 mb-1">Yanma, uyuşma, karıncalanma, ağrı semptomları</p>
          <input type="range" min={0} max={9} value={nss} onChange={e => setNss(Number(e.target.value))} className="w-full accent-blue-700" />
          <div className="flex justify-between text-xs text-gray-500"><span>0 — Semptom yok</span><span className="font-bold text-blue-700">{nss}</span><span>9 — Ağır</span></div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">NDS — Nöropati Defisit Skoru (0-10)</label>
          <p className="text-xs text-gray-400 mb-1">Muayene bulguları (refleks, his, duyu)</p>
          <input type="range" min={0} max={10} value={nds} onChange={e => setNds(Number(e.target.value))} className="w-full accent-blue-700" />
          <div className="flex justify-between text-xs text-gray-500"><span>0 — Normal</span><span className="font-bold text-blue-700">{nds}</span><span>10 — Ağır defisit</span></div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">10g Semmes-Weinstein Monofilament Testi</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setMono(true)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${mono===true?'bg-green-600 text-white border-green-600':'border-gray-200 text-gray-600 hover:border-green-500'}`}>
              ✓ Hissediyor (Normal)
            </button>
            <button type="button" onClick={() => setMono(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${mono===false?'bg-red-600 text-white border-red-600':'border-gray-200 text-gray-600 hover:border-red-500'}`}>
              ✕ Hissetmiyor (Anormal)
            </button>
          </div>
        </div>
        {(nss > 0 || nds > 0) && (
          <div className={`p-3 rounded-xl text-sm font-semibold ${nss + nds >= 10 ? 'bg-red-50 text-red-700' : nss + nds >= 5 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
            NSS: {nss} + NDS: {nds} = {nss + nds} —
            {nss + nds >= 10 ? ' Ağır Nöropati' : nss + nds >= 5 ? ' Orta Nöropati' : ' Hafif / Yok'}
            {mono === false && ' + Monofilament Anormal ⚠️'}
          </div>
        )}
        <textarea value={notlar} onChange={e => setNotlar(e.target.value)} placeholder="Muayene notları..." rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <button
          onClick={handleSave}
          disabled={mono === null}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${saved?'bg-green-600':mono===null?'bg-gray-300 cursor-not-allowed':'bg-blue-700 hover:bg-blue-800'}`}
        >
          {saved ? '✓ Kaydedildi' : 'Nöropati Kaydet'}
        </button>
      </div>
    </div>
  );
}

// ===== WOUND RECORD FORM =====
function WoundRecordTool({ patientId }: { patientId: string }) {
  const [locs, setLocs] = useState<WoundLocation[]>([]);
  const [form, setForm] = useState({
    uzunluk: '', genislik: '', derinlik: '',
    granulasyon: '0', fibrin: '0', nekroz: '0',
    yaraKenari: 'duzgun' as WoundRecord['yaraKenari'],
    kizariklik: false, isiArtisi: false, odem: false,
    sekresyonTipi: 'yok' as WoundRecord['sekresyonTipi'],
    koku: 'yok' as WoundRecord['koku'],
    pansumanTipi: '', tedaviPlani: '',
    wagnerGrade: '' as string,
  });
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleToggleLoc = (loc: WoundLocation) => {
    setLocs(prev => {
      const exists = prev.some(l => l.zone === loc.zone);
      return exists ? prev.filter(l => l.zone !== loc.zone) : [...prev, loc];
    });
  };

  const handleSave = () => {
    woundStorage.save({
      hastaId: patientId, tarih: new Date().toISOString(),
      lokalizasyon: locs,
      uzunluk: Number(form.uzunluk), genislik: Number(form.genislik), derinlik: Number(form.derinlik),
      granulasyon: Number(form.granulasyon), fibrin: Number(form.fibrin), nekroz: Number(form.nekroz),
      yaraKenari: form.yaraKenari,
      kizariklik: form.kizariklik, isiArtisi: form.isiArtisi, odem: form.odem,
      sekresyonTipi: form.sekresyonTipi, koku: form.koku,
      pansumanTipi: form.pansumanTipi, tedaviPlani: form.tedaviPlani,
      wagnerGrade: form.wagnerGrade !== '' ? Number(form.wagnerGrade) as WagnerGrade : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4">🩹 Yara Kaydı</h3>
      <div className="space-y-4">
        <FootDiagram selected={locs} onToggle={handleToggleLoc} />
        <div className="grid grid-cols-3 gap-3">
          {[['uzunluk','Uzunluk (cm)'],['genislik','Genişlik (cm)'],['derinlik','Derinlik (cm)']].map(([k,l]) => (
            <div key={k}>
              <label className="text-xs font-semibold text-gray-600 block mb-1">{l}</label>
              <input type="number" step="0.1" value={form[k as keyof typeof form] as string} onChange={e => set(k, e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="0,0" />
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-2">Yara Tabanı Karakteri (%)</label>
          <div className="grid grid-cols-3 gap-3">
            {[['granulasyon','Granülasyon','text-green-600'],['fibrin','Fibrin','text-yellow-600'],['nekroz','Nekroz','text-red-600']].map(([k,l,c]) => (
              <div key={k}>
                <span className={`text-xs font-semibold ${c}`}>{l}</span>
                <input type="number" min={0} max={100} value={form[k as keyof typeof form] as string} onChange={e => set(k, e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-blue-500 mt-1" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Yara Kenarı</label>
            <select value={form.yaraKenari} onChange={e => set('yaraKenari', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
              <option value="duzgun">Düzgün</option>
              <option value="undermined">Undermined</option>
              <option value="kallus">Kallus</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Sekresyon Tipi</label>
            <select value={form.sekresyonTipi} onChange={e => set('sekresyonTipi', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
              <option value="yok">Yok</option>
              <option value="seröz">Seröz</option>
              <option value="purülan">Purülan</option>
              <option value="kanlı">Kanlı</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-2">Enfeksiyon Bulguları</label>
          <div className="flex flex-wrap gap-3">
            {[['kizariklik','Kızarıklık'],['isiArtisi','Isı Artışı'],['odem','Ödem']].map(([k,l]) => (
              <label key={k} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="checkbox" checked={form[k as keyof typeof form] as boolean} onChange={e => set(k, e.target.checked)} />
                {l}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Koku</label>
            <select value={form.koku} onChange={e => set('koku', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
              <option value="yok">Yok</option>
              <option value="var">Var</option>
              <option value="şiddetli">Şiddetli</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Wagner Grade</label>
            <select value={form.wagnerGrade} onChange={e => set('wagnerGrade', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
              <option value="">Seçin</option>
              {[0,1,2,3,4,5].map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Pansuman Tipi</label>
          <input value={form.pansumanTipi} onChange={e => set('pansumanTipi', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Hidrojel, Gümüş pansuman..." />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">Tedavi Planı Notları</label>
          <textarea value={form.tedaviPlani} onChange={e => set('tedaviPlani', e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Tedavi planı, takip talimatları..." />
        </div>
        <button onClick={handleSave} className={`w-full py-3 rounded-xl font-semibold text-sm text-white transition-colors ${saved?'bg-green-600':'hover:opacity-90'}`} style={{ background: saved ? undefined : '#0d9488' }}>
          {saved ? '✓ Yara Kaydedildi' : '🩹 Yara Kaydını Kaydet'}
        </button>
      </div>
    </div>
  );
}

// ===== MAIN SCORING PAGE =====
type ScoringTab = 'wagner' | 'pedis' | 'ut' | 'sinbad' | 'abi' | 'vas' | 'noropati' | 'yara';

export default function Scoring() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<ScoringTab>('wagner');

  useEffect(() => {
    if (!id) return;
    const p = patientStorage.getById(id);
    if (!p) { navigate('/doktor/dashboard'); return; }
    setPatient(p);
  }, [id]);

  if (!patient) return <div className="min-h-screen bg-gray-50"><DoctorNavbar /></div>;

  const tabs: { id: ScoringTab; label: string }[] = [
    { id: 'wagner', label: 'Wagner' },
    { id: 'pedis', label: 'PEDIS' },
    { id: 'ut', label: 'UT' },
    { id: 'sinbad', label: 'SINBAD' },
    { id: 'abi', label: 'ABI' },
    { id: 'vas', label: 'VAS' },
    { id: 'noropati', label: 'Nöropati' },
    { id: 'yara', label: '🩹 Yara' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(`/doktor/hasta/${id}`)} className="text-gray-500 hover:text-gray-700 text-sm">← Geri</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Skorlama — {patient.ad} {patient.soyad}</h1>
            <p className="text-sm text-gray-500">{patient.diyabetTipi} • {patient.yas} yaş</p>
          </div>
        </div>

        <div className="flex gap-1 flex-wrap mb-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === t.id ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'wagner' && <WagnerTool patientId={id!} />}
        {activeTab === 'pedis' && <PEDISTool patientId={id!} />}
        {activeTab === 'ut' && <UTTool patientId={id!} />}
        {activeTab === 'sinbad' && <SINBADTool patientId={id!} />}
        {activeTab === 'abi' && <ABITool patientId={id!} />}
        {activeTab === 'vas' && <VASTool patientId={id!} />}
        {activeTab === 'noropati' && <NeuropathyTool patientId={id!} />}
        {activeTab === 'yara' && <WoundRecordTool patientId={id!} />}
      </main>
    </div>
  );
}
