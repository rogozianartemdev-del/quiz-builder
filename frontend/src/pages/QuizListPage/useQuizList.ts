import { useCallback, useEffect, useState } from 'react';
import { quizApi } from '../../services/quizApi';
import type { QuizSummary } from '../../types/quiz-summary ';
import { getErrorMessage } from '../../utils/errors';

export function useQuizList() {
  const [quizzes, setQuizzes] = useState<QuizSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    quizApi
      .list()
      .then((data) => {
        if (!cancelled) setQuizzes(data);
      })
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e, 'Failed to load quizzes'));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onDelete = useCallback(async (id: string) => {
    setError(null);
    setDeletingId(id);
    try {
      await quizApi.remove(id);
      setQuizzes((prev) => prev?.filter((q) => q.id !== id) ?? null);
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to delete quiz'));
    } finally {
      setDeletingId(null);
    }
  }, []);

  return { quizzes, error, isLoading: quizzes === null && error === null, deletingId, onDelete };
}