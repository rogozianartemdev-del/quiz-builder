import { Button, Card, Form, InputGroup } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import type { QuizFormValues } from '../../schemas/quizForm';
import { useQuestionFields } from './useQuestionFields';

interface Props {
  index: number;
  control: Control<QuizFormValues>;
  register: UseFormRegister<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  onRemove: () => void;
  canRemove: boolean;
}

export default function QuestionEditor({
  index,
  control,
  register,
  errors,
  onRemove,
  canRemove,
}: Props) {
  const {
    type,
    optionFields,
    addOption,
    removeOption,
    canAddOption,
    canRemoveOption,
    textError,
    optionsError,
    getOptionTextError,
  } = useQuestionFields(control, errors, index);

  return (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="h6 m-0">Question {index + 1}</Card.Title>
          {canRemove && (
            <Button variant="outline-danger" size="sm" onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Type</Form.Label>
          <Form.Select {...register(`questions.${index}.type`)}>
            <option value="BOOLEAN">Boolean (True/False)</option>
            <option value="INPUT">Input (short text)</option>
            <option value="CHECKBOX">Checkbox (multiple correct)</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Question text</Form.Label>
          <Form.Control isInvalid={!!textError} {...register(`questions.${index}.text`)} />
          <Form.Control.Feedback type="invalid">{textError}</Form.Control.Feedback>
        </Form.Group>

        {type === 'BOOLEAN' && (
          <Form.Group>
            <Form.Label className="d-block">Correct answer</Form.Label>
            <Form.Check
              inline
              type="radio"
              id={`q${index}-true`}
              label="True"
              value="true"
              {...register(`questions.${index}.correctBoolean`)}
            />
            <Form.Check
              inline
              type="radio"
              id={`q${index}-false`}
              label="False"
              value="false"
              {...register(`questions.${index}.correctBoolean`)}
            />
          </Form.Group>
        )}

        {type === 'INPUT' && (
          <Form.Group>
            <Form.Label>Expected answer (optional)</Form.Label>
            <Form.Control {...register(`questions.${index}.correctText`)} />
          </Form.Group>
        )}

        {type === 'CHECKBOX' && (
          <>
            <Form.Label>Options (tick the correct ones)</Form.Label>
            {optionFields.map((field, i) => (
              <InputGroup key={field.id} className="mb-2" hasValidation>
                <InputGroup.Text>
                  <input
                    type="checkbox"
                    className="form-check-input mt-0"
                    aria-label={`Option ${i + 1} is correct`}
                    {...register(`questions.${index}.options.${i}.isCorrect`)}
                  />
                </InputGroup.Text>
                <Form.Control
                  placeholder={`Option ${i + 1}`}
                  isInvalid={!!getOptionTextError(i)}
                  {...register(`questions.${index}.options.${i}.text`)}
                />
                <Button
                  variant="outline-secondary"
                  aria-label="Remove option"
                  disabled={!canRemoveOption}
                  onClick={() => removeOption(i)}
                >
                  <X />
                </Button>
                <Form.Control.Feedback type="invalid">{getOptionTextError(i)}</Form.Control.Feedback>
              </InputGroup>
            ))}
            {optionsError && <div className="text-danger small mb-2">{optionsError}</div>}
            <Button variant="outline-secondary" size="sm" disabled={!canAddOption} onClick={addOption}>
              Add option
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
}