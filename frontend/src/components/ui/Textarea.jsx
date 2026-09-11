import {
  forwardRef,
  useId,
} from 'react';

const Textarea = forwardRef(
  function Textarea(
    {
      label,
      error,
      required = false,
      className = '',
      maxLength,
      showCount = false,
      value = '',
      ...props
    },
    ref
  ) {
    const generatedId = useId();
    const textareaId = props.id || generatedId;
    const describedBy = [
      error ? `${textareaId}-error` : '',
      showCount && maxLength ? `${textareaId}-count` : '',
    ].filter(Boolean).join(' ') || undefined;

    const currentLength =
      typeof value === 'string'
        ? value.length
        : 0;

    return (
      <div className="form-field textarea-field">

        {label && (
          <label className="form-label" htmlFor={textareaId}>
            {label}

            {required && (
              <span className="required-mark">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            'form-textarea',
            error
              ? 'form-textarea--error'
              : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          value={value}
          maxLength={maxLength}
          {...props}
        />

        <div className="textarea-footer">
          {error && (
            <span className="field-error" id={`${textareaId}-error`}>
              {error}
            </span>
          )}

          {showCount &&
            maxLength && (
              <span className="textarea-count" id={`${textareaId}-count`}>
                {currentLength} of {maxLength} characters
              </span>
            )}
        </div>
      </div>
    );
  }
);

export default Textarea;
