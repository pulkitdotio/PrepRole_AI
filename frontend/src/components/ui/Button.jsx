import Spinner from './Spinner';

function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  loading = false,
  loadingLabel = 'Working…',
  disabled = false,
  icon,
  className = '',
  ref,
  ...props
}) {
  return (
    <button
      ref={ref}
      type={type}
      className={[
        'button',
        `button--${variant}`,
        `button--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="small" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;
