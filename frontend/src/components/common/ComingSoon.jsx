import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

function ComingSoon({ title }) {
  return (
    <div className="coming-soon">
      <div className="coming-soon__icon">
        <Sparkles size={25} />
      </div>

      <h1>{title}</h1>

      <p>
        This section will be implemented in
        Part of the PrepRole AI roadmap.
      </p>

      <Link
        to="/dashboard"
        className="button button--primary"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  );
}

export default ComingSoon;
