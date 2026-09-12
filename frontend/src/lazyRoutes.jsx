import { lazy } from 'react';

export const Login = lazy(() => import('./features/auth/pages/Login'));
export const Register = lazy(() => import('./features/auth/pages/Register'));
export const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
export const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
export const CreateInterview = lazy(() => import('./features/interview/pages/CreateInterview'));
export const InterviewHistory = lazy(() => import('./features/interview/pages/InterviewHistory'));
export const InterviewReport = lazy(() => import('./features/interview/pages/InterviewReport'));
export const TailoredResume = lazy(() => import('./features/resume/pages/TailoredResume'));
export const AccountSettings = lazy(() => import('./features/auth/pages/AccountSettings'));
