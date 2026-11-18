export type ExamType = 'A' | 'B';

export interface ExamineeInfo {
  date: string;
  department: string;
  rank: string;
  name: string;
  employeeId: string;
}

export interface MultipleChoiceQuestion {
  id: number;
  type: 'choice';
  question: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3; // 0-based index (0 = ①, 1 = ②, 2 = ③, 3 = ④)
  explanation: string;
  category: '이동지역규정' | '저시정절차' | '장비정비' | '안전수칙' | '공항상식';
}

export interface ShortAnswerQuestion {
  id: number;
  type: 'short';
  question: string;
  /** Single answer or multiple blanks (e.g. A형 49번: 전방 200m, 후방 76m) */
  acceptedAnswers: string[][];
  displayAnswer: string;
  placeholder?: string[];
  explanation: string;
  category: '이동지역규정' | '저시정절차' | '장비정비' | '안전수칙' | '공항상식';
}

export type WrittenQuestion = MultipleChoiceQuestion | ShortAnswerQuestion;

export interface WrittenExamResult {
  id: string;
  examType: ExamType;
  examinee: ExamineeInfo;
  score: number;
  totalScore: number;
  passed: boolean; // >= 90
  correctCount: number;
  totalCount: number;
  answers: Record<number, number | string[]>;
  timestamp: string;
}

export interface PracticalCheckItem {
  id: string;
  majorCategory: string;
  subCategory: string;
  label: string;
  maxScore: number;
}

export interface PracticalItemScore {
  itemId: string;
  earned: number;
  maxScore: number;
  passed: boolean;
  note?: string;
}

export interface PracticalExamResult {
  id: string;
  examinee: ExamineeInfo;
  totalScore: number;
  passed: boolean; // >= 90
  itemScores: Record<string, PracticalItemScore>;
  timestamp: string;
  comment: string;
}

