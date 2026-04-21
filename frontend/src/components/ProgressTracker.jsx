export default function ProgressTracker({ progressList = [] }) {
  if (!progressList.length) {
    return <p>No progress yet. Start solving tasks to build momentum.</p>;
  }

  return (
    <div className="card-grid">
      {progressList.map((item) => (
        <article className="card" key={item.id}>
          <h3>{item.course_title}</h3>
          <p>{item.completed_tasks}/{item.total_tasks} tasks completed</p>
          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${item.completion_percent}%` }} />
          </div>
          <p>{item.completion_percent}% complete</p>
        </article>
      ))}
    </div>
  );
}
