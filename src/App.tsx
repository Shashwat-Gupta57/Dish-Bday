/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useState } from 'react';
import AccessGate from './components/AccessGate';
import { isOpen, reveal } from './lib/access';

/**
 * The gate is the whole entry point.
 *
 * The site is behind a dynamic import, so its chunk — every page, every joke,
 * every name — is not in the file a visitor downloads and cannot be found by
 * searching it. It is only fetched once the key verifies.
 */
const Site = lazy(() => import('./Site'));

export default function App() {
  const [open, setOpen] = useState(() => {
    const already = isOpen();
    if (already) reveal();
    return already;
  });

  if (!open) return <AccessGate onOpen={() => setOpen(true)} />;

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#08080B]" />}>
      <Site />
    </Suspense>
  );
}
