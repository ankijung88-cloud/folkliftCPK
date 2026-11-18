import type { WrittenQuestion, WrittenExamResult, PracticalExamResult } from '../types';
import { PASSING_SCORE } from '../data/practicalChecklist';

export function normalizeShortAnswer(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\s.·,_()-]/g, '')
    .trim();
}

export function isShortAnswerCorrect(
  question: Extract<WrittenQuestion, { type: 'short' }>,
  userAnswers: string[] | undefined
): boolean {
  if (!userAnswers || userAnswers.length < question.acceptedAnswers.length) {
    return false;
  }
  return question.acceptedAnswers.every((acceptedList, idx) => {
    const userVal = normalizeShortAnswer(userAnswers[idx] ?? '');
    if (!userVal) return false;
    return acceptedList.some((acc) => normalizeShortAnswer(acc) === userVal);
  });
}

export function isQuestionCorrect(
  question: WrittenQuestion,
  userAnswer: number | string[] | undefined
): boolean {
  if (question.type === 'choice') {
    return typeof userAnswer === 'number' && userAnswer === question.answerIndex;
  }
  return Array.isArray(userAnswer) && isShortAnswerCorrect(question, userAnswer);
}

export function gradeWrittenExam(
  questions: WrittenQuestion[],
  answers: Record<number, number | string[]>
): { score: number; totalScore: number; correctCount: number; passed: boolean } {
  const pointsPerQuestion = 100 / questions.length; // 50문항 -> 문항당 2점
  let correctCount = 0;
  for (const q of questions) {
    if (isQuestionCorrect(q, answers[q.id])) {
      correctCount += 1;
    }
  }
  const score = Math.round(correctCount * pointsPerQuestion);
  return {
    score,
    totalScore: 100,
    correctCount,
    passed: score >= PASSING_SCORE,
  };
}

const WRITTEN_HISTORY_KEY = 'forklift_cpk_written_history_v1';
const PRACTICAL_HISTORY_KEY = 'forklift_cpk_practical_history_v1';

export function loadWrittenHistory(): WrittenExamResult[] {
  try {
    const raw = localStorage.getItem(WRITTEN_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as WrittenExamResult[]) : [];
  } catch {
    return [];
  }
}

export function saveWrittenHistory(result: WrittenExamResult): void {
  const list = loadWrittenHistory();
  const next = [result, ...list].slice(0, 30);
  localStorage.setItem(WRITTEN_HISTORY_KEY, JSON.stringify(next));
}

export function loadPracticalHistory(): PracticalExamResult[] {
  try {
    const raw = localStorage.getItem(PRACTICAL_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as PracticalExamResult[]) : [];
  } catch {
    return [];
  }
}

export function savePracticalHistory(result: PracticalExamResult): void {
  const list = loadPracticalHistory();
  const next = [result, ...list].slice(0, 30);
  localStorage.setItem(PRACTICAL_HISTORY_KEY, JSON.stringify(next));
}
