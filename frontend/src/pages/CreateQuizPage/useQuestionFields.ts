import { useFieldArray, useWatch } from 'react-hook-form';
import type { QuizFormValues } from '../../schemas/quizForm';
import type { Control, FieldErrors } from 'react-hook-form';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

export function useQuestionFields(
  control: Control<QuizFormValues>,
  errors: FieldErrors<QuizFormValues>,
  index: number,
) {
  const type = useWatch({ control, name: `questions.${index}.type` });
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

  const questionErrors = errors.questions?.[index];
  const optionsError = questionErrors?.options;

  return {
    type,
    optionFields: fields,
    addOption: () => append({ text: '', isCorrect: false }),
    removeOption: remove,
    canAddOption: fields.length < MAX_OPTIONS,
    canRemoveOption: fields.length > MIN_OPTIONS,
    textError: questionErrors?.text?.message,
    optionsError: optionsError?.root?.message ?? optionsError?.message,
    getOptionTextError: (i: number) => optionsError?.[i]?.text?.message,
  };
}