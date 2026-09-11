import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    required = false,
    className = '',
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = props.id || generatedId;

  return (
    <div className="form-field">
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}

          {required && (
            <span className="required-mark">*</span>
          )}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={[
          'form-input',
          error ? 'form-input--error' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {error && (
        <span className="field-error" id={`${inputId}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

export default Input;
