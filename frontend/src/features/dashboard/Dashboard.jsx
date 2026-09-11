import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

import WelcomeHeader from './components/WelcomeHeader';
import DashboardStats from './components/DashboardStats';
import RecentInterviews from './components/RecentInterviews';
import CreateInterviewBanner from './components/CreateInterviewBanner';
import PageLoader from '../../components/common/PageLoader';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getDashboardStats, getRecentInterviews } from './dashboard.api';

function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setError('');
        const [statsResult, recentResult] = await Promise.allSettled([
          getDashboardStats(),
          getRecentInterviews(),
        ]);
        if (!mounted) return;
        if (statsResult.status === 'fulfilled') setStats(statsResult.value?.stats || null);
        if (recentResult.status === 'fulfilled') setInterviews(recentResult.value?.interviewReports || []);
        if (statsResult.status === 'rejected' || recentResult.status === 'rejected') {
          const failure = statsResult.status === 'rejected' ? statsResult.reason : recentResult.reason;
          setError(failure?.response?.data?.message || 'Some dashboard data could not be loaded.');
        }
      } catch {
        if (mounted) setError('Unable to load dashboard data.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => { mounted = false; };
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="dashboard-page">
      <WelcomeHeader />
      <div className="dashboard-content">
        <section className="dashboard-intro">
          <div>
            <div className="dashboard-greeting"><span>Your AI interview assistant</span><Sparkles size={15} /></div>
            <h1>Prepare smarter.<br /><span>Get hired faster.</span></h1>
          </div>
          <p className="dashboard-motivation">“Preparation today.<br />Confidence tomorrow.”</p>
        </section>

        {error && <div className="page-error"><ErrorMessage message={error} /></div>}
        <CreateInterviewBanner />
        <DashboardStats stats={stats} />
        <RecentInterviews interviews={interviews} />
      </div>
    </div>
  );
}

export default Dashboard;
