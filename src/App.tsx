/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Legal from './pages/Legal';
import Reminder from './pages/Reminder';

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ className: 'font-serif text-sm bg-editorial-black text-editorial-cream border-editorial-accent shadow-2xl' }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/reminder" element={<Reminder />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
