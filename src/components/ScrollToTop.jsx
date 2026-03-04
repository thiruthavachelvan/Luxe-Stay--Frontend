import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls window to the top on every route change (including same-path
 * navigations that only change the ?section= query param).
 */
const ScrollToTop = () => {
    const { pathname, search } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname, search]);

    return null;
};

export default ScrollToTop;




