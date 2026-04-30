import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { flushSync } from 'react-dom';

/**
 * Drop-in replacement for useNavigate that wraps navigation in the
 * View Transitions API when available, producing a smooth page-change
 * animation. Falls back to plain navigate() in unsupported browsers.
 */
export function useTransitionNavigate() {
  const navigate = useNavigate();

  return (to: string, options?: NavigateOptions) => {
    if (!document.startViewTransition) {
      navigate(to, options);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => navigate(to, options));
    });
  };
}
