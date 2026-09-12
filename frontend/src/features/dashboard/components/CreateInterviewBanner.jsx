import {
  ArrowRight,
  FileText,
  Target,
} from 'lucide-react';

import { Link } from 'react-router';

function CreateInterviewBanner() {
  return (
    <section className="create-banner">

      {/* Decorative elements */}
      <div
        className="
          create-banner__orb
          create-banner__orb--one
        "
      />

      <div
        className="
          create-banner__orb
          create-banner__orb--two
        "
      />

      {/* Content */}
      <div className="create-banner__content">

        <div className="create-banner__icon">
          <Target size={21} />
        </div>

        <div>
          <span className="create-banner__eyebrow">
            Start a new preparation
          </span>

          <h2>
            Prepare for a new role
          </h2>

          <p>
            Add the target job and your resume to build a role-specific Interview Report.
          </p>
        </div>

      </div>

      {/* CTA */}
      <Link
        to="/interviews/new"
        className="button button--light"
      >
        <FileText size={17} />

        <span>
          New Interview
        </span>

        <ArrowRight size={16} />
      </Link>

    </section>
  );
}

export default CreateInterviewBanner;
