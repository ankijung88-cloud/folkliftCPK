import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import type { PracticalItemScore } from '../../types';

interface Stage5Props {
  onComplete: (scores: Record<string, PracticalItemScore>) => void;
}

const PARK_STEPS = [
  '완전 정지',
  '기어 P',
  '사이드 브레이크',
  '엔진 정지',
  '키 제거',
  '고임목 설치',
  '지적 확인',
];

export const Stage5Driving: React.FC<Stage5Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'prep' | 'drive'>('prep');

  // Part A: 출발준비 (10점)
  const [step1Chock, setStep1Chock] = useState(false);
  const [step2Start, setStep2Start] = useState(false);
  const [step3Brake, setStep3Brake] = useState(false);
  const [prepOrderPenalty, setPrepOrderPenalty] = useState(0);

  // Part B: 2D 탑뷰 주행 시뮬레이터
  const [carX, setCarX] = useState(70);
  const [carY, setCarY] = useState(190);
  const [carAngle, setCarAngle] = useState(0); // degrees (0 = right)
  const [speed, setSpeed] = useState(0); // km/h
  const [gear, setGear] = useState<'P' | 'D' | 'R'>('D');
  const [stoppedAtLine, setStoppedAtLine] = useState(false);
  const [shiftedAfterStop, setShiftedAfterStop] = useState(false);
  const [harshEvents, setHarshEvents] = useState(0);
  const [parkCompletedSteps, setParkCompletedSteps] = useState<string[]>([]);
  const [parkPenalty, setParkPenalty] = useState(0);

  const inStopZone = carX >= 210 && carX <= 290 && carY >= 130 && carY <= 250;
  const inParkZone = carX >= 420 && carX <= 540 && carY >= 60 && carY <= 160;

  const moveCar = useCallback(
    (dir: 'forward' | 'back' | 'left' | 'right' | 'stop') => {
      if (dir === 'stop') {
        if (speed > 14) {
          setHarshEvents((h) => h + 1);
        }
        setSpeed(0);
        if (inStopZone) {
          setStoppedAtLine(true);
        }
        return;
      }

      if (dir === 'left') {
        if (speed > 12) setHarshEvents((h) => h + 1);
        setCarAngle((a) => a - 15);
        return;
      }
      if (dir === 'right') {
        if (speed > 12) setHarshEvents((h) => h + 1);
        setCarAngle((a) => a + 15);
        return;
      }

      const stepDist = dir === 'forward' ? 16 : -14;
      setSpeed(dir === 'forward' ? 10 : 8);
      setCarX((x) => {
        const rad = (carAngle * Math.PI) / 180;
        const nx = x + Math.cos(rad) * stepDist;
        return Math.max(40, Math.min(560, nx));
      });
      setCarY((y) => {
        const rad = (carAngle * Math.PI) / 180;
        const ny = y + Math.sin(rad) * stepDist;
        return Math.max(40, Math.min(240, ny));
      });
    },
    [carAngle, inStopZone, speed]
  );

  useEffect(() => {
    if (phase !== 'drive') return;
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') moveCar('forward');
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') moveCar('back');
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveCar('left');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveCar('right');
      if (e.key === ' ') moveCar('stop');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, moveCar]);

  const handlePrepClick = (step: 1 | 2 | 3) => {
    if (step === 1) setStep1Chock(true);
    if (step === 2) {
      if (!step1Chock) setPrepOrderPenalty((p) => p + 1);
      setStep2Start(true);
    }
    if (step === 3) {
      if (!step2Start) setPrepOrderPenalty((p) => p + 1);
      setStep3Brake(true);
    }
  };

  const handleParkStepClick = (label: string) => {
    if (parkCompletedSteps.includes(label)) return;
    const expectedNext = PARK_STEPS[parkCompletedSteps.length];
    if (label !== expectedNext) {
      setParkPenalty((p) => Math.min(2, p + 1));
    }
    setParkCompletedSteps((prev) => [...prev, label]);
    if (label === '완전 정지') setSpeed(0);
    if (label === '기어 P') setGear('P');
  };

  const chockScore = step1Chock ? 2 : 0;
  const startScore = step2Start ? Math.max(0, 3 - (prepOrderPenalty > 0 ? 1 : 0)) : 0;
  const brakeScore = step3Brake ? Math.max(0, 5 - (prepOrderPenalty > 1 ? 1 : 0)) : 0;

  const shiftScore = stoppedAtLine && shiftedAfterStop ? 3 : stoppedAtLine ? 2 : 0;
  const smoothScore = Math.max(0, 3 - harshEvents);
  const parkScore =
    inParkZone && parkCompletedSteps.length === PARK_STEPS.length
      ? Math.max(1, 3 - parkPenalty)
      : inParkZone && parkCompletedSteps.length >= 4
      ? 2
      : 0;

  const handleFinish = () => {
    onComplete({
      'start-chock': {
        itemId: 'start-chock',
        earned: chockScore,
        maxScore: 2,
        passed: chockScore === 2,
      },
      'start-preheat': {
        itemId: 'start-preheat',
        earned: startScore,
        maxScore: 3,
        passed: startScore === 3,
      },
      'start-check': {
        itemId: 'start-check',
        earned: brakeScore,
        maxScore: 5,
        passed: brakeScore === 5,
      },
      'drive-shift': {
        itemId: 'drive-shift',
        earned: shiftScore,
        maxScore: 3,
        passed: shiftScore === 3,
        note: stoppedAtLine ? '일단정지 및 변속 수행' : '정지선 일단정지 미수행',
      },
      'drive-smooth': {
        itemId: 'drive-smooth',
        earned: smoothScore,
        maxScore: 3,
        passed: smoothScore === 3,
        note: harshEvents > 0 ? `급정지/급회전 ${harshEvents}회` : '부드러운 주행',
      },
      'drive-park': {
        itemId: 'drive-park',
        earned: parkScore,
        maxScore: 3,
        passed: parkScore === 3,
        note: inParkZone
          ? `주차절차 ${parkCompletedSteps.length}/${PARK_STEPS.length} 완료`
          : '지정 주차구역 미진입',
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Stage 5 / 7 · 시동 · 주행 · 주정차 (19점)
          </span>
          <h2 className="text-xl font-bold mt-1">
            {phase === 'prep' ? '출발 전 시동 및 안전 점검 (10점)' : '2D 코스 주행 및 주차 시뮬레이션 (9점)'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {phase === 'prep'
              ? '올바른 순서(고임목 제거 → 예열/시동 → 조향/브레이크 점검)대로 진행하세요.'
              : '방향키(또는 버튼)로 정지선에서 일단정지 후 주차구역으로 이동하여 주차 7단계를 완료하세요.'}
          </p>
        </div>
        <Navigation className="w-10 h-10 text-amber-400 shrink-0" />
      </div>

      {phase === 'prep' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          {prepOrderPenalty > 0 && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              순서 위반이 감지되어 감점되었습니다. 고임목 제거 → 시동 → 브레이크 점검 순서를 지키세요.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handlePrepClick(1)}
              className={`p-5 rounded-2xl border-2 text-left transition space-y-2 ${
                step1Chock
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border">2점</span>
                {step1Chock && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </div>
              <div className="font-bold text-sm">1. 고임목 제거 및 기어 N/P 확인</div>
              <p className="text-xs opacity-80">출발 전 바퀴 고임목을 제거하고 기어 중립/파킹 상태를 확인합니다.</p>
            </button>

            <button
              onClick={() => handlePrepClick(2)}
              className={`p-5 rounded-2xl border-2 text-left transition space-y-2 ${
                step2Start
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border">3점</span>
                {step2Start && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </div>
              <div className="font-bold text-sm">2. 예열 시동 및 주변 안전 확보</div>
              <p className="text-xs opacity-80">엔진 예열 후 시동을 걸고 윤활유 순환을 기다립니다.</p>
            </button>

            <button
              onClick={() => handlePrepClick(3)}
              className={`p-5 rounded-2xl border-2 text-left transition space-y-2 ${
                step3Brake
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border">5점</span>
                {step3Brake && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </div>
              <div className="font-bold text-sm">3. 조향 · 사이드 · 풋브레이크 점검</div>
              <p className="text-xs opacity-80">출발 직전 핸들 유격과 사이드/풋브레이크 제동력을 점검합니다.</p>
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setPhase('drive')}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm"
            >
              주행 및 주차 시뮬레이터 시작 →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 2D 탑뷰 주행 캔버스 */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">
                속도: <span className="text-indigo-600">{speed} km/h</span> · 기어:{' '}
                <span className="text-indigo-600">{gear}</span>
              </span>
              <button
                onClick={() => {
                  setCarX(70);
                  setCarY(190);
                  setCarAngle(0);
                  setSpeed(0);
                }}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 위치 초기화
              </button>
            </div>

            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
              <svg viewBox="0 0 600 280" className="w-full h-auto">
                {/* 아스팔트 도로 */}
                <rect x="0" y="0" width="600" height="280" fill="#334155" />
                {/* 주행 차선 */}
                <line x1="20" y1="190" x2="360" y2="190" stroke="#f8fafc" strokeWidth="2" strokeDasharray="10 8" />
                <line x1="360" y1="190" x2="480" y2="110" stroke="#f8fafc" strokeWidth="2" strokeDasharray="10 8" />

                {/* 일단정지 구역 */}
                <rect
                  x="210"
                  y="140"
                  width="80"
                  height="100"
                  fill={stoppedAtLine ? '#10b981' : '#f59e0b'}
                  fillOpacity="0.22"
                  stroke={stoppedAtLine ? '#34d399' : '#fbbf24'}
                  strokeWidth="2"
                />
                <text x="250" y="258" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="bold">
                  {stoppedAtLine ? '일단정지 완료 ✓' : 'STOP 일단정지선'}
                </text>

                {/* 지정 주차구역 */}
                <rect
                  x="420"
                  y="60"
                  width="120"
                  height="100"
                  rx="6"
                  fill={inParkZone ? '#10b981' : '#3b82f6'}
                  fillOpacity="0.25"
                  stroke={inParkZone ? '#34d399' : '#60a5fa'}
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
                <text x="480" y="48" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">
                  PARKING ZONE (지정 주차구역)
                </text>

                {/* Tug Car (탑뷰) */}
                <g transform={`translate(${carX}, ${carY}) rotate(${carAngle})`}>
                  <rect x="-24" y="-14" width="48" height="28" rx="5" fill="#eab308" stroke="#fef08a" strokeWidth="2" />
                  <rect x="-8" y="-10" width="18" height="20" rx="2" fill="#0f172a" />
                  <circle cx="22" cy="-9" r="3" fill="#fef08a" />
                  <circle cx="22" cy="9" r="3" fill="#fef08a" />
                </g>
              </svg>
            </div>

            {/* 조작 버튼 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => moveCar('left')}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                >
                  ↺ 좌회전
                </button>
                <button
                  onClick={() => moveCar('forward')}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  ▲ 전진
                </button>
                <button
                  onClick={() => moveCar('back')}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  ▼ 후진
                </button>
                <button
                  onClick={() => moveCar('right')}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                >
                  ↻ 우회전
                </button>
                <button
                  onClick={() => moveCar('stop')}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  ■ 정지 (Space)
                </button>
              </div>

              <button
                onClick={() => {
                  if (stoppedAtLine) setShiftedAfterStop(true);
                }}
                disabled={!stoppedAtLine}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition disabled:opacity-40 ${
                  shiftedAfterStop
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                }`}
              >
                {shiftedAfterStop ? '✓ 일단정지 후 변속 완료' : '정지 후 기어 변속'}
              </button>
            </div>
          </div>

          {/* 우측: 주차 7단계 절차 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">주차방법 7단계 (순서 준수)</h3>
                <span className="text-xs font-bold text-indigo-600">
                  {parkCompletedSteps.length}/{PARK_STEPS.length}
                </span>
              </div>
              {!inParkZone && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  먼저 차량을 우측 상단 <strong>PARKING ZONE</strong> 안으로 이동시키세요.
                </div>
              )}
              <div className={`space-y-1.5 ${!inParkZone ? 'opacity-50 pointer-events-none' : ''}`}>
                {PARK_STEPS.map((step) => {
                  const done = parkCompletedSteps.includes(step);
                  return (
                    <button
                      key={step}
                      onClick={() => handleParkStepClick(step)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                        done
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                      }`}
                    >
                      {done ? `✓ ${step}` : step}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="mt-5 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm"
            >
              다음 단계: Dolly 견인 및 연결해제 (25점) →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
