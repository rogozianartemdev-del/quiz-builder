import { useEffect, useState } from 'react';
import { quizApi } from '../../services/quizApi';
import type { Quiz } from '../../types/quiz.type';
import { getErrorMessage } from '../../utils/errors';

export function useQuizDetail(id: string | undefined) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    quizApi
      .get(id)
      .then((data) => {
        if (!cancelled) setQuiz(data);
      })
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e, 'Failed to load quiz'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { quiz, error, isLoading: quiz === null && error === null };
}