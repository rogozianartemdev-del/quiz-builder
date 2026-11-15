import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage/AuthPage';
import CreateQuizPage from './pages/CreateQuizPage/CreateQuizPage';
import QuizDetailPage from './pages/QuizDetailPage/QuizDetailPage';
import QuizListPage from './pages/QuizListPage/QuizListPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/create" element={<CreateQuizPage />} />
          <Route path="/quizzes" element={<QuizListPage />} />
          <Route path="/quizzes/:id" element={<QuizDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/quizzes" replace />} />
    </Routes>
  );
}