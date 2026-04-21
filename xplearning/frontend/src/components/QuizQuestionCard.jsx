export default function QuizQuestionCard({ question, answer, onSelect, idx }) {
  return (
    <article className="mb-4 rounded-xl border border-white/15 bg-slate-900/40 p-4">
      <h3 className="mb-3 text-sm font-semibold text-orange-200">Q{idx + 1}. {question.prompt}</h3>
      <div className="grid gap-2">
        {question.options.map((opt, i) => (
          <label key={opt} className={`cursor-pointer rounded-lg border p-2 text-sm transition ${answer === i ? 'border-cyan-300 bg-cyan-300/20' : 'border-white/10 bg-white/5 hover:border-orange-300'}`}>
            <input
              type="radio"
              className="mr-2"
              checked={answer === i}
              onChange={() => onSelect(i)}
            />
            {opt}
          </label>
        ))}
      </div>
    </article>
  );
}
