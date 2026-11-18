import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Wind, Clock, CheckCircle2 } from 'lucide-react';
import type { PracticalItemScore } from '../../types';

interface Stage1Props {
  onComplete: (scores: Record<string, PracticalItemScore>) => void;
}

export const Stage1Attitude: React.FC<Stage1Props> = ({ onComplete }) => {
  const [vestOn, setVestOn] = useState(false);
  const [shoesOn, setShoesOn] = useState(false);
  const [breathTested, setBreathTested] = useState(false);
  const [breathTesting, setBreathTesting] = useState(false);
  const [onTimeChecked, setOnTimeChecked] = useState(false);

  const handleBreathTest = () => {
    if (breathTested || breathTesting) return;
    setBreathTesting(true);
    setTimeout(() => {
      setBreathTesting(false);
      setBreathTested(true);
    }, 900);
  };

  const completedCount =
    (vestOn && shoesOn ? 1 : 0) + (breathTested ? 1 : 0) + (onTimeChecked ? 1 : 0);

  const handleNext = () => {
    const earned = completedCount; // max 3
    onComplete({
      attitude: {
        itemId: 'attitude',
        earned,
        maxScore: 3,
        passed: earned === 3,
        note:
          earned === 3
            ? '복장·음주·정시입실 양호'
            : `미확인 항목 ${3 - earned}건 감점`,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Stage 1 / 7 · 응시태도 (3점)
          </span>
          <h2 className="text-xl font-bold mt-1">평가 입실 및 운전자 상태 점검</h2>
          <p className="text-xs text-slate-300 mt-1">
            안전장구 착용, 음주 측정, 정시 입실을 순서대로 완료하세요.
          </p>
        </div>
        <UserCheck className="w-10 h-10 text-amber-400 shrink-0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. 복장상태 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> 1. 복장 및 안전장구
            </span>
            {vestOn && shoesOn && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>
          <p className="text-xs text-slate-500">
            이동지역 내 시인성 확보를 위한 유도복과 안전화를 착용하세요.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setVestOn(true)}
              className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold border transition ${
                vestOn
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 hover:bg-indigo-50 text-slate-700'
              }`}
            >
              {vestOn ? '✓ 반사 유도복 착용 완료' : '반사 유도복(안전조끼) 착용하기'}
            </button>
            <button
              onClick={() => setShoesOn(true)}
              className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold border transition ${
                shoesOn
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 hover:bg-indigo-50 text-slate-700'
              }`}
            >
              {shoesOn ? '✓ 안전화 착용 완료' : '안전화 착용 확인하기'}
            </button>
          </div>
        </div>

        {/* 2. 음주측정 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <Wind className="w-5 h-5 text-sky-600" /> 2. 음주 상태 측정
            </span>
            {breathTested && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>
          <div className="bg-slate-900 rounded-xl p-4 text-center font-mono">
            <div className="text-[11px] text-slate-400">ALCOHOL TESTER</div>
            <div
              className={`text-2xl font-black mt-1 ${
                breathTested
                  ? 'text-emerald-400'
                  : breathTesting
                  ? 'text-amber-400 animate-pulse'
                  : 'text-slate-500'
              }`}
            >
              {breathTesting ? '측정 중...' : breathTested ? '0.00 % PASS' : '--- %'}
            </div>
          </div>
          <button
            onClick={handleBreathTest}
            disabled={breathTested || breathTesting}
            className={`w-full py-2.5 px-3 rounded-xl text-sm font-semibold border transition ${
              breathTested
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-sky-600 border-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            {breathTested ? '✓ 음주 측정 정상(0.00%)' : '음주측정기 불기'}
          </button>
        </div>

        {/* 3. 정시 입실 및 운전자세 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" /> 3. 정시 입실 및 자세
            </span>
            {onTimeChecked && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>
          <p className="text-xs text-slate-500">
            평가 시간 엄수(지각 여부) 및 바른 운전자세 준수를 서약합니다.
          </p>
          <button
            onClick={() => setOnTimeChecked(true)}
            className={`w-full py-3 px-3 rounded-xl text-sm font-semibold border transition ${
              onTimeChecked
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-slate-50 border-slate-200 hover:bg-indigo-50 text-slate-700'
            }`}
          >
            {onTimeChecked ? '✓ 정시 입실 · 바른 자세 확인' : '정시 입실 및 자세 확인'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-slate-600">
          현재 달성: <strong className="text-indigo-600">{completedCount} / 3점</strong>
        </div>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition"
        >
          다음 단계: 외부점검 (15점) →
        </button>
      </div>
    </div>
  );
};
