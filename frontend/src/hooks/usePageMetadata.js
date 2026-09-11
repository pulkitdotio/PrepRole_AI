import { useEffect } from 'react';
import { useLocation } from 'react-router';

const defaultMetadata = {
  title: 'Page Not Found | PrepAI',
  description: 'The requested PrepAI page could not be found.',
};

export function getPageMetadata(pathname) {
  if (pathname === '/') return {
    title: 'PrepAI — Prepare Smarter',
    description: 'Prepare for interviews with AI-guided reports, practice questions, and tailored resumes.',
  };
  if (pathname === '/login') return { title: 'Sign In | PrepAI', description: 'Sign in to your PrepAI workspace.' };
  if (pathname === '/register') return { title: 'Create Account | PrepAI', description: 'Create your PrepAI account and start preparing.' };
  if (pathname === '/dashboard') return { title: 'Dashboard | PrepAI', description: 'View your PrepAI interview preparation workspace.' };
  if (pathname === '/interviews') return { title: 'Interview History | PrepAI', description: 'View and manage your interview preparation reports.' };
  if (pathname === '/interviews/new') return { title: 'New Interview | PrepAI', description: 'Create a personalized AI interview preparation report.' };
  if (pathname.startsWith('/interviews/report/')) return { title: 'Interview Report | PrepAI', description: 'Review your personalized interview preparation report.' };
  if (pathname.startsWith('/resume/')) return { title: 'Tailored Resume | PrepAI', description: 'Generate and preview your job-tailored resume.' };
  if (pathname === '/settings') return { title: 'Settings | PrepAI', description: 'Manage your PrepAI account settings.' };
  return defaultMetadata;
}

export default function usePageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = getPageMetadata(pathname);
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description);
  }, [pathname]);
}
