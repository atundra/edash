import { Form, Field } from 'react-final-form';
import { Button, FormField, TextInput } from 'grommet';

type Values = { name: string; uid: string };

type Props = { onSubmit: (values: Values) => void };

const validate = (values: Partial<Values>) => {
  const errors: Partial<Values> = {};
  if (!values.name) {
    errors.name = 'Required';
  }
  if (!values.uid) {
    errors.uid = 'Required';
  }
  return errors;
};

const required = (value?: string) => (value ? undefined : 'Required');

type InputFieldProps = {
  name: string;
  label: string;
  validate?: (value?: string) => string | undefined;
  placeholder?: string;
};

const InputField = ({ name, label, validate, placeholder }: InputFieldProps) => (
  <Field name={name} validate={validate}>
    {({ input, meta }) => (
      <div>
        <FormField htmlFor={name} label={label} error={meta.touched && meta.error}>
          <TextInput {...input} id={name} placeholder={placeholder} />
        </FormField>
      </div>
    )}
  </Field>
);

export const DeviceForm = ({ onSubmit }: Props) => (
  <Form
    onSubmit={onSubmit}
    validate={validate}
    render={({ handleSubmit }) => (
      <form onSubmit={handleSubmit}>
        <InputField name="name" label="Device Name" validate={required} placeholder="Kitchen edash" />

        <InputField name="uid" label="Device UID" validate={required} placeholder="asdf-qwer-7832" />

        <Button type="submit" primary label="Submit" />
      </form>
    )}
  />
);
