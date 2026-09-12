import {
  createBrowserRouter,
} from 'react-router';

import App from './App';
import Home from './features/home/pages/Home';
import NotFound from './features/home/pages/NotFound';

import ProtectedRoute from './features/auth/components/ProtectedRoute';
import {
  AccountSettings,
  CreateInterview,
  Dashboard,
  DashboardLayout,
  InterviewHistory,
  InterviewReport,
  Login,
  Register,
  TailoredResume,
} from './lazyRoutes';

export const router =
  createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        {
          index: true,
          element: <Home />,
        },

        // -------------------------
        // Public routes
        // -------------------------

        {
          path: 'login',
          element: <Login />,
        },

        {
          path: 'register',
          element: <Register />,
        },

        // -------------------------
        // Protected routes
        // -------------------------

        {
          element: <ProtectedRoute />,
          children: [
            {
              element: (
                <DashboardLayout />
              ),
              children: [
                {
                  path: 'dashboard',
                  element: <Dashboard />,
                },

                {
                  path: 'interviews/new',
                  element: (
                    <CreateInterview />
                  ),
                },

                {
                  path: 'interviews',
                  element: (
                    <InterviewHistory />
                  ),
                },

                {
                  path: 'interviews/report/:interviewId',
                  element: (
                    <InterviewReport />
                  ),
                },

                {
                  path: 'resume/:interviewId',
                  element: (
                    <TailoredResume />
                  ),
                },
                {
                  path: 'settings',
                  element: <AccountSettings />,
                },
              ],
            },
          ],
        },

        // -------------------------
        // Unknown routes
        // -------------------------

        {
          path: '*',
          element: <NotFound />,
        },
      ],
    },
  ]);
