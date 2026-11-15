import { Alert, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import QuestionView from './QuestionView';
import { useQuizDetail } from './useQuizDetail';

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { quiz, error, isLoading } = useQuizDetail(id);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (isLoading || !quiz) return <Spinner animation="border" size="sm" />;

  return (
    <>
      <Link to="/quizzes">← Back to quizzes</Link>
      <h1 className="h3 my-3">{quiz.title}</h1>
      {quiz.questions.map((q, i) => (
        <QuestionView key={q.id} question={q} index={i} />
      ))}
    </>
  );
}