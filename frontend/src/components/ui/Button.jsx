import Spinner from './Spinner';

function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  loading = false,
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
      {...props}
    >
      {loading ? (
        <Spinner size="small" />
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
