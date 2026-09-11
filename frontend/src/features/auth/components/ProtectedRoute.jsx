import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../../context/useAuth';
import PageLoader from '../../../components/common/PageLoader';
import { getAuthState } from '../authRedirect';

function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return <PageLoader message="Checking your session…" />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={getAuthState(location.pathname + location.search + location.hash)}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
