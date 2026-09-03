/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Legal from './pages/Legal';
import Reminder from './pages/Reminder';
import Grain from './components/Grain';
import StampCard from './components/StampCard';
import { EggProvider } from './lib/EggContext';
import { EditorsCutProvider } from './lib/EditorsCut';

export default function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            'font-serif text-sm bg-editorial-black text-editorial-cream border-editorial-accent shadow-2xl',
        }}
      />
      <BrowserRouter>
        {/* Providers sit inside the router so the stamp card can link, and so a
            visit to /legal can stamp itself. */}
        <EggProvider>
          <EditorsCutProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/reminder" element={<Reminder />} />
              {/* A typo in the URL used to render a blank white page. */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <StampCard />
          </EditorsCutProvider>
        </EggProvider>
      </BrowserRouter>
      <Grain />
    </>
  );
}
