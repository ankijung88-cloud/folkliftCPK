import React, { useState } from 'react';
import { Wrench, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { PracticalItemScore } from '../../types';

interface Stage2Props {
  onComplete: (scores: Record<string, PracticalItemScore>) => void;
}

type HotspotId = 'safety' | 'body' | 'tire' | 'hook';

export const Stage2External: React.FC<Stage2Props> = ({ onComplete }) => {
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotId>('safety');
  const [safetyViolation, setSafetyViolation] = useState(false);

  // 1. 점검전 안전 확보 (5점)
  const [chockChecked, setChockChecked] = useState(false);
  const [sideBrakeChecked, setSideBrakeChecked] = useState(false);
  const [gearChecked, setGearChecked] = useState(false);
  const safetyDone = chockChecked && sideBrakeChecked && gearChecked;

  // 2. 동체/와이퍼/연료캡/소화기/누유 (5점)
  const [bodyChecks, setBodyChecks] = useState({
    body: false,
    wiper: false,
    fuelCap: false,
    extinguisher: false,
    leak: false,
  });

  // 3. 타이어 점검 (3점) - 이상 판별 포함
  const [tireChecks, setTireChecks] = useState({
    wear: false,
    pressure: false,
    nutAndRim: false,
  });

  // 4. 견인고리 (2점)
  const [hookChecks, setHookChecks] = useState({
    tension: false,
    pin: false,
  });

  const handleHotspotClick = (id: HotspotId) => {
    if (id !== 'safety' && !safetyDone) {
      setSafetyViolation(true);
    }
    setSelectedHotspot(id);
  };

  const bodyDoneCount = Object.values(bodyChecks).filter(Boolean).length;
  const tireDoneCount = Object.values(tireChecks).filter(Boolean).length;
  const hookDoneCount = Object.values(hookChecks).filter(Boolean).length;

  const safetyScore = safetyDone ? (safetyViolation ? 3 : 5) : 0;
  const bodyScore = bodyDoneCount; // 0~5점 (항목별 1점)
  const tireScore = tireDoneCount; // 0~3점
  const hookScore = hookDoneCount; // 0~2점
  const totalEarned = safetyScore + bodyScore + tireScore + hookScore;

  const handleFinishStage = () => {
    onComplete({
      'ext-safety': {
        itemId: 'ext-safety',
        earned: safetyScore,
        maxScore: 5,
        passed: safetyScore === 5,
        note: !safetyDone
          ? '점검전 안전확보 미완료'
          : safetyViolation
          ? '안전확보 전 타 부위 선점검(-2점)'
          : '고임목·사이드·기어 상태 확인 완료',
      },
      'ext-body': {
        itemId: 'ext-body',
        earned: bodyScore,
        maxScore: 5,
        passed: bodyScore === 5,
        note: `${bodyDoneCount}/5 항목 점검 완료`,
      },
      'ext-tire': {
        itemId: 'ext-tire',
        earned: tireScore,
        maxScore: 3,
        passed: tireScore === 3,
        note: `${tireDoneCount}/3 항목 점검 완료`,
      },
      'ext-hook': {
        itemId: 'ext-hook',
        earned: hookScore,
        maxScore: 2,
        passed: hookScore === 2,
        note: `${hookDoneCount}/2 항목 점검 완료`,
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Stage 2 / 7 · 장비 일반점검 - 외부점검 (15점)
          </span>
          <h2 className="text-xl font-bold mt-1">Tug Car 외부 점검 시뮬레이션</h2>
          <p className="text-xs text-slate-300 mt-1">
            반드시 <strong>① 점검 전 안전 확보(고임목·사이드·기어)</strong>를 먼저 완료한 후 각 부위를 클릭해 점검하세요.
          </p>
        </div>
        <Wrench className="w-10 h-10 text-amber-400 shrink-0" />
      </div>

      {safetyViolation && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          주의: 점검 전 안전 확보(고임목, 사이드, 기어 중립/파킹)를 완료하기 전에 다른 부위를 점검하여 2점 감점되었습니다!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* 좌측: 인터랙티브 Tug Car SVG */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-800">장비 외부 점검 포인트 선택</span>
            <span className="text-xs font-semibold text-slate-500">
              획득 점수: <strong className="text-indigo-600">{totalEarned}</strong> / 15점
            </span>
          </div>

          <div className="bg-slate-100 rounded-xl p-4 relative border border-slate-200">
            <svg viewBox="0 0 600 280" className="w-full h-auto">
              {/* 바닥면 */}
              <line x1="20" y1="235" x2="580" y2="235" stroke="#94a3b8" strokeWidth="4" />

              {/* Tug Car 차체 */}
              <rect x="110" y="130" width="330" height="75" rx="14" fill="#eab308" stroke="#ca8a04" strokeWidth="3" />
              {/* 운전석 캐빈 */}
              <path d="M 190 130 L 210 65 L 335 65 L 350 130 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
              <rect x="215" y="75" width="110" height="45" rx="4" fill="#bae6fd" opacity="0.85" />
              {/* 와이퍼 */}
              <line x1="225" y1="118" x2="255" y2="85" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              {/* 경광등 */}
              <rect x="265" y="52" width="18" height="13" rx="3" fill="#f97316" />

              {/* 전조등 & 연료캡 & 소화기 */}
              <rect x="105" y="150" width="10" height="22" rx="3" fill="#fef08a" stroke="#ca8a04" />
              <circle cx="155" cy="170" r="8" fill="#475569" stroke="#1e293b" strokeWidth="2" />
              <rect x="370" y="150" width="18" height="36" rx="4" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />

              {/* 바퀴 (앞/뒤) */}
              <circle cx="170" cy="210" r="28" fill="#1e293b" />
              <circle cx="170" cy="210" r="14" fill="#94a3b8" />
              <circle cx="385" cy="210" r="28" fill="#1e293b" />
              <circle cx="385" cy="210" r="14" fill="#94a3b8" />

              {/* 고임목 (Chock) */}
              <polygon points="130,235 144,235 144,220" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
              <polygon points="410,235 424,235 410,220" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />

              {/* 후면 견인고리 (Tow Hook & Pin) */}
              <rect x="440" y="168" width="38" height="14" rx="3" fill="#475569" />
              <circle cx="478" cy="175" r="9" fill="none" stroke="#334155" strokeWidth="4" />
              <line x1="468" y1="158" x2="468" y2="188" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />

              {/* 클릭 가능한 핫스팟 버튼들 */}
              {/* 1. 안전 확보 (운전석/고임목) */}
              <g
                onClick={() => handleHotspotClick('safety')}
                className="cursor-pointer"
              >
                <circle
                  cx="270"
                  cy="100"
                  r="20"
                  fill={safetyDone ? '#10b981' : '#ef4444'}
                  opacity="0.9"
                  stroke="#fff"
                  strokeWidth="3"
                />
                <text x="270" y="105" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">
                  ①
                </text>
              </g>

              {/* 2. 동체/와이퍼/연료캡/소화기/누유 */}
              <g
                onClick={() => handleHotspotClick('body')}
                className="cursor-pointer"
              >
                <circle
                  cx="379"
                  cy="168"
                  r="20"
                  fill={bodyDoneCount === 5 ? '#10b981' : '#3b82f6'}
                  opacity="0.9"
                  stroke="#fff"
                  strokeWidth="3"
                />
                <text x="379" y="173" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">
                  ②
                </text>
              </g>

              {/* 3. 타이어 */}
              <g
                onClick={() => handleHotspotClick('tire')}
                className="cursor-pointer"
              >
                <circle
                  cx="170"
                  cy="210"
                  r="20"
                  fill={tireDoneCount === 3 ? '#10b981' : '#3b82f6'}
                  opacity="0.9"
                  stroke="#fff"
                  strokeWidth="3"
                />
                <text x="170" y="215" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">
                  ③
                </text>
              </g>

              {/* 4. 견인고리 & Pin */}
              <g
                onClick={() => handleHotspotClick('hook')}
                className="cursor-pointer"
              >
                <circle
                  cx="475"
                  cy="175"
                  r="20"
                  fill={hookDoneCount === 2 ? '#10b981' : '#3b82f6'}
                  opacity="0.9"
                  stroke="#fff"
                  strokeWidth="3"
                />
                <text x="475" y="180" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">
                  ④
                </text>
              </g>
            </svg>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { id: 'safety' as const, label: '① 안전확보', done: safetyDone, score: `${safetyScore}/5` },
              { id: 'body' as const, label: '② 동체·소화기', done: bodyDoneCount === 5, score: `${bodyScore}/5` },
              { id: 'tire' as const, label: '③ 타이어', done: tireDoneCount === 3, score: `${tireScore}/3` },
              { id: 'hook' as const, label: '④ 견인고리', done: hookDoneCount === 2, score: `${hookScore}/2` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleHotspotClick(tab.id)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                  selectedHotspot === tab.id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                    : tab.done
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div>{tab.label}</div>
                <div className="text-[11px] opacity-80">{tab.score}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 우측: 선택된 부위 세부 점검 패널 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            {selectedHotspot === 'safety' && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">① 점검 전 안전 확보 (5점)</h3>
                  {safetyDone && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>
                <p className="text-xs text-slate-500">
                  장비 점검 시작 전 차량이 움직이지 않도록 3가지 안전 상태를 반드시 확인하세요.
                </p>
                <div className="space-y-2.5">
                  <button
                    onClick={() => setChockChecked(true)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                      chockChecked
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {chockChecked ? '✓ 고임목(Chock) 앞뒤 바퀴 설치 확인' : '1. 고임목(Chock) 설치 여부 확인'}
                  </button>
                  <button
                    onClick={() => setSideBrakeChecked(true)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                      sideBrakeChecked
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {sideBrakeChecked ? '✓ 사이드 브레이크 체결 확인' : '2. 사이드(주차) 브레이크 체결 확인'}
                  </button>
                  <button
                    onClick={() => setGearChecked(true)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                      gearChecked
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {gearChecked ? '✓ 기어 중립(N) 및 파킹(P) 상태 확인' : '3. 기어 중립 및 파킹(P) 상태 확인'}
                  </button>
                </div>
              </>
            )}

            {selectedHotspot === 'body' && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">② 동체 및 주요 장치 점검 (5점)</h3>
                  <span className="text-xs font-bold text-indigo-600">{bodyDoneCount}/5</span>
                </div>
                <p className="text-xs text-slate-500">
                  누락 시 각 항목별 1점씩 감점됩니다. 모두 클릭하여 점검하세요.
                </p>
                <div className="space-y-2">
                  {[
                    { key: 'body' as const, label: '동체 외관 손상 및 찌그러짐 여부' },
                    { key: 'wiper' as const, label: '와이퍼 블레이드 마모 상태' },
                    { key: 'fuelCap' as const, label: '연료캡 체결 및 밀폐 상태' },
                    { key: 'extinguisher' as const, label: '소화기 비치 및 압력게이지(녹색) 확인' },
                    { key: 'leak' as const, label: '장비 하부 오일/냉각수 누유 여부 확인' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() =>
                        setBodyChecks((prev) => ({ ...prev, [item.key]: true }))
                      }
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                        bodyChecks[item.key]
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                      }`}
                    >
                      {bodyChecks[item.key] ? `✓ ${item.label} (정상)` : item.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {selectedHotspot === 'tire' && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">③ 타이어 점검 (3점)</h3>
                  <span className="text-xs font-bold text-indigo-600">{tireDoneCount}/3</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    앞/뒤 타이어 트레드 마모, 적정 공기압, 휠너트 풀림, 이물질(못 등) 박힘, 휠 손상을 확인하세요.
                  </span>
                </div>
                <div className="space-y-2.5">
                  <button
                    onClick={() => setTireChecks((p) => ({ ...p, wear: true }))}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                      tireChecks.wear
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {tireChecks.wear ? '✓ 타이어 마모 및 편마모 상태 확인' : '1. 타이어 마모 상태 점검'}
                  </button>
                  <button
                    onClick={() => setTireChecks((p) => ({ ...p, pressure: true }))}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                      tireChecks.pressure
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {tireChecks.pressure ? '✓ 공기압 게이지 측정 (적정압 정상)' : '2. 타이어 공기압 점검'}
                  </button>
                  <button
                    onClick={() => setTireChecks((p) => ({ ...p, nutAndRim: true }))}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                      tireChecks.nutAndRim
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {tireChecks.nutAndRim
                      ? '✓ 휠너트 체결·이물질·휠손상 없음 확인'
                      : '3. 휠너트·이물질 박힘·휠손상 점검'}
                  </button>
                </div>
              </>
            )}

            {selectedHotspot === 'hook' && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">④ 견인고리 점검 (2점)</h3>
                  <span className="text-xs font-bold text-indigo-600">{hookDoneCount}/2</span>
                </div>
                <p className="text-xs text-slate-500">
                  Dolly 견인을 위한 후면 견인고리의 장력, 장착상태 및 안전 Pin 상태를 점검합니다.
                </p>
                <div className="space-y-2.5">
                  <button
                    onClick={() => setHookChecks((p) => ({ ...p, tension: true }))}
                    className={`w-full text-left px-3.5 py-3 rounded-xl border text-xs font-semibold transition ${
                      hookChecks.tension
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {hookChecks.tension ? '✓ 견인고리 장력 및 장착상태 양호' : '1. 견인고리 장력 및 장착상태 확인'}
                  </button>
                  <button
                    onClick={() => setHookChecks((p) => ({ ...p, pin: true }))}
                    className={`w-full text-left px-3.5 py-3 rounded-xl border text-xs font-semibold transition ${
                      hookChecks.pin
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                    }`}
                  >
                    {hookChecks.pin ? '✓ 안전 Pin 마모 및 체결상태 양호' : '2. 견인고리 Pin 상태 확인'}
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleFinishStage}
            className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition"
          >
            외부점검 완료 → 내부점검 (20점)
          </button>
        </div>
      </div>
    </div>
  );
};
