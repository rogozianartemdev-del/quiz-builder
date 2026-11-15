import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { useAuthForm } from './useAuthForm';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { isLogin, isAuthenticated, register, errors, isSubmitting, serverError, onSubmit } =
    useAuthForm(mode);

  if (isAuthenticated) return <Navigate to="/quizzes" replace />;

  return (
    <Container style={{ maxWidth: 420 }} className="py-5">
      <h1 className="h3 mb-4 text-center">{isLogin ? 'Log in' : 'Create account'}</h1>

      <Card body>
        <Form onSubmit={onSubmit} noValidate>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              autoComplete="email"
              isInvalid={!!errors.email}
              {...register('email')}
            />
            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              isInvalid={!!errors.password}
              {...register('password')}
            />
            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
          </Form.Group>

          {serverError && <Alert variant="danger">{serverError}</Alert>}

          <Button type="submit" className="w-100" disabled={isSubmitting}>
            {isLogin ? 'Log in' : 'Sign up'}
          </Button>
        </Form>
      </Card>

      <p className="text-center text-muted mt-3">
        {isLogin ? (
          <>
            No account? <Link to="/register">Sign up</Link>
          </>
        ) : (
          <>
            Already registered? <Link to="/login">Log in</Link>
          </>
        )}
      </p>
    </Container>
  );
}