import {
  createBrowserRouter,
} from 'react-router';

import App from './App';
import Home from './features/home/pages/Home';
import NotFound from './features/home/pages/NotFound';

import Login from './features/auth/pages/login';
import Register from './features/auth/pages/register';

import ProtectedRoute from './features/auth/components/ProtectedRoute';

import DashboardLayout from './layouts/DashboardLayout';

import Dashboard from './features/dashboard/Dashboard';

import CreateInterview from './features/interview/pages/CreateInterview';
import InterviewHistory from './features/interview/pages/InterviewHistory';
import InterviewReport from './features/interview/pages/InterviewReport';

import TailoredResume from './features/resume/pages/TailoredResume';
import AccountSettings from './features/auth/pages/AccountSettings';

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
