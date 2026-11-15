import { Badge, Card, Form } from 'react-bootstrap';
import type { Question } from '../../types/question.type';

const typeLabels = {
  BOOLEAN: 'True / False',
  INPUT: 'Short text',
  CHECKBOX: 'Multiple choice',
} as const;

export default function QuestionView({ question, index }: { question: Question; index: number }) {
  const name = `q-${question.id}`;

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <Card.Title className="h6 m-0">
            {index + 1}. {question.text}
          </Card.Title>
          <Badge bg="secondary">{typeLabels[question.type]}</Badge>
        </div>

        {question.type === 'BOOLEAN' && (
          <>
            <Form.Check
              inline
              type="radio"
              id={`${name}-true`}
              name={name}
              label="True"
              checked={question.correctBoolean === true}
              disabled
              readOnly
            />
            <Form.Check
              inline
              type="radio"
              id={`${name}-false`}
              name={name}
              label="False"
              checked={question.correctBoolean === false}
              disabled
              readOnly
            />
          </>
        )}

        {question.type === 'INPUT' && (
          <Form.Control
            disabled
            readOnly
            value={question.correctText ?? ''}
            placeholder="Short text answer"
          />
        )}

        {question.type === 'CHECKBOX' &&
          question.options.map((o) => (
            <Form.Check
              key={o.id}
              type="checkbox"
              id={o.id}
              label={o.text}
              checked={o.isCorrect}
              disabled
              readOnly
            />
          ))}
      </Card.Body>
    </Card>
  );
}