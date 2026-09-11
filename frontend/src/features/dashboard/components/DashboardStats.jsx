import {
  CheckCircle2,
  FileText,
  Gauge,
  Trophy,
} from 'lucide-react';

function DashboardStats({
  stats: dashboardStats,
}) {
  const total = dashboardStats?.totalInterviews ?? 0;
  const completed = dashboardStats?.completedInterviews ?? 0;
  const averageScore = dashboardStats?.averageMatchScore ?? 0;
  const bestScore = dashboardStats?.bestMatchScore ?? 0;

  const stats = [
    {
      label: 'Total Interviews',
      value: total,
      icon: FileText,
      tone: 'purple',
    },

    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      tone: 'green',
    },

    {
      label: 'Average Match Score',
      value: `${averageScore}%`,
      icon: Gauge,
      tone: 'blue',
    },

    {
      label: 'Best Match Score',
      value: `${bestScore}%`,
      icon: Trophy,
      tone: 'amber',
    },
  ];

  return (
    <section
      className="stats-grid"
      aria-label="Interview statistics"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            className="stat-card"
            key={stat.label}
          >
            <div
              className={[
                'stat-card__icon',
                `stat-card__icon--${stat.tone}`,
              ].join(' ')}
            >
              <Icon size={19} />
            </div>

            <div className="stat-card__content">
              <span>
                {stat.label}
              </span>

              <strong>
                {stat.value}
              </strong>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default DashboardStats;
