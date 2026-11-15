import type { Question } from '../types/question.type';

export default function QuestionView({ question, index }: { question: Question; index: number }) {
  const name = `q-${question.id}`;

  return (
    <div className="card">
      <strong>
        {index + 1}. {question.text}
      </strong>

      {question.type === 'BOOLEAN' && (
        <div className="row-inline">
          <label>
            <input type="radio" name={name} checked={question.correctBoolean === true} disabled readOnly /> True
          </label>
          <label>
            <input type="radio" name={name} checked={question.correctBoolean === false} disabled readOnly /> False
          </label>
        </div>
      )}

      {question.type === 'INPUT' && (
        <input
          className="readonly-input"
          disabled
          readOnly
          value={question.correctText ?? ''}
          placeholder="Short text answer"
        />
      )}

      {question.type === 'CHECKBOX' && (
        <ul className="options">
          {question.options.map((o) => (
            <li key={o.id}>
              <label>
                <input type="checkbox" checked={o.isCorrect} disabled readOnly /> {o.text}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

