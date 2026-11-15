import { Alert, Button, ListGroup, Spinner } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { useQuizList } from './useQuizList';

export default function QuizListPage() {
  const { quizzes, isLoading, error, deletingId, onDelete } = useQuizList();

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Quizzes</h1>
        <Link to="/create" className="btn btn-primary">
          New quiz
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {isLoading && <Spinner animation="border" size="sm" />}
      {quizzes?.length === 0 && <p className="text-muted">No quizzes yet.</p>}

      <ListGroup>
        {quizzes?.map((quiz) => (
          <ListGroup.Item
            key={quiz.id}
            className="d-flex justify-content-between align-items-center gap-3"
          >
            <Link to={`/quizzes/${quiz.id}`} className="flex-grow-1 text-decoration-none">
              <div className="fw-semibold">{quiz.title}</div>
              <small className="text-muted">
                {quiz.questionsCount} {quiz.questionsCount === 1 ? 'question' : 'questions'}
              </small>
            </Link>
            <Button
              variant="outline-danger"
              size="sm"
              title="Delete"
              aria-label={`Delete ${quiz.title}`}
              disabled={deletingId === quiz.id}
              onClick={() => {
                if (window.confirm(`Delete "${quiz.title}"?`)) onDelete(quiz.id);
              }}
            >
              <Trash />
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
}