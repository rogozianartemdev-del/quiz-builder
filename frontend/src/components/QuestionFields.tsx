import { useFieldArray, useWatch } from 'react-hook-form';
import type { QuizFormValues } from '../schemas/quizForm';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
interface Props {
  index: number;
  control: Control<QuizFormValues>;
  register: UseFormRegister<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  onRemove: () => void;
  canRemove: boolean;
}

export default function QuestionFields({ index, control, register, errors, onRemove, canRemove }: Props) {
  const type = useWatch({ control, name: `questions.${index}.type` });
  const { fields, append, remove } = useFieldArray({ control, name: `questions.${index}.options` });

  const questionErrors = errors.questions?.[index];
  const optionsError = questionErrors?.options;
  const optionsMessage = optionsError?.root?.message ?? optionsError?.message;

  return (
    <fieldset className="card">
      <div className="row">
        <strong>Question {index + 1}</strong>
        {canRemove && (
          <button type="button" className="btn btn-danger" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>

      <label className="field">
        Type
        <select {...register(`questions.${index}.type`)}>
          <option value="BOOLEAN">Boolean (True/False)</option>
          <option value="INPUT">Input (short text)</option>
          <option value="CHECKBOX">Checkbox (multiple correct)</option>
        </select>
      </label>

      <label className="field">
        Question text
        <input {...register(`questions.${index}.text`)} />
        {questionErrors?.text && <span className="error">{questionErrors.text.message}</span>}
      </label>

      {type === 'BOOLEAN' && (
        <div className="field">
          Correct answer
          <div className="row-inline">
            <label>
              <input type="radio" value="true" {...register(`questions.${index}.correctBoolean`)} /> True
            </label>
            <label>
              <input type="radio" value="false" {...register(`questions.${index}.correctBoolean`)} /> False
            </label>
          </div>
        </div>
      )}

      {type === 'INPUT' && (
        <label className="field">
          Expected answer (optional)
          <input {...register(`questions.${index}.correctText`)} />
        </label>
      )}

      {type === 'CHECKBOX' && (
        <div className="field">
          Options (tick the correct ones)
          {fields.map((field, optIndex) => (
            <div key={field.id} className="row-inline">
              <input type="checkbox" {...register(`questions.${index}.options.${optIndex}.isCorrect`)} />
              <input
                className="grow"
                placeholder={`Option ${optIndex + 1}`}
                {...register(`questions.${index}.options.${optIndex}.text`)}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => remove(optIndex)}
                disabled={fields.length <= 2}
                aria-label="Remove option"
              >
                ✕
              </button>
            </div>
          ))}
          {optionsMessage && <span className="error">{optionsMessage}</span>}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => append({ text: '', isCorrect: false })}
            disabled={fields.length >= 10}
          >
            + Add option
          </button>
        </div>
      )}
    </fieldset>
  );
}