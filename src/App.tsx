import { useState, useEffect } from 'react';
import {
  FileText,
  Gamepad2,
  Award,
  CheckCircle2,
  XCircle,
  User,
  History,
  Plane,
  Download,
} from 'lucide-react';
import type { ExamineeInfo, ExamType, PracticalExamResult, WrittenExamResult } from './types';
import { WrittenExam } from './components/WrittenExam';
import { PracticalSimulation } from './components/PracticalSimulation';
import { loadPracticalHistory, loadWrittenHistory } from './utils/grading';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type ActiveMode =
  | { type: 'home' }
  | { type: 'written'; examType: ExamType }
  | { type: 'practical' };

export function App() {
  const [mode, setMode] = useState<ActiveMode>({ type: 'home' });
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };
  const [examinee, setExaminee] = useState<ExamineeInfo>({
    date: new Date().toISOString().slice(0, 10),
    department: '',
    rank: '',
    name: '',
    employeeId: '',
  });

  const [writtenHistory, setWrittenHistory] = useState<WrittenExamResult[]>(() =>
    loadWrittenHistory()
  );
  const [practicalHistory, setPracticalHistory] = useState<PracticalExamResult[]>(() =>
    loadPracticalHistory()
  );

  if (mode.type === 'written') {
    return (
      <div className="min-h-screen bg-slate-50">
        <WrittenExam
          examType={mode.examType}
          examinee={examinee}
          onExit={() => setMode({ type: 'home' })}
          onComplete={() => setWrittenHistory(loadWrittenHistory())}
        />
      </div>
    );
  }

  if (mode.type === 'practical') {
    return (
      <div className="min-h-screen bg-slate-50">
        <PracticalSimulation
          examinee={examinee}
          onExit={() => setMode({ type: 'home' })}
          onComplete={() => setPracticalHistory(loadPracticalHistory())}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 상단 헤더 */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-md">
              <Plane className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                공항 이동지역 지상조업 · GSE 운전 평가
              </span>
              <h1 className="text-2xl font-black tracking-tight">
                소형운전업무 필기 · 실기 시뮬레이션 평가
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                모바일 앱 설치
              </button>
            )}
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>
                합격 기준: <strong className="text-emerald-400">90점 이상 합격</strong> / 90점 미만 불합격
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* 응시자 정보 입력 */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-900">응시자 정보 입력 (답안지 및 실기 Check List 반영)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">평가일자</label>
              <input
                type="date"
                value={examinee.date}
                onChange={(e) => setExaminee({ ...examinee, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">소속</label>
              <input
                type="text"
                placeholder="예: 지상조업팀"
                value={examinee.department}
                onChange={(e) => setExaminee({ ...examinee, department: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">직급</label>
              <input
                type="text"
                placeholder="예: 사원 / 주임"
                value={examinee.rank}
                onChange={(e) => setExaminee({ ...examinee, rank: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">성명</label>
              <input
                type="text"
                placeholder="홍길동"
                value={examinee.name}
                onChange={(e) => setExaminee({ ...examinee, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">사번</label>
              <input
                type="text"
                placeholder="예: 2026001"
                value={examinee.employeeId}
                onChange={(e) => setExaminee({ ...examinee, employeeId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* 평가 모드 선택 카드 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 필기 A형 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="w-6 h-6" />
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  50문항 · 100점
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">필기평가 A형</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                객관식 40문항 + 주관식 10문항(문 41~50). 즉시 해설 모드 및 오답 다시 풀기를 지원합니다.
              </p>
            </div>
            <button
              onClick={() => setMode({ type: 'written', examType: 'A' })}
              className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition"
            >
              A형 필기평가 시작하기 →
            </button>
          </div>

          {/* 필기 B형 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-sky-400 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
                  <FileText className="w-6 h-6" />
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-700">
                  50문항 · 100점
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">필기평가 B형</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                B형 답안지 50문항(객관식 40 + 주관식 10). 90점 이상 합격, 90점 미만 불합격으로 채점됩니다.
              </p>
            </div>
            <button
              onClick={() => setMode({ type: 'written', examType: 'B' })}
              className="mt-6 w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition"
            >
              B형 필기평가 시작하기 →
            </button>
          </div>

          {/* 실기평가 시뮬레이션 */}
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-md flex flex-col justify-between hover:border-amber-400 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Gamepad2 className="w-6 h-6" />
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-slate-950">
                  시뮬레이션 · 100점
                </span>
              </div>
              <h3 className="text-xl font-extrabold">실기평가 시뮬레이션</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                장비 외부/내부/전기계통 점검, 2D 주행·주차, Dolly 정밀 접현·연결 및 돌발상황 대처를 직접 조작해 평가합니다.
              </p>
            </div>
            <button
              onClick={() => setMode({ type: 'practical' })}
              className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition"
            >
              실기 시뮬레이션 시작하기 →
            </button>
          </div>
        </section>

        {/* 최근 응시 기록 */}
        {(writtenHistory.length > 0 || practicalHistory.length > 0) && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-600" /> 최근 평가 응시 기록
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {writtenHistory.slice(0, 4).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    {rec.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        필기평가 {rec.examType}형 · {rec.examinee.name || '응시자'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(rec.timestamp).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">{rec.score}점</div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        rec.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {rec.passed ? '합격' : '불합격'}
                    </span>
                  </div>
                </div>
              ))}

              {practicalHistory.slice(0, 4).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    {rec.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        실기 시뮬레이션 · {rec.examinee.name || '응시자'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(rec.timestamp).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">{rec.totalScore}점</div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        rec.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {rec.passed ? '합격' : '불합격'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
