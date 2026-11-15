import { Alert, Button, Form } from 'react-bootstrap';
import QuestionEditor from './QuestionEditor';
import { useCreateQuizForm } from './useCreateQuizForm';

export default function CreateQuizPage() {
  const {
    register,
    control,
    errors,
    isSubmitting,
    serverError,
    onSubmit,
    fields,
    addQuestion,
    removeQuestion,
    canRemoveQuestion,
  } = useCreateQuizForm();

  return (
    <Form onSubmit={onSubmit} noValidate>
      <h1 className="h3 mb-3">Create quiz</h1>

      <Form.Group className="mb-4" controlId="title">
        <Form.Label>Quiz title</Form.Label>
        <Form.Control isInvalid={!!errors.title} {...register('title')} />
        <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
      </Form.Group>

      {fields.map((field, index) => (
        <QuestionEditor
          key={field.id}
          index={index}
          control={control}
          register={register}
          errors={errors}
          onRemove={() => removeQuestion(index)}
          canRemove={canRemoveQuestion}
        />
      ))}
      {errors.questions?.root && (
        <div className="text-danger small mb-3">{errors.questions.root.message}</div>
      )}

      <div className="d-flex flex-column flex-sm-row gap-2">
        <Button variant="outline-secondary" onClick={addQuestion}>
          Add question
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save quiz'}
        </Button>
      </div>

      {serverError && (
        <Alert variant="danger" className="mt-3">
          {serverError}
        </Alert>
      )}
    </Form>
  );
}