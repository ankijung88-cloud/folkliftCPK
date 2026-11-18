import React, { useState } from 'react';
import { Cpu, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { PracticalItemScore } from '../../types';

interface Stage3Props {
  onComplete: (scores: Record<string, PracticalItemScore>) => void;
}

export const Stage3Internal: React.FC<Stage3Props> = ({ onComplete }) => {
  const [hoodOpen, setHoodOpen] = useState(false);
  const [propRodLocked, setPropRodLocked] = useState(false);
  const [hoodClosedConfirmed, setHoodClosedConfirmed] = useState(false);
  const [safetyViolation, setSafetyViolation] = useState(false);

  // 오일 4종 + 딥스틱 판별
  const [oils, setOils] = useState({
    engine: false,
    brake: false,
    power: false,
    mission: false,
  });
  const [dipstickAnswer, setDipstickAnswer] = useState<'low' | 'mid' | 'over' | null>(null);

  // 나머지 내부 점검 항목
  const [fuseChecked, setFuseChecked] = useState(false);
  const [beltChecked, setBeltChecked] = useState(false);
  const [hoseChecked, setHoseChecked] = useState(false);
  const [batteryChecked, setBatteryChecked] = useState(false);
  const [coolantChecked, setCoolantChecked] = useState(false);
  const [coolantRuleAnswer, setCoolantRuleAnswer] = useState<'cold' | 'hot' | null>(null);

  const checkPropGuard = () => {
    if (!propRodLocked) {
      setSafetyViolation(true);
    }
  };

  const oilCount = Object.values(oils).filter(Boolean).length;
  const oilScore = Math.min(5, oilCount + (dipstickAnswer === 'mid' ? 1 : 0));
  const safetyScore =
    (propRodLocked ? 3 : 0) +
    (hoodClosedConfirmed ? 2 : 0) -
    (safetyViolation && propRodLocked ? 1 : 0);
  const clampedSafety = Math.max(0, safetyScore);
  const coolantScore = (coolantChecked ? 1 : 0) + (coolantRuleAnswer === 'cold' ? 1 : 0);

  const totalEarned =
    clampedSafety +
    oilScore +
    (fuseChecked ? 2 : 0) +
    (beltChecked ? 2 : 0) +
    (hoseChecked ? 2 : 0) +
    (batteryChecked ? 2 : 0) +
    coolantScore;

  const handleFinish = () => {
    onComplete({
      'int-safety': {
        itemId: 'int-safety',
        earned: clampedSafety,
        maxScore: 5,
        passed: clampedSafety === 5,
        note: !propRodLocked
          ? '엔진덮개 지지대 미고정'
          : !hoodClosedConfirmed
          ? '점검 후 덮개 닫힘 미확인'
          : safetyViolation
          ? '지지대 고정 전 내부 점검 감점(-1)'
          : '지지대 고정 및 닫힘 확인 완료',
      },
      'int-oil': {
        itemId: 'int-oil',
        earned: oilScore,
        maxScore: 5,
        passed: oilScore === 5,
        note: `오일 ${oilCount}/4 점검, 딥스틱 ${dipstickAnswer === 'mid' ? '적정' : '오판/미확인'}`,
      },
      'int-fuse': {
        itemId: 'int-fuse',
        earned: fuseChecked ? 2 : 0,
        maxScore: 2,
        passed: fuseChecked,
      },
      'int-belt': {
        itemId: 'int-belt',
        earned: beltChecked ? 2 : 0,
        maxScore: 2,
        passed: beltChecked,
      },
      'int-hose': {
        itemId: 'int-hose',
        earned: hoseChecked ? 2 : 0,
        maxScore: 2,
        passed: hoseChecked,
      },
      'int-battery': {
        itemId: 'int-battery',
        earned: batteryChecked ? 2 : 0,
        maxScore: 2,
        passed: batteryChecked,
      },
      'int-coolant': {
        itemId: 'int-coolant',
        earned: coolantScore,
        maxScore: 2,
        passed: coolantScore === 2,
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Stage 3 / 7 · 장비 일반점검 - 내부점검 (20점)
          </span>
          <h2 className="text-xl font-bold mt-1">엔진룸 내부 점검 시뮬레이션</h2>
          <p className="text-xs text-slate-300 mt-1">
            ① 본넷 열기 → ② <strong>지지대 고정</strong> → ③ 각 계통 점검 → ④ <strong>덮개 닫힘 확인</strong> 순으로 진행하세요.
          </p>
        </div>
        <Cpu className="w-10 h-10 text-amber-400 shrink-0" />
      </div>

      {safetyViolation && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          경고: 엔진덮개 지지대를 고정하지 않고 내부를 점검하여 안전 점수에서 1점 감점되었습니다!
        </div>
      )}

      {/* 상단: 엔진덮개 제어 바 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setHoodOpen(true);
              setHoodClosedConfirmed(false);
            }}
            disabled={hoodOpen}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              hoodOpen
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {hoodOpen ? '✓ 1. 엔진덮개 열림' : '1. 엔진덮개(본넷) 열기'}
          </button>

          <button
            onClick={() => setPropRodLocked(true)}
            disabled={!hoodOpen || propRodLocked}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition disabled:opacity-40 ${
              propRodLocked
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {propRodLocked ? '✓ 2. 지지대 고정 완료' : '2. 엔진덮개 지지대 고정'}
          </button>

          <button
            onClick={() => {
              setHoodOpen(false);
              setHoodClosedConfirmed(true);
            }}
            disabled={!propRodLocked}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition disabled:opacity-40 ${
              hoodClosedConfirmed
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-slate-800 border-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {hoodClosedConfirmed ? '✓ 3. 점검 후 덮개 닫힘 확인' : '3. 점검 완료 후 덮개 닫기'}
          </button>
        </div>

        <div className="text-sm font-bold text-slate-700">
          현재 점수: <span className="text-indigo-600">{totalEarned}</span> / 20점
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5 ${!hoodOpen ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* 좌측: 4종 오일 + 딥스틱 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">각종 오일 점검 및 딥스틱 판별 (5점)</h3>
            <span className="text-xs font-bold text-indigo-600">{oilScore}/5점</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'engine' as const, label: '엔진 오일' },
              { key: 'brake' as const, label: '브레이크 오일' },
              { key: 'power' as const, label: '파워스티어링 오일' },
              { key: 'mission' as const, label: '미션(변속기) 오일' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  checkPropGuard();
                  setOils((p) => ({ ...p, [item.key]: true }));
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
                  oils[item.key]
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                }`}
              >
                {oils[item.key] ? `✓ ${item.label} 점검` : item.label}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-slate-700">
              시뮬레이션 확인: 엔진 윤활유 딥스틱(Dipstick)의 적정 오일량 수준은?
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'low' as const, label: 'L 표시 아래' },
                { val: 'mid' as const, label: 'L ~ F 표시 사이' },
                { val: 'over' as const, label: 'F 표시 위 초과' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => {
                    checkPropGuard();
                    setDipstickAnswer(opt.val);
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold border transition ${
                    dipstickAnswer === opt.val
                      ? opt.val === 'mid'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 퓨즈, 팬벨트, 배선/호스, 배터리, 냉각계통 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <h3 className="font-bold text-slate-900">엔진룸 세부 장치 점검 (10점)</h3>

          {[
            {
              done: fuseChecked,
              onClick: () => {
                checkPropGuard();
                setFuseChecked(true);
              },
              label: '퓨즈박스 점검 (배선정렬, 장착 상태 확인)',
              pts: 2,
            },
            {
              done: beltChecked,
              onClick: () => {
                checkPropGuard();
                setBeltChecked(true);
              },
              label: '팬벨트 점검 (마모, 장력, 균열 여부 확인)',
              pts: 2,
            },
            {
              done: hoseChecked,
              onClick: () => {
                checkPropGuard();
                setHoseChecked(true);
              },
              label: '내부 배선 및 각종 호스 정렬/노후 상태 확인',
              pts: 2,
            },
            {
              done: batteryChecked,
              onClick: () => {
                checkPropGuard();
                setBatteryChecked(true);
              },
              label: '배터리 단자 위치(+/-), 용량, 고정상태 점검',
              pts: 2,
            },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.onClick}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
                item.done
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
              }`}
            >
              <span>{item.done ? `✓ ${item.label}` : item.label}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                {item.pts}점
              </span>
            </button>
          ))}

          {/* 냉각계통 */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  checkPropGuard();
                  setCoolantChecked(true);
                }}
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  coolantChecked ? 'text-emerald-700' : 'text-indigo-700 underline'
                }`}
              >
                {coolantChecked && <CheckCircle2 className="w-4 h-4" />}
                냉각수 보조탱크 수위 확인하기 (클릭)
              </button>
              <span className="text-[11px] font-bold text-slate-500">2점</span>
            </div>
            <div className="text-xs text-slate-600">냉각수 점검 시 올바른 엔진 온도 조건은?</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  checkPropGuard();
                  setCoolantRuleAnswer('cold');
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold border ${
                  coolantRuleAnswer === 'cold'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                엔진이 차가울 때 점검
              </button>
              <button
                onClick={() => {
                  checkPropGuard();
                  setCoolantRuleAnswer('hot');
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold border ${
                  coolantRuleAnswer === 'hot'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                주행 직후 뜨거울 때 점검
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleFinish}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition"
        >
          다음 단계: 전기계통 점검 (9점) →
        </button>
      </div>
    </div>
  );
};
