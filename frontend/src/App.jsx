import { Suspense } from 'react';
import { Outlet } from 'react-router';
import SmoothScrolling from './components/common/SmoothScrolling';
import PageLoader from './components/common/PageLoader';
import usePageMetadata from './hooks/usePageMetadata';

function App() {
  usePageMetadata();
  return (
    <>
      <Suspense fallback={<PageLoader message="Loading page…" />}>
        <Outlet />
      </Suspense>
      <SmoothScrolling />
    </>
  );
}

export default App;
