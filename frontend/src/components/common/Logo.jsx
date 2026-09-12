function Logo({ compact = false }) {
  return (
    <div className="brand-logo">
      <svg className="brand-logo__icon" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M7 7.5h10.25a6.75 6.75 0 0 1 0 13.5H12v4" />
        <path d="M12 12.5h5a1.75 1.75 0 1 1 0 3.5h-5z" />
        <path d="m19.5 20.75 5 4.25" />
      </svg>

      {!compact && (
        <span className="brand-logo__text">
          <span>PrepRole</span> AI
        </span>
      )}
    </div>
  );
}

export default Logo;
