import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyCourse = { title: '', description: '', difficulty: 'beginner', isPublished: true };

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyCourse);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const loadCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, form);
      } else {
        await api.post('/courses', form);
      }
      setForm(emptyCourse);
      setEditingId(null);
      loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description || '',
      difficulty: course.difficulty,
      isPublished: course.is_published,
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <section>
      <h1>Courses</h1>
      {error && <p className="error">{error}</p>}

      <div className="card-grid">
        {courses.map((c) => (
          <article className="card" key={c.id}>
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <p>Difficulty: {c.difficulty}</p>
            <p>Tasks: {c.task_count}</p>
            <p>Status: {c.is_published ? 'Published' : 'Draft'}</p>
            {user?.role === 'admin' && (
              <div className="row-actions">
                <button onClick={() => handleEdit(c)}>Edit</button>
                <button className="danger" onClick={() => handleDelete(c.id)}>Delete</button>
              </div>
            )}
          </article>
        ))}
      </div>

      {user?.role === 'admin' && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Course' : 'Add Course'}</h2>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <label className="inline-check">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            /> Published
          </label>
          <button type="submit">{editingId ? 'Update Course' : 'Create Course'}</button>
        </form>
      )}
    </section>
  );
}
