import React, { useState } from 'react';
import { Flame, AlertOctagon, Wrench, CheckCircle2 } from 'lucide-react';
import type { PracticalItemScore } from '../../types';

interface Stage7Props {
  onComplete: (scores: Record<string, PracticalItemScore>) => void;
}

export const Stage7Emergency: React.FC<Stage7Props> = ({ onComplete }) => {
  // 1. 사고발생시 (3점)
  const [accidentChoices, setAccidentChoices] = useState<string[]>([]);
  // 2. 장비고장시 (3점)
  const [oilLeakMethod, setOilLeakMethod] = useState<'water' | 'rag' | null>(null);
  const [breakdownAction, setBreakdownAction] = useState<'continue' | 'stop' | null>(null);
  // 3. 화재시 소화기 작동법 (3점)
  const [fireStep, setFireStep] = useState<number>(0); // 0 -> 1(핀제거) -> 2(노즐) -> 3(분사) -> 4(보고/보존)

  const toggleAccident = (item: string) => {
    setAccidentChoices((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const accidentCorrectItems = ['초도보고', '현장보존', '주변통제'];
  const accidentWrongSelected = accidentChoices.some((x) => !accidentCorrectItems.includes(x));
  const accidentScore = accidentWrongSelected
    ? Math.max(0, accidentChoices.filter((x) => accidentCorrectItems.includes(x)).length - 1)
    : accidentChoices.filter((x) => accidentCorrectItems.includes(x)).length;

  const breakdownScore =
    (oilLeakMethod === 'rag' ? 2 : 0) + (breakdownAction === 'stop' ? 1 : 0);

  const fireScore = fireStep === 4 ? 3 : fireStep >= 2 ? 2 : fireStep >= 1 ? 1 : 0;

  const handleFinish = () => {
    onComplete({
      'emerg-accident': {
        itemId: 'emerg-accident',
        earned: accidentScore,
        maxScore: 3,
        passed: accidentScore === 3,
        note: accidentScore === 3 ? '초도보고·현장보존·통제 완료' : '일부 절차 누락/오선택',
      },
      'emerg-breakdown': {
        itemId: 'emerg-breakdown',
        earned: breakdownScore,
        maxScore: 3,
        passed: breakdownScore === 3,
        note:
          breakdownScore === 3
            ? '기름걸레/톱밥 제거 및 지정폐기물 보관·정지조치'
            : '고장/누유 대처 미흡',
      },
      'emerg-fire': {
        itemId: 'emerg-fire',
        earned: fireScore,
        maxScore: 3,
        passed: fireScore === 3,
        note: fireScore === 3 ? '소화기 작동 및 선조치 후보고 완료' : '소화 절차 미완료',
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Stage 7 / 7 · 대처능력 (9점)
          </span>
          <h2 className="text-xl font-bold mt-1">돌발 상황 대처능력 시뮬레이션</h2>
          <p className="text-xs text-slate-300 mt-1">
            사고·고장·화재 발생 시 규정된 안전 절차와 소화기 작동법을 수행하세요.
          </p>
        </div>
        <Flame className="w-10 h-10 text-amber-400 shrink-0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. 사고 발생 시 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600" /> 1. 사고발생 시 대처 (3점)
            </h3>
            {accidentScore === 3 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>
          <p className="text-xs text-slate-500">
            이동지역 내 접촉사고 발생 시 반드시 수행해야 할 3가지 핵심 조치를 모두 선택하세요.
          </p>
          <div className="space-y-2">
            {['초도보고', '현장보존', '주변통제', '즉시 차량 이동'].map((opt) => {
              const selected = accidentChoices.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleAccident(opt)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                    selected
                      ? opt === '즉시 차량 이동'
                        ? 'bg-rose-50 border-rose-400 text-rose-800'
                        : 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 hover:bg-indigo-50'
                  }`}
                >
                  {selected ? `✓ ${opt}` : opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 장비 고장 / 누유 시 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-600" /> 2. 고장 · 유류누출 시 (3점)
            </h3>
            {breakdownScore === 3 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">
              장비 유류누유 발생 시 올바른 제거 방법은?
            </div>
            <button
              onClick={() => setOilLeakMethod('rag')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border ${
                oilLeakMethod === 'rag'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              기름걸레/톱밥으로 제거 후 지정폐기물 보관소 보관
            </button>
            <button
              onClick={() => setOilLeakMethod('water')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border ${
                oilLeakMethod === 'water'
                  ? 'bg-rose-50 border-rose-400 text-rose-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              물로 씻어내어 배수로로 흘려보냄
            </button>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700">
              주행 중 이상 징후 발생 시 조치는?
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBreakdownAction('stop')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border ${
                  breakdownAction === 'stop'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                안전정차 후 보고
              </button>
              <button
                onClick={() => setBreakdownAction('continue')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border ${
                  breakdownAction === 'continue'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                작업 후 정비
              </button>
            </div>
          </div>
        </div>

        {/* 3. 장비 화재 시 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-600" /> 3. 장비 화재 시 대처 (3점)
            </h3>
            {fireScore === 3 && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>
          <p className="text-xs text-slate-500">
            소화기 작동법 및 화재 대처 순서를 차례대로 실행하세요. (유류화재 시 물 사용 금지!)
          </p>
          <div className="space-y-2">
            {[
              { step: 1, label: '1. 소화기 안전핀 뽑기' },
              { step: 2, label: '2. 노즐을 화원(불) 방향으로 겨누기' },
              { step: 3, label: '3. 손잡이를 힘껏 움켜쥐고 분사하기' },
              { step: 4, label: '4. 선조치 후 보고 및 현장보존' },
            ].map((item) => {
              const done = fireStep >= item.step;
              const isNext = fireStep === item.step - 1;
              return (
                <button
                  key={item.step}
                  onClick={() => {
                    if (isNext) setFireStep(item.step);
                  }}
                  disabled={!isNext && !done}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                    done
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : isNext
                      ? 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {done ? `✓ ${item.label}` : item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleFinish}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
        >
          실기평가 최종 제출 및 채점 결과 보기 ✓
        </button>
      </div>
    </div>
  );
};
