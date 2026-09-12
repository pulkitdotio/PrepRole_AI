import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';

import WelcomeHeader from './components/WelcomeHeader';
import DashboardStats from './components/DashboardStats';
import RecentInterviews from './components/RecentInterviews';
import CreateInterviewBanner from './components/CreateInterviewBanner';
import PageLoader from '../../components/common/PageLoader';
import ErrorMessage from '../../components/common/ErrorMessage';
import ScrollReveal from '../../components/common/ScrollReveal';
import Button from '../../components/ui/Button';
import { getDashboardStats, getRecentInterviews } from './dashboard.api';
import { getApiErrorMessage, isCanceledRequest } from '../../services/apiError';
import { useAuth } from '../../context/useAuth';

function Dashboard() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [recentError, setRecentError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setLoading(true);
      setStatsError('');
      setRecentError('');
      const [statsResult, recentResult] = await Promise.allSettled([
        getDashboardStats({ signal: controller.signal }),
        getRecentInterviews({ signal: controller.signal }),
      ]);
      if (controller.signal.aborted) return;

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value?.stats || null);
      } else if (!isCanceledRequest(statsResult.reason)) {
        setStatsError(getApiErrorMessage(statsResult.reason, 'Unable to load interview statistics.'));
      }

      if (recentResult.status === 'fulfilled') {
        setInterviews(recentResult.value?.interviewReports || []);
      } else if (!isCanceledRequest(recentResult.reason)) {
        setRecentError(getApiErrorMessage(recentResult.reason, 'Unable to load recent interviews.'));
      }

      setLoading(false);
    }

    loadDashboard();
    return () => controller.abort();
  }, [reloadKey]);

  if (loading) return <PageLoader message="Loading your workspace…" />;

  return (
    <div className="dashboard-page">
      <WelcomeHeader />
      <div className="dashboard-content">
        <ScrollReveal as="section" className="dashboard-intro">
          <div>
            <div className="dashboard-greeting"><Compass size={14} /><span>Role preparation workspace</span></div>
            <h1>Welcome back, <span>{user?.username || user?.name || 'Candidate'}.</span></h1>
          </div>
          <p className="dashboard-motivation">Review your progress or begin preparing for a new opportunity.</p>
        </ScrollReveal>

        <CreateInterviewBanner />
        {statsError ? (
          <div className="dashboard-data-error">
            <ErrorMessage message={statsError} />
            <Button variant="secondary" size="small" onClick={() => setReloadKey(key => key + 1)}>Retry dashboard</Button>
          </div>
        ) : <DashboardStats stats={stats} />}
        {recentError ? (
          <div className="dashboard-data-error">
            <ErrorMessage message={recentError} />
            <Button variant="secondary" size="small" onClick={() => setReloadKey(key => key + 1)}>Retry recent interviews</Button>
          </div>
        ) : <RecentInterviews interviews={interviews} />}
      </div>
    </div>
  );
}

export default Dashboard;
