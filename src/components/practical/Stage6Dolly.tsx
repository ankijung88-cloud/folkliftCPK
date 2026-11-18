import React, { useState, useEffect, useCallback } from 'react';
import { Link2, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PracticalItemScore } from '../../types';

interface Stage6Props {
  onComplete: (scores: Record<string, PracticalItemScore>) => void;
}

export const Stage6Dolly: React.FC<Stage6Props> = ({ onComplete }) => {
  // Tug Car 위치 (Dolly는 x=400, y=140에 고정)
  const [tugX, setTugX] = useState(140);
  const [tugY, setTugY] = useState(175);
  const [tugAngle, setTugAngle] = useState(-10); // degrees
  const [collided, setCollided] = useState(false);
  const [dockingConfirmed, setDockingConfirmed] = useState(false);

  // 연결 및 안전점검 (7점)
  const [hookAttached, setHookAttached] = useState(false);
  const [pinLocked, setPinLocked] = useState(false);
  const [safetyInspected, setSafetyInspected] = useState(false);

  // 연결해제 후 Tow Bar Up (3점)
  const [hookReleased, setHookReleased] = useState(false);
  const [towBarUp, setTowBarUp] = useState(false);

  // 목표 접현 위치: Tug Car 후면(x + 30)이 Dolly Tow Bar 끝(x = 345, y = 140)에 근접
  const rearX = tugX + Math.cos((tugAngle * Math.PI) / 180) * 32;
  const rearY = tugY + Math.sin((tugAngle * Math.PI) / 180) * 32;
  const distError = Math.round(Math.hypot(rearX - 342, rearY - 140));
  const yOffset = Math.round(Math.abs(rearY - 140));
  const angleError = Math.round(Math.abs(tugAngle));

  const moveTug = useCallback(
    (action: 'reverse' | 'forward' | 'left' | 'right') => {
      if (dockingConfirmed) return;
      if (action === 'left') {
        setTugAngle((a) => Math.max(-45, a - 5));
        return;
      }
      if (action === 'right') {
        setTugAngle((a) => Math.min(45, a + 5));
        return;
      }
      const delta = action === 'reverse' ? 10 : -10;
      setTugX((x) => {
        const rad = (tugAngle * Math.PI) / 180;
        const nx = x + Math.cos(rad) * delta;
        if (nx > 325) {
          setCollided(true);
          return 325;
        }
        return Math.max(60, nx);
      });
      setTugY((y) => {
        const rad = (tugAngle * Math.PI) / 180;
        const ny = y + Math.sin(rad) * delta;
        return Math.max(45, Math.min(235, ny));
      });
    },
    [dockingConfirmed, tugAngle]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveTug('reverse');
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveTug('forward');
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') moveTug('left');
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') moveTug('right');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moveTug]);

  // 접현 점수 계산 (15점 만점)
  const calcDockingScore = (): number => {
    if (!dockingConfirmed) return 0;
    let score = 15;
    if (collided) score -= 4;
    if (distError > 35) score -= 5;
    else if (distError > 18) score -= 2;
    if (yOffset > 20) score -= 3;
    else if (yOffset > 10) score -= 1;
    if (angleError > 15) score -= 3;
    else if (angleError > 5) score -= 1;
    return Math.max(0, score);
  };

  const dockingScore = calcDockingScore();
  const connectScore =
    (hookAttached ? 2 : 0) + (pinLocked ? 3 : 0) + (safetyInspected ? 2 : 0);
  const releaseScore = (hookReleased ? 1 : 0) + (towBarUp ? 2 : 0);

  const handleFinish = () => {
    onComplete({
      'dolly-docking': {
        itemId: 'dolly-docking',
        earned: dockingScore,
        maxScore: 15,
        passed: dockingScore >= 13,
        note: `이격오차 ${distError}cm, 수평오차 ${yOffset}px, 각도 ${angleError}°${
          collided ? ' (접촉 발생)' : ''
        }`,
      },
      'dolly-connect': {
        itemId: 'dolly-connect',
        earned: connectScore,
        maxScore: 7,
        passed: connectScore === 7,
      },
      'dolly-release': {
        itemId: 'dolly-release',
        earned: releaseScore,
        maxScore: 3,
        passed: releaseScore === 3,
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Stage 6 / 7 · Dolly 견인 및 연결해제 (25점)
          </span>
          <h2 className="text-xl font-bold mt-1">Dolly 정밀 접현 · 연결 · Tow Bar Up 시뮬레이션</h2>
          <p className="text-xs text-slate-300 mt-1">
            Tug Car를 후진·조향하여 Dolly 앞 목표 지점에 평행하게 접현한 뒤, 연결 및 Tow Bar Up을 완료하세요.
          </p>
        </div>
        <Link2 className="w-10 h-10 text-amber-400 shrink-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 좌측: 2D 정밀 접현 시뮬레이터 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <div className="flex items-center gap-3">
              <span>
                이격거리 오차:{' '}
                <strong className={distError <= 18 ? 'text-emerald-600' : 'text-amber-600'}>
                  {distError} cm
                </strong>
              </span>
              <span>
                수평 오차:{' '}
                <strong className={yOffset <= 10 ? 'text-emerald-600' : 'text-amber-600'}>
                  {yOffset} px
                </strong>
              </span>
              <span>
                평행 각도:{' '}
                <strong className={angleError <= 5 ? 'text-emerald-600' : 'text-amber-600'}>
                  {angleError}°
                </strong>
              </span>
            </div>
            <button
              onClick={() => {
                setTugX(140);
                setTugY(175);
                setTugAngle(-10);
                setCollided(false);
                setDockingConfirmed(false);
              }}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 재시도
            </button>
          </div>

          {collided && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Dolly와 접촉이 발생했습니다! (접촉 감점 적용)
            </div>
          )}

          <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            <svg viewBox="0 0 600 280" className="w-full h-auto">
              <rect x="0" y="0" width="600" height="280" fill="#1e293b" />
              {/* 유도 기준선 */}
              <line x1="50" y1="140" x2="550" y2="140" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />

              {/* 목표 접현 포인트 */}
              <circle
                cx="342"
                cy="140"
                r="14"
                fill="none"
                stroke={distError <= 18 && yOffset <= 10 ? '#34d399' : '#fbbf24'}
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />
              <text x="342" y="114" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="bold">
                목표 접현점
              </text>

              {/* Dolly (고정) */}
              <g transform="translate(410, 140)">
                {/* Tow Bar */}
                {towBarUp ? (
                  <rect x="-25" y="-4" width="25" height="8" rx="3" fill="#f97316" />
                ) : (
                  <g>
                    <line x1="-68" y1="0" x2="0" y2="0" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="-68" cy="0" r="6" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  </g>
                )}
                {/* Dolly 본체 */}
                <rect x="0" y="-36" width="135" height="72" rx="6" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="12" y="-26" width="110" height="52" rx="3" fill="#334155" stroke="#64748b" strokeDasharray="4 4" />
                <text x="67" y="4" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                  DOLLY
                </text>
              </g>

              {/* Tug Car (이동 가능) */}
              <g transform={`translate(${tugX}, ${tugY}) rotate(${tugAngle})`}>
                <rect x="-32" y="-20" width="64" height="40" rx="6" fill="#eab308" stroke="#fef08a" strokeWidth="2" />
                <rect x="-12" y="-14" width="22" height="28" rx="3" fill="#0f172a" />
                {/* 후면 견인고리 */}
                <circle cx="32" cy="0" r="5" fill={hookAttached && !hookReleased ? '#10b981' : '#ef4444'} />
              </g>
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => moveTug('forward')}
                disabled={dockingConfirmed}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold disabled:opacity-40"
              >
                ◀ 전진
              </button>
              <button
                onClick={() => moveTug('reverse')}
                disabled={dockingConfirmed}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40"
              >
                후진 접현 ▶
              </button>
              <button
                onClick={() => moveTug('left')}
                disabled={dockingConfirmed}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold disabled:opacity-40"
              >
                ▲ 각도 -
              </button>
              <button
                onClick={() => moveTug('right')}
                disabled={dockingConfirmed}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold disabled:opacity-40"
              >
                ▼ 각도 +
              </button>
            </div>

            <button
              onClick={() => setDockingConfirmed(true)}
              disabled={dockingConfirmed}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                dockingConfirmed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {dockingConfirmed ? `✓ 접현 완료 (${dockingScore}/15점)` : '접현 위치 확정'}
            </button>
          </div>
        </div>

        {/* 우측: 연결 및 해제 절차 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-slate-900">견인고리 연결 및 안전점검 (7점)</h3>
                {connectScore === 7 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
              <div className={`space-y-2 ${!dockingConfirmed ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  onClick={() => setHookAttached(true)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border ${
                    hookAttached
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                  }`}
                >
                  {hookAttached ? '✓ 1. Tow Bar 견인고리 결합 완료' : '1. Tow Bar 견인고리 결합'}
                </button>
                <button
                  onClick={() => setPinLocked(true)}
                  disabled={!hookAttached}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border disabled:opacity-40 ${
                    pinLocked
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                  }`}
                >
                  {pinLocked ? '✓ 2. 안전 Pin 체결 및 잠금 확인' : '2. 안전 Pin 체결 확인'}
                </button>
                <button
                  onClick={() => setSafetyInspected(true)}
                  disabled={!pinLocked}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border disabled:opacity-40 ${
                    safetyInspected
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                  }`}
                >
                  {safetyInspected ? '✓ 3. 견인 장비 안전 점검 완료' : '3. 견인 장비 안전 점검'}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-slate-900">연결해제 후 Tow Bar Up (3점)</h3>
                {releaseScore === 3 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
              <div className={`space-y-2 ${!safetyInspected ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  onClick={() => setHookReleased(true)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border ${
                    hookReleased
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                  }`}
                >
                  {hookReleased ? '✓ 1. Pin 분리 및 견인고리 해제' : '1. 견인고리 연결 해제'}
                </button>
                <button
                  onClick={() => setTowBarUp(true)}
                  disabled={!hookReleased}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border disabled:opacity-40 ${
                    towBarUp
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                  }`}
                >
                  {towBarUp ? '✓ 2. Tow Bar Up 고정 완료 (바토바)' : '2. Tow Bar Up 올림 고정'}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm"
          >
            다음 단계: 돌발상황 대처능력 (9점) →
          </button>
        </div>
      </div>
    </div>
  );
};
