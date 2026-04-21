import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyTask = {
  courseId: '',
  title: '',
  prompt: '',
  questionType: 'mcq',
  optionsRaw: '[]',
  correctOption: '',
  passingScore: 60,
  maxPoints: 20,
};

export default function TasksPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [tasks, setTasks] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [form, setForm] = useState(emptyTask);
  const [error, setError] = useState('');

  const loadCourses = async () => {
    const { data } = await api.get('/courses');
    setCourses(data.data);
    if (!selectedCourse && data.data.length) setSelectedCourse(String(data.data[0].id));
  };

  const loadTasks = async (courseId) => {
    if (!courseId) return;
    const { data } = await api.get(`/tasks/course/${courseId}`);
    setTasks(data.data);
  };

  useEffect(() => {
    loadCourses().catch(() => setError('Failed to load courses'));
  }, []);

  useEffect(() => {
    loadTasks(selectedCourse).catch(() => setError('Failed to load tasks'));
  }, [selectedCourse]);

  const handleAttempt = async (taskId) => {
    try {
      const selectedOption = answers[taskId];
      if (!selectedOption) return;
      const { data } = await api.post(`/tasks/${taskId}/attempt`, {
        submittedAnswers: { selectedOption },
      });
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        courseId: Number(form.courseId),
        title: form.title,
        prompt: form.prompt,
        questionType: form.questionType,
        options: JSON.parse(form.optionsRaw),
        answerKey: { correctOption: form.correctOption },
        passingScore: Number(form.passingScore),
        maxPoints: Number(form.maxPoints),
      });
      setForm(emptyTask);
      if (selectedCourse) loadTasks(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.message || 'Task creation failed');
    }
  };

  return (
    <section>
      <h1>Tasks & Quizzes</h1>
      {error && <p className="error">{error}</p>}

      <label>
        Select Course:
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
      </label>

      <div className="card-grid">
        {tasks.map((task) => (
          <article className="card" key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.prompt}</p>
            {(task.options || []).map((option) => (
              <label className="inline-check" key={`${task.id}-${option}`}>
                <input
                  type="radio"
                  name={`task-${task.id}`}
                  checked={answers[task.id] === option}
                  onChange={() => setAnswers({ ...answers, [task.id]: option })}
                />
                {option}
              </label>
            ))}
            <button onClick={() => handleAttempt(task.id)}>Submit Attempt</button>
          </article>
        ))}
      </div>

      {result && (
        <article className="card highlight">
          <h3>Latest Result</h3>
          <p>Score: {result.evaluation.score}</p>
          <p>Passed: {result.evaluation.passed ? 'Yes' : 'No'}</p>
          <p>Points Awarded: {result.pointsAwarded}</p>
          <p>Current Balance: {result.pointsBalance}</p>
        </article>
      )}

      {user?.role === 'admin' && (
        <form className="form-card" onSubmit={handleCreateTask}>
          <h2>Add New Task</h2>
          <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
            <option value="">Select course</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" required />
          <textarea value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} placeholder="Task prompt" required />
          <input value={form.optionsRaw} onChange={(e) => setForm({ ...form, optionsRaw: e.target.value })} placeholder='Options JSON e.g. ["A","B"]' required />
          <input value={form.correctOption} onChange={(e) => setForm({ ...form, correctOption: e.target.value })} placeholder="Correct option" required />
          <input type="number" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} placeholder="Passing score" required />
          <input type="number" value={form.maxPoints} onChange={(e) => setForm({ ...form, maxPoints: e.target.value })} placeholder="Max points" required />
          <button type="submit">Create Task</button>
        </form>
      )}
    </section>
  );
}
