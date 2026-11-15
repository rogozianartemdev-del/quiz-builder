import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authFormSchema, type AuthFormValues } from '../../schemas/authForm';
import { getErrorMessage } from '../../utils/errors';

export function useAuthForm(mode: 'login' | 'register') {
  const { login, register: signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({ resolver: zodResolver(authFormSchema) });

  const isLogin = mode === 'login';

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setServerError(null);
    try {
      await (isLogin ? login(email, password) : signUp(email, password));
      navigate('/quizzes');
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  });

  return { isLogin, isAuthenticated, register, errors, isSubmitting, serverError, onSubmit };
}