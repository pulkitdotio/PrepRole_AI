import { useEffect } from 'react';
import { useLocation } from 'react-router';

const defaultMetadata = {
  title: 'Page Not Found | PrepRole AI',
  description: 'The requested PrepRole AI page could not be found.',
};

export function getPageMetadata(pathname) {
  if (pathname === '/') return {
    title: 'PrepRole AI — Prepare for the Role',
    description: 'Build role-specific interview preparation, practice questions, and a tailored resume from your experience.',
  };
  if (pathname === '/login') return { title: 'Sign In | PrepRole AI', description: 'Sign in to your PrepRole AI workspace.' };
  if (pathname === '/register') return { title: 'Create Account | PrepRole AI', description: 'Create your PrepRole AI account and start preparing.' };
  if (pathname === '/dashboard') return { title: 'Dashboard | PrepRole AI', description: 'View your PrepRole AI role preparation workspace.' };
  if (pathname === '/interviews') return { title: 'Interview History | PrepRole AI', description: 'View and manage your interview preparation reports.' };
  if (pathname === '/interviews/new') return { title: 'New Interview | PrepRole AI', description: 'Create a role-specific AI interview preparation report.' };
  if (pathname.startsWith('/interviews/report/')) return { title: 'Interview Report | PrepRole AI', description: 'Review your role-specific interview preparation report.' };
  if (pathname.startsWith('/resume/')) return { title: 'Tailored Resume | PrepRole AI', description: 'Generate and preview your job-tailored resume.' };
  if (pathname === '/settings') return { title: 'Settings | PrepRole AI', description: 'Manage your PrepRole AI account settings.' };
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
