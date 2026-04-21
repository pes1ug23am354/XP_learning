import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import QuizQuestionCard from '../components/QuizQuestionCard';
import GlassCard from '../components/GlassCard';
import { playFail, playSuccess } from '../utils/sfx';
import { useAuth } from '../context/AuthContext';

export default function TopicQuizPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const [topic, setTopic] = useState(null);
  const [sessionToken, setSessionToken] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());

  const unanswered = useMemo(() => questions.filter((q) => answers[q.questionId] === undefined).length, [questions, answers]);

  const loadTopic = async () => {
    const res = await api.get(`/topics/${topicId}`);
    setTopic(res.data.data);
  };

  const startQuizSession = async () => {
    setLoadingQuiz(true);
    const res = await api.post(`/topics/${topicId}/quiz/start`);
    setSessionToken(res.data.data.sessionToken);
    setQuestions(res.data.data.questions);
    setAnswers({});
    setResult(null);
    setShowModal(false);
    setStartTime(Date.now());
    setLoadingQuiz(false);
  };

  useEffect(() => {
    const boot = async () => {
      await loadTopic();
      await startQuizSession();
    };
    boot();
  }, [topicId]);

  const submit = async () => {
    if (!topic || unanswered) return;

    const payload = {
      sessionToken,
      durationSec: Math.floor((Date.now() - startTime) / 1000),
      answers: questions.map((q) => ({
        questionId: q.questionId,
        selectedIndex: answers[q.questionId],
      })),
    };

    const res = await api.post(`/topics/${topicId}/quiz`, payload);
    const data = res.data.data;
    setResult(data);
    setShowModal(true);

    if (data.passed) playSuccess();
    else playFail();

    await refreshMe();
  };

  const continueNext = async () => {
    if (!topic || !result?.passed) return;

    const mapRes = await api.get(`/subjects/${topic.subjectId}/map`);
    const chapters = mapRes.data.data.chapters;
    let nextTopicId = null;

    for (const chapter of chapters) {
      const next = chapter.topics.find((t) => t.unlocked && !t.completed);
      if (next) {
        nextTopicId = next.id;
        break;
      }
    }

    setShowModal(false);
    if (nextTopicId && Number(nextTopicId) !== Number(topicId)) navigate(`/topic/${nextTopicId}/learn`);
    else navigate(`/subject/${topic.subjectId}`);
  };

  const retry = async () => {
    await startQuizSession();
  };

  if (!topic || loadingQuiz) return <p>Loading quiz arena...</p>;

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-orange-300">Quiz Arena: {topic.title}</h1>
            <p className="text-sm text-slate-300">
              15 random MCQs from {topic.quizMeta.questionBankSize} question bank | Pass {topic.quizMeta.passScore}%
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="rounded-lg border border-cyan-300/40 bg-slate-900/60 px-4 py-2 text-sm">
            Exit Map
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        {questions.map((question, idx) => (
          <QuizQuestionCard
            key={question.questionId}
            question={{ prompt: question.prompt, options: question.options }}
            idx={idx}
            answer={answers[question.questionId]}
            onSelect={(value) => setAnswers((prev) => ({ ...prev, [question.questionId]: value }))}
          />
        ))}

        <button
          disabled={unanswered > 0}
          onClick={submit}
          className="rounded-lg bg-gradient-to-r from-orange-500 to-cyan-500 px-4 py-2 disabled:opacity-50"
        >
          Submit Quiz {unanswered > 0 ? `(${unanswered} unanswered)` : ''}
        </button>
      </GlassCard>

      {showModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md rounded-2xl border border-white/20 bg-slate-900/95 p-6 text-center shadow-neon">
            <button className="absolute right-4 top-3 text-slate-300" onClick={() => setShowModal(false)}>X</button>
            <h2 className={`mb-3 text-2xl font-black ${result.passed ? 'text-emerald-300' : 'text-red-300'}`}>
              {result.passed ? 'PASS' : 'FAIL'}
            </h2>
            <p className="text-sm text-slate-200">Score: {result.correct}/{result.totalQuestions}</p>
            <p className="text-sm text-slate-200">Accuracy: {result.accuracy}%</p>
            <p className="text-sm text-orange-200">XP Earned: +{result.xpAwarded}</p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button onClick={retry} className="rounded bg-cyan-600 px-3 py-2 text-sm">Retry Quiz</button>
              {result.passed && <button onClick={continueNext} className="rounded bg-orange-500 px-3 py-2 text-sm">Continue to Next Topic</button>}
              <button onClick={() => setShowModal(false)} className="rounded border border-white/20 px-3 py-2 text-sm">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
