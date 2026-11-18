import React, { useState } from 'react';
import { ArrowLeft, Award, AlertTriangle, RotateCcw, ClipboardList } from 'lucide-react';
import type { PracticalExamResult, PracticalItemScore } from '../types';
import { PRACTICAL_CHECKLIST, PASSING_SCORE } from '../data/practicalChecklist';
import { savePracticalHistory } from '../utils/grading';
import { Stage1Attitude } from './practical/Stage1Attitude';
import { Stage2External } from './practical/Stage2External';
import { Stage3Internal } from './practical/Stage3Internal';
import { Stage4Electrical } from './practical/Stage4Electrical';
import { Stage5Driving } from './practical/Stage5Driving';
import { Stage6Dolly } from './practical/Stage6Dolly';
import { Stage7Emergency } from './practical/Stage7Emergency';

interface PracticalSimulationProps {
  onExit: () => void;
  onComplete: (result: PracticalExamResult) => void;
}

const STAGE_TITLES = [
  '1. 응시태도 (3점)',
  '2. 외부점검 (15점)',
  '3. 내부점검 (20점)',
  '4. 전기계통 (9점)',
  '5. 시동·주행·주차 (19점)',
  '6. Dolly 견인 (25점)',
  '7. 대처능력 (9점)',
];

export const PracticalSimulation: React.FC<PracticalSimulationProps> = ({
  onExit,
  onComplete,
}) => {
  const [stage, setStage] = useState<number>(1);
  const [itemScores, setItemScores] = useState<Record<string, PracticalItemScore>>({});
  const [finalResult, setFinalResult] = useState<PracticalExamResult | null>(null);

  const currentScore = Object.values(itemScores).reduce((sum, s) => sum + s.earned, 0);

  const handleStageComplete = (partial: Record<string, PracticalItemScore>) => {
    const merged = { ...itemScores, ...partial };
    setItemScores(merged);

    if (stage < 7) {
      setStage(stage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const totalScore = Object.values(merged).reduce((sum, s) => sum + s.earned, 0);
      const passed = totalScore >= PASSING_SCORE;
      const result: PracticalExamResult = {
        id: `practical-${Date.now()}`,
        totalScore,
        passed,
        itemScores: merged,
        timestamp: new Date().toISOString(),
        comment: passed
          ? '전반적인 장비 점검, 주행·주차 및 Dolly 견인 절차가 우수하며 합격 기준(90점 이상)을 충족함.'
          : '일부 점검 절차 또는 주행/견인 정확도가 부족하여 불합격(90점 미만). 감점 항목 재숙지 필요.',
      };
      setFinalResult(result);
      savePracticalHistory(result);
      onComplete(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setStage(1);
    setItemScores({});
    setFinalResult(null);
  };

  if (finalResult) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> 메인으로 돌아가기
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-semibold"
          >
            <RotateCcw className="w-4 h-4" /> 실기 시뮬레이션 다시 하기
          </button>
        </div>

        {/* 합격 / 불합격 배너 */}
        <div
          className={`rounded-2xl border-2 p-6 md:p-8 shadow-sm ${
            finalResult.passed
              ? 'bg-emerald-50/90 border-emerald-400'
              : 'bg-rose-50/90 border-rose-400'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`p-3.5 rounded-2xl ${
                  finalResult.passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {finalResult.passed ? (
                  <Award className="w-9 h-9" />
                ) : (
                  <AlertTriangle className="w-9 h-9" />
                )}
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    finalResult.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {finalResult.passed ? '실기평가 합격 (PASS)' : '실기평가 불합격 (FAIL)'}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
                  {finalResult.passed
                    ? '축하합니다! 실기평가 합격 기준(90점 이상)을 달성했습니다.'
                    : '불합격입니다. 합격 기준(90점 이상)에 미달했습니다.'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{finalResult.comment}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl px-6 py-4 border border-slate-200 text-center shrink-0">
              <div className="text-xs font-semibold text-slate-500">실기 총점</div>
              <div
                className={`text-4xl font-black ${
                  finalResult.passed ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {finalResult.totalScore}
                <span className="text-lg font-bold text-slate-400"> / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* 원본 Check List 양식 결과표 */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
          <div className="bg-slate-100 px-6 py-4 border-b border-slate-300 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              소형운전업무실기평가 Check List 성적표
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-300 text-slate-700">
                  <th className="py-2.5 px-3 text-left border-r border-slate-200">항목</th>
                  <th className="py-2.5 px-3 text-left border-r border-slate-200">구분</th>
                  <th className="py-2.5 px-3 text-left border-r border-slate-200">세부 Test 항목</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-200">배점</th>
                  <th className="py-2.5 px-2 text-center border-r border-slate-200">Yes/No</th>
                  <th className="py-2.5 px-2 text-center">획득점수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {PRACTICAL_CHECKLIST.map((item) => {
                  const rec = finalResult.itemScores[item.id];
                  const earned = rec?.earned ?? 0;
                  const full = earned === item.maxScore;
                  return (
                    <tr key={item.id} className={full ? 'bg-white' : 'bg-rose-50/40'}>
                      <td className="py-2 px-3 font-semibold text-slate-700 border-r border-slate-200">
                        {item.majorCategory}
                      </td>
                      <td className="py-2 px-3 text-slate-600 border-r border-slate-200">
                        {item.subCategory}
                      </td>
                      <td className="py-2 px-3 text-slate-800 border-r border-slate-200">
                        <div>{item.label}</div>
                        {rec?.note && (
                          <div className="text-[11px] text-slate-500 mt-0.5">({rec.note})</div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center font-semibold text-slate-600 border-r border-slate-200">
                        {item.maxScore}
                      </td>
                      <td className="py-2 px-2 text-center font-bold border-r border-slate-200">
                        {full ? (
                          <span className="text-emerald-600">Yes</span>
                        ) : (
                          <span className="text-rose-600">No</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center font-extrabold text-slate-900">
                        {earned}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-extrabold">
                  <td colSpan={3} className="py-3 px-4 text-right text-slate-800">
                    총점 (합격기준: 90점 이상)
                  </td>
                  <td className="py-3 px-2 text-center text-slate-700">100</td>
                  <td className="py-3 px-2 text-center">
                    <span className={finalResult.passed ? 'text-emerald-600' : 'text-rose-600'}>
                      {finalResult.passed ? '합격' : '불합격'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-lg text-indigo-700">
                    {finalResult.totalScore}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* 상단 진행 바 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> 나가기
          </button>
          <div className="text-sm font-bold text-slate-800">
            소형운전업무 실기평가 시뮬레이터 · 누적 점수:{' '}
            <span className="text-indigo-600">{currentScore}</span> / 100점
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {STAGE_TITLES.map((title, idx) => {
            const sNum = idx + 1;
            const active = sNum === stage;
            const done = sNum < stage;
            return (
              <div
                key={title}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold text-center border ${
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : done
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                {title}
              </div>
            );
          })}
        </div>
      </div>

      {stage === 1 && <Stage1Attitude onComplete={handleStageComplete} />}
      {stage === 2 && <Stage2External onComplete={handleStageComplete} />}
      {stage === 3 && <Stage3Internal onComplete={handleStageComplete} />}
      {stage === 4 && <Stage4Electrical onComplete={handleStageComplete} />}
      {stage === 5 && <Stage5Driving onComplete={handleStageComplete} />}
      {stage === 6 && <Stage6Dolly onComplete={handleStageComplete} />}
      {stage === 7 && <Stage7Emergency onComplete={handleStageComplete} />}
    </div>
  );
};
