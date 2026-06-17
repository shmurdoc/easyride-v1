import { useState, useCallback } from 'react';

type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K]) => string | null;
};

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (name: keyof T, value: any) => {
      const rule = rules[name];
      if (rule) {
        const error = rule(value);
        setErrors((prev) => ({ ...prev, [name]: error }));
        return error;
      }
      return null;
    },
    [rules]
  );

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      if (touched[name]) validateField(name, value);
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name, values[name]);
    },
    [validateField, values]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let valid = true;
    for (const key in rules) {
      const error = rules[key](values[key]);
      if (error) {
        newErrors[key] = error;
        valid = false;
      }
    }
    setErrors(newErrors);
    setTouched(Object.keys(rules).reduce((acc, k) => ({ ...acc, [k]: true }), {} as any));
    return valid;
  }, [rules, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return { values, errors, touched, isValid, handleChange, handleBlur, validateAll, reset };
}

// Common validators
export const validators = {
  email: (v: string) => (!v ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Invalid email' : null),
  phone: (v: string) => (!v ? 'Phone is required' : !/^(\+27|0)[1-9][0-9]{8}$/.test(v) ? 'Invalid SA phone number' : null),
  password: (v: string) =>
    !v ? 'Password is required'
    : v.length < 8 ? 'At least 8 characters'
    : !/\d/.test(v) ? 'Must include a number'
    : !/[^a-zA-Z0-9]/.test(v) ? 'Must include a special character'
    : null,
  required: (v: any) => (!v && v !== 0 ? 'This field is required' : null),
  minLength: (min: number) => (v: string) => !v || v.length < min ? `At least ${min} characters` : null,
};
