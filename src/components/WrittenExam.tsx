import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Award,
  AlertTriangle,
  BookOpen,
  ClipboardCheck,
  Filter,
} from 'lucide-react';
import type { ExamType, ExamineeInfo, WrittenExamResult, WrittenQuestion } from '../types';
import { EXAM_A_QUESTIONS, EXAM_B_QUESTIONS } from '../data/writtenQuestions';
import { gradeWrittenExam, isQuestionCorrect, saveWrittenHistory } from '../utils/grading';

interface WrittenExamProps {
  examType: ExamType;
  examinee: ExamineeInfo;
  onExit: () => void;
  onComplete: (result: WrittenExamResult) => void;
}

const CIRCLED_NUMS = ['①', '②', '③', '④'] as const;

export const WrittenExam: React.FC<WrittenExamProps> = ({
  examType,
  examinee,
  onExit,
  onComplete,
}) => {
  const baseQuestions = examType === 'A' ? EXAM_A_QUESTIONS : EXAM_B_QUESTIONS;

  const [studyMode, setStudyMode] = useState<boolean>(false); // 즉시 정답/해설 보기 모드
  const [retryWrongOnly, setRetryWrongOnly] = useState<boolean>(false);
  const [activeQuestions, setActiveQuestions] = useState<WrittenQuestion[]>(baseQuestions);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number | string[]>>({});
  const [submittedResult, setSubmittedResult] = useState<WrittenExamResult | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'wrong'>('all');

  const currentQuestion = activeQuestions[currentIdx];

  const answeredCount = useMemo(() => {
    return activeQuestions.filter((q) => {
      const a = answers[q.id];
      if (q.type === 'choice') return typeof a === 'number';
      return Array.isArray(a) && a.some((v) => v.trim().length > 0);
    }).length;
  }, [activeQuestions, answers]);

  const handleSelectChoice = (qId: number, optionIdx: number) => {
    if (submittedResult) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleShortChange = (qId: number, blankIdx: number, value: string, totalBlanks: number) => {
    if (submittedResult) return;
    setAnswers((prev) => {
      const existing = Array.isArray(prev[qId]) ? [...(prev[qId] as string[])] : Array(totalBlanks).fill('');
      existing[blankIdx] = value;
      return { ...prev, [qId]: existing };
    });
  };

  const handleSubmit = () => {
    const unanswered = activeQuestions.length - answeredCount;
    if (
      unanswered > 0 &&
      !window.confirm(`아직 풀지 않은 문항이 ${unanswered}개 있습니다. 그래도 제출하시겠습니까?`)
    ) {
      return;
    }
    const graded = gradeWrittenExam(activeQuestions, answers);
    const result: WrittenExamResult = {
      id: `written-${Date.now()}`,
      examType,
      examinee,
      score: graded.score,
      totalScore: graded.totalScore,
      passed: graded.passed,
      correctCount: graded.correctCount,
      totalCount: activeQuestions.length,
      answers,
      timestamp: new Date().toISOString(),
    };
    setSubmittedResult(result);
    if (!retryWrongOnly) {
      saveWrittenHistory(result);
      onComplete(result);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryWrong = () => {
    const wrongQuestions = activeQuestions.filter((q) => !isQuestionCorrect(q, answers[q.id]));
    if (wrongQuestions.length === 0) return;
    setRetryWrongOnly(true);
    setActiveQuestions(wrongQuestions);
    setAnswers({});
    setCurrentIdx(0);
    setSubmittedResult(null);
    setFilterMode('all');
  };

  const handleResetAll = () => {
    setRetryWrongOnly(false);
    setActiveQuestions(baseQuestions);
    setAnswers({});
    setCurrentIdx(0);
    setSubmittedResult(null);
    setFilterMode('all');
  };

  // 결과 화면
  if (submittedResult) {
    const filteredQuestions =
      filterMode === 'wrong'
        ? activeQuestions.filter((q) => !isQuestionCorrect(q, answers[q.id]))
        : activeQuestions;

    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> 메인으로 돌아가기
          </button>
          <div className="flex items-center gap-2">
            {!submittedResult.passed && (
              <button
                onClick={handleRetryWrong}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-sm font-semibold"
              >
                <RotateCcw className="w-4 h-4" /> 틀린 문제만 다시 풀기
              </button>
            )}
            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4" /> 전체 다시 응시
            </button>
          </div>
        </div>

        {/* 합격 / 불합격 판정 카드 */}
        <div
          className={`rounded-2xl border-2 p-6 md:p-8 shadow-sm ${
            submittedResult.passed
              ? 'bg-emerald-50/80 border-emerald-400'
              : 'bg-rose-50/80 border-rose-400'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`p-3.5 rounded-2xl ${
                  submittedResult.passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {submittedResult.passed ? (
                  <Award className="w-9 h-9" />
                ) : (
                  <AlertTriangle className="w-9 h-9" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold tracking-wide ${
                      submittedResult.passed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {submittedResult.passed ? '합격 (PASS)' : '불합격 (FAIL)'}
                  </span>
                  <span className="text-sm font-medium text-slate-600">
                    소형운전업무 필기평가 {examType}형 {retryWrongOnly ? '(오답 복습)' : ''}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
                  {submittedResult.passed
                    ? '축하합니다! 합격 기준(90점 이상)을 통과했습니다.'
                    : '아쉽습니다. 합격 기준(90점 이상)에 미달하여 불합격입니다.'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  응시자: {examinee.name || '미입력'} ({examinee.department || '소속 미입력'} ·{' '}
                  {examinee.rank || '직급 미입력'}) | 평가일자: {examinee.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-white/90 rounded-xl px-6 py-4 border border-slate-200 shrink-0">
              <div className="text-center">
                <div className="text-xs font-semibold text-slate-500">최종 점수</div>
                <div
                  className={`text-4xl font-black ${
                    submittedResult.passed ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {submittedResult.score}
                  <span className="text-lg font-bold text-slate-400"> / 100</span>
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="text-center">
                <div className="text-xs font-semibold text-slate-500">정답 문항</div>
                <div className="text-2xl font-bold text-slate-800">
                  {submittedResult.correctCount}
                  <span className="text-sm font-medium text-slate-400">
                    {' '}
                    / {submittedResult.totalCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 문항별 채점 리뷰 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
              문항별 채점 결과 및 해설
            </h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  filterMode === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
              >
                전체 ({activeQuestions.length})
              </button>
              <button
                onClick={() => setFilterMode('wrong')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  filterMode === 'wrong'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
              >
                오답만 ({activeQuestions.length - submittedResult.correctCount})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                틀린 문항이 없습니다! 완벽합니다.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const userAns = answers[q.id];
                const correct = isQuestionCorrect(q, userAns);
                return (
                  <div key={q.id} className="p-5 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {correct ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 mr-2">
                            {q.category}
                          </span>
                          <span className="font-bold text-slate-900">
                            문 {q.id}) {q.question}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                          correct
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {correct ? '정답' : '오답'}
                      </span>
                    </div>

                    {q.type === 'choice' ? (
                      <div className="pl-7 grid grid-cols-1 md:grid-cols-2 gap-1.5 text-sm">
                        {q.options.map((opt, idx) => {
                          const isAns = idx === q.answerIndex;
                          const isUser = userAns === idx;
                          return (
                            <div
                              key={idx}
                              className={`px-3 py-1.5 rounded-lg border ${
                                isAns
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                                  : isUser
                                  ? 'bg-rose-50 border-rose-400 text-rose-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              {CIRCLED_NUMS[idx]} {opt}
                              {isAns && ' (정답)'}
                              {isUser && !isAns && ' (내 선택)'}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="pl-7 text-sm space-y-1">
                        <div>
                          <span className="text-slate-500">내 답안: </span>
                          <span className={correct ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                            {Array.isArray(userAns) && userAns.some((v) => v.trim())
                              ? userAns.join(', ')
                              : '(미입력)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">정답: </span>
                          <span className="text-emerald-700 font-bold">{q.displayAnswer}</span>
                        </div>
                      </div>
                    )}

                    <div className="pl-7 text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                      <span className="font-semibold text-slate-700">해설: </span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // 응시 화면
  const userAns = answers[currentQuestion.id];
  const hasAnsweredCurrent =
    currentQuestion.type === 'choice'
      ? typeof userAns === 'number'
      : Array.isArray(userAns) && userAns.some((v) => v.trim().length > 0);
  const isCurrentCorrect = isQuestionCorrect(currentQuestion, userAns);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* 상단 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            title="나가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">
              소형운전업무 필기평가 {examType}형 답안지
              {retryWrongOnly && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  오답 재응시
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">
              합격 기준: 90점 이상 (총 {activeQuestions.length}문항 · 문항당{' '}
              {Math.round(100 / activeQuestions.length)}점)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setStudyMode((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              studyMode
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {studyMode ? '즉시 해설 ON' : '즉시 해설 OFF'}
          </button>
          <div className="text-sm font-bold text-slate-700">
            진행: <span className="text-indigo-600">{answeredCount}</span> / {activeQuestions.length}
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm transition"
          >
            답안 제출 및 채점
          </button>
        </div>
      </div>

      {/* 실제 답안지 응시자 정보 바 */}
      <div className="bg-white rounded-xl border border-slate-300 overflow-hidden text-xs">
        <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-y md:divide-y-0 divide-slate-300 text-center">
          <div className="p-2 bg-slate-100 font-bold text-slate-700">
            평가일자: <span className="font-normal text-slate-900">{examinee.date}</span>
          </div>
          <div className="p-2 bg-slate-50 font-bold text-slate-700">
            소속: <span className="font-normal text-slate-900">{examinee.department || '-'}</span>
          </div>
          <div className="p-2 bg-slate-50 font-bold text-slate-700">
            직급: <span className="font-normal text-slate-900">{examinee.rank || '-'}</span>
          </div>
          <div className="p-2 bg-slate-50 font-bold text-slate-700">
            성명: <span className="font-normal text-slate-900">{examinee.name || '응시자'}</span>
          </div>
          <div className="p-2 bg-slate-50 font-bold text-slate-700">
            사번: <span className="font-normal text-slate-900">{examinee.employeeId || '-'}</span>
          </div>
          <div className="p-2 bg-slate-100 font-bold text-slate-700">
            합격기준: <span className="text-emerald-700">90점 이상</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 좌측: 문제 풀이 영역 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between min-h-105">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                {currentQuestion.category} · {currentQuestion.type === 'choice' ? '객관식' : '주관식'}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {currentIdx + 1} / {activeQuestions.length}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 leading-relaxed">
              <span className="text-indigo-600 mr-2">문 {currentQuestion.id})</span>
              {currentQuestion.question}
            </h2>

            {currentQuestion.type === 'choice' ? (
              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  const selected = userAns === idx;
                  const showFeedback = studyMode && hasAnsweredCurrent;
                  const isAnswer = idx === currentQuestion.answerIndex;

                  let styleClass = 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-800';
                  if (showFeedback) {
                    if (isAnswer) {
                      styleClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                    } else if (selected) {
                      styleClass = 'border-rose-500 bg-rose-50 text-rose-900';
                    }
                  } else if (selected) {
                    styleClass = 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold ring-2 ring-indigo-200';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectChoice(currentQuestion.id, idx)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition flex items-center gap-3 ${styleClass}`}
                    >
                      <span className="text-lg font-bold shrink-0">{CIRCLED_NUMS[idx]}</span>
                      <span className="text-sm md:text-base">{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {currentQuestion.acceptedAnswers.map((_, blankIdx) => {
                  const val = Array.isArray(userAns) ? userAns[blankIdx] ?? '' : '';
                  return (
                    <div key={blankIdx} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-600">
                        {currentQuestion.acceptedAnswers.length > 1
                          ? `빈칸 ${blankIdx + 1}`
                          : '정답 입력'}
                      </label>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) =>
                          handleShortChange(
                            currentQuestion.id,
                            blankIdx,
                            e.target.value,
                            currentQuestion.acceptedAnswers.length
                          )
                        }
                        placeholder={currentQuestion.placeholder?.[blankIdx] ?? '정답을 입력하세요'}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-base font-semibold text-slate-900"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* 즉시 해설 모드 피드백 */}
            {studyMode && hasAnsweredCurrent && (
              <div
                className={`p-4 rounded-xl border text-sm ${
                  isCurrentCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="font-bold mb-1">
                  {isCurrentCorrect
                    ? '정답입니다!'
                    : `오답입니다. 정답: ${
                        currentQuestion.type === 'choice'
                          ? `${CIRCLED_NUMS[currentQuestion.answerIndex]} ${
                              currentQuestion.options[currentQuestion.answerIndex]
                            }`
                          : currentQuestion.displayAnswer
                      }`}
                </div>
                <p className="text-xs opacity-90">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" /> 이전 문항
            </button>
            {currentIdx < activeQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((i) => Math.min(activeQuestions.length - 1, i + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
              >
                다음 문항 <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700"
              >
                채점하기 <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 우측: OMR 네비게이터 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-fit">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-800">문항 빠른 이동 (OMR)</h3>
            <span className="text-xs text-slate-500">
              {answeredCount}/{activeQuestions.length} 완료
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {activeQuestions.map((q, idx) => {
              const a = answers[q.id];
              const filled =
                q.type === 'choice'
                  ? typeof a === 'number'
                  : Array.isArray(a) && a.some((v) => v.trim().length > 0);
              const isActive = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`py-2 rounded-lg text-xs font-bold transition border ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                      : filled
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {q.id}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-200 inline-block" /> 입력완료
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-200 inline-block" /> 미입력
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block" /> 현재문항
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
