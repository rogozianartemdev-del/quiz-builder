import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { newQuestion, quizFormSchema, toPayload } from '../../schemas/quizForm';
import type { QuizFormValues } from '../../schemas/quizForm';
import { quizApi } from '../../services/quizApi';
import { getErrorMessage } from '../../utils/errors';

export function useCreateQuizForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: { title: '', questions: [newQuestion()] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const quiz = await quizApi.create(toPayload(values));
      navigate(`/quizzes/${quiz.id}`);
    } catch (e) {
      setServerError(getErrorMessage(e, 'Failed to create quiz'));
    }
  });

  return {
    register,
    control,
    errors,
    isSubmitting,
    serverError,
    onSubmit,
    fields,
    addQuestion: () => append(newQuestion()),
    removeQuestion: remove,
    canRemoveQuestion: fields.length > 1,
  };
}