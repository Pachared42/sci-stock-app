import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });

function useNProgressRouteChange() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 400);

    return () => clearTimeout(timer);
  }, [location, navigationType]);
}

export default useNProgressRouteChange;