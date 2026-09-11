import { Outlet } from 'react-router';
import SmoothScrolling from './components/common/SmoothScrolling';
import usePageMetadata from './hooks/usePageMetadata';

function App() {
  usePageMetadata();
  return <><Outlet /><SmoothScrolling /></>;
}

export default App;
