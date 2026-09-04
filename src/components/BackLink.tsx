import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * A "return" that actually returns.
 *
 * A plain <Link to="/"> pushes a *new* history entry, so ScrollManager treats it
 * as a forward navigation and drops you at the top of the cover — you lose your
 * place in the issue and have to scroll all the way back down to where the
 * sub-page was hiding.
 *
 * This goes back through history instead, which registers as a POP, so the
 * previous page is restored at the exact offset you left it. If there's nothing
 * to go back to (she opened the link cold, or shared it), it falls through to
 * the given route.
 */
export default function BackLink({
  to = '/',
  className,
  children,
}: {
  to?: string;
  className?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  const goBack = () => {
    // React Router tracks its own index in history state; 0 means this is the
    // first entry in the session and there is nothing of ours behind it.
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(to, { replace: true });
  };

  return (
    <button type="button" onClick={goBack} className={className}>
      {children}
    </button>
  );
}
