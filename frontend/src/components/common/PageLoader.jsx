import Spinner from '../ui/Spinner';

function PageLoader({ message = 'Loading PrepAI…' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <Spinner size="large" />
      <p>{message}</p>
    </div>
  );
}

export default PageLoader;
