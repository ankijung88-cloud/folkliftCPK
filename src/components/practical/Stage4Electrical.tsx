import React, { useState } from 'react';
import { Zap, Lightbulb, Volume2, Gauge, CheckCircle2 } from 'lucide-react';
import type { PracticalItemScore } from '../../types';

interface Stage4Props {
  onComplete: (scores: Record<string, PracticalItemScore>) => void;
}

export const Stage4Electrical: React.FC<Stage4Props> = ({ onComplete }) => {
  const [keyOn, setKeyOn] = useState(false);
  const [headlightOn, setHeadlightOn] = useState(false);
  const [hazardOn, setHazardOn] = useState(false);
  const [wiperOn, setWiperOn] = useState(false);
  const [hornTested, setHornTested] = useState(false);
  const [hornActive, setHornActive] = useState(false);
  const [clusterChecked, setClusterChecked] = useState(false);

  const playHornSound = () => {
    setHornTested(true);
    setHornActive(true);
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(340, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 220);
    } catch {
      // ignore audio error if blocked
    }
    setTimeout(() => setHornActive(false), 350);
  };

  const lightsScore = (headlightOn ? 1 : 0) + (hazardOn ? 1 : 0) + (wiperOn ? 1 : 0);
  const hornScore = hornTested ? 3 : 0;
  const clusterScore = keyOn && clusterChecked ? 3 : 0;
  const totalEarned = lightsScore + hornScore + clusterScore;

  const handleFinish = () => {
    onComplete({
      'elec-lights': {
        itemId: 'elec-lights',
        earned: lightsScore,
        maxScore: 3,
        passed: lightsScore === 3,
        note: `전조등·비상등·와이퍼 ${lightsScore}/3 작동 확인`,
      },
      'elec-horn': {
        itemId: 'elec-horn',
        earned: hornScore,
        maxScore: 3,
        passed: hornScore === 3,
        note: hornTested ? '경음기 정상 작동 확인' : '경음기 미점검',
      },
      'elec-cluster': {
        itemId: 'elec-cluster',
        earned: clusterScore,
        maxScore: 3,
        passed: clusterScore === 3,
        note: clusterScore === 3 ? '계기판 및 전기계통 정상 확인' : '계기판 점검 미완료',
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Stage 4 / 7 · 장비 일반점검 - 전기계통 (9점)
          </span>
          <h2 className="text-xl font-bold mt-1">운전석 전기계통 및 계기판 점검</h2>
          <p className="text-xs text-slate-300 mt-1">
            KEY ON 상태로 전환한 뒤 등화장치, 와이퍼, 경음기, 계기판 경고등을 모두 테스트하세요.
          </p>
        </div>
        <Zap className="w-10 h-10 text-amber-400 shrink-0" />
      </div>

      {/* 운전석 대시보드 시뮬레이션 */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 text-white space-y-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <button
            onClick={() => setKeyOn(true)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition border ${
              keyOn
                ? 'bg-emerald-600 border-emerald-400 text-white'
                : 'bg-amber-500 border-amber-400 text-slate-950 hover:bg-amber-400'
            }`}
          >
            {keyOn ? '🔑 IGNITION KEY: ON' : '🔑 시동키 돌리기 (KEY ON)'}
          </button>
          <div className="text-sm font-bold text-slate-300">
            전기계통 점수: <span className="text-amber-400">{totalEarned} / 9점</span>
          </div>
        </div>

        {/* 계기판 디스플레이 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. 등화장치 & 와이퍼 */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-2 text-amber-300">
                <Lightbulb className="w-4 h-4" /> 등화장치 & 와이퍼 (3점)
              </span>
              {lightsScore === 3 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setHeadlightOn(true)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border text-left transition ${
                  headlightOn
                    ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                {headlightOn ? '✓ 전조등(Headlight) 점등 정상' : '전조등 스위치 ON'}
              </button>
              <button
                onClick={() => setHazardOn(true)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border text-left transition ${
                  hazardOn
                    ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                {hazardOn ? '✓ 비상등/경광등 점멸 정상' : '비상등 · 경광등 ON'}
              </button>
              <button
                onClick={() => setWiperOn(true)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border text-left transition ${
                  wiperOn
                    ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                {wiperOn ? '✓ 와이퍼 작동 및 워셔액 정상' : '와이퍼 스위치 작동 테스트'}
              </button>
            </div>
          </div>

          {/* 2. 경음기 */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-2 text-sky-300">
                <Volume2 className="w-4 h-4" /> 경음기 작동 (3점)
              </span>
              {hornTested && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>

            <div className="flex items-center justify-center py-4">
              <button
                onClick={playHornSound}
                className={`w-24 h-24 rounded-full font-black text-sm border-4 transition transform active:scale-95 ${
                  hornActive
                    ? 'bg-amber-400 border-amber-200 text-slate-950 scale-105 shadow-[0_0_25px_rgba(251,191,36,0.7)]'
                    : hornTested
                    ? 'bg-emerald-700 border-emerald-400 text-white'
                    : 'bg-slate-700 border-slate-500 text-slate-200 hover:bg-slate-600'
                }`}
              >
                {hornActive ? '빵!! 🔊' : hornTested ? '정상 ✓' : 'HORN'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              버튼을 눌러 경음기 울림 상태를 확인하세요.
            </p>
          </div>

          {/* 3. 계기판 점검 */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-2 text-emerald-300">
                <Gauge className="w-4 h-4" /> 계기판 상태 (3점)
              </span>
              {clusterScore === 3 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-700 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">BATTERY</span>
                <span className={keyOn ? 'text-emerald-400' : 'text-slate-600'}>
                  {keyOn ? '12.6V OK' : 'OFF'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">OIL PRESS</span>
                <span className={keyOn ? 'text-emerald-400' : 'text-slate-600'}>
                  {keyOn ? 'NORMAL' : 'OFF'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TEMP</span>
                <span className={keyOn ? 'text-sky-400' : 'text-slate-600'}>
                  {keyOn ? '65°C OK' : 'OFF'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setClusterChecked(true)}
              disabled={!keyOn}
              className={`w-full py-2.5 rounded-lg text-xs font-bold border transition disabled:opacity-40 ${
                clusterChecked && keyOn
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500'
              }`}
            >
              {clusterChecked && keyOn ? '✓ 계기판 정상 확인 완료' : '계기판 경고등 및 게이지 확인'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleFinish}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition"
        >
          다음 단계: 시동 · 주행 · 주정차 (19점) →
        </button>
      </div>
    </div>
  );
};
